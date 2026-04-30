# Skybox Guide

How skyboxes work in the ASMR Sleep App, and how to add or regenerate them.

## How they're loaded

Each scene declares its skybox by name in `src/content/scenes.ts`:

```ts
{
  id: 'sand-table',
  skybox: 'warm-neutral',
  // ...
}
```

`src/render/scene.ts` resolves that to `/skybox/<name>.jpg`. The loader uses
`THREE.EquirectangularReflectionMapping`, so files **must be equirectangular
360° panoramas** (2:1 aspect, e.g. 4096×2048 or 2048×1024). Cubemaps and
square images will not work without changing the loader.

If a skybox file is missing, individual scene classes fall back to a solid
color (see `CozyRoomScene`/`SandTableScene` `init`).

## Where they live

```
public/
└── skybox/
    ├── cozy-rain.jpg       # Cozy Room scene
    ├── rain-window.jpg     # Rain Window scene
    └── warm-neutral.jpg    # Sand Table scene (generate via npm run gen:skyboxes)
```

## ElevenLabs-style generator (Blockade Labs)

The project ships a build-time script that calls the
[Blockade Labs Skybox AI](https://blockadelabs.com/) API and writes
equirectangular JPGs into `public/skybox/`.

### Setup

1. Create an account at blockadelabs.com and grab an API key.
2. Copy `.env.example` to `.env.local` (git-ignored).
3. Set `BLOCKADE_LABS_API_KEY=...` in `.env.local`.

### Usage

```bash
npm run gen:skyboxes                          # generate everything in the spec
npm run gen:skyboxes -- --id warm-neutral     # only one entry
npm run gen:skyboxes -- --force               # regenerate even if file exists
npm run gen:skyboxes -- --dry-run             # print plan, no requests
```

The script is idempotent (skips files that already exist), polls every 5
seconds with a 5-minute timeout per request, and runs at most 2 requests in
parallel.

### Editing the spec

`scripts/skybox-spec.json` is the source of truth. Each entry:

| Field              | Required | Notes                                           |
| ------------------ | -------- | ----------------------------------------------- |
| `id`               | yes      | Used by `--id` filter; informational            |
| `file`             | yes      | Output filename **inside `public/skybox/`**     |
| `prompt`           | yes      | Sent to the API as the main text prompt         |
| `negative_text`    | no       | Things to avoid (e.g. `"people, text, sun"`)    |
| `skybox_style_id`  | no       | Numeric Blockade style preset; omit for default |

After adding an entry, also register the skybox name in
`src/content/scenes.ts` on the scene that should use it.

### Cost & timing

- Roughly **$0.30 per skybox** on the paid tier; the free tier has a small
  daily allotment.
- Each request takes **~30–90 seconds** end-to-end (queue + render + download).
- The first poll waits 12 seconds before checking, then polls every 5 seconds.

### Quality notes

- Equirectangular images have a seam at the left/right edge and at the poles.
  Distortion at the zenith and nadir is normal — the rain window scene only
  shows a narrow vertical band, which hides most of it.
- Avoid prompts that imply harsh sun, signage, or text — the model occasionally
  bakes in artifacts that pull users out of the calm aesthetic.
- For sleep-app skyboxes, prefer **dim, low-contrast, desaturated** prompts
  (e.g. "soft amber dusk," "muted greys," "candlelit interior"). Bright /
  high-contrast skyboxes feel wrong at low brightness.
- Re-roll until you get one that loops cleanly across the seam — Blockade is
  non-deterministic so the same prompt produces different results each time.
- Generated JPGs are committed to the repo. Audition each one in the actual
  scene (`npm run dev` → enter the scene) before merging.
