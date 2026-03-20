# ASMR Sleep App — Build Brief (Claude Code)

## Goal
Create a calming, interactive ASMR app designed for sleep, relaxation, and daily use.
Focus on high-quality audio, simple interaction, and subscription monetization.

---

# Core Concept

“Playable ASMR for Sleep”

Users can:
- interact with calming objects
- trigger satisfying sounds
- build their own relaxing environment
- transition into sleep mode

---

# MVP Features

## 1. Scenes (3 to start)

### Scene 1: Rain Window
- rain hitting glass
- occasional thunder (very soft)
- tap glass → subtle tapping sounds

### Scene 2: Cozy Room
- fireplace crackle
- soft ambient hum
- tap objects → wood / fabric sounds

### Scene 3: Sand Table
- drag finger → sand movement sound
- smooth, continuous audio

---

## 2. Interaction System

- tap → trigger sound
- drag → continuous ASMR loop
- hold → layered sound

Keep interactions:
- slow
- responsive
- non-intrusive

---

## 3. Sleep Timer

Options:
- 5 min
- 10 min
- 30 min
- 1 hour

Behavior:
- gradual volume fade
- optional screen dim

---

## 4. Sound Mixer (Simple V1)

Allow:
- adjust volume per sound
- combine 2–3 sounds

---

# Audio Requirements

Use high-quality stereo audio.

Search terms:
- soft tapping
- rain on glass
- fireplace crackle
- fabric brushing
- sand movement
- water drip

Rules:
- no harsh peaks
- seamless loops
- normalized volume

---

# Visual Direction

Use Three.js scenes:

- soft lighting
- minimal movement
- calming colors

Optional:
- skybox backgrounds (night sky, rain, cozy interior)

---

# Monetization

## Primary: Subscription

- $4.99/month
- $29.99/year

## Free Tier
- 1–2 scenes
- basic sounds
- limited timer

## Paid Tier
- all scenes
- premium sounds
- unlimited mixer
- advanced timers

---

# UI Structure

## Home Screen
- scene selection
- “Start Relaxing” button

## Scene Screen
- main interaction view
- timer button
- sound controls

## Settings
- timer presets
- volume
- subscription

---

# Suggested File Structure

- src/scenes/
- src/audio/
- src/ui/
- src/systems/SleepTimer.ts
- src/systems/SoundManager.ts

---

# Implementation Tasks

## Task 1
Create base scene system

## Task 2
Implement audio manager (loop + layering)

## Task 3
Add interaction handlers (tap, drag)

## Task 4
Build sleep timer with fade-out

## Task 5
Create simple UI

## Task 6
Integrate subscription logic

---

# Acceptance Criteria

- audio is smooth and calming
- interactions feel natural
- app can run for long sessions
- sleep timer works reliably
- UI is minimal and clean

---

# Final Instruction

Focus on:
- simplicity
- high-quality audio
- calming experience

This app should feel like a daily habit, not a game.
