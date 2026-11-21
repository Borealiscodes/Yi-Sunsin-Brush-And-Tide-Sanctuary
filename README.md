# ⚓ Admiral Yi Sun-sin: Brush & Tide of the Imjin War (`v1.0.0`)

**A zero-dependency, neurodivergent-friendly historical naval tactics & Celestial Brush adventure chronicling Admiral Yi Sun-sin's four Imjin War engagements (Okpo, Hansando, Myeongnyang, and Noryang) through critically damped, channel-bound top-down fleet physics, accurate historical vessel counts, a 4-act escalating pentatonic *gayageum* & *shamisen* chamber score (`<= 740 Hz`), and 20 pre-rendered `en_GB-alan-medium` VITS narration cues (`1:1` FNV-1a parity).**

[![License: MIT](https://shields.io)](LICENSE)
[![Tests: 3/3 Passing](https://shields.io)](test/imjin-sanctuary.test.mjs)
[![VITS Narration: 20 Cues Pre-Rendered](https://shields.io)](audio/cues/manifest.json)
[![Sensory Envelope: <= 740 Hz + Brick-Wall](https://shields.io)](src/imjin-acoustic-engine.js)

---

## 📖 Companion Research Preprint & Plain-Language Explainer Tile

* **Preprint #7 (*Thirteen Ships Against the Tide: Iterative Engineering Refactors, Historical Reverence for Admiral Yi Sun-sin, and Comparative Naval Game Design*):** [`docs/admiral-yi-iterative-refactors-and-naval-mechanics-preprint.md`](docs/admiral-yi-iterative-refactors-and-naval-mechanics-preprint.md)
* **Plain-Language Explainer Tile (`Altitude A7` + Capstan Shanty):** [`tiles/bill-nye-naval-physics-and-pentatonic-cues-explainer.md`](tiles/bill-nye-naval-physics-and-pentatonic-cues-explainer.md)

---

## 🌊 Four Historical Naval Chapters (1592–1598)

Switch freely between all four engagements via the top battle tabs or keys **`1`–`4`**. Each chapter models historically proportional fleet counts (`24 vs 50`, `56 vs 73`, `13 vs 133`, `63 vs 500`), critically damped channel-bound ship steering (`getChannelBounds`), and a distinct historical finale:

| Chapter & Engagement | Historical Fleet Ratio | Tactical Celestial Brush Arc (`~`, `O`, `/`, `+`) | Distinct Historical Finale & Chamber Theme |
| :--- | :--- | :--- | :--- |
| **Act I** (`Key 1`)<br>**Battle of Okpo** *(May 1592)* | **24** Joseon *Panokseon* vs. **50** anchored transports | `1. WAVE (~)` Flood tide approach → `2. SLASH (/)` Seal harbor mouth → `3. CIRCLE (O)` Cove crescent pinch → `4. CROSS (+)` Fire-arrow barrage | **Flaming Fire Arrows (`bijeok`)** arcing into the anchored cove over a serene **Korean *Pyeongjo* pentatonic ostinato**. |
| **Act II** (`Key 2`)<br>**Battle of Hansando** *(Aug 1592)* | **56** Joseon warships (**3** *Geobukseon*) vs. **73** warships | `1. WAVE (~)` Feigned retreat → `2. CIRCLE (O)` Spring *Hakikjin* (Crane Wing) → `3. SLASH (/)` Turtle Ship charge → `4. CROSS (+)` Pincer encirclement | **Crane Wing (`Hakikjin`) U-encirclement** with **Joseon *Gayageum* vs. Japanese *Hirajoshi* *Shamisen* call-and-response**. |
| **Act III** (`Key 3`)<br>**Battle of Myeongnyang** *(Oct 1597)* | **13** Joseon *Panokseon* vs. **133** warships | `1. SLASH (/)` Anchor in Uldolmok gorge → `2. CIRCLE (O)` Hold defensive arc → `3. WAVE (~)` Uldolmok tidal reversal → `4. CROSS (+)` Down-current pursuit | **Surging Uldolmok Tidal Reversal** sweeping bottlenecked hulls back over an expressive minor ***Gyemyeonjo* score & *buk* drum**. |
| **Act IV** (`Key 4`)<br>**Battle of Noryang** *(Dec 1598)* | **63** Joseon warships (**4** *Geobukseon*) vs. **500** retreating vessels | `1. CIRCLE (O)` Midnight blockade → `2. WAVE (~)` Pre-dawn mist advance → `3. SLASH (/)` Turtle Ship breakthrough → `4. CROSS (+)` Sunrise war-drum cadence | **Concentric Golden War-Drum Shockwaves** radiating from Admiral Yi's flagship at sunrise over a dignified dawn processional. |

---

## 🎙️ 1:1 Embodied VITS Narration & Sensory Guardrails

* **20 Pre-Rendered `en_GB-alan-medium` VITS Cues (`audio/cues/`):** Generated via [`scripts/render_imjin_cues.py`](scripts/render_imjin_cues.py) and `.github/workflows/render-imjin-cues.yml` at a measured storyteller cadence (`--length-scale 0.96`, `--sentence-silence 0.42 s`), indexed `1:1` by 32-bit FNV-1a transcript digests (`src/fnv1a-hash.js`).
* **Keyboard, Button & Pointer Brush Parity:** Draw gestures directly on the `640×480` coastal chart or trigger maneuvers via high-contrast buttons and single keys (**`~` Wave**, **`O` Circle**, **`/` Slash**, **`+` Decisive Strike**).
* **Sensory-Safe Audio Envelope (`M` to Unmute):** Boots strictly muted, eliminates constant background drones in favor of decaying pentatonic silk-string plucks (`nonghyeon` pitch bends) and foreground brush plucks, filters all frequencies below **`740 Hz`**, and terminates with a **`DynamicsCompressorNode` brick-wall limiter** (`-18 dB` threshold, `20:1` ratio).
* **Reduced-Motion & Braille Progress Display:** Honors `prefers-reduced-motion` on boot, toggles sea/fleet motion via **`Space`**, and updates a **5-cell Unicode Braille progress meter (`U+2800–U+28FF`)** alongside `aria-live="polite"` historical captions.

---

## 🚀 Quickstart & Verification

```bash
# 1. Run deterministic classifier, 4-battle tactical & FNV-1a hash tests (3/3 passing)
node --test test/imjin-sanctuary.test.mjs

# 2. Launch locally over IPv4 in Chrome / Firefox
python3 -m http.server 8096 --bind 127.0.0.1
```

Open **`http://127.0.0.1:8096`** in your browser and tap **Unmute Strings & Drum (`M`)**.

---

## 🤝 Research Lineage & Provenance

Part of the open contemplative and accessible game-systems series by **Borealis Serenity Hedling** ([`Borealiscodes`](https://github.com) • `NDH-RESEARCH-PILOT` • Dublin 8, Ireland • ORCID: [`0009-0004-7968-5707`](https://orcid.org)):
* **Zenodo Preprints & Datasets:** [`10.5281/zenodo.24240994`](https://doi.org) • [`10.5281/zenodo.24393275`](https://doi.org) • [`10.5281/zenodo.24399123`](https://doi.org)
* **Ecosystem Toolkits & Sanctuaries:** [`ndh-game-dev-kit`](https://github.com/ndh-game-dev-kit) • [`ndh-retro-hw-pipeline`](https://github.com/ndh-retro-hw-pipeline) • [`Zen-Shodo-Koan-Brush-Sanctuary`](https://github.com/Zen-Shodo-Koan-Brush-Sanctuary) • [`Cosmic-Cello-Van-Gogh-Sanctuary`](https://github.com/Cosmic-Cello-Van-Gogh-Sanctuary)

**License:** MIT License • `Signed-off-by: Borealis Serenity Hedling <chguard-sentinel@vaked.dev>`
