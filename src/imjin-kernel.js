/**
 * src/imjin-kernel.js — Historically Distinct Naval Engagements (Okpo, Hansando, Myeongnyang, Noryang)
 */

export const NAVAL_BATTLES = Array.of(
  {
    id: "okpo-1592",
    tabLabel: "I. Okpo (24 vs 50)",
    title: "Battle of Okpo (May 1592)",
    joseonTotal: 24,
    enemyTotal: 50,
    turtleCount: 0,
    windDir: "SE",
    tideDir: "Northbound Flood",
    briefing: "24 Joseon Panokseon approach 50 anchored transports in Okpo Bay. Ride the flood current (~ Wave) into the harbor.",
    turns: Array.of(
      {
        orderName: "Harbor Tide Approach",
        shape: "WAVE",
        key: "~",
        formation: "COLUMN",
        endingEffect: "NONE",
        enemySunk: 0,
        prompt: "1/4: Sweep a WAVE (~) to ride the northbound flood current into Okpo Bay.",
        outcome: "All 24 Panokseon glide silently into the harbor mouth."
      },
      {
        orderName: "Seal Harbor Exit",
        shape: "SLASH",
        key: "/",
        formation: "LINE_ABREAST",
        endingEffect: "NONE",
        enemySunk: 6,
        prompt: "2/4: Draw a SLASH (/) to form a line abreast blocking the seaward escape.",
        outcome: "The Joseon line seals the bay; enemy transports are trapped against the shore."
      },
      {
        orderName: "Cove Crescent Pinch",
        shape: "CIRCLE",
        key: "O",
        formation: "CRANE_WING",
        endingEffect: "NONE",
        enemySunk: 14,
        prompt: "3/4: Draw a CIRCLE (O) to curve both wings into the cove around the anchored fleet.",
        outcome: "Both wings close in around the cove."
      },
      {
        orderName: "Fire-Arrow Barrage",
        shape: "CROSS",
        key: "+",
        formation: "CRANE_WING",
        endingEffect: "FIRE_ARROWS",
        enemySunk: 26,
        prompt: "4/4: Draw a CROSS (+) to loose flaming fire arrows (bijeok) into the anchored sails.",
        outcome: "Victory at Okpo! 26 transports burn in the harbor with zero Joseon ships lost."
      }
    )
  },
  {
    id: "hansando-1592",
    tabLabel: "II. Hansando (56 vs 73)",
    title: "Battle of Hansando — Crane Wing (Aug 1592)",
    joseonTotal: 56,
    enemyTotal: 73,
    turtleCount: 3,
    windDir: "NW",
    tideDir: "Open Strait Ebb",
    briefing: "56 Joseon warships (3 Geobukseon) face 73 warships off Hansando. Feign retreat (~ Wave) into open water.",
    turns: Array.of(
      {
        orderName: "Feigned Retreat",
        shape: "WAVE",
        key: "~",
        formation: "DECOY_RETREAT",
        endingEffect: "NONE",
        enemySunk: 0,
        prompt: "1/4: Sweep a WAVE (~) to lure the enemy vanguard out of Gyeonnaeryang Channel.",
        outcome: "The pursuit fleet takes the bait and enters the wide waters off Hansando."
      },
      {
        orderName: "Hakikjin (Crane Wing)",
        shape: "CIRCLE",
        key: "O",
        formation: "CRANE_WING",
        endingEffect: "NONE",
        enemySunk: 12,
        prompt: "2/4: Draw a CIRCLE (O) to wheel all 56 ships into the Crane Wing (Hakikjin) crescent.",
        outcome: "Left and right wings sweep outward in a giant U-encirclement."
      },
      {
        orderName: "Geobukseon Dragon Charge",
        shape: "SLASH",
        key: "/",
        formation: "TURTLE_SPEAR",
        endingEffect: "NONE",
        enemySunk: 32,
        prompt: "3/4: Draw a SLASH (/) to drive the 3 iron-roofed Turtle Ships into the enemy center.",
        outcome: "The dragon-prow Turtle Ships shatter the central command formation."
      },
      {
        orderName: "Pincer Encirclement",
        shape: "CROSS",
        key: "+",
        formation: "CRANE_WING",
        endingEffect: "CANNON_VOLLEY",
        enemySunk: 47,
        prompt: "4/4: Draw a CROSS (+) to close the Crane Wing pincers and fire converging broadsides.",
        outcome: "Decisive victory at Hansando! 47 of 73 enemy ships destroyed; sea lanes secured."
      }
    )
  },
  {
    id: "myeongnyang-1597",
    tabLabel: "III. Myeongnyang (13 vs 133)",
    title: "Battle of Myeongnyang — 13 vs 133 (Oct 1597)",
    joseonTotal: 13,
    enemyTotal: 133,
    turtleCount: 0,
    windDir: "NNE",
    tideDir: "Uldolmok Reversing Torrent",
    briefing: "13 Joseon Panokseon face 133 warships in the narrow Uldolmok Gorge. Drop iron anchors (/ Slash) in the channel.",
    turns: Array.of(
      {
        orderName: "Anchor in the Gorge",
        shape: "SLASH",
        key: "/",
        formation: "ANCHORED_LINE",
        endingEffect: "NONE",
        enemySunk: 4,
        prompt: "1/4: Draw a SLASH (/) to drop heavy anchors across the narrow Uldolmok choke point.",
        outcome: "Admiral Yi's flagship holds the narrow gorge while 133 ships bottleneck behind it."
      },
      {
        orderName: "Hold the Line",
        shape: "CIRCLE",
        key: "O",
        formation: "ANCHORED_LINE",
        endingEffect: "NONE",
        enemySunk: 11,
        prompt: "2/4: Draw a CIRCLE (O) to rally all 12 remaining warships beside the flagship.",
        outcome: "Inspired by the flagship's stand, all 13 vessels form an unbreakable defensive arc."
      },
      {
        orderName: "Uldolmok Tidal Reversal",
        shape: "WAVE",
        key: "~",
        formation: "TIDE_SHIFT",
        endingEffect: "TIDAL_SURGE",
        enemySunk: 22,
        prompt: "3/4: Sweep a WAVE (~) as the violent Uldolmok current reverses southward against the enemy.",
        outcome: "The roaring current reverses! Tangled enemy ships collide in the narrow gorge."
      },
      {
        orderName: "Down-Current Pursuit",
        shape: "CROSS",
        key: "+",
        formation: "LINE_ABREAST",
        endingEffect: "TIDAL_SURGE",
        enemySunk: 31,
        prompt: "4/4: Draw a CROSS (+) to ride the surging current down on the retreating vanguard.",
        outcome: "Miracle at Myeongnyang! 31 enemy warships sunk; all 13 Joseon ships survive."
      }
    )
  },
  {
    id: "noryang-1598",
    tabLabel: "IV. Noryang (63 vs 500)",
    title: "Battle of Noryang — Dawn Drumbeat (Dec 1598)",
    joseonTotal: 63,
    enemyTotal: 500,
    turtleCount: 4,
    windDir: "E",
    tideDir: "Pre-Dawn Slack Water",
    briefing: "63 Joseon warships seal Noryang Strait at midnight against 500 retreating vessels.",
    turns: Array.of(
      {
        orderName: "Midnight Strait Blockade",
        shape: "CIRCLE",
        key: "O",
        formation: "CRANE_WING",
        endingEffect: "NONE",
        enemySunk: 35,
        prompt: "1/4: Draw a CIRCLE (O) to form a silent pre-dawn blockade across Noryang Strait.",
        outcome: "63 Joseon ships seal the strait under midnight mist."
      },
      {
        orderName: "Pre-Dawn Mist Advance",
        shape: "WAVE",
        key: "~",
        formation: "LINE_ABREAST",
        endingEffect: "NONE",
        enemySunk: 85,
        prompt: "2/4: Sweep a WAVE (~) to advance silently through the fog.",
        outcome: "Allied ships emerge from the mist at close quarters."
      },
      {
        orderName: "Turtle Ship Breakthrough",
        shape: "SLASH",
        key: "/",
        formation: "TURTLE_SPEAR",
        endingEffect: "NONE",
        enemySunk: 145,
        prompt: "3/4: Draw a SLASH (/) to cleave the retreating column with the 4 Turtle Ships.",
        outcome: "The retreating formation is split in two across the strait."
      },
      {
        orderName: "Sunrise War-Drum Cadence",
        shape: "CROSS",
        key: "+",
        formation: "CRANE_WING",
        endingEffect: "DAWN_DRUM",
        enemySunk: 200,
        prompt: "4/4: Draw a CROSS (+) to beat the war drum at sunrise until the final ship retreats.",
        outcome: "Dawn breaks over Noryang Strait; Admiral Yi's drum beats steadily until peace is won."
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
    endingEffect: "NONE",
    joseonActive: b.joseonTotal,
    enemyActive: b.enemyTotal,
    isVictory: false,
    narration: b.title + " — " + b.briefing + " " + b.turns.at(0).prompt
  };
}

export function applyTacticalGesture(state, detectedShape) {
  const b = NAVAL_BATTLES.at(state.battleIndex);
  if (state.isVictory) {
    return {
      ...state,
      narration: b.title + " complete! Select another battle above or replay this engagement."
    };
  }

  const turn = b.turns.at(state.turnIndex);
  if (!detectedShape || detectedShape === "NONE") {
    return {
      ...state,
      narration: "Command deck ready. " + turn.prompt
    };
  }

  if (detectedShape !== turn.shape) {
    return {
      ...state,
      narration: "Brushed " + detectedShape + ", but Admiral Yi signals " + turn.orderName + ". " + turn.prompt
    };
  }

  const nextCompleted = state.completedTurns + 1;
  const remainingEnemy = Math.max(0, b.enemyTotal - turn.enemySunk);

  if (state.turnIndex < b.turns.length - 1) {
    const nextTurn = b.turns.at(state.turnIndex + 1);
    return {
      ...state,
      turnIndex: state.turnIndex + 1,
      completedTurns: nextCompleted,
      formation: turn.formation,
      endingEffect: turn.endingEffect,
      enemyActive: remainingEnemy,
      narration: turn.outcome + " Next: " + nextTurn.prompt
    };
  }

  return {
    ...state,
    completedTurns: 4,
    formation: turn.formation,
    endingEffect: turn.endingEffect,
    enemyActive: remainingEnemy,
    isVictory: true,
    narration: turn.outcome + " (" + b.title + " Complete — 4/4 Maneuvers)."
  };
}

export function tacticalProgressBraille(state) {
  const levels = Array.of(0x2800, 0x2846, 0x28c7, 0x28f7, 0x28ff);
  const idx = Math.max(0, Math.min(4, state.completedTurns));
  return String.fromCodePoint(levels.at(idx)).repeat(5);
}
