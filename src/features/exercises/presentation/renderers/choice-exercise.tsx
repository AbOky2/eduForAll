import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AlifaAnswerCard, AlifaAudioButton, AlifaText } from '@/design-system/primitives';
import { colors, spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type ChoiceStep = Extract<
  ExerciseStep,
  { type: 'audio_multiple_choice' } | { type: 'text_multiple_choice' }
>;

/**
 * Audio and text multiple choice (mockups S11, S12). Audio variant shows the
 * big sand speaker; grid layout is used for dictation-style 2×2 boards.
 */
export function ChoiceExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<ChoiceStep>) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const isAudio = step.type === 'audio_multiple_choice';
  const grid = isAudio && step.layout === 'grid';

  useEffect(() => {
    if (step.type === 'audio_multiple_choice') {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const submit = (choiceId: string) => {
    setPressedId(choiceId);
    onSubmit({ kind: 'choice', choiceId });
  };

  return (
    <View style={styles.container}>
      {step.type === 'text_multiple_choice' ? (
        <AlifaText variant="headlineMd" align="center">
          {step.question}
        </AlifaText>
      ) : (
        <View style={styles.audioWrap}>
          <AlifaAudioButton
            size={92}
            playing={playingAudioId === step.audioId}
            onPress={() => playAudio(step.audioId)}
          />
        </View>
      )}

      <View style={grid ? styles.grid : styles.list}>
        {step.choices.map((choice) => (
          <AlifaAnswerCard
            key={choice.id}
            label={choice.label}
            glyph={choice.label.length <= 6}
            state={
              !interactive && pressedId !== choice.id
                ? 'disabled'
                : pressedId === choice.id
                  ? 'selected'
                  : 'default'
            }
            onPress={() => submit(choice.id)}
            style={grid ? styles.gridItem : undefined}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.xl, justifyContent: 'center' },
  audioWrap: { alignItems: 'center' },
  list: { gap: spacing.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  gridItem: { width: '46%', flexGrow: 1 },
});

export { colors };
