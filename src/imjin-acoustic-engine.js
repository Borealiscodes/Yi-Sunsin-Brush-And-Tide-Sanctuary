/**
 * src/imjin-acoustic-engine.js — Kubo-Inspired Acoustic Chamber Score (<= 740 Hz)
 * Features:
 *  1. Continuous breathing open-fifth bowed drone (D2 + A2)
 *  2. Overlapping 4-note arpeggiated guitar/gayageum chords (2.4s sustain)
 *  3. Lyrical portamento bowed lead with 4.5 Hz vibrato and natural phrase rests
 *  4. Non-feedback 3-tap early-reflection wooden hall tail + brick-wall limiter
 */

// Chord progressions (Hz) in D minor / D Dorian (evoking Kubo acoustic tension & uplift)
const CHORD_PROGRESSION = Array.of(
  Array.of(146.83, 220.00, 261.63, 329.63), // Dm9 (D3, A3, C4, E4)
  Array.of(116.54, 174.61, 220.00, 293.66), // Bbmaj7 (Bb2, F3, A3, D4)
  Array.of(130.81, 196.00, 246.94, 293.66), // C6/9 (C3, G3, B3, D4)
  Array.of(110.00, 164.81, 220.00, 261.63), // Am7 (A2, E3, A3, C4)
  Array.of(146.83, 220.00, 293.66, 329.63)  // Dsus2 (D3, A3, D4, E4)
);

