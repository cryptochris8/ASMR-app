/**
 * ASMR Sleep App - Audio Processing Pipeline
 * ============================================
 *
 * Scans public/audio/ recursively and processes WAV files:
 *   - Inspects sample rate, channels, bit depth, duration, file size
 *   - Downsamples 96kHz/48kHz files to 44.1kHz 16-bit WAV (in-place, with backup)
 *   - Flags files that are too long for their type
 *   - Prints a summary table
 *
 * Modes:
 *   node scripts/audio-pipeline.js             Default inspection + downsample
 *   node scripts/audio-pipeline.js --trim-taps  Trim tap sounds to 1.5s (strip leading silence)
 *
 * Requires: ffmpeg and ffprobe at the configured paths below.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// ES module __dirname shim
// ---------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Absolute path to ffmpeg/ffprobe executables.
 *  Override via environment variables so CI and other developers can use
 *  their system-installed ffmpeg without editing this file.
 *    FFMPEG_PATH=/usr/bin/ffmpeg  FFPROBE_PATH=/usr/bin/ffprobe
 */
const FFMPEG = process.env.FFMPEG_PATH || "ffmpeg";
const FFPROBE = process.env.FFPROBE_PATH || "ffprobe";

/** Root audio directory to scan */
const AUDIO_ROOT = path.resolve(__dirname, "..", "public", "audio");

/** Backup directory for originals before in-place conversion */
const BACKUP_DIR = path.join(AUDIO_ROOT, "_originals");

/** Duration limits (seconds) -- files exceeding these get a warning */
const DURATION_LIMITS = {
  tap: 3,       // tap sounds should be < 3s
  one_shot: 10, // one-shot sounds should be < 10s
};

/** Target format for downsampling */
const TARGET_SAMPLE_RATE = 44100;
const TARGET_BIT_DEPTH = 16; // pcm_s16le

/** Trim-taps settings */
const TAP_MAX_DURATION = 1.5;    // seconds
const SILENCE_THRESHOLD = 0.1;   // max leading silence to strip (seconds)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run a command and return stdout as a string.
 * Quotes the executable to handle Windows paths with spaces.
 */
function run(cmd) {
  return execSync(cmd, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
    windowsHide: true,
  }).trim();
}

/**
 * Run a command and return stderr (useful for ffmpeg which logs to stderr).
 */
function runGetStderr(cmd) {
  try {
    execSync(cmd, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    return "";
  } catch (err) {
    return err.stderr || "";
  }
}

/**
 * Recursively find all .wav files under a directory.
 * Skips the _originals backup directory.
 */
function findWavFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip the backup directory
    if (entry.isDirectory() && entry.name === "_originals") continue;

    if (entry.isDirectory()) {
      results.push(...findWavFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".wav")) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Use ffprobe to extract audio metadata from a WAV file.
 * Returns an object with sampleRate, channels, bitDepth, duration, and fileSize.
 */
function inspectFile(filePath) {
  const fileSize = fs.statSync(filePath).size;

  // ffprobe JSON output for the first audio stream
  const probeCmd = [
    `"${FFPROBE}"`,
    "-v quiet",
    "-print_format json",
    "-show_streams",
    "-show_format",
    `"${filePath}"`,
  ].join(" ");

  let probeData;
  try {
    probeData = JSON.parse(run(probeCmd));
  } catch (err) {
    console.error(`  [ERROR] ffprobe failed for: ${filePath}`);
    console.error(`          ${err.message}`);
    return null;
  }

  const audioStream = (probeData.streams || []).find(
    (s) => s.codec_type === "audio"
  );
  if (!audioStream) {
    console.error(`  [ERROR] No audio stream found in: ${filePath}`);
    return null;
  }

  // Determine bit depth from bits_per_raw_sample or bits_per_sample
  const bitDepth =
    parseInt(audioStream.bits_per_raw_sample, 10) ||
    parseInt(audioStream.bits_per_sample, 10) ||
    0;

  return {
    filePath,
    sampleRate: parseInt(audioStream.sample_rate, 10),
    channels: audioStream.channels,
    bitDepth,
    codec: audioStream.codec_name,
    duration: parseFloat(probeData.format?.duration || audioStream.duration || 0),
    fileSize,
  };
}

/**
 * Format bytes into a human-readable string (KB or MB).
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Format seconds into m:ss.f
 */
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00.0";
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(1);
  return `${mins}:${secs.padStart(4, "0")}`;
}

