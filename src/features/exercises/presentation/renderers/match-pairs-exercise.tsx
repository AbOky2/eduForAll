import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AlifaAnswerCard, AlifaText } from '@/design-system/primitives';
import { colors, spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type MatchStep = Extract<ExerciseStep, { type: 'match_pairs' }>;

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
        (a, b) => ((a.id.charCodeAt(1) * 7) % 5) - ((b.id.charCodeAt(1) * 7) % 5) || a.id.localeCompare(b.id),
      ),
    [step],
  );

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<{ pairId: string; matchedPairId: string }[]>([]);

  const matchedLeft = new Set(matches.map((match) => match.pairId));
  const matchedRight = new Set(matches.map((match) => match.matchedPairId));

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
      <AlifaText variant="headlineMd" align="center">
        {step.instruction.text}
      </AlifaText>
      <View style={styles.columns}>
        <View style={styles.column}>
          {step.pairs.map((pair) => (
            <AlifaAnswerCard
              key={pair.id}
              label={pair.left}
              glyph={pair.left.length <= 6}
              state={
                matchedLeft.has(pair.id) || selectedLeft === pair.id
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
        <View style={styles.column}>
          {rightShuffled.map((pair) => (
            <AlifaAnswerCard
              key={pair.id}
              label={pair.right}
              glyph={pair.right.length <= 6}
              state={
                matchedRight.has(pair.id)
                  ? 'selected'
                  : interactive && selectedLeft
                    ? 'default'
                    : 'disabled'
              }
              onPress={() => chooseRight(pair.id)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.xl, justifyContent: 'center' },
  columns: { flexDirection: 'row', gap: spacing.md },
  column: { flex: 1, gap: spacing.md },
});

export { colors };
