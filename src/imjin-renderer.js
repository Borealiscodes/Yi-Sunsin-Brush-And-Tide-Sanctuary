/**
 * src/imjin-renderer.js — Polar Radial Sea Astrolabe & Autonomous Physics-Node Fleet Simulation
 * Renders concentric radial azimuth rings, hydrodynamic tidal streamlines, Bezier islands,
 * and up to 146+ individual steering ship nodes (1:1 accurate ship count at Myeongnyang 13 vs 133).
 */

import { NAVAL_BATTLES } from "./imjin-kernel.js";

let activeFleet = null;
let cachedBattleIdx = -1;

// Hydrodynamic vector field (swirling strait eddies + tidal current)
function sampleTidalFlow(x, y, w, h, bIdx, stage, tick) {
  const cx = w * 0.52;
  const cy = h * 0.5;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.hypot(dx, dy) + 1;

  if (bIdx === 2) {
    // Uldolmok Strait: violent reversing vortex torrent!
    const dir = stage >= 2 ? 1 : -1;
    const swirl = (dir * 1.4) / (1 + dist * 0.008);
    return {
      vx: (-dy / dist) * swirl + dir * 0.55,
      vy: (dx / dist) * swirl * 0.65
    };
  }

  const wave = Math.sin(x * 0.015 + tick * 0.02) * 0.35;
  const cross = Math.cos(y * 0.018 - tick * 0.015) * 0.35;
  return { vx: 0.25 + cross, vy: wave };
}

function initFleetNodes(bIdx, w, h) {
  const battle = NAVAL_BATTLES.at(bIdx);
  // Render 1:1 exact counts for Okpo (24 vs 50), Hansando (56 vs 73), Myeongnyang (13 vs 133),
  // and 63 vs 160 vanguard nodes for Noryang (representing the 500-ship armada smoothly at 60fps)
  const jCount = battle.joseonTotal;
  const eCount = Math.min(160, battle.enemyTotal);

  const joseon = Array.of();
  for (let i = 0; i < jCount; i += 1) {
    const row = i % 7;
    const col = Math.floor(i / 7);
    joseon.push({
      id: i,
      x: w * 0.16 + col * 14,
      y: h * (0.24 + (row / 6) * 0.52),
      vx: 0,
      vy: 0,
      angle: 0,
      isTurtle: i < battle.turtleCount,
      isFlagship: i === 0
    });
  }

  const enemy = Array.of();
  for (let i = 0; i < eCount; i += 1) {
    const ring = i % 9;
    const rank = Math.floor(i / 9);
    enemy.push({
      id: i,
      x: w * 0.64 + rank * 11,
      y: h * (0.16 + (ring / 8) * 0.68) + ((rank % 2) * 6 - 3),
      vx: 0,
      vy: 0,
      angle: Math.PI,
      sunk: false,
      smokeAlpha: 0
    });
  }

  activeFleet = { joseon, enemy };
  cachedBattleIdx = bIdx;
}

