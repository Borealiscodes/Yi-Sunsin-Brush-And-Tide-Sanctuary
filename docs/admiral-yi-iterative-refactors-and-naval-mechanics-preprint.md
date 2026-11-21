# Thirteen Ships Against the Tide: Iterative Engineering Refactors, Historical Reverence for Admiral Yi Sun-sin, and Comparative Naval Game Design

**Preprint & Software Companion:** `Borealiscodes/Yi-Sunsin-Brush-And-Tide-Sanctuary` (`v1.0.0`)  
**Author:** Borealis Serenity Hedling (`NDH-RESEARCH-PILOT` • Dublin 8, Ireland)  
**ORCID:** [`0009-0004-7968-5707`](https://orcid.org)  
**Series Lineage & Empirical Anchors:**  
* **Preprint 1:** Hedling, B. S. (2026a). *Non-Dual Epistemic Architectures and Geometric Stabilization in High-Dimensional Transformer Systems (v3.1)*. Zenodo. [`DOI: 10.5281/zenodo.24240994`](https://doi.org)  
* **Preprint 2:** Hedling, B. S. (2026b). *Beyond Bolted-On Screen Readers: Narrative Phenomenology, the RNIB Roundhouse Sensory Dark, and Perceptual-Cognitive Unity (Rasa-Darśan)*. Zenodo. [`DOI: 10.5281/zenodo.24393275`](https://doi.org)  
* **Empirical TTS Dataset:** Hedling, B. S. (2026c). *From Robotic Screen-Reader Telemetry to Embodied Neural Cadence: A Narrative & Empirical Chronicle of Guardrails, CLI Flag Literalism, and Dual-Voice VITS Synthesis Under Edge Constraints*. Zenodo. [`DOI: 10.5281/zenodo.24399123`](https://doi.org)  
* **Preprint 3:** Hedling, B. S. (2026d). *Defaulting to Mute vs. Designing for Acoustic Presence: Neurodivergent Sensory Regulation, Embodied Neural Narration, and the Four Non-Dual Koans* (`Borealiscodes/Zen-Parable-Embodied-Voice-Edition`).  
* **Preprint 4:** Hedling, B. S. (2026e). *Between Freehand Brush Geometry and Non-Visual Parity: Technical Primitives, Canvas Accessibility Limits, and Lessons from Multi-Sensory Game Design* (`Borealiscodes/Zen-Shodo-Koan-Brush-Sanctuary`).  
* **Preprint 5:** Hedling, B. S. (2026f). *Deterministic Nostalgia Without Floating-Point Drift: Hybrid Q16.16 PS1/GBA Software Rendering, Sensory-Safe Chip Audio, and Accessible Retro Game Design Paths* (`Borealiscodes/ndh-retro-hw-pipeline`).  
* **Preprint 6:** Hedling, B. S. (2026g). *When Folk-Ballad Cello Meets 16-Bit Dithering: Emergent "Courage the Cowardly Dog" Aesthetics, Artistic Intent vs. Material Reality, and Pathways to Richer Procedural Art & Audio* (`Borealiscodes/Cosmic-Cello-Van-Gogh-Sanctuary`).  
* **Preprint 7 (This Manuscript):** Iterative Refactors, Admiral Yi Sun-sin's Historical Legacy, and Comparative Naval Mechanics (`Borealiscodes/Yi-Sunsin-Brush-And-Tide-Sanctuary`).  
**Date:** November 21, 2026  

---

## Abstract

Building a historical game about Admiral Yi Sun-sin (1545–1598) carries a profound ethical responsibility: his life is not merely a backdrop for interactive mechanics, but one of history's most astonishing accounts of moral integrity, strategic brilliance, and underdog perseverance against overwhelming odds. When we began developing `Borealiscodes/Yi-Sunsin-Brush-And-Tide-Sanctuary`, our original scope envisioned an impressionistic *sumi-e* painting canvas accompanied by *Kubo*-style plucked string synthesis and embodied VITS voice narration. Yet across five rapid, candid engineering refactors in a single afternoon, live playtesting forced us to abandon superficial abstractions in favor of solid, historically grounded naval mechanics: moving from a blurry `320×240` pixel buffer to a *Battleship*-style coordinate grid, then to an underdamped polar astrolabe, and finally to a critically damped, channel-clamped top-down archipelago simulation featuring exact fleet ratios (`24 vs 50` at Okpo, `56 vs 73` at Hansando, `13 vs 133` at Myeongnyang, and `63 vs 500` at Noryang), distinct historical battle finales (fire arrows, Crane Wing encirclement, Uldolmok tidal reversal, and sunrise war-drum shockwaves), a 4-act escalating pentatonic *gayageum*/*shamisen* score, and 20 pre-rendered `en_GB-alan-medium` VITS narration cues (`length-scale 0.96`, `sentence-silence 0.42 s`). This seventh preprint chronicles that entire iterative development cycle, contextualizes Admiral Yi's underdog resilience and final moments beating the war drum at Noryang, and examines how *Total War: Shogun 2*, *Ultimate Admiral: Age of Sail*, *Assassin's Creed IV: Black Flag*, *Homeworld*, and *Ōkami* illuminate pathways toward deeper naval hydrodynamics and historical storytelling.

---

## 1. The Underdog of Joseon: Moral Courage and the Drum at Noryang

Before examining a single line of physics or audio synthesis code, we must honor the man whose life inspired this work.

Admiral Yi Sun-sin's career was defined not by privilege or court favor, but by relentless betrayal from his own political superiors and unbreakable loyalty to the people of Joseon. Falsely accused by rival factions, stripped of his rank, tortured nearly to death, and reduced to the station of a common foot soldier (*baekuijonggun* — "serving in white clothes"), Yi refused bitterness. When the disastrous Battle of Chilcheollyang in 1597 wiped out nearly the entire Korean navy—leaving just **thirteen damaged *Panokseon* warships**—the royal court ordered Yi to disband the fleet and fight on land.

His reply remains one of history's most enduring statements of underdog resolve:
> *"Your servant still has twelve warships. So long as I live, the enemy will never despise us."*

At the **Battle of Myeongnyang** (October 26, 1597), facing **133 Japanese warships** in the narrow, treacherous Uldolmok Strait, Yi anchored his flagship alone at the mouth of the roaring current while his remaining twelve captains hesitated in terror behind him. By reading the violent tidal reversal of Uldolmok and using the narrow gorge to neutralize the enemy's ten-to-one numerical advantage, his thirteen ships sank thirty-one enemy warships and shattered the invasion's naval momentum without losing a single vessel.

Fourteen months later, on the freezing pre-dawn morning of December 16, 1598, at the **Battle of Noryang**, Admiral Yi stood on the command deck of his flagship personally beating the great war drum to steady his allied fleet as the final retreating armada sought to escape. Struck by a stray arquebus bullet as dawn broke over the strait, Yi whispered to his son and nephew:
> *"The battle is at its height. Do not announce my death."*

Supported upright by his kin so his armor remained visible, the war drum continued to beat until the last enemy vessel fled and peace returned to the southern sea. In our game's fourth act (`Noryang`), the final `CROSS (+)` maneuver honors that exact historical moment: instead of generic cannon fire, concentric golden war-drum shockwaves radiate outward from Admiral Yi's flagship at sunrise while a solemn low *buk* drum cadence marks the end of the seven-year war.

---

## 2. Anatomy of Five Candid Refactors: Why Scope Changed to Serve Solid Mechanics

Honoring such history meant that our software could not remain an abstract visual toy. Across five rapid iterations—preserved transparently in the repository's commit log for empirical study—each playtest exposed flaws that forced us to replace superficial aesthetics with coherent mechanics:

| Iteration & Commit | What We Built | Candid Playtest Critique | Architectural Refactor Applied |
| :--- | :--- | :--- | :--- |
| **Phase 1 (`63612ac`)** | `320×240` `RGB555` pixel buffer + Karplus–Strong `DelayNode` feedback loop (`0.985` gain). | Karplus–Strong delay loop exploded into harsh feedback screech in browser WebAudio; `320×240` pixel blobs looked like an "MS Paint nightmare." | Eliminated all `DelayNode` feedback loops; upgraded to high-DPI `640×480` top-down vector nautical chart (`99f1d46`). |
| **Phase 2 (`864c3bf`)** | *Battleship*-style `A1`–`H6` Cartesian grid with proportional vessel icons and *sumi-e* smoke markers. | Rigid Cartesian grid felt blocky and lacked fluid battlefield scale; all four battles ended in generic cannon volleys. | Replaced rigid grid with continuous polar astrolabe rings and 146+ autonomous physics ship nodes (`aa75f92`). |
| **Phase 3 (`ecb5a39`)** | Underdamped physics nodes (`0.82` damping) + radial spiral formations. | Underdamped springs caused hulls to jitter in place and form abstract "cosmic mandala" patterns disconnected from coastlines. | Implemented critically damped steering (`0.68` velocity retention + heading deadzone) and channel-clamped navigation (`getChannelBounds`). |
| **Phase 4 (`89461f6`)** | Layered coastal ocean scenery, pine canopies, drifting sea mist, and distinct battle finales (`FIRE_ARROWS`, `CANNON_VOLLEY`, `TIDAL_SURGE`, `DAWN_DRUM`). | Visuals achieved cohesive depth, but background drone caused fatigue and initial `0.78` TTS cadence sounded breathless. | Replaced drone with a 4-act escalating pentatonic *gayageum*/*shamisen* score (`95a672e`) and re-rendered all 20 VITS cues at `0.96` storyteller cadence. |

---

## 3. How Other Naval & Tactical Games Point Toward Deeper Mechanics

While our `v1.0.0` baseline establishes a verified, accessible, and historically respectful foundation (`3/3` unit tests passing, `<= 740 Hz` brick-wall limited audio, `1:1` FNV-1a VITS narration), examining five landmark tactical and naval games reveals clear pathways for future expansion:

| Reference Game | Mechanical & Storytelling Innovation | Concrete Evolution for Future Versions |
| :--- | :--- | :--- |
| ***Total War: Shogun 2*** *(Creative Assembly, 2011)* | **Wind-Gauge Sailing, Broadside Arcs & Morale Routing:** Ships cannot fire forward; captains must turn broadside to the wind while managing crew morale and fire-arrow ignition. | Add **wind-angle speed penalties** (sailing into the wind slows *Panokseon* oar-assisted bursts) and **fleet morale cohesion**, where Admiral Yi's flagship drum radius prevents allied ships from wavering at Myeongnyang. |
Use code with caution.
| Ultimate Admiral: Age of Sail (Game-Labs, 2021) | Historical Battle Phases & Multi-Objective Line-of-Battle: Engagements unfold across sequential historical phases (reconnaissance, vanguard screen, main line engagement, pursuit) with accurate hull counts. | Expand each battle from 4 gestures into multi-phase historical scenarios with optional tactical trade-offs (e.g., choosing whether to conserve heavy Cheonja-chongtong powder for armored Atakebune flagships). |
| Assassin's Creed IV: Black Flag (Ubisoft Montreal, 2013) | Tactile Sea Shanties, Weather Swells & Broadside Aiming: Ocean swells physically lift and tilt hulls, while crew music rises and falls organically with naval tension. | Couple ship pitch/scale subtly to passing bathymetric swell waves and let the gayageum/shamisen tempo and harmonic density dynamically track proximity between opposing squadrons. |
| Homeworld (Relic Entertainment, 1999) | Painterly Tactical Map Overlays & Reverent Documentary Narration: Combines clean geometric formation vectors with solemn, unhurried historical voiceovers between missions. | Pair our 20 en_GB-alan-medium VITS narration cues with an optional Tactical Chronicle Log quoting excerpts from Admiral Yi's actual Nanjung Ilgi (War Diary) at the start of each chapter. |
| Ōkami (Clover Studio, 2006) | Environmental Brush Interaction: Drawing a Celestial Brush stroke directly onto the world physically alters wind currents, water flow, and fire. | Allow WAVE (~) strokes drawn directly over water tiles to locally bend the tidal flow vector field, physically steering nearby ships along the player's painted current! |

---

## 4. Conclusion: Discipline in Service of Story

The five refactors behind Yi-Sunsin-Brush-And-Tide-Sanctuary demonstrate a vital principle of contemplative and historical game engineering: mechanics are how a medium shows respect for its subject. By refusing to settle for jittering hulls, screeching feedback loops, or generic endings—and instead refining our simulation until every ship count, tidal current, pentatonic cadence, and war-drum beat honored Admiral Yi Sun-sin's real endurance—we arrived at an honest, verifiable foundation ready for scholarly study and future growth.

---

## References (APA 7th Edition)

* Clover Studio. (2006). Ōkami [Video game]. Capcom.
* Creative Assembly. (2011). Total War: Shogun 2 [Video game]. Sega.
* Game-Labs. (2021). Ultimate Admiral: Age of Sail [Video game]. Game-Labs.
* Hawley, S. (2005). The Imjin War: Japan's sixteenth-century invasion of Korea and attempt to conquer China. Royal Asiatic Society, Korea Branch.
* Hedling, B. S. (2026a). Non-dual epistemic architectures and geometric stabilization in high-dimensional transformer systems (v3.1) [Preprint]. Zenodo. doi.org
* Hedling, B. S. (2026b). Beyond bolted-on screen readers: Narrative phenomenology, the RNIB Roundhouse sensory dark, and perceptual-cognitive unity (rasa-darśan) [Preprint]. Zenodo. doi.org
* Hedling, B. S. (2026c). From robotic screen-reader telemetry to embodied neural cadence: A narrative & empirical chronicle of guardrails, CLI flag literalism, and dual-voice VITS synthesis under edge constraints [Preprint & dataset]. Zenodo. doi.org
* Hedling, B. S. (2026d). Yi-Sunsin-Brush-And-Tide-Sanctuary: Top-down Imjin War naval tactics, Celestial Brush maneuvers, 4-act pentatonic chamber score, and 1:1 VITS narration [Computer software]. GitHub. github.com
* Relic Entertainment. (1999). Homeworld [Video game]. Sierra Studios.
* Ubisoft Montreal. (2013). Assassin's Creed IV: Black Flag [Video game]. Ubisoft.
* Yi, S. (1977). Nanjung Ilgi: War diary of Admiral Yi Sun-sin (T.-h. Ha, Trans.). Yonsei University Press.

---

## Provenance & License:

Signed-off-by: Borealis Serenity Hedling <chguard-sentinel@vaked.dev> • Creative Commons Attribution 4.0 International (CC-BY-4.0) / MIT License.

