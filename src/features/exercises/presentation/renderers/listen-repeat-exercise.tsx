import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAudioButton,
  EcolnaButton,
  EcolnaStimulus,
  EcolnaText,
  useExerciseMetrics,
} from '@/design-system/primitives';
import { useResponsive } from '@/design-system/responsive';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';

type RepeatStep = Extract<ExerciseStep, { type: 'listen_and_repeat' }>;

/**
 * Safe oral practice: listen, repeat aloud, self-confirm. No recording is
 * kept, no fake pronunciation score is shown (V1 policy — docs/privacy.md).
 * The instruction is said once, by the lesson header — not here again.
 */
export function ListenRepeatExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<RepeatStep>) {
  const { isTablet } = useResponsive();
  const metrics = useExerciseMetrics();

  useEffect(() => {
    playAudio(step.audioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const long = step.text.length > 12;
  return (
    <View style={[styles.container, { gap: metrics.gap }]}>
      <EcolnaStimulus style={[styles.card, { gap: metrics.gap }]}>
        <EcolnaAudioButton
          size={metrics.listenSize}
          playing={playingAudioId === step.audioId}
          onPress={() => playAudio(step.audioId)}
        />
        <EcolnaText
          variant={long ? (isTablet ? 'displayGlyphSmall' : 'headlineLg') : 'displayGlyph'}
          align="center"
        >
          {step.text}
        </EcolnaText>
      </EcolnaStimulus>
      <EcolnaButton
        label={fr.lesson.repeatDone}
        disabled={!interactive}
        onPress={() => onSubmit({ kind: 'acknowledge' })}
        style={styles.done}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  card: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  done: { alignSelf: 'center', minWidth: 260 },
});
