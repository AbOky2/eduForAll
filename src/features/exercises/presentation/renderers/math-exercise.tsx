import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  AlifaAnswerCard,
  AlifaAudioButton,
  AlifaCard,
  AlifaExerciseLayout,
  AlifaText,
} from '@/design-system/primitives';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { colors, radius, spacing } from '@/design-system/tokens';

import type { ExerciseRendererProps } from '../exercise-props';

type MathStep = Extract<
  ExerciseStep,
  | { type: 'number_sequence' }
  | { type: 'compare_numbers' }
  | { type: 'simple_addition' }
  | { type: 'simple_subtraction' }
  | { type: 'simple_multiplication' }
  | { type: 'simple_division' }
  | { type: 'visual_word_problem' }
>;

/** Operator glyphs of the programme: « les signes de l'addition, de la
 *  soustraction, d'égalité, de la multiplication et de la division » (p. 58). */
const OPERATOR = {
  simple_addition: '+',
  simple_subtraction: '−',
  simple_multiplication: '×',
  simple_division: '÷',
} as const;

type OperationType = keyof typeof OPERATOR;
type OperationStep = Extract<MathStep, { type: OperationType }>;

function isOperation(step: MathStep): step is OperationStep {
  return step.type in OPERATOR;
}

/** Dot cluster showing a quantity as tens (gold) and units (blue) — mockup S15. */
function QuantityCard({ value }: { value: number }) {
  const dots = Math.min(value, 20);
  return (
    <AlifaCard
      padded={false}
      style={quantityStyles.card}
      backgroundColor={colors.surfaceContainerLow}
    >
      <View style={quantityStyles.dots}>
        {Array.from({ length: dots }, (_, index) => (
          <View
            key={index}
            style={[
              quantityStyles.dot,
              { backgroundColor: index < 10 ? colors.tertiaryContainer : colors.secondary },
            ]}
          />
        ))}
      </View>
      <AlifaText variant="labelMd" color={colors.textSecondary} align="center">
        {String(value)}
      </AlifaText>
    </AlifaCard>
  );
}

export function MathExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<MathStep>) {
  const [pressed, setPressed] = useState<number | null>(null);

  useEffect(() => {
    if (step.type === 'visual_word_problem' && step.statementAudioId) {
      playAudio(step.statementAudioId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.id]);

  const options: number[] =
    step.type === 'compare_numbers' ? [step.left, step.right] : step.options;

  const submit = (value: number) => {
    setPressed(value);
    onSubmit({ kind: 'number', value });
  };

  const prompt = (
    <AlifaCard rounded="xl" style={styles.board}>
      {isOperation(step) ? (
        <>
          {step.showQuantities ? (
            <View style={styles.quantities}>
              {step.type === 'simple_multiplication' ? (
                // « a × b » is read as b groups of a — show the groups.
                Array.from({ length: step.b }, (_, index) => (
                  <QuantityCard key={index} value={step.a} />
                ))
              ) : (
                <>
                  <QuantityCard value={step.a} />
                  <AlifaText variant="displayGlyphSmall" color={colors.primary}>
                    {OPERATOR[step.type]}
                  </AlifaText>
                  <QuantityCard value={step.b} />
                </>
              )}
            </View>
          ) : null}
          <AlifaText variant="displayGlyph" align="center" color={colors.primary}>
            {step.a} {OPERATOR[step.type]} {step.b} = ?
          </AlifaText>
        </>
      ) : null}

      {step.type === 'number_sequence' ? (
        <View style={styles.sequence}>
          {step.sequence.map((value, index) => (
            <View key={index} style={[styles.sequenceCell, value === null && styles.sequenceGap]}>
              <AlifaText
                variant="displayGlyphSmall"
                color={value === null ? colors.outline : colors.textPrimary}
              >
                {value === null ? '?' : String(value)}
              </AlifaText>
            </View>
          ))}
        </View>
      ) : null}

      {step.type === 'compare_numbers' ? (
        <AlifaText variant="headlineMd" align="center">
          {step.instruction.text}
        </AlifaText>
      ) : null}

      {step.type === 'visual_word_problem' ? (
        <View style={styles.problem}>
          {step.illustrationId ? <ObjectIcon id={step.illustrationId} size={64} /> : null}
          <AlifaText variant="bodyLg" align="center">
            {step.statement}
          </AlifaText>
          {step.statementAudioId ? (
            <AlifaAudioButton
              variant="sky"
              size={48}
              playing={playingAudioId === step.statementAudioId}
              onPress={() => step.statementAudioId && playAudio(step.statementAudioId)}
            />
          ) : null}
        </View>
      ) : null}
    </AlifaCard>
  );

  const answers = (
    <View style={styles.options}>
      {options.map((option, index) => (
        <AlifaAnswerCard
          key={`${option}-${index}`}
          label={String(option)}
          state={
            !interactive && pressed !== option
              ? 'disabled'
              : pressed === option
                ? 'selected'
                : 'default'
          }
          onPress={() => submit(option)}
          style={styles.numberCard}
        />
      ))}
    </View>
  );

  return <AlifaExerciseLayout prompt={prompt} answers={answers} promptWeight={1.3} />;
}

const styles = StyleSheet.create({
  board: { gap: spacing.lg, alignItems: 'center', paddingVertical: spacing.xl },
  quantities: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  sequence: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  sequenceCell: {
    minWidth: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  sequenceGap: {
    backgroundColor: colors.tertiaryFixed,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.tertiaryContainer,
  },
  problem: { alignItems: 'center', gap: spacing.md },
  options: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  numberCard: { flex: 1, maxWidth: 110 },
});

const quantityStyles = StyleSheet.create({
  card: {
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
    minWidth: 88,
  },
  dots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    maxWidth: 88,
    justifyContent: 'center',
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
