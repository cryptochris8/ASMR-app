/**
 * ASMR Sleep App - ElevenLabs SFX generator
 * ==========================================
 *
 * Reads scripts/audio-spec.json, calls the ElevenLabs Sound Effects API for
 * each entry, and writes WAVs into public/audio/<file> at the path expected
 * by src/audio/sceneAudioRegistry.ts.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=... node scripts/generate-audio.js
 *   npm run gen:audio                              # picks up .env / .env.local
 *   npm run gen:audio -- --pack cozy-room          # only that pack
 *   npm run gen:audio -- --id wood_tap_01          # only one asset
 *   npm run gen:audio -- --force                   # regenerate even if file exists
 *   npm run gen:audio -- --dry-run                 # print plan, no requests
 *
 * Env vars:
 *   ELEVENLABS_API_KEY   required
 *   FFMPEG_PATH          optional (default: ffmpeg on PATH) — used to transcode MP3 → WAV
 *
 * Cost note: ElevenLabs SFX is roughly $0.05-0.10 per generation. The default
 * spec is ~32 assets; expect ~$2-3 for a full run.
 */

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const PUBLIC_AUDIO = path.join(PROJECT_ROOT, "public", "audio");
const SPEC_PATH = path.join(__dirname, "audio-spec.json");

const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
const API_URL = "https://api.elevenlabs.io/v1/sound-generation";
const CONCURRENCY = 3;

// ---------------------------------------------------------------------------
// .env loader (no dotenv dep)
// ---------------------------------------------------------------------------
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const text = fs.readFileSync(filePath, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile(path.join(PROJECT_ROOT, ".env.local"));
loadEnvFile(path.join(PROJECT_ROOT, ".env"));

// ---------------------------------------------------------------------------
// CLI flags
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function flag(name) {
  return args.includes(`--${name}`);
}
function arg(name) {
  const i = args.findIndex((a) => a === `--${name}`);
  return i >= 0 ? args[i + 1] : null;
}
const filterPack = arg("pack");
const filterId = arg("id");
const force = flag("force");
const dryRun = flag("dry-run");

// ---------------------------------------------------------------------------
// Spec
// ---------------------------------------------------------------------------
const spec = JSON.parse(fs.readFileSync(SPEC_PATH, "utf8"));
const defaults = spec.defaults || {};
let assets = spec.assets || [];
if (filterPack) assets = assets.filter((a) => a.pack === filterPack);
if (filterId) assets = assets.filter((a) => a.id === filterId);

if (assets.length === 0) {
  console.error("[gen-audio] No assets matched filter. Aborting.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Key + ffmpeg checks
// ---------------------------------------------------------------------------
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey && !dryRun) {
  console.error(
    "[gen-audio] ELEVENLABS_API_KEY missing.\n" +
      "  Add it to .env.local at the repo root:\n" +
      "    ELEVENLABS_API_KEY=sk_...\n" +
      "  (.env.local is git-ignored.)",
  );
  process.exit(1);
}

function ffmpegAvailable() {
  try {
    execFileSync(FFMPEG, ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
const hasFfmpeg = dryRun ? true : ffmpegAvailable();
if (!hasFfmpeg) {
  console.error(
    `[gen-audio] ffmpeg not found at "${FFMPEG}". Set FFMPEG_PATH or install ffmpeg.\n` +
      "  Without ffmpeg the script can only save raw MP3, not WAV.",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Worker
// ---------------------------------------------------------------------------
async function generateOne(asset) {
  const outRel = asset.file;
  const outPath = path.join(PUBLIC_AUDIO, outRel);
  const tmpPath = outPath + ".tmp.mp3";

  if (!force && fs.existsSync(outPath)) {
    return { id: asset.id, status: "skip", reason: "exists" };
  }
  if (dryRun) {
    return { id: asset.id, status: "plan", out: outRel };
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const body = {
    text: asset.prompt,
    duration_seconds: asset.duration_seconds ?? defaults.duration_seconds,
    prompt_influence: asset.prompt_influence ?? defaults.prompt_influence,
  };

  const resp = await fetch(API_URL, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`ElevenLabs ${resp.status}: ${errText.slice(0, 200)}`);
  }

  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(tmpPath, buf);

  const sr = String(defaults.sample_rate ?? 48000);
  const ch = String(defaults.channels ?? 2);
  try {
    execFileSync(
      FFMPEG,
      ["-y", "-i", tmpPath, "-ac", ch, "-ar", sr, "-acodec", "pcm_s16le", outPath],
      { stdio: "ignore" },
    );
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }

  const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
  return { id: asset.id, status: "ok", out: outRel, sizeKb };
}

async function pool(items, limit, worker) {
  const results = [];
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const i = cursor++;
      const item = items[i];
      try {
        const r = await worker(item);
        results[i] = r;
        if (r.status === "ok") {
          console.log(`  ✓ ${r.id.padEnd(28)}  ${r.out}  (${r.sizeKb} KB)`);
        } else if (r.status === "skip") {
          console.log(`  · ${r.id.padEnd(28)}  skipped (${r.reason})`);
        } else if (r.status === "plan") {
          console.log(`  → ${r.id.padEnd(28)}  ${r.out}`);
        }
      } catch (err) {
        results[i] = { id: item.id, status: "fail", error: String(err.message || err) };
        console.error(`  ✗ ${item.id.padEnd(28)}  ${results[i].error}`);
      }
    }
  });
  await Promise.all(runners);
  return results;
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
console.log(
  `[gen-audio] ${dryRun ? "DRY RUN — " : ""}${assets.length} asset(s)` +
    (filterPack ? `, pack=${filterPack}` : "") +
    (filterId ? `, id=${filterId}` : "") +
    (force ? ", force=true" : "") +
    `\n`,
);

const results = await pool(assets, CONCURRENCY, generateOne);

const ok = results.filter((r) => r.status === "ok").length;
const skip = results.filter((r) => r.status === "skip").length;
const fail = results.filter((r) => r.status === "fail").length;
const plan = results.filter((r) => r.status === "plan").length;

console.log(
  `\n[gen-audio] ${ok} generated, ${skip} skipped, ${fail} failed${plan ? `, ${plan} planned` : ""}.`,
);
process.exit(fail > 0 ? 1 : 0);
