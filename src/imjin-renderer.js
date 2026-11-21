/**
 * src/imjin-renderer.js — Coherent, Critically-Damped Naval Fleet Simulation & Polar Sea Chart
 * Enforces navigable channel bounds, disciplined multi-rank naval columns, and jitter-free headings.
 */

import { NAVAL_BATTLES } from "./imjin-kernel.js";

let activeFleet = null;
let cachedBattleIdx = -1;

// Exact navigable water channel [topY, botY] at horizontal coordinate x for each map
function getChannelBounds(x, w, h, bIdx) {
  if (bIdx === 0) {
    // Okpo Bay: open western approach narrowing into eastern anchorage cove
    const t = Math.max(0, Math.min(1, x / w));
    const top = 46 + Math.sin(t * Math.PI) * 34;
    const bot = h - 46 - Math.sin(t * Math.PI) * 34;
    return { top, bot };
  }
  if (bIdx === 2) {
    // Uldolmok Strait (Myeongnyang): sharp bottleneck choke point at x = 0.44 * w
    const distFromChoke = Math.abs(x - w * 0.44) / (w * 0.5);
    const chokePinch = Math.max(0, 1 - distFromChoke * 1.6);
    const top = 48 + chokePinch * 82;
    const bot = h - 48 - chokePinch * 82;
    return { top, bot };
  }
  // Open archipelago straits (Hansando & Noryang)
  return { top: 44, bot: h - 44 };
}

function initFleetNodes(bIdx, w, h) {
  const battle = NAVAL_BATTLES.at(bIdx);
  const jCount = battle.joseonTotal;
  const eCount = Math.min(140, battle.enemyTotal);

  const joseon = Array.of();
  const jCols = Math.max(2, Math.ceil(jCount / 8));
  for (let i = 0; i < jCount; i += 1) {
    const col = Math.floor(i / 8);
    const row = i % 8;
    const x = w * 0.14 + col * 18;
    const bounds = getChannelBounds(x, w, h, bIdx);
    const y = bounds.top + 14 + ((row + 0.5) / 8) * (bounds.bot - bounds.top - 28);
    joseon.push({
      id: i,
      x,
      y,
      vx: 0,
      vy: 0,
      angle: 0,
      isTurtle: i < battle.turtleCount,
      isFlagship: i === 0
    });
  }

  const enemy = Array.of();
  const eRows = bIdx === 2 ? 6 : 8;
  for (let i = 0; i < eCount; i += 1) {
    const col = Math.floor(i / eRows);
    const row = i % eRows;
    const x = w * 0.62 + col * 13;
    const bounds = getChannelBounds(x, w, h, bIdx);
    const y = bounds.top + 12 + ((row + 0.5) / eRows) * (bounds.bot - bounds.top - 24);
    enemy.push({
      id: i,
      x,
      y,
      vx: 0,
      vy: 0,
      angle: Math.PI,
      sunk: false
    });
  }

  activeFleet = { joseon, enemy };
  cachedBattleIdx = bIdx;
}

