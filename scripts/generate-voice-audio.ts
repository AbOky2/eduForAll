/* eslint-disable no-console */
/**
 * Voix définitives — synthèse au build uniquement.
 *
 * Lit `assets/audio/tts-map.json` (audioId → { texte, nature, phonèmes }),
 * appelle le moteur qui convient à chaque son et écrit
 * `assets/audio/fr/<audioId>.m4a`. L'app ne parle JAMAIS à un service au
 * runtime : tout est gravé dans le bundle. Ce script est la seule chose qui
 * touche au réseau (pour les fournisseurs hébergés), et il tourne sur la
 * machine de build.
 *
 * Usage :
 *   npm run audio:voice -- --dry-run
 *   npm run audio:voice                        # Kokoro + Piper, en local
 *   npm run audio:voice -- --only son- --force # régénérer une famille
 *   ELEVENLABS_API_KEY=… npm run audio:voice -- --provider elevenlabs --voice <id>
 *
 * Reprend où il s'est arrêté : un fichier déjà présent n'est pas regravé.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { AudioEntry, AudioKind } from './content/audio';
import { flag, has } from './tools/args';

const ROOT = join(__dirname, '..');
const AUDIO_DIR = join(ROOT, 'assets/audio/fr');
const TTS_MAP = join(ROOT, 'assets/audio/tts-map.json');
const PROVENANCE = join(ROOT, 'assets/audio/voice-provenance.json');
const PYTHON = process.env.ALIFA_PYTHON ?? join(ROOT, '.venv-audio/bin/python');

// ---------------------------------------------------------------------------
// Diction
// ---------------------------------------------------------------------------

type Delivery = 'isolated' | 'word' | 'instruction' | 'narration';

/**
 * Un son isolé ne se dit pas comme une histoire : « é », « bra », « an »
 * s'articulent lentement — c'est le modèle que l'enfant répète — les
 * consignes sont chaleureuses, les histoires narratives. La nature du son
 * vient du contenu (`kind`), jamais de son identifiant.
 */
const DELIVERY_OF_KIND: Record<AudioKind, Delivery> = {
  son: 'isolated',
  syllabe: 'isolated',
  lettre: 'isolated',
  nombre: 'isolated',
  monnaie: 'isolated',
  mot: 'word',
  instr: 'instruction',
  hint: 'instruction',
  question: 'instruction',
  graphisme: 'instruction',
  phrase: 'narration',
  histoire: 'narration',
};

/** Tout ce qu'un moteur a besoin de savoir sur une diction, au même endroit. */
const DELIVERY_PROFILE: Record<
  Delivery,
  { speed: number; stability: number; style: number; prompt: string }
> = {
  isolated: {
    speed: 0.75,
    stability: 0.85,
    style: 0.1,
    prompt:
      'Prononce très lentement et très distinctement, comme une maîtresse de CP qui donne le modèle à répéter. Articule chaque son, sans emphase théâtrale.',
  },
  word: {
    speed: 0.85,
    stability: 0.5,
    style: 0.1,
    prompt:
      'Prononce le mot lentement et clairement, avec bienveillance, comme à un enfant de six ans qui apprend à lire.',
  },
  instruction: {
    speed: 0.95,
    stability: 0.5,
    style: 0.1,
    prompt:
      'Voix chaleureuse et encourageante de maîtresse d’école primaire, débit calme, phrase posée, sourire dans la voix.',
  },
  narration: {
    speed: 0.9,
    stability: 0.5,
    style: 0.35,
    prompt:
      'Raconte doucement, comme une histoire du soir à un enfant de six ans. Débit lent, intonation vivante mais sereine.',
  },
};

// ---------------------------------------------------------------------------
// Fournisseurs
// ---------------------------------------------------------------------------

interface Target {
  readonly id: string;
  readonly text: string;
  readonly delivery: Delivery;
  readonly phonemes?: string | undefined;
}

/** Un moteur local : charge son modèle une fois et grave tout le lot. */
interface BatchProvider {
  readonly kind: 'batch';
  readonly name: string;
  readonly defaultVoice: string;
  synthesizeAll(targets: readonly Target[], voice: string): { directory: string; extension: string };
}

/** Un service hébergé : une requête par son, avec une clé d'API. */
interface HostedProvider {
  readonly kind: 'hosted';
  readonly name: string;
  readonly envKey: string;
  readonly defaultVoice: string;
  synthesize(
    target: Target,
    voice: string,
    apiKey: string,
  ): Promise<{ bytes: Buffer; extension: string }>;
}

type Provider = BatchProvider | HostedProvider;

/**
 * Les deux moteurs locaux partagent la même mécanique : un fichier de job,
 * un script Python qui charge le modèle une fois, un dossier de wav.
 */
