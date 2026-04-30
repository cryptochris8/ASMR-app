# Audio Asset Guide

This guide is for sound designers and contributors adding new audio packs to the app.

---

## Pack Folder Structure

All audio lives under `public/audio/packs/`. Each pack gets its own directory named with the pack ID:

```
public/audio/packs/
  fireplace/
    loop-fire-main.wav
    tap-ember-01.wav
    tap-ember-02.wav
    drag-log-01.wav
  rain-window/
    loop-rain-heavy.wav
    loop-rain-light.wav
    tap-glass-01.wav
    tap-glass-02.wav
    tap-glass-03.wav
```

---

## Naming Convention

Use **lowercase + hyphen** only. No spaces, no underscores, no uppercase.

| Pattern | Usage |
|---|---|
| `loop-<descriptor>.wav` | Ambient loop (plays continuously) |
| `tap-<descriptor>-<NN>.wav` | Tap interaction variant (NN = 01, 02, ...) |
| `drag-<descriptor>-<NN>.wav` | Drag interaction variant |
| `hold-<descriptor>-<NN>.wav` | Hold / sustained interaction variant |

Provide at least 2–3 variants per interaction type to avoid the obvious machine-gun effect.

---

## Registering a Pack

### 1. Add pack metadata to `src/content/soundPacks.ts`

```ts
{
  id: 'fireplace',
  label: 'Fireplace',
  tier: 'premium',          // 'free' | 'premium'
  description: 'Crackling embers and warm wood pops.',
  thumbnailUrl: '/images/packs/fireplace.jpg',
}
```

### 2. Add audio track paths to `src/audio/sceneAudioRegistry.ts`

```ts
'fireplace': {
  loops: [
    { id: 'fire-main', url: '/audio/packs/fireplace/loop-fire-main.wav', volume: 0.8 },
  ],
  interactions: {
    tap:  ['/audio/packs/fireplace/tap-ember-01.wav',
           '/audio/packs/fireplace/tap-ember-02.wav'],
    drag: ['/audio/packs/fireplace/drag-log-01.wav'],
  },
},
```

The `id` key must match the `id` field in `soundPacks.ts`.

---

## Format Requirements

| Property | Requirement |
|---|---|
| Container | WAV (PCM) |
| Sample rate | 48 kHz (the pipeline will downsample to 44.1 kHz — see note) |
| Bit depth | 16-bit (pcm_s16le) |
| Channels | Stereo for loops; mono acceptable for short interaction samples |
| Loudness | Peak normalise to −1 dBFS; no DC offset |
| Loop files | Zero-crossing endpoints — the last sample of the file must be at or near 0 amplitude so the seamless loop does not click |

Note: Deliver masters at 48 kHz/24-bit if possible. The audio pipeline script (`node scripts/audio-pipeline.js`) will downsample to 44.1 kHz 16-bit automatically and back up the originals to `public/audio/_originals/`.

---

## QA Checklist

Before opening a PR with new audio assets, verify each file:

- [ ] **Seamless loop**: Import the loop into a DAW or Audacity, enable looping, and confirm no click or pop at the join point. Check at both low and full volume.
- [ ] **Peak normalisation**: Confirm peak is at or below −1 dBFS. No clipping.
- [ ] **No DC offset**: Apply a DC offset correction filter in your DAW if the waveform is not centred on zero.
- [ ] **Low-volume audition**: Listen under headphones at 10–20% system volume. Noise floor, room tone, and encoding artifacts are most audible here.
- [ ] **Interaction variant diversity**: Tap/drag/hold variants should sound distinct enough that rapid repeated triggering does not feel robotic.
- [ ] **Duration**: Tap and one-shot files must be under 3 s. Loop files should be at least 30 s to avoid audible repetition.
- [ ] **File size**: A single WAV loop should not exceed ~10 MB (roughly 55 s at 44.1 kHz 16-bit stereo). If longer, trim or consider breaking it into crossfadeable segments.

---

## Free vs Premium Tagging

Set the `tier` field in `src/content/soundPacks.ts`:

```ts
tier: 'free'      // Available to all users
tier: 'premium'   // Gated behind IAP; paywall shown via src/ui/paywall.ts
```

`AudioManager` and `InteractionAudioManager` do not enforce gating themselves — gating is applied at the UI layer before a scene is loaded. Do not store premium audio paths in free scene registrations.

---

## ElevenLabs SFX Generator

For rapid prototyping or filling out empty packs, the project ships a build-time
script that calls the [ElevenLabs Sound Effects API](https://elevenlabs.io/docs/api-reference/sound-effects)
and writes WAVs into the exact paths `src/audio/sceneAudioRegistry.ts` expects.

### Setup

1. Get an API key from your ElevenLabs dashboard → Profile → API Keys.
2. Copy `.env.example` to `.env.local` (the `.local` variant is git-ignored).
3. Set `ELEVENLABS_API_KEY=sk_...` in `.env.local`.
4. Make sure `ffmpeg` is on your PATH or set `FFMPEG_PATH` in `.env.local`. The
   script transcodes the API's MP3 response to 48 kHz / 16-bit stereo WAV.

### Usage

```bash
# Generate every missing asset listed in scripts/audio-spec.json
npm run gen:audio

# Only one pack
npm run gen:audio -- --pack cozy-room

# Only one asset (handy for re-rolling a single take)
npm run gen:audio -- --id wood_tap_01 --force

# Print what would be generated without spending credits
npm run gen:audio -- --dry-run
```

The script is idempotent — assets that already exist on disk are skipped unless
`--force` is passed. Concurrency is capped at 3 parallel requests.

### Editing the spec

`scripts/audio-spec.json` is the source of truth. Each entry has:

| Field               | Required | Notes                                               |
| ------------------- | -------- | --------------------------------------------------- |
| `id`                | yes      | Matches the `id` in `sceneAudioRegistry.ts`         |
| `pack`              | yes      | Used by `--pack` filter; matches the `sceneId`      |
| `file`              | yes      | Output path **relative to `public/audio/`**         |
| `prompt`            | yes      | Sent verbatim as the SFX text prompt                |
| `duration_seconds`  | no       | 0.5–22; defaults to `defaults.duration_seconds`     |
| `prompt_influence`  | no       | 0–1; higher = closer to prompt, lower = more variety|

### Cost & quality caveats

- Roughly **$0.05–0.10 per generation**. The default spec has ~32 entries.
- Loop assets (drag/hold/ambience) come back as one-shots — they're not
  intrinsically seamless. Plan to either re-roll until a take loops cleanly or
  hand-edit the WAV (zero-crossings + crossfade) before shipping.
- The endpoint is non-deterministic. Same prompt, different output every time.
  If you like a specific take, commit it; don't re-roll on every CI run.
- Generated audio is committed to the repo. Keep prompts plain (no copyrighted
  references) and audition every asset before merging.
