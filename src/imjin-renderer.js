/**
• src/imjin-renderer.js — Q16.16 Hanji Paper Grain, Origami Waves & Velocity-Tapered Sumi-e Ink
*/
const BAYER_4X4 = Int8Array.of(
-4, 0, -3, 1,
2, -2, 3, -1,
-3, 1, -4, 0,
3, -1, 2, -2
);
export function packRGB555(r, g, b, x = 0, y = 0) {
const d = BAYER_4X4[((y & 3) << 2) + (x & 3)];
const r5 = Math.max(0, Math.min(255, r + d)) & 0xF8;
const g5 = Math.max(0, Math.min(255, g + d)) & 0xF8;
const b5 = Math.max(0, Math.min(255, b + d)) & 0xF8;
return (255 << 24) | (b5 << 16) | (g5 << 8) | r5;
}
export function createDeterministicSinLUT() {
const lut = new Int32Array(1024);
for (let i = 0; i <= 256; i += 1) {
const x = BigInt(i * 9000) / 256n;
const term = x * (18000n - x);
const val = Number((4n * term * 65536n) / (405000000n - term)) | 0;
lut[i] = val;
lut[512 - i] = val;
lut[512 + i] = -val;
lut[(1024 - i) & 1023] = -val;
}
return lut;
}
// Velocity-tapered sumi-e brush stamping with 50/50 RGB555 ink blending
export function bakeTaperedSumiStroke(pigmentBuf, w, h, stroke, rgb) {
if (!Array.isArray(stroke) || stroke.length < 2) return;
const [cr, cg, cb] = rgb;
for (let i = 1; i < stroke.length; i += 1) {
const a = stroke.at(i - 1);
const b = stroke.at(i);
const dist = Math.hypot(b.x - a.x, b.y - a.y);
// Faster pointer motion tapers into fine bristle hair; slower motion pools ink
const radius = Math.max(1, Math.min(4, Math.round(4.5 - dist * 0.18)));
const steps = Math.max(1, Math.ceil(dist));
for (let s = 0; s <= steps; s += 1) {
const px = Math.round(a.x + ((b.x - a.x) * s) / steps);
const py = Math.round(a.y + ((b.y - a.y) * s) / steps);
for (let oy = -radius; oy <= radius; oy += 1) {
for (let ox = -radius; ox <= radius; ox += 1) {
if (ox * ox + oy * oy > radius * radius) continue;
const tx = px + ox, ty = py + oy;
if (tx >= 0 && tx < w && ty >= 0 && ty < h) {
const idx = ty * w + tx;
const fresh = packRGB555(cr, cg, cb, tx, ty);
const existing = pigmentBuf[idx];
if (existing === 0) {
pigmentBuf[idx] = fresh;
} else {
const avg = ((existing & 0x00FEFEFE) >> 1) + ((fresh & 0x00FEFEFE) >> 1);
pigmentBuf[idx] = 0xFF000000 | avg;
}
}
}
}
}
}
}
function drawPanokseonShip(buf32, w, h, cx, cy, scale, isTurtleShip) {
const hw = 18 * scale;
const hh = 6 * scale;
for (let dy = -hh; dy <= hh; dy += 1) {
const span = hw - Math.abs(dy);
for (let dx = -span; dx <= span; dx += 1) {
const px = (cx + dx) | 0;
const py = (cy + dy) | 0;
if (px >= 0 && px < w && py >= 0 && py < h) {
if (isTurtleShip && dy < 0) {
// Iron-plated hexagonal shell roof
buf32[py * w + px] = packRGB555(54, 78, 62, px, py);
} else {
// Joseon pine hull
buf32[py * w + px] = packRGB555(78, 52, 34, px, py);
}
}
}
}
// Dragon prow lantern or command sail
const lx = (cx + hw - 2) | 0;
const ly = (cy - hh - 2) | 0;
if (lx >= 0 && lx < w && ly >= 0 && ly < h) {
buf32[ly * w + lx] = packRGB555(250, 204, 84, lx, ly);
}
}
export function renderImjinFrame(buf32, w, h, state, tick, sinLUT, pigmentBuf, activeStroke, activeRgb) {
const ch = state.chapterIndex;
const stage = state.completedSteps;
const horizonY = 118;
for (let y = 0; y < h; y += 1) {
const row = y * w;
// H-Blank scanline wave ripple on sea surface (intensifies in Myeongnyang strait)
const waveAmp = ch === 2 && stage >= 2 ? 4 : 2;
const ripple = y > horizonY ? ((sinLUT[(y * 14 + tick * 3) & 1023] * waveAmp) >> 16) : 0;
for (let x = 0; x < w; x += 1) {
// Hanji mulberry paper grain base
const fiber = (((x >> 3) + (y * 3)) & 7) === 0 ? -8 : 0;
const weave = ((x ^ y) & 3) * 2;
if (y <= horizonY) {
// Sky palette shifts across the 4 battles (misty dawn -> twilight -> storm -> sunrise gold)
let sr = 224 + fiber + weave;
let sg = 214 + fiber + weave;
let sb = 192 + fiber + weave;
if (ch === 2 && stage >= 1 && stage < 6) {
// Stormy Uldolmok indigo sky
sr = 68 + weave * 3;
sg = 84 + weave * 3;
sb = 118 + weave * 4;
} else if (ch === 3 && stage >= 5) {
// Noryang sunrise gold-leaf horizon
const glow = Math.max(0, 48 - ((horizonY - y) >> 1));
sr = Math.min(255, sr + glow);
sg = Math.min(255, sg + (glow >> 1));
}
// Distant coastal islands along horizon
const islandH = 14 + (sinLUT[(x * 5 + ch * 180) & 1023] >> 13);
if (y > horizonY - islandH && ((x + ch * 40) % 130) < 76) {
sr = 58 + weave * 2;
sg = 72 + weave * 2;
sb = 86 + weave * 2;
}
buf32[row + x] = packRGB555(sr, sg, sb, x, y);
} else {
// Origami-folded Mode 7 style perspective sea crests
const dist = y - horizonY;
const crest = sinLUT[((x + ripple) * 9 + dist * 16 - tick * 2) & 1023] >> 12; // -16..+16
const foam = crest > 11 && stage >= 1 ? 36 : 0;
const wr = 34 + (dist >> 2) + foam + fiber;
const wg = 76 + (dist >> 1) + crest + foam + fiber;
const wb = 122 + (dist >> 1) + crest + foam;
buf32[row + x] = packRGB555(wr, wg, wb, x, y);
}
}
}
// Stage 3+: Joseon Panokseon & Geobukseon (Turtle Ship) formation
if (stage >= 3) {
const bob = sinLUT[(tick * 6) & 1023] >> 14;
drawPanokseonShip(buf32, w, h, 156, 166 + bob, 2, ch >= 1);
if (stage >= 4) {
drawPanokseonShip(buf32, w, h, 96, 148 - bob, 1, false);
drawPanokseonShip(buf32, w, h, 218, 150 + bob, 1, false);
}
}
// Stage 6: Sunrise / Lantern Cross Radiance
if (stage >= 6) {
const sx = 248, sy = 56;
for (let k = -26; k <= 26; k += 1) {
if (sx + k >= 0 && sx + k < w) buf32[sy * w + (sx + k)] = packRGB555(255, 242, 176, sx + k, sy);
if (sy + k >= 0 && sy + k < h) buf32[(sy + k) * w + sx] = packRGB555(255, 242, 176, sx, sy + k);
}
}
// Composite persistent tapered sumi-e ink strokes
if (pigmentBuf) {
for (let i = 0; i < buf32.length; i += 1) {
if (pigmentBuf[i] !== 0) buf32[i] = pigmentBuf[i];
}
}
// Draw active in-progress stroke
if (Array.isArray(activeStroke) && activeStroke.length >= 2) {
bakeTaperedSumiStroke(buf32, w, h, activeStroke, activeRgb || Array.of(36, 74, 118));
}
}