function stepFleetPhysics(w, h, state, tick) {
  if (!activeFleet || cachedBattleIdx !== state.battleIndex) {
    initFleetNodes(state.battleIndex, w, h);
  }

  const bIdx = state.battleIndex;
  const battle = NAVAL_BATTLES.at(bIdx);
  const { joseon, enemy } = activeFleet;
  const cx = w * 0.52;
  const cy = h * 0.5;

  // Update sunk status proportionally to battle state
  const sunkRatio = (battle.enemyTotal - state.enemyActive) / battle.enemyTotal;
  const targetSunk = Math.round(enemy.length * sunkRatio);
  for (let i = 0; i < enemy.length; i += 1) {
    if (i < targetSunk) {
      enemy.at(i).sunk = true;
      enemy.at(i).smokeAlpha = Math.min(1, enemy.at(i).smokeAlpha + 0.02);
    } else {
      enemy.at(i).sunk = false;
      enemy.at(i).smokeAlpha = 0;
    }
  }

  // 1. Steer Joseon nodes into fluid polar/tactical formations
  for (let i = 0; i < joseon.length; i += 1) {
    const s = joseon.at(i);
    const norm = joseon.length > 1 ? (i / (joseon.length - 1)) - 0.5 : 0; // -0.5..+0.5
    let tx = w * 0.26;
    let ty = cy + norm * (h * 0.62);

    if (state.formation === "DECOY_RETREAT") {
      tx = w * 0.18 + Math.abs(norm) * 40;
      ty = cy + norm * (h * 0.45);
    } else if (state.formation === "ANCHORED_LINE") {
      // Narrow choke line at Uldolmok gorge
      tx = w * 0.36 + Math.cos(norm * Math.PI) * 14;
      ty = cy + norm * (h * 0.34);
    } else if (state.formation === "LINE_ABREAST" || state.formation === "TIDE_SHIFT") {
      tx = w * 0.38 + Math.sin(norm * Math.PI * 2) * 16;
      ty = cy + norm * (h * 0.68);
    } else if (state.formation === "CRANE_WING" || state.formation === "VOLLEY") {
      // Sweeping Polar Crane Wing (Hakikjin) logarithmic crescent!
      const arcAngle = norm * Math.PI * 0.88; // -80 deg to +80 deg
      const radius = 155;
      tx = cx + 45 - Math.cos(arcAngle) * radius;
      ty = cy + Math.sin(arcAngle) * (radius * 1.15);
    } else if (state.formation === "TURTLE_SPEAR") {
      if (s.isTurtle || i < 4) {
        tx = cx + 25 - i * 14;
        ty = cy + (i - 1.5) * 16;
      } else {
        const arcAngle = norm * Math.PI * 0.75;
        tx = cx + 30 - Math.cos(arcAngle) * 150;
        ty = cy + Math.sin(arcAngle) * 165;
      }
    }

    // Hydrodynamic drift + spring steering toward tactical slot
    const flow = sampleTidalFlow(s.x, s.y, w, h, bIdx, state.completedTurns, tick);
    const ax = (tx - s.x) * 0.035 + flow.vx * 0.25;
    const ay = (ty - s.y) * 0.035 + flow.vy * 0.25;

    s.vx = (s.vx + ax) * 0.82;
    s.vy = (s.vy + ay) * 0.82;
    s.x += s.vx;
    s.y += s.vy;

    // Face toward enemy center during Crane Wing / Volley, or along velocity vector
    if (state.formation === "CRANE_WING" || state.formation === "VOLLEY" || state.formation === "ANCHORED_LINE") {
      const targetAngle = Math.atan2(cy - s.y, (cx + 70) - s.x);
      s.angle += (targetAngle - s.angle) * 0.12;
    } else if (Math.hypot(s.vx, s.vy) > 0.15) {
      const moveAngle = Math.atan2(s.vy, s.vx);
      s.angle += (moveAngle - s.angle) * 0.12;
    }
  }

  // 2. Steer Enemy nodes (bottlenecked in straits, compressed inside Crane Wing, or swirling in Myeongnyang tide)
  for (let i = 0; i < enemy.length; i += 1) {
    const e = enemy.at(i);
    const flow = sampleTidalFlow(e.x, e.y, w, h, bIdx, state.completedTurns, tick);

    if (e.sunk) {
      e.x += flow.vx * 0.35;
      e.y += flow.vy * 0.35;
      e.angle += 0.008;
      continue;
    }

    const ring = i % 9;
    const rank = Math.floor(i / 9);
    let tx = cx + 85 + rank * 12;
    let ty = cy + ((ring / 8) - 0.5) * (bIdx === 2 ? h * 0.36 : h * 0.64);

    if (state.formation === "CRANE_WING" || state.formation === "VOLLEY") {
      // Drawn into the Crane Wing pocket!
      const spiralA = (i * 0.45) + tick * 0.01;
      const spiralR = 25 + (i % 7) * 11;
      tx = cx + 55 + Math.cos(spiralA) * spiralR;
      ty = cy + Math.sin(spiralA) * spiralR;
    } else if (state.formation === "TIDE_SHIFT" && bIdx === 2) {
      // Swept into chaotic Uldolmok whirlpool!
      const vortexA = (i * 0.38) - tick * 0.03;
      const vortexR = 30 + (i % 8) * 12;
      tx = cx + 40 + Math.cos(vortexA) * vortexR;
      ty = cy + Math.sin(vortexA) * vortexR;
    }

    e.vx = (e.vx + (tx - e.x) * 0.02 + flow.vx * 0.4) * 0.84;
    e.vy = (e.vy + (ty - e.y) * 0.02 + flow.vy * 0.4) * 0.84;
    e.x += e.vx;
    e.y += e.vy;

    if (Math.hypot(e.vx, e.vy) > 0.12) {
      e.angle = Math.atan2(e.vy, e.vx);
    }
  }
}

