import test from "node:test";
import assert from "node:assert/strict";
import { classifyBrushStrokes } from "../src/brush-classifier.js";
import { IMJIN_CHAPTERS, createImjinState, applyImjinGesture, imjinProgressBraille } from "../src/imjin-kernel.js";
import { createDeterministicSinLUT, bakeTaperedSumiStroke, renderImjinFrame } from "../src/imjin-renderer.js";
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
test("2. All four historical naval chapters progress independently through 6 maneuvers", () => {
for (let c = 0; c < IMJIN_CHAPTERS.length; c += 1) {
let st = createImjinState(c);
for (const step of IMJIN_CHAPTERS.at(c).steps) {
st = applyImjinGesture(st, step.shape);
}
assert.equal(st.chapterIndex, c);
assert.equal(st.isComplete, true);
assert.equal(imjinProgressBraille(st).length, 5);
}
});
test("3. Velocity-tapered sumi-e ink strokes bake into Hanji Q16.16 framebuffer", () => {
const buf = new Uint32Array(320 * 240);
const pigment = new Uint32Array(320 * 240);
const lut = createDeterministicSinLUT();
bakeTaperedSumiStroke(pigment, 320, 240, Array.of({ x: 20, y: 20 }, { x: 60, y: 60 }), Array.of(36, 74, 118));
renderImjinFrame(buf, 320, 240, createImjinState(2), 12, lut, pigment, null, null);
assert.equal(buf[20 * 320 + 20], pigment[20 * 320 + 20]);
});
