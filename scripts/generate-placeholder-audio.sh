#!/usr/bin/env bash
# Placeholder audio pipeline (macOS) — see docs/audio-pipeline.md.
#
# Generates every pedagogical audio file from assets/audio/tts-map.json using
# the system French TTS voice, as clearly-flagged PLACEHOLDERS. Production
# release is gated until real recorded voices replace them (validate:release).
#
# Usage: scripts/generate-placeholder-audio.sh [voice]
set -euo pipefail
cd "$(dirname "$0")/.."

VOICE="${1:-Flo (Français (France))}" python3 - <<'EOF'
import json, os, subprocess, sys, tempfile

voice = os.environ["VOICE"]
out_dir = "assets/audio/fr"
os.makedirs(out_dir, exist_ok=True)
tts = json.load(open("assets/audio/tts-map.json"))

made = 0
with tempfile.TemporaryDirectory() as tmp:
    for audio_id, text in sorted(tts.items()):
        out = f"{out_dir}/{audio_id}.m4a"
        if os.path.exists(out):
            continue
        aiff = f"{tmp}/{audio_id}.aiff"
        subprocess.run(["say", "-v", voice, "-r", "140", "-o", aiff, text],
                       check=True, stdin=subprocess.DEVNULL)
        # Mono AAC 48 kbps keeps the bundle small for low-storage devices.
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "48000", "-c", "1", aiff, out],
                       check=True, stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
        os.remove(aiff)
        made += 1
        if made % 25 == 0:
            print(f"  {made}…", flush=True)

print(f"Done: {made} new files, {len(tts)} total expected.")
EOF
