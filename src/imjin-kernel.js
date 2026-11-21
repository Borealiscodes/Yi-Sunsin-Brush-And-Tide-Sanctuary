/**
 * src/imjin-kernel.js — Four Selectable Historical Naval Chapters (1592–1598)
 */

export const IMJIN_CHAPTERS = Array.of(
  {
    id: "okpo-1592",
    tabLabel: "I. Okpo (1592)",
    title: "Chapter I: Battle of Okpo (May 1592)",
    musicLabel: "Counterpoint I: Gayageum Pyeongjo vs. Distant Taiko",
    steps: Array.of(
      { shape: "WAVE", key: "~", ink: Array.of(36, 74, 118), prompt: "1/6 — Sweep an indigo wave (~) to read the coastal currents outside Okpo Harbor." },
      { shape: "SLASH", key: "/", ink: Array.of(28, 36, 48), prompt: "2/6 — Draw a decisive slash (/) to chart the approach channel into the bay." },
      { shape: "CIRCLE", key: "O", ink: Array.of(196, 154, 76), prompt: "3/6 — Paint a circle (O) to rally the Joseon Panokseon squadron in quiet order." },
      { shape: "SLASH", key: "/", ink: Array.of(224, 138, 54), prompt: "4/6 — Draw an upward slash (/) to break the anchored blockade line." },
      { shape: "WAVE", key: "~", ink: Array.of(98, 128, 152), prompt: "5/6 — Sweep a soft wave (~) to clear harbor smoke across the water." },
      { shape: "CROSS", key: "+", ink: Array.of(246, 214, 122), prompt: "6/6 — Draw a cross (+) to anchor the fleet in Admiral Yi's first naval victory." }
    )
  },
  {
    id: "hansando-1592",
    tabLabel: "II. Hansando (1592)",
    title: "Chapter II: Battle of Hansando — Crane Wing (August 1592)",
    musicLabel: "Counterpoint II: Shamisen vs. Gayageum Call-and-Response",
    steps: Array.of(
      { shape: "WAVE", key: "~", ink: Array.of(42, 92, 136), prompt: "1/6 — Sweep a wave (~) to draw the vanguard out from the narrow strait into open sea." },
      { shape: "SLASH", key: "/", ink: Array.of(34, 42, 54), prompt: "2/6 — Draw a slash (/) to signal the decoy vessels to turn about." },
      { shape: "CIRCLE", key: "O", ink: Array.of(214, 172, 84), prompt: "3/6 — Paint a sweeping circle (O) to curve the fleet into the Hakikjin (Crane Wing) crescent." },
      { shape: "SLASH", key: "/", ink: Array.of(64, 96, 72), prompt: "4/6 — Draw a bold slash (/) to launch the iron-spiked Geobukseon (Turtle Ship) dragon prow." },
      { shape: "CIRCLE", key: "O", ink: Array.of(236, 152, 62), prompt: "5/6 — Paint a tighter circle (O) to close the Crane Wing pincers across the strait." },
      { shape: "CROSS", key: "+", ink: Array.of(252, 226, 144), prompt: "6/6 — Draw a lantern cross (+) to illuminate Hansando Strait in calm triumph." }
    )
  },
  {
    id: "myeongnyang-1597",
    tabLabel: "III. Myeongnyang (1597)",
    title: "Chapter III: Battle of Myeongnyang — 13 Against 133 (October 1597)",
    musicLabel: "Counterpoint III: Solo Karplus-Strong Plucked String & Buk Drum",
    steps: Array.of(
      { shape: "SLASH", key: "/", ink: Array.of(24, 30, 42), prompt: "1/6 — Draw a heavy slash (/) to drop iron anchors against the roaring Uldolmok Strait." },
      { shape: "WAVE", key: "~", ink: Array.of(32, 68, 112), prompt: "2/6 — Sweep a churning wave (~) as 13 warships face 133 in the narrow gorge." },
      { shape: "CIRCLE", key: "O", ink: Array.of(204, 156, 72), prompt: "3/6 — Paint a steady circle (O) to hold Admiral Yi's flagship unyielding at the center." },
      { shape: "WAVE", key: "~", ink: Array.of(76, 134, 168), prompt: "4/6 — Sweep a reversing wave (~) as the Uldolmok tidal current turns against the invasion fleet." },
      { shape: "SLASH", key: "/", ink: Array.of(232, 164, 68), prompt: "5/6 — Draw a swift slash (/) to counter-attack with the surging tide." },
      { shape: "CROSS", key: "+", ink: Array.of(255, 238, 168), prompt: "6/6 — Draw a cross (+) to part the storm clouds over Jindo Island." }
    )
  },
  {
    id: "noryang-1598",
    tabLabel: "IV. Noryang (1598)",
    title: "Chapter IV: Battle of Noryang — Dawn Drumbeat (December 1598)",
    musicLabel: "Counterpoint IV: Full Korean-Japanese Chamber Dawn Resolution",
    steps: Array.of(
      { shape: "CIRCLE", key: "O", ink: Array.of(48, 66, 98), prompt: "1/6 — Paint a midnight circle (O) to form the pre-dawn blockade in Noryang Strait." },
      { shape: "WAVE", key: "~", ink: Array.of(84, 108, 138), prompt: "2/6 — Sweep a quiet wave (~) as allied vessels glide through sea mist." },
      { shape: "SLASH", key: "/", ink: Array.of(212, 136, 62), prompt: "3/6 — Draw a slash (/) to intercept the retreating fleet before daybreak." },
      { shape: "CIRCLE", key: "O", ink: Array.of(238, 182, 82), prompt: "4/6 — Paint a resonant circle (O) to sustain Admiral Yi's steady war-drum cadence." },
      { shape: "WAVE", key: "~", ink: Array.of(244, 212, 138), prompt: "5/6 — Sweep a dawn wave (~) as golden morning mist lifts across the waves." },
      { shape: "CROSS", key: "+", ink: Array.of(255, 246, 196), prompt: "6/6 — Draw a sunrise cross (+) to honor peace returning to the southern sea." }
    )
  }
);

