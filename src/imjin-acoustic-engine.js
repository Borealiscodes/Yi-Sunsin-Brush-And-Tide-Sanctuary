/**
• src/imjin-acoustic-engine.js — 100% Feedback-Free Plucked String & Drum Engine (<= 720 Hz)
• Zero DelayNode feedback loops: uses pure single-shot damped oscillators + brick-wall limiter.
*/
const GAYAGEUM_SCALE = Array.of(146.83, 164.81, 196.00, 220.00, 246.94, 293.66); // Korean Pyeongjo
const SHAMISEN_SCALE = Array.of(146.83, 155.56, 196.00, 220.00, 233.08, 293.66); // Japanese Hirajoshi
export function createImjinAcousticEngine() {
let ctx = null;
let lpf = null;
let limiter = null;
let muted = true;
let timer = null;
let step = 0;
let battleIndex = 0;
let completedTurns = 0;
const ensure = () => {
if (!ctx && typeof window !== "undefined") {
const Ctor = window.AudioContext || window.webkitAudioContext;
if (!Ctor) return null;
ctx = new Ctor();
lpf = ctx.createBiquadFilter();
lpf.type = "lowpass";
lpf.frequency.setValueAtTime(720, ctx.currentTime);
limiter = ctx.createDynamicsCompressor();
limiter.threshold.setValueAtTime(-20, ctx.currentTime);
limiter.knee.setValueAtTime(0, ctx.currentTime);
limiter.ratio.setValueAtTime(20, ctx.currentTime);
limiter.attack.setValueAtTime(0.004, ctx.currentTime);
limiter.release.setValueAtTime(0.25, ctx.currentTime);
lpf.connect(limiter);
limiter.connect(ctx.destination);
}
if (ctx && ctx.state === "suspended") ctx.resume();
return ctx;
};
// Clean single-shot plucked string envelope (no feedback loops possible)
const playStringNote = (freq, type, peak, decaySec, pan = 0) => {
if (muted || !freq) return;
const c = ensure();
if (!c) return;
const now = c.currentTime;
const osc = c.createOscillator();
const env = c.createGain();
osc.type = type;
osc.frequency.setValueAtTime(freq, now);
env.gain.setValueAtTime(0.0001, now);
env.gain.linearRampToValueAtTime(peak, now + 0.025);
env.gain.exponentialRampToValueAtTime(0.0001, now + decaySec);
if (typeof c.createStereoPanner === "function") {
const p = c.createStereoPanner();
p.pan.setValueAtTime(pan, now);
osc.connect(env);
env.connect(p);
p.connect(lpf);
} else {
osc.connect(env);
env.connect(lpf);
}
osc.start(now);
osc.stop(now + decaySec + 0.05);
};
const playDrumThud = (freq = 76) => {
if (muted) return;
const c = ensure();
if (!c) return;
const now = c.currentTime;
const osc = c.createOscillator();
const env = c.createGain();
osc.type = "sine";
osc.frequency.setValueAtTime(freq * 1.4, now);
osc.frequency.exponentialRampToValueAtTime(freq, now + 0.12);
env.gain.setValueAtTime(0.0001, now);
env.gain.linearRampToValueAtTime(0.085, now + 0.02);
env.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
osc.connect(env);
env.connect(lpf);
osc.start(now);
osc.stop(now + 0.55);
};
const schedulePhrase = () => {
if (muted || typeof window === "undefined") return;
const motif = Array.of(0, 2, 4, 3, -1, 5, 3, 2, 0, -1);
const idx = motif.at(step % motif.length);
step += 1;
if (idx < 0) {
timer = window.setTimeout(schedulePhrase, 950);
return;
}
// Korean Gayageum (warm sine/triangle blend, left pan)
playStringNote(GAYAGEUM_SCALE.at(idx), "sine", 0.075, 1.2, -0.35);
// Japanese Shamisen counterpoint (crisp triangle pluck, right pan)
if (completedTurns >= 1 && step % 2 === 0) {
const sIdx = (idx + battleIndex) % SHAMISEN_SCALE.length;
window.setTimeout(() => {
playStringNote(SHAMISEN_SCALE.at(sIdx), "triangle", 0.055, 0.85, 0.35);
}, 320);
}
// Buk / Taiko war drum pulse on maneuvers 2+
if (completedTurns >= 2 && step % 4 === 1) {
playDrumThud(battleIndex === 2 ? 68 : 80);
}
timer = window.setTimeout(schedulePhrase, 880);
};
return {
isMuted: () => muted,
toggleMute: () => {
muted = !muted;
if (!muted) {
ensure();
if (!timer) schedulePhrase();
} else if (timer && typeof window !== "undefined") {
window.clearTimeout(timer);
timer = null;
}
return muted;
},
syncState: (state) => {
battleIndex = state.battleIndex;
completedTurns = state.completedTurns;
},
playBrushPluck: (speed = 1) => {
if (muted) return;
const idx = Math.min(GAYAGEUM_SCALE.length - 1, Math.max(0, Math.floor(speed / 5)));
playStringNote(GAYAGEUM_SCALE.at(idx), "sine", 0.045, 0.45, 0);
},
playManeuverChime: () => {
if (muted) return;
playStringNote(146.83, "sine", 0.07, 0.9, -0.25);
setTimeout(() => playStringNote(220.00, "sine", 0.07, 1.1, 0.25), 180);
}
};
}