/**
 * Determine the "type" of audio file based on its path for duration checks.
 * Returns "tap", "one_shot", or null (no limit applies).
 */
function getFileType(filePath) {
  const relative = path.relative(AUDIO_ROOT, filePath).replace(/\\/g, "/");

  // Tap sounds: interactions/tap/*, or packs/*/tap-*
  if (relative.includes("interactions/tap/")) return "tap";
  if (/packs\/[^/]+\/tap-/.test(relative)) return "tap";

  // One-shot sounds
  if (relative.includes("one_shots/")) return "one_shot";

  return null;
}

/**
 * Ensure the backup directory mirrors the source directory structure,
 * then copy the original file there (only if not already backed up).
 */
function backupFile(filePath) {
  const relative = path.relative(AUDIO_ROOT, filePath);
  const backupPath = path.join(BACKUP_DIR, relative);
  const backupParent = path.dirname(backupPath);

  // Only back up once per file
  if (fs.existsSync(backupPath)) {
    console.log(`    Backup already exists, skipping: ${relative}`);
    return;
  }

  fs.mkdirSync(backupParent, { recursive: true });
  fs.copyFileSync(filePath, backupPath);
  console.log(`    Backed up to: _originals/${relative}`);
}

/**
 * Downsample a file to 44.1kHz 16-bit PCM WAV, overwriting in-place.
 * Uses a temporary file to avoid corruption if ffmpeg fails.
 */
