import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { EcolnaAnswerCard, useExerciseMetrics } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, pairTints } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';

type MatchStep = Extract<ExerciseStep, { type: 'match_pairs' }>;

/** Le choix en cours, à gauche : le bleu du choix, comme toute réponse choisie. */
const SELECTING = {
  face: colors.brandTint,
  edge: colors.brandTintStrong,
  border: colors.brand,
  ink: colors.brandInk,
};

/**
 * Two-column matching: tap a left card then its right partner. Each pair
 * found keeps its own tint and number on both sides (« ba, paire 1 »), so
 * what goes with what reads without colour; a wrong pairing is only revealed
 * at the end, and a tap then clears the board for a fresh try. Between the
 * columns, a hook dot faces each card and a pair found is joined by a stroke
 * in its own tint — the gesture « relier » made visible.
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
  const { splitPanes, scale, contentMaxWidth } = useResponsive();
  // La gouttière où se tirent les traits : assez large pour qu'un trait se lise comme un geste.
  const link = Math.round(metrics.gap * (splitPanes ? 5 : 2.5));
  const dot = scaled(8, scale);
  // Le centre vertical de chaque carte (dans sa colonne), pour tirer les traits.
  const [centers, setCenters] = useState<Record<string, number>>({});
  const [columnWidth, setColumnWidth] = useState(0);
  const measure = (key: string) => (event: LayoutChangeEvent) => {
    const { y, height } = event.nativeEvent.layout;
    const center = Math.round(y + height / 2);
    setCenters((current) => (current[key] === center ? current : { ...current, [key]: center }));
  };
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
    <View style={[styles.container, { maxWidth: contentMaxWidth }]}>
      <View style={[styles.columns, { gap: link }]}>
        {/* Les traits et les points d'accroche, dans la gouttière entre les colonnes. */}
        {columnWidth > 0 ? (
          <View pointerEvents="none" style={[styles.links, { left: columnWidth, width: link }]}>
            <Svg width="100%" height="100%">
              {matches.map((match, index) => {
                const from = centers[`l-${match.pairId}`];
                const to = centers[`r-${match.matchedPairId}`];
                const tint = pairTints[index % pairTints.length];
                return from !== undefined && to !== undefined && tint ? (
                  <Line
                    key={match.pairId}
                    x1={dot + 2}
                    y1={from}
                    x2={link - dot - 2}
                    y2={to}
                    stroke={tint.border}
                    strokeWidth={6}
                    strokeLinecap="round"
                  />
                ) : null;
              })}
              {step.pairs.map((pair) => {
                const left = centers[`l-${pair.id}`];
                const right = centers[`r-${pair.id}`];
                const leftPair = pairOfLeft.get(pair.id);
                const rightPair = pairOfRight.get(pair.id);
                // Le point se remplit : bleu au choix, teinte de la paire une fois reliée.
                const fillOf = (paired: number | undefined, choosing: boolean) =>
                  paired !== undefined
                    ? (tintOf(paired)?.border ?? colors.brand)
                    : choosing
                      ? colors.brand
                      : colors.white;
                return (
                  <G key={`dots-${pair.id}`}>
                    {left !== undefined ? (
                      <Circle
                        cx={dot + 2}
                        cy={left}
                        r={dot}
                        fill={fillOf(leftPair, selectedLeft === pair.id)}
                        stroke={
                          leftPair !== undefined || selectedLeft === pair.id
                            ? colors.white
                            : colors.inkTertiary
                        }
                        strokeWidth={3}
                      />
                    ) : null}
                    {right !== undefined ? (
                      <Circle
                        cx={link - dot - 2}
                        cy={right}
                        r={dot}
                        fill={fillOf(rightPair, false)}
                        stroke={rightPair !== undefined ? colors.white : colors.inkTertiary}
                        strokeWidth={3}
                      />
                    ) : null}
                  </G>
                );
              })}
            </Svg>
          </View>
        ) : null}
        <View
          style={[styles.column, { gap: metrics.gap }]}
          onLayout={(event) => setColumnWidth(Math.round(event.nativeEvent.layout.width))}
        >
          {step.pairs.map((pair) => (
            <View key={pair.id} onLayout={measure(`l-${pair.id}`)}>
              <EcolnaAnswerCard
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
            </View>
          ))}
        </View>
        <View style={[styles.column, { gap: metrics.gap }]}>
          {rightShuffled.map((pair) => (
            <View key={pair.id} onLayout={measure(`r-${pair.id}`)}>
              <EcolnaAnswerCard
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
            </View>
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

    alignSelf: 'center',
  },
  columns: { flexDirection: 'row' },
  links: { position: 'absolute', top: 0, bottom: 0 },
  column: { flex: 1 },
});
