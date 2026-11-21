import test from "node:test";
import assert from "node:assert/strict";
import { classifyBrushStrokes } from "../src/brush-classifier.js";
import { NAVAL_BATTLES, createTacticalState, applyTacticalGesture, tacticalProgressBraille } from "../src/imjin-kernel.js";
test("1. Brush classifier recognizes WAVE, CIRCLE, SLASH, and CROSS", () => {
const wave = Array.of();
for (let i = 0; i <= 20; i += 1) wave.push({ x: 20 + i * 10, y: 100 + Math.sin((i / 20) * Math.PI * 2) * 35 });
assert.equal(classifyBrushStrokes(Array.of(wave)), "WAVE");
const circle = Array.of();
for (let i = 0; i <= 24; i += 1) {
const a = (i / 24) * Math.PI * 2;
circle.push({ x: 100 + Math.cos(a) * 50, y: 100 + Math.sin(a) * 50 });
}
assert.equal(classifyBrushStrokes(Array.of(circle)), "CIRCLE");
assert.equal(classifyBrushStrokes(Array.of(Array.of({ x: 20, y: 20 }, { x: 80, y: 80 }, { x: 140, y: 140 }))), "SLASH");
assert.equal(classifyBrushStrokes(Array.of(Array.of({ x: 50, y: 100 }, { x: 150, y: 100 }), Array.of({ x: 100, y: 50 }, { x: 100, y: 150 }))), "CROSS");
});
test("2. All four top-down naval battles execute Crane Wing & Turtle Ship maneuvers cleanly", () => {
for (let b = 0; b < NAVAL_BATTLES.length; b += 1) {
let st = createTacticalState(b);
for (const turn of NAVAL_BATTLES.at(b).turns) {
st = applyTacticalGesture(st, turn.shape);
}
assert.equal(st.battleIndex, b);
assert.equal(st.isVictory, true);
assert.equal(tacticalProgressBraille(st).length, 5);
}
});

import { fnv1aHex, cueUrlForText } from "../src/fnv1a-hash.js";

test("3. FNV-1a transcript digest produces deterministic 1:1 cue filenames", () => {
  const sample = "Battle of Okpo (May 1592)";
  assert.equal(fnv1aHex(sample).length, 8);
  assert.equal(cueUrlForText(sample), "audio/cues/cue_" + fnv1aHex(sample) + ".wav");
});
