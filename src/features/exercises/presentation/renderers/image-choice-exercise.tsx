import { useEffect, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaExerciseLayout,
  useExerciseMetrics,
  useAnswerCardState,
} from '@/design-system/primitives';
import { useAnswerEcho } from '@/design-system/primitives/ecolna-answer-card';
import { PANE_CARD_RATIO, answersRoom } from '@/design-system/primitives/ecolna-exercise-layout';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { scaled, useResponsive } from '@/design-system/responsive';
import { a11y } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';
import { cardSound } from './card-sound';
import { fitIllustration } from './illustration-fit';

type ImageStep = Extract<ExerciseStep, { type: 'image_multiple_choice' }>;

/** Filet d'une carte au repos, de chaque côté (voir `EcolnaAnswerCard`). */
const CARD_BORDER = 2;

/**
 * La silhouette d'une carte-image, hauteur sur largeur : jamais un bandeau.
 * Une seule rangée sous la bande prend des cartes un peu plus hautes que
 * larges ; à côté du pavé d'écoute (tablette couchée), presque carrées — la
 * hauteur commune du pavé ; deux rangées, presque carrées aussi, la place
 * mesurée les resserrant au besoin.
 */
export function imageCardRatio(rows: number, beside = false): number {
  return rows > 1 ? 0.95 : beside ? PANE_CARD_RATIO : 1.2;
}

/**
 * Cartes par rangée. À côté du pavé d'écoute (tablette couchée), une seule
 * rangée (jusqu'à quatre). Au téléphone, trois images en deux plus une : sur
 * une rangée, elles n'y seraient que des vignettes. Ailleurs, deux ou trois
 * images sur une rangée, quatre deux par deux, cinq ou six par trois.
 */
export function imageColumns(
  count: number,
  { beside = false, compact = false }: { beside?: boolean; compact?: boolean } = {},
): number {
  if (beside && count <= 4) {
    return Math.max(1, count);
  }
  if (compact && count >= 3) {
    return 2;
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
  const echo = useAnswerEcho(interactive);
  const { scale, isTablet } = useResponsive();
  const audioId = step.audioId ?? null;

  useEffect(() => {
    if (step.audioId) {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  // Des rangées explicites, pas un retour à la ligne : des pourcentages plus
  // les gouttières finissaient par passer à la ligne.
  const beside = audioId !== null && metrics.listenLayout === 'pane';
  const columns = imageColumns(step.choices.length, { beside, compact: !isTablet });
  const rows: (typeof step.choices)[] = [];
  for (let start = 0; start < step.choices.length; start += columns) {
    rows.push(step.choices.slice(start, start + columns));
  }

  // À côté du pavé, la rangée a la hauteur commune du pavé (presque carrée).
  // Ailleurs, la place mesurée sous la bande borne les cartes : la feuille de
  // retour ne recouvre jamais une image.
  const cardHeight =
    beside && rows.length === 1 && metrics.paneHeight > 0
      ? metrics.paneHeight
      : imageCardHeight({
          cellWidth,
          rows: rows.length,
          beside,
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
    // Avant la mesure : plus de cases sur la rangée, une image plus petite.
    fallback: Math.round(metrics.objectSize * Math.min(1, 3 / columns)),
  });
  const measureCell = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    setCellWidth((current) => (current === width ? current : width));
  };

  const answers = (
    // Remontée à chaque changement de disposition : la case se remesure.
    <View key={`${metrics.listenLayout}-${columns}`} style={{ gap: metrics.gap }}>
      {rows.map((row, rowIndex) => (
        // Une rangée incomplète (téléphone : 2 + 1) se centre sous la
        // précédente, ses cases à la largeur mesurée des autres.
        <View
          key={rowIndex}
          style={[styles.row, { gap: metrics.gap }, row.length < columns && styles.centered]}
        >
          {row.map((choice, index) => (
            <View
              key={choice.id}
              style={row.length < columns && cellWidth > 0 ? { width: cellWidth } : styles.cell}
              onLayout={rowIndex === 0 && index === 0 ? measureCell : undefined}
            >
              <EcolnaAnswerCard
                accessibilityLabel={choice.label ?? choice.id}
                state={cardState(pressedId === choice.id)}
                onPress={() => {
                  setPressedId(choice.id);
                  onSubmit({ kind: 'choice', choiceId: choice.id });
                }}
                // Retouchée pendant la reprise : elle dit son mot (« maître »),
                // face au mot à trouver — sans répondre.
                onEcho={echo(pressedId === choice.id, () => {
                  const sound = cardSound('mot', choice.label ?? choice.id);
                  if (sound) {
                    playAudio(sound);
                  }
                })}
                contentStyle={{ minHeight: cardHeight, paddingHorizontal: 0, paddingVertical: 0 }}
              >
                <ObjectIcon id={choice.illustrationId} size={imageSize} />
              </EcolnaAnswerCard>
            </View>
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
  centered: { justifyContent: 'center' },
  cell: { flex: 1 },
});
