import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

import { resolveAudioSource } from '@/content/audio-registry.generated';
import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { useReducedMotion } from '@/design-system/accessibility/use-reduced-motion';
import { SlateBoard } from '@/design-system/components/slate-board';
import { EcolnaButton, EcolnaText, useExerciseMetrics } from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, subjectColors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';
import {
  cumulativeLengths,
  glyphForTrace,
  placeStrokeLabels,
  pointAlong,
  sampleStroke,
  SAMPLES_PER_SEGMENT,
  smoothPath,
  strokeJoints,
  WRITING_LINES,
  type Point,
} from './letter-paths';

type TraceStep = Extract<ExerciseStep, { type: 'trace_letter' }>;

/** La craie fraîche (le trait de l'enfant) et la craie voilée (le modèle). */
const CHALK = colors.white;
const MODEL = colors.slateChalk;
const LINE = colors.onColorTrack;
const SOFT = colors.onNightSecondary;

/** Generous checkpoint radius: little fingers, small screens, no false failures. */
const TOLERANCE = 42;
/** La lettre brille au soleil, se dit, puis l'étape se valide seule. */
const CELEBRATION_MS = 1400;
/** La bille repart après ce temps sans geste. */
const IDLE_DEMO_MS = 4000;

/**
 * Guided letter tracing (trace_letter), on the pupil's slate (v4 : l'ardoise
 * de nuit).
 *
 * - Le modèle est une bande de craie voilée, tirée du chemin lui-même, qui
 *   commence sur la hauteur d'x et finit sur la ligne de base (bouts francs) ;
 *   une ligne médiane tiretée la parcourt.
 * - Le sens du geste : une bille soleil court le long du trait en cours au
 *   montage, puis après quatre secondes sans geste ; en mouvement réduit, une
 *   flèche fixe la remplace. Chaque trait d'une lettre en plusieurs traits
 *   porte son numéro.
 * - La lettre à écrire est montrée en Andika, dans une pastille de la
 *   discipline, en haut à gauche — le modèle du maître en marge du cahier.
 * - Fini : la lettre passe au soleil, se dit, une vibration de réussite, puis
 *   l'étape se valide seule.
 *
 * Passing near each checkpoint in order is enough — precision is never
 * punished. The letter is drawn in a box of the notebook's proportions: a
 * letter stretched across a landscape tablet would not be the letter of the
 * notebook any more.
 */
