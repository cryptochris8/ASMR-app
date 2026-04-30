/**
 * ASMR Sleep App - Blockade Labs Skybox AI generator
 * ===================================================
 *
 * Reads scripts/skybox-spec.json, calls the Blockade Labs Skybox AI API for
 * each entry, polls until the request completes, and writes equirectangular
 * JPGs into public/skybox/<file>.
 *
 * Usage:
 *   BLOCKADE_LABS_API_KEY=... node scripts/generate-skyboxes.js
 *   npm run gen:skyboxes                         # picks up .env / .env.local
 *   npm run gen:skyboxes -- --id warm-neutral    # only one entry
 *   npm run gen:skyboxes -- --force              # regenerate even if file exists
 *   npm run gen:skyboxes -- --dry-run            # print plan, no requests
 *
 * Env vars:
 *   BLOCKADE_LABS_API_KEY   required
 *   BLOCKADE_API_BASE       optional (default: https://backend.blockadelabs.com/api/v1)
 *
 * Cost note: ~$0.30 per skybox on the paid tier; the free tier has a small
 * daily allotment. Each request takes ~30-90 seconds end-to-end.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const PUBLIC_SKYBOX = path.join(PROJECT_ROOT, "public", "skybox");
const SPEC_PATH = path.join(__dirname, "skybox-spec.json");

const API_BASE = process.env.BLOCKADE_API_BASE || "https://backend.blockadelabs.com/api/v1";
const CONCURRENCY = 2;
const POLL_INITIAL_DELAY_MS = 12000;
const POLL_INTERVAL_MS = 5000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// .env loader
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
const filterId = arg("id");
const force = flag("force");
const dryRun = flag("dry-run");

// ---------------------------------------------------------------------------
// Spec
// ---------------------------------------------------------------------------
const spec = JSON.parse(fs.readFileSync(SPEC_PATH, "utf8"));
let skyboxes = spec.skyboxes || [];
if (filterId) skyboxes = skyboxes.filter((s) => s.id === filterId);

if (skyboxes.length === 0) {
  console.error("[gen-skyboxes] No skyboxes matched filter. Aborting.");
  process.exit(1);
}

const apiKey = process.env.BLOCKADE_LABS_API_KEY;
if (!apiKey && !dryRun) {
  console.error(
    "[gen-skyboxes] BLOCKADE_LABS_API_KEY missing.\n" +
      "  Add it to .env.local at the repo root:\n" +
      "    BLOCKADE_LABS_API_KEY=...\n" +
      "  (.env.local is git-ignored.)",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------
async function submitRequest(entry) {
  const body = { prompt: entry.prompt };
  if (entry.negative_text) body.negative_text = entry.negative_text;
  if (entry.skybox_style_id != null) body.skybox_style_id = entry.skybox_style_id;

  const resp = await fetch(`${API_BASE}/skybox`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`submit ${resp.status}: ${errText.slice(0, 200)}`);
  }

  const data = await resp.json();
  // Blockade returns the request fields at top-level on POST.
  const id = data.id ?? data.request?.id;
  if (!id) throw new Error(`submit returned no id: ${JSON.stringify(data).slice(0, 200)}`);
  return id;
}

async function pollUntilComplete(id) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  await sleep(POLL_INITIAL_DELAY_MS);

  while (Date.now() < deadline) {
    const resp = await fetch(`${API_BASE}/imagine/requests/${id}`, {
      headers: { "x-api-key": apiKey },
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      throw new Error(`poll ${resp.status}: ${errText.slice(0, 200)}`);
    }

    const data = await resp.json();
    // Some endpoints wrap under `request`, some return flat — handle both.
    const r = data.request ?? data;
    const status = r.status;

    if (status === "complete") {
      const fileUrl = r.file_url;
      if (!fileUrl) throw new Error("complete but no file_url returned");
      return fileUrl;
    }
    if (status === "error" || status === "abort") {
      throw new Error(`request ${status}: ${r.error_message || "unknown"}`);
    }
    // queued / processing / pending — keep polling
    await sleep(POLL_INTERVAL_MS);
  }
  throw new Error(`poll timed out after ${POLL_TIMEOUT_MS / 1000}s`);
}

async function downloadTo(url, outPath) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`download ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  fs.writeFileSync(outPath, buf);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Worker
// ---------------------------------------------------------------------------
async function generateOne(entry) {
  const outPath = path.join(PUBLIC_SKYBOX, entry.file);

  if (!force && fs.existsSync(outPath)) {
    return { id: entry.id, status: "skip", reason: "exists" };
  }
  if (dryRun) {
    return { id: entry.id, status: "plan", out: entry.file };
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  console.log(`  ↗ ${entry.id.padEnd(20)}  submitting…`);
  const reqId = await submitRequest(entry);
  console.log(`  ⏳ ${entry.id.padEnd(20)}  request ${reqId}, polling…`);
  const fileUrl = await pollUntilComplete(reqId);
  console.log(`  ⤓ ${entry.id.padEnd(20)}  downloading…`);
  await downloadTo(fileUrl, outPath);

  const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
  return { id: entry.id, status: "ok", out: entry.file, sizeKb };
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
          console.log(`  ✓ ${r.id.padEnd(20)}  ${r.out}  (${r.sizeKb} KB)`);
        } else if (r.status === "skip") {
          console.log(`  · ${r.id.padEnd(20)}  skipped (${r.reason})`);
        } else if (r.status === "plan") {
          console.log(`  → ${r.id.padEnd(20)}  ${r.out}`);
        }
      } catch (err) {
        results[i] = { id: item.id, status: "fail", error: String(err.message || err) };
        console.error(`  ✗ ${item.id.padEnd(20)}  ${results[i].error}`);
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
  `[gen-skyboxes] ${dryRun ? "DRY RUN — " : ""}${skyboxes.length} skybox(es)` +
    (filterId ? `, id=${filterId}` : "") +
    (force ? ", force=true" : "") +
    `\n`,
);

const results = await pool(skyboxes, CONCURRENCY, generateOne);

const ok = results.filter((r) => r.status === "ok").length;
const skip = results.filter((r) => r.status === "skip").length;
const fail = results.filter((r) => r.status === "fail").length;
const plan = results.filter((r) => r.status === "plan").length;

console.log(
  `\n[gen-skyboxes] ${ok} generated, ${skip} skipped, ${fail} failed${plan ? `, ${plan} planned` : ""}.`,
);
process.exit(fail > 0 ? 1 : 0);
