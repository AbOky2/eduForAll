import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { LetterTile } from '@/design-system/components/letter-tile';
import { NudgeRing } from '@/design-system/components/nudge-ring';
import { EcolnaAudioButton, EcolnaButton, useExerciseMetrics } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';

type ComposeStep = Extract<ExerciseStep, { type: 'compose_syllable' } | { type: 'compose_word' }>;

interface Tile {
  key: string;
  value: string;
}

/** Minimum tiles needed to spell `target` from the tray (DFS over a multiset). */
function spellLength(target: string, tiles: readonly string[]): number {
  const search = (remaining: string, pool: string[], used: number): number | null => {
    if (remaining.length === 0) {
      return used;
    }
    for (let index = 0; index < pool.length; index += 1) {
      const tile = pool[index];
      if (tile && remaining.startsWith(tile)) {
        const nextPool = [...pool.slice(0, index), ...pool.slice(index + 1)];
        const result = search(remaining.slice(tile.length), nextPool, used + 1);
        if (result !== null) {
          return result;
        }
      }
    }
    return null;
  };
  return search(target, [...tiles], 0) ?? Math.max(2, Math.round(target.length / 2));
}

/**
 * Build a syllable/word from tiles (mockup S13). Tap a tile to place it in
 * the next free slot; tap a placed tile to send it back. Tap-to-place keeps
 * the interaction reliable for young children on small screens (documented
 * adaptation of the mockup's drag hint). The slots are hollows pressed into
 * a sand board, the tiles are pebbles: the target shape is visible before a
 * single tile is placed.
 */
export function ComposeExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<ComposeStep>) {
  const { scale, isTablet, isLandscape } = useResponsive();
  const metrics = useExerciseMetrics();
  const allTiles = useMemo<Tile[]>(
    () => step.tiles.map((value, index) => ({ key: `${value}-${index}`, value })),
    [step],
  );
  // Exact number of tiles needed to spell the target from the given tray.
  const neededSlots = useMemo(() => spellLength(step.target, step.tiles), [step]);

  const [placed, setPlaced] = useState<Tile[]>([]);
  // Un appui trop tôt allume l'anneau d'aide là où agir ; rien n'est grisé.
  const [slotsNudge, setSlotsNudge] = useState(0);
  const [verifyNudge, setVerifyNudge] = useState(0);

  useEffect(() => {
    if (step.audioId) {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const available = allTiles.filter((tile) => !placed.some((p) => p.key === tile.key));
  const full = placed.length >= neededSlots;
  const tileSize = scaled(isTablet ? 88 : 64, scale);

  const place = (tile: Tile) => {
    if (!interactive) {
      return;
    }
    if (full) {
      setVerifyNudge((count) => count + 1);
      return;
    }
    setPlaced((current) => [...current, tile]);
  };

  const verify = () => {
    if (!interactive) {
      return;
    }
    if (placed.length === 0) {
      setSlotsNudge((count) => count + 1);
      if (step.audioId) {
        playAudio(step.audioId);
      }
      return;
    }
    onSubmit({ kind: 'sequence', values: placed.map((tile) => tile.value) });
  };

  const remove = (tile: Tile) => {
    if (!interactive) {
      return;
    }
    setPlaced((current) => current.filter((candidate) => candidate.key !== tile.key));
  };

  return (
    <View style={[styles.container, { gap: metrics.gap }]}>
      {/* La planche : le mot entendu, et ses emplacements en creux. */}
      <NudgeRing
        key={`s-${slotsNudge}`}
        active={slotsNudge > 0}
        announcement={fr.lesson.nudgeTiles}
      >
        {/* Couché, l'écoute se pose à gauche des creux : la hauteur manque, pas la largeur. */}
        <View
          style={[
            styles.board,
            isLandscape && styles.boardRow,
            { padding: metrics.gap, gap: metrics.gap },
          ]}
        >
          {step.audioId ? (
            <EcolnaAudioButton
              size={scaled(isTablet ? 72 : 60, scale)}
              playing={playingAudioId === step.audioId}
              onPress={() => step.audioId && playAudio(step.audioId)}
            />
          ) : null}
          <View style={[styles.slots, { gap: scaled(spacing.sm, scale) }]}>
            {Array.from({ length: neededSlots }, (_, index) => {
              const tile = placed[index];
              return tile ? (
                <LetterTile
                  key={tile.key}
                  tone="placed"
                  label={tile.value}
                  accessibilityLabel={fr.lesson.removeTile(tile.value)}
                  onPress={() => remove(tile)}
                  variant={metrics.answerGlyph}
                  minWidth={tileSize}
                  height={tileSize}
                />
              ) : (
                <View
                  key={`empty-${index}`}
                  style={[
                    styles.hollow,
                    { minWidth: tileSize, height: tileSize, marginBottom: scaled(5, scale) },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </NudgeRing>

      {/* La réserve de tuiles. */}
      <View style={[styles.tray, { gap: scaled(spacing.md, scale) }]}>
        {available.map((tile) => (
          <LetterTile
            key={tile.key}
            tone="tray"
            label={tile.value}
            onPress={() => place(tile)}
            variant={metrics.answerGlyph}
            minWidth={tileSize}
            height={tileSize}
          />
        ))}
      </View>

      <NudgeRing
        key={`v-${verifyNudge}`}
        active={verifyNudge > 0}
        radius={radius.pill}
        announcement={fr.lesson.nudgeVerify}
        style={styles.verify}
      >
        <EcolnaButton label={fr.common.verify} onPress={verify} style={styles.verifyButton} />
      </NudgeRing>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
  },
  board: {
    alignItems: 'center',
    borderRadius: radius.xl,
    backgroundColor: colors.fill,
    borderWidth: 2,
    borderColor: colors.surfaceContainerHighest,
  },
  boardRow: { flexDirection: 'row', justifyContent: 'center' },
  slots: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', flexShrink: 1 },
  hollow: {
    borderRadius: radius.lg,
    backgroundColor: colors.fillStrong,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  tray: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  verify: { alignSelf: 'center' },
  verifyButton: { minWidth: 260 },
});
