import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AlifaAnswerCard, AlifaCard } from '@/design-system/primitives';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { colors, radius, spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type CountStep = Extract<ExerciseStep, { type: 'count_objects' }>;

/** Count the goats/mangoes… (mockup S14): object scene + number cards. */
export function CountObjectsExercise({
  step,
  interactive,
  onSubmit,
}: ExerciseRendererProps<CountStep>) {
  const [pressed, setPressed] = useState<number | null>(null);

  useEffect(() => {
    setPressed(null);
  }, [step.id]);

  return (
    <View style={styles.container}>
      <AlifaCard rounded="xl" style={styles.scene} backgroundColor="#f9ecd8">
        <View style={styles.objects} accessibilityLabel={`${step.count} ${step.objectName}`}>
          {Array.from({ length: step.count }, (_, index) => (
            <ObjectIcon key={index} id={step.illustrationId} size={62} />
          ))}
        </View>
      </AlifaCard>
      <View style={styles.options}>
        {step.options.map((option) => (
          <AlifaAnswerCard
            key={option}
            label={String(option)}
            state={
              !interactive && pressed !== option
                ? 'disabled'
                : pressed === option
                  ? 'selected'
                  : 'default'
            }
            onPress={() => {
              setPressed(option);
              onSubmit({ kind: 'number', value: option });
            }}
            style={styles.numberCard}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: spacing.xl, justifyContent: 'center' },
  scene: { borderRadius: radius.lg, minHeight: 190, justifyContent: 'center' },
  objects: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  options: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  numberCard: { flex: 1, maxWidth: 110 },
});

export { colors };
