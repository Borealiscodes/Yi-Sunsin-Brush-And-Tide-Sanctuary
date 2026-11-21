#!/usr/bin/env python3
"""
scripts/render_imjin_cues.py — Pre-renders 1:1 FNV-1a content-hashed VITS narration WAVs
for Admiral Yi Sun-sin: Brush & Tide of the Imjin War using en_GB-alan-medium (1.28x cadence).
"""
import json
import os
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "audio" / "cues"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def fnv1a_hex(text: str) -> str:
    data = text.strip().encode("utf-8")
    h = 0x811C9DC5
    for b in data:
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def extract_cues_from_kernel() -> list[str]:
    src = (ROOT / "src" / "imjin-kernel.js").read_text(encoding="utf-8")
    titles = re.findall(r'title:\s*"([^"]+)"', src)
    briefings = re.findall(r'briefing:\s*"([^"]+)"', src)
    prompts = re.findall(r'prompt:\s*"([^"]+)"', src)
    outcomes = re.findall(r'outcome:\s*"([^"]+)"', src)

    cues: list[str] = []
    for idx, title in enumerate(titles):
        first_prompt = prompts[idx * 4] if idx * 4 < len(prompts) else ""
        cues.append(f"{title} — {briefings[idx]} {first_prompt}".strip())

    for b_idx, title in enumerate(titles):
        base = b_idx * 4
        for t in range(3):
            if base + t + 1 < len(prompts):
                cues.append(f"{outcomes[base + t]} Next: {prompts[base + t + 1]}")
        if base + 3 < len(outcomes):
            cues.append(f"{outcomes[base + 3]} ({title} Complete — 4/4 Maneuvers).")

    # Deduplicate while preserving order
    seen: set[str] = set()
    unique: list[str] = []
    for c in cues:
        if c not in seen:
            seen.add(c)
            unique.append(c)
    return unique


def find_voice_model() -> Path | None:
    candidates = [
        Path.home() / ".local" / "share" / "piper" / "en_GB-alan-medium.onnx",
        Path.home() / "piper-voices" / "en_GB-alan-medium.onnx",
        ROOT / "models" / "en_GB-alan-medium.onnx",
    ]
    for p in candidates:
        if p.exists():
            return p
    found = list(Path.home().rglob("en_GB-alan-medium.onnx"))
    return found[0] if found else None


def main() -> None:
    cues = extract_cues_from_kernel()
    manifest = {}
    piper_bin = shutil.which("piper")
    model_path = find_voice_model()

    print(f"Discovered {len(cues)} unique historical narration cues.")
    if not piper_bin or not model_path:
        print("Piper binary or en_GB-alan-medium.onnx not found locally; writing FNV-1a manifest for Web Speech fallback.")
        for text in cues:
            digest = fnv1a_hex(text)
            manifest[digest] = {"file": f"cue_{digest}.wav", "text": text, "rendered": False}
        (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        return

    for text in cues:
        digest = fnv1a_hex(text)
        wav_path = OUT_DIR / f"cue_{digest}.wav"
        manifest[digest] = {"file": wav_path.name, "text": text, "rendered": True}
        if wav_path.exists():
            continue
        cmd = [
            piper_bin,
            "--model", str(model_path),
            "--length-scale", "0.78",
            "--output_file", str(wav_path),
        ]
        subprocess.run(cmd, input=text.encode("utf-8"), check=True)
        print(f"Rendered {wav_path.name} -> {text[:64]}...")

    (OUT_DIR / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Saved {len(manifest)} entries to audio/cues/manifest.json")


if __name__ == "__main__":
    main()
