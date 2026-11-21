/**
 * src/imjin-acoustic-engine.js — Living Kubo-Inspired Chamber Score (<= 740 Hz)
 * Eliminates the constant background drone in favor of:
 *  1. Dynamic bowed cello swells that rise on phrase downbeats and decay to silence
 *  2. Syncopated 3+3+2 fingerpicked acoustic guitar / gayageum / shamisen patterns with velocity accents
 *  3. Expressive gayageum pitch-bend ornaments (nonghyeon) & battle-adaptive pacing
 */

const HARMONIC_CYCLES = Array.of(
  { root: 73.42,  notes: Array.of(146.83, 220.00, 261.63, 329.63) }, // Dm9
  { root: 58.27,  notes: Array.of(116.54, 174.61, 220.00, 293.66) }, // Bbmaj7
  { root: 65.41,  notes: Array.of(130.81, 196.00, 246.94, 293.66) }, // C6/9
  { root: 55.00,  notes: Array.of(110.00, 164.81, 220.00, 261.63) }, // Am7
  { root: 73.42,  notes: Array.of(146.83, 220.00, 293.66, 329.63) }  // Dsus2
);

const MELODY_LINES = Array.of(
  Array.of(
    { f: 293.66, dur: 1.35, bend: 1.018 }, { f: 329.63, dur: 0.75, bend: 1.0 },
    { f: 349.23, dur: 1.65, bend: 1.022 }, { f: 293.66, dur: 1.25, bend: 1.0 },
    { f: 0, dur: 1.4 }
  ),
  Array.of(
    { f: 261.63, dur: 1.2, bend: 1.015 }, { f: 293.66, dur: 0.85, bend: 1.0 },
    { f: 220.00, dur: 1.9, bend: 1.025 }, { f: 0, dur: 1.6 }
  ),
  Array.of(
    { f: 349.23, dur: 1.05, bend: 1.015 }, { f: 329.63, dur: 0.8, bend: 1.0 },
    { f: 293.66, dur: 1.2, bend: 1.02 },  { f: 261.63, dur: 1.0, bend: 1.0 },
    { f: 293.66, dur: 2.1, bend: 1.024 }, { f: 0, dur: 1.8 }
  )
);

