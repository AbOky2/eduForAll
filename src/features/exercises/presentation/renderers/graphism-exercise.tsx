import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaButton,
  EcolnaCard,
  EcolnaText,
  useExerciseMetrics,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, illustration } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';
import { PATTERN_LABELS, strokesForPattern } from './graphism-paths';

type GraphismStep = Extract<ExerciseStep, { type: 'trace_graphism' }>;

const { ruleBlue, ruleRose } = illustration.school;

/** Same generous tolerance as letter tracing — little fingers, never punished. */
const TOLERANCE = 44;

/**
 * Pre-writing graphism (trace_graphism) — the phase the programme places
 * before any letter (p. 26). The board is a page of the « cahier à double
 * lignes » the child uses in class — a white page, a blue head line, a rose
 * base line — and the pattern runs across the row, left to right. What the
 * child has traced stays written in ink.
 */
export function GraphismExercise({
  step,
  interactive,
  onSubmit,
}: ExerciseRendererProps<GraphismStep>) {
  const strokes = useMemo(() => strokesForPattern(step.pattern), [step.pattern]);
  const { isTablet, scale } = useResponsive();
  const metrics = useExerciseMetrics();
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [trail, setTrail] = useState<string[]>([]);

  const insetX = 28;
  const insetY = 30;

  const scaledStrokes = useMemo(() => {
    if (boardSize.width === 0) {
      return [];
    }
    const width = boardSize.width - insetX * 2;
    const height = boardSize.height - insetY * 2;
    return strokes.map((stroke) =>
      stroke.map(([x, y]) => [insetX + x * width, insetY + y * height] as const),
    );
  }, [strokes, boardSize]);

  const currentStroke = scaledStrokes[strokeIndex] ?? null;
  const done = strokeIndex >= strokes.length;

  const advance = (x: number, y: number) => {
    if (!currentStroke || done) {
      return;
    }
    const target = currentStroke[checkpointIndex];
    if (!target) {
      return;
    }
    if (Math.hypot(x - target[0], y - target[1]) <= TOLERANCE) {
      const next = checkpointIndex + 1;
      if (next >= currentStroke.length) {
        setStrokeIndex((index) => index + 1);
        setCheckpointIndex(0);
        setTrail([]);
      } else {
        setCheckpointIndex(next);
      }
    }
  };

  const pan = Gesture.Pan()
    .enabled(interactive && !done)
    .onUpdate((event) => {
      setTrail((current) => [
        ...current.slice(-119),
        `${Math.round(event.x)},${Math.round(event.y)}`,
      ]);
      advance(event.x, event.y);
    })
    .onEnd(() => setTrail([]))
    .runOnJS(true);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBoardSize({ width, height });
  };

  // The two guide lines of the school notebook the programme names (p. 26).
  const topLine = insetY + (boardSize.height - insetY * 2) * 0.12;
  const bottomLine = insetY + (boardSize.height - insetY * 2) * 0.9;
  const ink = scaled(isTablet ? 11 : 9, scale);
  const written = scaledStrokes
    .map((stroke, sIndex) =>
      sIndex < strokeIndex
        ? stroke
        : sIndex === strokeIndex
          ? stroke.slice(0, checkpointIndex)
          : [],
    )
    .filter((stroke) => stroke.length > 1);

  return (
    <View style={[styles.container, { gap: metrics.gap }]}>
      <EcolnaCard
        rounded="xl"
        padded={false}
        style={[styles.board, { maxHeight: scaled(isTablet ? 300 : 260, scale) }]}
        backgroundColor={colors.white}
      >
        <GestureDetector gesture={pan}>
          <View
            style={styles.canvas}
            onLayout={onLayout}
            accessibilityLabel={fr.lesson.traceGraphismLabel(PATTERN_LABELS[step.pattern])}
          >
            <Svg width="100%" height="100%">
              {boardSize.height > 0 ? (
                <>
                  <Line
                    x1={0}
                    y1={topLine}
                    x2={boardSize.width}
                    y2={topLine}
                    stroke={ruleBlue}
                    strokeWidth={2}
                  />
                  <Line
                    x1={0}
                    y1={bottomLine}
                    x2={boardSize.width}
                    y2={bottomLine}
                    stroke={ruleRose}
                    strokeWidth={2.5}
                  />
                </>
              ) : null}
              {written.map((stroke, index) => (
                <Polyline
                  key={`w-${index}`}
                  points={stroke.map(([x, y]) => `${x},${y}`).join(' ')}
                  fill="none"
                  stroke={colors.brand}
                  strokeWidth={ink}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {scaledStrokes.map((stroke, sIndex) =>
                stroke.map(([x, y], cIndex) => {
                  const isDone =
                    sIndex < strokeIndex || (sIndex === strokeIndex && cIndex < checkpointIndex);
                  const isNext = sIndex === strokeIndex && cIndex === checkpointIndex;
                  if (isDone && stroke.length > 1) {
                    return null;
                  }
                  return (
                    <Circle
                      key={`${sIndex}-${cIndex}`}
                      cx={x}
                      cy={y}
                      r={isNext ? scaled(14, scale) : scaled(6, scale)}
                      fill={isDone ? colors.brand : isNext ? colors.reward : colors.borderStrong}
                      stroke={isNext ? colors.rewardPressed : colors.borderStrong}
                      strokeWidth={isNext ? 3 : 0}
                    />
                  );
                }),
              )}
              {trail.length > 0 ? (
                <Polyline
                  points={trail.join(' ')}
                  fill="none"
                  stroke={colors.brand}
                  strokeWidth={ink}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </Svg>
          </View>
        </GestureDetector>
      </EcolnaCard>

      {done ? (
        <EcolnaButton
          label={fr.common.verify}
          disabled={!interactive}
          onPress={() => onSubmit({ kind: 'trace', reachedAllCheckpoints: true })}
          style={styles.verify}
        />
      ) : (
        <EcolnaText
          variant="headlineSm"
          color={colors.textSecondary}
          align="center"
          style={{ minHeight: scaled(60, scale) }}
        >
          {fr.lesson.traceGraphismHint}
        </EcolnaText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  // La feuille prend la hauteur qui reste, sans dépasser sa taille de cahier.
  board: { overflow: 'hidden', alignSelf: 'stretch', flexGrow: 1, flexShrink: 1, minHeight: 160 },
  canvas: { flex: 1 },
  verify: { alignSelf: 'center', minWidth: 260 },
});
