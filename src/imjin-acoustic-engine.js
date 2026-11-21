/**
 * src/imjin-acoustic-engine.js — Pure Plucked Gayageum & Shamisen Pentatonic Counterpoint (<= 740 Hz)
 * Zero sustained bass drones and zero triangle-wave chiptune pads.
 * Uses pure sine + soft 2nd-harmonic plucked envelopes in traditional pentatonic modes:
 *  - Joseon Gayageum (Left): D Pyeongjo Pentatonic (D3, E3, G3, A3, B3, D4, E4)
 *  - Japanese Shamisen (Right): D Hirajoshi Pentatonic (D3, Eb3, G3, A3, Bb3, D4, Eb4)
 */

// Traditional Korean Pyeongjo (Sol-mode) & Gyemyeonjo (La-mode) pentatonic frequencies (Hz)
const JOSEON_PYEONGJO = Array.of(146.83, 164.81, 196.00, 220.00, 246.94, 293.66, 329.63);
const JOSEON_GYEMYEON = Array.of(146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23);

// Traditional Japanese Hirajoshi & In-sen pentatonic frequencies (Hz)
const JAPAN_HIRAJOSHI = Array.of(146.83, 155.56, 196.00, 220.00, 233.08, 293.66, 311.13);

export function createImjinAcousticEngine() {
  let ctx = null;
  let masterLpf = null;
  let limiter = null;
  let muted = true;

  let phraseTimer = null;
  let step = 0;
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

  /**
   * Plucked silk-string voice (Gayageum / Shamisen):
   * Crisp attack, rapid initial transient drop, warm wooden decay (0.45s–0.95s),
   * and optional nonghyeon finger-pressure pitch bend after the pluck.
   */
  const pluckPentatonicString = (freq, {
    delaySec = 0,
    pan = 0,
    peak = 0.055,
    decaySec = 0.85,
    bendSemitones = 0,
    crispPlectrum = false
  } = {}) => {
    if (muted || !freq) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + delaySec;

    const fund = c.createOscillator();
    const harm2 = c.createOscillator();
    const harm2Gain = c.createGain();
    const env = c.createGain();

    fund.type = "sine";
    fund.frequency.setValueAtTime(freq, t0);

    harm2.type = "sine";
    harm2.frequency.setValueAtTime(freq * 2, t0);
    // Shamisen bachi plectrum has a sharper initial 2nd harmonic that dies away quickly
    harm2Gain.gain.setValueAtTime(crispPlectrum ? 0.34 : 0.18, t0);
    harm2Gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);

    // Traditional Korean nonghyeon (left-hand string press pitch ornament after pluck)
    if (bendSemitones > 0 && decaySec >= 0.7) {
      const targetFreq = freq * Math.pow(2, bendSemitones / 12);
      fund.frequency.setValueAtTime(freq, t0 + 0.14);
      fund.frequency.exponentialRampToValueAtTime(targetFreq, t0 + 0.34);
      fund.frequency.exponentialRampToValueAtTime(freq, t0 + 0.62);
      harm2.frequency.setValueAtTime(freq * 2, t0 + 0.14);
      harm2.frequency.exponentialRampToValueAtTime(targetFreq * 2, t0 + 0.34);
      harm2.frequency.exponentialRampToValueAtTime(freq * 2, t0 + 0.62);
    }

    // Plucked amplitude envelope: instant attack -> fast initial drop -> natural decay to silence
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + 0.008);
    env.gain.exponentialRampToValueAtTime(peak * 0.35, t0 + 0.12);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + decaySec);

    fund.connect(env);
    harm2.connect(harm2Gain);
    harm2Gain.connect(env);

    if (typeof c.createStereoPanner === "function") {
      const p = c.createStereoPanner();
      p.pan.setValueAtTime(pan, t0);
      env.connect(p);
      p.connect(masterLpf);
    } else {
      env.connect(masterLpf);
    }

    fund.start(t0);
    harm2.start(t0);
    fund.stop(t0 + decaySec + 0.04);
    harm2.stop(t0 + decaySec + 0.04);
  };

  // Sparse, dry Buk / Taiko wooden rim tap (only on major battle turns, zero rumble)
  const playWoodenDrumTap = (freq = 92, pan = 0) => {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const env = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq * 1.45, t0);
    osc.frequency.exponentialRampToValueAtTime(freq, t0 + 0.07);
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(0.048, t0 + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
    osc.connect(env);
    if (typeof c.createStereoPanner === "function") {
      const p = c.createStereoPanner();
      p.pan.setValueAtTime(pan, t0);
      env.connect(p);
      p.connect(masterLpf);
    } else {
      env.connect(masterLpf);
    }
    osc.start(t0);
    osc.stop(t0 + 0.32);
  };

  // Sparse, meditative pentatonic call-and-response (plenty of natural silence, zero bass drone)
  const schedulePentatonicPhrase = () => {
    if (muted || typeof window === "undefined") return;

    const joseonScale = battleIndex === 2 ? JOSEON_GYEMYEON : JOSEON_PYEONGJO;
    // -1 = natural silence / breath rest
    const jPattern = Array.of(0, 2, 3, -1, 4, 3, 2, 0, -1, -1);
    const sPattern = Array.of(-1, -1, 3, 4, -1, 2, 1, -1, 0, -1);

    const slot = step % jPattern.length;
    const jIdx = jPattern.at(slot);
    const sIdx = sPattern.at(slot);
    step += 1;

    // Joseon Gayageum (left channel, warm silk pluck + subtle nonghyeon bend on long notes)
    if (jIdx >= 0) {
      const isPhraseEnd = jPattern.at((slot + 1) % jPattern.length) === -1;
      pluckPentatonicString(joseonScale.at(jIdx), {
        pan: -0.38,
        peak: 0.046,
        decaySec: isPhraseEnd ? 1.15 : 0.72,
        bendSemitones: isPhraseEnd ? 0.65 : 0,
        crispPlectrum: false
      });
    }

    // Japanese Shamisen (right channel, taut Hirajoshi counterpoint entering as battle unfolds)
    if (completedTurns >= 1 && sIdx >= 0) {
      pluckPentatonicString(JAPAN_HIRAJOSHI.at(sIdx), {
        delaySec: 0.24,
        pan: 0.38,
        peak: 0.042,
        decaySec: 0.52,
        bendSemitones: 0,
        crispPlectrum: true
      });
    }

    // Occasional soft Buk / Taiko frame pulse during Myeongnyang & Noryang
    if (completedTurns >= 2 && (battleIndex === 2 || battleIndex === 3) && slot === 0) {
      playWoodenDrumTap(88, 0);
    }

    const paceMs = battleIndex === 2 ? 640 : 780;
    phraseTimer = window.setTimeout(schedulePentatonicPhrase, paceMs);
  };

  return {
    isMuted: () => muted,
    toggleMute: () => {
      muted = !muted;
      ensure();
      if (!muted) {
        if (!phraseTimer) schedulePentatonicPhrase();
      } else if (phraseTimer && typeof window !== "undefined") {
        window.clearTimeout(phraseTimer);
        phraseTimer = null;
      }
      return muted;
    },
    syncState: (state) => {
      battleIndex = state.battleIndex;
      completedTurns = state.completedTurns;
    },
    // Foreground Celestial Brush pluck in pure Korean Pyeongjo pentatonic (stands out clearly)
    playBrushPluck: (speed = 1) => {
      if (muted) return;
      const nowMs = Date.now();
      if (nowMs - lastBrushPluckMs < 115) return;
      lastBrushPluckMs = nowMs;
      const scale = battleIndex === 2 ? JOSEON_GYEMYEON : JOSEON_PYEONGJO;
      const idx = Math.min(scale.length - 1, Math.max(0, Math.floor(speed / 5)));
      pluckPentatonicString(scale.at(idx), {
        pan: 0,
        peak: 0.095,
        decaySec: 0.58,
        bendSemitones: 0.35,
        crispPlectrum: false
      });
    },
    // Pentatonic arpeggio flourish on maneuver completion
    playManeuverChime: () => {
      if (muted) return;
      const scale = battleIndex === 2 ? JOSEON_GYEMYEON : JOSEON_PYEONGJO;
      pluckPentatonicString(scale.at(0), { delaySec: 0,    pan: -0.25, peak: 0.085, decaySec: 0.75 });
      pluckPentatonicString(scale.at(2), { delaySec: 0.13, pan:  0,    peak: 0.085, decaySec: 0.75 });
      pluckPentatonicString(scale.at(4), { delaySec: 0.26, pan:  0.25, peak: 0.095, decaySec: 0.95, bendSemitones: 0.5 });
    }
  };
}
