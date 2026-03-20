# ASMR Sleep App — Audio Asset Pipeline and Responsibility Split (Claude Code Brief)

## Goal
Define a clear audio production workflow for the ASMR sleep app that separates:

1. audio assets the user will source manually
2. audio processing and implementation work Claude Code should handle
3. optional AI-generated / low-risk supporting assets Claude Code may create or request through connected APIs

This document should keep the project:
- high quality
- efficient
- organized
- realistic for production
- optimized for a premium sleep / ASMR experience

---

# Core Principle

This app is NOT a casual soundboard.

It is a premium sleep / ASMR product.

Because of that, the highest-value audio assets should prioritize:
- realism
- warmth
- long-session comfort
- low artifact risk
- premium stereo image
- natural, non-fatiguing repetition

That means the project should use a hybrid workflow.

---

# Recommended Overall Strategy

## Use premium manually sourced audio for:
- hero ambience
- long-form base loops
- critical tactile ASMR sounds
- premium sleep utility sounds

## Use Claude Code for:
- processing
- optimization
- looping
- organization
- metadata
- variation systems
- implementation
- scene mapping
- low-risk support assets

## Use AI-generated audio cautiously for:
- placeholder assets
- low-risk one-shots
- subtle accent layers
- experimental variations
- non-critical support textures

---

# Responsibility Split

# Part 1 — Audio Assets the User Should Add Manually

These are the assets where source quality matters most and where premium library audio is strongly preferred.

## A. Hero Ambient Base Loops
These are the most important assets in the app.

Examples:
- rain on glass window
- fireplace room ambience
- fan / white noise base
- soft room hum
- night forest ambience
- water ambience

## Why manual sourcing is preferred
These sounds must survive:
- long listening sessions
- repeat looping
- headphone use
- bedtime use
- comparison against top sleep apps

Artifacts or cheap-sounding generation will be very noticeable here.

## Recommendation
Source these manually from premium libraries such as Artlist and add them to the project.

---

## B. Critical Tactile / ASMR Hero Sounds
These are short sounds users directly interact with and will hear repeatedly.

Examples:
- finger tapping glass
- fingernail glass taps
- soft wood taps
- fabric brushing
- sand movement
- ceramic taps
- water drips
- condensation drag sounds

## Why manual sourcing is preferred
These sounds define the app’s tactile quality.
Users will judge the product quickly based on these.

## Recommendation
Source the strongest versions manually, especially the first 5 to 10 assets per major category.

---

## C. Sleep Utility Sounds
These are category staples expected by users.

Examples:
- fan
- white noise
- brown noise
- soft air conditioner hum
- quiet room ventilation

## Recommendation
Source manually from trusted libraries or already-owned premium sources.

---

## D. Signature Scene Anchors
Each scene should have one or more anchor sounds that define its identity.

Examples:
- Rain Window scene: rain-on-glass loop
- Cozy Room scene: fireplace crackle loop
- Sand Table scene: tactile sand movement loop

## Recommendation
The user should manually provide these anchors.

---

# Part 2 — What Claude Code Should Do on Its Own

Claude Code should handle the audio production pipeline around the manually provided source files.

## A. File Organization
Claude Code should:
- organize files into scene and category folders
- apply naming conventions
- create or update registries / metadata
- maintain consistent structure

Example folder ideas:
- /audio/packs/rain/
- /audio/packs/fireplace/
- /audio/interactions/tap/glass/
- /audio/interactions/drag/condensation/
- /audio/one_shots/interior/

---

## B. Format Standardization
Claude Code should:
- inspect source audio
- convert to target sample rate when needed
- convert to production-friendly file formats
- create mobile-optimized variants

Recommended production targets:
- 44.1kHz or 48kHz
- stereo for ambience where appropriate
- mono or stereo depending on interaction use
- AAC / M4A / OGG or project-approved equivalent for runtime
- WAV kept for archival or edit master if desired

---

## C. Loudness and Volume Preparation
Claude Code should:
- normalize files to project targets
- keep ambience at calm levels
- keep tap sounds controlled and non-harsh
- preserve dynamic comfort