function pythonBatchProvider(input: {
  name: string;
  script: string;
  defaultVoice: string;
  modelArgs: (voice: string) => string[];
}): BatchProvider {
  return {
    kind: 'batch',
    name: input.name,
    defaultVoice: input.defaultVoice,
    synthesizeAll(targets, voice) {
      if (!existsSync(PYTHON)) {
        throw new Error(`interpréteur Python introuvable (${PYTHON}) — voir docs/audio-pipeline.md`);
      }
      const workDir = join(tmpdir(), `alifa-${input.name}`);
      mkdirSync(workDir, { recursive: true });
      const jobPath = join(workDir, 'job.json');
      writeFileSync(
        jobPath,
        JSON.stringify(
          targets.map(({ id, text, delivery, phonemes }) => ({
            id,
            text,
            speed: DELIVERY_PROFILE[delivery].speed,
            ...(phonemes ? { phonemes } : {}),
          })),
        ),
      );
      execFileSync(
        PYTHON,
        [join(ROOT, input.script), '--job', jobPath, '--out', workDir, ...input.modelArgs(voice)],
        { stdio: 'inherit', cwd: ROOT },
      );
      return { directory: workDir, extension: 'wav' };
    },
  };
}

/**
 * Kokoro — 82 M paramètres, Apache-2.0. La voix la plus naturelle sur une
 * phrase ; structurellement instable sur un énoncé d'un à trois phonèmes.
 */
const kokoro = pythonBatchProvider({
  name: 'kokoro',
  script: 'scripts/tools/kokoro-tts.py',
  defaultVoice: 'ff_siwis',
  modelArgs: (voice) => [
    '--voice', voice,
    '--model', join(ROOT, '.cache/kokoro/kokoro-v1.0.onnx'),
    '--voices', join(ROOT, '.cache/kokoro/voices-v1.0.bin'),
  ],
});

/**
 * Piper — VITS déterministe, voix MIT. Décode exactement les phonèmes qu'on
 * lui donne : c'est lui qui dit les sons isolés. Même locuteur `siwis` que
 * Kokoro, donc un seul timbre pour l'enfant.
 */
const piper = pythonBatchProvider({
  name: 'piper',
  script: 'scripts/tools/piper-tts.py',
  defaultVoice: process.env.PIPER_VOICE ?? 'fr_FR-siwis-medium',
  modelArgs: (voice) => ['--model', join(ROOT, `.cache/piper/${voice}.onnx`)],
});

const elevenlabs: HostedProvider = {
  kind: 'hosted',
  name: 'elevenlabs',
  envKey: 'ELEVENLABS_API_KEY',
  defaultVoice: process.env.ELEVENLABS_VOICE_ID ?? '',
  async synthesize({ text, delivery }, voice, apiKey) {
    const profile = DELIVERY_PROFILE[delivery];
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2',
          language_code: 'fr',
          voice_settings: {
            stability: profile.stability,
            similarity_boost: 0.8,
            style: profile.style,
            speed: Math.max(profile.speed, 0.7),
            use_speaker_boost: true,
          },
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`ElevenLabs ${response.status}: ${await response.text()}`);
    }
    return { bytes: Buffer.from(await response.arrayBuffer()), extension: 'mp3' };
  },
};