export function createImjinState(chapterIndex = 0) {
  const idx = Math.max(0, Math.min(IMJIN_CHAPTERS.length - 1, chapterIndex | 0));
  const ch = IMJIN_CHAPTERS.at(idx);
  return {
    chapterIndex: idx,
    stepIndex: 0,
    completedSteps: 0,
    isComplete: false,
    narration: ch.title + " — " + ch.steps.at(0).prompt
  };
}

export function applyImjinGesture(state, detectedShape) {
  const ch = IMJIN_CHAPTERS.at(state.chapterIndex);
  if (state.isComplete) {
    return {
      ...state,
      narration: ch.title + " is complete (6/6). Continue painting sumi-e strokes on Hanji paper or select another battle."
    };
  }

  const step = ch.steps.at(state.stepIndex);
  if (!detectedShape || detectedShape === "NONE") {
    return {
      ...state,
      narration: "Ink brush touches the Hanji scroll gently. " + step.prompt
    };
  }

  if (detectedShape !== step.shape) {
    return {
      ...state,
      narration: "You brushed a " + detectedShape + " stroke. Next maneuver: " + step.prompt
    };
  }

  const nextDone = state.completedSteps + 1;
  if (state.stepIndex < ch.steps.length - 1) {
    const nextStep = ch.steps.at(state.stepIndex + 1);
    return {
      ...state,
      stepIndex: state.stepIndex + 1,
      completedSteps: nextDone,
      narration: "Maneuver " + nextDone + "/6 complete. " + nextStep.prompt
    };
  }

  return {
    ...state,
    completedSteps: 6,
    isComplete: true,
    narration: ch.title + " complete (6/6). Rest in the full chamber counterpoint or explore another battle."
  };
}

export function imjinProgressBraille(state) {
  const levels = Array.of(0x2800, 0x2840, 0x2846, 0x28c7, 0x28e7, 0x28f7, 0x28ff);
  const idx = Math.max(0, Math.min(6, state.completedSteps));

return String.fromCodePoint(levels.at(idx)).repeat(5);
}
