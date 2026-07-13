import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Polyline } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AlifaButton, AlifaCard, AlifaText } from '@/design-system/primitives';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';
import { strokesForLetter } from './letter-paths';

type TraceStep = Extract<ExerciseStep, { type: 'trace_letter' }>;

/** Generous checkpoint radius: little fingers, small screens, no false failures. */
const TOLERANCE = 42;

/**
 * Guided letter tracing (trace_letter). The child follows numbered dots
 * stroke by stroke; passing near each checkpoint in order lights it up.
 * Completing every stroke enables success — precision is never punished.
 */
export function TraceLetterExercise({
  step,
  interactive,
  onSubmit,
}: ExerciseRendererProps<TraceStep>) {
  const strokes = useMemo(() => strokesForLetter(step.letter), [step.letter]);
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [fingerTrail, setFingerTrail] = useState<string>('');
  const trailRef = useRef<string[]>([]);

  useEffect(() => {
    setStrokeIndex(0);
    setCheckpointIndex(0);
    setFingerTrail('');
    trailRef.current = [];
  }, [step.id]);

  const scaled = useMemo(() => {
    if (!strokes || boardSize.width === 0) {
      return [];
    }
    const inset = 30;
    const width = boardSize.width - inset * 2;
    const height = boardSize.height - inset * 2;
    return strokes.map((stroke) =>
      stroke.map(([x, y]) => [inset + x * width, inset + y * height] as const),
    );
  }, [strokes, boardSize]);

  const currentStroke = scaled[strokeIndex] ?? null;
  const done = strokes !== null && strokeIndex >= (strokes?.length ?? 0);

  const advance = (x: number, y: number) => {
    if (!currentStroke || done) {
      return;
    }
    const target = currentStroke[checkpointIndex];
    if (!target) {
      return;
    }
    const distance = Math.hypot(x - target[0], y - target[1]);
    if (distance <= TOLERANCE) {
      const nextCheckpoint = checkpointIndex + 1;
      if (nextCheckpoint >= currentStroke.length) {
        setStrokeIndex((index) => index + 1);
        setCheckpointIndex(0);
        trailRef.current = [];
        setFingerTrail('');
      } else {
        setCheckpointIndex(nextCheckpoint);
      }
    }
  };

  const pan = Gesture.Pan()
    .enabled(interactive && !done)
    .onUpdate((event) => {
      trailRef.current.push(`${Math.round(event.x)},${Math.round(event.y)}`);
      if (trailRef.current.length > 120) {
        trailRef.current.shift();
      }
      setFingerTrail(trailRef.current.join(' '));
      advance(event.x, event.y);
    })
    .onEnd(() => {
      trailRef.current = [];
      setFingerTrail('');
    })
    .runOnJS(true);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBoardSize({ width, height });
  };

  if (!strokes) {
    // Explicit content fallback: unknown letter → acknowledge step, no dead end.
    return (
      <View style={styles.container}>
        <AlifaText variant="displayGlyph" align="center">
          {step.letter}
        </AlifaText>
        <AlifaText variant="bodyLg" color={colors.textSecondary} align="center">
          {fr.errors.contentUnavailable}
        </AlifaText>
        <AlifaButton label={fr.common.next} onPress={() => onSubmit({ kind: 'trace', reachedAllCheckpoints: true })} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AlifaCard rounded="xl" padded={false} style={styles.board} backgroundColor="#faf7ec">
        <View style={styles.letterUnderlay} pointerEvents="none">
          <AlifaText
            variant="displayGlyph"
            color={colors.surfaceContainerHighest}
            style={styles.letterGlyph}
          >
            {step.letter}
          </AlifaText>
        </View>
        <GestureDetector gesture={pan}>
          <View style={styles.canvas} onLayout={onLayout} accessibilityLabel={`Trace la lettre ${step.letter}`}>
            <Svg width="100%" height="100%">
              {scaled.map((stroke, sIndex) =>
                stroke.map(([x, y], cIndex) => {
                  const isDone =
                    sIndex < strokeIndex ||
                    (sIndex === strokeIndex && cIndex < checkpointIndex);
                  const isNext = sIndex === strokeIndex && cIndex === checkpointIndex;
                  return (
                    <Circle
                      key={`${sIndex}-${cIndex}`}
                      cx={x}
                      cy={y}
                      r={isNext ? 14 : 9}
                      fill={
                        isDone
                          ? colors.feedbackCorrect
                          : isNext
                            ? colors.primaryContainer
                            : colors.outlineVariant
                      }
                      opacity={sIndex > strokeIndex ? 0.4 : 1}
                    />
                  );
                }),
              )}
              {fingerTrail.length > 0 ? (
                <Polyline
                  points={fingerTrail}
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
        {done ? '' : 'Pars du gros point et suis le chemin.'}
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
  board: { height: 340, overflow: 'hidden' },
  letterUnderlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterGlyph: { fontSize: 240, lineHeight: 300 },
  canvas: { flex: 1 },
});
