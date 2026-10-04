import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaStimulus,
  EcolnaExerciseLayout,
  useExerciseMetrics,
  useAnswerCardState,
} from '@/design-system/primitives';
import { useAnswerEcho } from '@/design-system/primitives/ecolna-answer-card';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { EmptyQuantityScene } from '@/design-system/illustrations/school-art';
import { scaled, useResponsive } from '@/design-system/responsive';
import { spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';
import { NUMBER_SOUNDS, cardSound } from './card-sound';
import { ILLUSTRATION_FILL, packObjects } from './illustration-fit';

type CountStep = Extract<ExerciseStep, { type: 'count_objects' }>;

/** Une carte-nombre a la silhouette d'une carte à jouer : un peu plus haute que large. */
export const NUMBER_CARD_RATIO = 1.2;
/** Côte à côte, la scène dépasse les cartes d'un peu, sans les écraser. */
const SCENE_OVER_CARDS = 1.3;
/**
 * Sur tablette couchée, le bloc vise la hauteur mesurée (`block`) : la
 * scène grandit jusqu'à ce rapport de la hauteur des nombres ; quand elle n'a
 * que peu d'objets, elle leur cède un peu de largeur (au-delà, il lui faut
 * toute la sienne pour ranger ses objets sans s'allonger).
 */
const ROOMY_PROMPT_WEIGHT = 0.7;
const ROOMY_SCENE_OVER_CARDS = 1.5;

/** La hauteur de la scène côte à côte : au-dessus des cartes, bornée par le bloc visé. */
export function sideSceneHeight(cardHeight: number, block: number): number {
  return block > 0
    ? Math.max(
        Math.round(cardHeight * SCENE_OVER_CARDS),
        Math.min(block, Math.round(cardHeight * ROOMY_SCENE_OVER_CARDS)),
      )
    : Math.round(cardHeight * SCENE_OVER_CARDS);
}

/** Peu d'objets : plus grands, pour qu'un seul ne se perde pas dans la scène. */
function boostOf(count: number): number {
  return count <= 2 ? 2.6 : count <= 4 ? 1.5 : 1;
}

/**
 * Count the goats/mangoes… (mockup S14): the objects stand in a meadow, the
 * numbers are cards. Zero is not an empty frame — it is an empty pen with
 * its empty bowl, so the child reads « there is nothing in it », not « the
 * picture did not load » (brief v2 § 10).
 *
 * Côte à côte, les cartes-nombres gardent leurs proportions et se centrent
 * sur l'axe de la scène : pour des glyphes courts, on aligne les axes, pas
 * les bords — étirées à la hauteur de la scène, elles devenaient des lattes.
 */
export function CountObjectsExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
}: ExerciseRendererProps<CountStep>) {
  const [pressed, setPressed] = useState<number | null>(null);
  // Largeurs mesurées : la rangée des nombres et l'intérieur de la scène.
  const [rowWidth, setRowWidth] = useState(0);
  const [sceneWidth, setSceneWidth] = useState(0);
  const { isTablet, scale, splitPanes } = useResponsive();
  const metrics = useExerciseMetrics();
  const cardState = useAnswerCardState(interactive);
  const echo = useAnswerEcho(interactive);

  const options = step.options.length;
  const cardWidth =
    rowWidth > 0
      ? Math.min(metrics.tileWidth, Math.floor((rowWidth - metrics.gap * (options - 1)) / options))
      : Math.round(metrics.tileWidth * 0.8);
  const cardHeight = Math.max(metrics.answerHeight, Math.round(cardWidth * NUMBER_CARD_RATIO));

  const scenePadding = scaled(spacing.lg, scale);
  // Le bloc visé n'existe que mesuré (il reste sous la feuille de retour).
  const roomy = splitPanes && metrics.block > 0;
  const boosted = step.count <= 4;
  const sceneMinHeight = splitPanes
    ? sideSceneHeight(cardHeight, roomy ? metrics.block : 0)
    : scaled(isTablet ? 260 : 190, scale);
  const objectGap = scaled(spacing.sm, scale);
  const baseSize = scaled(isTablet ? 76 : 56, scale);
  // Grossis, les objets restent dans 76 % de la scène — comme une image dans
  // sa carte ; côte à côte, ils tiennent aussi dans sa hauteur.
  const packing = packObjects({
    count: step.count,
    width: sceneWidth * (boosted ? ILLUSTRATION_FILL : 1),
    gap: objectGap,
    preferred: Math.round(baseSize * boostOf(step.count)),
    height: splitPanes && boosted ? sceneMinHeight - 2 * scenePadding : 0,
    shrink: step.count <= 2 ? 0 : 0.8,
  });
  const objectSize = sceneWidth > 0 ? packing.size : baseSize;
  const perRow = sceneWidth > 0 ? packing.perRow : Math.min(step.count, 4);
  const emptySize = Math.min(
    scaled(isTablet ? 200 : 150, scale),
    sceneMinHeight - 2 * scenePadding,
    sceneWidth > 0 ? Math.floor(sceneWidth * ILLUSTRATION_FILL) : Infinity,
  );

  const measure =
    (set: (width: number) => void) =>
    (event: LayoutChangeEvent): void =>
      set(Math.round(event.nativeEvent.layout.width));

  const rows: number[][] = [];
  for (let start = 0; start < step.count; start += perRow) {
    rows.push(
      Array.from({ length: Math.min(perRow, step.count - start) }, (_, index) => start + index),
    );
  }

  const prompt = (
    <EcolnaStimulus style={[styles.scene, { minHeight: sceneMinHeight }]}>
      {/* Toute la largeur intérieure, quelle que soit la taille des objets : la mesure ne boucle pas. */}
      <View style={styles.sceneInner} onLayout={measure(setSceneWidth)}>
        {step.count === 0 ? (
          <View accessibilityRole="image" accessibilityLabel={`0 ${step.objectName}`}>
            <EmptyQuantityScene size={emptySize} />
          </View>
        ) : (
          <View
            style={[styles.objects, { gap: objectGap }]}
            accessibilityRole="image"
            accessibilityLabel={`${step.count} ${step.objectName}`}
          >
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={[styles.objectRow, { gap: objectGap }]}>
                {row.map((index) => (
                  <ObjectIcon key={index} id={step.illustrationId} size={objectSize} />
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    </EcolnaStimulus>
  );

  const answers = (
    // Remontée à chaque bascule côte à côte / empilé : sinon React réutilise
    // la vue du volet, que le web ne mesure jamais plus (largeur figée).
    <View
      key={splitPanes ? 'side-by-side' : 'stacked'}
      style={[styles.options, { gap: metrics.gap }]}
      onLayout={measure(setRowWidth)}
    >
      {step.options.map((option) => (
        <EcolnaAnswerCard
          key={option}
          label={String(option)}
          glyphVariant={metrics.answerGlyph}
          state={cardState(pressed === option)}
          onPress={() => {
            setPressed(option);
            onSubmit({ kind: 'number', value: option });
          }}
          // Retouchée pendant la reprise : elle redit son nombre, sans répondre.
          onEcho={echo(pressed === option, () => {
            const sound = cardSound(NUMBER_SOUNDS, String(option));
            if (sound) {
              playAudio(sound);
            }
          })}
          style={{ width: cardWidth }}
          contentStyle={{ height: cardHeight, paddingHorizontal: scaled(spacing.xs, scale) }}
        />
      ))}
    </View>
  );

  return (
    <EcolnaExerciseLayout
      metrics={metrics}
      prompt={prompt}
      answers={answers}
      promptWeight={roomy && boosted ? ROOMY_PROMPT_WEIGHT : 1}
    />
  );
}

const styles = StyleSheet.create({
  scene: { justifyContent: 'center', alignItems: 'center' },
  sceneInner: { alignSelf: 'stretch', alignItems: 'center' },
  objects: { alignItems: 'center' },
  objectRow: { flexDirection: 'row', justifyContent: 'center' },
  options: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
