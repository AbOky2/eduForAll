import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaAudioButton,
  EcolnaCard,
  EcolnaExerciseLayout,
  useExerciseMetrics,
} from '@/design-system/primitives';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';

import type { ExerciseRendererProps } from '../exercise-props';

type ImageStep = Extract<ExerciseStep, { type: 'image_multiple_choice' }>;

/** Pick the image matching the heard word: listen on the stage, touch a picture. */
export function ImageChoiceExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<ImageStep>) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const metrics = useExerciseMetrics();

  useEffect(() => {
    if (step.audioId) {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const prompt = step.audioId ? (
    <EcolnaCard rounded="xl" style={[styles.stage, { minHeight: metrics.listenSize * 1.8 }]}>
      <EcolnaAudioButton
        size={metrics.listenSize}
        playing={playingAudioId === step.audioId}
        onPress={() => step.audioId && playAudio(step.audioId)}
      />
    </EcolnaCard>
  ) : null;

  const answers = (
    <View style={[styles.grid, { gap: metrics.gap }]}>
      {step.choices.map((choice) => (
        <EcolnaAnswerCard
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
          // Trois images : trois colonnes égales ; quatre : deux par deux.
          style={{ width: step.choices.length === 3 ? '30%' : '46%', flexGrow: 1 }}
          contentStyle={{ minHeight: metrics.objectSize * 1.5 }}
        >
          <ObjectIcon id={choice.illustrationId} size={Math.round(metrics.objectSize * 1.15)} />
        </EcolnaAnswerCard>
      ))}
    </View>
  );

  return <EcolnaExerciseLayout prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
});
