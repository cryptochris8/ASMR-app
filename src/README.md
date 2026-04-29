# src/ — Code Map

One-line description per directory.

| Directory | Contents |
|---|---|
| `audio/` | `AudioManager` (master bus, ambient loops, volume faders), `InteractionAudioManager` (3-layer tap/drag/hold sample player), `sceneAudioRegistry` (scene-to-track map), `assetManifest` (WAV URLs + metadata for pre-buffering), shared audio types |
| `content/` | Scene metadata (`scenes.ts`) and SoundPack metadata (`soundPacks.ts`) — pure data, no logic |
| `effects/` | Self-contained Three.js post-processing effects: `CondensationTrail` (moisture bead streaks), `RainGlassOverlay` (animated rain-droplet compositing) |
| `game/` | `Game` orchestrator (boot, subsystem wiring, input routing), `SceneController` (IScene lifecycle), pub/sub `Store` (`state.ts`), `SaveSystem` (localStorage serialisation + schema migration), `SubscriptionManager` (`subscription.ts` — IAP stubs), compile-time `config` |
| `render/` | Thin Three.js wrappers: `renderer` (WebGLRenderer + resize), `camera` (PerspectiveCamera), `lighting` (ambient + directional rig), `scene` (Scene factory with fog/background defaults) |
| `scenes/` | `IScene` interface (`init`, `update(dt)`, `dispose`, `onInteraction`) + concrete implementations: `RainWindowScene`, `CozyRoomScene`, `SandTableScene`; `rainWindowConfig` externalises rain scene tuning constants |
| `systems/` | `InputSystem` (unified pointer/touch events), `SleepTimer` (countdown → `fadeMasterTo`), `HapticsSystem` (`@capacitor/haptics` wrapper), `GyroLookSystem` (device-orientation parallax), `native` (Capacitor plugin bridge, platform guards), `save` (re-export of SaveSystem for non-game modules) |
| `ui/` | `UIPanel` base class (root `<div>`, show/hide transitions, `render()` lifecycle) + 8 screen subclasses: `splash`, `home`, `player`, `mixer-panel`, `timer-modal`, `settings`, `paywall`, and onboarding (handled by `home`) |
