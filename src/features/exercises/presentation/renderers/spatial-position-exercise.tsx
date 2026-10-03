import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaAudioButton,
  EcolnaExerciseLayout,
  useExerciseMetrics,
} from '@/design-system/primitives';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { scaled, useResponsive } from '@/design-system/responsive';
import { colors, radius } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type SpatialStep = Extract<ExerciseStep, { type: 'spatial_position' }>;
type Relation = SpatialStep['choices'][number]['relation'];

/** Proportions d'une scène, en fractions de son côté (dessinée à toute taille). */
const OBJECT = 36 / 116;
const REFERENCE = 52 / 116;

/**
 * Where the object sits relative to the reference, per official preposition
 * (programme p. 58), as offsets inside a square stage of side `S`.
 */
function layoutFor(relation: Relation, S: number): { left: number; top: number; zAbove: boolean } {
  const o = S * OBJECT;
  const r = S * REFERENCE;
  const k = S / 116;
  const mid = S / 2 - o / 2;
  switch (relation) {
    case 'sur':
      return { left: mid, top: S / 2 - r / 2 - o + 6 * k, zAbove: true };
    case 'sous':
      return { left: mid, top: S / 2 + r / 2 - 6 * k, zAbove: true };
    case 'dans':
    case 'entre':
      return { left: mid, top: mid, zAbove: true };
    case 'devant':
      return { left: mid, top: S / 2 + 6 * k, zAbove: true };
    case 'derriere':
      return { left: mid, top: S / 2 - r / 2 - 4 * k, zAbove: false };
    case 'a-gauche':
      return { left: 8 * k, top: mid, zAbove: true };
    case 'a-droite':
      return { left: S - o - 8 * k, top: mid, zAbove: true };
    case 'au-dessus':
      return { left: mid, top: 6 * k, zAbove: true };
    case 'en-dessous':
      return { left: mid, top: S - o - 6 * k, zAbove: true };
    case 'a-cote':
      return { left: S / 2 + r / 2 + 2 * k, top: mid, zAbove: true };
  }
}

/** One candidate scene: the reference object with the small object placed on it. */
function Scene({
  relation,
  objectId,
  referenceId,
  size,
}: {
  relation: Relation;
  objectId: string;
  referenceId: string;
  size: number;
}) {
  const layout = layoutFor(relation, size);
  const o = Math.round(size * OBJECT);
  const r = Math.round(size * REFERENCE);
  const k = size / 116;
  const object = (
    <View style={[styles.placed, { left: layout.left, top: layout.top }]}>
      <ObjectIcon id={objectId} size={o} />
    </View>
  );
  return (
    <View style={[styles.stage, { width: size, height: size }]}>
      {/* « entre » needs a second reference so the object reads as in-between. */}
      {relation === 'entre' ? (
        <>
          <View style={[styles.placed, { left: 6 * k, top: size / 2 - r / 2 }]}>
            <ObjectIcon id={referenceId} size={r} />
          </View>
          <View style={[styles.placed, { left: size - r - 6 * k, top: size / 2 - r / 2 }]}>
            <ObjectIcon id={referenceId} size={r} />
          </View>
          {object}
        </>
      ) : (
        <>
          {!layout.zAbove ? object : null}
          <View style={[styles.placed, { left: size / 2 - r / 2, top: size / 2 - r / 2 }]}>
            <ObjectIcon id={referenceId} size={r} />
          </View>
          {layout.zAbove ? object : null}
        </>
      )}
    </View>
  );
}

/**
 * Spatial markers — « les repères : devant, derrière, à droite, à gauche,
 * au-dessus, à l'intérieur, à l'extérieur, sur, sous, entre… » (p. 58).
 * The child hears the instruction and picks the scene that matches it.
 */
export function SpatialPositionExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<SpatialStep>) {
  const [picked, setPicked] = useState<string | null>(null);
  const { scale, isTablet } = useResponsive();
  const metrics = useExerciseMetrics();
  const stage = scaled(isTablet ? 168 : 112, scale);

  useEffect(() => {
    if (step.audioId) {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  // La consigne est dite par l'en-tête de leçon ; ici, seulement la réécoute.
  const prompt = step.audioId ? (
    <View style={styles.prompt}>
      <EcolnaAudioButton
        size={metrics.listenSize}
        playing={playingAudioId === step.audioId}
        onPress={() => step.audioId && playAudio(step.audioId)}
      />
    </View>
  ) : null;

  const answers = (
    <View style={[styles.grid, { gap: metrics.gap }]}>
      {step.choices.map((choice) => {
        const selected = picked === choice.id;
        return (
          <EcolnaAnswerCard
            key={choice.id}
            onPress={() => {
              setPicked(choice.id);
              onSubmit({ kind: 'choice', choiceId: choice.id });
            }}
            accessibilityLabel={choice.relation.replace('-', ' ')}
            state={interactive ? 'default' : selected ? 'selected' : 'disabled'}
            contentStyle={styles.cellFace}
          >
            <Scene
              relation={choice.relation}
              objectId={step.objectIllustrationId}
              referenceId={step.referenceIllustrationId}
              size={stage}
            />
          </EcolnaAnswerCard>
        );
      })}
    </View>
  );

  return <EcolnaExerciseLayout prompt={prompt} answers={answers} promptWeight={0.6} />;
}

const styles = StyleSheet.create({
  prompt: { alignItems: 'center', justifyContent: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  cellFace: { padding: 10 },
  stage: { borderRadius: radius.md, backgroundColor: colors.surfaceContainerLow },
  placed: { position: 'absolute' },
});
