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
import { answersRoom, fitAnswerHeight } from '@/design-system/primitives/ecolna-exercise-layout';
import { scaled, useResponsive } from '@/design-system/responsive';
import { a11y } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type ChoiceStep = Extract<
  ExerciseStep,
  { type: 'audio_multiple_choice' } | { type: 'text_multiple_choice' }
>;

/**
 * Cartes par rangée. Sous la bande d'écoute d'une tablette couchée, une seule
 * rangée (jusqu'à quatre, même des phrases : elles passent à la ligne dans
 * leur carte). Une grille met deux ou trois cartes par rangée (quatre : deux
 * par deux) ; une liste, une par rangée.
 */
export function choiceColumns(
  count: number,
  { wide, grid }: { wide: boolean; grid: boolean },
): number {
  if (wide && count <= 4) {
    return Math.max(1, count);
  }
  if (!grid) {
    return 1;
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
  const isAudio = step.type === 'audio_multiple_choice';
  // On a tablet the answers get two columns even in list layout — a single
  // column of four cards leaves half the screen empty and the cards small.
  const grid =
    (isAudio && step.layout === 'grid') || (isTablet && !splitPanes && step.choices.length >= 4);
  const wide = isAudio && metrics.listenLayout === 'band' && metrics.wide;
  const columns = choiceColumns(step.choices.length, { wide, grid });
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

  // Sur une rangée unique, les cartes prennent la place mesurée sous la bande ;
  // ailleurs, elles se resserrent plutôt que de passer sous la feuille de retour.
  const answerHeight = fitAnswerHeight({
    preferred: metrics.answerHeight,
    room: answersRoom(metrics, isAudio),
    rows: rows.length,
    gap: metrics.gap,
    grow: wide,
    min: scaled(a11y.childTouchTarget + 8, scale),
  });

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