Claude should create a repeatable loudness preparation pipeline rather than hand-editing one file at a time.

---

## D. Loop Preparation
Claude Code should:
- trim loops cleanly
- test for obvious pops/clicks
- create seamless loop-ready versions where possible
- add short fades if appropriate
- keep loop markers or notes in metadata

Important:
Claude should not blindly force every file into a loop if the source is unsuitable.
It should flag problematic files.

---

## E. Asset Derivatives and Variants
Claude Code should create helpful derivative files when appropriate.

Examples:
- shorter loop version
- lighter intensity version
- darker EQ version
- lower-volume bedtime version
- extended ambience version
- alt mix with more room tone
- filtered one-shot variants

Claude can also produce multiple runtime-friendly variations from one strong source asset.

---

## F. Interaction Pools
Claude Code should:
- create playback pools for repeated interaction sounds
- map tap categories to multiple samples
- prevent immediate repetition
- add subtle pitch and volume randomization

Example:
If the user manually adds 5 good glass tap sounds, Claude should wire them into a premium anti-repeat interaction system.

---

## G. Scene Mapping and Metadata
Claude Code should:
- map assets to scenes
- define which assets are free vs premium
- assign pack categories
- configure mixer compatibility
- specify interaction types by surface

Suggested metadata fields:
- id
- category
- scene
- freeOrPremium
- loopable
- interactionType
- baseVolume
- variationGroup
- recommendedUse

---

## H. Implementation in App
Claude Code should:
- wire audio files into the scene system
- integrate them into tap / drag / hold interactions
- connect ambient one-shots
- support timers and fade-outs
- optimize loading and unloading by scene

---

## I. Quality Control Automation
Claude Code should create checks or scripts for:
- sample rate inspection
- missing metadata
- naming mismatches
- suspiciously short/long files
- files that may click at loop boundaries
- duplicate files in wrong folders

---

# Part 3 — What Claude Code May Generate or Request via APIs

Claude Code may create or fetch low-risk supporting assets if the connected APIs are reliable.

This should be used selectively.

## Good use cases for generated / API-created assets
- subtle one-shot variations
- very light thunder variants
- room creaks
- tiny support textures
- low-risk alternate drag textures
- placeholders while premium files are still being gathered
- experimental premium pack variations

## Not recommended as primary source for
- hero rain ambience
- main fireplace loop
- fan / white noise foundation
- high-use premium ASMR tactile anchors
- anything that must sound natural for 10+ minutes

---

# Why This Split Matters

## Premium sleep apps are unforgiving
Users will notice:
- looping issues
- AI artifacts
- harsh highs
- fake textures
- repetition fatigue

## Therefore
The safest and strongest workflow is:
- manually source the important sounds
- let Claude Code turn them into a polished audio system

This gives the project the best mix of:
- quality
- speed
- scale
- consistency

---

# Detailed Asset Recommendations

# User Adds Manually

## Rain Window Scene
- rain on glass loop
- 5 to 10 glass tap sounds
- 2 to 4 condensation drag-friendly sounds
- 2 to 5 thunder / heavy rain variation sounds if desired

## Cozy Room Scene
- fireplace ambience loop
- wood taps
- fabric brushing
- ceramic / lamp / furniture one-shots
- soft room tone

## Sand Table Scene
- primary sand movement loop
- drag textures
- tray taps
- grain shifts

## Utility / Sleep Layer
- fan
- white noise
- brown noise
- low room hum

---

# Claude Code Handles

## Per-file tasks
- inspect
- rename
- convert
- optimize
- normalize
- create metadata
- create runtime variants if useful

## Per-scene tasks
- assign packs
- configure interaction types
- build mixer relationships
- set free/premium gating
- connect ambient one-shot scheduler

## Per-system tasks
- anti-repeat playback
- drag audio control
- fade-ins / fade-outs
- scene loading logic
- timer fade logic
- persistence of last-used sound mix

---

# Naming Convention Recommendation

Claude Code should enforce consistent naming.

