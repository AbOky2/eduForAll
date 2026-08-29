import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AlifaAnswerCard, AlifaAudioButton, AlifaExerciseLayout } from '@/design-system/primitives';
import { useResponsive } from '@/design-system/responsive';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type ImageStep = Extract<ExerciseStep, { type: 'image_multiple_choice' }>;

/** Pick the image matching the heard word. */
export function ImageChoiceExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<ImageStep>) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const { isTablet } = useResponsive();

  useEffect(() => {
    if (step.audioId) {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const prompt = step.audioId ? (
    <View style={styles.audioWrap}>
      <AlifaAudioButton
        size={isTablet ? 108 : 84}
        playing={playingAudioId === step.audioId}
        onPress={() => step.audioId && playAudio(step.audioId)}
      />
    </View>
  ) : null;

  const answers = (
    <View style={styles.grid}>
      {step.choices.map((choice) => (
        <AlifaAnswerCard
          key={choice.id}
          accessibilityLabel={choice.label ?? choice.id}
          state={
            !interactive && pressedId !== choice.id
              ? 'disabled'
              : pressedId === choice.id
                ? 'selected'
                : 'default'
          }
          onPress={() => {
            setPressedId(choice.id);
            onSubmit({ kind: 'choice', choiceId: choice.id });
          }}
          style={styles.imageCard}
        >
          <ObjectIcon id={choice.illustrationId} size={isTablet ? 96 : 72} />
        </AlifaAnswerCard>
      ))}
    </View>
  );

  return <AlifaExerciseLayout prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  audioWrap: { alignItems: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  imageCard: { width: '46%', flexGrow: 1, paddingVertical: spacing.lg },
});
