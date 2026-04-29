# Contributing

## Dev Setup

Requirements: **Node 22**, npm 10+.

```bash
git clone <repo-url>
cd ASMR-app
npm install
npm run dev      # → http://localhost:5175
```

ffmpeg is only needed when running the audio pipeline script:

```bash
# macOS / Linux (system ffmpeg)
node scripts/audio-pipeline.js

# Override the binary path
FFMPEG_PATH=/opt/homebrew/bin/ffmpeg FFPROBE_PATH=/opt/homebrew/bin/ffprobe \
  node scripts/audio-pipeline.js
```

---

## Branch Naming

| Prefix | Use |
|---|---|
| `feature/` | New functionality |
| `fix/` | Bug or regression fix |
| `docs/` | Documentation-only change |
| `chore/` | Tooling, deps, CI, config |

Example: `fix/sleep-timer-fade-on-resume`

---

## Commit Style

Use a short imperative subject line (50 chars or fewer). Add an optional body after a blank line to explain *why*, not *what*.

```
fix: resume audio context after app foreground

iOS suspends the AudioContext when backgrounded. Call
audioCtx.resume() in the Capacitor appStateChange handler.
```

Avoid commits like "wip", "fixes", or "update stuff".

---

## Code Style

- TypeScript strict mode is enforced (`tsconfig.json`). Do not use `any` or `@ts-ignore` without a comment explaining why.
- Write JSDoc comments for all public API functions, classes, and interfaces. Private helpers do not need docs if their name and types are self-evident.
- Do not write comments that describe what the code does — the code should be readable. Write comments only to explain *why* a non-obvious approach was chosen.
- Prefer named exports. Avoid default exports in modules that export more than one thing.
- Format with your editor's TypeScript formatter (project does not currently enforce Prettier; keep diffs clean).

---

## Pre-Commit Checks

Run both before pushing:

```bash
npx tsc --noEmit    # type-check
npx vite build      # confirm the bundle compiles
```

CI runs the same steps on every pull request (see `.github/workflows/ci.yml`).

---

## Pending Integrations

These items are stubbed in the codebase and must be completed before any store submission.

### RevenueCat IAP

`src/game/subscription.ts` contains placeholder functions (`purchasePremium`, `restorePurchases`, `checkEntitlement`). Replace with the RevenueCat Capacitor SDK (`@revenuecat/purchases-capacitor`). The paywall UI in `src/ui/paywall.ts` already calls these stubs.

### Background Audio — `@capacitor-community/music-controls`

When the app is backgrounded on iOS/Android the Web Audio context is suspended. Integrate `@capacitor-community/music-controls` and call `AudioContext.resume()` in the `appStateChange` handler inside `src/systems/native.ts`. Until this is done, ambient loops will stop on app background.

### Sentry Error Reporting

Add `@sentry/capacitor` and initialise it in `src/game/Game.ts` before the first render. Wrap the animate loop's catch block to forward unhandled errors.

### iOS Privacy Manifest

After running `cap sync ios`, add `ios/App/App/PrivacyInfo.xcprivacy` declaring the `NSUserDefaults` and audio API usage reasons required by App Store Review guidelines (effective 2024 Spring policy).

### Self-Hosted Inter Font

The app currently loads Inter from Google Fonts (`index.html`). For offline support and App Store compliance, self-host the WOFF2 subset under `public/fonts/` and update the `@font-face` declarations.

### Real Audio Assets for Premium Scenes

Premium scene audio tracks are not included in this repository. See [docs/AUDIO_ASSET_GUIDE.md](docs/AUDIO_ASSET_GUIDE.md) for format requirements and pack registration instructions.

---

## PR Checklist

Before requesting review, confirm:

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npx vite build` completes successfully
- [ ] No `any` types introduced without justification
- [ ] No hardcoded local paths (use env vars or relative paths)
- [ ] New public functions have JSDoc
- [ ] Audio assets meet the format requirements in `docs/AUDIO_ASSET_GUIDE.md`
- [ ] `ARCHITECTURE.md` updated if module boundaries or data flow changed
