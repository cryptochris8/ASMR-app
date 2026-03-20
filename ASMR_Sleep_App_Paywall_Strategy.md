# ASMR Sleep App — Subscription Paywall Strategy (Claude Code)

## Goal
Design and implement a calm, high-converting subscription paywall for the ASMR sleep app.

The paywall should:
- feel premium
- clearly explain the value
- avoid aggressive pressure
- maximize free-to-paid conversion
- support monthly and yearly plans

---

# Core Monetization Model

## Primary Revenue Model
Subscription

## Recommended Plans
- Monthly: $4.99
- Yearly: $29.99

## Positioning
Yearly should be framed as the best value.

## Optional Future Plan
- Lifetime unlock: $39.99 to $59.99

Do not prioritize lifetime in MVP unless specifically desired.

---

# Paywall Philosophy

This is not a game paywall.
It should not feel loud, urgent, or manipulative.

The correct tone is:
- calm
- premium
- supportive
- restorative

The user should feel:
“This will improve my sleep experience.”

---

# Primary Value Proposition

Premium should unlock:

- all sound scenes
- premium ambient packs
- unlimited sleep timers
- unlimited saved mixes / presets
- exclusive calming environments
- future premium content updates

Optional positioning:
- “built for nightly sleep routines”
- “new premium scenes added over time”

---

# Recommended Paywall Triggers

## Best Triggers
1. user taps a premium scene
2. user tries to save more than one preset
3. user finishes a positive first session
4. user returns for second or third session
5. user tries to unlock advanced mixer features

## Avoid
- instant paywall on first app open
- interrupting a relaxing session
- too many repeated prompts

---

# Paywall Layout

## Top Section
- calming artwork or subtle animated scene
- short, strong headline

Suggested headlines:
- “Sleep Better With Premium”
- “Unlock the Full Sleep Experience”
- “Go Deeper Into Relaxation”

## Middle Section
Use 3 to 5 benefit bullets.

Suggested bullets:
- Unlock every calming scene
- Save unlimited custom sleep mixes
- Access exclusive premium sounds
- Use advanced timers and sleep tools
- Enjoy future content updates

## Plan Section
Display:
- Monthly plan
- Yearly plan with “Best Value” badge

## Bottom Section
- continue free option
- restore purchases
- privacy / terms links

---

# Recommended Copy

## Headline Options
- “Unlock the Full Sleep Experience”
- “Relax Without Limits”
- “Your Nightly Calm, Upgraded”

## Subheadline Options
- “Premium scenes, better sleep tools, and unlimited presets.”
- “Everything you need for a more relaxing bedtime routine.”
- “Built for deep relaxation, every night.”

## CTA Options
- “Start Premium”
- “Unlock Premium”
- “Try Premium”
- “Continue With Premium”

---

# Offer Presentation

## Recommended Default Highlight
Yearly plan highlighted with:
- “Best Value”
- “Save 50%”
- “Most Popular”

## Plan Example Display
- $4.99 / month
- $29.99 / year — Best Value

If savings claim is shown, ensure math is accurate.

---

# Free Tier Positioning

Let users continue for free.

This is important for trust and conversion later.

## Free Tier Should Include
- 1 to 2 scenes
- basic timer options
- limited sound layers
- limited saved preferences

## Premium Tier Adds
- all scenes
- full mixer
- presets
- premium sound packs
- advanced tools

This contrast should be visible and easy to understand.

---

# Psychological Conversion Levers

## 1. Calm Confidence
Do not pressure.
Instead, make premium feel like the natural next step.

## 2. Immediate Tangible Benefits
Users should instantly understand what unlocks.

## 3. Habit Framing
Position premium as part of a nightly routine.

Examples:
- “Create your perfect bedtime mix”
- “Set the mood for better sleep every night”

## 4. Simplicity
Do not overload with too many features or too much copy.

---

# Best Moments to Present the Paywall

## High Intent Moments
- user taps locked premium scene
- user tries to save custom mix
- user uses timer and returns another night
- user favorites content and wants more

## Soft Prompt Moments
- after first relaxing session:
  - “Unlock more scenes for tonight’s routine”

---

# UI Guidelines

## Visual Style
- dark mode friendly
- warm, low-contrast premium look
- soft gradients
- rounded cards
- subtle shadows
- minimal motion

## Avoid
- flashing urgency
- countdown timers
- red warning colors
- aggressive discount popups

---

# Suggested Screen Structure

1. calming hero artwork
2. headline + subheadline
3. feature bullets
4. plan cards
5. CTA button
6. continue free
7. restore purchases / terms

---

# CTA Hierarchy

## Primary CTA
Subscription action

## Secondary CTA
Continue free

## Tertiary
Restore purchases

Users should always feel they can leave gracefully.

---

# A/B Test Ideas (Later)

## Headline tests
- “Unlock the Full Sleep Experience”
- “Sleep Better With Premium”

## Trigger tests
- locked scene trigger
- second-session prompt
- post-session prompt

## Plan emphasis tests
- monthly default
- yearly default

Do not overcomplicate this until traffic exists.

---

# Implementation Requirements for Claude Code

## Task 1
Create PremiumPaywall component with reusable structure.

## Task 2
Add monthly and yearly plan cards.

## Task 3
Add premium feature list and benefit copy.

## Task 4
Add “Continue Free” and “Restore Purchases” flows.

## Task 5
Trigger paywall only at logical high-intent moments.

## Task 6
Persist subscription state and hide locked states appropriately.

## Task 7
Style paywall to match calm visual language of the app.

---

# Acceptance Criteria

The paywall is successful when:
- it clearly explains premium value in under 10 seconds
- users can exit without frustration
- yearly plan is easy to identify as best value
- premium scenes and features are correctly gated
- the design feels premium, calm, and trustworthy

---

# Final Instruction

Build this paywall to feel like a helpful upgrade to a relaxing routine.

It should feel like:
- quality
- comfort
- better sleep

Not:
- pressure
- noise
- friction
