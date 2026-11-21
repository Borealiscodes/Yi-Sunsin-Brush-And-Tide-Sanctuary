/**
 * src/imjin-renderer.js — Multi-Layered Top-Down Coastal Archipelago, Pine Canopies, Depth Ridges & Fleet Choreography
 * Removes geometric compass rings in favor of organic ocean depth, coastal cliffs, pine groves, and drifting mist.
 */

import { NAVAL_BATTLES } from "./imjin-kernel.js";

let activeFleet = null;
let cachedBattleIdx = -1;

function getChannelBounds(x, w, h, bIdx) {
  if (bIdx === 0) {
    const t = Math.max(0, Math.min(1, x / w));
    const top = 52 + Math.sin(t * Math.PI) * 32;
    const bot = h - 52 - Math.sin(t * Math.PI) * 32;
    return { top, bot };
  }
  if (bIdx === 2) {
    const distFromChoke = Math.abs(x - w * 0.44) / (w * 0.5);
    const chokePinch = Math.max(0, 1 - distFromChoke * 1.6);
    const top = 54 + chokePinch * 78;
    const bot = h - 54 - chokePinch * 78;
    return { top, bot };
  }
  return { top: 46, bot: h - 46 };
}

function initFleetNodes(bIdx, w, h) {
  const battle = NAVAL_BATTLES.at(bIdx);
  const jCount = battle.joseonTotal;
  const eCount = Math.min(140, battle.enemyTotal);

  const joseon = Array.of();
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

function stepFleetPhysics(w, h, state) {
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

  for (let i = 0; i < joseon.length; i += 1) {
    const s = joseon.at(i);
    const norm = joseon.length > 1 ? (i / (joseon.length - 1)) - 0.5 : 0;
    let tx = w * 0.24;
    let ty = cy + norm * (h * 0.54);
    let desiredHeading = 0;

    if (state.formation === "DECOY_RETREAT") {
      tx = w * 0.16 + Math.abs(norm) * 28;
      ty = cy + norm * (h * 0.42);
      desiredHeading = Math.PI;
    } else if (state.formation === "ANCHORED_LINE") {
      tx = w * 0.39 - Math.abs(norm) * 12;
      ty = cy + norm * 88;
      desiredHeading = 0;
    } else if (state.formation === "LINE_ABREAST" || state.formation === "TIDE_SHIFT") {
      tx = w * 0.38;
      ty = cy + norm * (h * 0.62);
      desiredHeading = 0;
    } else if (state.formation === "CRANE_WING") {
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

    const bounds = getChannelBounds(tx, w, h, bIdx);
    ty = Math.max(bounds.top + 14, Math.min(bounds.bot - 14, ty));

    s.vx = s.vx * 0.68 + (tx - s.x) * 0.065;
    s.vy = s.vy * 0.68 + (ty - s.y) * 0.065;
    s.x += s.vx;
    s.y += s.vy;

    const speed = Math.hypot(s.vx, s.vy);
    const targetAngle = speed > 0.6 ? Math.atan2(s.vy, s.vx) : desiredHeading;
    s.angle += normalizeAngleDiff(targetAngle, s.angle) * 0.1;
  }

  const eRows = bIdx === 2 ? 6 : 8;
  for (let i = 0; i < enemy.length; i += 1) {
    const e = enemy.at(i);
    if (e.sunk) continue;

    const col = Math.floor(i / eRows);
    const row = i % eRows;
    const rowNorm = ((row + 0.5) / eRows) - 0.5;

    let leadX = w * 0.64;
    if (state.completedTurns === 1) leadX = w * 0.56;
    else if (state.completedTurns >= 2) leadX = w * 0.60;
    if (state.endingEffect === "TIDAL_SURGE") leadX = w * 0.68;

    const tx = Math.min(w - 24, leadX + col * 14);
    const bounds = getChannelBounds(tx, w, h, bIdx);
    const span = Math.max(24, bounds.bot - bounds.top - 26);
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
    const r = 6 + Math.sin(tick * 0.05 + s.id) * 1.5;
    ctx.fillStyle = "rgba(15, 23, 42, 0.5)";
    ctx.beginPath();
    ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#fb923c";
    ctx.lineWidth = 1.5;
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

  // V-shaped bow wake & stern foam
  ctx.strokeStyle = "rgba(224, 242, 254, 0.42)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-14, -3.5);
  ctx.lineTo(-7, 0);
  ctx.lineTo(-14, 3.5);
  ctx.stroke();

  const scale = s.isFlagship ? 1.32 : s.isTurtle ? 1.18 : 0.92;
  ctx.scale(scale, scale);

  // Deep water shadow beneath hull
  ctx.fillStyle = "rgba(2, 6, 23, 0.42)";
  ctx.beginPath();
  ctx.ellipse(1, 2.5, 10.5, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hull
  ctx.fillStyle = isJoseon ? (s.isTurtle ? "#365314" : "#b45309") : "#991b1b";
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.1;
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
    ctx.ellipse(0, 0, 5.8, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = isJoseon ? "#fef08a" : "#fecaca";
    ctx.fillRect(-1.2, -4.8, 2, 9.6);
  }

  if (s.isFlagship) {
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(8.5, 0, 2.3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawPineCluster(ctx, cx, cy, count) {
  for (let i = 0; i < count; i += 1) {
    const ox = ((i * 23) % 54) - 27;
    const oy = ((i * 17) % 24) - 12;
    const r = 6 + (i % 3) * 2;
    ctx.fillStyle = "rgba(6, 78, 59, 0.85)";
    ctx.beginPath();
    ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(52, 211, 153, 0.25)";
    ctx.beginPath();
    ctx.arc(cx + ox - 1.5, cy + oy - 1.5, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLayeredLandmass(ctx, pathBuilder, ridgeOffsetY = 0) {
  // 1. Outer turquoise shoal & reef shelf
  ctx.save();
  ctx.lineWidth = 18;
  ctx.strokeStyle = "rgba(45, 212, 191, 0.22)";
  pathBuilder();
  ctx.stroke();
  ctx.restore();

  // 2. Warm sandy beach & rocky cliff edge
  ctx.save();
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#d6c79c";
  pathBuilder();
  ctx.stroke();
  ctx.restore();

  // 3. Base emerald forest terrain
  ctx.fillStyle = "#163024";
  pathBuilder();
  ctx.fill();

  // 4. Elevated interior mountain ridge highlight for 3D depth
  ctx.save();
  ctx.translate(0, ridgeOffsetY);
  ctx.scale(0.96, 0.82);
  ctx.fillStyle = "#234736";
  pathBuilder();
  ctx.fill();
  ctx.restore();
}

export function renderTopDownNavalChart(ctx, w, h, state, tick, userStroke) {
  stepFleetPhysics(w, h, state);

  const bIdx = state.battleIndex;
  const battle = NAVAL_BATTLES.at(bIdx);

  // 1. Deep Bathymetric Sea Gradient (darker central channel, brighter coastal shallows)
  const seaGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 30, w * 0.5, h * 0.5, w * 0.65);
  if (bIdx === 0) {
    seaGrad.addColorStop(0, "#083344");
    seaGrad.addColorStop(0.6, "#0e4d64");
    seaGrad.addColorStop(1, "#115e59");
  } else if (bIdx === 1) {
    seaGrad.addColorStop(0, "#082f49");
    seaGrad.addColorStop(0.6, "#0369a1");
    seaGrad.addColorStop(1, "#0d9488");
  } else if (bIdx === 2) {
    seaGrad.addColorStop(0, "#090d16");
    seaGrad.addColorStop(0.6, "#172554");
    seaGrad.addColorStop(1, "#115e59");
  } else {
    seaGrad.addColorStop(0, "#0f172a");
    seaGrad.addColorStop(0.6, "#1e3a8a");
    seaGrad.addColorStop(1, state.endingEffect === "DAWN_DRUM" ? "#b45309" : "#312e81");
  }

ctx.fillStyle = seaGrad;
ctx.fillRect(0, 0, w, h);
// 2. Organic Layered Sea Swells & Glinting Wave Highlights (Zero Geometric Grids)
const flowDir = bIdx === 2 && state.completedTurns < 2 ? -1 : 1;
for (let row = 20; row < h - 16; row += 22) {
ctx.strokeStyle = row % 44 === 0 ? "rgba(186, 230, 253, 0.22)" : "rgba(14, 165, 233, 0.14)";
ctx.lineWidth = row % 44 === 0 ? 1.5 : 1;
ctx.beginPath();
for (let x = 0; x <= w; x += 16) {
const waveY = row + Math.sin(x * 0.028 - flowDir * tick * 0.032 + row * 0.4) * 3.8;
if (x === 0) ctx.moveTo(x, waveY);
else ctx.lineTo(x, waveY);
}
ctx.stroke();
}
// 3. Multi-Layered Coastal Terrain & Pine Groves
if (bIdx === 0 || bIdx === 2) {
drawLayeredLandmass(ctx, () => {
ctx.beginPath();
ctx.moveTo(-10, -10);
for (let x = 0; x <= w; x += 16) ctx.lineTo(x, getChannelBounds(x, w, h, bIdx).top);
ctx.lineTo(w + 10, -10);
ctx.closePath();
}, -4);
drawLayeredLandmass(ctx, () => {
ctx.beginPath();
ctx.moveTo(-10, h + 10);
for (let x = 0; x <= w; x += 16) ctx.lineTo(x, getChannelBounds(x, w, h, bIdx).bot);
ctx.lineTo(w + 10, h + 10);
ctx.closePath();
}, 36);
drawPineCluster(ctx, w * 0.22, 22, 6);
drawPineCluster(ctx, w * 0.44, bIdx === 2 ? 78 : 34, 7);
drawPineCluster(ctx, w * 0.74, 24, 6);
drawPineCluster(ctx, w * 0.44, bIdx === 2 ? h - 78 : h - 34, 7);
} else {
drawLayeredLandmass(ctx, () => {
ctx.beginPath();
ctx.ellipse(104, 38, 62, 22, -0.14, 0, Math.PI * 2);
}, -2);
drawPineCluster(ctx, 104, 36, 7);
drawLayeredLandmass(ctx, () => {
ctx.beginPath();
ctx.ellipse(w - 104, h - 38, 68, 24, 0.14, 0, Math.PI * 2);
}, 8);
drawPineCluster(ctx, w - 104, h - 36, 8);
}
// 4. Render All Coherent Ship Nodes
const { joseon, enemy } = activeFleet;
for (let i = 0; i < enemy.length; i += 1) {
drawVesselNode(ctx, enemy.at(i), false, tick);
}
for (let i = 0; i < joseon.length; i += 1) {
drawVesselNode(ctx, joseon.at(i), true, tick);
}
// 5. Historically Distinct Ending Visuals per Battle
if (state.endingEffect === "FIRE_ARROWS") {
ctx.strokeStyle = "rgba(251, 146, 60, 0.88)";
ctx.lineWidth = 1.6;
for (let i = 0; i < joseon.length; i += 2) {
const jShip = joseon.at(i);
const eShip = enemy.at(i % enemy.length);
if (!eShip) continue;
const midX = (jShip.x + eShip.x) * 0.5;
const midY = Math.min(jShip.y, eShip.y) - 34;
ctx.beginPath();
ctx.moveTo(jShip.x, jShip.y);
ctx.quadraticCurveTo(midX, midY, eShip.x, eShip.y);
ctx.stroke();
}
} else if (state.endingEffect === "CANNON_VOLLEY") {
ctx.strokeStyle = "rgba(250, 204, 21, 0.72)";
ctx.lineWidth = 1.5;
ctx.setLineDash(Array.of(5, 5));
for (let i = 0; i < joseon.length; i += 5) {
const jShip = joseon.at(i);
const eShip = enemy.at((i * 2) % enemy.length);
if (!eShip) continue;
ctx.beginPath();
ctx.moveTo(jShip.x, jShip.y);
ctx.lineTo(eShip.x, eShip.y);
ctx.stroke();
}
ctx.setLineDash(Array.of());
} else if (state.endingEffect === "TIDAL_SURGE") {
ctx.strokeStyle = "rgba(103, 232, 249, 0.78)";
ctx.lineWidth = 2.2;
for (let k = 0; k < 5; k += 1) {
const sx = w * 0.42 + ((tick * 2 + k * 45) % 180);
const sy = h * 0.34 + k * 36;
ctx.beginPath();
ctx.moveTo(sx - 12, sy - 10);
ctx.lineTo(sx, sy);
ctx.lineTo(sx - 12, sy + 10);
ctx.stroke();
}
} else if (state.endingEffect === "DAWN_DRUM") {
const flag = joseon.at(0);
if (flag) {
for (let ring = 0; ring < 3; ring += 1) {
const rad = ((tick * 1.4 + ring * 45) % 135) + 12;
ctx.strokeStyle = "rgba(253, 224, 71, " + (1 - rad / 150).toFixed(2) + ")";
ctx.lineWidth = 2;
ctx.beginPath();
ctx.arc(flag.x, flag.y, rad, 0, Math.PI * 2);
ctx.stroke();
}
}
}
// 6. Drifting Atmospheric Sea Mist Wisps
ctx.fillStyle = "rgba(241, 245, 249, 0.06)";
for (let m = 0; m < 4; m += 1) {
const mx = ((tick * 0.4 + m * 190) % (w + 160)) - 80;
const my = 95 + m * 85;
ctx.beginPath();
ctx.ellipse(mx, my, 95, 18, 0, 0, Math.PI * 2);
ctx.fill();
}
// 7. Tactical HUD Pill
ctx.fillStyle = "rgba(15, 23, 42, 0.84)";
ctx.fillRect(14, 10, 294, 24);
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
ctx.strokeStyle = "#facc15";
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
