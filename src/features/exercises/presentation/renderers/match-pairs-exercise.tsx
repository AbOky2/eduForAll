import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { EcolnaAnswerCard, useExerciseMetrics } from '@/design-system/primitives';
import { colors, pairTints } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';

type MatchStep = Extract<ExerciseStep, { type: 'match_pairs' }>;

/** Le choix en cours, à gauche : pétrole, comme toute réponse choisie. */
const SELECTING = {
  face: colors.secondaryFixed,
  edge: colors.secondaryFixedDim,
  border: colors.secondary,
  ink: colors.onSecondaryContainer,
};

/**
 * Two-column matching: tap a left card then its right partner. Each pair
 * found keeps its own tint and number on both sides (« ba, paire 1 »), so
 * what goes with what reads without colour; a wrong pairing is only revealed
 * at the end, and a tap then clears the board for a fresh try.
 */
export function MatchPairsExercise({
  step,
  interactive,
  onSubmit,
}: ExerciseRendererProps<MatchStep>) {
  const rightShuffled = useMemo(
    () =>
      [...step.pairs].sort(
        (a, b) =>
          ((a.id.charCodeAt(1) * 7) % 5) - ((b.id.charCodeAt(1) * 7) % 5) ||
          a.id.localeCompare(b.id),
      ),
    [step],
  );

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ pairId: string; matchedPairId: string }[]>([]);

  const metrics = useExerciseMetrics();
  // Numéro (à partir de 1) de la paire où figure chaque carte.
  const pairOfLeft = new Map(matches.map((match, index) => [match.pairId, index + 1]));
  const pairOfRight = new Map(matches.map((match, index) => [match.matchedPairId, index + 1]));
  const tintOf = (pair: number | undefined) =>
    pair === undefined ? undefined : pairTints[(pair - 1) % pairTints.length];
  const labelOf = (label: string, pair: number | undefined) =>
    pair === undefined ? label : fr.lesson.pairLabel(label, pair);

  const chooseRight = (rightId: string) => {
    // Une carte déjà reliée garde sa paire.
    if (!selectedLeft || pairOfRight.has(rightId)) {
      return;
    }
    const nextMatches = [...matches, { pairId: selectedLeft, matchedPairId: rightId }];
    setMatches(nextMatches);
    setSelectedLeft(null);
    if (nextMatches.length === step.pairs.length) {
      onSubmit({ kind: 'pairs', matches: nextMatches });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.columns, { gap: metrics.gap * 2.5 }]}>
        <View style={[styles.column, { gap: metrics.gap }]}>
          {step.pairs.map((pair) => (
            <EcolnaAnswerCard
              key={pair.id}
              label={pair.left}
              glyph={pair.left.length <= 6}
              glyphVariant={metrics.answerGlyph}
              tint={tintOf(pairOfLeft.get(pair.id)) ?? SELECTING}
              mark={pairOfLeft.get(pair.id)?.toString()}
              accessibilityLabel={labelOf(pair.left, pairOfLeft.get(pair.id))}
              contentStyle={{ minHeight: metrics.answerHeight }}
              state={
                pairOfLeft.has(pair.id) || selectedLeft === pair.id
                  ? 'selected'
                  : interactive
                    ? 'default'
                    : 'disabled'
              }
              onPress={() => {
                // A tap after a wrong attempt clears the board for a fresh try.
                if (matches.length === step.pairs.length) {
                  setMatches([]);
                } else if (pairOfLeft.has(pair.id)) {
                  return;
                }
                setSelectedLeft(pair.id);
              }}
            />
          ))}
        </View>
        <View style={[styles.column, { gap: metrics.gap }]}>
          {rightShuffled.map((pair) => (
            <EcolnaAnswerCard
              key={pair.id}
              label={pair.right}
              glyph={pair.right.length <= 6}
              glyphVariant={metrics.answerGlyph}
              tint={tintOf(pairOfRight.get(pair.id))}
              mark={pairOfRight.get(pair.id)?.toString()}
              accessibilityLabel={labelOf(pair.right, pairOfRight.get(pair.id))}
              contentStyle={{ minHeight: metrics.answerHeight }}
              // Jamais grisée : la colonne de droite attend simplement qu'on ait
              // choisi à gauche (un appui avant ne fait rien).
              state={pairOfRight.has(pair.id) ? 'selected' : interactive ? 'default' : 'disabled'}
              onPress={() => chooseRight(pair.id)}
            />
          ))}
        </View>
      </View>
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
  columns: { flexDirection: 'row' },
  column: { flex: 1 },
});
