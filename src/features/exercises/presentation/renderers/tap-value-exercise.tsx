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
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';

type TapStep = Extract<
  ExerciseStep,
  { type: 'tap_letter' } | { type: 'tap_syllable' } | { type: 'fill_missing_letter' }
>;

/** Tap the right letter/syllable, or complete a masked word. */
export function TapValueExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<TapStep>) {
  const [pressed, setPressed] = useState<string | null>(null);
  const metrics = useExerciseMetrics();
  const audioId = step.audioId ?? null;

  useEffect(() => {
    if (audioId) {
      playAudio(audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const prompt =
    step.type === 'fill_missing_letter' || audioId ? (
      <EcolnaStimulus
        style={[styles.stage, { minHeight: metrics.listenSize * 1.8, gap: metrics.gap }]}
      >
        {step.type === 'fill_missing_letter' ? (
          <EcolnaText
            variant="displayGlyph"
            align="center"
            accessibilityLabel={fr.lesson.maskedWord}
          >
            {step.maskedWord.replace('_', ' _ ')}
          </EcolnaText>
        ) : null}
        {audioId ? (
          <EcolnaAudioButton
            size={
              step.type === 'fill_missing_letter' ? metrics.listenSize * 0.6 : metrics.listenSize
            }
            variant={step.type === 'fill_missing_letter' ? 'sky' : 'sand'}
            playing={playingAudioId === audioId}
            onPress={() => playAudio(audioId)}
          />
        ) : null}
      </EcolnaStimulus>
    ) : null;

  const answers = (
    <View style={[styles.grid, { gap: metrics.gap }]}>
      {step.options.map((option) => (
        <EcolnaAnswerCard
          key={option}
          label={option}
          glyphVariant={metrics.answerGlyph}
          state={
            !interactive && pressed !== option
              ? 'disabled'
              : pressed === option
                ? 'selected'
                : 'default'
          }
          onPress={() => {
            setPressed(option);
            onSubmit({ kind: 'value', value: option });
          }}
          style={[styles.tile, { minWidth: metrics.tileWidth }]}
          contentStyle={{ minHeight: metrics.answerHeight }}
        />
      ))}
    </View>
  );

  return <EcolnaExerciseLayout prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  tile: { flexGrow: 1, maxWidth: '46%' },
});
