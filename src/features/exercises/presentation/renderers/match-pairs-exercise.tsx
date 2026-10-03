import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { EcolnaAnswerCard, useExerciseMetrics } from '@/design-system/primitives';
import { colors, subjectColors } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type MatchStep = Extract<ExerciseStep, { type: 'match_pairs' }>;

/** Une couleur par paire trouvée, la même des deux côtés. */
const PAIR_TINTS = (['language', 'writing', 'math', 'reading'] as const).map((family) => ({
  face: subjectColors[family].face,
  edge: subjectColors[family].edge,
  border: subjectColors[family].deep,
  ink: subjectColors[family].ink,
}));
const SELECTING = {
  face: colors.secondaryFixed,
  edge: colors.secondaryFixedDim,
  border: colors.secondary,
  ink: colors.onSecondaryContainer,
};

/**
 * Two-column matching: tap a left card then its right partner. Matched pairs
 * lock in green; a wrong pairing shakes back to neutral (state only, kind).
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
  const tintOfLeft = new Map(matches.map((match, index) => [match.pairId, PAIR_TINTS[index % 4]]));
  const tintOfRight = new Map(
    matches.map((match, index) => [match.matchedPairId, PAIR_TINTS[index % 4]]),
  );

  const chooseRight = (rightId: string) => {
    if (!selectedLeft) {
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
              tint={tintOfLeft.get(pair.id) ?? SELECTING}
              contentStyle={{ minHeight: metrics.answerHeight }}
              state={
                tintOfLeft.has(pair.id) || selectedLeft === pair.id
                  ? 'selected'
                  : interactive
                    ? 'default'
                    : 'disabled'
              }
              onPress={() => {
                // A tap after a wrong attempt clears the board for a fresh try.
                if (matches.length === step.pairs.length) {
                  setMatches([]);
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
              tint={tintOfRight.get(pair.id)}
              contentStyle={{ minHeight: metrics.answerHeight }}
              // Jamais grisée : la colonne de droite attend simplement qu'on ait
              // choisi à gauche (un appui avant ne fait rien).
              state={tintOfRight.has(pair.id) ? 'selected' : interactive ? 'default' : 'disabled'}
              onPress={() => chooseRight(pair.id)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', width: '100%', maxWidth: 820, alignSelf: 'center' },
  columns: { flexDirection: 'row' },
  column: { flex: 1 },
});

