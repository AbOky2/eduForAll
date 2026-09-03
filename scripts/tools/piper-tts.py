#!/usr/bin/env python3
"""
Synthèse Piper locale, en un seul lot — pour les sons présentés seuls.

Piper (VITS, licence MIT pour les voix) est déterministe : la durée de chaque
phonème est prédite, puis le son est décodé exactement pour ces phonèmes. Il
n'a donc pas l'instabilité d'attaque de Kokoro sur les énoncés d'un à trois
phonèmes (« bai » entendu « e-bai », « eur » entendu « une heure »). La voix
`fr_FR-siwis` est le MÊME locuteur que le `ff_siwis` de Kokoro — l'enfant
n'entend qu'un timbre.

Les phonèmes imposés (scripts/content/data/pronunciation.ts) sont donnés tels
quels : Piper parle l'API d'espeak, comme Kokoro.

Usage : piper-tts.py --job job.json --out dir/ [--model .cache/piper/fr_FR-siwis-medium.onnx]
Le fichier de job est une liste de { "id", "text", "speed", "phonemes"? }.
"""
import argparse
import json
import os
import sys
import time

import numpy as np
import soundfile as sf
from piper import PiperVoice, SynthesisConfig


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--job", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--model", default=".cache/piper/fr_FR-siwis-medium.onnx")
    args = parser.parse_args()

    if not os.path.exists(args.model):
        print(f"modèle absent : {args.model} — voir docs/audio-pipeline.md", file=sys.stderr)
        return 1

    voice = PiperVoice.load(args.model)
    rate = voice.config.sample_rate
    with open(args.job, encoding="utf-8") as handle:
        jobs = json.load(handle)
    os.makedirs(args.out, exist_ok=True)

    started = time.time()
    imposed = 0
    for index, job in enumerate(jobs, start=1):
        # Piper : length_scale > 1 ralentit. speed 0.75 → 1/0.75.
        config = SynthesisConfig(length_scale=1.0 / float(job.get("speed", 1.0)))
        phonemes = job.get("phonemes")
        if phonemes:
            # Les virgules des équivalences (« ˈe, ˈe, ˈe ») sont des pauses
            # que Piper rend par son propre phonème de ponctuation.
            ids = voice.phonemes_to_ids(list(phonemes))
            audio = voice.phoneme_ids_to_audio(ids, config)
            imposed += 1
        else:
            chunks = list(voice.synthesize(job["text"], config))
            audio = np.concatenate([chunk.audio_float_array for chunk in chunks])
        sf.write(os.path.join(args.out, f"{job['id']}.wav"), np.asarray(audio, dtype=np.float32), rate)
        if index % 25 == 0 or index == len(jobs):
            print(f"  {index}/{len(jobs)} ({time.time() - started:.0f}s)", flush=True)
    print(f"  phonèmes imposés : {imposed}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