function drawVesselNode(ctx, s, isJoseon, tick) {
  ctx.save();
  ctx.translate(s.x, s.y);

  if (!isJoseon && s.sunk) {
    // Sumi-e ink smoke bloom & sinking hull cross
    const r = 6 + Math.sin(tick * 0.06 + s.id) * 1.5;
    ctx.fillStyle = "rgba(28, 25, 23, 0.32)";
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(220, 38, 38, 0.85)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-4, -4);
    ctx.lineTo(4, 4);
    ctx.moveTo(4, -4);
    ctx.lineTo(-4, 4);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.rotate(s.angle);

  // Subtle fluid wake ribbon
  ctx.strokeStyle = isJoseon ? "rgba(245, 158, 11, 0.28)" : "rgba(220, 38, 38, 0.2)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-13, -3);
  ctx.lineTo(-7, 0);
  ctx.lineTo(-13, 3);
  ctx.stroke();

  // Compact high-detail top-down hull (scales cleanly for 146+ simultaneous nodes)
  const scale = s.isFlagship ? 1.35 : s.isTurtle ? 1.2 : 0.92;
  ctx.scale(scale, scale);

  ctx.fillStyle = isJoseon ? (s.isTurtle ? "#365314" : "#92400e") : "#7f1d1d";
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(3, -4);
  ctx.lineTo(-8, -3.5);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-8, 3.5);
  ctx.lineTo(3, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (s.isTurtle) {
    ctx.fillStyle = "#65a30d";
    ctx.beginPath();
    ctx.ellipse(0, 0, 6, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = isJoseon ? "#fbbf24" : "#fca5a5";
    ctx.fillRect(-1, -4.8, 1.6, 9.6);
  }

  if (s.isFlagship) {
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(9, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function renderTopDownNavalChart(ctx, w, h, state, tick, userStroke) {
  stepFleetPhysics(w, h, state, tick);

  const bIdx = state.battleIndex;
  const battle = NAVAL_BATTLES.at(bIdx);
  const cx = w * 0.52;
  const cy = h * 0.5;

  // 1. Aged Hanji & Sumi-e Sea Chart Paper
  const bg = ctx.createRadialGradient(cx, cy, 20, cx, cy, w * 0.72);
  bg.addColorStop(0, "#ede5d2");
  bg.addColorStop(0.65, "#dfd3b8");
  bg.addColorStop(1, "#cbbba0");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 2. Polar Cosmology Astrolabe Rings & 16 Azimuth Spokes
  ctx.strokeStyle = "rgba(41, 37, 36, 0.16)";
  ctx.lineWidth = 1;
  const radii = Array.of(55, 110, 165, 220, 275);
  for (const r of radii) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let a = 0; a < 16; a += 1) {
    const theta = (a / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(theta) * 55, cy + Math.sin(theta) * 55);
    ctx.lineTo(cx + Math.cos(theta) * 285, cy + Math.sin(theta) * 285);
    ctx.stroke();
  }

  // 3. Hydrodynamic Tidal Streamlines (curved flow ribbons across the sea)
  ctx.strokeStyle = bIdx === 2 ? "rgba(14, 116, 144, 0.34)" : "rgba(29, 78, 216, 0.18)";
  ctx.lineWidth = 1.4;
  for (let row = 42; row < h - 30; row += 36) {
    ctx.beginPath();
    for (let x = 16; x < w - 16; x += 18) {
      const flow = sampleTidalFlow(x, row, w, h, bIdx, state.completedTurns, tick);

const py = row + Math.sin(x * 0.025 + tick * 0.03) * 7 + flow.vy * 10;
if (x === 16) ctx.moveTo(x, py);
else ctx.lineTo(x, py);
}
ctx.stroke();
}
// 4. Organic Sumi-e Archipelago Coastlines & Bathymetric Contours
ctx.fillStyle = "rgba(41, 37, 36, 0.86)";
ctx.strokeStyle = "rgba(41, 37, 36, 0.35)";
ctx.lineWidth = 4;
if (bIdx === 0 || bIdx === 2) {
// Narrow strait headlands (Okpo Bay / Uldolmok Choke Gorge)
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(w, 0);
ctx.lineTo(w, 54);
ctx.bezierCurveTo(w * 0.65, 65, w * 0.42, 138, 0, 52);
ctx.closePath();
ctx.fill();
ctx.stroke();
ctx.beginPath();
ctx.moveTo(0, h);
ctx.lineTo(w, h);
ctx.lineTo(w, h - 54);
ctx.bezierCurveTo(w * 0.65, h - 65, w * 0.42, h - 138, 0, h - 52);
ctx.closePath();
ctx.fill();
ctx.stroke();
} else {
// Hansando / Noryang archipelago islands with outer bathymetric rings
const islands = Array.of(
{ x: 118, y: 78, rx: 46, ry: 22, rot: -0.25 },
{ x: w - 110, y: h - 76, rx: 54, ry: 26, rot: 0.2 },
{ x: w * 0.54, y: 42, rx: 34, ry: 14, rot: 0.1 }
);
for (const isl of islands) {
ctx.beginPath();
ctx.ellipse(isl.x, isl.y, isl.rx, isl.ry, isl.rot, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();
}
}
// 5. Render All Autonomous Ship Nodes
const { joseon, enemy } = activeFleet;
for (let i = 0; i < enemy.length; i += 1) {
drawVesselNode(ctx, enemy.at(i), false, tick);
}
for (let i = 0; i < joseon.length; i += 1) {
drawVesselNode(ctx, joseon.at(i), true, tick);
}
// 6. Curved Ballistic Cannon Broadside Arcs during Volley / Victory
if (state.formation === "VOLLEY" || state.isVictory) {
ctx.strokeStyle = "rgba(217, 119, 6, 0.55)";
ctx.lineWidth = 1.4;
ctx.setLineDash(Array.of(4, 4));
for (let i = 0; i < joseon.length; i += Math.max(1, Math.floor(joseon.length / 10))) {
const jShip = joseon.at(i);
const eShip = enemy.at((i * 3) % enemy.length);
if (!eShip) continue;
const midX = (jShip.x + eShip.x) * 0.5;
const midY = (jShip.y + eShip.y) * 0.5 - 18;
ctx.beginPath();
ctx.moveTo(jShip.x, jShip.y);
ctx.quadraticCurveTo(midX, midY, eShip.x, eShip.y);
ctx.stroke();
}
ctx.setLineDash(Array.of());
}
// 7. Radial Tactical HUD Pill (Top-Left)
ctx.fillStyle = "rgba(28, 25, 23, 0.85)";
ctx.fillRect(14, 12, 290, 26);
ctx.fillStyle = "#fef3c7";
ctx.font = "bold 11px monospace";
ctx.textAlign = "left";
ctx.fillText(
"Joseon Fleet: " + state.joseonActive + " ships  |  Invasion Fleet: " + state.enemyActive + "/" + battle.enemyTotal,
22,
29
);
// 8. Live Celestial Brush Stroke
if (Array.isArray(userStroke) && userStroke.length >= 2) {
ctx.strokeStyle = "#b45309";
ctx.lineWidth = 4;
ctx.lineCap = "round";
ctx.lineJoin = "round";
ctx.beginPath();
ctx.moveTo(userStroke.at(0).x, userStroke.at(0).y);
for (let i = 1; i < userStroke.length; i += 1) {
ctx.lineTo(userStroke.at(i).x, userStroke.at(i).y);
}
ctx.stroke();
}
}
