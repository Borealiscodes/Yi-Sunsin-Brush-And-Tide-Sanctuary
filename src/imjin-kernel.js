/**
 * src/imjin-kernel.js — Top-Down Naval Tactics Engine (Okpo, Hansando, Myeongnyang, Noryang)
 */

export const NAVAL_BATTLES = Array.of(
  {
    id: "okpo-1592",
    tabLabel: "I. Okpo (1592)",
    title: "Battle of Okpo (May 1592)",
    windDir: "SE",
    tideDir: "Northbound Flood",
    briefing: "Japanese transports lie anchored inside Okpo Bay. Read the harbor tide (~ Wave) to align your approach.",
    turns: Array.of(
      {
        orderName: "Read Harbor Current",
        shape: "WAVE",
        key: "~",
        formation: "COLUMN",
        prompt: "Maneuver 1/4: Sweep a WAVE (~) to align the Joseon vanguard with the northbound harbor tide.",
        outcome: "The squadron rides the flood current silently into Okpo Bay."
      },
      {
        orderName: "Cut Escape Channel",
        shape: "SLASH",
        key: "/",
        formation: "LINE_ABREAST",
        prompt: "Maneuver 2/4: Draw a SLASH (/) to drive your Panokseon warships across the harbor mouth.",
        outcome: "Your broadside line blocks the seaward exit."
      },
      {
        orderName: "Crescent Pinch",
        shape: "CIRCLE",
        key: "O",
        formation: "CRANE_WING",
        prompt: "Maneuver 3/4: Draw a CIRCLE (O) to curve both wings around the anchored fleet.",
        outcome: "Enemy vessels are pinned against the rocky cove."
      },
      {
        orderName: "Coordinated Cannon Volley",
        shape: "CROSS",
        key: "+",
        formation: "VOLLEY",
        prompt: "Maneuver 4/4: Draw a CROSS (+) to unleash a synchronized Cheonja-chongtong cannon volley.",
        outcome: "Victory at Okpo! Admiral Yi secures Joseon's first naval triumph."
      }
    )
  },
  {
    id: "hansando-1592",
    tabLabel: "II. Hansando (1592)",
    title: "Battle of Hansando — Crane Wing (Aug 1592)",
    windDir: "NW",
    tideDir: "Open Strait Ebb",
    briefing: "Enemy warships hold the narrow Gyeonnaeryang channel. Feign retreat (~ Wave) to lure them into open water.",
    turns: Array.of(
      {
        orderName: "Feigned Retreat",
        shape: "WAVE",
        key: "~",
        formation: "DECOY_RETREAT",
        prompt: "Maneuver 1/4: Sweep a WAVE (~) to draw the enemy vanguard out into the open sea off Hansando.",
        outcome: "The pursuit fleet takes the bait and enters wide water."
      },
      {
        orderName: "Spring Hakikjin (Crane Wing)",
        shape: "CIRCLE",
        key: "O",
        formation: "CRANE_WING",
        prompt: "Maneuver 2/4: Draw a CIRCLE (O) to snap the fleet into the legendary Crane Wing (Hakikjin) crescent.",
        outcome: "Left and right wings wheel outward in a sweeping U-formation."
      },
      {
        orderName: "Geobukseon Dragon Charge",
        shape: "SLASH",
        key: "/",
        formation: "TURTLE_SPEAR",
        prompt: "Maneuver 3/4: Draw a SLASH (/) to send iron-clad Turtle Ships (Geobukseon) straight into the center.",
        outcome: "The dragon-prow Turtle Ships shatter the enemy flagship line."
      },
      {
        orderName: "Encirclement Volley",
        shape: "CROSS",
        key: "+",
        formation: "VOLLEY",
        prompt: "Maneuver 4/4: Draw a CROSS (+) to fire converging broadsides from all angles of the Crane Wing.",
        outcome: "Decisive victory at Hansando! Sea lanes to Jeolla Province are saved."
      }
    )
  },
  {
    id: "myeongnyang-1597",
    tabLabel: "III. Myeongnyang (1597)",
    title: "Battle of Myeongnyang — 13 vs 133 (Oct 1597)",
    windDir: "NNE",
    tideDir: "Uldolmok Reversing Torrent",
    briefing: "Outnumbered 13 ships to 133 in the narrow Uldolmok Strait. Drop iron anchors (/ Slash) against the roaring current.",
    turns: Array.of(
      {
        orderName: "Anchor Against the Gorge",
        shape: "SLASH",
        key: "/",
        formation: "ANCHORED_LINE",
        prompt: "Maneuver 1/4: Draw a SLASH (/) to drop heavy anchors in the narrowest choke point of Uldolmok.",
        outcome: "Admiral Yi's flagship holds firm while the narrow strait bottlenecks the enemy."
      },
      {
        orderName: "Ride the Turning Tide",
        shape: "WAVE",
        key: "~",
        formation: "TIDE_SHIFT",
        prompt: "Maneuver 2/4: Sweep a WAVE (~) as the violent Uldolmok current reverses direction.",
        outcome: "Enemy ships collide helplessly as the roaring tide turns southward."
      },
      {
        orderName: "Rally the 12 Warships",
        shape: "CIRCLE",
        key: "O",
        formation: "CRANE_WING",
        prompt: "Maneuver 3/4: Draw a CIRCLE (O) to rally all 12 remaining Panokseon vessels beside the flagship.",
        outcome: "Inspired by the flagship's stand, the entire squadron closes ranks."
      },
      {
        orderName: "Down-Current Counter-Strike",
        shape: "CROSS",
        key: "+",
        formation: "VOLLEY",
        prompt: "Maneuver 4/4: Draw a CROSS (+) to ride the surging current down on the tangled fleet.",
        outcome: "Miracle at Myeongnyang! 13 ships defeat 133 without losing a single vessel."
      }
    )
  },
  {
    id: "noryang-1598",
    tabLabel: "IV. Noryang (1598)",
    title: "Battle of Noryang — Dawn Blockade (Dec 1598)",
    windDir: "E",
    tideDir: "Pre-Dawn Slack Water",
    briefing: "Pre-dawn mist blankets Noryang Strait. Form a silent night blockade (O Circle) before daybreak.",
    turns: Array.of(
      {
        orderName: "Pre-Dawn Blockade",
        shape: "CIRCLE",
        key: "O",
        formation: "CRANE_WING",
        prompt: "Maneuver 1/4: Draw a CIRCLE (O) to seal the western exit of Noryang Strait under cover of darkness.",
        outcome: "Allied ships hold silent stations in the midnight mist."
      },
      {
        orderName: "Mist Ambush",
        shape: "WAVE",
        key: "~",
        formation: "LINE_ABREAST",
        prompt: "Maneuver 2/4: Sweep a WAVE (~) to glide forward on the pre-dawn swell.",
        outcome: "Warships emerge from the fog at point-blank range."
      },
      {
        orderName: "Turtle Ship Breakthrough",
        shape: "SLASH",
        key: "/",
        formation: "TURTLE_SPEAR",
        prompt: "Maneuver 3/4: Draw a SLASH (/) to cleave the retreating column in two.",
        outcome: "The vanguard is cut off from the main fleet."
      },
      {
        orderName: "Sunrise Drum & Final Volley",
        shape: "CROSS",
        key: "+",
        formation: "VOLLEY",
        prompt: "Maneuver 4/4: Draw a CROSS (+) to beat the war drum at sunrise and complete the campaign.",
        outcome: "Dawn breaks over Noryang Strait; the seven-year war ends in peace."
      }
    )
  }
);

