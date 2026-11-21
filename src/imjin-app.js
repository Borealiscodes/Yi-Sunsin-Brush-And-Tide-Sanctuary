import { classifyBrushStrokes } from "./brush-classifier.js";
import {
NAVAL_BATTLES,
createTacticalState,
applyTacticalGesture,
tacticalProgressBraille
} from "./imjin-kernel.js";
import { renderTopDownNavalChart } from "./imjin-renderer.js";
import { createImjinAcousticEngine } from "./imjin-acoustic-engine.js";
export function initImjinSanctuary() {
const canvas = document.getElementById("imjin-canvas");
const ctx = canvas.getContext("2d");
const engine = createImjinAcousticEngine();
const hudEl = document.getElementById("hud-status");
const brailleEl = document.getElementById("braille-meter");
const narrativeEl = document.getElementById("narrative-voice");
const tabsEl = document.getElementById("chapter-tabs");
const deckEl = document.getElementById("gesture-deck");
const muteBtn = document.getElementById("btn-mute");
const motionBtn = document.getElementById("btn-motion");
const resetBtn = document.getElementById("btn-reset");
let state = createTacticalState(0);
let motionOn = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
let tick = 0;
let strokes = Array.of();
let currentStroke = Array.of();
let isDrawing = false;
let evalTimer = null;
const updateUI = () => {
const b = NAVAL_BATTLES.at(state.battleIndex);
if (hudEl) {
hudEl.textContent =
b.title + " • Wind: " + b.windDir + " • Tide: " + b.tideDir + " • Maneuvers: " + state.completedTurns + "/4";
}
if (brailleEl) brailleEl.textContent = tacticalProgressBraille(state);
if (narrativeEl) narrativeEl.textContent = state.narration;
if (tabsEl) {
tabsEl.innerHTML = "";
NAVAL_BATTLES.forEach((item, idx) => {
const btn = document.createElement("button");
btn.type = "button";
btn.textContent = item.tabLabel + " (Key " + (idx + 1) + ")";
btn.classList.toggle("active", state.battleIndex === idx);
btn.addEventListener("click", () => selectBattle(idx));
tabsEl.appendChild(btn);
});
}
if (deckEl) {
deckEl.innerHTML = "";
const buttons = Array.of(
{ shape: "WAVE", label: "Wave (~) Current/Tide" },
{ shape: "CIRCLE", label: "Circle (O) Crane Wing" },
{ shape: "SLASH", label: "Slash (/) Ship Charge" },
{ shape: "CROSS", label: "Cross (+) Cannon Volley" }
);
for (const btnSpec of buttons) {
const btn = document.createElement("button");
btn.type = "button";
btn.textContent = btnSpec.label;
btn.addEventListener("click", () => submitGesture(btnSpec.shape));
deckEl.appendChild(btn);
}
}
};
const submitGesture = (shape) => {
const prevDone = state.completedTurns;
state = applyTacticalGesture(state, shape);
engine.syncState(state);
if (state.completedTurns > prevDone) engine.playManeuverChime();
strokes = Array.of();
currentStroke = Array.of();
updateUI();
};
const selectBattle = (idx) => {
strokes = Array.of();
currentStroke = Array.of();
state = createTacticalState(idx);
engine.syncState(state);
updateUI();
};
const getCanvasPos = (ev) => {
const rect = canvas.getBoundingClientRect();
return {
x: ((ev.clientX - rect.left) * canvas.width) / (rect.width || 1),
y: ((ev.clientY - rect.top) * canvas.height) / (rect.height || 1)
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
if (speed > 6) engine.playBrushPluck(speed);
});
const endStroke = () => {
if (!isDrawing) return;
isDrawing = false;
if (currentStroke.length >= 2) {
strokes.push(currentStroke);
if (strokes.length > 2) strokes = strokes.slice(-2);
}
currentStroke = Array.of();
evalTimer = setTimeout(() => {
const detected = classifyBrushStrokes(strokes);
submitGesture(detected);
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
resetBtn.addEventListener("click", () => selectBattle(state.battleIndex));
window.addEventListener("keydown", (ev) => {
if (ev.key === "m" || ev.key === "M") muteBtn.click();
else if (ev.key === " ") { ev.preventDefault(); motionBtn.click(); }
else if (ev.key === "1") selectBattle(0);
else if (ev.key === "2") selectBattle(1);
else if (ev.key === "3") selectBattle(2);
else if (ev.key === "4") selectBattle(3);
else if (ev.key === "~" || ev.key === "`") submitGesture("WAVE");
else if (ev.key === "o" || ev.key === "O") submitGesture("CIRCLE");
else if (ev.key === "/") { ev.preventDefault(); submitGesture("SLASH"); }
else if (ev.key === "+" || ev.key === "=") submitGesture("CROSS");
});
function loop() {
renderTopDownNavalChart(ctx, canvas.width, canvas.height, state, tick, isDrawing ? currentStroke : null);
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
