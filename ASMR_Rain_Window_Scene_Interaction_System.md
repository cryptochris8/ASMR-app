# ASMR Sleep App — Rain Window Scene Interaction System (Claude Code)

## Goal
Implement the Rain Window scene as an interactive, premium-feeling Three.js experience using:
- the selected indoor rain-window skybox
- a tappable glass interaction plane
- drag interaction for condensation / streak effects
- subtle animated rain-on-glass overlays
- optimized mobile-friendly logic

This system should transform the scene from a static environment into a tactile ASMR interaction space.

---

# Scene Design Philosophy

The Rain Window scene should feel like:
- lying in bed at night
- looking at a rainy window
- safely indoors
- able to gently tap and trace the glass

This is not a game scene.
It is a calm interactive environment.

The user should feel:
- immediate tactile response
- softness
- immersion
- realism without complexity

---

# Core Scene Structure

Build the scene in layers:

## Layer 1 — Skybox
Use the approved indoor rain-bedroom equirectangular skybox as the environment background.

This provides:
- room lighting
- cozy mood
- outside view
- visual context

## Layer 2 — Glass Interaction Plane
Add a transparent foreground plane aligned with the visible window area.

This plane is:
- the tap target
- the drag target
- the surface for subtle rain/condensation overlays

## Layer 3 — Rain FX Overlay
Add subtle animated rain streaks / droplets over the glass area.

This provides:
- motion
- realism
- visual connection to audio

## Layer 4 — Interaction Feedback
Map tap and drag gestures to:
- glass sounds
- light visual responses
- optional condensation distortion or ripple effects

---

# Key Rule

Do NOT try to build a full 3D room around the skybox.

Use:
- skybox for room visuals
- one interaction plane for the window
- lightweight overlays only

This avoids:
- black geometry issues
- lighting mismatch
- unnecessary complexity
- mobile performance waste

---

# Camera and Scene Setup

## Camera
Use a fixed, calm camera.

Requirements:
- no orbit controls in sleep mode
- no dramatic camera movement
- optional tiny “breathing” motion later, but off by default in MVP

Suggested:
- camera faces the main window area naturally
- slight framing toward the glass interaction zone

## Scene Environment
Use the equirectangular room image as:
- scene background
- optional environment/reflection source if lightweight enough

If reflections are too expensive, keep the plane simple and fake reflections subtly.

---

# Window Interaction Plane

## Purpose
The plane is the invisible or near-invisible surface users interact with.

It should sit in front of the camera and roughly align with the visible window in the skybox.

## Behavior
The plane should:
- receive raycasts
- detect tap position
- detect drag movement
- map coordinates to localized audio/visual effects

## Material
Use a transparent material or shader-based material with:
- very slight reflection feel
- very subtle roughness look
- optional faint surface noise
- optional animated streak mask

Keep it soft and believable.
Do not make it look like a game UI panel.

---

# Approximate Placement Guidance

Use the selected render as the visual target.

Based on the chosen skybox composition, the primary interaction window is slightly left of center.

## Initial placement guidance
Treat the window interaction zone as approximately:
- horizontal screen region: 28% to 56%
- vertical screen region: 18% to 76%

This is a starting guide only.

Claude Code should expose tuning variables so the plane can be adjusted after visual testing.

## Recommended implementation
Create a plane with configurable:
- x position
- y position
- z depth
- width
- height
- slight rotation if needed

Store this in scene config so it can be tuned without rewriting code.

---

# Suggested Config Structure

Create a scene config file such as:

- src/scenes/rainWindowSceneConfig.ts

Suggested fields:
- skyboxTexturePath
- interactionPlanePosition
- interactionPlaneRotation
- interactionPlaneScale
- rainFxIntensity
- tapAudioSurfaceType
- dragAudioSurfaceType
- ambientVariationSet

Example categories only.
Use project conventions.

---

# Interaction Types

## 1. Tap Interaction

### Behavior
When user taps the interaction plane:
- raycast hit point is captured
- normalized UV coordinates are calculated
- glass tap sound is played
- subtle visual response occurs at tap position

### Audio
Use the glass tap category from the interaction audio system.

Recommended:
- random sample from glass tap pool
- slight pitch randomization
- slight volume randomization

### Visual response ideas
Pick one lightweight approach:
- tiny ripple on glass
- soft specular pulse
- droplet tremble
- small fog/condensation bloom

Keep it subtle.
This is ASMR, not arcade feedback.

---

## 2. Drag Interaction

### Behavior
When user drags across the glass:
- drag state begins on pointer down
- track movement across interaction plane
- drive drag audio layer
- optionally reveal a temporary condensation trace or cleared streak path

### Audio
Use:
- condensation drag
- soft finger-on-glass glide
- subtle wet streak layer

### Visual response ideas
- a slightly brighter streak following drag path
- temporary fog displacement
- subtle distortion line
- very soft droplet shift

Do NOT overdo opacity or texture contrast.

---

## 3. Hold Interaction (Optional in v1)
If user presses and holds:
- start a very subtle sustained glass resonance or room tone layer
- fade in smoothly
- stop on release

This is optional for MVP.
Tap and drag are the priority.

---

# Rain FX Overlay

## Goal
The scene already shows rain in the skybox.
The overlay adds life and interactivity.

## Requirements
The rain FX must be:
- subtle
- slow
- localized to the glass plane
- lightweight enough for mobile

## Good approaches

### Option A — Animated alpha streak texture
- use a semi-transparent rain streak texture
- scroll UVs slowly downward
- layer multiple textures at different speeds if needed

### Option B — Droplet mask shader
- shader simulates small moving droplets and streaks
- slightly distorts background/reflection
- more advanced but stronger premium effect

