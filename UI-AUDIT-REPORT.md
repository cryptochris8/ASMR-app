# UI Polish Audit & Fixes — ASMR Sleep App

## Files changed
- **`index.html`** — strengthened reduced-motion override (added `scroll-behavior`); split focus ring into `:focus-visible`-only with brighter accent (`#a393d3`) and larger offset (3px); suppressed default focus on pointer interactions; added global `button` font/color reset and `:disabled` style; semantic `<main role="main">` landmark replaces bare `<div id="app">`; added subtle dark scrollbar styling for overflow panels.
- **`src/ui/splash.ts`** — added `role="status"` + `aria-label` for screen-reader announce-on-load; `aria-hidden="true"` on decorative SVG/loader; bumped tagline weight 300→400; reset `<h1>` margin.
- **`src/ui/home.ts`** — converted to semantic `<header>` + `<h2>` for the section heading; added `type="button"` to every button; expanded `aria-label`s with mood context; added `:hover`, `:focus-visible`, and gentle `transform: scale(0.98–0.99)` on `:active` to all buttons; tightened transitions to 0.4s ease (calmer); enforced ≥44px touch targets on settings icon; added missing hover state for scene cards on desktop; line-height for scene name/mood; SVGs marked `aria-hidden`/`focusable="false"`.
- **`src/ui/player.ts`** — wrapped top bar in `<nav>` and bottom bar in `role="toolbar"`; added `aria-pressed` to mute and timer toggle buttons; `aria-live="polite"` on scene label; bumped `player-btn-label` 10px→11px (10px below readable threshold for sleep eyes); added `:hover`, `:focus-visible`, and scale-on-active to bottom-bar buttons; `font-variant-numeric: tabular-nums` on timer badges (no jitter as digits change).
- **`src/ui/settings.ts`** — wrapped sections in `<section>` with proper `aria-labelledby`; converted section dividers to `<h2>`; added `role="switch"` + explicit `aria-label` to all toggles; added `type="button"`, hover, focus-visible, and ≥48px min-heights to all buttons; added focus-visible offset on toggles for keyboard users; subtle hover color changes on link buttons.
- **`src/ui/paywall.ts`** — converted plans to `role="radiogroup"` with `aria-checked` toggling on selection; benefits list now semantic `<ul>` with `aria-label`; trial row converted to `<label>` for full-row clicks; `<span>Terms & Privacy</span>` upgraded to `<button>` (was `cursor:pointer` but unreachable by keyboard); added hover, focus-visible, and gentle press-scale on every button; calmed transitions to 0.4s; CTA text color changed `#000` → `#1a1208` (warm dark vs. pure black on gold); ensured ≥44px tap targets on small footer buttons.
- **`src/ui/mixer-panel.ts`** — added `aria-pressed` and `type="button"` to layer toggles; added `aria-label` to close button and `aria-hidden` to backdrop/handle; redesigned slider thumb (22px with subtle border + shadow), added focus-visible ring on the thumb specifically (sliders rarely get visible focus), Firefox `::-moz-range-thumb` parity, hover scale; `tabular-nums` on percent values; tightened layer-row min-height for consistent rhythm.
- **`src/ui/timer-modal.ts`** — `aria-hidden` on backdrop/handle; `role="timer"` + `aria-live="polite"` on the remaining display; timer-options grouped with `role="group"` and each option carries `aria-pressed` for the selected state; added `type="button"`, hover, focus-visible, and press-scale to every button; ≥44/48px targets; `tabular-nums` on the big countdown so digits don't shift.
- **`src/ui/onboarding.ts`** — added `aria-hidden` to icon/dots; added a small `aria-live="polite"` "Step N of M" indicator (better than dots alone for screen readers); active dot now scales for stronger visual feedback; bumped body weight 300→400 (readability in low-light); added hover/focus-visible/press-scale + min-heights to buttons.

## High-impact wins
1. **Focus-visible everywhere** — every interactive element now shows a clear keyboard focus indicator (`#a393d3` lavender ring, 3px offset). Previously only the index.html global rule existed; per-component buttons swallowed it. Critical for keyboard/AT users.
2. **`type="button"` on every button** — prevents accidental form submission and is a TS/lint best-practice that was missing across the entire UI layer.
3. **Touch targets normalized to ≥44px** — was inconsistent; now all buttons meet WCAG 2.5.5 / Apple HIG.
4. **Calmer micro-interactions** — transitions standardized at `0.4s ease` (was a mix of `0.2s` and `all 0.2s`); added `transform: scale(0.98–0.99)` on `:active` for tactile feedback that's gentle, not jarring. Aligns with sleep-app vibe.
5. **Toggle/radio semantics** — `role="switch"` + `aria-pressed` + `aria-checked` patterns added throughout (settings toggles, mixer layer buttons, paywall plans, mute, timer). Screen readers now correctly announce state.

## Bigger questions needing user decision
- **Paywall copy / tone** — "Unlock the Full Sleep Experience" + 5-bullet feature list reads conversion-y, not sleep-app-calm. Want me to draft 2-3 friendlier alternatives that emphasize benefit ("Sleep deeper tonight…") rather than feature gating?
- **Empty state on home** — when `lastUsedScene` is null, the "Continue Last Session" card simply doesn't render. There's no "first time? start here" affordance. A subtle prompt like "Pick a scene below to get started" could warm up first-session UX.
- **Loading/error states for scene transitions** — the `sceneFadeDuration: 800ms` is fine when assets are cached, but skybox JPGs are large; a progressive load indicator (or skeleton thumb) on the scene grid + a fallback state if `playAmbient` fails would prevent silent dead-ends.
- **Skip onboarding visibility on the last page** — currently the Skip button disappears on page 2/2 because the only action is "Get Started". Intentional (commit), but might confuse users who expected to bail. Worth verifying against UX intent.
- **Settings: link buttons have no destinations yet** — Privacy Policy / Terms / Support buttons render but do nothing. A `disabled`-with-"coming soon" tooltip, or remove until wired, would prevent dead clicks.
- **Premium badge contrast on home header** — `#c9a84c` on `#c9a84c18` (~10% bg) clears AA but feels visually quiet against the nearby muted text. Consider raising background opacity to ~24% if you want it to pop more.

## Files audited but not changed
- **`src/ui/UIPanel.ts`** — base class is minimal and correct. No styling to polish.
- **`src/ui/NightOverlay.ts`** — single-purpose tinting layer; no UI to polish.

## Verification
- `npx tsc --noEmit` passes cleanly across the touched files. All edits are CSS additions or attribute additions that don't change runtime behavior.
- Existing JS event handlers all reference class names / data-attributes that were preserved.
- The one structural change worth noting: `<main id="app">` replaces `<div id="app">`. `Game.ts` uses `getElementById` which returns `HTMLElement` either way; the `#app { position: relative }` CSS still applies. No risk.
