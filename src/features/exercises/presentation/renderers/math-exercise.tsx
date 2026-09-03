import { memo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import {
  AlifaAnswerCard,
  AlifaAudioButton,
  AlifaCard,
  AlifaExerciseLayout,
  AlifaText,
} from '@/design-system/primitives';
import { QuantityCard, QuantityGroup } from '@/design-system/components/quantity-group';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { scaled, useResponsive } from '@/design-system/responsive';
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

type SceneKind = 'add' | 'remove' | 'groups' | 'shares';

const SCENE_OF_OPERATION: Record<OperationType, SceneKind> = {
  simple_addition: 'add',
  simple_subtraction: 'remove',
  simple_multiplication: 'groups',
  simple_division: 'shares',
};

interface QuantitySceneProps {
  kind: SceneKind;
  a: number;
  b: number;
  illustrationId: string | undefined;
  objectName: string | undefined;
  size: number;
}

/**
 * The drawn story of an operation — shared by the four operations and by the
 * illustrated word problems.
 *
 * « Les opérations […] à partir de situations concrètes » (programme p. 58) :
 * an addition shows two heaps to gather, a subtraction shows what leaves, a
 * multiplication shows equal groups and a division shows equal shares. Steps
 * whose numbers are too big to draw carry no illustration and fall back to
 * counters — by then the child computes rather than counts.
 *
 * Memoised: the scene never changes while the child answers, and it can hold
 * twenty illustrated objects.
 */
const QuantityScene = memo(function QuantityScene({
  kind,
  a,
  b,
  illustrationId,
  objectName,
  size,
}: QuantitySceneProps) {
  const of = (count: number) => (objectName ? `${count} ${objectName}` : String(count));

  if (kind === 'remove') {
    // One heap, with what leaves struck through: « il en reste combien ? »
    return (
      <QuantityCard
        count={a}
        illustrationId={illustrationId}
        removed={b}
        size={size}
        accessibilityLabel={`${of(a)}, on en enlève ${b}`}
      />
    );
  }

  if (kind === 'groups') {
    // « a × b » is read as b groups of a — draw the groups.
    return (
      <View style={styles.quantities}>
        {Array.from({ length: b }, (_, index) => (
          <QuantityCard
            key={index}
            count={a}
            illustrationId={illustrationId}
            size={size}
            accessibilityLabel={`groupe de ${of(a)}`}
          />
        ))}
      </View>
    );
  }

  if (kind === 'shares') {
    // Sharing: b equal shares laid out one under the other.
    const share = a / b;
    return (
      <View style={styles.shares}>
        {Array.from({ length: b }, (_, index) => (
          <View key={index} style={styles.share}>
            <QuantityGroup
              count={share}
              illustrationId={illustrationId}
              size={size}
              accessibilityLabel={`part de ${of(share)}`}
            />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.quantities}>
      <QuantityCard count={a} illustrationId={illustrationId} size={size} accessibilityLabel={of(a)} />
      <AlifaText variant="displayGlyphSmall" color={colors.primary}>
        +
      </AlifaText>
      <QuantityCard count={b} illustrationId={illustrationId} size={size} accessibilityLabel={of(b)} />
    </View>
  );
});

export function MathExercise({
  step,
  interactive,
  onSubmit,
  playAudio,
  playingAudioId,
}: ExerciseRendererProps<MathStep>) {
  const [pressed, setPressed] = useState<number | null>(null);
  const { scale } = useResponsive();
  // Objets à compter : suivent la classe de fenêtre comme la typographie.
  const iconSize = scaled(36, scale);

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
            <QuantityScene
              kind={SCENE_OF_OPERATION[step.type]}
              a={step.a}
              b={step.b}
              illustrationId={step.illustrationId}
              objectName={step.objectName}
              size={iconSize}
            />
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
          {step.visual && step.illustrationId ? (
            <QuantityScene
              kind={step.visual.mode}
              a={step.visual.first}
              b={step.visual.second}
              illustrationId={step.illustrationId}
              objectName={undefined}
              size={iconSize}
            />
          ) : step.illustrationId ? (
            <ObjectIcon id={step.illustrationId} size={64} />
          ) : null}
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
    justifyContent: 'center',
    flexWrap: 'wrap',
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
  shares: { gap: spacing.xs, alignItems: 'center' },
  share: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  problem: { alignItems: 'center', gap: spacing.md },
  options: { flexDirection: 'row', gap: spacing.md, justifyContent: 'center' },
  numberCard: { flex: 1, maxWidth: 110 },
});

