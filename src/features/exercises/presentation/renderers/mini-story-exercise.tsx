import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaAudioButton,
  EcolnaStimulus,
  EcolnaExerciseLayout,
  EcolnaText,
  useExerciseMetrics,
  useAnswerCardState,
} from '@/design-system/primitives';
import { useAnswerEcho } from '@/design-system/primitives/ecolna-answer-card';
import { scaled, useResponsive } from '@/design-system/responsive';
import { spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';
import { cardSound, echoKinds } from './card-sound';

type StoryStep = Extract<ExerciseStep, { type: 'mini_story_question' }>;

/**
 * Short story + comprehension question (CP2 world 4). The story lies on its
 * own page with its listen button; the question and the answers sit beside
 * it on a landscape tablet, under it elsewhere.
 */
export function MiniStoryExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<StoryStep>) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const { scale, isTablet } = useResponsive();
  const metrics = useExerciseMetrics();
  const cardState = useAnswerCardState(interactive);
  const echo = useAnswerEcho(interactive);

  useEffect(() => {
    playAudio(step.storyAudioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const prompt = (
    <EcolnaStimulus style={[styles.storyCard, { gap: scaled(spacing.md, scale) }]}>
      <EcolnaAudioButton
        variant="sky"
        size={scaled(isTablet ? 60 : 52, scale)}
        playing={playingAudioId === step.storyAudioId}
        onPress={() => playAudio(step.storyAudioId)}
      />
      <ScrollView style={styles.storyScroll} showsVerticalScrollIndicator={false}>
        <EcolnaText variant={isTablet ? 'headlineSm' : 'bodyLg'}>{step.story}</EcolnaText>
      </ScrollView>
    </EcolnaStimulus>
  );

  const answers = (
    <View style={{ gap: metrics.gap }}>
      <EcolnaText variant={isTablet ? 'headlineMd' : 'headlineSm'} align="center">
        {step.question}
      </EcolnaText>
      {step.choices.map((choice) => (
        <EcolnaAnswerCard
          key={choice.id}
          label={choice.label}
          glyph={false}
          state={cardState(pressedId === choice.id)}
          onPress={() => {
            setPressedId(choice.id);
            onSubmit({ kind: 'choice', choiceId: choice.id });
          }}
          // Retouchée pendant la reprise : elle se redit, sans répondre.
          onEcho={echo(pressedId === choice.id, () => {
            const sound = cardSound(echoKinds(null), choice.label);
            if (sound) {
              playAudio(sound);
            }
          })}
          contentStyle={{ minHeight: scaled(64, scale) }}
        />
      ))}
    </View>
  );

  return <EcolnaExerciseLayout prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  storyCard: { alignItems: 'flex-start', maxHeight: 460 },
  storyScroll: { alignSelf: 'stretch' },
});
