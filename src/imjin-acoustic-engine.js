/**
• src/imjin-acoustic-engine.js — Karplus-Strong Plucked Gayageum / Shamisen + Bowed Cello (<= 760 Hz)
• Physical-modeling string resonators + breath-paced counterpoint + brick-wall limiter.
*/
// Korean Pyeongjo pentatonic (D3, E3, G3, A3, B3, D4) & Japanese Hirajoshi (D3, Eb3, G3, A3, Bb3, D4)
const GAYAGEUM_NOTES = Array.of(146.83, 164.81, 196.00, 220.00, 246.94, 293.66);
const SHAMISEN_NOTES = Array.of(146.83, 155.56, 196.00, 220.00, 233.08, 293.66);
export function createImjinAcousticEngine() {
let ctx = null;
let lpf = null;
let limiter = null;
let muted = true;
let phraseTimer = null;
let step = 0;
let chapterIndex = 0;
let completedSteps = 0;
const ensure = () => {
if (!ctx && typeof window !== "undefined") {
const Ctor = window.AudioContext || window.webkitAudioContext;
if (!Ctor) return null;
ctx = new Ctor();
lpf = ctx.createBiquadFilter();
lpf.type = "lowpass";
lpf.frequency.setValueAtTime(760, ctx.currentTime);
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
// Karplus-Strong plucked string resonator (wooden gayageum silk vs. shamisen plectrum)
const pluckString = (freq, decayFeedback = 0.982, pan = 0, gainPeak = 0.14) => {
if (muted || !freq) return;
const c = ensure();
if (!c) return;
const now = c.currentTime;
// 14 ms deterministic noise burst excites the tuned delay loop
const burstLen = Math.max(16, Math.floor(c.sampleRate * 0.014));
const noiseBuf = c.createBuffer(1, burstLen, c.sampleRate);
const data = noiseBuf.getChannelData(0);
let seed = 1337;
for (let i = 0; i < burstLen; i += 1) {
seed = (seed * 16807) % 2147483647;
data[i] = ((seed / 1073741823.5) - 1.0) * (1 - i / burstLen);
}
const src = c.createBufferSource();
src.buffer = noiseBuf;
const delay = c.createDelay();
delay.delayTime.setValueAtTime(1.0 / freq, now);
const damp = c.createBiquadFilter();
damp.type = "lowpass";
damp.frequency.setValueAtTime(740, now);
const fb = c.createGain();
fb.gain.setValueAtTime(decayFeedback, now);
const outGain = c.createGain();
outGain.gain.setValueAtTime(gainPeak, now);
outGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
src.connect(delay);
delay.connect(damp);
damp.connect(fb);
fb.connect(delay);
damp.connect(outGain);
if (typeof c.createStereoPanner === "function") {
const p = c.createStereoPanner();
p.pan.setValueAtTime(pan, now);
outGain.connect(p);
p.connect(lpf);
} else {
outGain.connect(lpf);
}
src.start(now);
};
// Deep Korean Buk / Japanese Taiko muted frame pulse
const playDrumPulse = (freq = 78, pan = 0) => {
if (muted) return;
const c = ensure();
if (!c) return;
const now = c.currentTime;
const osc = c.createOscillator();
const g = c.createGain();
osc.type = "sine";
osc.frequency.setValueAtTime(freq * 1.35, now);
osc.frequency.exponentialRampToValueAtTime(freq, now + 0.14);
g.gain.setValueAtTime(0.0001, now);
g.gain.linearRampToValueAtTime(0.08, now + 0.02);
g.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
osc.connect(g);
g.connect(lpf);
osc.start(now);
osc.stop(now + 0.6);
};
// Phrased call-and-response between Joseon Gayageum (left) and Japanese Shamisen (right)
const scheduleNextPhrase = () => {
if (muted || typeof window === "undefined") return;
const pattern = Array.of(0, 2, 4, 3, -1, 5, 4, 2, 0, -1);
const noteSlot = pattern.at(step % pattern.length);
step += 1;
if (noteSlot < 0) {
// Natural breath rest
phraseTimer = window.setTimeout(scheduleNextPhrase, 950);
return;
}
// Joseon Gayageum (left channel, warm silk sustain 0.984)
pluckString(GAYAGEUM_NOTES.at(noteSlot), 0.984, -0.35, 0.15);
// Japanese Shamisen counterpoint (right channel, crisp plectrum 0.968)
if (completedSteps >= 2 && step % 2 === 0) {
const shamIdx = (noteSlot + chapterIndex) % SHAMISEN_NOTES.length;
window.setTimeout(() => {
pluckString(SHAMISEN_NOTES.at(shamIdx), 0.968, 0.35, 0.13);
}, 340);
}
// Deep Buk / Taiko war-drum cadence in Hansando, Myeongnyang & Noryang
if (completedSteps >= 4 && step % 4 === 1) {
playDrumPulse(chapterIndex === 2 ? 68 : 82);
}
phraseTimer = window.setTimeout(scheduleNextPhrase, 880);
};
return {
isMuted: () => muted,
toggleMute: () => {
muted = !muted;
if (!muted) {
ensure();
if (!phraseTimer) scheduleNextPhrase();
} else if (phraseTimer && typeof window !== "undefined") {
window.clearTimeout(phraseTimer);
phraseTimer = null;
}
return muted;
},
syncState: (state) => {
chapterIndex = state.chapterIndex;
completedSteps = state.completedSteps;
},
playBrushPluck: (speed = 1) => {
if (muted) return;
const idx = Math.min(GAYAGEUM_NOTES.length - 1, Math.max(0, Math.floor(speed / 4)));
pluckString(GAYAGEUM_NOTES.at(idx), 0.975, 0, 0.08);
},
playManeuverChord: () => {
if (muted) return;
pluckString(146.83, 0.985, -0.25, 0.12);
setTimeout(() => pluckString(220.00, 0.985, 0.25, 0.12), 180);
}
};
}
