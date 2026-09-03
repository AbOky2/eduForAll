import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AlifaAnswerCard, AlifaAudioButton, AlifaText } from '@/design-system/primitives';
import { spacing } from '@/design-system/tokens';

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
  const audioId = step.audioId ?? null;

  useEffect(() => {
    if (audioId) {
      playAudio(audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const options = step.type === 'fill_missing_letter' ? step.options : step.options;

  return (
    <View style={styles.container}>
      {step.type === 'fill_missing_letter' ? (
        <AlifaText variant="displayGlyph" align="center" accessibilityLabel={`Mot à compléter`}>
          {step.maskedWord.replace('_', ' _ ')}
        </AlifaText>
      ) : audioId ? (
        <View style={styles.audioWrap}>
          <AlifaAudioButton
            size={92}
            playing={playingAudioId === audioId}
            onPress={() => playAudio(audioId)}
          />
        </View>
      ) : null}

      <View style={styles.grid}>
        {options.map((option) => (
          <AlifaAnswerCard
            key={option}
            label={option}
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
            style={styles.tile}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.xl, justifyContent: 'center' },
  audioWrap: { alignItems: 'center' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  tile: { minWidth: 96, flexGrow: 1, maxWidth: '46%' },
});