export function createImjinAcousticEngine() {
  let ctx = null;
  let masterLpf = null;
  let bgBus = null;
  let limiter = null;
  let muted = true;

  let measureTimer = null;
  let melodyTimer = null;
  let measureIdx = 0;
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

      bgBus = ctx.createGain();
      bgBus.gain.setValueAtTime(0.45, ctx.currentTime);
      bgBus.connect(masterLpf);

      limiter = ctx.createDynamicsCompressor();
      limiter.threshold.setValueAtTime(-18, ctx.currentTime);
      limiter.knee.setValueAtTime(0, ctx.currentTime);
      limiter.ratio.setValueAtTime(20, ctx.currentTime);
      limiter.attack.setValueAtTime(0.005, ctx.currentTime);
      limiter.release.setValueAtTime(0.28, ctx.currentTime);

      masterLpf.connect(limiter);
      limiter.connect(ctx.destination);
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  // Dry, crisp foreground Celestial Brush pluck
  const playForegroundPluck = (freq, peak = 0.09, decaySec = 0.5) => {
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

  // Dynamic bowed bass-cello swell (rises gently on downbeat and fades to silence—no constant drone!)
  const playBowedBassSwell = (rootFreq, durSec = 2.1) => {
    if (muted || !rootFreq) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime;

    const osc = c.createOscillator();
    const fifth = c.createOscillator();
    const fifthGain = c.createGain();
    const env = c.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(rootFreq, t0);

    fifth.type = "sine";
    fifth.frequency.setValueAtTime(rootFreq * 1.5, t0);
    fifthGain.gain.setValueAtTime(0.32, t0);

    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(0.055, t0 + 0.55);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + durSec);

    osc.connect(env);
    fifth.connect(fifthGain);
    fifthGain.connect(env);
    env.connect(bgBus);

    osc.start(t0);
    fifth.start(t0);
    osc.stop(t0 + durSec + 0.05);
    fifth.stop(t0 + durSec + 0.05);
  };

  // Syncopated fingerpicked string note (warm sine gayageum vs. crisp triangle shamisen)
  const pluckEnsembleNote = (freq, delaySec, pan, peak, isShamisen) => {
    if (muted || !freq) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + delaySec;

    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = isShamisen ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, t0);

    const decay = isShamisen ? 0.95 : 1.65;
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + (isShamisen ? 0.012 : 0.028));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);

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
    osc.stop(t0 + decay + 0.05);
  };

  // Expressive bowed lead with gayageum pitch-bend ornament (nonghyeon)
  const bowExpressiveNote = (freq, durSec, bendRatio) => {
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
    if (bendRatio > 1.0 && durSec > 1.1) {
      osc.frequency.exponentialRampToValueAtTime(freq * bendRatio, t0 + durSec * 0.55);
      osc.frequency.exponentialRampToValueAtTime(freq, t0 + durSec * 0.85);
    }

    vib.type = "sine";
    vib.frequency.setValueAtTime(4.6, t0);
    vibGain.gain.setValueAtTime(1.8, t0);

    vib.connect(vibGain);
    vibGain.connect(osc.frequency);

    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(0.062, t0 + 0.24);
    env.gain.setValueAtTime(0.05, t0 + Math.max(0.3, durSec - 0.3));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + durSec + 0.28);

    osc.connect(env);
    env.connect(bgBus);

    osc.start(t0);
    vib.start(t0);
    const stopAt = t0 + durSec + 0.35;
    osc.stop(stopAt);
    vib.stop(stopAt);
  };

  // Syncopated 3+3+2 Kubo-style measure scheduler (adapts tempo slightly per battle)
  const scheduleMeasure = () => {
    if (muted || typeof window === "undefined") return;
    const chord = HARMONIC_CYCLES.at(measureIdx % HARMONIC_CYCLES.length);
    measureIdx += 1;

    // Battle-adaptive pacing (Myeongnyang slightly tauter; Noryang spacious)
    const stepUnit = battleIndex === 2 ? 0.32 : battleIndex === 3 ? 0.44 : 0.38;
    const measureSec = stepUnit * 8;

    // Breathing bowed bass swell on downbeat (fades cleanly before next measure)
    playBowedBassSwell(chord.root, measureSec * 0.85);

    // Syncopated 3+3+2 pluck pattern: Joseon Gayageum (left) & Japanese Shamisen (right)
    const syncopation = Array.of(
      { beat: 0,   note: 0, peak: 0.055, shamisen: false, pan: -0.35 },
      { beat: 1.5, note: 1, peak: 0.042, shamisen: false, pan: -0.25 },
      { beat: 3,   note: 2, peak: 0.058, shamisen: true,  pan:  0.35 },
      { beat: 4.5, note: 3, peak: 0.045, shamisen: false, pan: -0.30 },
      { beat: 6,   note: 2, peak: 0.052, shamisen: true,  pan:  0.35 },
      { beat: 7,   note: 1, peak: 0.038, shamisen: false, pan: -0.20 }
    );

    for (const ev of syncopation) {
      if (ev.shamisen && completedTurns < 1 && battleIndex === 0) continue;
      pluckEnsembleNote(chord.notes.at(ev.note), ev.beat * stepUnit, ev.pan, ev.peak, ev.shamisen);
    }

    measureTimer = window.setTimeout(scheduleMeasure, measureSec * 1000);
  };

  const scheduleMelody = () => {
    if (muted || typeof window === "undefined") return;
    const phrase = MELODY_LINES.at((phraseIdx + battleIndex) % MELODY_LINES.length);
    const note = phrase.at(noteIdx % phrase.length);
    noteIdx += 1;
    if (noteIdx >= phrase.length) {
      noteIdx = 0;
      phraseIdx += 1;
    }

    if (completedTurns >= 1 && note.f > 0) {
      bowExpressiveNote(note.f, note.dur, note.bend);
    }

    melodyTimer = window.setTimeout(scheduleMelody, note.dur * 1000);
  };

  return {
    isMuted: () => muted,
    toggleMute: () => {
      muted = !muted;
      ensure();
      if (!muted) {
        if (!measureTimer) scheduleMeasure();
        if (!melodyTimer) scheduleMelody();
      } else {
        if (measureTimer && typeof window !== "undefined") { window.clearTimeout(measureTimer); measureTimer = null; }
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
      if (nowMs - lastBrushPluckMs < 120) return;
      lastBrushPluckMs = nowMs;
      const notes = Array.of(146.83, 174.61, 220.00, 261.63, 293.66);

const idx = Math.min(notes.length - 1, Math.max(0, Math.floor(speed / 6)));
playForegroundPluck(notes.at(idx), 0.09, 0.5);
},
playManeuverChime: () => {
if (muted) return;
playForegroundPluck(146.83, 0.095, 0.65);
setTimeout(() => playForegroundPluck(220.00, 0.095, 0.65), 140);
setTimeout(() => playForegroundPluck(293.66, 0.10, 0.85), 280);
}
};
}
