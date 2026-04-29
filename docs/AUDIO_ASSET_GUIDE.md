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
