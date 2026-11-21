/**
• src/imjin-renderer.js — Rich Top-Down Coastal Ocean, Contoured Jade Islands, Shimmering Waves & Coherent Fleets
*/
import { NAVAL_BATTLES } from "./imjin-kernel.js";
let activeFleet = null;
let cachedBattleIdx = -1;
function getChannelBounds(x, w, h, bIdx) {
if (bIdx === 0) {
const t = Math.max(0, Math.min(1, x / w));
const top = 48 + Math.sin(t * Math.PI) * 32;
const bot = h - 48 - Math.sin(t * Math.PI) * 32;
return { top, bot };
}
if (bIdx === 2) {
const distFromChoke = Math.abs(x - w * 0.44) / (w * 0.5);
const chokePinch = Math.max(0, 1 - distFromChoke * 1.6);
const top = 50 + chokePinch * 80;
const bot = h - 50 - chokePinch * 80;
return { top, bot };
}
return { top: 44, bot: h - 44 };
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
ty = Math.max(bounds.top + 12, Math.min(bounds.bot - 12, ty));
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
const r = 6 + Math.sin(tick * 0.05 + s.id) * 1.5;
ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
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
// Luminous sea-foam wake behind stern
ctx.strokeStyle = "rgba(224, 242, 254, 0.45)";
ctx.lineWidth = 1.3;
ctx.beginPath();
ctx.moveTo(-14, -3);
ctx.lineTo(-7, 0);
ctx.lineTo(-14, 3);
ctx.stroke();
const scale = s.isFlagship ? 1.32 : s.isTurtle ? 1.18 : 0.92;
ctx.scale(scale, scale);
// Drop shadow on water
ctx.fillStyle = "rgba(2, 6, 23, 0.35)";
ctx.beginPath();
ctx.ellipse(0, 2, 10, 4.5, 0, 0, Math.PI * 2);
ctx.fill();
// Detailed wooden hull
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
function drawContouredIsland(ctx, pathBuilder) {
// 1. Shallow turquoise reef shelf
ctx.fillStyle = "rgba(45, 212, 191, 0.25)";
ctx.save();
ctx.lineWidth = 14;
ctx.strokeStyle = "rgba(45, 212, 191, 0.28)";
pathBuilder();
ctx.stroke();
ctx.restore();
// 2. Warm sandy coastline
ctx.save();
ctx.lineWidth = 6;
ctx.strokeStyle = "#d6c79c";
pathBuilder();
ctx.stroke();
ctx.restore();
// 3. Deep forested jade mountain interior
ctx.fillStyle = "#1e3a2f";
pathBuilder();
ctx.fill();
// 4. Inner elevation ridge highlight
ctx.save();
ctx.strokeStyle = "rgba(74, 124, 89, 0.65)";
ctx.lineWidth = 2;
pathBuilder();
ctx.stroke();
ctx.restore();
}
export function renderTopDownNavalChart(ctx, w, h, state, tick, userStroke) {
stepFleetPhysics(w, h, state);
const bIdx = state.battleIndex;
const battle = NAVAL_BATTLES.at(bIdx);
// 1. Rich Multi-Layered Coastal Sea Gradient (Okpo Emerald, Hansando Cerulean, Myeongnyang Deep Indigo, Noryang Dawn Gold)
const seaGrad = ctx.createLinearGradient(0, 0, w, h);
if (bIdx === 0) {
seaGrad.addColorStop(0, "#0b3b59");
seaGrad.addColorStop(0.5, "#0e5a7a");
seaGrad.addColorStop(1, "#115e59");
} else if (bIdx === 1) {
seaGrad.addColorStop(0, "#0c4a6e");
seaGrad.addColorStop(0.5, "#0369a1");
seaGrad.addColorStop(1, "#0f766e");
} else if (bIdx === 2) {
seaGrad.addColorStop(0, "#0f172a");
seaGrad.addColorStop(0.5, "#1e3a5f");
seaGrad.addColorStop(1, "#134e4a");
} else {
seaGrad.addColorStop(0, "#172554");
seaGrad.addColorStop(0.65, "#1e3a8a");
seaGrad.addColorStop(1, state.endingEffect === "DAWN_DRUM" ? "#92400e" : "#312e81");
}
ctx.fillStyle = seaGrad;
ctx.fillRect(0, 0, w, h);
// 2. Shimmering Sea Wave Crests & Flowing Tidal Currents
const flowDir = bIdx === 2 && state.completedTurns < 2 ? -1 : 1;
ctx.strokeStyle = "rgba(186, 230, 253, 0.22)";
ctx.lineWidth = 1.4;
for (let row = 24; row < h - 20; row += 26) {
ctx.beginPath();
for (let x = 0; x <= w; x += 16) {
const waveY = row + Math.sin(x * 0.03 - flowDir * tick * 0.035 + row) * 3.5;
if (x === 0) ctx.moveTo(x, waveY);
else ctx.lineTo(x, waveY);
}
ctx.stroke();
}
// Subtle golden navigational compass arcs
ctx.strokeStyle = "rgba(250, 204, 21, 0.14)";
ctx.lineWidth = 1;
for (const r of Array.of(80, 160, 240)) {
ctx.beginPath();
ctx.arc(w * 0.5, h * 0.5, r, 0, Math.PI * 2);
ctx.stroke();
}
// 3. Rendered Contoured Jade Islands & Sandy Headlands
if (bIdx === 0 || bIdx === 2) {
drawContouredIsland(ctx, () => {
ctx.beginPath();
ctx.moveTo(-10, -10);
for (let x = 0; x <= w; x += 16) ctx.lineTo(x, getChannelBounds(x, w, h, bIdx).top);
ctx.lineTo(w + 10, -10);
ctx.closePath();
});
drawContouredIsland(ctx, () => {
ctx.beginPath();
ctx.moveTo(-10, h + 10);
for (let x = 0; x <= w; x += 16) ctx.lineTo(x, getChannelBounds(x, w, h, bIdx).bot);
ctx.lineTo(w + 10, h + 10);
ctx.closePath();
});
} else {
drawContouredIsland(ctx, () => {
ctx.beginPath();
ctx.ellipse(98, 36, 56, 20, -0.12, 0, Math.PI * 2);
});
drawContouredIsland(ctx, () => {
ctx.beginPath();
ctx.ellipse(w - 98, h - 36, 62, 22, 0.12, 0, Math.PI * 2);
});
}
// 4. Render All Coherent Ship Nodes
const { joseon, enemy } = activeFleet;
for (let i = 0; i < enemy.length; i += 1) {
drawVesselNode(ctx, enemy.at(i), false, tick);
}
for (let i = 0; i < joseon.length; i += 1) {
drawVesselNode(ctx, joseon.at(i), true, tick);
}
// 5. Historically Distinct Ending Visuals per Battle!
if (state.endingEffect === "FIRE_ARROWS") {
// Okpo: Golden-amber fire arrow arcs (bijeok) raining onto anchored transports
ctx.strokeStyle = "rgba(251, 146, 60, 0.85)";
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
// Hansando: Converging Crane Wing broadside volleys
ctx.strokeStyle = "rgba(250, 204, 21, 0.7)";
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
// Myeongnyang: Surging cyan-white tidal current chevrons sweeping the enemy backward
ctx.strokeStyle = "rgba(103, 232, 249, 0.75)";
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
// Noryang: Concentric golden war-drum shockwaves radiating from Admiral Yi's flagship at sunrise
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
// 6. Tactical HUD Pill
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
// 7. Live Celestial Brush Stroke
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
