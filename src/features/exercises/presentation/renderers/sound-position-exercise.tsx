import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaAudioButton,
  EcolnaCard,
  EcolnaExerciseLayout,
  EcolnaText,
  useExerciseMetrics,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';

type SoundPositionStep = Extract<ExerciseStep, { type: 'sound_position' }>;

const POSITIONS = ['debut', 'milieu', 'fin'] as const;

/** Trois cases ; celle de la position est pleine. Se lit avant de savoir lire. */
function PositionBars({ lit, width, color }: { lit: number | null; width: number; color: string }) {
  return (
    <View style={[styles.bars, { gap: Math.round(width * 0.18) }]}>
      {POSITIONS.map((position, index) => (
        <View
          key={position}
          style={[
            styles.bar,
            {
              width,
              height: Math.round(width * 0.32),
              backgroundColor: index === lit ? color : colors.surfaceContainerHighest,
            },
          ]}
        />
      ))}
    </View>
  );
}

/**
 * Locating a sound inside a word — the backbone of « connaître les éléments
 * composant un mot (sons, syllabes) » (p. 18) and « maîtriser la
 * combinatoire » (p. 23). The word is shown over three slots, and every
 * answer draws its own slot lit: the position is visible, not only audible
 * nor only written.
 */
export function SoundPositionExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<SoundPositionStep>) {
  const [picked, setPicked] = useState<string | null>(null);
  const { scale, isTablet } = useResponsive();
  const metrics = useExerciseMetrics();

  useEffect(() => {
    playAudio(step.audioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const prompt = (
    <EcolnaCard rounded="xl" style={[styles.wordCard, { gap: metrics.gap }]}>
      <View style={styles.soundBadge}>
        <EcolnaText variant="displayGlyphSmall" color={colors.onPrimaryContainer}>
          {step.sound}
        </EcolnaText>
      </View>
      <EcolnaText variant="displayGlyph" align="center" color={colors.primary}>
        {step.word}
      </EcolnaText>
      <PositionBars lit={null} width={scaled(isTablet ? 56 : 46, scale)} color={colors.primary} />
      <EcolnaAudioButton
        size={scaled(isTablet ? 72 : 60, scale)}
        playing={playingAudioId === step.audioId}
        onPress={() => playAudio(step.audioId)}
      />
    </EcolnaCard>
  );

  const answers = (
    <View style={[styles.options, { gap: metrics.gap }, !isTablet && styles.optionsRow]}>
      {POSITIONS.map((position, index) => {
        const state =
          !interactive && picked !== position
            ? 'disabled'
            : picked === position
              ? 'selected'
              : 'default';
        return (
          <EcolnaAnswerCard
            key={position}
            accessibilityLabel={fr.lesson.soundPositions[position]}
            state={state}
            onPress={() => {
              setPicked(position);
              onSubmit({ kind: 'value', value: position });
            }}
            style={!isTablet ? styles.optionCard : undefined}
            contentStyle={[
              styles.optionFace,
              { minHeight: metrics.answerHeight, gap: scaled(spacing.xs, scale) },
            ]}
          >
            <PositionBars
              lit={index}
              width={scaled(isTablet ? 40 : 26, scale)}
              color={state === 'disabled' ? colors.locked : colors.secondary}
            />
            <EcolnaText
              variant="headlineSm"
              align="center"
              color={state === 'disabled' ? colors.textSecondary : colors.textPrimary}
            >
              {fr.lesson.soundPositions[position]}
            </EcolnaText>
          </EcolnaAnswerCard>
        );
      })}
    </View>
  );

  return <EcolnaExerciseLayout prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  wordCard: { alignItems: 'center', paddingVertical: spacing.xl },
  soundBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryFixed,
  },
  bars: { flexDirection: 'row' },
  bar: { borderRadius: radius.pill },
  options: {},
  optionsRow: { flexDirection: 'row' },
  optionCard: { flex: 1 },
  optionFace: { alignItems: 'center', justifyContent: 'center' },
});
