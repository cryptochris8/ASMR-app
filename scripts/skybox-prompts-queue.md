# Skybox Generation Queue

Five prompt-ready atmospheres for Blockade Labs Skybox AI. Each is deliberately distinct from the others *and* from our existing library (rain-window, cozy-room, sand-table, temple-zen, library-nook, fireplace-cabin, etc.). Every prompt is built around 5-6 clear interactive objects so we can apply the hotspot pattern.

## Workflow per prompt

1. Paste the **Style + Prompt + Negative text** into Skybox AI
2. Generate, review, regenerate if hotspot objects aren't visible enough
3. Save as `public/skybox/<slug>.jpg` (suggested slugs below)
4. Tell Claude the slug — we add a SceneDef, scaffold the Scene class, and start the per-skybox rollout (silent audition → audio discussion → spec → gen → audition → commit)

## Status

- [ ] 1. Vintage train compartment — `train-compartment.jpg`
- [ ] 2. Antique clockmaker's workshop — `clockmaker-workshop.jpg`
- [x] 3. Mystical apothecary shop — `apothecary-shop.jpg` *(complete: 6 hotspots + 20 ElevenLabs assets + Gymnopédie harp music)*
- [ ] 4. Japanese onsen bathhouse — `onsen-bath.jpg`
- [ ] 5. Old lighthouse lamp room — `lighthouse-lamp.jpg`

---

## 1. Vintage Train Compartment at Night

**Atmosphere**: motion + rain + warm leather. The "Hercule Poirot in a sleeper car" vibe.

**Style**: Photoreal

**Prompt**:
> A vintage 1920s sleeper train compartment at night, warm interior light from a single brass oil lamp on the wood-paneled wall, large window on the right showing heavy rain streaking down the glass and distant city lights blurring past in the dark, deep burgundy leather bench seats facing each other, a small folding mahogany table between them with an open leather-bound notebook and a porcelain teacup on a saucer, polished brass luggage rack overhead with a worn leather suitcase, intimate close perspective inside the cabin, photoreal cinematic mood, no people

**Negative text**:
> people, person, text, signs, modern technology, screens, harsh light, daylight, brand logos, characters, faces

**Intended hotspots** (6):
1. Window — rain on glass + faint train rumble
2. Oil lamp — gentle flame hiss + glass tink
3. Leather seat — soft squeak
4. Mahogany table — fingertip wood tap
5. Notebook — page rustle / pen scratch
6. Teacup — ceramic clink + tiny stir

---

## 2. Antique Clockmaker's Workshop at Midnight

**Atmosphere**: tick-heavy ASMR classic. Dozens of clocks softly ticking in asynchrony — a sound texture that's hugely popular in ASMR-for-sleep but missing from our library.

**Style**: Photoreal

**Prompt**:
> A cozy antique clockmaker's workshop at midnight, dimly lit by a single brass desk lamp with a green glass shade, walls lined with dozens of pendulum wall clocks and grandfather clock faces, a heavy aged wooden workbench in the foreground covered in tiny brass gears and clock springs, miniature screwdrivers, two magnifying loupes, a half-disassembled gold pocket watch on a velvet cloth, small glass jars of springs, an open ledger book with handwritten notes, worn brown leather stool, dark wood-paneled walls, intimate close perspective at the workbench, photoreal cinematic mood, no people

**Negative text**:
> people, person, text on clock faces, modern electronics, screens, harsh light, daylight, characters, faces

**Intended hotspots** (6):
1. Pendulum wall clocks — ambient baseline of soft asynchronous ticks
2. Pocket watch — delicate single tick + winding click
3. Brass gears — tiny metallic clink
4. Magnifying loupe — glass tap
5. Ledger book — page turn
6. Wooden workbench — soft knuckle thud

---

## 3. Mystical Apothecary / Herbalist Shop at Twilight

**Atmosphere**: warm fantasy, bubbling cauldron, glass jars, hanging herbs. ASMR-friendly mystical vibe without going full witch.

**Style**: Fantasy

**Prompt**:
> A mystical herbalist apothecary shop at twilight, warm candlelight and the soft amber glow of a small bubbling copper cauldron on a wooden counter, walls covered floor to ceiling with dark wooden shelves holding hundreds of glass apothecary jars filled with dried herbs colorful liquids and small crystals, bundles of dried flowers and lavender hanging from wooden ceiling beams, a heavy stone mortar and pestle on the counter beside an open leather-bound spell book with worn parchment pages, a small brass weighing scale, beeswax candles in wrought iron holders, a worn persian rug on a stone floor

