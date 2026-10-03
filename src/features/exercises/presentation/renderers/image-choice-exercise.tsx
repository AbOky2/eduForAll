import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaAudioButton,
  EcolnaStimulus,
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
    <EcolnaStimulus style={[styles.stage, { minHeight: metrics.listenSize * 1.8 }]}>
      <EcolnaAudioButton
        size={metrics.listenSize}
        playing={playingAudioId === step.audioId}
        onPress={() => step.audioId && playAudio(step.audioId)}
      />
    </EcolnaStimulus>
  ) : null;

  // Deux ou trois images : une rangée ; quatre : deux par deux ; cinq ou six :
  // rangées de trois. Des rangées explicites, pas un retour à la ligne : des
  // pourcentages plus les gouttières finissaient par passer à la ligne.
  const columns = step.choices.length === 4 ? 2 : Math.min(3, step.choices.length);
  const rows: (typeof step.choices)[] = [];
  for (let start = 0; start < step.choices.length; start += columns) {
    rows.push(step.choices.slice(start, start + columns));
  }

  const answers = (
    <View style={{ gap: metrics.gap }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap: metrics.gap }]}>
          {row.map((choice) => (
            <EcolnaAnswerCard
              key={choice.id}
              accessibilityLabel={choice.label ?? choice.id}
              state={interactive ? 'default' : pressedId === choice.id ? 'selected' : 'disabled'}
              onPress={() => {
                setPressedId(choice.id);
                onSubmit({ kind: 'choice', choiceId: choice.id });
              }}
              style={styles.cell}
              contentStyle={{ minHeight: metrics.objectSize * 2 }}
            >
              <ObjectIcon id={choice.illustrationId} size={Math.round(metrics.objectSize * 1.6)} />
            </EcolnaAnswerCard>
          ))}
          {/* Une rangée incomplète garde des cases de même largeur. */}
          {Array.from({ length: columns - row.length }, (_, index) => (
            <View key={`empty-${index}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );

  // L'image est la réponse : elle prend la place, l'écoute se fait plus étroite.
  return <EcolnaExerciseLayout prompt={prompt} answers={answers} promptWeight={0.45} />;
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  cell: { flex: 1 },
});
