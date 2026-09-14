import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { EcolnaAudioButton, EcolnaButton, EcolnaCard, EcolnaText } from '@/design-system/primitives';
import { spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';

type RepeatStep = Extract<ExerciseStep, { type: 'listen_and_repeat' }>;

/**
 * Safe oral practice: listen, repeat aloud, self-confirm. No recording is
 * kept, no fake pronunciation score is shown (V1 policy — docs/privacy.md).
 */
export function ListenRepeatExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<RepeatStep>) {
  useEffect(() => {
    playAudio(step.audioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  return (
    <View style={styles.container}>
      <EcolnaText variant="headlineMd" align="center">
        {fr.lesson.listenAndRepeat}
      </EcolnaText>
      <EcolnaCard rounded="xl" style={styles.card} backgroundColor="#faf7ec">
        <EcolnaText variant={step.text.length > 12 ? 'headlineLg' : 'displayGlyph'} align="center">
          {step.text}
        </EcolnaText>
      </EcolnaCard>
      <View style={styles.audioWrap}>
        <EcolnaAudioButton
          size={84}
          playing={playingAudioId === step.audioId}
          onPress={() => playAudio(step.audioId)}
        />
      </View>
      <EcolnaButton
        label={fr.lesson.repeatDone}
        disabled={!interactive}
        onPress={() => onSubmit({ kind: 'acknowledge' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.xl, justifyContent: 'center' },
  card: { minHeight: 160, justifyContent: 'center' },
  audioWrap: { alignItems: 'center' },
});

