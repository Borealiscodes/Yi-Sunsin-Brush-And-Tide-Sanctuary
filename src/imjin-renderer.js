/**
 * src/imjin-renderer.js — Battleship-Style Sumi-e Ink Sea Chart (Grid A1–H6)

• Renders accurate historical vessel ratios, smooth lerp formations, and ink-smoke volley impacts.
*/
import { NAVAL_BATTLES } from "./imjin-kernel.js";
const COLS = Array.of("A", "B", "C", "D", "E", "F", "G", "H");
const ROWS = Array.of("1", "2", "3", "4", "5", "6");
// Smooth position cache so ships glide into formations rather than teleporting
const shipPositions = new Map();
function lerp(a, b, t) {
return a + (b - a) * t;
}
function drawSumiVessel(ctx, x, y, angleRad, isJoseon, isTurtle, isSunk, tick) {
ctx.save();
ctx.translate(x, y);
if (isSunk) {
// Sumi-e ink smoke ring & broken hull marker on Battleship grid
const pulse = 8 + Math.sin(tick * 0.08) * 2;
ctx.strokeStyle = "rgba(239, 68, 68, 0.75)";
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.arc(0, 0, pulse, 0, Math.PI * 2);
ctx.stroke();
ctx.strokeStyle = "#f87171";
ctx.beginPath();
ctx.moveTo(-5, -5);
ctx.lineTo(5, 5);
ctx.moveTo(5, -5);
ctx.lineTo(-5, 5);
ctx.stroke();
ctx.restore();
return;
}
ctx.rotate(angleRad);
// Calligraphy brush wake behind stern
ctx.strokeStyle = isJoseon ? "rgba(217, 119, 6, 0.35)" : "rgba(185, 28, 28, 0.28)";
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(-18, -4);
ctx.lineTo(-10, 0);
ctx.lineTo(-18, 4);
ctx.stroke();
// Top-down warship hull
ctx.fillStyle = isJoseon ? (isTurtle ? "#365314" : "#78350f") : "#7f1d1d";
ctx.strokeStyle = "#1c1917";
ctx.lineWidth = 1.2;
ctx.beginPath();
ctx.moveTo(13, 0);
ctx.lineTo(5, -5.5);
ctx.lineTo(-11, -5);
ctx.lineTo(-13, 0);
ctx.lineTo(-11, 5);
ctx.lineTo(5, 5.5);
ctx.closePath();
ctx.fill();
ctx.stroke();
if (isTurtle) {
// Spiked hexagonal roof
ctx.fillStyle = "#4d7c0f";
ctx.beginPath();
ctx.ellipse(0, 0, 8, 3.8, 0, 0, Math.PI * 2);
ctx.fill();
} else {
// Cross-mast bar
ctx.fillStyle = isJoseon ? "#fbbf24" : "#fca5a5";
ctx.fillRect(-1, -6.5, 2, 13);
}
ctx.restore();
}
export function renderTopDownNavalChart(ctx, w, h, state, tick, userStroke) {
const bIdx = state.battleIndex;
const battle = NAVAL_BATTLES.at(bIdx);
const padL = 34, padT = 28, padR = 16, padB = 18;
const gridW = w - padL - padR;
const gridH = h - padT - padB;
const cellW = gridW / COLS.length;
const cellH = gridH / ROWS.length;
// 1. Warm aged Hanji / Sumi-e parchment sea chart background
const paperGrad = ctx.createLinearGradient(0, 0, w, h);
paperGrad.addColorStop(0, "#e7dec8");
paperGrad.addColorStop(1, "#d6c7a9");
ctx.fillStyle = paperGrad;
ctx.fillRect(0, 0, w, h);
// Subtle indigo sumi-e ink wash over the sea lanes
ctx.fillStyle = bIdx === 2 ? "rgba(30, 58, 95, 0.24)" : "rgba(28, 78, 112, 0.16)";
ctx.fillRect(padL, padT, gridW, gridH);
// 2. Battleship-style tactical grid (Columns A–H, Rows 1–6)
ctx.strokeStyle = "rgba(41, 37, 36, 0.28)";
ctx.lineWidth = 1;
ctx.font = "bold 11px monospace";
ctx.fillStyle = "#292524";
ctx.textAlign = "center";
for (let c = 0; c <= COLS.length; c += 1) {
const gx = padL + c * cellW;
ctx.beginPath();
ctx.moveTo(gx, padT);
ctx.lineTo(gx, padT + gridH);
ctx.stroke();
if (c < COLS.length) {
ctx.fillText(COLS.at(c), gx + cellW * 0.5, padT - 10);
}
}
ctx.textAlign = "right";
for (let r = 0; r <= ROWS.length; r += 1) {
const gy = padT + r * cellH;
ctx.beginPath();
ctx.moveTo(padL, gy);
ctx.lineTo(padL + gridW, gy);
ctx.stroke();
if (r < ROWS.length) {
ctx.fillText(ROWS.at(r), padL - 8, gy + cellH * 0.5 + 4);
}
}
// 3. Sumi-e brush-ink coastlines & choke points
ctx.fillStyle = "rgba(41, 37, 36, 0.85)";
ctx.strokeStyle = "#1c1917";
ctx.lineWidth = 2;
if (bIdx === 0 || bIdx === 2) {
// Narrow strait headlands (Okpo Bay / Uldolmok Gorge at Column C)
ctx.beginPath();
ctx.moveTo(padL, padT);
ctx.lineTo(padL + gridW, padT);
ctx.lineTo(padL + gridW, padT + cellH * 0.7);
ctx.quadraticCurveTo(padL + cellW * 2.5, padT + cellH * 1.65, padL, padT + cellH * 0.6);
ctx.closePath();
ctx.fill();
ctx.beginPath();
ctx.moveTo(padL, padT + gridH);
ctx.lineTo(padL + gridW, padT + gridH);
ctx.lineTo(padL + gridW, padT + gridH - cellH * 0.7);
ctx.quadraticCurveTo(padL + cellW * 2.5, padT + gridH - cellH * 1.65, padL, padT + gridH - cellH * 0.6);
ctx.closePath();
ctx.fill();
} else {
// Archipelago islands (Hansando / Noryang)
const islands = Array.of(
{ x: padL + cellW * 1.4, y: padT + cellH * 1.1, rx: 38, ry: 18 },
{ x: padL + cellW * 6.5, y: padT + cellH * 4.9, rx: 44, ry: 20 }
);
for (const isl of islands) {
ctx.beginPath();
ctx.ellipse(isl.x, isl.y, isl.rx, isl.ry, 0.25, 0, Math.PI * 2);
ctx.fill();
}
}
// Animated ink current chevrons
const tideFlow = (tick * 0.6) % cellW;
ctx.strokeStyle = "rgba(14, 116, 144, 0.35)";
ctx.lineWidth = 1.2;
for (let r = 1; r < 5; r += 1) {
for (let c = 1; c < 7; c += 2) {
const cx = padL + c * cellW + tideFlow - cellW * 0.5;
const cy = padT + (r + 0.5) * cellH;
ctx.beginPath();
ctx.moveTo(cx - 6, cy - 3);
ctx.lineTo(cx, cy);
ctx.lineTo(cx - 6, cy + 3);
ctx.stroke();
}
}
// 4. Render Historically Proportional Fleet Markers (1 icon = 1 ship at Myeongnyang 13 vs 133; squadron scale at larger battles)
const joseonIcons = bIdx === 2 ? 13 : bIdx === 0 ? 12 : 14;
const enemyIcons = bIdx === 2 ? 26 : bIdx === 0 ? 16 : 20;
const enemySunkRatio = (battle.enemyTotal - state.enemyActive) / battle.enemyTotal;
const sunkCount = Math.round(enemyIcons * enemySunkRatio);
// Enemy Squadron (Columns E–H)
const enemyCoords = Array.of();
for (let i = 0; i < enemyIcons; i += 1) {
const col = 4 + (i % 4);
const row = Math.floor(i / 4) % 6;
const isBottlenecked = bIdx === 2 && state.completedTurns >= 1;
const targetX = padL + (col + 0.5) * cellW - (isBottlenecked ? (col - 4) * 10 : 0);
const targetY = padT + (row + 0.5) * cellH + ((i % 2) * 8 - 4);
const key = "E-" + bIdx + "-" + i;
const prev = shipPositions.get(key) || { x: targetX, y: targetY };
const cur = { x: lerp(prev.x, targetX, 0.12), y: lerp(prev.y, targetY, 0.12) };
shipPositions.set(key, cur);
enemyCoords.push(cur);
const isSunk = i < sunkCount;
drawSumiVessel(ctx, cur.x, cur.y + Math.sin(tick * 0.05 + i) * 1.5, Math.PI, false, false, isSunk, tick);
}
// Joseon Squadron (Columns A–D, executing exact tactical formations!)
for (let i = 0; i < joseonIcons; i += 1) {
const norm = (i / (joseonIcons - 1)) - 0.5; // -0.5 .. +0.5
let targetX = padL + cellW * 1.2;
let targetY = padT + gridH * (0.5 + norm * 0.72);
let angle = 0;
if (state.formation === "DECOY_RETREAT") {
targetX = padL + cellW * 0.8;
angle = Math.PI;
} else if (state.formation === "ANCHORED_LINE") {
targetX = padL + cellW * 2.45;
targetY = padT + gridH * (0.5 + norm * 0.48);
} else if (state.formation === "LINE_ABREAST" || state.formation === "TIDE_SHIFT") {
targetX = padL + cellW * 2.8;
} else if (state.formation === "CRANE_WING" || state.formation === "VOLLEY") {
// Authentic Hakikjin (Crane Wing) U-shaped encirclement!
const wingReach = Math.pow(Math.abs(norm) * 2, 1.7) * cellW * 2.1;
targetX = padL + cellW * 2.3 + wingReach;
targetY = padT + gridH * (0.5 + norm * 0.84);
angle = -norm * 0.65;
} else if (state.formation === "TURTLE_SPEAR") {
const isTurtle = i < Math.max(1, battle.turtleCount);
targetX = isTurtle ? padL + cellW * 3.8 : padL + cellW * 2.3;
}
const key = "J-" + bIdx + "-" + i;
const prev = shipPositions.get(key) || { x: targetX, y: targetY };
const cur = { x: lerp(prev.x, targetX, 0.14), y: lerp(prev.y, targetY, 0.14) };
shipPositions.set(key, cur);
const isTurtle = i < battle.turtleCount;
drawSumiVessel(ctx, cur.x, cur.y + Math.sin(tick * 0.06 + i) * 1.5, angle, true, isTurtle, false, tick);
// Cannon volley fire arcs on final turn
if ((state.formation === "VOLLEY" || state.isVictory) && enemyCoords.length > 0 && i % 2 === 0) {
const targetEnemy = enemyCoords.at(i % enemyCoords.length);
ctx.strokeStyle = "rgba(180, 83, 9, 0.65)";
ctx.lineWidth = 1.5;
ctx.setLineDash(Array.of(5, 5));
ctx.beginPath();
ctx.moveTo(cur.x + 10, cur.y);
ctx.lineTo(targetEnemy.x, targetEnemy.y);
ctx.stroke();
ctx.setLineDash(Array.of());
}
}
// 5. Top-left Sumi-e Seal & Fleet Count Banner inside chart
ctx.fillStyle = "rgba(28, 25, 23, 0.82)";
ctx.fillRect(padL + 8, padT + 8, 255, 24);
ctx.fillStyle = "#fef3c7";
ctx.font = "bold 11px monospace";
ctx.textAlign = "left";
ctx.fillText(
"Joseon: " + state.joseonActive + "/" + battle.joseonTotal +
"  |  Invasion Fleet: " + state.enemyActive + "/" + battle.enemyTotal,
padL + 16,
padT + 24
);
// 6. Active Celestial Brush ink stroke
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
