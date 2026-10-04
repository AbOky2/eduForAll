import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaExerciseLayout,
  useExerciseMetrics,
  useAnswerCardState,
} from '@/design-system/primitives';
import { answersRoom } from '@/design-system/primitives/ecolna-exercise-layout';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { scaled, useResponsive } from '@/design-system/responsive';
import { a11y } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';
import { fitIllustration } from './illustration-fit';

type ImageStep = Extract<ExerciseStep, { type: 'image_multiple_choice' }>;

/** Filet d'une carte au repos, de chaque côté (voir `EcolnaAnswerCard`). */
const CARD_BORDER = 2;

/**
 * La silhouette d'une carte-image, hauteur sur largeur : une seule rangée
 * prend des cartes un peu plus hautes que larges ; deux rangées se couchent,
 * pour tenir sous la consigne sans défiler. À côté du volet d'écoute (7"
 * couchée, peu de hauteur), presque carrées : l'image, bornée par la largeur,
 * n'y perd rien et la feuille de retour reste loin.
 */
export function imageCardRatio(rows: number, beside = false): number {
  return rows > 1 ? 0.8 : beside ? 1.05 : 1.15;
}

/**
 * Cartes par rangée. Sous la bande d'écoute d'une tablette couchée, une seule
 * rangée (jusqu'à quatre) : elle prend toute la colonne. Ailleurs, deux ou
 * trois images sur une rangée, quatre deux par deux, cinq ou six par trois.
 */
export function imageColumns(count: number, wide: boolean): number {
  if (wide && count <= 4) {
    return Math.max(1, count);
  }
  return count === 4 ? 2 : Math.max(1, Math.min(3, count));
}

/**
 * La hauteur d'une carte-image : sa silhouette (largeur mesurée × ratio),
 * bornée par la place mesurée pour la rangée, jamais sous la cible tactile.
 */
export function imageCardHeight({
  cellWidth,
  rows,
  beside = false,
  gap,
  room,
  fallback,
  min,
}: {
  cellWidth: number;
  rows: number;
  /** À côté du volet d'écoute (voir `imageCardRatio`). */
  beside?: boolean;
  gap: number;
  /** Hauteur offerte à toutes les rangées (0 : pas de borne). */
  room: number;
  fallback: number;
  min: number;
}): number {
  const natural = cellWidth > 0 ? Math.round(cellWidth * imageCardRatio(rows, beside)) : fallback;
  const cap = room > 0 ? Math.floor((room - gap * (rows - 1)) / rows) : Infinity;
  return Math.max(min, Math.min(natural, cap));
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
  const cardState = useAnswerCardState(interactive);
  const { scale } = useResponsive();
  const audioId = step.audioId ?? null;

  useEffect(() => {
    if (step.audioId) {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  // Des rangées explicites, pas un retour à la ligne : des pourcentages plus
  // les gouttières finissaient par passer à la ligne.
  const wide = audioId !== null && metrics.listenLayout === 'band' && metrics.wide;
  const columns = imageColumns(step.choices.length, wide);
  const rows: (typeof step.choices)[] = [];
  for (let start = 0; start < step.choices.length; start += columns) {
    rows.push(step.choices.slice(start, start + columns));
  }

  // La place mesurée sous la bande d'écoute borne la hauteur des cartes : le
  // bloc remplit ≈ 60 % du corps sur grande tablette, et la feuille de retour
  // ne recouvre jamais une image.
  const cardHeight = imageCardHeight({
    cellWidth,
    rows: rows.length,
    beside: audioId !== null && metrics.listenLayout === 'pane',
    gap: metrics.gap,
    room: answersRoom(metrics, audioId !== null),
    fallback: Math.round(metrics.objectSize * 1.6),
    min: scaled(a11y.childTouchTarget + 8, scale),
  });
  // L'air autour de l'image vient de la borne (76 % de l'intérieur), pas d'un
  // rembourrage : au téléphone, il ne resterait qu'une vignette.
  const imageSize = fitIllustration({
    preferred: Math.round(metrics.objectSize * 1.6),
    innerWidth: cellWidth > 0 ? cellWidth - 2 * CARD_BORDER : 0,
    innerHeight: cellWidth > 0 ? cardHeight - 2 * CARD_BORDER : 0,
    fallback: metrics.objectSize,
  });
  const measureCell = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    setCellWidth((current) => (current === width ? current : width));
  };

  const answers = (
    // Remontée à chaque changement de disposition : la case se remesure.
    <View key={`${metrics.listenLayout}-${columns}`} style={{ gap: metrics.gap }}>
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
                state={cardState(pressedId === choice.id)}
                onPress={() => {
                  setPressedId(choice.id);
                  onSubmit({ kind: 'choice', choiceId: choice.id });
                }}
                contentStyle={{ minHeight: cardHeight, paddingHorizontal: 0, paddingVertical: 0 }}
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

  return (
    <EcolnaExerciseLayout
      metrics={metrics}
      answers={answers}
      listen={
        audioId
          ? { playing: playingAudioId === audioId, onPress: () => playAudio(audioId) }
          : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  cell: { flex: 1 },
});
