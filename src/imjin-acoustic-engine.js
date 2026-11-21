/**
 * src/imjin-acoustic-engine.js — Cohesive 4-Act Pentatonic Chamber Score (<= 740 Hz)
 * Evolves coherently across Acts I-IV (Okpo, Hansando, Myeongnyang, Noryang)
 * and escalates smoothly across Maneuvers 0/4 -> 4/4 without disjointed plucks.
 */

// Korean Pyeongjo (D3, E3, G3, A3, B3, D4, E4) & Gyemyeonjo (D3, F3, G3, A3, C4, D4, F4)
const PYEONGJO = Array.of(146.83, 164.81, 196.00, 220.00, 246.94, 293.66, 329.63);
const GYEMYEON = Array.of(146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23);
// Japanese Hirajoshi (D3, Eb3, G3, A3, Bb3, D4, Eb4)
const HIRAJOSHI = Array.of(146.83, 155.56, 196.00, 220.00, 233.08, 293.66, 311.13);

// Structured 8-beat themes per Act (bass ostinato, lead melody, counter-voice, drum hits)
const ACT_SCORES = Array.of(
  // Act I: Okpo — Calm flowing harbor tide (Pyeongjo, spacious 520 ms eighth-note pulse)
  {
    scale: PYEONGJO,
    stepMs: 520,
    bass:    Array.of(0, -1, 3, -1, 4, -1, 3, -1),
    melody:  Array.of(5, -1, 4, 3,  2, -1, 3, -1),
    counter: Array.of(-1, -1, -1, 2, -1, -1, 1, -1),
    drums:   Array.of(1, 0, 0, 0, 1, 0, 0, 0)
  },
  // Act II: Hansando — Crane Wing call-and-response (Pyeongjo vs Hirajoshi, 460 ms pulse)
  {
    scale: PYEONGJO,
    stepMs: 460,
    bass:    Array.of(0, 3, 4, 3, 0, 3, 2, 3),
    melody:  Array.of(5, -1, 6, 5, 4, -1, 3, -1),
    counter: Array.of(-1, 3, -1, 4, -1, 2, -1, 1),
    drums:   Array.of(1, 0, 0, 1, 1, 0, 0, 0)
  },
  // Act III: Myeongnyang — Urgent Uldolmok current (Gyemyeonjo minor, 400 ms pulse)
  {
    scale: GYEMYEON,
    stepMs: 400,
    bass:    Array.of(0, 0, 3, 0, 2, 0, 3, 2),
    melody:  Array.of(4, -1, 5, 4, 3, 2, 3, -1),
    counter: Array.of(-1, 2, -1, 3, -1, 1, -1, 2),
    drums:   Array.of(1, 0, 1, 0, 1, 0, 1, 0)
  },
  // Act IV: Noryang — Dignified pre-dawn processional (Pyeongjo, 500 ms pulse)
  {
    scale: PYEONGJO,
    stepMs: 500,
    bass:    Array.of(0, -1, 2, 3, 4, -1, 3, 0),
    melody:  Array.of(5, 4, 5, -1, 6, 5, 4, -1),
    counter: Array.of(-1, 3, -1, 4, -1, 3, -1, 2),
    drums:   Array.of(1, 0, 0, 0, 1, 0, 1, 0)
  }
);

