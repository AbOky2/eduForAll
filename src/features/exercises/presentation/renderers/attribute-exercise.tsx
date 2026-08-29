import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Polygon, Rect } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  AlifaAudioButton,
  AlifaCard,
  AlifaExerciseLayout,
  AlifaText,
} from '@/design-system/primitives';
import { colors, radius, shadows, spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type AttributeStep = Extract<ExerciseStep, { type: 'attribute_choice' }>;

/** The six colours named by the programme (p. 58), and nothing else. */
const OFFICIAL_COLORS: Record<AttributeStep['choices'][number]['color'], string> = {
  rouge: '#c0392b',
  bleu: colors.secondary,
  jaune: colors.tertiaryContainer,
  vert: colors.feedbackCorrect,
  blanc: '#ffffff',
  noir: colors.onSurface,
};

const CELL = 92;

/** Draws one of the four official shapes: rond, carré, rectangulaire, triangulaire. */
function AttributeShape({
  shape,
  color,
  scale,
}: {
  shape: AttributeStep['choices'][number]['shape'];
  color: string;
  scale: number;
}) {
  const stroke = color === '#ffffff' ? colors.outline : 'none';
  const size = CELL;
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

  const prompt = (
    <AlifaCard rounded="xl" style={styles.prompt}>
      <AlifaText variant="headlineMd" align="center">
        {step.instruction.text}
      </AlifaText>
      {step.audioId ? (
        <AlifaAudioButton
          variant="sky"
          size={56}
          playing={playingAudioId === step.audioId}
          onPress={() => step.audioId && playAudio(step.audioId)}
        />
      ) : null}
    </AlifaCard>
  );

  const answers = (
    <View style={styles.grid}>
      {step.choices.map((choice) => {
        const selected = picked === choice.id;
        return (
          <Pressable
            key={choice.id}
            disabled={!interactive}
            onPress={() => submit(choice.id)}
            accessibilityRole="button"
            accessibilityLabel={choice.label ?? `${choice.shape} ${choice.color}`}
            style={[
              styles.cell,
              selected && styles.cellSelected,
              !interactive && !selected && styles.cellDisabled,
            ]}
          >
            <View style={styles.shapeRow}>
              {Array.from({ length: Math.max(1, choice.count) }, (_, index) => (
                <AttributeShape
                  key={index}
                  shape={choice.shape}
                  color={OFFICIAL_COLORS[choice.color]}
                  // A repeated quantity is drawn smaller so the group still fits.
                  scale={choice.count > 1 ? choice.scale * 0.34 : choice.scale}
                />
              ))}
            </View>
            {choice.label ? (
              <AlifaText variant="labelMd" align="center" color={colors.textSecondary}>
                {choice.label}
              </AlifaText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );

  return <AlifaExerciseLayout prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  prompt: { alignItems: 'center', gap: spacing.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  cell: {
    minWidth: 148,
    minHeight: 148,
    flexGrow: 1,
    flexBasis: '42%',
    maxWidth: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: 'transparent',
    ...shadows.card,
  },
  cellSelected: { borderColor: colors.primaryContainer },
  cellDisabled: { opacity: 0.5 },
  shapeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 150,
  },
});
