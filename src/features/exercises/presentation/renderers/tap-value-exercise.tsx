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
import { fr } from '@/localization/fr/strings';

import type { ExerciseRendererProps } from '../exercise-props';
import { cardSound, type CardSoundKind } from './card-sound';

type TapStep = Extract<
  ExerciseStep,
  { type: 'tap_letter' } | { type: 'tap_syllable' } | { type: 'fill_missing_letter' }
>;

/**
 * Tuiles par rangée : une seule rangée à côté du pavé d'écoute d'une tablette
 * couchée (jusqu'à quatre) ; ailleurs, quatre deux par deux, sinon trois au
 * plus par rangée.
 */
export function tapColumns(count: number, beside: boolean): number {
  if (beside && count <= 4) {
    return Math.max(1, count);
  }
  return count === 4 ? 2 : Math.max(1, Math.min(3, count));
}

/** Ce qu'une tuile retouchée redit : sa syllabe, ou sa lettre. */
function tileSounds(type: TapStep['type']): readonly CardSoundKind[] {
  return type === 'tap_syllable' ? ['syllabe', 'son', 'lettre'] : ['lettre', 'son'];
}

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
  const cardState = useAnswerCardState(interactive);
  const echo = useAnswerEcho(interactive);
  const { scale } = useResponsive();
  const audioId = step.audioId ?? null;
  // Le mot à compléter se regarde : seul le cas sans mot est une écoute seule.
  const listenOnly = audioId !== null && step.type !== 'fill_missing_letter';
  const beside = listenOnly && metrics.listenLayout === 'pane';
  const columns = tapColumns(step.options.length, beside);
  const rows: string[][] = [];
  for (let start = 0; start < step.options.length; start += columns) {
    rows.push(step.options.slice(start, start + columns));
  }
  const min = scaled(a11y.childTouchTarget + 8, scale);
  // Une écoute seule : des tuiles presque carrées, à la hauteur du pavé quand
  // elles sont à côté de lui — jamais des bandeaux sous la bande.
  const answerHeight = listenOnly
    ? listenAnswerHeight(metrics, {
        columns,
        rows: rows.length,
        preferred: metrics.answerHeight,
        min,
      })
    : fitAnswerHeight({
        preferred: metrics.answerHeight,
        room: answersRoom(metrics, false),
        rows: rows.length,
        gap: metrics.gap,
        min,
      });

  useEffect(() => {
    if (audioId) {
      playAudio(audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const answers = (
    <View style={{ gap: metrics.gap }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap: metrics.gap }]}>
          {row.map((option) => (
            <EcolnaAnswerCard
              key={option}
              label={option}
              glyphVariant={metrics.answerGlyph}
              state={cardState(pressed === option)}
              onPress={() => {
                setPressed(option);
                onSubmit({ kind: 'value', value: option });
              }}
              // Retouchée pendant la reprise : elle redit sa syllabe, sans répondre.
              onEcho={echo(pressed === option, () => {
                const sound = cardSound(tileSounds(step.type), option);
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

  if (listenOnly && audioId) {
    return (
      <EcolnaExerciseLayout
        metrics={metrics}
        answers={answers}
        listen={{ playing: playingAudioId === audioId, onPress: () => playAudio(audioId) }}
      />
    );
  }

  const prompt =
    step.type === 'fill_missing_letter' ? (
      <EcolnaStimulus
        style={[styles.stage, { minHeight: metrics.listenSize * 1.8, gap: metrics.gap }]}
      >
        <EcolnaText variant="displayGlyph" align="center" accessibilityLabel={fr.lesson.maskedWord}>
          {step.maskedWord.replace('_', ' _ ')}
        </EcolnaText>
        {audioId ? (
          <EcolnaAudioButton
            size={metrics.listenSize * 0.6}
            variant="sky"
            playing={playingAudioId === audioId}
            onPress={() => playAudio(audioId)}
          />
        ) : null}
      </EcolnaStimulus>
    ) : null;

  return <EcolnaExerciseLayout metrics={metrics} prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  cell: { flex: 1 },
});