### MVP recommendation
Start with Option A.
It is simpler and likely enough for V1.

## Important
Do not cover the whole view with aggressive rain.
Keep the effect believable and soft.

---

# Condensation / Trace Effect

## Goal
Dragging across the glass should feel tactile.

## MVP approach
When dragging:
- render a temporary “cleaned” or “smeared” mask on the glass plane
- slowly fade it back out over time

This can be done with:
- render-to-texture mask
- canvas texture used as alpha influence
- simple sprite trail system if lighter

## Behavior
- line follows drag path
- width depends on touch movement speed slightly
- fades back to normal over 1 to 4 seconds

## Emotional target
It should feel like tracing a finger along cool damp glass.

---

# Audio Integration

Use the previously defined ASMR interaction audio system.

## Tap mapping
Surface type:
- glass

## Drag mapping
Surface type:
- condensation_glass or wet_glass

## Ambient scene audio
Base loop:
- rain on glass window loop

## Ambient one-shots
Optional:
- soft thunder
- window frame creak
- heavier rain cluster

The visual interaction plane and audio system should feel unified.

---

# Lighting Strategy

Because the room lighting is baked into the skybox:
- do not rely on heavy dynamic room lighting
- keep additional lights minimal

If needed:
- use a faint ambient light only
- use a very soft directional/specular helper for the glass plane

The glass plane should not appear black.
It should remain softly visible through subtle shading only.

---

# Reflection Strategy

## Recommended
Fake reflections lightly rather than using expensive real reflections.

Options:
- fresnel-based edge highlight
- low-opacity reflection tint
- subtle environment mapping if cheap enough

## Avoid
- heavy SSR
- high-cost reflection passes
- complicated post-processing

This must stay mobile-friendly.

---

# Mobile Performance Rules

## Must Have
- single main interaction plane
- low-cost rain effect
- minimal additional geometry
- no full room mesh build
- limited shader complexity
- no expensive post stacks

## Good practice
- use compressed textures
- cap effect resolution
- reduce particle count if used
- keep interaction effect localized

---

# Suggested File Structure

Recommended files:
- src/scenes/RainWindowScene.tsx
- src/scenes/rainWindowSceneConfig.ts
- src/effects/RainGlassOverlay.tsx
- src/effects/CondensationTrail.tsx
- src/interaction/WindowInteractionPlane.tsx

Optional:
- src/shaders/rainGlassShader.ts
- src/utils/raycastWindowInteraction.ts

Adapt to project conventions.

---

# Component Responsibilities

## RainWindowScene
- load skybox
- set camera framing
- mount interaction plane
- start ambient audio
- mount rain overlay
- start ambient scene one-shots

## WindowInteractionPlane
- receive raycasts
- convert pointer hits to local coordinates
- emit tap / drag events
- connect to audio manager
- drive interaction visual feedback

## RainGlassOverlay
- animate subtle rain streaks
- stay aligned to plane
- support intensity tuning

## CondensationTrail
- draw and fade drag trails
- keep effect soft and temporary

---

# Gesture Handling

## Pointer Down
- begin hit test on interaction plane
- if valid hit, start tap or drag candidate

## Pointer Move
- if pressed and moving, transition to drag mode
- update local UV position
- feed drag effect + drag audio modulation

## Pointer Up
- stop drag audio
- stop hold state if any
- allow fade-out of visual trace

## Important
Distinguish:
- tap = short press, little movement
- drag = movement beyond threshold

Use a gentle movement threshold so tracing feels natural.

---

# Coordinate Mapping

When hit-testing the plane:
- get local UV coordinates
- use UVs for:
  - placing ripple effect
  - placing condensation trail
  - modulating audio localization later if desired

Store interaction in normalized local coordinates rather than screen space when possible.

This makes the effect resilient to layout changes.

---

# Tuning Parameters to Expose

Make these easy to tweak:

- planePositionX
- planePositionY
- planePositionZ
- planeWidth
- planeHeight
- rainScrollSpeed
- rainOverlayOpacity
- dragTrailFadeDuration
- dragTrailWidth
- tapRippleStrength
- tapAudioVolumeRange
- dragAudioVolumeRange

Claude Code should centralize these in config.

---

# Recommended MVP Build Order

## Phase 1
- load skybox
- place transparent interaction plane
- add raycast tap detection
- play glass tap sounds

## Phase 2
- add drag detection
- play drag sound layer
- add temporary visual drag trace

## Phase 3
- add animated rain glass overlay
- tune opacity and speed
- add ambient one-shots

## Phase 4
- polish:
  - subtle ripple
  - fresnel highlight
  - optional hold interaction

---

# Testing Checklist

## Visual
- plane aligns with visible window
- no obvious black rectangle
- rain overlay feels subtle and believable
- drag trace looks soft and temporary

## Interaction
- tap always feels responsive
- drag starts smoothly
- false drags are minimized
- interaction area is easy to find naturally

## Audio
- tap sounds match touch position timing
- drag sound fades in/out smoothly
- ambient rain loop remains dominant but calm

## Performance
- scene runs smoothly on target mobile devices
- no major frame drops during drag
- no memory spikes from repeated interaction

---

# Acceptance Criteria

This implementation is successful when:
- the Rain Window scene feels like a calm place, not just a picture
- users can intuitively tap and trace the window
- rain movement adds life without distraction
- interaction sounds and visuals feel connected
- the system runs smoothly on mobile

---

# Final Instruction

Build this scene as a premium interactive ASMR environment.

Do not overbuild the room.
Do not add unnecessary 3D complexity.

The win condition is:
- believable window interaction
- subtle rain motion
- warm cozy immersion
- instant tactile calm

This scene should feel like a place the user wants to revisit nightly.
