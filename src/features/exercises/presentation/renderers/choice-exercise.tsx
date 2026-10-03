import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaAudioButton,
  EcolnaStimulus,
  EcolnaExerciseLayout,
  EcolnaText,
  useExerciseMetrics,
} from '@/design-system/primitives';
import { useResponsive } from '@/design-system/responsive';

import type { ExerciseRendererProps } from '../exercise-props';

type ChoiceStep = Extract<
  ExerciseStep,
  { type: 'audio_multiple_choice' } | { type: 'text_multiple_choice' }
>;

/**
 * Audio and text multiple choice (mockups S11, S12). The stimulus sits on a
 * stage card — the big listen button, or the written question — and the
 * answers are pebbles sized for a child's finger.
 */
export function ChoiceExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<ChoiceStep>) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const { isTablet, splitPanes } = useResponsive();
  const metrics = useExerciseMetrics();
  const isAudio = step.type === 'audio_multiple_choice';
  // On a tablet the answers get two columns even in list layout — a single
  // column of four cards leaves half the screen empty and the cards small.
  const grid =
    (isAudio && step.layout === 'grid') || (isTablet && !splitPanes && step.choices.length >= 4);

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

  const prompt = (
    <EcolnaStimulus style={[styles.stage, { minHeight: metrics.listenSize * 1.8 }]}>
      {step.type === 'text_multiple_choice' ? (
        <EcolnaText variant={isTablet ? 'displayGlyphSmall' : 'headlineLg'} align="center">
          {step.question}
        </EcolnaText>
      ) : (
        <EcolnaAudioButton
          size={metrics.listenSize}
          playing={playingAudioId === step.audioId}
          onPress={() => playAudio(step.audioId)}
        />
      )}
    </EcolnaStimulus>
  );

  const answers = (
    <View style={[grid ? styles.grid : styles.list, { gap: metrics.gap }]}>
      {step.choices.map((choice) => (
        <EcolnaAnswerCard
          key={choice.id}
          label={choice.label}
          glyph={choice.label.length <= 6}
          glyphVariant={metrics.answerGlyph}
          state={
            !interactive && pressedId !== choice.id
              ? 'disabled'
              : pressedId === choice.id
                ? 'selected'
                : 'default'
          }
          onPress={() => submit(choice.id)}
          style={grid ? styles.gridItem : undefined}
          contentStyle={{ minHeight: metrics.answerHeight }}
        />
      ))}
    </View>
  );

  return <EcolnaExerciseLayout prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  list: {},
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  gridItem: { width: '46%', flexGrow: 1 },
});
