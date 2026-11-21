/**
 * src/imjin-kernel.js — Historically Accurate Fleet Counts & Tactical Formations (1592–1598)
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
    briefing: "24 Joseon Panokseon approach 50 anchored transports in Okpo Bay (Grid E2–G5). Read the harbor current (~ Wave).",
    turns: Array.of(
      {
        orderName: "Read Harbor Current",
        shape: "WAVE",
        key: "~",
        formation: "COLUMN",
        joseonSunk: 0,
        enemySunk: 0,
        prompt: "1/4: Sweep a WAVE (~) to ride the northbound flood current into sectors B2–B5.",
        outcome: "All 24 Panokseon glide silently into Okpo Bay along the flood tide."
      },
      {
        orderName: "Block Seaward Exit",
        shape: "SLASH",
        key: "/",
        formation: "LINE_ABREAST",
        joseonSunk: 0,
        enemySunk: 8,
        prompt: "2/4: Draw a SLASH (/) to form a broadside line across sectors D1–D6, sealing the bay.",
        outcome: "The 24-ship line cuts off the harbor mouth; 8 vanguard transports burn."
      },
      {
        orderName: "Harbor Crescent Pinch",
        shape: "CIRCLE",
        key: "O",
        formation: "CRANE_WING",
        joseonSunk: 0,
        enemySunk: 18,
        prompt: "3/4: Draw a CIRCLE (O) to curve both wings into sectors E1–E6 around the anchorage.",
        outcome: "Both Joseon flanks close around the cove; 18 enemy ships are disabled."
      },
      {
        orderName: "Cheonja Cannon Volley",
        shape: "CROSS",
        key: "+",
        formation: "VOLLEY",
        joseonSunk: 0,
        enemySunk: 26,
        prompt: "4/4: Draw a CROSS (+) to fire a coordinated heavy cannon volley into Grid F2–G5.",
        outcome: "Victory at Okpo! 26 enemy vessels destroyed with zero Joseon ships lost."
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
    briefing: "56 Joseon warships (3 Geobukseon) face 73 enemy warships emerging from Gyeonnaeryang Channel.",
    turns: Array.of(
      {
        orderName: "Feigned Retreat (Decoy)",
        shape: "WAVE",
        key: "~",
        formation: "DECOY_RETREAT",
        joseonSunk: 0,
        enemySunk: 0,
        prompt: "1/4: Sweep a WAVE (~) to draw the 73-ship vanguard westward into open water (Grid C2–E5).",
        outcome: "The enemy fleet pursues the decoy squadron out of the narrow channel."
      },
      {
        orderName: "Spring Hakikjin (Crane Wing)",
        shape: "CIRCLE",
        key: "O",
        formation: "CRANE_WING",
        joseonSunk: 0,
        enemySunk: 14,
        prompt: "2/4: Draw a CIRCLE (O) to snap all 56 ships into the Crane Wing (Hakikjin) U-crescent.",
        outcome: "Left and right wings wheel outward around Grid D1–F6, trapping the pursuit fleet."
      },
      {
        orderName: "Geobukseon Dragon Charge",
        shape: "SLASH",
        key: "/",
        formation: "TURTLE_SPEAR",
        joseonSunk: 0,
        enemySunk: 35,
        prompt: "3/4: Draw a SLASH (/) to drive the 3 iron-clad Turtle Ships straight into the center command.",
        outcome: "Turtle Ships smash the enemy center; 35 vessels are sunk or captured."
      },
      {
        orderName: "Converging Broadside Volley",
        shape: "CROSS",
        key: "+",
        formation: "VOLLEY",
        joseonSunk: 0,
        enemySunk: 47,
        prompt: "4/4: Draw a CROSS (+) to fire converging cannon fire from every point of the Crane Wing.",
        outcome: "Decisive victory at Hansando! 47 of 73 enemy ships destroyed; zero Joseon ships lost."
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
    briefing: "13 Joseon Panokseon face 133 warships in the narrow Uldolmok Gorge (Grid C3–C4). Drop anchors (/ Slash).",
    turns: Array.of(
      {
        orderName: "Anchor at the Choke Point",
        shape: "SLASH",
        key: "/",
        formation: "ANCHORED_LINE",
        joseonSunk: 0,
        enemySunk: 5,
        prompt: "1/4: Draw a SLASH (/) to anchor all 13 ships across the narrow gorge at Column C.",
        outcome: "Admiral Yi's flagship holds the choke point alone while 133 ships bottleneck in Column E–H."
      },
      {
        orderName: "Endure & Turn the Tide",
        shape: "WAVE",
        key: "~",
        formation: "TIDE_SHIFT",
        joseonSunk: 0,
        enemySunk: 14,
        prompt: "2/4: Sweep a WAVE (~) as the violent Uldolmok current reverses southward against the enemy.",
        outcome: "The roaring current reverses! Crowded enemy ships collide in sectors D2–F5."
      },
      {
        orderName: "Close Ranks Across Strait",
        shape: "CIRCLE",
        key: "O",
        formation: "CRANE_WING",
        joseonSunk: 0,
        enemySunk: 22,
        prompt: "3/4: Draw a CIRCLE (O) to unite all 13 warships in a tight offensive arc.",
        outcome: "All 13 Joseon ships advance together into the tangled vanguard."
      },
      {
        orderName: "Down-Current Counter-Volley",
        shape: "CROSS",
        key: "+",
        formation: "VOLLEY",
        joseonSunk: 0,
        enemySunk: 31,
        prompt: "4/4: Draw a CROSS (+) to fire heavy broadsides down the reversing torrent.",
        outcome: "Miracle at Myeongnyang! 31 enemy warships sunk; all 13 Joseon ships survive."
      }
    )
  },
  {
    id: "noryang-1598",
    tabLabel: "IV. Noryang (63 vs 500)",
    title: "Battle of Noryang — Dawn Blockade (Dec 1598)",
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
        joseonSunk: 0,
        enemySunk: 40,
        prompt: "1/4: Draw a CIRCLE (O) to form a pre-dawn blockade arc across sectors C1–D6.",
        outcome: "63 Joseon ships seal the strait under cover of midnight mist."
      },
      {
        orderName: "Pre-Dawn Tide Advance",
        shape: "WAVE",
        key: "~",
        formation: "LINE_ABREAST",
        joseonSunk: 0,
        enemySunk: 95,
        prompt: "2/4: Sweep a WAVE (~) to glide silently into point-blank broadside range.",
        outcome: "Surprise broadsides erupt across the foggy strait."
      },
      {
        orderName: "Turtle Ship Spearhead",
        shape: "SLASH",
        key: "/",
        formation: "TURTLE_SPEAR",
        joseonSunk: 0,
        enemySunk: 150,
        prompt: "3/4: Draw a SLASH (/) to drive the 4 Turtle Ships through the enemy column.",
        outcome: "The retreating formation is split in two across sectors E2–G5."
      },
      {
        orderName: "Sunrise War-Drum Volley",
        shape: "CROSS",
        key: "+",
        formation: "VOLLEY",
        joseonSunk: 0,
        enemySunk: 200,
        prompt: "4/4: Draw a CROSS (+) to beat the war drum at sunrise and complete the Imjin campaign.",
        outcome: "Dawn breaks over Noryang Strait; over 200 enemy vessels destroyed and peace is won."
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
      narration: b.title + " won! Select another historical battle above or replay this engagement."
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
      enemyActive: remainingEnemy,
      narration: turn.outcome + " Next: " + nextTurn.prompt
    };
  }

  return {
    ...state,
    completedTurns: 4,
    formation: "VOLLEY",
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