export function createImjinAcousticEngine() {
  let ctx = null;
  let masterLpf = null;
  let limiter = null;
  let muted = true;

  let beatTimer = null;
  let beatIdx = 0;
  let battleIndex = 0;
  let completedTurns = 0;
  let endingEffect = "NONE";
  let lastBrushPluckMs = 0;

  const ensure = () => {
    if (!ctx && typeof window !== "undefined") {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();

      masterLpf = ctx.createBiquadFilter();
      masterLpf.type = "lowpass";
      masterLpf.frequency.setValueAtTime(740, ctx.currentTime);

      limiter = ctx.createDynamicsCompressor();
      limiter.threshold.setValueAtTime(-18, ctx.currentTime);
      limiter.knee.setValueAtTime(0, ctx.currentTime);
      limiter.ratio.setValueAtTime(20, ctx.currentTime);
      limiter.attack.setValueAtTime(0.004, ctx.currentTime);
      limiter.release.setValueAtTime(0.24, ctx.currentTime);

      masterLpf.connect(limiter);
      limiter.connect(ctx.destination);
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  const pluckSilkString = (freq, {
    delaySec = 0,
    pan = 0,
    peak = 0.05,
    decaySec = 0.85,
    bendSemitones = 0,
    crisp = false
  } = {}) => {
    if (muted || !freq) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + delaySec;

    const fund = c.createOscillator();
    const over = c.createOscillator();
    const overGain = c.createGain();
    const env = c.createGain();

    fund.type = "sine";
    fund.frequency.setValueAtTime(freq, t0);

    over.type = "sine";
    over.frequency.setValueAtTime(freq * 2, t0);
    overGain.gain.setValueAtTime(crisp ? 0.3 : 0.16, t0);
    overGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);

    if (bendSemitones > 0 && decaySec >= 0.75) {
      const target = freq * Math.pow(2, bendSemitones / 12);
      fund.frequency.setValueAtTime(freq, t0 + 0.14);
      fund.frequency.exponentialRampToValueAtTime(target, t0 + 0.36);
      fund.frequency.exponentialRampToValueAtTime(freq, t0 + 0.65);
    }

    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + 0.01);
    env.gain.exponentialRampToValueAtTime(peak * 0.38, t0 + 0.14);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + decaySec);

    fund.connect(env);
    over.connect(overGain);
    overGain.connect(env);

    if (typeof c.createStereoPanner === "function") {
      const p = c.createStereoPanner();
      p.pan.setValueAtTime(pan, t0);
      env.connect(p);
      p.connect(masterLpf);
    } else {
      env.connect(masterLpf);
    }

    fund.start(t0);
    over.start(t0);
    fund.stop(t0 + decaySec + 0.04);
    over.stop(t0 + decaySec + 0.04);
  };

  const playFrameDrum = (freq = 86, peak = 0.045) => {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 1.4, t0);
    osc.frequency.exponentialRampToValueAtTime(freq, t0 + 0.08);
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.32);
    osc.connect(env);
    env.connect(masterLpf);
    osc.start(t0);
    osc.stop(t0 + 0.36);
  };

  // Cohesive 8-beat measure engine that escalates smoothly with completedTurns (0..4)
  const scheduleBeat = () => {
    if (muted || typeof window === "undefined") return;
    const score = ACT_SCORES.at(battleIndex);
    const scale = score.scale;
    const step = beatIdx % 8;
    const isDownbeat = step === 0 || step === 4;
    beatIdx += 1;

    // Layer 0 (Always active): Gentle Gayageum lower-string ostinato
    const bNote = score.bass.at(step);
    if (bNote >= 0) {
      pluckSilkString(scale.at(bNote), {
        pan: -0.25,
        peak: isDownbeat ? 0.046 : 0.034,
        decaySec: 0.95
      });
    }

    // Layer 1 (Maneuver 1+): Expressive Gayageum lead melody
    if (completedTurns >= 1) {
      const mNote = score.melody.at(step);
      if (mNote >= 0) {
        pluckSilkString(scale.at(mNote), {
          pan: -0.15,
          peak: 0.052,
          decaySec: isDownbeat ? 1.1 : 0.78,
          bendSemitones: isDownbeat ? 0.55 : 0
        });
      }
    }

    // Layer 2 (Maneuver 2+): Japanese Shamisen counter-voice in rhythmic lockstep
    if (completedTurns >= 2) {
      const cNote = score.counter.at(step);
      if (cNote >= 0) {
        pluckSilkString(HIRAJOSHI.at(cNote), {
          pan: 0.35,
          peak: 0.042,
          decaySec: 0.58,
          crisp: true
        });
      }
    }

    // Layer 3 (Maneuver 3+): Traditional Buk / Janggu drum pulse
    if (completedTurns >= 3 && score.drums.at(step) === 1) {
      const drumPitch = battleIndex === 2 ? 78 : battleIndex === 3 ? 72 : 88;
      playFrameDrum(drumPitch, isDownbeat ? 0.052 : 0.036);
    }

    // Layer 4 (Maneuver 4 Victory): Harmonic octave reinforcement on downbeats
    if (completedTurns >= 4 && isDownbeat && bNote >= 0) {
      pluckSilkString(scale.at(bNote) * 2, {
        pan: 0.15,
        peak: 0.038,
        decaySec: 1.25
      });
    }

    beatTimer = window.setTimeout(scheduleBeat, score.stepMs);
  };

  // Unique tactical signature flourish matching each battle's ending tactic
  const playTacticalSignature = () => {
    if (muted) return;
    const score = ACT_SCORES.at(battleIndex);
    const scale = score.scale;

    if (endingEffect === "FIRE_ARROWS") {
      // Ascending rapid pentatonic arc (Okpo fire arrows)
      Array.of(0, 2, 3, 4, 5).forEach((n, i) => {
        pluckSilkString(scale.at(n), { delaySec: i * 0.08, pan: -0.2 + i * 0.1, peak: 0.085, decaySec: 0.75 });
      });
    } else if (endingEffect === "CANNON_VOLLEY") {
      // Converging Crane Wing stereo chord + drum (Hansando)
      playFrameDrum(76, 0.065);
      pluckSilkString(scale.at(0), { pan: -0.4, peak: 0.09, decaySec: 1.1 });
      pluckSilkString(scale.at(3), { pan:  0.4, peak: 0.09, decaySec: 1.1 });
      pluckSilkString(scale.at(5), { delaySec: 0.12, pan: 0, peak: 0.095, decaySec: 1.2 });
    } else if (endingEffect === "TIDAL_SURGE") {
      // Surging wave crest arpeggio up and back (Myeongnyang tide reversal)
      Array.of(0, 2, 4, 5, 4, 2).forEach((n, i) => {
        pluckSilkString(scale.at(n), { delaySec: i * 0.09, pan: 0, peak: 0.088, decaySec: 0.85, bendSemitones: 0.4 });
      });
    } else if (endingEffect === "DAWN_DRUM") {
      // Solemn Noryang sunrise drum & resonant fifths
      playFrameDrum(68, 0.07);
      setTimeout(() => playFrameDrum(68, 0.06), 340);
      pluckSilkString(scale.at(0), { delaySec: 0.18, pan: -0.25, peak: 0.09, decaySec: 1.4 });
      pluckSilkString(scale.at(3), { delaySec: 0.36, pan:  0.25, peak: 0.09, decaySec: 1.4 });
    } else {
      // Standard maneuver progression chord
      pluckSilkString(scale.at(0), { delaySec: 0,    pan: -0.25, peak: 0.08, decaySec: 0.7 });
      pluckSilkString(scale.at(2), { delaySec: 0.12, pan:  0,    peak: 0.08, decaySec: 0.7 });
      pluckSilkString(scale.at(4), { delaySec: 0.24, pan:  0.25, peak: 0.09, decaySec: 0.9, bendSemitones: 0.45 });
    }
  };

  return {
    isMuted: () => muted,
    toggleMute: () => {
      muted = !muted;
      ensure();
      if (!muted) {
        if (!beatTimer) scheduleBeat();
      } else if (beatTimer && typeof window !== "undefined") {
        window.clearTimeout(beatTimer);
        beatTimer = null;
      }
      return muted;
    },
    syncState: (state) => {
      const changedAct = battleIndex !== state.battleIndex;
      battleIndex = state.battleIndex;
      completedTurns = state.completedTurns;

endingEffect = state.endingEffect || "NONE";
if (changedAct) beatIdx = 0;
},
playBrushPluck: (speed = 1) => {
if (muted) return;
const nowMs = Date.now();
if (nowMs - lastBrushPluckMs < 115) return;
lastBrushPluckMs = nowMs;
const scale = ACT_SCORES.at(battleIndex).scale;
const idx = Math.min(scale.length - 1, Math.max(0, Math.floor(speed / 5)));
pluckSilkString(scale.at(idx), {
pan: 0,
peak: 0.095,
decaySec: 0.58,
bendSemitones: 0.35
});
},
playManeuverChime: () => {
playTacticalSignature();
}
};
}
