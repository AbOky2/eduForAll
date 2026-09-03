#!/usr/bin/env python3
"""
Synthèse Kokoro locale, en un seul lot.

Kokoro (82 M paramètres, Apache-2.0) tourne entièrement sur la machine de
build : aucun compte, aucune clé, aucun appel réseau, et le résultat est
reproductible tant qu'on garde le modèle et la voix. Le modèle se charge UNE
fois pour tout le corpus.

Kokoro reçoit les mots, consignes et histoires ; les sons isolés vont à Piper
(scripts/tools/piper-tts.py), Kokoro y inventant une attaque parasite. Les
phonèmes imposés éventuels (champ `phonemes` du job, issus de
scripts/content/data/pronunciation.ts) sont donnés tels quels.

Usage : kokoro-tts.py --job job.json --out dir/ [--voice ff_siwis]
Le fichier de job est une liste de { "id", "text", "speed", "phonemes"? }.
"""
import argparse
import json
import os
import sys
import time

import espeakng_loader
import soundfile as sf
from kokoro_onnx import Kokoro
from kokoro_onnx.config import EspeakConfig


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--job", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--voice", default="ff_siwis")
    parser.add_argument("--model", default=".cache/kokoro/kokoro-v1.0.onnx")
    parser.add_argument("--voices", default=".cache/kokoro/voices-v1.0.bin")
    args = parser.parse_args()

    for path in (args.model, args.voices):
        if not os.path.exists(path):
            print(f"modèle absent : {path} — voir docs/audio-pipeline.md", file=sys.stderr)
            return 1

    kokoro = Kokoro(
        args.model,
        args.voices,
        espeak_config=EspeakConfig(
            lib_path=espeakng_loader.get_library_path(),
            data_path=espeakng_loader.get_data_path(),
        ),
    )
    with open(args.job, encoding="utf-8") as handle:
        jobs = json.load(handle)
    os.makedirs(args.out, exist_ok=True)

    started = time.time()
    for index, job in enumerate(jobs, start=1):
        phonemes = job.get("phonemes")
        samples, rate = kokoro.create(
            phonemes or job["text"],
            voice=args.voice,
            speed=job.get("speed", 1.0),
            lang="fr-fr",
            is_phonemes=bool(phonemes),
        )
        sf.write(os.path.join(args.out, f"{job['id']}.wav"), samples, rate)
        if index % 25 == 0 or index == len(jobs):
            print(f"  {index}/{len(jobs)} ({time.time() - started:.0f}s)", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
