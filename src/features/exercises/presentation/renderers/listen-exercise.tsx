import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAudioButton,
  EcolnaButton,
  EcolnaCard,
  EcolnaText,
  useExerciseMetrics,
} from '@/design-system/primitives';
import { scaled, useResponsive } from '@/design-system/responsive';
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';

type ListenStep = Extract<ExerciseStep, { type: 'listen' }>;

/**
 * Passive presentation of a sound (mockup S10): the glyph, huge, on its
 * stage; the listen pebble sitting on the stage's edge; then « Suivant ».
 */
export function ListenExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<ListenStep>) {
  const { isTablet, scale } = useResponsive();
  const metrics = useExerciseMetrics();

  useEffect(() => {
    // Auto-play once when the step appears so non-readers hear it immediately.
    playAudio(step.audioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const glyphSize = scaled(isTablet ? 150 : 110, scale);
  return (
    <View style={[styles.container, { gap: metrics.gap }]}>
      <EcolnaCard
        rounded="xl"
        style={[styles.glyphCard, { minHeight: scaled(isTablet ? 300 : 240, scale) }]}
      >
        <EcolnaText
          variant="displayGlyph"
          align="center"
          style={{ fontSize: glyphSize, lineHeight: Math.round(glyphSize * 1.2) }}
        >
          {step.glyph}
        </EcolnaText>
      </EcolnaCard>
      <View style={[styles.audioWrap, { marginTop: -metrics.listenSize * 0.5 - metrics.gap }]}>
        <EcolnaAudioButton
          size={metrics.listenSize * 0.8}
          playing={playingAudioId === step.audioId}
          onPress={() => playAudio(step.audioId)}
        />
      </View>
      <EcolnaButton
        label={fr.common.next}
        disabled={!interactive}
        onPress={() => onSubmit({ kind: 'acknowledge' })}
        style={styles.next}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  glyphCard: { alignItems: 'center', justifyContent: 'center' },
  // Le galet d'écoute mord sur la carte : il doit passer devant son élévation.
  audioWrap: { alignItems: 'center', zIndex: 4, elevation: 4 },
  next: { alignSelf: 'center', minWidth: 240 },
});
