import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaAudioButton,
  EcolnaExerciseLayout,
  EcolnaText,
  useExerciseMetrics,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, illustration, spacing } from '@/design-system/tokens';

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
  const stroke = color === illustration.officialColors.blanc ? colors.outline : 'none';
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
  const cell = scaled(isTablet ? 104 : 84, scale);

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

  // La consigne est dite par l'en-tête de leçon ; ici, seulement la réécoute.
  const prompt = step.audioId ? (
    <View style={styles.prompt}>
      <EcolnaAudioButton
        size={metrics.listenSize}
        playing={playingAudioId === step.audioId}
        onPress={() => step.audioId && playAudio(step.audioId)}
      />
    </View>
  ) : null;

  const answers = (
    <View style={[styles.grid, { gap: metrics.gap }]}>
      {step.choices.map((choice) => {
        const selected = picked === choice.id;
        return (
          <EcolnaAnswerCard
            key={choice.id}
            onPress={() => submit(choice.id)}
            accessibilityLabel={choice.label ?? `${choice.shape} ${choice.color}`}
            state={!interactive && !selected ? 'disabled' : selected ? 'selected' : 'default'}
            style={styles.cell}
            contentStyle={[styles.cellFace, { minHeight: cell * 1.4 }]}
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
        );
      })}
    </View>
  );

  return <EcolnaExerciseLayout prompt={prompt} answers={answers} promptWeight={0.6} />;
}

const styles = StyleSheet.create({
  prompt: { alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  cell: { flexBasis: '42%', flexGrow: 1, maxWidth: 300 },
  cellFace: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  shapeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
