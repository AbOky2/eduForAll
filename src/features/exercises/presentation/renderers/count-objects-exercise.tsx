import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  EcolnaAnswerCard,
  EcolnaStimulus,
  EcolnaExerciseLayout,
  useExerciseMetrics,
} from '@/design-system/primitives';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { EmptyQuantityScene } from '@/design-system/illustrations/school-art';
import { scaled, useResponsive } from '@/design-system/responsive';
import { spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type CountStep = Extract<ExerciseStep, { type: 'count_objects' }>;

/**
 * Count the goats/mangoes… (mockup S14): the objects stand in a meadow, the
 * numbers are pebbles. Zero is not an empty frame — it is an empty pen with
 * its empty bowl, so the child reads « there is nothing in it », not « the
 * picture did not load » (brief v2 § 10).
 */
export function CountObjectsExercise({
  step,
  interactive,
  onSubmit,
}: ExerciseRendererProps<CountStep>) {
  const [pressed, setPressed] = useState<number | null>(null);
  const { isTablet, scale, splitPanes } = useResponsive();
  const metrics = useExerciseMetrics();
  // Peu d'objets : plus grands, pour qu'un seul ne se perde pas dans la scène.
  const boost = step.count <= 2 ? 2.6 : step.count <= 4 ? 1.5 : 1;
  const objectSize = Math.round(scaled(isTablet ? 76 : 56, scale) * boost);

  const prompt = (
    <EcolnaStimulus style={[styles.scene, { minHeight: scaled(isTablet ? 260 : 190, scale) }]}>
      {step.count === 0 ? (
        <View accessibilityRole="image" accessibilityLabel={`0 ${step.objectName}`}>
          <EmptyQuantityScene size={scaled(isTablet ? 200 : 150, scale)} />
        </View>
      ) : (
        <View
          style={[styles.objects, { gap: scaled(spacing.sm, scale) }]}
          accessibilityRole="image"
          accessibilityLabel={`${step.count} ${step.objectName}`}
        >
          {Array.from({ length: step.count }, (_, index) => (
            <ObjectIcon key={index} id={step.illustrationId} size={objectSize} />
          ))}
        </View>
      )}
    </EcolnaStimulus>
  );

  const answers = (
    <View style={[styles.options, splitPanes && styles.fill, { gap: metrics.gap }]}>
      {step.options.map((option) => (
        <EcolnaAnswerCard
          key={option}
          label={String(option)}
          glyphVariant={metrics.answerGlyph}
          state={interactive ? 'default' : pressed === option ? 'selected' : 'disabled'}
          onPress={() => {
            setPressed(option);
            onSubmit({ kind: 'number', value: option });
          }}
          style={[styles.numberCard, { maxWidth: metrics.tileWidth * 1.2 }]}
          contentStyle={{ minHeight: metrics.answerHeight, flexGrow: 1 }}
        />
      ))}
    </View>
  );

  return <EcolnaExerciseLayout prompt={prompt} answers={answers} promptWeight={1} />;
}

const styles = StyleSheet.create({
  scene: { justifyContent: 'center', alignItems: 'center' },
  objects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  options: { flexDirection: 'row', justifyContent: 'center', alignItems: 'stretch' },
  fill: { flex: 1 },
  numberCard: { flex: 1 },
});
