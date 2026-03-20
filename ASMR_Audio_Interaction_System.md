# ASMR Sleep App — Audio Interaction System (Claude Code)

## Goal
Implement a premium-feeling audio interaction system for the ASMR sleep app that makes taps, drags, holds, and layered ambient interactions feel natural, calming, and non-repetitive.

This system should:
- sound responsive
- avoid repetition fatigue
- support multiple interaction types
- remain lightweight on mobile
- feel premium through variation and layering

---

# Core Philosophy

The app should not behave like a basic soundboard.

It should feel like:
- a responsive ASMR environment
- a calming interactive sound space
- a tactile audio experience

Every interaction should feel:
- immediate
- soft
- varied
- believable

---

# Interaction Types to Support

## 1. Tap
Single quick sound trigger.

Examples:
- finger tapping glass
- tapping wood
- tapping ceramic
- light object clicks

## 2. Drag
Continuous or semi-continuous sound while finger moves.

Examples:
- sand movement
- fabric brushing
- condensation drag
- textured surface movement

## 3. Hold
Sustained layer or gradually evolving sound.

Examples:
- soft hum build
- hand resting on fabric
- warm tone swell
- pressure-based texture layer

## 4. Random Ambient One-Shots
Auto-triggered variation sounds in background.

Examples:
- soft thunder
- window frame creak
- fireplace pop
- water drip
- distant room movement

---

# Audio Design Principles

## Rule 1
Never rely on one sound file for a frequently repeated interaction.

## Rule 2
Every repeated interaction category should have variation.

## Rule 3
Base ambience, interaction sounds, and variation layers should be treated as separate systems.

## Rule 4
The system should feel calming, not busy.

## Rule 5
All interaction sounds should blend with the active scene and never spike harshly.

---

# File Structure Recommendation

Suggested folders:

- /audio/ambient/
- /audio/interactions/tap/glass/
- /audio/interactions/tap/wood/
- /audio/interactions/drag/sand/
- /audio/interactions/drag/fabric/
- /audio/interactions/hold/
- /audio/one_shots/rain/
- /audio/one_shots/fireplace/
- /audio/one_shots/interior/

Use metadata or config files for scene mapping.

---

# Asset Quantity Recommendations

## Tap Variations
For each repeated tap category:
- minimum 5 variations
- ideal 8 to 12 variations

Examples:
- glass tap soft
- glass tap medium
- fingernail glass tap
- edge tap
- center tap

## Drag Variations
For each drag category:
- 2 to 4 loopable layers
- optional short accent one-shots

## Hold Variations
- 1 to 3 subtle evolving loops per hold category

## Ambient One-Shots
- 3 to 8 per scene category

---

# Playback Behavior

## Tap Behavior

### Required
When user taps:
1. choose a random sound from the mapped category
2. apply slight pitch randomization
3. apply slight volume randomization
4. play immediately with minimal latency

### Recommended randomization ranges
- pitch: 0.97 to 1.03
- volume: 0.90 to 1.00

Keep randomization subtle.
Do not make interactions sound cartoonish.

### Additional protection
- prevent the exact same file from repeating back-to-back when possible

---

## Drag Behavior

### Goal
Dragging should feel continuous and tactile.

### Recommended approach
Use one of these methods:

#### Method A — Loop + modulation
- start drag loop on touch begin
- modulate volume and filter based on movement speed
- fade out on touch end

#### Method B — Granular trigger style
- trigger short drag fragments based on movement distance / velocity
- add random fragment selection

### Recommendation
For MVP, use Method A for smoothness and simplicity.

### Drag mapping inputs
Use touch data to influence:
- volume
- layer intensity
- texture density
- stereo subtleity if appropriate

---

## Hold Behavior

### Goal
Holding should feel like a gentle sustained interaction.

### Recommended behavior
- start a soft sustained layer after short hold threshold
- fade in over 150ms to 400ms
- fade out on release

### Examples
- sustained warm tone
- hand pressure texture
- soft resonance layer

Hold interactions should remain subtle.
They should never overpower ambience.

---

## Random Ambient One-Shots

### Goal
Make ambient scenes feel alive without becoming distracting.

### Examples by scene

#### Rain Window
- distant soft thunder
- slight window frame creak
- heavier raindrop cluster
- subtle wind swell

#### Cozy Room
- fireplace pop
- chair creak
- blanket rustle
- room tone variation

#### Sand Table
- fine grain shift
- tiny friction accent
- soft tray movement

### Timing rules
Trigger at randomized intervals:
- every 8 to 30 seconds for subtle scene events
- never too predictably
- never too loudly

---

# Scene Audio Layering Model

Each scene should be built from 3 layers:

## Layer 1 — Base Ambience
Long loop:
- 45 to 90 seconds recommended

Examples:
- rain on window
- fireplace room tone
- soft room hum

## Layer 2 — Interaction Layer
User-controlled sounds:
- taps
- drags
- holds

## Layer 3 — Variation Layer
Random one-shots:
- thunder
- creaks
- drips
- fireplace pops

This 3-layer system is what makes the app feel premium.

---

# Scene Mapping Examples

## Rain Window Scene

### Base
- rain_glass_loop_01

### Tap
- glass_tap_01 through glass_tap_08

### Drag
- condensation_drag_loop_01
- condensation_drag_loop_02

### Hold
- soft_window_resonance_01

### One-Shots
- thunder_soft_01
- thunder_soft_02
- frame_creak_01
- heavy_drops_01

---

## Cozy Room Scene

