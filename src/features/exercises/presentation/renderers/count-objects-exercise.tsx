import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AlifaAnswerCard, AlifaCard, AlifaExerciseLayout } from '@/design-system/primitives';
import { useResponsive } from '@/design-system/responsive';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { radius, spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type CountStep = Extract<ExerciseStep, { type: 'count_objects' }>;

/** Count the goats/mangoes… (mockup S14): object scene + number cards. */
export function CountObjectsExercise({
  step,
  interactive,
  onSubmit,
}: ExerciseRendererProps<CountStep>) {
  const [pressed, setPressed] = useState<number | null>(null);
  const { isTablet } = useResponsive();

  const prompt = (
    <AlifaCard rounded="xl" style={styles.scene} backgroundColor="#f9ecd8">
      <View style={styles.objects} accessibilityLabel={`${step.count} ${step.objectName}`}>
        {Array.from({ length: step.count }, (_, index) => (
          <ObjectIcon key={index} id={step.illustrationId} size={isTablet ? 80 : 62} />
        ))}
      </View>
    </AlifaCard>
  );

  const answers = (
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
  );

  return <AlifaExerciseLayout prompt={prompt} answers={answers} promptWeight={1.2} />;
}

const styles = StyleSheet.create({
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