function downsampleFile(filePath) {
  const tempPath = filePath + ".tmp.wav";

  const cmd = [
    `"${FFMPEG}"`,
    "-y",          // overwrite output without asking
    "-v warning",
    `-i "${filePath}"`,
    "-ar 44100",
    "-sample_fmt s16",
    "-acodec pcm_s16le",
    `"${tempPath}"`,
  ].join(" ");

  try {
    run(cmd);
    // Replace original with the converted file
    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`    [ERROR] Conversion failed: ${err.message}`);
    // Clean up temp file on failure
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Main Pipeline: Inspect + Downsample
// ---------------------------------------------------------------------------

function runDefaultPipeline() {
  console.log("=".repeat(72));
  console.log("  ASMR Audio Pipeline - Inspect & Downsample");
  console.log("=".repeat(72));
  console.log(`  Audio root: ${AUDIO_ROOT}`);
  console.log();

  const wavFiles = findWavFiles(AUDIO_ROOT);

  if (wavFiles.length === 0) {
    console.log("  No .wav files found in public/audio/. Nothing to do.");
    return;
  }

  console.log(`  Found ${wavFiles.length} WAV file(s). Processing...\n`);

  // Collect results for the summary table
  const results = [];
  let convertedCount = 0;
  let skippedCount = 0;
  let warningCount = 0;
  let errorCount = 0;

  for (const filePath of wavFiles) {
    const relative = path.relative(AUDIO_ROOT, filePath).replace(/\\/g, "/");
    console.log(`--- ${relative}`);

    // Step 1: Inspect the file
    const info = inspectFile(filePath);
    if (!info) {
      errorCount++;
      results.push({
        file: relative,
        sampleRate: "ERR",
        channels: "-",
        bitDepth: "-",
        duration: "-",
        size: "-",
        action: "ERROR",
        warnings: [],
      });
      console.log();
      continue;
    }

    console.log(
      `    ${info.sampleRate} Hz | ${info.channels}ch | ` +
        `${info.bitDepth}-bit | ${formatDuration(info.duration)} | ` +
        `${formatSize(info.fileSize)}`
    );

    // Step 2: Check duration limits and flag issues
    const warnings = [];
    const fileType = getFileType(filePath);
    if (fileType && DURATION_LIMITS[fileType]) {
      const limit = DURATION_LIMITS[fileType];
      if (info.duration > limit) {
        const msg = `WARNING: ${fileType} sound is ${info.duration.toFixed(1)}s (limit: ${limit}s)`;
        console.log(`    ${msg}`);
        warnings.push(msg);
        warningCount++;
      }
    }

    // Step 3: Downsample if sample rate or bit depth don't match target
    let action = "OK";
    const needsDownsample =
      info.sampleRate !== TARGET_SAMPLE_RATE ||
      info.bitDepth !== TARGET_BIT_DEPTH;

    if (needsDownsample) {
      console.log(
        `    Converting: ${info.sampleRate}Hz/${info.bitDepth}-bit -> ` +
          `${TARGET_SAMPLE_RATE}Hz/${TARGET_BIT_DEPTH}-bit`
      );

      // Backup the original before modifying
      backupFile(filePath);

      // Perform the conversion
      const success = downsampleFile(filePath);
      if (success) {
        action = "CONVERTED";
        convertedCount++;

        // Re-inspect to show new file stats
        const newInfo = inspectFile(filePath);
        if (newInfo) {
          console.log(
            `    Result: ${newInfo.sampleRate} Hz | ${newInfo.channels}ch | ` +
              `${newInfo.bitDepth}-bit | ${formatSize(newInfo.fileSize)}`
          );
        }
      } else {
        action = "FAILED";
        errorCount++;
      }
    } else {
      console.log("    Already 44.1kHz 16-bit. Skipping.");
      skippedCount++;
    }

    results.push({
      file: relative,
      sampleRate: `${info.sampleRate}`,
      channels: `${info.channels}`,
      bitDepth: `${info.bitDepth}`,
      duration: formatDuration(info.duration),
      size: formatSize(info.fileSize),
      action,
      warnings,
    });

    console.log();
  }

  // ---------------------------------------------------------------------------
  // Summary Table
  // ---------------------------------------------------------------------------
  console.log("=".repeat(72));
  console.log("  SUMMARY");
  console.log("=".repeat(72));
  console.log();

  // Column widths for the table
  const col = { file: 40, rate: 8, ch: 4, bits: 6, dur: 8, size: 10, action: 10 };

  const header = [
    "File".padEnd(col.file),
    "Rate".padEnd(col.rate),
    "Ch".padEnd(col.ch),
    "Bits".padEnd(col.bits),
    "Dur".padEnd(col.dur),
    "Size".padEnd(col.size),
    "Action".padEnd(col.action),
  ].join(" | ");

  console.log(`  ${header}`);
  console.log(`  ${"-".repeat(header.length)}`);

  for (const r of results) {
    const row = [
      r.file.length > col.file
        ? "..." + r.file.slice(-(col.file - 3))
        : r.file.padEnd(col.file),
      r.sampleRate.padEnd(col.rate),
      r.channels.toString().padEnd(col.ch),
      r.bitDepth.toString().padEnd(col.bits),
      r.duration.padEnd(col.dur),
      r.size.padEnd(col.size),
      r.action.padEnd(col.action),
    ].join(" | ");
    console.log(`  ${row}`);

    // Print any warnings indented below the row
    for (const w of r.warnings) {
      console.log(`    ^ ${w}`);
    }
  }

  console.log();
  console.log(`  Total files:  ${results.length}`);
  console.log(`  Converted:    ${convertedCount}`);
  console.log(`  Skipped (OK): ${skippedCount}`);
  console.log(`  Warnings:     ${warningCount}`);
  console.log(`  Errors:       ${errorCount}`);
  console.log();
}

// ---------------------------------------------------------------------------
// Trim-Taps Mode
// ---------------------------------------------------------------------------

/**
 * Detect the end of leading silence in a file using ffmpeg's silencedetect.
 * Returns the timestamp (seconds) where audio begins, or 0 if no leading
 * silence was found (or if the silence exceeds our threshold).
 */
function detectSilenceEnd(filePath) {
  // silencedetect: look for silence quieter than -50dB, at least 0.05s long
  const cmd = [
    `"${FFMPEG}"`,
    `-i "${filePath}"`,
    "-af silencedetect=noise=-50dB:d=0.05",
    "-f null",
    "-",
  ].join(" ");

  const stderr = runGetStderr(cmd);

  // Parse: [silencedetect @ ...] silence_end: 0.082345 | silence_duration: 0.082345
  const match = stderr.match(/silence_end:\s*([\d.]+)/);
  if (match) {
    const silenceEnd = parseFloat(match[1]);
    // Only strip if the leading silence is shorter than our threshold
    if (silenceEnd <= SILENCE_THRESHOLD) {
      return silenceEnd;
    }
  }

  return 0; // No significant leading silence detected
}

/**
 * Trim a tap file: strip leading silence (< 0.1s), keep only the first 1.5s.
 * Backs up the original before overwriting.
 */
function trimTapFile(filePath) {
  const silenceEnd = detectSilenceEnd(filePath);
  const trimStart = silenceEnd > 0 ? silenceEnd : 0;
  const trimDuration = TAP_MAX_DURATION;

  const tempPath = filePath + ".trimmed.wav";

  // atrim: set start time and max duration
  // asetpts: reset presentation timestamps to start from 0
  const cmd = [
    `"${FFMPEG}"`,
    "-y",
    "-v warning",
    `-i "${filePath}"`,
    `-af "atrim=start=${trimStart.toFixed(4)}:duration=${trimDuration},asetpts=PTS-STARTPTS"`,
    "-acodec pcm_s16le",
    "-ar 44100",
    `"${tempPath}"`,
  ].join(" ");

  try {
    run(cmd);
    // Backup original, then replace with trimmed version
    backupFile(filePath);
    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);
    return { trimStart, trimDuration, success: true };
  } catch (err) {
    console.error(`    [ERROR] Trim failed: ${err.message}`);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    return { trimStart, trimDuration, success: false };
  }
}