### Base
- fireplace_room_loop_01

### Tap
- wood_tap_01 through wood_tap_06
- ceramic_click_01 through ceramic_click_04

### Drag
- fabric_brush_loop_01
- blanket_drag_loop_01

### Hold
- warm_tone_hold_01

### One-Shots
- fireplace_pop_01
- chair_creak_01
- room_settle_01

---

## Sand Table Scene

### Base
- sand_room_loop_01

### Tap
- tray_tap_01 through tray_tap_05

### Drag
- sand_drag_loop_01
- sand_drag_loop_02
- grain_shift_loop_01

### Hold
- soft_texture_pressure_01

### One-Shots
- grain_slide_01
- small_tray_shift_01

---

# Technical System Structure

Suggested files:

- src/audio/InteractionAudioManager.ts
- src/audio/interactionConfig.ts
- src/audio/sceneAudioRegistry.ts
- src/audio/audioUtils.ts
- src/audio/types.ts

Optional:
- src/audio/controllers/TapController.ts
- src/audio/controllers/DragController.ts
- src/audio/controllers/AmbientVariationController.ts

---

# Suggested Manager Responsibilities

## InteractionAudioManager
Should:
- preload needed scene audio
- expose interaction play methods
- manage variation logic
- prevent repetition fatigue
- handle drag loop lifecycle
- manage ambient one-shot timers

Suggested methods:
- loadSceneAudio(sceneId)
- playTap(surfaceType, intensity?)
- startDrag(surfaceType)
- updateDrag(surfaceType, speed, pressure?)
- stopDrag(surfaceType)
- startHold(surfaceType)
- stopHold(surfaceType)
- startAmbientVariations(sceneId)
- stopAmbientVariations(sceneId)

---

# Repetition Prevention Rules

## Tap anti-repeat
- do not repeat same sample twice in a row if alternatives exist
- use random pool with recent-history memory

## Drag anti-fatigue
- rotate subtle loop variants between drag sessions
- modulate filter or volume based on speed

## One-shot anti-pattern
- avoid firing same one-shot too frequently
- set minimum time gap per one-shot category

---

# Loudness and Mix Rules

## General
Everything should be mixed for calm listening.

### Tap sounds
- clear but soft
- never piercing

### Drag sounds
- slightly lower and smoother than tap sounds

### Hold layers
- subtle and warm

### One-shots
- noticeable but restrained

## Important
No interaction should spike above the comfort level of the ambient scene.

---

# Performance Rules

This must stay efficient on mobile.

## Requirements
- preload only current scene + near-future assets
- avoid loading every scene at once
- reuse loaded buffers where possible
- cap overlapping taps if needed
- keep one-shot scheduling lightweight

## Good practice
- unload or dereference unused scene packs when leaving scene
- keep interaction sounds short and optimized
- use compressed production-ready formats once finalized

---

# Audio Asset Timing Guidance

## Base ambience loops
- 45 to 90 seconds ideal

## Tap sounds
- 0.2 to 1.5 seconds typical

## Drag loops
- 1 to 5 seconds loop segments or continuous layers

## Hold loops
- 2 to 8 seconds evolving layer, faded in/out

## Ambient one-shots
- 0.5 to 4 seconds depending on category

---

# Interaction Design Rules by Surface

## Glass
Should feel:
- crisp
- intimate
- delicate
- bright but soft

## Wood
Should feel:
- warm
- tactile
- grounded

## Fabric
Should feel:
- soft
- low-mid focused
- brushed

## Sand
Should feel:
- smooth
- textured
- whispery

## Ceramic
Should feel:
- light
- crisp
- refined

These emotional categories matter.
Claude Code should preserve them in how sounds are grouped and played.

---

# Gesture Mapping Guidance

## Tap intensity
If velocity is available:
- softer tap sound for low velocity
- sharper sample or slightly louder playback for stronger taps

## Drag speed
Map speed to:
- volume
- layer density
- optional brightness

## Hold duration
Longer hold can:
- slowly increase sustained layer
- trigger subtle secondary texture after threshold

Do not make this too complicated in MVP.
Keep the response intuitive.

---

# Testing Checklist

## Must verify
- taps feel varied after 20 to 30 repetitions
- drag sounds fade in and out smoothly
- no abrupt loop clicks
- ambient one-shots do not interrupt calm mood
- scene transition unload/reload behaves correctly
- memory usage stays reasonable on mobile

---

# Implementation Tasks for Claude Code

## Task 1
Create InteractionAudioManager and scene audio registry.

## Task 2
Implement random tap selection with anti-repeat logic.

## Task 3
Implement drag audio start, update, and stop flow.

## Task 4
Implement hold interaction fade-in / fade-out.

## Task 5
Implement randomized ambient one-shot scheduler per scene.

## Task 6
Map audio categories cleanly to Rain Window, Cozy Room, and Sand Table.

## Task 7
Add subtle pitch and volume randomization.

## Task 8
Optimize loading so only active scene audio is resident when possible.

---

# Acceptance Criteria

The audio interaction system is successful when:
- taps feel natural and non-repetitive
- drags feel smooth and tactile
- holds feel subtle and premium
- ambient variations add life without distraction
- each scene has a distinct sonic identity
- the system remains mobile-friendly

---

# Final Instruction

Build this system like an interactive ASMR environment, not a button-trigger soundboard.

The goal is to make the user feel:
- immersed
- calm
- curious to touch more
- comfortable staying for long sessions

Every interaction should feel intentional, soft, and slightly different each time.
