import { useMemo, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { SlateBoard } from '@/design-system/components/slate-board';
import { EcolnaButton, EcolnaText, useExerciseMetrics } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';
import { strokesForLetter } from './letter-paths';

type TraceStep = Extract<ExerciseStep, { type: 'trace_letter' }>;

/** La craie sur l'ardoise de nuit : le trait de l'enfant, le modèle, les jalons. */
const CHALK = colors.white;
const GUIDE = colors.onColorTrack;
const DOT = colors.onNightSecondary;

/**
 * Une courbe douce par les jalons (Catmull-Rom → Bézier) : le modèle de la
 * lettre se dessine depuis le chemin lui-même, si bien que modèle et jalons
 * coïncident toujours.
 */
function smoothPath(points: readonly (readonly [number, number])[]): string {
  const [first] = points;
  if (!first) {
    return '';
  }
  let d = `M${first[0]} ${first[1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (!p1 || !p2) {
      break;
    }
    const p0 = points[i - 1] ?? p1;
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/** Generous checkpoint radius: little fingers, small screens, no false failures. */
const TOLERANCE = 42;

/**
 * Guided letter tracing (trace_letter), on the pupil's slate (v4 : l'ardoise
 * de nuit). The model letter is a wide band of faint chalk drawn from the path
 * itself; the checkpoints are chalk dots on it; the next dot is a sun; what
 * the child has traced stays written in fresh chalk.
 * Passing near each checkpoint in order is enough — precision is never
 * punished. The letter is drawn in a square box: a letter stretched across a
 * landscape tablet would not be the letter of the notebook any more.
 */
export function TraceLetterExercise({
  step,
  interactive,
  onSubmit,
}: ExerciseRendererProps<TraceStep>) {
  const strokes = useMemo(() => strokesForLetter(step.letter), [step.letter]);
  const { isTablet, scale } = useResponsive();
  const metrics = useExerciseMetrics();
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [trail, setTrail] = useState<string[]>([]);

  // La boîte carrée de la lettre, centrée sur l'ardoise.
  const box = useMemo(() => {
    const inset = 28;
    const side = Math.max(0, Math.min(boardSize.width, boardSize.height) - inset * 2);
    return {
      side,
      left: (boardSize.width - side) / 2,
      top: (boardSize.height - side) / 2,
    };
  }, [boardSize]);

  const scaledStrokes = useMemo(() => {
    if (!strokes || box.side === 0) {
      return [];
    }
    return strokes.map((stroke) =>
      stroke.map(([x, y]) => [box.left + x * box.side, box.top + y * box.side] as const),
    );
  }, [strokes, box]);

  const currentStroke = scaledStrokes[strokeIndex] ?? null;
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
        setTrail([]);
      } else {
        setCheckpointIndex(nextCheckpoint);
      }
    }
  };

  const pan = Gesture.Pan()
    .enabled(interactive && !done)
    .onUpdate((event) => {
      const point = `${Math.round(event.x)},${Math.round(event.y)}`;
      setTrail((current) => [...current.slice(-119), point]);
      advance(event.x, event.y);
    })
    .onEnd(() => {
      setTrail([]);
    })
    .runOnJS(true);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBoardSize({ width, height });
  };

  if (!strokes) {
    // Explicit content fallback: unknown letter → acknowledge step, no dead end.
    return (
      <View style={[styles.container, { gap: metrics.gap }]}>
        <EcolnaText variant="displayGlyph" align="center">
          {step.letter}
        </EcolnaText>
        <EcolnaText variant="bodyLg" color={colors.textSecondary} align="center">
          {fr.errors.contentUnavailable}
        </EcolnaText>
        <EcolnaButton
          label={fr.common.next}
          onPress={() => onSubmit({ kind: 'trace', reachedAllCheckpoints: true })}
        />
      </View>
    );
  }

  const strokeWidth = scaled(isTablet ? 16 : 13, scale);
  const guideWidth = Math.round(strokeWidth * 2.6);
  // Ce qui est déjà écrit : chaque trait fini, puis le début du trait en cours.
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
      {/* L'ardoise prend la hauteur que la consigne et le bouton lui laissent, sans dépasser sa taille de cahier. */}
      <SlateBoard style={[styles.board, { maxHeight: scaled(isTablet ? 400 : 340, scale) }]}>
        <GestureDetector gesture={pan}>
          <View
            style={styles.canvas}
            onLayout={onLayout}
            accessibilityLabel={fr.lesson.traceLetterLabel(step.letter)}
          >
            <Svg width="100%" height="100%">
              {/* Le modèle : chaque trait de la lettre, en bande de craie pâle. */}
              {scaledStrokes.map((stroke, index) =>
                stroke.length > 1 ? (
                  <Path
                    key={`g-${index}`}
                    d={smoothPath(stroke)}
                    fill="none"
                    stroke={GUIDE}
                    strokeWidth={guideWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : stroke[0] ? (
                  <Circle
                    key={`g-${index}`}
                    cx={stroke[0][0]}
                    cy={stroke[0][1]}
                    r={guideWidth / 2}
                    fill={GUIDE}
                  />
                ) : null,
              )}
              {written.map((stroke, index) => (
                <Polyline
                  key={`w-${index}`}
                  points={stroke.map(([x, y]) => `${x},${y}`).join(' ')}
                  fill="none"
                  stroke={CHALK}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {scaledStrokes.map((stroke, sIndex) =>
                stroke.map(([x, y], cIndex) => {
                  const isDone =
                    sIndex < strokeIndex || (sIndex === strokeIndex && cIndex < checkpointIndex);
                  const isNext = sIndex === strokeIndex && cIndex === checkpointIndex;
                  if (isDone) {
                    return null;
                  }
                  return (
                    <Circle
                      key={`${sIndex}-${cIndex}`}
                      cx={x}
                      cy={y}
                      r={isNext ? scaled(17, scale) : scaled(8, scale)}
                      fill={isNext ? colors.reward : DOT}
                      stroke={isNext ? colors.white : DOT}
                      strokeWidth={isNext ? 3 : 0}
                    />
                  );
                }),
              )}
              {trail.length > 0 ? (
                <Polyline
                  points={trail.join(' ')}
                  fill="none"
                  stroke={CHALK}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
            </Svg>
          </View>
        </GestureDetector>
      </SlateBoard>

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
          {fr.lesson.traceLetterHint}
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
    maxWidth: 760,
    alignSelf: 'center',
  },
  board: { alignSelf: 'stretch', flexGrow: 1, flexShrink: 1, minHeight: 180 },
  canvas: { flex: 1 },
  verify: { alignSelf: 'center', minWidth: 260 },
});