export function createTacticalState(battleIndex = 0) {
  const idx = Math.max(0, Math.min(NAVAL_BATTLES.length - 1, battleIndex | 0));
  const b = NAVAL_BATTLES.at(idx);
  return {
    battleIndex: idx,
    turnIndex: 0,
    completedTurns: 0,
    formation: "COLUMN",
    isVictory: false,
    narration: b.title + " — " + b.briefing + " " + b.turns.at(0).prompt
  };
}

export function applyTacticalGesture(state, detectedShape) {
  const b = NAVAL_BATTLES.at(state.battleIndex);
  if (state.isVictory) {
    return {
      ...state,
      narration: b.title + " won! Select another historical battle above or replay this engagement."
    };
  }

  const turn = b.turns.at(state.turnIndex);
  if (!detectedShape || detectedShape === "NONE") {
    return {
      ...state,
      narration: "Stand by on the command deck. " + turn.prompt
    };
  }

  if (detectedShape !== turn.shape) {
    return {
      ...state,
      narration: "Issued " + detectedShape + ", but Admiral Yi signals " + turn.orderName + ". " + turn.prompt
    };
  }

  const nextCompleted = state.completedTurns + 1;
  if (state.turnIndex < b.turns.length - 1) {
    const nextTurn = b.turns.at(state.turnIndex + 1);
    return {
      ...state,
      turnIndex: state.turnIndex + 1,
      completedTurns: nextCompleted,
      formation: turn.formation,
      narration: turn.outcome + " Next: " + nextTurn.prompt
    };
  }

  return {
    ...state,
    completedTurns: 4,
    formation: "VOLLEY",
    isVictory: true,
    narration: turn.outcome + " (" + b.title + " Complete — 4/4 Maneuvers)."
  };
}

export function tacticalProgressBraille(state) {
  const levels = Array.of(0x2800, 0x2846, 0x28c7, 0x28f7, 0x28ff);
  const idx = Math.max(0, Math.min(4, state.completedTurns));
  return String.fromCodePoint(levels.at(idx)).repeat(5);
}
