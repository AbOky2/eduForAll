import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { AudioAssetNotFoundError } from '@/core/errors/app-errors';
import { createLogger } from '@/core/logging/logger';

const log = createLogger('audio');

export type PlaybackRate = 0.75 | 1;

/**
 * Central audio service for pedagogical sounds. All assets are bundled —
 * resolution goes through the generated registry (audio-registry.ts), never
 * the network. Tolerates rapid replays, screen changes and missing assets
 * (a missing asset surfaces a typed error; the exercise shows its visual
 * fallback instead of a dead button).
 */
export interface LearningAudioService {
  preload(audioIds: readonly string[]): Promise<void>;
  play(audioId: string): Promise<void>;
  /**
   * Joue des sons l'un après l'autre (la consigne, puis le mot de l'exercice).
   * `onStart` est appelé au début de chacun. Un `play` ou un `stop` l'interrompt.
   */
  playSequence(audioIds: readonly string[], onStart?: (audioId: string) => void): Promise<void>;
  /** Le son lancé il y a moins de `withinMs` ms, s'il y en a un. */
  justStarted(withinMs: number): string | null;
  replay(): Promise<void>;
  pause(): void;
  stop(): void;
  setPlaybackRate(rate: PlaybackRate): void;
  dispose(): void;
}

type AudioSourceResolver = (audioId: string) => number | null;

export function createLearningAudioService(
  resolveSource: AudioSourceResolver,
): LearningAudioService {
  let player: AudioPlayer | null = null;
  let currentAudioId: string | null = null;
  let startedAt = 0;
  // Chaque séquence porte un jeton : un nouveau son l'invalide.
  let sequence = 0;
  let rate: PlaybackRate = 1;
  let configured = false;

  async function ensureAudioMode(): Promise<void> {
    if (configured) {
      return;
    }
    // Children learn with the phone in hand; keep playback active in silent
    // mode on iOS (pedagogical audio is the point of the screen, not music).
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' });
    configured = true;
  }

  function releasePlayer(): void {
    if (player) {
      player.release();
      player = null;
    }
  }

  async function start(audioId: string): Promise<void> {
    await ensureAudioMode();
    const source = resolveSource(audioId);
    if (source === null) {
      throw new AudioAssetNotFoundError(audioId);
    }
    // Replace instead of overlapping: a second tap restarts the sound.
    releasePlayer();
    player = createAudioPlayer(source);
    player.setPlaybackRate(rate);
    currentAudioId = audioId;
    startedAt = Date.now();
    player.play();
  }

  return {
    async preload(audioIds) {
      // Sources are bundled require() results; RN resolves them synchronously.
      // Validate they exist so a broken reference fails at lesson start, not mid-step.
      for (const audioId of audioIds) {
        if (resolveSource(audioId) === null) {
          throw new AudioAssetNotFoundError(audioId);
        }
      }
    },

    async play(audioId) {
      sequence += 1;
      await start(audioId);
    },

    async playSequence(audioIds, onStart) {
      sequence += 1;
      const token = sequence;
      const next = async (index: number): Promise<void> => {
        const audioId = audioIds[index];
        if (audioId === undefined || token !== sequence) {
          return;
        }
        await start(audioId);
        onStart?.(audioId);
        const current = player;
        current?.addListener('playbackStatusUpdate', (status) => {
          if (status.didJustFinish && token === sequence && current === player) {
            void next(index + 1).catch((cause) => log.warn(`sequence failed: ${String(cause)}`));
          }
        });
      };
      await next(0);
    },

    justStarted(withinMs) {
      return currentAudioId !== null && Date.now() - startedAt <= withinMs ? currentAudioId : null;
    },

    async replay() {
      if (!player || currentAudioId === null) {
        return;
      }
      await player.seekTo(0);
      player.play();
    },

    pause() {
      player?.pause();
    },

    stop() {
      sequence += 1;
      if (player) {
        player.pause();
        void player.seekTo(0);
      }
    },

    setPlaybackRate(newRate) {
      rate = newRate;
      player?.setPlaybackRate(newRate);
    },

    dispose() {
      try {
        releasePlayer();
      } catch (cause) {
        log.warn(`audio dispose failed: ${String(cause)}`);
      }
      currentAudioId = null;
    },
  };
}
