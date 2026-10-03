import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaAudioButton,
  EcolnaStimulus,
  EcolnaExerciseLayout,
  useExerciseMetrics,
} from '@/design-system/primitives';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { scaled, useResponsive } from '@/design-system/responsive';
import { spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';
import { fitIllustration } from './illustration-fit';

type ImageStep = Extract<ExerciseStep, { type: 'image_multiple_choice' }>;

/** Filet d'une carte au repos, de chaque côté (voir `EcolnaAnswerCard`). */
const CARD_BORDER = 2;

/**
 * La silhouette d'une carte-image, hauteur sur largeur : une seule rangée
 * prend des cartes un peu plus hautes que larges ; deux rangées se couchent,
 * pour tenir sous la consigne sans défiler.
 */
export function imageCardRatio(rows: number): number {
  return rows > 1 ? 0.8 : 1.15;
}

/** Pick the image matching the heard word: listen on the stage, touch a picture. */
export function ImageChoiceExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<ImageStep>) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  // Largeur d'une case (toutes égales) : l'image se borne à la carte réelle.
  const [cellWidth, setCellWidth] = useState(0);
  const metrics = useExerciseMetrics();
  const { scale, splitPanes } = useResponsive();

  useEffect(() => {
    if (step.audioId) {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  // Deux ou trois images : une rangée ; quatre : deux par deux ; cinq ou six :
  // rangées de trois. Des rangées explicites, pas un retour à la ligne : des
  // pourcentages plus les gouttières finissaient par passer à la ligne.
  const columns = step.choices.length === 4 ? 2 : Math.min(3, step.choices.length);
  const rows: (typeof step.choices)[] = [];
  for (let start = 0; start < step.choices.length; start += columns) {
    rows.push(step.choices.slice(start, start + columns));
  }

  // L'air autour de l'image vient de la borne (76 % de l'intérieur), pas d'un
  // rembourrage : au téléphone, il ne resterait qu'une vignette.
  const padX = 0;
  const padY = scaled(spacing.md, scale);
  const ratio = imageCardRatio(rows.length);
  const cardHeight =
    cellWidth > 0 ? Math.round(cellWidth * ratio) : Math.round(metrics.objectSize * 1.6);
  const imageSize = fitIllustration({
    preferred: Math.round(metrics.objectSize * 1.6),
    innerWidth: cellWidth > 0 ? cellWidth - 2 * (padX + CARD_BORDER) : 0,
    innerHeight: cellWidth > 0 ? cardHeight - 2 * (padY + CARD_BORDER) : 0,
    fallback: metrics.objectSize,
  });
  const measureCell = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    setCellWidth((current) => (current === width ? current : width));
  };

  const prompt = step.audioId ? (
    // Côte à côte, la scène prend la hauteur des cartes (bords communs) ;
    // empilée, elle garde sa propre hauteur.
    <EcolnaStimulus
      style={[styles.stage, !splitPanes && { minHeight: Math.round(metrics.listenSize * 1.8) }]}
    >
      <EcolnaAudioButton
        size={metrics.listenSize}
        playing={playingAudioId === step.audioId}
        onPress={() => step.audioId && playAudio(step.audioId)}
      />
    </EcolnaStimulus>
  ) : null;

  const answers = (
    // Remontée à chaque bascule côte à côte / empilé : la case se remesure.
    <View key={splitPanes ? 'side-by-side' : 'stacked'} style={{ gap: metrics.gap }}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={[styles.row, { gap: metrics.gap }]}>
          {row.map((choice, index) => (
            <View
              key={choice.id}
              style={styles.cell}
              onLayout={rowIndex === 0 && index === 0 ? measureCell : undefined}
            >
              <EcolnaAnswerCard
                accessibilityLabel={choice.label ?? choice.id}
                state={interactive ? 'default' : pressedId === choice.id ? 'selected' : 'disabled'}
                onPress={() => {
                  setPressedId(choice.id);
                  onSubmit({ kind: 'choice', choiceId: choice.id });
                }}
                contentStyle={{
                  minHeight: cardHeight,
                  paddingHorizontal: padX,
                  paddingVertical: padY,
                }}
              >
                <ObjectIcon id={choice.illustrationId} size={imageSize} />
              </EcolnaAnswerCard>
            </View>
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
