# ASMR Sleep App — Screen Flow and UX Blueprint (Claude Code)

## Goal
Define the screen-by-screen user experience for the ASMR sleep app so Claude Code can build the product in a clean, conversion-aware order.

The experience should feel:
- calming
- premium
- simple
- low-friction
- habit-forming

---

# Primary Navigation Structure

Recommended tab or root structure:

1. Home
2. Scenes
3. Mixer
4. Sleep Timer
5. Settings

For MVP, this can be simplified into:
- Home
- Scene Player
- Settings / Subscription

---

# Screen 1 — Splash / Launch

## Purpose
Create a calm first impression while the app loads audio assets and restores saved state.

## UI Elements
- app logo
- soft animated background
- short line like:
  - “Relax. Breathe. Sleep.”
- loading indicator if needed

## Behavior
- load saved preferences
- preload last-used scene
- preload subscription state
- transition quickly to Home

Do not linger here longer than needed.

---

# Screen 2 — Home

## Purpose
This is the main entry point and should make it obvious how to begin relaxing immediately.

## Primary UI
- featured scene card
- continue last session button
- scene carousel or grid
- quick sleep timer shortcut
- small “Start Relaxing” CTA
- premium badge if subscribed
- daily recommendation or “Tonight’s pick”

## Recommended Layout
Top:
- greeting / soft headline
- continue last session

Middle:
- featured scenes

Bottom:
- quick actions
  - Timer
  - Mixer
  - Favorites

## Copy Ideas
- “Start relaxing”
- “Continue your rain session”
- “Tonight’s calming scene”
- “Build your sleep sound”

---

# Screen 3 — Scene Selection

## Purpose
Let users browse calming environments quickly.

## MVP Scene Cards
1. Rain Window
2. Cozy Room
3. Sand Table

## Each Card Should Show
- scene thumbnail
- short mood label
  - Rainy
  - Cozy
  - Tactile
- free or premium badge
- last used / favorite indicator

## Interaction
Tap card → open Scene Player

## Optional
Locked premium scenes show:
- preview image
- lock icon
- gentle upsell line

---

# Screen 4 — Scene Player (Main Experience)

## Purpose
This is the core product screen where users interact with visuals and ASMR sounds.

## Must-Have UI
- immersive scene canvas
- play / pause
- timer button
- sound layers button
- favorite button
- back button
- scene title
- minimal top or bottom chrome

## Interactions
- tap objects for sound
- drag for texture-based sound
- hold for sustained layer
- optional two-finger gesture to reduce UI

## Design Rules
- UI should fade when inactive
- scene should remain the focus
- buttons must be easy to access in low light

## Suggested Bottom Bar
- Timer
- Mixer
- Favorite
- Dim Screen
- Premium / Unlock if applicable

---

# Screen 5 — Mixer Panel

## Purpose
Let users customize their sound environment without feeling overwhelmed.

## MVP Controls
- master volume
- ambient layer volume
- interaction layer volume
- optional extra layer toggles
  - Rain
  - Fireplace
  - Soft hum
  - Night wind

## UX Rules
- use sliders with large touch targets
- avoid too many controls at once
- allow save preset option later

## Good V1 Layout
- vertical list of sound layers
- each row:
  - label
  - mute toggle
  - volume slider

---

# Screen 6 — Sleep Timer

## Purpose
Provide a frictionless sleep timer with fade-out behavior.

## Options
- 5 min
- 10 min
- 30 min
- 1 hour
- no timer

## Optional Toggles
- fade audio at end
- dim screen after 30 seconds
- auto-lock friendly mode

## UX
This should open as a modal or bottom sheet.
Do not force a full screen unless needed.

## Success State
After set:
- show small badge on player screen
- show remaining time

---

# Screen 7 — Favorites / Presets

## Purpose
Make the app feel habit-forming and personal.

## MVP
- save favorite scenes
- remember last used settings
- one-tap reopen favorite setup

## Later Expansion
- saved sound mixes
- bedtime presets
- “Focus” vs “Sleep” presets

---

# Screen 8 — Subscription / Premium Paywall

## Purpose
Convert free users without breaking the calm tone of the app.

## Triggers
- attempting to open premium scene
- trying to save multiple presets
- trying to access premium sound packs
- soft prompt after positive usage milestone

## Structure
Top:
- calming premium artwork
- headline

Middle:
- benefits list

Bottom:
- monthly and yearly options
- restore purchases
- continue free option

## Recommended Benefits
- all scenes unlocked
- premium sound packs
- unlimited timers and presets
- exclusive sleep environments
- no interruptions

## Tone
Should feel premium and helpful, not aggressive.

---

# Screen 9 — Settings

## Purpose
Keep utility options out of the main calm flow.

## Include
- sound settings
- haptics on/off
- dim screen preference
- timer defaults
- restore purchases
- privacy / terms
- contact support

## Keep Simple
No clutter.
Use grouped categories.

---

# New User Flow

## First Open
1. Splash
2. Home
3. optional 2-screen onboarding
4. prompt to start with Rain Window
5. enter Scene Player

## Onboarding Goals
- explain interactivity
- show timer
- surface premium lightly
- get user into a calm moment quickly

## Suggested Onboarding Copy
1. “Tap and drag to trigger calming sounds”
2. “Set a timer and drift off naturally”

Keep onboarding to 2 or 3 screens max.

---

# Paywall Timing Strategy

## Do NOT show paywall immediately on first launch

## Better trigger points
- after user enjoys first free session
- when trying premium scene
- after saving first favorite
- after 2 or 3 high-intent sessions

This improves conversion and trust.

---

# Conversion-Friendly Flow

Recommended path:
1. User opens free scene
2. Uses timer
3. Enjoys experience
4. Sees locked premium scene
5. Opens paywall
6. Understands benefit quickly
7. subscribes

---

# Screen Priority for Claude Code

Build in this order:

## Phase 1
- Splash
- Home
- Scene Selection
- Scene Player

## Phase 2
- Mixer Panel
- Sleep Timer
- Settings

## Phase 3
- Favorites / Presets
- Paywall
- onboarding polish

---

# UX Rules for Entire App

## Rule 1
Every screen should feel calm.

## Rule 2
Use soft transitions and minimal clutter.

## Rule 3
Do not overwhelm with options.

## Rule 4
Get the user into audio quickly.

## Rule 5
Premium prompts should feel natural, not pushy.

---

# Acceptance Criteria

The flow is successful when:
- a new user can begin interacting in under 15 seconds
- timer is easy to find
- scene player feels immersive
- mixer is simple to understand
- paywall appears at logical moments
- the app feels premium and restful from first use

---

# Final Instruction

Build the app flow like a calming product, not a complex utility dashboard.

The user should always feel:
- safe
- relaxed
- in control
- close to sleep
