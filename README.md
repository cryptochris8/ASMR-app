# ASMR Sleep App

An immersive mobile sleep-aid app with reactive 3-D scenes, layered ambient audio, and interactive ASMR soundscapes — built with TypeScript, Vite, Three.js, and Capacitor.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI / logic | TypeScript 5 (strict) |
| 3-D rendering | Three.js 0.170 |
| Build | Vite 6 |
| Mobile | Capacitor 8 (iOS + Android) |
| Haptics | `@capacitor/haptics` |
| State | Custom pub/sub store + localStorage |

---

## Quick Start

```bash
npm install
npm run dev          # → http://localhost:5175
```

---

## Build for Mobile

```bash
# iOS (opens Xcode)
npm run cap:ios

# Android (opens Android Studio)
npm run cap:android

# Sync only (no IDE open)
npm run cap:sync
```

Both commands run `tsc && vite build` first, then `cap sync`, then open the native IDE.

---

## Project Structure

```
src/
  audio/     AudioManager (mixer/loops), InteractionAudioManager, asset registry
  content/   Scene + SoundPack metadata
  effects/   Three.js post-processing effects
  game/      Orchestrator, SceneController, Store, SaveSystem, config
  render/    Renderer, camera, lighting, scene factories
  scenes/    IScene interface + scene implementations
  systems/   Input, SleepTimer, Haptics, GyroLook, Capacitor bridge
  ui/        UIPanel base + screen components

public/
  audio/     WAV assets organised by pack; see docs/AUDIO_ASSET_GUIDE.md

scripts/
  audio-pipeline.js   Inspect, downsample, and trim audio assets via ffmpeg
```

---

## Developer Reference

- Architecture overview: [ARCHITECTURE.md](ARCHITECTURE.md)
- Contributing guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Audio asset authoring: [docs/AUDIO_ASSET_GUIDE.md](docs/AUDIO_ASSET_GUIDE.md)
- Source code map: [src/README.md](src/README.md)

---

## License

License TBD. All rights reserved until a license is chosen.
