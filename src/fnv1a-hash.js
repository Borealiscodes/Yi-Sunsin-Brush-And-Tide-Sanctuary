/**
 * src/fnv1a-hash.js — Deterministic 32-bit FNV-1a Transcript Digest (Matches Python render_imjin_cues.py 1:1)
 */
export function fnv1aHex(text) {
  const bytes = new TextEncoder().encode(String(text || "").trim());
  let h = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i += 1) {
    h ^= bytes[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

export function cueUrlForText(text) {
  return "audio/cues/cue_" + fnv1aHex(text) + ".wav";
}
