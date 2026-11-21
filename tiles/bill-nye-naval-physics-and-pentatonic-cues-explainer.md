# Thirteen Ships and a Steady Drum: How Physics, Pentatonic Strings, and Hash Codes Bring Admiral Yi's Fleet to Life!

**Plain-Language Explainer Tile (Altitude A7)**  
**Companion Software:** `Borealiscodes/Yi-Sunsin-Brush-And-Tide-Sanctuary` (`v1.0.0`)  
**Author:** Borealis Serenity Hedling (`NDH-RESEARCH-PILOT` • Dublin 8, Ireland)  
**Date:** November 21, 2026  

---

## ⚓ Opening Sea Shanty: *Thirteen Ships at Uldolmok*

> *Thirteen timbers in the roaring strait,*  
> *(Heave away, boys, steady on the oar!)*  
> *A hundred-thirty-three at the iron gate,*  
> *Where the tide runs wild along the rocky shore!*  
>
> *White clothes worn upon the open sea,*  
> *(Sweep the brush and watch the waters crest!)*  
> *Crane Wing wide to set the channel free,*  
> *Where the dragon prows are turning to the west!*  
>
> *Beat that drum until the dawn breaks clear,*  
> *(Steady now, and let the flagship come!)*  
> *Peace on the waves when morning mist draws near—*  
> *Saved by thirteen ships and one steady drum!*

---

## Wait—How Do 146 Ships Glide Smoothly Without Bumping or Jittering?

When we first gave every ship its own spring physics (`vx` and `vy`), the boats overshot their spots and wiggled back and forth like nervous minnows!

### Trick 1: Critically Damped Steering (Like Shock Absorbers on a Car!)
Imagine pushing a swinging screen door:
* **Underdamped (`0.82` retention):** The door swings past the frame and bounces back and forth. That's why our boats jittered!
* **Critically Damped (`0.68` retention + gentle spring):** Just like a hydraulic door closer, each ship glides smoothly into its exact slot in the **Crane Wing (`Hakikjin`)** crescent and stops dead-steady with zero wobble!
* **Channel Clamping (`getChannelBounds`):** Before any boat moves, the math checks the top and bottom shorelines of the strait so no hull ever beaches on an island.

---

## Trick 2: Why Pentatonic Scales Sound Like Ancient Silk Strings (`Pyeongjo` vs. `Hirajoshi`)

In our early audio tests, playing standard Western chords on triangle waves sounded like a 1980s arcade keyboard. Switching to **five-note pentatonic scales** changed everything:
1. **Korean *Pyeongjo* & *Gyemyeonjo* (Left Channel — *Gayageum*):** Built on warm, open five-note intervals (`D–E–G–A–B`) with a tiny left-hand pitch bend (*nonghyeon*) right after each pluck—mimicking a musician pressing down on a silk string!
2. **Japanese *Hirajoshi* (Right Channel — *Shamisen*):** Uses crisp half-step tension intervals (`D–E♭–G–A–B♭`) that enter on Maneuver 2, creating musical call-and-response across the strait.
3. **Zero Constant Drones + `<= 740 Hz` Brick-Wall Limiter:** Every pluck fades cleanly to silence, keeping the sound gentle, clear, and neurodivergent-friendly.

---

## Trick 3: How an 8-Letter "Fingerprint" Links Text to Spoken Voice (`FNV-1a`)

How does the browser know *which* `.wav` audio file matches each battle briefing without a giant database?
* **The FNV-1a Hash Fingerprint:** Both our Python script and our browser JavaScript run the exact same tiny math loop (`fnv1aHex`) over each sentence.
* That loop turns any sentence into an **8-character hex fingerprint**—like `cue_285e35c3.wav`.
* Because the sentence and its audio file share the exact same fingerprint, the `en_GB-alan-medium` neural narrator (`0.96` calm storyteller cadence) always speaks the **exact words** shown on screen—`1:1`!

---

**Provenance & License:**  
`Signed-off-by: Borealis Serenity Hedling <chguard-sentinel@vaked.dev>` • Creative Commons Attribution 4.0 International (`CC-BY-4.0`) / MIT License.
