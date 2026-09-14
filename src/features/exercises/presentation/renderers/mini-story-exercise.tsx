import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaAudioButton,
  EcolnaCard,
  EcolnaText,
} from '@/design-system/primitives';
import { spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type StoryStep = Extract<ExerciseStep, { type: 'mini_story_question' }>;

/** Short story + comprehension question (CP2 world 4). */
export function MiniStoryExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<StoryStep>) {
  const [pressedId, setPressedId] = useState<string | null>(null);

  useEffect(() => {
    playAudio(step.storyAudioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <EcolnaCard rounded="xl" style={styles.storyCard} backgroundColor="#faf7ec">
        <View style={styles.storyHeader}>
          <EcolnaAudioButton
            variant="sky"
            size={48}
            playing={playingAudioId === step.storyAudioId}
            onPress={() => playAudio(step.storyAudioId)}
          />
        </View>
        <EcolnaText variant="bodyLg">{step.story}</EcolnaText>
      </EcolnaCard>

      <EcolnaText variant="headlineSm" align="center">
        {step.question}
      </EcolnaText>

      <View style={styles.choices}>
        {step.choices.map((choice) => (
          <EcolnaAnswerCard
            key={choice.id}
            label={choice.label}
            glyph={false}
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
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, paddingBottom: spacing.xl },
  storyCard: { gap: spacing.md },
  storyHeader: { alignItems: 'flex-start' },
  choices: { gap: spacing.md },
});

