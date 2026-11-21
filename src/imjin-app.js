import { classifyBrushStrokes } from "./brush-classifier.js";
import {
IMJIN_CHAPTERS,
createImjinState,
applyImjinGesture,
imjinProgressBraille
} from "./imjin-kernel.js";
import {
createDeterministicSinLUT,
bakeTaperedSumiStroke,
renderImjinFrame
} from "./imjin-renderer.js";
import { createImjinAcousticEngine } from "./imjin-acoustic-engine.js";
export function initImjinSanctuary() {
const canvas = document.getElementById("imjin-canvas");
const ctx = canvas.getContext("2d", { alpha: false });
const imgData = ctx.createImageData(320, 240);
const buf32 = new Uint32Array(imgData.data.buffer);
const pigmentBuf = new Uint32Array(320 * 240);
const sinLUT = createDeterministicSinLUT();
const engine = createImjinAcousticEngine();
const hudEl = document.getElementById("hud-status");
const brailleEl = document.getElementById("braille-meter");
const narrativeEl = document.getElementById("narrative-voice");
const tabsEl = document.getElementById("chapter-tabs");
const deckEl = document.getElementById("gesture-deck");
const muteBtn = document.getElementById("btn-mute");
const motionBtn = document.getElementById("btn-motion");
const wipeBtn = document.getElementById("btn-wipe");
const resetBtn = document.getElementById("btn-reset");
let state = createImjinState(0);
let motionOn = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
let tick = 0;
let strokes = Array.of();
let currentStroke = Array.of();
let isDrawing = false;
let evalTimer = null;
const getCurrentInk = () => {
const ch = IMJIN_CHAPTERS.at(state.chapterIndex);
const st = ch.steps.at(Math.min(state.stepIndex, ch.steps.length - 1));
return st.ink;
};
const updateUI = () => {
const ch = IMJIN_CHAPTERS.at(state.chapterIndex);
if (hudEl) {
hudEl.textContent =
ch.title + " • " + ch.musicLabel + " • Maneuvers: " + state.completedSteps + "/6";
}
if (brailleEl) brailleEl.textContent = imjinProgressBraille(state);
if (narrativeEl) narrativeEl.textContent = state.narration;
if (tabsEl) {
tabsEl.innerHTML = "";
IMJIN_CHAPTERS.forEach((item, idx) => {
const btn = document.createElement("button");
btn.type = "button";
btn.textContent = item.tabLabel + " (Key " + (idx + 1) + ")";
btn.classList.toggle("active", state.chapterIndex === idx);
btn.addEventListener("click", () => selectChapter(idx));
tabsEl.appendChild(btn);
});
}
if (deckEl) {
deckEl.innerHTML = "";
const buttons = Array.of(
{ shape: "WAVE", label: "Wave (~)" },
{ shape: "CIRCLE", label: "Circle (O)" },
{ shape: "SLASH", label: "Slash (/)" },
{ shape: "CROSS", label: "Cross (+)" }
);
for (const b of buttons) {
const btn = document.createElement("button");
btn.type = "button";
btn.textContent = b.label;
btn.addEventListener("click", () => submitGesture(b.shape, true));
deckEl.appendChild(btn);
}
}
};
const bakeSyntheticManeuver = (shape) => {
const ink = getCurrentInk();
const ox = 54 + ((state.completedSteps * 34) % 190);
const oy = 42 + ((state.completedSteps * 22) % 110);
if (shape === "WAVE") {
const pts = Array.of();
for (let i = 0; i <= 16; i += 1) {
pts.push({ x: ox + i * 5, y: oy + Math.sin((i / 16) * Math.PI * 2) * 14 });
}
bakeTaperedSumiStroke(pigmentBuf, 320, 240, pts, ink);
} else if (shape === "CIRCLE") {
const pts = Array.of();
for (let i = 0; i <= 20; i += 1) {
const a = (i / 20) * Math.PI * 2;
pts.push({ x: ox + 18 + Math.cos(a) * 16, y: oy + 18 + Math.sin(a) * 16 });
}
bakeTaperedSumiStroke(pigmentBuf, 320, 240, pts, ink);
} else if (shape === "SLASH") {
bakeTaperedSumiStroke(pigmentBuf, 320, 240, Array.of({ x: ox, y: oy + 38 }, { x: ox + 18, y: oy }), ink);
} else if (shape === "CROSS") {
bakeTaperedSumiStroke(pigmentBuf, 320, 240, Array.of({ x: ox - 14, y: oy }, { x: ox + 14, y: oy }), ink);
bakeTaperedSumiStroke(pigmentBuf, 320, 240, Array.of({ x: ox, y: oy - 14 }, { x: ox, y: oy + 14 }), ink);
}
};
const submitGesture = (shape, fromButtonOrKey = false) => {
if (fromButtonOrKey) bakeSyntheticManeuver(shape);
const prevDone = state.completedSteps;
state = applyImjinGesture(state, shape);
engine.syncState(state);
if (state.completedSteps > prevDone) engine.playManeuverChord();
strokes = Array.of();
currentStroke = Array.of();
updateUI();
};
const selectChapter = (idx) => {
pigmentBuf.fill(0);
strokes = Array.of();
currentStroke = Array.of();
state = createImjinState(idx);
engine.syncState(state);
updateUI();
};
const getCanvasPos = (ev) => {
const rect = canvas.getBoundingClientRect();
return {
x: ((ev.clientX - rect.left) * 320) / (rect.width || 1),
y: ((ev.clientY - rect.top) * 240) / (rect.height || 1)
};
};
canvas.addEventListener("pointerdown", (ev) => {
ev.preventDefault();
if (evalTimer) clearTimeout(evalTimer);
isDrawing = true;
currentStroke = Array.of(getCanvasPos(ev));
});
canvas.addEventListener("pointermove", (ev) => {
if (!isDrawing) return;
ev.preventDefault();
const pt = getCanvasPos(ev);
const prev = currentStroke.at(-1);
const speed = prev ? Math.hypot(pt.x - prev.x, pt.y - prev.y) : 1;
currentStroke.push(pt);
if (speed > 4) engine.playBrushPluck(speed);
});
const endStroke = () => {
if (!isDrawing) return;
isDrawing = false;
if (currentStroke.length >= 2) {
bakeTaperedSumiStroke(pigmentBuf, 320, 240, currentStroke, getCurrentInk());
strokes.push(currentStroke);
if (strokes.length > 2) strokes = strokes.slice(-2);
}
currentStroke = Array.of();
evalTimer = setTimeout(() => {
const detected = classifyBrushStrokes(strokes);
submitGesture(detected, false);
strokes = Array.of();
}, 550);
};
canvas.addEventListener("pointerup", endStroke);
canvas.addEventListener("pointercancel", endStroke);
muteBtn.addEventListener("click", () => {
const isMuted = engine.toggleMute();
engine.syncState(state);
muteBtn.textContent = isMuted ? "Unmute Strings & Drum (M)" : "Mute Strings & Drum (M)";
muteBtn.classList.toggle("active", !isMuted);
});
motionBtn.addEventListener("click", () => {
motionOn = !motionOn;
motionBtn.textContent = motionOn ? "Tide Motion: Playing (Space)" : "Tide Motion: Paused (Space)";
motionBtn.classList.toggle("active", motionOn);
});
wipeBtn.addEventListener("click", () => {
pigmentBuf.fill(0);
});
resetBtn.addEventListener("click", () => selectChapter(state.chapterIndex));
window.addEventListener("keydown", (ev) => {
if (ev.key === "m" || ev.key === "M") muteBtn.click();
else if (ev.key === " ") { ev.preventDefault(); motionBtn.click(); }
else if (ev.key === "1") selectChapter(0);
else if (ev.key === "2") selectChapter(1);
else if (ev.key === "3") selectChapter(2);
else if (ev.key === "4") selectChapter(3);
else if (ev.key === "~" || ev.key === "`") submitGesture("WAVE", true);
else if (ev.key === "o" || ev.key === "O") submitGesture("CIRCLE", true);
else if (ev.key === "/") { ev.preventDefault(); submitGesture("SLASH", true); }
else if (ev.key === "+" || ev.key === "=") submitGesture("CROSS", true);
});
function loop() {
renderImjinFrame(
buf32, 320, 240, state, tick, sinLUT, pigmentBuf,
isDrawing ? currentStroke : null,
getCurrentInk()
);
ctx.putImageData(imgData, 0, 0);
if (motionOn) tick += 1;
requestAnimationFrame(loop);
}
updateUI();
requestAnimationFrame(loop);
}
if (typeof document !== "undefined") {
if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", initImjinSanctuary);
} else {
initImjinSanctuary();
}
}