export function TraceLetterExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
}: ExerciseRendererProps<TraceStep>) {
  const glyph = useMemo(() => glyphForTrace(step.letter), [step.letter]);
  const { isTablet, isLandscape, scale, width, height, screenPadding } = useResponsive();
  const metrics = useExerciseMetrics();
  const reducedMotion = useReducedMotion();
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [strokeIndex, setStrokeIndex] = useState(0);
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [trail, setTrail] = useState<string[]>([]);
  const [touching, setTouching] = useState(false);
  const [beadProgress] = useState(() => new Animated.Value(0));
  const [beadOpacity] = useState(() => new Animated.Value(0));
  const [shine] = useState(() => new Animated.Value(0));
  // Le dernier trait montré par la bille : un nouveau trait est montré tout de suite.
  const demoedStroke = useRef(-1);

  const strokeWidth = scaled(isTablet ? 16 : 13, scale);
  const guideWidth = Math.round(strokeWidth * 1.7);
  const bandHalf = guideWidth / 2;
  const startRadius = scaled(17, scale);
  const stepRadius = Math.max(4, scaled(4.5, scale));
  // Une pastille de verre de 28 dp : le numéro se lit d'un coup d'œil, sans rivaliser avec la bille.
  const labelRadius = scaled(14, scale);
  const labelGap = scaled(4, scale);
  const chipSize = scaled(isTablet ? 50 : 42, scale);
  const chipInset = scaled(isTablet ? 14 : 10, scale);
  const chipWidth = chipSize + Math.max(0, step.letter.length - 1) * Math.round(chipSize * 0.42);

  // « lettre-i », « lettre-10 »… : dit à l'ouverture et quand la lettre est finie, s'il existe.
  const letterAudioId =
    step.audioId !== undefined && resolveAudioSource(step.audioId) !== null ? step.audioId : null;

  // La boîte de la lettre (carrée ; plus large pour un nombre), centrée sur l'ardoise.
  const aspect = glyph?.aspect ?? 1;
  const box = useMemo(() => {
    const inset = 28;
    const side = Math.max(
      0,
      Math.min(boardSize.height - inset * 2, (boardSize.width - inset * 2) / aspect),
    );
    return {
      side,
      left: (boardSize.width - side * aspect) / 2,
      top: (boardSize.height - side) / 2,
    };
  }, [boardSize, aspect]);

  const scaledStrokes = useMemo<Point[][]>(() => {
    if (!glyph || box.side === 0) {
      return [];
    }
    return glyph.strokes.map((stroke) =>
      stroke.map(([x, y]) => [box.left + x * box.side, box.top + y * box.side] as const),
    );
  }, [glyph, box]);

  const sampled = useMemo(() => scaledStrokes.map(sampleStroke), [scaledStrokes]);
  const joints = useMemo(() => strokeJoints(sampled, bandHalf), [sampled, bandHalf]);
  const strokeCount = glyph?.strokes.length ?? 0;
  const currentStroke = scaledStrokes[strokeIndex] ?? null;
  const done = glyph !== null && strokeIndex >= strokeCount;

  // Les numéros des traits (1, 2…), posés contre leur départ, hors des bandes.
  const labels = useMemo(() => {
    if (strokeCount < 2 || box.side === 0) {
      return [];
    }
    return placeStrokeLabels({
      strokes: sampled,
      bandHalf,
      // La bille et son anneau blanc, plus un souffle : la pastille ne la touche pas.
      startRadius: startRadius + labelGap,
      labelRadius,
      bounds: boardSize,
      keepOut: [{ x: 0, y: 0, width: chipInset * 2 + chipWidth, height: chipInset * 2 + chipSize }],
    });
  }, [
    sampled,
    strokeCount,
    box.side,
    bandHalf,
    startRadius,
    labelRadius,
    labelGap,
    boardSize,
    chipInset,
    chipWidth,
    chipSize,
  ]);

  // Ce qui reste à parcourir du trait en cours, depuis le prochain jalon.
  const ahead = useMemo(() => {
    const samples = sampled[strokeIndex];
    if (done || !samples) {
      return null;
    }
    const path = samples.slice(checkpointIndex * SAMPLES_PER_SEGMENT);
    return path.length > 1 ? path : null;
  }, [sampled, strokeIndex, checkpointIndex, done]);

  // La bille : une interpolation sur la courbe échantillonnée (pilote natif).
  const demo = useMemo(() => {
    if (!ahead || box.side === 0) {
      return null;
    }
    const lengths = cumulativeLengths(ahead);
    const total = lengths[lengths.length - 1] ?? 0;
    if (total < 1) {
      return null;
    }
    const inputRange: number[] = [];
    const xs: number[] = [];
    const ys: number[] = [];
    ahead.forEach(([x, y], index) => {
      const t = (lengths[index] ?? 0) / total;
      if (inputRange.length === 0 || t > (inputRange.at(-1) ?? -1)) {
        inputRange.push(t);
        xs.push(x - startRadius);
        ys.push(y - startRadius);
      }
    });
    return {
      duration: Math.round(Math.min(2200, Math.max(1100, 800 + (700 * total) / box.side))),
      transform: [
        { translateX: beadProgress.interpolate({ inputRange, outputRange: xs }) },
        { translateY: beadProgress.interpolate({ inputRange, outputRange: ys }) },
      ],
    };
  }, [ahead, box.side, startRadius, beadProgress]);

  // À l'ouverture, la lettre se dit : l'écran de leçon l'enchaîne après la consigne.
  useEffect(() => {
    if (letterAudioId) {
      playAudio(letterAudioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  // Au montage, à chaque nouveau trait, puis après quatre secondes sans geste :
  // la bille montre le chemin. Un doigt posé l'efface aussitôt.
  useEffect(() => {
    if (!demo || touching || reducedMotion) {
      return undefined;
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    let run: Animated.CompositeAnimation | undefined;
    const play = () => {
      demoedStroke.current = strokeIndex;
      beadProgress.setValue(0);
      run = Animated.sequence([
        Animated.timing(beadOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(beadProgress, {
          toValue: 1,
          duration: demo.duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(200),
        Animated.timing(beadOpacity, { toValue: 0, duration: 240, useNativeDriver: true }),
      ]);
      run.start(({ finished }) => {
        if (finished) {
          timer = setTimeout(play, IDLE_DEMO_MS);
        }
      });
    };
    const fresh = demoedStroke.current !== strokeIndex;
    timer = setTimeout(play, fresh ? (strokeIndex === 0 ? 700 : 500) : IDLE_DEMO_MS);
    return () => {
      clearTimeout(timer);
      run?.stop();
      beadOpacity.setValue(0);
    };
  }, [demo, touching, reducedMotion, strokeIndex, beadProgress, beadOpacity]);

  // En mouvement réduit : une flèche fixe, juste après le prochain jalon.
  const arrow = useMemo(() => {
    if (!reducedMotion || !ahead) {
      return null;
    }
    const size = scaled(10, scale);
    const at = pointAlong(ahead, startRadius + scaled(16, scale) + size);
    if (!at) {
      return null;
    }
    const [x, y] = at.point;
    const [dx, dy] = at.direction;
    const tip = [x + dx * size * 0.55, y + dy * size * 0.55];
    const back = [x - dx * size * 0.55, y - dy * size * 0.55] as const;
    const wing = size * 0.8;
    return `M${back[0] - dy * wing} ${back[1] + dx * wing}L${tip[0]} ${tip[1]}L${back[0] + dy * wing} ${back[1] - dx * wing}`;
  }, [reducedMotion, ahead, scale, startRadius]);

  // Fini : la lettre brille au soleil, se dit, et la tablette vibre de réussite.
  useEffect(() => {
    if (!done) {
      return undefined;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    if (letterAudioId) {
      playAudio(letterAudioId);
    }
    if (reducedMotion) {
      shine.setValue(1);
      return undefined;
    }
    const pop = Animated.timing(shine, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    pop.start();
    return () => pop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  // …puis l'étape se valide seule.
  useEffect(() => {
    if (!done || !interactive) {
      return undefined;
    }
    const timer = setTimeout(
      () => onSubmit({ kind: 'trace', reachedAllCheckpoints: true }),
      CELEBRATION_MS,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, interactive]);

  const advance = (x: number, y: number) => {
    if (!currentStroke || done) {
      return;
    }
    // Tous les jalons à portée, dans l'ordre (l'angle vif d'un v ou d'un z en a deux).
    let next = checkpointIndex;
    for (
      let target = currentStroke[next];
      target && Math.hypot(x - target[0], y - target[1]) <= TOLERANCE;
      target = currentStroke[next]
    ) {
      next += 1;
    }
    if (next === checkpointIndex) {
      return;
    }
    if (next >= currentStroke.length) {
      setStrokeIndex((index) => index + 1);
      setCheckpointIndex(0);
      setTrail([]);
    } else {
      setCheckpointIndex(next);
    }
  };

  const pan = Gesture.Pan()
    .withTestId('ardoise')
    .enabled(interactive && !done)
    .onBegin((event) => {
      setTouching(true);
      // Un simple toucher suffit pour un point (celui du i, du j).
      advance(event.x, event.y);
    })
    .onUpdate((event) => {
      const point = `${Math.round(event.x)},${Math.round(event.y)}`;
      setTrail((current) => [...current.slice(-119), point]);
      advance(event.x, event.y);
    })
    .onFinalize(() => {
      setTrail([]);
      setTouching(false);
    })
    .runOnJS(true);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width: boardWidth, height: boardHeight } = event.nativeEvent.layout;
    setBoardSize({ width: boardWidth, height: boardHeight });
  };

  if (!glyph) {
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

  // Les lignes du cahier laissent la marge à la pastille du modèle, si elle
  // descend jusqu'à elles ; sinon, elles courent d'un bord à l'autre.
  const topLine = box.top + WRITING_LINES.ascender * box.side;
  const lineStart =
    topLine < chipInset + chipSize + scaled(8, scale)
      ? chipInset + chipWidth + scaled(14, scale)
      : scaled(20, scale);
  const midDash = `${scaled(3, scale)} ${scaled(9, scale)}`;

  return (
    <View style={[styles.container, { gap: metrics.gap }]}>
      {/* L'ardoise prend la hauteur que la consigne et le bouton lui laissent, sans dépasser sa taille de cahier. */}
      <SlateBoard
        style={[
          styles.board,
          {
            // Debout, l'ardoise grandit presque en carré : le geste a la place.
            maxHeight: isLandscape
              ? scaled(isTablet ? 400 : 340, scale)
              : Math.min(width - 2 * screenPadding, Math.round(height * 0.55)),
          },
        ]}
      >
        <GestureDetector gesture={pan}>
          <View
            style={styles.canvas}
            onLayout={onLayout}
            accessibilityLabel={fr.lesson.traceLetterLabel(step.letter)}
          >
            <Svg width="100%" height="100%">
              {/* Les lignes du cahier : on pose la lettre sur la ligne de base. */}
              {box.side > 0
                ? (['ascender', 'xHeight', 'baseline'] as const).map((line) => {
                    const y = box.top + WRITING_LINES[line] * box.side;
                    return (
                      <Line
                        key={line}
                        x1={lineStart}
                        x2={boardSize.width - lineStart}
                        y1={y}
                        y2={y}
                        stroke={LINE}
                        strokeWidth={2}
                        strokeDasharray={line === 'baseline' ? '1 0' : '8 8'}
                        opacity={line === 'ascender' ? 0.6 : 1}
                      />
                    );
                  })
                : null}

              {/* Le modèle : une bande de craie voilée, aux bouts francs — elle commence
                  sur la hauteur d'x et finit sur la ligne de base. Un point reste un disque. */}
              <LetterBand
                strokes={scaledStrokes}
                joints={joints}
                width={guideWidth}
                color={MODEL}
              />

              {/* La ligne médiane, tiretée, sur ce qui reste à écrire. */}
              {!done
                ? scaledStrokes.map((stroke, index) =>
                    index >= strokeIndex && stroke.length > 1 ? (
                      <Path
                        key={`m-${index}`}
                        d={smoothPath(stroke)}
                        fill="none"
                        stroke={SOFT}
                        strokeWidth={3}
                        strokeDasharray={midDash}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : null,
                  )
                : null}

              {/* Ce qui est déjà écrit, à la craie fraîche : chaque trait fini, puis
                  le début du trait en cours — sur la courbe même du modèle. */}
              {scaledStrokes.map((stroke, index) => {
                if (index > strokeIndex) {
                  return null;
                }
                const first = stroke[0];
                if (stroke.length === 1 && first && index < strokeIndex) {
                  return (
                    <Circle
                      key={`w-${index}`}
                      cx={first[0]}
                      cy={first[1]}
                      r={strokeWidth / 2 + 2}
                      fill={CHALK}
                    />
                  );
                }
                const segments = index < strokeIndex ? stroke.length - 1 : checkpointIndex - 1;
                return segments > 0 ? (
                  <Path
                    key={`w-${index}`}
                    d={smoothPath(stroke, segments)}
                    fill="none"
                    stroke={CHALK}
                    strokeWidth={strokeWidth}
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                  />
                ) : null;
              })}

              {/* Les jalons du trait en cours : discrets, sauf le prochain, au soleil. */}
              {currentStroke && !done
                ? currentStroke.map(([x, y], cIndex) => {
                    if (cIndex < checkpointIndex) {
                      return null;
                    }
                    const isNext = cIndex === checkpointIndex;
                    return (
                      <Circle
                        key={`j-${cIndex}`}
                        cx={x}
                        cy={y}
                        r={isNext ? startRadius : stepRadius}
                        fill={isNext ? colors.reward : SOFT}
                        stroke={isNext ? colors.white : 'none'}
                        strokeWidth={isNext ? 3 : 0}
                      />
                    );
                  })
                : null}

              {arrow && !touching ? (
                <Path
                  d={arrow}
                  fill="none"
                  stroke={colors.reward}
                  strokeWidth={scaled(4, scale)}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}

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

            {/* Les numéros des traits encore à écrire. */}
            {!done
              ? labels.map(([x, y], index) =>
                  index >= strokeIndex ? (
                    <View
                      key={`n-${index}`}
                      pointerEvents="none"
                      style={[
                        styles.label,
                        {
                          left: x - labelRadius,
                          top: y - labelRadius,
                          width: labelRadius * 2,
                          height: labelRadius * 2,
                          borderRadius: labelRadius,
                        },
                      ]}
                    >
                      <EcolnaText variant="headlineSm" color={CHALK} align="center">
                        {index + 1}
                      </EcolnaText>
                    </View>
                  ) : null,
                )
              : null}

            {/* La bille qui montre le chemin. */}
            {demo ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.bead,
                  {
                    width: startRadius * 2,
                    height: startRadius * 2,
                    borderRadius: startRadius,
                    opacity: beadOpacity,
                    transform: demo.transform,
                  },
                ]}
              />
            ) : null}

            {/* Fini : la lettre passe au soleil, d'un petit bond. */}
            {done ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.fill,
                  {
                    opacity: shine.interpolate({
                      inputRange: [0, 0.35, 1],
                      outputRange: [0, 1, 1],
                    }),
                    transform: [
                      {
                        scale: shine.interpolate({
                          inputRange: [0, 0.55, 1],
                          outputRange: [0.97, 1.045, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Svg width="100%" height="100%">
                  <LetterBand
                    strokes={scaledStrokes}
                    joints={joints}
                    width={guideWidth}
                    color={colors.reward}
                  />
                </Svg>
              </Animated.View>
            ) : null}

            {/* Le modèle du maître, en marge : la lettre telle qu'on la lit. */}
            <View
              pointerEvents="none"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                styles.chip,
                {
                  top: chipInset,
                  left: chipInset,
                  minWidth: chipWidth,
                  height: chipSize,
                  borderRadius: radius.lg,
                },
              ]}
            >
              <EcolnaText
                variant="displayGlyphSmall"
                color={subjectColors.writing.tint}
                align="center"
                style={{ lineHeight: chipSize }}
              >
                {step.letter}
              </EcolnaText>
            </View>
          </View>
        </GestureDetector>
      </SlateBoard>

      {done ? (
        // Le tracé fini se valide de lui-même : pas de bouton à chercher.
        <View style={{ minHeight: scaled(60, scale) }} />
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

interface LetterBandProps {
  strokes: readonly (readonly Point[])[];
  joints: readonly Point[];
  width: number;
  color: string;
}

/**
 * La lettre en bande pleine : chaque trait aux bouts francs (posé sur les
 * lignes), un point en disque, un raccord arrondi là où un trait finit sur
 * un autre. Le modèle à la craie, puis la lettre au soleil.
 */
function LetterBand({ strokes, joints, width, color }: LetterBandProps) {
  return (
    <>
      {strokes.map((stroke, index) =>
        stroke.length > 1 ? (
          <Path
            key={`b-${index}`}
            d={smoothPath(stroke)}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        ) : stroke[0] ? (
          <Circle
            key={`b-${index}`}
            cx={stroke[0][0]}
            cy={stroke[0][1]}
            r={width / 2}
            fill={color}
          />
        ) : null,
      )}
      {joints.map(([x, y], index) => (
        <Circle key={`j-${index}`} cx={x} cy={y} r={width / 2} fill={color} />
      ))}
    </>
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
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  label: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.onColorGlass,
  },
  bead: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: colors.reward,
    borderWidth: 3,
    borderColor: colors.white,
  },
  chip: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: subjectColors.writing.deep,
  },
});
