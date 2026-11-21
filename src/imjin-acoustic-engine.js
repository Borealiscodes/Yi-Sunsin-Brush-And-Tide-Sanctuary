/**
• src/imjin-acoustic-engine.js — Dry, Crisp Celestial Brush Plucks Over Soft Chamber Accompaniment (<= 740 Hz)
• Fixes lingering reverb tail on brush strokes and lowers background accompaniment so brush plucks stand out.
*/
const CHORD_PROGRESSION = Array.of(
Array.of(146.83, 220.00, 261.63, 329.63),
Array.of(116.54, 174.61, 220.00, 293.66),
Array.of(130.81, 196.00, 246.94, 293.66),
Array.of(110.00, 164.81, 220.00, 261.63),
Array.of(146.83, 220.00, 293.66, 329.63)
);
const MELODY_PHRASES = Array.of(
Array.of(
{ f: 293.66, dur: 1.6 }, { f: 329.63, dur: 0.9 }, { f: 349.23, dur: 1.8 }, { f: 293.66, dur: 1.4 },
{ f: 0, dur: 1.4 }
),
Array.of(
{ f: 261.63, dur: 1.4 }, { f: 293.66, dur: 1.0 }, { f: 220.00, dur: 2.2 }, { f: 0, dur: 1.6 }
),
Array.of(
{ f: 349.23, dur: 1.2 }, { f: 329.63, dur: 0.9 }, { f: 293.66, dur: 1.4 }, { f: 261.63, dur: 1.2 }, { f: 293.66, dur: 2.4 },
{ f: 0, dur: 1.8 }
)
);
export function createImjinAcousticEngine() {
let ctx = null;
let masterLpf = null;
let bgBus = null;
let limiter = null;
let droneGain = null;
let muted = true;
let chordTimer = null;
let melodyTimer = null;
let chordIdx = 0;
let phraseIdx = 0;
let noteIdx = 0;
let battleIndex = 0;
let completedTurns = 0;
let lastBrushPluckMs = 0;
const ensure = () => {
if (!ctx && typeof window !== "undefined") {
const Ctor = window.AudioContext || window.webkitAudioContext;
if (!Ctor) return null;
ctx = new Ctor();
masterLpf = ctx.createBiquadFilter();
masterLpf.type = "lowpass";
masterLpf.frequency.setValueAtTime(740, ctx.currentTime);
// Subdued background accompaniment bus (-8 dB below foreground brush plucks)
bgBus = ctx.createGain();
bgBus.gain.setValueAtTime(0.38, ctx.currentTime);
bgBus.connect(masterLpf);
limiter = ctx.createDynamicsCompressor();
limiter.threshold.setValueAtTime(-18, ctx.currentTime);
limiter.knee.setValueAtTime(0, ctx.currentTime);
limiter.ratio.setValueAtTime(20, ctx.currentTime);
limiter.attack.setValueAtTime(0.005, ctx.currentTime);
limiter.release.setValueAtTime(0.28, ctx.currentTime);
masterLpf.connect(limiter);
limiter.connect(ctx.destination);
// Soft breathing open-fifth bowed drone (D2 + A2) routed to bgBus
droneGain = ctx.createGain();
droneGain.gain.setValueAtTime(0.0001, ctx.currentTime);
const d2 = ctx.createOscillator();
const a2 = ctx.createOscillator();
const lfo = ctx.createOscillator();
const lfoDepth = ctx.createGain();
d2.type = "triangle";
d2.frequency.setValueAtTime(73.42, ctx.currentTime);
a2.type = "sine";
a2.frequency.setValueAtTime(110.00, ctx.currentTime);
lfo.type = "sine";
lfo.frequency.setValueAtTime(0.14, ctx.currentTime);
lfoDepth.gain.setValueAtTime(0.012, ctx.currentTime);
lfo.connect(lfoDepth);
lfoDepth.connect(droneGain.gain);
d2.connect(droneGain);
a2.connect(droneGain);
droneGain.connect(bgBus);
d2.start();
a2.start();
lfo.start();
}
if (ctx && ctx.state === "suspended") ctx.resume();
return ctx;
};
// Dry, crisp foreground Celestial Brush pluck (bypasses bgBus & has zero lingering reverb tail)
const playForegroundPluck = (freq, peak = 0.085, decaySec = 0.52) => {
if (muted || !freq) return;
const c = ensure();
if (!c) return;
const t0 = c.currentTime;
const fund = c.createOscillator();
const over = c.createOscillator();
const overGain = c.createGain();
const env = c.createGain();
fund.type = "triangle";
fund.frequency.setValueAtTime(freq, t0);
over.type = "sine";
over.frequency.setValueAtTime(freq * 2, t0);
overGain.gain.setValueAtTime(0.26, t0);
env.gain.setValueAtTime(0.0001, t0);
env.gain.linearRampToValueAtTime(peak, t0 + 0.012);
env.gain.exponentialRampToValueAtTime(0.0001, t0 + decaySec);
fund.connect(env);
over.connect(overGain);
overGain.connect(env);
env.connect(masterLpf);
fund.start(t0);
over.start(t0);
fund.stop(t0 + decaySec + 0.03);
over.stop(t0 + decaySec + 0.03);
};
// Soft background chord arpeggio routed through bgBus
const pluckAccompaniment = (freq, delaySec, pan) => {
if (muted || !freq) return;
const c = ensure();
if (!c) return;
const t0 = c.currentTime + delaySec;
const osc = c.createOscillator();
const env = c.createGain();
osc.type = "sine";
osc.frequency.setValueAtTime(freq, t0);
env.gain.setValueAtTime(0.0001, t0);
env.gain.linearRampToValueAtTime(0.045, t0 + 0.03);
env.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.8);
osc.connect(env);
if (typeof c.createStereoPanner === "function") {
const p = c.createStereoPanner();
p.pan.setValueAtTime(pan, t0);
env.connect(p);
p.connect(bgBus);
} else {
env.connect(bgBus);
}
osc.start(t0);
osc.stop(t0 + 1.85);
};
const bowLyricNote = (freq, durSec) => {
if (muted || !freq) return;
const c = ensure();
if (!c) return;
const t0 = c.currentTime;
const osc = c.createOscillator();
const vib = c.createOscillator();
const vibGain = c.createGain();
const env = c.createGain();
osc.type = "triangle";
osc.frequency.setValueAtTime(freq * 0.985, t0);
osc.frequency.exponentialRampToValueAtTime(freq, t0 + 0.16);
vib.type = "sine";
vib.frequency.setValueAtTime(4.5, t0);
vibGain.gain.setValueAtTime(1.6, t0);
vib.connect(vibGain);
vibGain.connect(osc.frequency);
env.gain.setValueAtTime(0.0001, t0);
env.gain.linearRampToValueAtTime(0.05, t0 + 0.25);
env.gain.setValueAtTime(0.042, t0 + Math.max(0.3, durSec - 0.3));
env.gain.exponentialRampToValueAtTime(0.0001, t0 + durSec + 0.3);
osc.connect(env);
env.connect(bgBus);
osc.start(t0);
vib.start(t0);
const stopAt = t0 + durSec + 0.35;
osc.stop(stopAt);
vib.stop(stopAt);
};
const scheduleChord = () => {
if (muted || typeof window === "undefined") return;
const chord = CHORD_PROGRESSION.at(chordIdx % CHORD_PROGRESSION.length);
chordIdx += 1;
const pattern = Array.of(0, 1, 2, 3, 2, 1);
pattern.forEach((nIdx, stepPos) => {
pluckAccompaniment(chord.at(nIdx), stepPos * 0.42, stepPos % 2 === 0 ? -0.3 : 0.3);
});
chordTimer = window.setTimeout(scheduleChord, 2650);
};
const scheduleMelody = () => {
if (muted || typeof window === "undefined") return;
const phrase = MELODY_PHRASES.at((phraseIdx + battleIndex) % MELODY_PHRASES.length);
const note = phrase.at(noteIdx % phrase.length);
noteIdx += 1;
if (noteIdx >= phrase.length) {
noteIdx = 0;
phraseIdx += 1;
}
if (completedTurns >= 1 && note.f > 0) {
bowLyricNote(note.f, note.dur);
}
melodyTimer = window.setTimeout(scheduleMelody, note.dur * 1000);
};
return {
isMuted: () => muted,
toggleMute: () => {
muted = !muted;
const c = ensure();
if (!muted && c) {
droneGain?.gain.setTargetAtTime(0.032, c.currentTime, 0.4);
if (!chordTimer) scheduleChord();
if (!melodyTimer) scheduleMelody();
} else {
if (c && droneGain) droneGain.gain.setTargetAtTime(0.0001, c.currentTime, 0.2);
if (chordTimer && typeof window !== "undefined") { window.clearTimeout(chordTimer); chordTimer = null; }
if (melodyTimer && typeof window !== "undefined") { window.clearTimeout(melodyTimer); melodyTimer = null; }
}
return muted;
},
syncState: (state) => {
battleIndex = state.battleIndex;
completedTurns = state.completedTurns;
},
playBrushPluck: (speed = 1) => {
if (muted) return;
const nowMs = Date.now();
if (nowMs - lastBrushPluckMs < 120) return; // Rate-limit so plucks stay crisp & dry
lastBrushPluckMs = nowMs;
const notes = Array.of(146.83, 174.61, 220.00, 261.63, 293.66);
const idx = Math.min(notes.length - 1, Math.max(0, Math.floor(speed / 6)));
playForegroundPluck(notes.at(idx), 0.085, 0.52);
},
playManeuverChime: () => {
if (muted) return;
playForegroundPluck(146.83, 0.09, 0.65);
setTimeout(() => playForegroundPluck(220.00, 0.09, 0.65), 140);
setTimeout(() => playForegroundPluck(293.66, 0.095, 0.85), 280);
}
};
}
