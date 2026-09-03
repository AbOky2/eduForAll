#!/usr/bin/env python3
"""
Contrôle d'écoute sans oreilles : que disent VRAIMENT les fichiers audio ?

Un reconnaisseur de phonèmes (wav2vec2 entraîné sur l'API d'espeak) transcrit
chaque son en phonèmes, qu'on met en regard des phonèmes attendus. Il est
imparfait sur des clips d'une demi-seconde — il confond des voyelles proches —
mais il ne rate pas ce qui compte : du bruit phonémique AJOUTÉ devant le son
(« a » reconnu « iznaː »), une lettre épelée à la place du son, un mot lu à
la place d'une syllabe.

Outil de diagnostic, pas gate de release : il tire 1,3 Go de dépendances
(torch, transformers) et un jugement humain reste nécessaire.

Usage : check-phonemes.py [--only son-] [--limit 40]
Dépendances : .venv-audio + `pip install torch transformers`.
"""
import argparse
import json
import os
import sys

import espeakng_loader

os.environ.setdefault("PHONEMIZER_ESPEAK_LIBRARY", espeakng_loader.get_library_path())
os.environ.setdefault("ESPEAK_DATA_PATH", espeakng_loader.get_data_path())

import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402
import torch  # noqa: E402
from transformers import AutoModelForCTC, AutoProcessor  # noqa: E402
from kokoro_onnx.config import EspeakConfig  # noqa: E402
from kokoro_onnx.tokenizer import Tokenizer  # noqa: E402

MODEL = "facebook/wav2vec2-lv-60-espeak-cv-ft"


def resample(samples, rate, target=16000):
    if rate == target:
        return samples.astype(np.float32)
    count = int(len(samples) * target / rate)
    grid = np.linspace(0, len(samples) - 1, count)
    return np.interp(grid, np.arange(len(samples)), samples).astype(np.float32)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", default="")
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--dir", default="assets/audio/fr")
    args = parser.parse_args()

    tts = json.load(open("assets/audio/tts-map.json", encoding="utf-8"))
    ids = sorted(i for i in tts if i.startswith(args.only))
    if args.limit:
        ids = ids[: args.limit]

    processor = AutoProcessor.from_pretrained(MODEL)
    model = AutoModelForCTC.from_pretrained(MODEL).eval()
    tokenizer = Tokenizer(
        espeak_config=EspeakConfig(
            lib_path=espeakng_loader.get_library_path(), data_path=espeakng_loader.get_data_path()
        )
    )

    print(f"{'id':30s} {'attendu':18s} reconnu")
    for audio_id in ids:
        path = os.path.join(args.dir, f"{audio_id}.m4a")
        if not os.path.exists(path):
            continue
        # soundfile ne lit pas le m4a : passer par afconvert (macOS) en wav temporaire
        wav = f"/tmp/alifa-check-{audio_id}.wav"
        os.system(f'afconvert -f WAVE -d LEI16 "{path}" "{wav}" 2>/dev/null')
        samples, rate = sf.read(wav, dtype="float32")
        os.remove(wav)
        if samples.ndim > 1:
            samples = samples.mean(axis=1)
        inputs = processor(resample(samples, rate), sampling_rate=16000, return_tensors="pt")
        with torch.no_grad():
            logits = model(**inputs).logits
        heard = processor.batch_decode(torch.argmax(logits, -1))[0].replace(" ", "")
        entry = tts[audio_id]
        expected = entry.get("phonemes") or tokenizer.phonemize(entry["text"], lang="fr-fr").rstrip(".")
        print(f"{audio_id:30s} {expected:18s} {heard}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
