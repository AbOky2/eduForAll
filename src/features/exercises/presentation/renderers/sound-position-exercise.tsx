import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  AlifaAnswerCard,
  AlifaAudioButton,
  AlifaCard,
  AlifaExerciseLayout,
  AlifaText,
} from '@/design-system/primitives';
import { colors, radius, spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type SoundPositionStep = Extract<ExerciseStep, { type: 'sound_position' }>;

const POSITIONS = [
  { value: 'debut', label: 'au début' },
  { value: 'milieu', label: 'au milieu' },
  { value: 'fin', label: 'à la fin' },
] as const;

/**
 * Locating a sound inside a word — the backbone of « connaître les éléments
 * composant un mot (sons, syllabes) » (p. 18) and « maîtriser la
 * combinatoire » (p. 23). The word is shown in three slots so the position
 * is visible, not only audible.
 */
export function SoundPositionExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<SoundPositionStep>) {
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    playAudio(step.audioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const prompt = (
    <>
      <AlifaCard rounded="xl" style={styles.prompt}>
        <AlifaText variant="headlineMd" align="center">
          {step.instruction.text}
        </AlifaText>
        <View style={styles.soundBadge}>
          <AlifaText variant="displayGlyphSmall" color={colors.onPrimaryContainer}>
            {step.sound}
          </AlifaText>
        </View>
      </AlifaCard>

      <AlifaCard rounded="xl" style={styles.wordCard}>
        <AlifaText variant="displayGlyph" align="center" color={colors.primary}>
          {step.word}
        </AlifaText>
        <View style={styles.slots}>
          {POSITIONS.map((position) => (
            <View key={position.value} style={styles.slot} />
          ))}
        </View>
        <AlifaAudioButton
          variant="sky"
          size={64}
          playing={playingAudioId === step.audioId}
          onPress={() => playAudio(step.audioId)}
        />
      </AlifaCard>
    </>
  );

  const answers = (
    <View style={styles.options}>
      {POSITIONS.map((position) => (
        <AlifaAnswerCard
          key={position.value}
          label={position.label}
          glyph={false}
          state={
            !interactive && picked !== position.value
              ? 'disabled'
              : picked === position.value
                ? 'selected'
                : 'default'
          }
          onPress={() => {
            setPicked(position.value);
            onSubmit({ kind: 'value', value: position.value });
          }}
          style={styles.optionCard}
        />
      ))}
    </View>
  );

  return <AlifaExerciseLayout prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  prompt: { alignItems: 'center', gap: spacing.sm },
  soundBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryFixed,
  },
  wordCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  slots: { flexDirection: 'row', gap: spacing.sm },
  slot: {
    width: 46,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.outlineVariant,
  },
  options: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' },
  optionCard: { flex: 1 },
});
