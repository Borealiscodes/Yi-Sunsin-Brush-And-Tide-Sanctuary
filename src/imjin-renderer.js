/**
 * src/imjin-renderer.js — Crisp Top-Down Naval Chart, Island Contours, Wind/Tide Vectors & Warships
 */

function drawTopDownWarship(ctx, x, y, angleRad, hullColor, deckColor, isTurtleShip, hasLantern) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);

  // Wake ripple behind stern
  ctx.strokeStyle = "rgba(186, 230, 253, 0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-26, -6);
  ctx.lineTo(-14, 0);
  ctx.lineTo(-26, 6);
  ctx.stroke();

  // Hull silhouette
  ctx.fillStyle = hullColor;
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(8, -8);
  ctx.lineTo(-16, -7);
  ctx.lineTo(-19, 0);
  ctx.lineTo(-16, 7);
  ctx.lineTo(8, 8);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  if (isTurtleShip) {
    // Hexagonal spiked iron roof (Geobukseon)
    ctx.fillStyle = "#3f6212";
    ctx.beginPath();
    ctx.ellipse(0, 0, 12, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#bef264";
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    // Upper fighting deck & square sail bar
    ctx.fillStyle = deckColor;
    ctx.fillRect(-10, -4, 18, 8);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(-2, -9, 3, 18);
  }

  if (hasLantern) {
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(16, 0, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}


export function renderTopDownNavalChart(ctx, w, h, state, tick, userStroke) {
const bIdx = state.battleIndex;
const stage = state.completedTurns;
// 1. Deep chart sea background
const seaPalettes = Array.of(
["#0c2d48", "#145374"], // Okpo Harbor
["#0b3954", "#087e8b"], // Hansando Strait
["#0f172a", "#1e3a5f"], // Myeongnyang Storm Gorge
["#172554", "#312e81"]  // Noryang Pre-Dawn Mist
);
const pal = seaPalettes.at(bIdx);
const grad = ctx.createLinearGradient(0, 0, 0, h);
grad.addColorStop(0, pal.at(0));
grad.addColorStop(1, pal.at(1));
ctx.fillStyle = grad;
ctx.fillRect(0, 0, w, h);
// 2. Nautical tactical grid & animated tidal current lines
ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
ctx.lineWidth = 1;
for (let gx = 40; gx < w; gx += 40) {
ctx.beginPath();
ctx.moveTo(gx, 0);
ctx.lineTo(gx, h);
ctx.stroke();
}
for (let gy = 40; gy < h; gy += 40) {
ctx.beginPath();
ctx.moveTo(0, gy);
ctx.lineTo(w, gy);
ctx.stroke();
}
// Animated tidal current chevrons
const flowOffset = (tick * 0.8) % 60;
ctx.strokeStyle = "rgba(125, 211, 252, 0.25)";
ctx.lineWidth = 1.5;
for (let row = 30; row < h; row += 60) {
for (let col = 30; col < w; col += 80) {
const cx = col + flowOffset - 30;
const cy = row + Math.sin((tick * 0.03) + col) * 4;
ctx.beginPath();
ctx.moveTo(cx - 8, cy - 4);
ctx.lineTo(cx, cy);
ctx.lineTo(cx - 8, cy + 4);
ctx.stroke();
}
}
// 3. Top-down archipelago coastlines (unique per battle)
ctx.fillStyle = "#1e293b";
ctx.strokeStyle = "#eab308";
ctx.lineWidth = 2;
if (bIdx === 0 || bIdx === 2) {
// Narrow strait headlands (top & bottom shores)
ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(w, 0);
ctx.lineTo(w, 42);
ctx.quadraticCurveTo(w * 0.5, 76, 0, 38);
ctx.closePath();
ctx.fill();
ctx.stroke();
ctx.beginPath();
ctx.moveTo(0, h);
ctx.lineTo(w, h);
ctx.lineTo(w, h - 38);
ctx.quadraticCurveTo(w * 0.5, h - 74, 0, h - 42);
ctx.closePath();
ctx.fill();
ctx.stroke();
} else {
// Open strait islands (Hansando / Noryang)
const islands = Array.of(
{ x: 75, y: 58, rx: 46, ry: 24 },
{ x: w - 85, y: h - 62, rx: 52, ry: 26 }
);
for (const isl of islands) {
ctx.beginPath();
ctx.ellipse(isl.x, isl.y, isl.rx, isl.ry, 0.2, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();
}
}
// 4. Enemy Atakebune Squadron (Right / Center-Right)
const enemyCount = bIdx === 2 ? 7 : 5;
for (let i = 0; i < enemyCount; i += 1) {
const spread = (i - (enemyCount - 1) / 2) * 32;
const ex = w * 0.68 + ((i % 2) * 26) - (stage >= 3 ? 14 : 0);
const ey = h * 0.5 + spread + Math.sin(tick * 0.04 + i) * 3;
drawTopDownWarship(ctx, ex, ey, Math.PI, "#7f1d1d", "#dc2626", false, false);
}
// 5. Joseon Fleet Formation (Responds dynamically to your tactical brush maneuvers!)
const joseonShips = Array.of(
{ offset: -2, turtle: false },
{ offset: -1, turtle: bIdx >= 1 && stage >= 2 },
{ offset: 0,  turtle: true }, // Admiral Yi's Flagship / Geobukseon
{ offset: 1,  turtle: bIdx >= 1 && stage >= 2 },
{ offset: 2,  turtle: false }
);
for (const ship of joseonShips) {
let jx = w * 0.26;
let jy = h * 0.5 + ship.offset * 34;
let angle = 0;
if (state.formation === "CRANE_WING" || state.formation === "VOLLEY") {
// Hakikjin (Crane Wing) crescent encirclement!
const wingCurve = Math.abs(ship.offset) * 34;
jx = w * 0.36 + wingCurve;
jy = h * 0.5 + ship.offset * 44;
angle = -ship.offset * 0.24;
} else if (state.formation === "TURTLE_SPEAR") {
jx = ship.turtle ? w * 0.48 : w * 0.30;
} else if (state.formation === "LINE_ABREAST") {
jx = w * 0.34;
}
jy += Math.sin(tick * 0.05 + ship.offset) * 2.5;
drawTopDownWarship(ctx, jx, jy, angle, "#92400e", "#d97706", ship.turtle, ship.offset === 0);
// Cannon volley tracers on final maneuver
if (state.formation === "VOLLEY" || state.isVictory) {
ctx.strokeStyle = "rgba(250, 204, 21, 0.75)";
ctx.lineWidth = 2;
ctx.setLineDash(Array.of(6, 6));
ctx.beginPath();
ctx.moveTo(jx + 18, jy);
ctx.lineTo(w * 0.66, h * 0.5 + ship.offset * 24);
ctx.stroke();
ctx.setLineDash(Array.of());
}
}
// 6. Compass Rose HUD in top-right corner
ctx.save();
ctx.translate(w - 38, 38);
ctx.strokeStyle = "rgba(250, 204, 21, 0.7)";
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.arc(0, 0, 20, 0, Math.PI * 2);
ctx.stroke();
ctx.fillStyle = "#facc15";
ctx.font = "bold 11px monospace";
ctx.textAlign = "center";
ctx.fillText("N", 0, -8);
ctx.fillText(NAVAL_BATTLES.at(bIdx).windDir, 0, 12);
ctx.restore();
// 7. Live Celestial Brush tactical stroke overlay
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
import { NAVAL_BATTLES } from "./imjin-kernel.js";