function normalizeAngleDiff(target, current) {
  let diff = target - current;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

function stepFleetPhysics(w, h, state, tick) {
  if (!activeFleet || cachedBattleIdx !== state.battleIndex) {
    initFleetNodes(state.battleIndex, w, h);
  }

  const bIdx = state.battleIndex;
  const battle = NAVAL_BATTLES.at(bIdx);
  const { joseon, enemy } = activeFleet;
  const cy = h * 0.5;

  const sunkRatio = (battle.enemyTotal - state.enemyActive) / battle.enemyTotal;
  const targetSunk = Math.round(enemy.length * sunkRatio);
  for (let i = 0; i < enemy.length; i += 1) {
    enemy.at(i).sunk = i < targetSunk;
  }

  // 1. Coherent Joseon Naval Formations (Critically damped, zero jitter)
  for (let i = 0; i < joseon.length; i += 1) {
    const s = joseon.at(i);
    const norm = joseon.length > 1 ? (i / (joseon.length - 1)) - 0.5 : 0; // -0.5..+0.5
    let tx = w * 0.24;
    let ty = cy + norm * (h * 0.54);
    let desiredHeading = 0;

    if (state.formation === "DECOY_RETREAT") {
      tx = w * 0.16 + Math.abs(norm) * 28;
      ty = cy + norm * (h * 0.42);
      desiredHeading = Math.PI;
    } else if (state.formation === "ANCHORED_LINE") {
      // Anchored across the narrow Uldolmok choke point (x = 0.39 * w)
      tx = w * 0.39 - Math.abs(norm) * 12;
      ty = cy + norm * 88;
      desiredHeading = 0;
    } else if (state.formation === "LINE_ABREAST" || state.formation === "TIDE_SHIFT") {
      tx = w * 0.36;
      ty = cy + norm * (h * 0.62);
      desiredHeading = 0;
    } else if (state.formation === "CRANE_WING" || state.formation === "VOLLEY") {
      // Clean U-shaped Crane Wing (Hakikjin) crescent facing enemy center
      const wingAdvance = Math.pow(Math.abs(norm) * 2, 1.6) * 115;
      tx = w * 0.34 + wingAdvance;
      ty = cy + norm * (h * 0.68);
      desiredHeading = Math.atan2(cy - ty, (w * 0.66) - tx);
    } else if (state.formation === "TURTLE_SPEAR") {
      if (s.isTurtle || i < 3) {
        tx = w * 0.50 - i * 16;
        ty = cy + (i - 1) * 18;
        desiredHeading = 0;
      } else {
        const wingAdvance = Math.pow(Math.abs(norm) * 2, 1.5) * 95;
        tx = w * 0.33 + wingAdvance;
        ty = cy + norm * (h * 0.64);
        desiredHeading = Math.atan2(cy - ty, (w * 0.66) - tx);
      }
    }

    // Clamp target strictly inside navigable water channel
    const bounds = getChannelBounds(tx, w, h, bIdx);
    ty = Math.max(bounds.top + 12, Math.min(bounds.bot - 12, ty));

    // Critically damped spring (zero overshoot/jitter)
    s.vx = s.vx * 0.68 + (tx - s.x) * 0.065;
    s.vy = s.vy * 0.68 + (ty - s.y) * 0.065;
    s.x += s.vx;
    s.y += s.vy;

    const speed = Math.hypot(s.vx, s.vy);
    const targetAngle = speed > 0.6 ? Math.atan2(s.vy, s.vx) : desiredHeading;
    s.angle += normalizeAngleDiff(targetAngle, s.angle) * 0.1;
  }

  // 2. Coherent Enemy Naval Columns (Marching into straits & compressing cleanly)
  const eRows = bIdx === 2 ? 6 : 8;
  for (let i = 0; i < enemy.length; i += 1) {
    const e = enemy.at(i);
    if (e.sunk) continue;

    const col = Math.floor(i / eRows);
    const row = i % eRows;
    const rowNorm = ((row + 0.5) / eRows) - 0.5; // -0.5..+0.5

    let leadX = w * 0.64;
    if (state.completedTurns === 1) leadX = w * 0.56; // Advancing into trap / choke
    else if (state.completedTurns >= 2) leadX = w * 0.60; // Compressed by Crane Wing / tide

    const tx = Math.min(w - 24, leadX + col * 14);
    const bounds = getChannelBounds(tx, w, h, bIdx);
    const span = Math.max(24, bounds.bot - bounds.top - 24);
    const ty = cy + rowNorm * span;

    e.vx = e.vx * 0.68 + (tx - e.x) * 0.055;
    e.vy = e.vy * 0.68 + (ty - e.y) * 0.055;
    e.x += e.vx;
    e.y += e.vy;

    const speed = Math.hypot(e.vx, e.vy);
    const targetAngle = speed > 0.6 ? Math.atan2(e.vy, e.vx) : Math.PI;
    e.angle += normalizeAngleDiff(targetAngle, e.angle) * 0.1;
  }
}

function drawVesselNode(ctx, s, isJoseon, tick) {
  ctx.save();
  ctx.translate(s.x, s.y);

  if (!isJoseon && s.sunk) {
    const r = 5.5 + Math.sin(tick * 0.05 + s.id) * 1;
    ctx.fillStyle = "rgba(28, 25, 23, 0.28)";
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(220, 38, 38, 0.85)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-3.5, -3.5);
    ctx.lineTo(3.5, 3.5);
    ctx.moveTo(3.5, -3.5);
    ctx.lineTo(-3.5, 3.5);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.rotate(s.angle);

  // Subtle wake behind stern
  ctx.strokeStyle = isJoseon ? "rgba(217, 119, 6, 0.3)" : "rgba(185, 28, 28, 0.22)";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(-12, -2.5);
  ctx.lineTo(-6, 0);
  ctx.lineTo(-12, 2.5);
  ctx.stroke();

  const scale = s.isFlagship ? 1.3 : s.isTurtle ? 1.15 : 0.9;
  ctx.scale(scale, scale);

  ctx.fillStyle = isJoseon ? (s.isTurtle ? "#365314" : "#92400e") : "#7f1d1d";
  ctx.strokeStyle = "#1c1917";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(3, -3.8);
  ctx.lineTo(-8, -3.2);
  ctx.lineTo(-10, 0);
  ctx.lineTo(-8, 3.2);
  ctx.lineTo(3, 3.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  if (s.isTurtle) {
    ctx.fillStyle = "#65a30d";
    ctx.beginPath();
    ctx.ellipse(0, 0, 5.5, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = isJoseon ? "#fbbf24" : "#fca5a5";
    ctx.fillRect(-1, -4.5, 1.5, 9);
  }

  if (s.isFlagship) {
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.arc(8.5, 0, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function renderTopDownNavalChart(ctx, w, h, state, tick, userStroke) {
  stepFleetPhysics(w, h, state, tick);

  const bIdx = state.battleIndex;
  const battle = NAVAL_BATTLES.at(bIdx);
  const cx = w * 0.5;
  const cy = h * 0.5;

  // 1. Aged Hanji & Sumi-e Sea Chart Paper
  const bg = ctx.createRadialGradient(cx, cy, 20, cx, cy, w * 0.72);
  bg.addColorStop(0, "#ede5d2");
  bg.addColorStop(0.65, "#dfd3b8");
  bg.addColorStop(1, "#cbbba0");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 2. Concentric Polar Navigation Rings & Azimuth Spokes
  ctx.strokeStyle = "rgba(41, 37, 36, 0.14)";
  ctx.lineWidth = 1;
  for (const r of Array.of(65, 130, 195, 260)) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (let a = 0; a < 16; a += 1) {
    const theta = (a / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(theta) * 65, cy + Math.sin(theta) * 65);
    ctx.lineTo(cx + Math.cos(theta) * 280, cy + Math.sin(theta) * 280);
    ctx.stroke();
  }

  // 3. Smooth Tidal Streamlines Matching Channel Geometry
  ctx.strokeStyle = bIdx === 2 ? "rgba(14, 116, 144, 0.32)" : "rgba(29, 78, 216, 0.16)";
  ctx.lineWidth = 1.3;
  const flowDir = bIdx === 2 && state.completedTurns < 2 ? -1 : 1;
  for (const frac of Array.of(0.28, 0.42, 0.58, 0.72)) {
    ctx.beginPath();
    for (let x = 16; x <= w - 16; x += 16) {
      const bounds = getChannelBounds(x, w, h, bIdx);
      const baseY = bounds.top + frac * (bounds.bot - bounds.top);
      const py = baseY + Math.sin(x * 0.025 - flowDir * tick * 0.03) * 4;
      if (x === 16) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.stroke();
  }

  // 4. Exact Coastlines Matching getChannelBounds(x)
  ctx.fillStyle = "rgba(41, 37, 36, 0.88)";
  ctx.strokeStyle = "rgba(41, 37, 36, 0.35)";
  ctx.lineWidth = 3;

  if (bIdx === 0 || bIdx === 2) {
    // Upper headland

ctx.beginPath();
ctx.moveTo(0, 0);
for (let x = 0; x <= w; x += 16) {
ctx.lineTo(x, getChannelBounds(x, w, h, bIdx).top);
}
ctx.lineTo(w, 0);
ctx.closePath();
ctx.fill();
ctx.stroke();
// Lower headland
ctx.beginPath();
ctx.moveTo(0, h);
for (let x = 0; x <= w; x += 16) {
ctx.lineTo(x, getChannelBounds(x, w, h, bIdx).bot);
}
ctx.lineTo(w, h);
ctx.closePath();
ctx.fill();
ctx.stroke();
} else {
// Peripheral archipelago islands outside main maneuver lanes
const islands = Array.of(
{ x: 96, y: 34, rx: 58, ry: 18, rot: -0.1 },
{ x: w - 96, y: h - 34, rx: 64, ry: 20, rot: 0.1 }
);
for (const isl of islands) {
ctx.beginPath();
ctx.ellipse(isl.x, isl.y, isl.rx, isl.ry, isl.rot, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();
}
}
// 5. Render All Coherent Ship Nodes
const { joseon, enemy } = activeFleet;
for (let i = 0; i < enemy.length; i += 1) {
drawVesselNode(ctx, enemy.at(i), false, tick);
}
for (let i = 0; i < joseon.length; i += 1) {
drawVesselNode(ctx, joseon.at(i), true, tick);
}
// 6. Cannon Broadside Arcs on Volley / Victory
if (state.formation === "VOLLEY" || state.isVictory) {
ctx.strokeStyle = "rgba(217, 119, 6, 0.5)";
ctx.lineWidth = 1.3;
ctx.setLineDash(Array.of(4, 4));
for (let i = 0; i < joseon.length; i += Math.max(1, Math.floor(joseon.length / 9))) {
const jShip = joseon.at(i);
const eShip = enemy.at((i * 2) % enemy.length);
if (!eShip) continue;
const midX = (jShip.x + eShip.x) * 0.5;
const midY = (jShip.y + eShip.y) * 0.5 - 14;
ctx.beginPath();
ctx.moveTo(jShip.x, jShip.y);
ctx.quadraticCurveTo(midX, midY, eShip.x, eShip.y);
ctx.stroke();
}
ctx.setLineDash(Array.of());
}
// 7. Tactical HUD Pill
ctx.fillStyle = "rgba(28, 25, 23, 0.85)";
ctx.fillRect(14, 10, 290, 24);
ctx.fillStyle = "#fef3c7";
ctx.font = "bold 11px monospace";
ctx.textAlign = "left";
ctx.fillText(
"Joseon Fleet: " + state.joseonActive + " ships  |  Invasion Fleet: " + state.enemyActive + "/" + battle.enemyTotal,
22,
26
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
