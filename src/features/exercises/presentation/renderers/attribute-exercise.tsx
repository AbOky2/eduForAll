import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaExerciseLayout,
  EcolnaText,
  useExerciseMetrics,
  useAnswerCardState,
} from '@/design-system/primitives';
import { useAnswerEcho } from '@/design-system/primitives/ecolna-answer-card';
import {
  answersRoom,
  fitAnswerHeight,
  listenAnswerHeight,
} from '@/design-system/primitives/ecolna-exercise-layout';
import { scaled, useResponsive } from '@/design-system/responsive';
import { a11y, colors, illustration, spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type AttributeStep = Extract<ExerciseStep, { type: 'attribute_choice' }>;

/** The six colours named by the programme (p. 58), and nothing else. */
const OFFICIAL_COLORS: Record<AttributeStep['choices'][number]['color'], string> =
  illustration.officialColors;

/** Draws one of the four official shapes: rond, carré, rectangulaire, triangulaire. */
function AttributeShape({
  shape,
  color,
  scale,
  size,
}: {
  shape: AttributeStep['choices'][number]['shape'];
  color: string;
  scale: number;
  size: number;
}) {
  const stroke = color === illustration.officialColors.blanc ? colors.inkTertiary : 'none';
  const s = Math.max(0.3, Math.min(1, scale));
  const cx = size / 2;
  const cy = size / 2;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {shape === 'rond' ? (
        <Circle
          cx={cx}
          cy={cy}
          r={(size / 2 - 6) * s}
          fill={color}
          stroke={stroke}
          strokeWidth={2}
        />
      ) : null}
      {shape === 'carre' ? (
        <Rect
          x={cx - ((size - 12) * s) / 2}
          y={cy - ((size - 12) * s) / 2}
          width={(size - 12) * s}
          height={(size - 12) * s}
          rx={6}
          fill={color}
          stroke={stroke}
          strokeWidth={2}
        />
      ) : null}
      {shape === 'rectangle' ? (
        <Rect
          x={cx - ((size - 10) * s) / 2}
          y={cy - ((size - 10) * s * 0.55) / 2}
          width={(size - 10) * s}
          height={(size - 10) * s * 0.55}
          rx={6}
          fill={color}
          stroke={stroke}
          strokeWidth={2}
        />
      ) : null}
      {shape === 'triangle' ? (
        <Polygon
          points={`${cx},${cy - ((size - 14) * s) / 2} ${cx + ((size - 14) * s) / 2},${cy + ((size - 14) * s) / 2} ${cx - ((size - 14) * s) / 2},${cy + ((size - 14) * s) / 2}`}
          fill={color}
          stroke={stroke}
          strokeWidth={2}
        />
      ) : null}
      {shape === 'ligne' ? (
        <Rect
          x={cx - ((size - 10) * s) / 2}
          y={cy - 5}
          width={(size - 10) * s}
          height={10}
          rx={5}
          fill={color}
          stroke={stroke}
          strokeWidth={2}
        />
      ) : null}
    </Svg>
  );
}

/**
 * Sous la bande d'écoute, une carte de formes est couchée sans être un
 * bandeau : les formes y gardent leur taille, l'air autour d'elles grandit.
 */
const ATTRIBUTE_CARD_RATIO = 0.6;

/**
 * Sizes, colours, shapes and quantities (programme p. 58 — « les tailles »,
 * « les couleurs », « les formes », « les quantités »). Everything is drawn,
 * so this exercise family needs no illustration asset.
 */
export function AttributeExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<AttributeStep>) {
  const [picked, setPicked] = useState<string | null>(null);
  const { scale, isTablet } = useResponsive();
  const metrics = useExerciseMetrics();
  const cardState = useAnswerCardState(interactive);
  const echo = useAnswerEcho(interactive);
  const audioId = step.audioId ?? null;
  // Une rangée de deux ou trois ; quatre, deux par deux (à côté du pavé
  // d'écoute, une seule rangée).
  const beside = audioId !== null && metrics.listenLayout === 'pane';
  const columns =
    step.choices.length === 4 && !beside
      ? 2
      : Math.max(1, Math.min(beside ? 4 : 3, step.choices.length));
  const rows: (typeof step.choices)[] = [];
  for (let start = 0; start < step.choices.length; start += columns) {
    rows.push(step.choices.slice(start, start + columns));
  }
  // La carte se règle sur la place mesurée (sous la bande d'écoute) : jamais
  // sous la feuille de retour ; à côté du pavé, à la hauteur commune du pavé.
  const sizing = {
    preferred: Math.round(scaled(isTablet ? 104 : 84, scale) * 1.4),
    rows: rows.length,
    min: scaled(a11y.childTouchTarget + 8, scale),
  };
  const faceHeight =
    audioId !== null
      ? listenAnswerHeight(metrics, { ...sizing, columns, ratio: ATTRIBUTE_CARD_RATIO })
      : fitAnswerHeight({ ...sizing, room: answersRoom(metrics, false), gap: metrics.gap });
  const cell = Math.min(scaled(isTablet ? 104 : 84, scale), Math.round(faceHeight / 1.4));

  useEffect(() => {
    if (step.audioId) {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const submit = (choiceId: string) => {
    setPicked(choiceId);
    onSubmit({ kind: 'choice', choiceId });
  };

  const answers = (
    <View style={{ gap: metrics.gap }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap: metrics.gap }]}>
          {row.map((choice) => (
            <EcolnaAnswerCard
              key={choice.id}
              onPress={() => submit(choice.id)}
              // Retouchée pendant la reprise : elle frémit, sans répondre.
              onEcho={echo(picked === choice.id)}
              accessibilityLabel={choice.label ?? `${choice.shape} ${choice.color}`}
              state={cardState(picked === choice.id)}
              style={styles.cell}
              contentStyle={[styles.cellFace, { minHeight: faceHeight }]}
            >
              <View style={[styles.shapeRow, { maxWidth: cell * 1.6 }]}>
                {Array.from({ length: Math.max(1, choice.count) }, (_, index) => (
                  <AttributeShape
                    key={index}
                    shape={choice.shape}
                    color={OFFICIAL_COLORS[choice.color]}
                    size={cell}
                    // A repeated quantity is drawn smaller so the group still fits.
                    scale={choice.count > 1 ? choice.scale * 0.34 : choice.scale}
                  />
                ))}
              </View>
              {choice.label ? (
                <EcolnaText variant="labelMd" align="center" color={colors.textSecondary}>
                  {choice.label}
                </EcolnaText>
              ) : null}
            </EcolnaAnswerCard>
          ))}
          {/* Une rangée incomplète garde des cases de même largeur. */}
          {Array.from({ length: columns - row.length }, (_, index) => (
            <View key={`empty-${index}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );

  // La consigne est dite par l'en-tête de leçon ; ici, seulement la réécoute.
  return (
    <EcolnaExerciseLayout
      metrics={metrics}
      answers={answers}
      listen={
        audioId
          ? { playing: playingAudioId === audioId, onPress: () => playAudio(audioId) }
          : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: { flex: 1 },
  cellFace: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  shapeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
