import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  AlifaAudioButton,
  AlifaCard,
  AlifaExerciseLayout,
  AlifaText,
} from '@/design-system/primitives';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { colors, radius, shadows, spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type SpatialStep = Extract<ExerciseStep, { type: 'spatial_position' }>;
type Relation = SpatialStep['choices'][number]['relation'];

const STAGE = 116;
const OBJECT = 36;
const REFERENCE = 52;

/**
 * Where the object sits relative to the reference, per official preposition
 * (programme p. 58). Values are absolute offsets inside the STAGE box.
 */
const LAYOUT: Record<Relation, { object: { left: number; top: number }; zAbove: boolean }> = {
  sur: {
    object: { left: STAGE / 2 - OBJECT / 2, top: STAGE / 2 - REFERENCE / 2 - OBJECT + 6 },
    zAbove: true,
  },
  sous: {
    object: { left: STAGE / 2 - OBJECT / 2, top: STAGE / 2 + REFERENCE / 2 - 6 },
    zAbove: true,
  },
  dans: { object: { left: STAGE / 2 - OBJECT / 2, top: STAGE / 2 - OBJECT / 2 }, zAbove: true },
  devant: { object: { left: STAGE / 2 - OBJECT / 2, top: STAGE / 2 + 6 }, zAbove: true },
  derriere: {
    object: { left: STAGE / 2 - OBJECT / 2, top: STAGE / 2 - REFERENCE / 2 - 4 },
    zAbove: false,
  },
  'a-gauche': { object: { left: 8, top: STAGE / 2 - OBJECT / 2 }, zAbove: true },
  'a-droite': { object: { left: STAGE - OBJECT - 8, top: STAGE / 2 - OBJECT / 2 }, zAbove: true },
  'au-dessus': { object: { left: STAGE / 2 - OBJECT / 2, top: 6 }, zAbove: true },
  'en-dessous': { object: { left: STAGE / 2 - OBJECT / 2, top: STAGE - OBJECT - 6 }, zAbove: true },
  entre: { object: { left: STAGE / 2 - OBJECT / 2, top: STAGE / 2 - OBJECT / 2 }, zAbove: true },
  'a-cote': {
    object: { left: STAGE / 2 + REFERENCE / 2 + 2, top: STAGE / 2 - OBJECT / 2 },
    zAbove: true,
  },
};

/** One candidate scene: the reference object with the small object placed on it. */
function Scene({
  relation,
  objectId,
  referenceId,
}: {
  relation: Relation;
  objectId: string;
  referenceId: string;
}) {
  const layout = LAYOUT[relation];
  const object = (
    <View style={[styles.object, { left: layout.object.left, top: layout.object.top }]}>
      <ObjectIcon id={objectId} size={OBJECT} />
    </View>
  );
  return (
    <View style={styles.stage}>
      {/* « entre » needs a second reference so the object reads as in-between. */}
      {relation === 'entre' ? (
        <>
          <View style={[styles.reference, { left: 6, top: STAGE / 2 - REFERENCE / 2 }]}>
            <ObjectIcon id={referenceId} size={REFERENCE} />
          </View>
          <View
            style={[
              styles.reference,
              { left: STAGE - REFERENCE - 6, top: STAGE / 2 - REFERENCE / 2 },
            ]}
          >
            <ObjectIcon id={referenceId} size={REFERENCE} />
          </View>
          {object}
        </>
      ) : (
        <>
          {!layout.zAbove ? object : null}
          <View
            style={[
              styles.reference,
              { left: STAGE / 2 - REFERENCE / 2, top: STAGE / 2 - REFERENCE / 2 },
            ]}
          >
            <ObjectIcon id={referenceId} size={REFERENCE} />
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

  useEffect(() => {
    if (step.audioId) {
      playAudio(step.audioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const prompt = (
    <AlifaCard rounded="xl" style={styles.prompt}>
      <AlifaText variant="headlineMd" align="center">
        {step.instruction.text}
      </AlifaText>
      {step.audioId ? (
        <AlifaAudioButton
          variant="sky"
          size={56}
          playing={playingAudioId === step.audioId}
          onPress={() => step.audioId && playAudio(step.audioId)}
        />
      ) : null}
    </AlifaCard>
  );

  const answers = (
    <View style={styles.grid}>
      {step.choices.map((choice) => {
        const selected = picked === choice.id;
        return (
          <Pressable
            key={choice.id}
            disabled={!interactive}
            onPress={() => {
              setPicked(choice.id);
              onSubmit({ kind: 'choice', choiceId: choice.id });
            }}
            accessibilityRole="button"
            accessibilityLabel={choice.relation.replace('-', ' ')}
            style={[
              styles.cell,
              selected && styles.cellSelected,
              !interactive && !selected && styles.cellDisabled,
            ]}
          >
            <Scene
              relation={choice.relation}
              objectId={step.objectIllustrationId}
              referenceId={step.referenceIllustrationId}
            />
          </Pressable>
        );
      })}
    </View>
  );

  return <AlifaExerciseLayout prompt={prompt} answers={answers} />;
}

const styles = StyleSheet.create({
  prompt: { alignItems: 'center', gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'center' },
  cell: {
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: 'transparent',
    ...shadows.card,
  },
  cellSelected: { borderColor: colors.primaryContainer },
  cellDisabled: { opacity: 0.5 },
  stage: {
    width: STAGE,
    height: STAGE,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  reference: { position: 'absolute' },
  object: { position: 'absolute' },
});
