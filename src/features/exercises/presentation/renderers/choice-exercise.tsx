import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaStimulus,
  EcolnaExerciseLayout,
  EcolnaText,
  useExerciseMetrics,
  useAnswerCardState,
} from '@/design-system/primitives';
import { useAnswerEcho } from '@/design-system/primitives/ecolna-answer-card';
import {
  answersRoom,
  fitAnswerHeight,
  listenAnswerHeight,
} from '@/design-system/primitives/ecolna-exercise-layout';
import { scaled, useResponsive } from '@/design-system/responsive';
import { a11y } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';
import { cardSound, echoKinds } from './card-sound';

type ChoiceStep = Extract<
  ExerciseStep,
  { type: 'audio_multiple_choice' } | { type: 'text_multiple_choice' }
>;

/**
 * Cartes par rangée. Une liste (des phrases) en met une par rangée — à côté du
 * pavé d'écoute comme dessous : une phrase se lit d'un trait. Une grille (des
 * syllabes, des mots) : une seule rangée à côté du pavé d'une tablette couchée
 * (jusqu'à quatre) ; ailleurs, deux ou trois par rangée (quatre : deux par deux).
 */
export function choiceColumns(
  count: number,
  { beside, grid }: { beside: boolean; grid: boolean },
): number {
  if (!grid) {
    return 1;
  }
  if (beside && count <= 4) {
    return Math.max(1, count);
  }
  return count === 4 ? 2 : Math.max(1, Math.min(3, count));
}

/**
 * Audio and text multiple choice (mockups S11, S12). The stimulus is the big
 * listen pad, or the written question on its stage; the answers are cards
 * sized for a child's finger, in explicit rows that span the column.
 */
export function ChoiceExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<ChoiceStep>) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  const { isTablet, splitPanes, scale } = useResponsive();
  const metrics = useExerciseMetrics();
  const cardState = useAnswerCardState(interactive);
  const echo = useAnswerEcho(interactive);
  const isAudio = step.type === 'audio_multiple_choice';
  // On a tablet the answers get two columns even in list layout — a single
  // column of four cards leaves half the screen empty and the cards small.
  const grid =
    (isAudio && step.layout === 'grid') || (isTablet && !splitPanes && step.choices.length >= 4);
  const beside = isAudio && metrics.listenLayout === 'pane';
  const columns = choiceColumns(step.choices.length, { beside, grid });
  const rows: (typeof step.choices)[] = [];
  for (let start = 0; start < step.choices.length; start += columns) {
    rows.push(step.choices.slice(start, start + columns));
  }

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

  // Une écoute seule : une grille presque carrée (à la hauteur du pavé quand
  // elle est à côté de lui), une liste à sa hauteur de phrase. Partout, les
  // cartes se resserrent plutôt que de passer sous la feuille de retour.
  const min = scaled(a11y.childTouchTarget + 8, scale);
  const answerHeight = isAudio
    ? listenAnswerHeight(metrics, {
        columns,
        rows: rows.length,
        preferred: metrics.answerHeight,
        min,
        ...(grid ? {} : { ratio: 0 }),
      })
    : fitAnswerHeight({
        preferred: metrics.answerHeight,
        room: answersRoom(metrics, false),
        rows: rows.length,
        gap: metrics.gap,
        min,
      });
  const stimulusAudioId = isAudio ? step.audioId : null;

  const answers = (
    <View style={{ gap: metrics.gap }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap: metrics.gap }]}>
          {row.map((choice) => (
            <EcolnaAnswerCard
              key={choice.id}
              label={choice.label}
              // Ce qui se lit s'écrit en lettres d'école : une syllabe en grand,
              // une phrase en Andika plus petite sur tablette (au téléphone, la
              // police de l'interface, pour tenir sur la largeur).
              glyph={choice.label.length <= 6 || isTablet}
              glyphVariant={choice.label.length <= 6 ? metrics.answerGlyph : 'displayGlyphSmall'}
              state={cardState(pressedId === choice.id)}
              onPress={() => submit(choice.id)}
              // Retouchée pendant la reprise : elle se redit, sans répondre.
              onEcho={echo(pressedId === choice.id, () => {
                const sound = cardSound(echoKinds(stimulusAudioId), choice.label);
                if (sound) {
                  playAudio(sound);
                }
              })}
              style={styles.cell}
              contentStyle={{ minHeight: answerHeight }}
            />
          ))}
          {/* Une rangée incomplète garde des cases de même largeur. */}
          {Array.from({ length: columns - row.length }, (_, index) => (
            <View key={`empty-${index}`} style={styles.cell} />
          ))}
        </View>
      ))}
    </View>
  );

  if (step.type === 'audio_multiple_choice') {
    const { audioId } = step;
    return (
      <EcolnaExerciseLayout
        metrics={metrics}
        answers={answers}
        listen={{ playing: playingAudioId === audioId, onPress: () => playAudio(audioId) }}
      />
    );
  }

  const prompt = (
    <EcolnaStimulus style={[styles.stage, { minHeight: metrics.listenSize * 1.8 }]}>
      <EcolnaText variant={isTablet ? 'displayGlyphSmall' : 'headlineLg'} align="center">
        {step.question}
      </EcolnaText>
    </EcolnaStimulus>
  );
  return <EcolnaExerciseLayout metrics={metrics} prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  cell: { flex: 1 },
});
