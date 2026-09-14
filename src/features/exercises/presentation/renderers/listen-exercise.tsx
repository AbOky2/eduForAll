import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { EcolnaAudioButton, EcolnaButton, EcolnaCard, EcolnaText } from '@/design-system/primitives';
import { EcolnaIcon } from '@/design-system/icons/ecolna-icon';
import { colors, spacing } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';

type ListenStep = Extract<ExerciseStep, { type: 'listen' }>;

/** Passive presentation of a sound (mockup S10): huge glyph, replayable audio. */
export function ListenExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<ListenStep>) {
  useEffect(() => {
    // Auto-play once when the step appears so non-readers hear it immediately.
    playAudio(step.audioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  return (
    <View style={styles.container}>
      <EcolnaCard rounded="xl" style={styles.glyphCard} backgroundColor="#faf7ec">
        <View style={styles.watermark}>
          <EcolnaIcon name="leaf" size={180} color={colors.exerciseBackground} />
        </View>
        <EcolnaText variant="displayGlyph" align="center">
          {step.glyph}
        </EcolnaText>
      </EcolnaCard>
      <View style={styles.audioWrap}>
        <EcolnaAudioButton
          variant="bordered"
          size={64}
          playing={playingAudioId === step.audioId}
          onPress={() => playAudio(step.audioId)}
        />
      </View>
      <EcolnaButton
        label={fr.common.next}
        variant="ghost"
        disabled={!interactive}
        onPress={() => onSubmit({ kind: 'acknowledge' })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.md, justifyContent: 'center' },
  glyphCard: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermark: { position: 'absolute', opacity: 0.5 },
  audioWrap: { alignItems: 'center', marginTop: -spacing.xxl },
});