**Negative text**:
> people, person, witch, character, face, text, harsh light, daylight, modern items, screens, fairies, brand logos, sigils

**Intended hotspots** (6):
1. Cauldron — gentle bubbling loop (tap-to-toggle, like a sticky element)
2. Glass jar — soft clink
3. Mortar and pestle — slow grinding loop on hold
4. Hanging herb bundles — dried-leaf rustle
5. Spell book — heavy parchment page turn
6. Brass scale — delicate metallic tip/tap

**Final hotspots after skybox audition** (Skybox AI gave us no cauldron but a forest of beeswax candles, so we swapped):
1. Brass jars (wall, left)
2. Spell book (open on table, center)
3. Beeswax candles (foreground cluster) — sticky tap-to-toggle for sustained candle-flicker loop, replaces the cauldron's role
4. Hanging herbs / lavender (right, by the stone window)
5. Brass scale (right windowsill)
6. Mortar / small dish (foreground)

---

## 4. Japanese Onsen Bathhouse Interior at Night

**Atmosphere**: water-rich, warm, intimate. Different from temple-zen (which is exterior courtyard) — this one is *inside* a steamy wooden bathhouse, water-focused.

**Style**: Photoreal

**Prompt**:
> A traditional Japanese onsen indoor bathhouse at night, dark cypress wood walls and floor with soft steam rising from a sunken stone bathing pool in the center, a small bamboo shishi-odoshi fountain in the corner trickling water into a smooth stone basin, neatly folded white cotton towels on a low cedar shelf, a polished wooden bucket and bamboo ladle on the pool edge, a single paper shoji lantern casting warm soft amber light, a round window showing deep blue night and silhouetted bamboo, intimate close perspective at the pool's edge, photoreal serene mood, no people

**Negative text**:
> people, person, swimsuits, text, modern fixtures, soap bottles, harsh light, daylight, screens, characters, faces

**Intended hotspots** (5):
1. Pool — gentle water lap on hold
2. Bamboo shishi-odoshi fountain — rhythmic water trickle + occasional bamboo clack
3. Wooden bucket — hollow wood thud
4. Folded towels — soft fabric brush
5. Stone basin — single water drip

---

## 5. Old Lighthouse Lamp Room at Night

**Atmosphere**: coastal isolation, slow brass mechanism, distant ocean. A maritime ASMR scene we don't have.

**Style**: Photoreal

**Prompt**:
> The interior lamp room of an old stone lighthouse at night, warm glow from the enormous central brass and crystal Fresnel lens slowly rotating in the middle of the room, a wooden keeper's desk near a tall narrow window holding an open leather-bound logbook with a quill pen and brass inkwell, an old wooden barometer and brass ship's clock on the rough stone wall, a heavy brass spyglass on a wooden tripod aimed out the window showing dark stormy ocean and a faint ship light, a coil of thick rope on an iron hook, an oil lamp on the desk, photoreal cinematic mood, no people

**Negative text**:
> people, person, text, modern equipment, electronics, screens, harsh light, daylight, brand logos, characters, faces

**Intended hotspots** (6):
1. Fresnel lens mechanism — slow brass gear creak (sticky tap-to-toggle, like the speaker in cozy-room)
2. Logbook — quill scratch / page turn
3. Barometer — delicate metallic tap
4. Brass spyglass — extension click + barrel scrape
5. Oil lamp — soft flame hiss + glass tap
6. Coiled rope — rope creak / fiber rustle

---

## Notes for generating

- **If a hotspot object isn't clearly visible** in the resulting skybox, regenerate. We need the user to recognize each interactive object at a glance.
- **Camera framing matters**: prompts ask for "intimate close perspective" because Blockade tends to default to wider shots that make foreground objects too small.
- **Skybox AI sometimes ignores object lists** — if it gives you a beautiful room missing key items, paraphrase and regenerate (e.g., "make sure the brass spyglass on a tripod is clearly visible in the foreground").
- **Negative text is forgiving** — repeat key avoidances ("no people, no text") in both the main prompt and the negative text field for stronger effect.