// Lyrical bowed melody phrases (freq: 0 = breath rest)
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
  let roomBus = null;
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

  const ensure = () => {
    if (!ctx && typeof window !== "undefined") {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();

      masterLpf = ctx.createBiquadFilter();
      masterLpf.type = "lowpass";
      masterLpf.frequency.setValueAtTime(740, ctx.currentTime);

      // Non-feedback 3-tap acoustic hall reflection (zero runaway risk)
      roomBus = ctx.createGain();
      roomBus.gain.setValueAtTime(1.0, ctx.currentTime);
      const taps = Array.of(
        { time: 0.055, gain: 0.24 },
        { time: 0.092, gain: 0.16 },
        { time: 0.138, gain: 0.10 }
      );
      for (const tap of taps) {
        const d = ctx.createDelay();
        const g = ctx.createGain();
        d.delayTime.setValueAtTime(tap.time, ctx.currentTime);
        g.gain.setValueAtTime(tap.gain, ctx.currentTime);
        roomBus.connect(d);
        d.connect(g);
        g.connect(masterLpf);
      }
      roomBus.connect(masterLpf);

      limiter = ctx.createDynamicsCompressor();
      limiter.threshold.setValueAtTime(-18, ctx.currentTime);
      limiter.knee.setValueAtTime(0, ctx.currentTime);
      limiter.ratio.setValueAtTime(20, ctx.currentTime);
      limiter.attack.setValueAtTime(0.005, ctx.currentTime);
      limiter.release.setValueAtTime(0.28, ctx.currentTime);

      masterLpf.connect(limiter);
      limiter.connect(ctx.destination);

      // Continuous breathing open-fifth bowed drone (D2 + A2)
      droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.0001, ctx.currentTime);

      const d2 = ctx.createOscillator();
      const a2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoDepth = ctx.createGain();

      d2.type = "triangle";
      d2.frequency.setValueAtTime(73.42, ctx.currentTime); // D2
      a2.type = "sine";
      a2.frequency.setValueAtTime(110.00, ctx.currentTime); // A2

      lfo.type = "sine";
      lfo.frequency.setValueAtTime(0.14, ctx.currentTime); // Slow ocean-swell breathing
      lfoDepth.gain.setValueAtTime(0.015, ctx.currentTime);

      lfo.connect(lfoDepth);
      lfoDepth.connect(droneGain.gain);
      d2.connect(droneGain);
      a2.connect(droneGain);
      droneGain.connect(masterLpf);

      d2.start();
      a2.start();
      lfo.start();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  // Warm overlapping acoustic pluck (guitar / gayageum harmonic body)
  const pluckAcoustic = (freq, delaySec, pan, peak = 0.055) => {
    if (muted || !freq) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + delaySec;

    const fund = c.createOscillator();
    const over = c.createOscillator();
    const overGain = c.createGain();
    const env = c.createGain();

    fund.type = "triangle";
    fund.frequency.setValueAtTime(freq, t0);

    over.type = "sine";
    over.frequency.setValueAtTime(freq * 2, t0);
    overGain.gain.setValueAtTime(0.22, t0);

    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.35);

    fund.connect(env);
    over.connect(overGain);
    overGain.connect(env);

    if (typeof c.createStereoPanner === "function") {
      const p = c.createStereoPanner();
      p.pan.setValueAtTime(pan, t0);
      env.connect(p);
      p.connect(roomBus);
    } else {
      env.connect(roomBus);
    }

    fund.start(t0);
    over.start(t0);
    fund.stop(t0 + 2.45);
    over.stop(t0 + 2.45);
  };

  // Lyrical bowed cello/daegeum lead with gentle vibrato
  const bowLyricNote = (freq, durSec) => {
    if (muted || !freq) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime;

    const osc = c.createOscillator();
    const sub = c.createOscillator();
    const subGain = c.createGain();
    const vib = c.createOscillator();
    const vibGain = c.createGain();
    const env = c.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq * 0.985, t0);
    osc.frequency.exponentialRampToValueAtTime(freq, t0 + 0.18); // Subtle bow-in glide

    sub.type = "sine";
    sub.frequency.setValueAtTime(freq * 0.5, t0);
    subGain.gain.setValueAtTime(0.35, t0);

    vib.type = "sine";
    vib.frequency.setValueAtTime(4.5, t0);
    vibGain.gain.setValueAtTime(1.8, t0);

    vib.connect(vibGain);
    vibGain.connect(osc.frequency);

    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(0.06, t0 + 0.28);
    env.gain.setValueAtTime(0.052, t0 + Math.max(0.35, durSec - 0.3));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + durSec + 0.35);

    osc.connect(env);
    sub.connect(subGain);
    subGain.connect(env);
    env.connect(roomBus);

    osc.start(t0);
    sub.start(t0);
    vib.start(t0);
    const stopAt = t0 + durSec + 0.4;
    osc.stop(stopAt);
    sub.stop(stopAt);
    vib.stop(stopAt);
  };

  const playBukDrum = () => {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(108, t0);
    osc.frequency.exponentialRampToValueAtTime(64, t0 + 0.16);
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(0.08, t0 + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.65);
    osc.connect(env);
    env.connect(masterLpf);
    osc.start(t0);
    osc.stop(t0 + 0.7);
  };

  // Arpeggiated 4-note broken chord cycle (every 2.8 seconds)
  const scheduleChord = () => {
    if (muted || typeof window === "undefined") return;
    const chord = CHORD_PROGRESSION.at(chordIdx % CHORD_PROGRESSION.length);
    chordIdx += 1;

    // Gentle fingerpicked upward-and-back arpeggio
    const pattern = Array.of(0, 1, 2, 3, 2, 1);
    pattern.forEach((nIdx, stepPos) => {
      const pan = stepPos % 2 === 0 ? -0.3 : 0.3;
      pluckAcoustic(chord.at(nIdx), stepPos * 0.42, pan, 0.052);
    });

    if (completedTurns >= 2) {
      playBukDrum();
    }

    chordTimer = window.setTimeout(scheduleChord, 2650);
  };

  // Lyrical bowed melody phrase cycle (enters once Maneuver 1+ is completed)
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
        droneGain?.gain.setTargetAtTime(0.042, c.currentTime, 0.4);
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
      const notes = Array.of(146.83, 174.61, 220.00, 261.63, 293.66);
      const idx = Math.min(notes.length - 1, Math.max(0, Math.floor(speed / 6)));
      pluckAcoustic(notes.at(idx), 0, 0, 0.038);
    },
    playManeuverChime: () => {
      if (muted) return;
      pluckAcoustic(146.83, 0, -0.25, 0.06);
      pluckAcoustic(220.00, 0.14, 0, 0.06);
      pluckAcoustic(293.66, 0.28, 0.25, 0.065);
    }
  };
}
