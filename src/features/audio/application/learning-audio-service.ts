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
      player.play();
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
