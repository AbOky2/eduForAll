import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AlifaAudioButton, AlifaButton, AlifaText } from '@/design-system/primitives';
import { colors, radius, shadows, spacing } from '@/design-system/tokens';
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
 * adaptation of the mockup's drag hint).
 */
export function ComposeExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<ComposeStep>) {
  const allTiles = useMemo<Tile[]>(
    () => step.tiles.map((value, index) => ({ key: `${value}-${index}`, value })),
    [step],
  );
  // Exact number of tiles needed to spell the target from the given tray.
  const neededSlots = useMemo(() => spellLength(step.target, step.tiles), [step]);

  const [placed, setPlaced] = useState<Tile[]>([]);

  useEffect(() => {
    setPlaced([]);
    if (step.audioId) {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const available = allTiles.filter((tile) => !placed.some((p) => p.key === tile.key));
  const full = placed.length >= neededSlots;

  const place = (tile: Tile) => {
    if (!interactive || full) {
      return;
    }
    setPlaced((current) => [...current, tile]);
  };

  const remove = (tile: Tile) => {
    if (!interactive) {
      return;
    }
    setPlaced((current) => current.filter((candidate) => candidate.key !== tile.key));
  };

  return (
    <View style={styles.container}>
      <View style={styles.promptRow}>
        <AlifaAudioButton
          variant="sky"
          size={52}
          playing={step.audioId !== undefined && playingAudioId === step.audioId}
          onPress={() => step.audioId && playAudio(step.audioId)}
        />
        <AlifaText variant="headlineMd" style={styles.promptText}>
          {step.instruction.text}
        </AlifaText>
      </View>

      {/* Drop zone */}
      <View style={styles.dropZone}>
        <View style={styles.slots}>
          {Array.from({ length: neededSlots }, (_, index) => {
            const tile = placed[index];
            return tile ? (
              <Pressable
                key={tile.key}
                accessibilityRole="button"
                accessibilityLabel={`Retirer ${tile.value}`}
                onPress={() => remove(tile)}
                style={[styles.slot, styles.slotFilled, shadows.card]}
              >
                <AlifaText variant="displayGlyphSmall">{tile.value}</AlifaText>
              </Pressable>
            ) : (
              <View key={`empty-${index}`} style={[styles.slot, styles.slotEmpty]} />
            );
          })}
        </View>
        <AlifaText variant="bodySm" color={colors.textSecondary} align="center">
          {fr.lesson.dragHere}
        </AlifaText>
      </View>

      {/* Tile tray */}
      <View style={styles.tray}>
        {available.map((tile) => (
          <Pressable
            key={tile.key}
            accessibilityRole="button"
            accessibilityLabel={tile.value}
            disabled={!interactive || full}
            onPress={() => place(tile)}
            style={({ pressed }) => [
              styles.tile,
              shadows.card,
              { opacity: !interactive ? 0.5 : 1, transform: [{ scale: pressed ? 0.94 : 1 }] },
            ]}
          >
            <AlifaText variant="displayGlyphSmall">{tile.value}</AlifaText>
          </Pressable>
        ))}
      </View>

      <AlifaButton
        label={fr.common.verify}
        disabled={!interactive || placed.length === 0}
        onPress={() => onSubmit({ kind: 'sequence', values: placed.map((tile) => tile.value) })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.lg, justifyContent: 'center' },
  promptRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  promptText: { flex: 1 },
  dropZone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primaryContainer,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    backgroundColor: 'rgba(212,163,115,0.06)',
  },
  slots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  slot: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmpty: { backgroundColor: colors.surfaceContainerHigh },
  slotFilled: { backgroundColor: colors.card },
  tray: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  tile: {
    minWidth: 64,
    height: 64,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