const gemini: HostedProvider = {
  kind: 'hosted',
  name: 'gemini',
  envKey: 'GEMINI_API_KEY',
  defaultVoice: process.env.GEMINI_VOICE ?? 'Kore',
  async synthesize({ text, delivery }, voice, apiKey) {
    const model = process.env.GEMINI_TTS_MODEL ?? 'gemini-2.5-flash-preview-tts';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'x-goog-api-key': apiKey, 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${DELIVERY_PROFILE[delivery].prompt}\n\n${text}` }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
          },
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`Gemini ${response.status}: ${await response.text()}`);
    }
    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[];
    };
    const base64 = payload.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64) {
      throw new Error('Gemini: réponse sans audio');
    }
    // Gemini renvoie du PCM 16 bits 24 kHz brut : on l'habille d'un en-tête WAV.
    return { bytes: wavFromPcm(Buffer.from(base64, 'base64'), 24_000), extension: 'wav' };
  },
};

const PROVIDERS: Record<string, Provider> = { kokoro, piper, elevenlabs, gemini };

/** Minimal 16-bit mono WAV header around raw PCM. */
function wavFromPcm(pcm: Buffer, sampleRate: number): Buffer {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

// ---------------------------------------------------------------------------
// Conversion — même format que les placeholders : AAC mono 48 kbps
// ---------------------------------------------------------------------------

function hasCommand(command: string): boolean {
  try {
    execFileSync('which', [command], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const CONVERTER = hasCommand('afconvert') ? 'afconvert' : hasCommand('ffmpeg') ? 'ffmpeg' : null;

function toM4a(source: string, destination: string): void {
  if (CONVERTER === 'afconvert') {
    execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '48000', '-c', '1', source, destination]);
    return;
  }
  if (CONVERTER === 'ffmpeg') {
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error', '-i', source, '-ac', '1', '-c:a', 'aac', '-b:a', '48k', destination,
    ]);
    return;
  }
  throw new Error('ni afconvert ni ffmpeg — impossible de convertir en m4a');
}

// ---------------------------------------------------------------------------
// Exécution
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const providerName = flag('provider') ?? 'kokoro';
  const provider = PROVIDERS[providerName];
  if (!provider) {
    throw new Error(`fournisseur inconnu : ${providerName} (${Object.keys(PROVIDERS).join(', ')})`);
  }
  const voice = flag('voice') ?? provider.defaultVoice;
  const only = flag('only');
  const force = has('force');
  const dryRun = has('dry-run');
  // Par défaut, les sons isolés partent à Piper ; --no-routing garde tout sur
  // le fournisseur demandé.
  const routing = !has('no-routing') && provider !== piper;

  const ttsMap = JSON.parse(readFileSync(TTS_MAP, 'utf8')) as Record<string, AudioEntry>;
  const provenanceFile = existsSync(PROVENANCE)
    ? (JSON.parse(readFileSync(PROVENANCE, 'utf8')) as { voices: Record<string, string> })
    : { voices: {} };

  const targets: Target[] = Object.entries(ttsMap)
    .filter(([id]) => (only ? id.startsWith(only) : true))
    .filter(([id]) => force || !existsSync(join(AUDIO_DIR, `${id}.m4a`)) || !provenanceFile.voices[id])
    .map(([id, entry]) => ({
      id,
      text: entry.text,
      delivery: DELIVERY_OF_KIND[entry.kind],
      phonemes: entry.phonemes,
    }));

  const isolated = routing ? targets.filter((target) => target.delivery === 'isolated') : [];
  const remaining = routing ? targets.filter((target) => target.delivery !== 'isolated') : targets;
  const characters = targets.reduce((sum, target) => sum + target.text.length, 0);
  console.log(
    `${targets.length} sons à générer (${characters} caractères) — ${providerName}/${voice || '(voix non définie)'}` +
      (isolated.length > 0 ? ` · ${isolated.length} sons isolés → piper/${piper.defaultVoice}` : ''),
  );
  if (dryRun) {
    for (const target of targets.slice(0, 12)) {
      console.log(`  ${target.id} [${target.delivery}] ${JSON.stringify(target.text)}`);
    }
    if (targets.length > 12) {
      console.log(`  … et ${targets.length - 12} autres`);
    }
    return;
  }
  if (!voice) {
    throw new Error('aucune voix choisie — passer --voice <id>');
  }
  mkdirSync(AUDIO_DIR, { recursive: true });

  const save = (id: string, source: string, tag: string): void => {
    const destination = join(AUDIO_DIR, `${id}.m4a`);
    toM4a(source, destination);
    if (statSync(destination).size < 1000) {
      throw new Error(`${id}: fichier converti suspicieusement petit`);
    }
    provenanceFile.voices[id] = tag;
  };
  const saveProvenance = () =>
    writeFileSync(PROVENANCE, `${JSON.stringify(provenanceFile, null, 1)}\n`);

  const runBatch = (batch: BatchProvider, batchTargets: readonly Target[], batchVoice: string) => {
    if (batchTargets.length === 0) {
      return;
    }
    const { directory, extension } = batch.synthesizeAll(batchTargets, batchVoice);
    for (const target of batchTargets) {
      save(target.id, join(directory, `${target.id}.${extension}`), `${batch.name}:${batchVoice}`);
    }
    saveProvenance();
  };

  runBatch(piper, isolated, piper.defaultVoice);

  if (provider.kind === 'batch') {
    runBatch(provider, remaining, voice);
  } else {
    const apiKey = process.env[provider.envKey];
    if (!apiKey) {
      throw new Error(`${provider.envKey} manquant dans l'environnement`);
    }
    let done = 0;
    for (const target of remaining) {
      const { bytes, extension } = await provider.synthesize(target, voice, apiKey);
      const raw = join(tmpdir(), `alifa-${target.id}.${extension}`);
      writeFileSync(raw, bytes);
      save(target.id, raw, `${provider.name}:${voice}`);
      done += 1;
      if (done % 25 === 0 || done === remaining.length) {
        console.log(`  ${done}/${remaining.length}`);
        saveProvenance();
      }
    }
  }
  saveProvenance();
  console.log(`✅ ${targets.length} sons enregistrés — relancer generate-content.ts pour le manifeste.`);
}

void main().catch((cause) => {
  console.error(`❌ ${String(cause)}`);
  process.exit(1);
});
