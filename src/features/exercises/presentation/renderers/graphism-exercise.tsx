import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AlifaButton, AlifaCard, AlifaText } from '@/design-system/primitives';
import { useResponsive } from '@/design-system/responsive';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';
import { PATTERN_LABELS, strokesForPattern } from './graphism-paths';

type GraphismStep = Extract<ExerciseStep, { type: 'trace_graphism' }>;

/** Same generous tolerance as letter tracing — little fingers, never punished. */
const TOLERANCE = 44;

/**
 * Pre-writing graphism (trace_graphism) — the phase the programme places
 * before any letter (p. 26). The board reproduces the « cahier à double
 * lignes » the child uses in class, and the pattern is repeated across the
 * row, left to right, as on a real writing line.
 */
export function GraphismExercise({
  step,
  interactive,
  onSubmit,
}: ExerciseRendererProps<GraphismStep>) {
  const strokes = useMemo(() => strokesForPattern(step.pattern), [step.pattern]);
  const { isTablet } = useResponsive();
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [trail, setTrail] = useState<string[]>([]);

  const insetX = 24;
  const insetY = 26;

  const scaled = useMemo(() => {
    if (boardSize.width === 0) {
      return [];
    }
    const width = boardSize.width - insetX * 2;
    const height = boardSize.height - insetY * 2;
    return strokes.map((stroke) =>
      stroke.map(([x, y]) => [insetX + x * width, insetY + y * height] as const),
    );
  }, [strokes, boardSize]);

  const currentStroke = scaled[strokeIndex] ?? null;
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

  return (
    <View style={styles.container}>
      <AlifaCard
        rounded="xl"
        padded={false}
        style={[styles.board, { height: isTablet ? 360 : 260 }]}
        backgroundColor="#faf7ec"
      >
        <GestureDetector gesture={pan}>
          <View
            style={styles.canvas}
            onLayout={onLayout}
            accessibilityLabel={`Trace ${PATTERN_LABELS[step.pattern]}`}
          >
            <Svg width="100%" height="100%">
              {boardSize.height > 0 ? (
                <>
                  <Line
                    x1={insetX / 2}
                    y1={topLine}
                    x2={boardSize.width - insetX / 2}
                    y2={topLine}
                    stroke={colors.outlineVariant}
                    strokeWidth={1.5}
                  />
                  <Line
                    x1={insetX / 2}
                    y1={bottomLine}
                    x2={boardSize.width - insetX / 2}
                    y2={bottomLine}
                    stroke={colors.secondaryFixedDim}
                    strokeWidth={2}
                  />
                </>
              ) : null}
              {scaled.map((stroke, sIndex) =>
                stroke.map(([x, y], cIndex) => {
                  const isDone =
                    sIndex < strokeIndex || (sIndex === strokeIndex && cIndex < checkpointIndex);
                  const isNext = sIndex === strokeIndex && cIndex === checkpointIndex;
                  return (
                    <Circle
                      key={`${sIndex}-${cIndex}`}
                      cx={x}
                      cy={y}
                      r={isNext ? 13 : 7}
                      fill={
                        isDone
                          ? colors.feedbackCorrect
                          : isNext
                            ? colors.primaryContainer
                            : colors.outlineVariant
                      }
                      opacity={sIndex > strokeIndex ? 0.35 : 1}
                    />
                  );
                }),
              )}
              {trail.length > 0 ? (
                <Polyline
                  points={trail.join(' ')}
                  fill="none"
                  stroke={colors.secondary}
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.5}
                />
              ) : null}
            </Svg>
          </View>
        </GestureDetector>
      </AlifaCard>

      <AlifaText variant="bodyMd" color={colors.textSecondary} align="center">
        {done ? '' : 'Pars du gros point et va vers la droite.'}
      </AlifaText>

      <AlifaButton
        label={fr.common.verify}
        disabled={!interactive || !done}
        onPress={() => onSubmit({ kind: 'trace', reachedAllCheckpoints: true })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.md, justifyContent: 'center' },
  board: { overflow: 'hidden' },
  canvas: { flex: 1 },
});