function runTrimTaps() {
  console.log("=".repeat(72));
  console.log("  ASMR Audio Pipeline - Trim Tap Sounds");
  console.log("=".repeat(72));
  console.log(`  Audio root:    ${AUDIO_ROOT}`);
  console.log(`  Max duration:  ${TAP_MAX_DURATION}s`);
  console.log(`  Silence strip: <${SILENCE_THRESHOLD}s`);
  console.log();

  const allWavs = findWavFiles(AUDIO_ROOT);

  // Filter to tap-related files only:
  //   - Files under interactions/tap/**
  //   - Files matching packs/*/tap-*.wav
  const tapFiles = allWavs.filter((f) => {
    const relative = path.relative(AUDIO_ROOT, f).replace(/\\/g, "/");
    if (relative.includes("interactions/tap/")) return true;
    if (/packs\/[^/]+\/tap-/.test(relative)) return true;
    return false;
  });

  if (tapFiles.length === 0) {
    console.log("  No tap sound files found. Nothing to trim.");
    return;
  }

  console.log(`  Found ${tapFiles.length} tap sound file(s). Processing...\n`);

  let trimmedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const filePath of tapFiles) {
    const relative = path.relative(AUDIO_ROOT, filePath).replace(/\\/g, "/");
    console.log(`--- ${relative}`);

    // Inspect current state
    const info = inspectFile(filePath);
    if (!info) {
      console.log("    [ERROR] Could not inspect file.\n");
      errorCount++;
      continue;
    }

    console.log(
      `    Current: ${info.sampleRate} Hz | ${formatDuration(info.duration)} | ` +
        `${formatSize(info.fileSize)}`
    );

    // Skip files already within the duration limit
    if (info.duration <= TAP_MAX_DURATION) {
      console.log(
        `    Already ${info.duration.toFixed(2)}s (<= ${TAP_MAX_DURATION}s). Skipping.`
      );
      skippedCount++;
      console.log();
      continue;
    }

    // Trim the file
    console.log(`    Trimming to ${TAP_MAX_DURATION}s...`);
    const result = trimTapFile(filePath);

    if (result.success) {
      trimmedCount++;
      if (result.trimStart > 0) {
        console.log(
          `    Stripped ${result.trimStart.toFixed(4)}s of leading silence.`
        );
      }

      // Show new file stats after trimming
      const newInfo = inspectFile(filePath);
      if (newInfo) {
        console.log(
          `    Result: ${newInfo.sampleRate} Hz | ${formatDuration(newInfo.duration)} | ` +
            `${formatSize(newInfo.fileSize)}`
        );
      }
    } else {
      errorCount++;
    }

    console.log();
  }

  // Summary
  console.log("=".repeat(72));
  console.log("  TRIM SUMMARY");
  console.log("=".repeat(72));
  console.log(`  Total tap files: ${tapFiles.length}`);
  console.log(`  Trimmed:         ${trimmedCount}`);
  console.log(`  Skipped (OK):    ${skippedCount}`);
  console.log(`  Errors:          ${errorCount}`);
  console.log();
}

// ---------------------------------------------------------------------------
// Entry Point
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);

  // Verify ffmpeg is accessible before doing anything
  try {
    const version = run(`"${FFMPEG}" -version`).split("\n")[0];
    console.log(`  Using: ${version}\n`);
  } catch (err) {
    console.error(
      `[FATAL] ffmpeg not found at: ${FFMPEG}\n` +
        `        Install ffmpeg or update the FFMPEG path in this script.\n` +
        `        Error: ${err.message}`
    );
    process.exit(1);
  }

  if (args.includes("--trim-taps")) {
    runTrimTaps();
  } else {
    runDefaultPipeline();
  }
}

main();