Examples:
- rain_window_base_01.wav
- rain_window_base_01_runtime.m4a
- glass_tap_soft_01.wav
- glass_tap_soft_02.wav
- condensation_drag_loop_01.wav
- fireplace_room_base_01.wav
- fireplace_pop_01.wav
- sand_drag_loop_01.wav

If derivatives are created:
- rain_window_base_01_light.m4a
- rain_window_base_01_short.m4a
- glass_tap_soft_01_varA.m4a

---

# Recommended Audio Specs

These are target specs Claude Code should aim for unless project needs differ.

## Ambience
- 44.1kHz or 48kHz
- stereo preferred
- 45 to 90 seconds typical
- runtime-compressed format
- seamless loop if loopable

## Tap Sounds
- 0.2 to 1.5 seconds
- mono or stereo depending on realism
- low latency optimized
- multiple variants per category

## Drag Loops
- 1 to 5 seconds or continuous modulated loops
- smooth fade at loop boundaries
- low harshness

## One-Shots
- 0.5 to 4 seconds
- subtle and restrained
- never louder than the ambience context supports

---

# Quality Rules Claude Code Should Follow

## Rule 1
Do not assume every manually added file is production-ready.
Inspect and process first.

## Rule 2
Do not overprocess ambience into lifeless flatness.
Preserve warmth and realism.

## Rule 3
Do not let interaction sounds become too bright or harsh.

## Rule 4
Do not force AI-generated placeholders into final premium packs unless quality is clearly acceptable.

## Rule 5
Prioritize consistency across all packs.

---

# Decision Framework for Claude Code

When a needed audio asset is missing, use this order:

## Step 1
Check whether the user is expected to provide it manually because it is a high-value hero asset.

## Step 2
If not critical, determine whether an API-generated or synthetic placeholder is acceptable.

## Step 3
If generating or requesting a placeholder, mark it clearly in metadata as:
- placeholder
- generated
- needs replacement
if applicable.

## Step 4
Allow the app to function with the placeholder but keep upgrade path clear.

---

# Suggested Metadata Flags

Claude Code should support flags like:
- isHeroAsset
- isManualSource
- isGeneratedPlaceholder
- needsReplacement
- isLoopPrepared
- isPremium
- interactionCategory
- sceneId

These flags will keep the asset pipeline clean and scalable.

---

# Workflow Example

## Example: Rain Window
1. User manually adds:
   - rain on glass base loop
   - 6 glass taps
   - 2 drag sounds
   - 2 soft thunder one-shots

2. Claude Code then:
   - inspects and converts files
   - creates runtime versions
   - normalizes levels
   - prepares loop-safe files
   - assigns metadata
   - maps glass taps into anti-repeat system
   - wires rain loop to scene ambience
   - wires drag sounds to glass drag logic
   - sets thunder as low-frequency ambient one-shots

This is the ideal collaboration model.

---

# Implementation Tasks for Claude Code

## Task 1
Create an audio ingestion pipeline for manually added source assets.

## Task 2
Standardize format, naming, metadata, and output structure.

## Task 3
Create scene registries that separate hero assets, interactions, and one-shots.

## Task 4
Create runtime-optimized versions of manually supplied assets.

## Task 5
Build anti-repeat playback pools for repeated interaction categories.

## Task 6
Support placeholder/generated asset flags and replacement workflow.

## Task 7
Document which categories still need the user to source manually.

## Task 8
Integrate the processed assets into the ASMR scene system.

---

# Acceptance Criteria

This workflow is successful when:
- hero sounds are premium quality
- Claude Code handles the heavy processing and organization work
- generated assets are used only where appropriate
- the audio library remains organized and scalable
- the app sounds premium and consistent across scenes

---

# Final Instruction

Use a hybrid workflow.

The user will manually provide the highest-value audio assets.
Claude Code will transform those assets into a polished, optimized, production-ready audio system.

This is the recommended strategy because it protects quality while allowing speed and scale.

When deciding who should provide an asset, use this rule:

If a user would immediately notice if it sounded fake during a long listening session, the user should source it manually from a premium library.

If it is a support asset, variant, placeholder, or implementation-layer derivative, Claude Code should handle it.
