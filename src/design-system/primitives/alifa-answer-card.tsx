import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { a11y, colors, radius, shadows, spacing } from '../tokens';
import { AlifaIcon } from '../icons/alifa-icon';
import { AlifaText } from './alifa-text';

export type AnswerCardState = 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled';

interface AlifaAnswerCardProps {
  label?: string;
  children?: ReactNode;
  onPress: () => void;
  state?: AnswerCardState;
  /** Large pedagogical glyph (syllables, numbers) vs body text. */
  glyph?: boolean;
  accessibilityLabel?: string | undefined;
  style?: StyleProp<ViewStyle> | undefined;
}

/**
 * White answer card of the exercise screens (mockups S11–S15).
 * Correct/incorrect states pair color with an icon so feedback never relies
 * on color alone.
 */
export function AlifaAnswerCard({
  label,
  children,
  onPress,
  state = 'default',
  glyph = true,
  accessibilityLabel,
  style,
}: AlifaAnswerCardProps) {
  const borderColor =
    state === 'selected'
      ? colors.primaryContainer
      : state === 'correct'
        ? colors.feedbackCorrect
        : state === 'incorrect'
          ? colors.secondary
          : 'transparent';

  const backgroundColor =
    state === 'correct'
      ? colors.feedbackCorrectContainer
      : state === 'incorrect'
        ? colors.feedbackIncorrectContainer
        : colors.card;

  const disabled = state === 'disabled' || state === 'correct' || state === 'incorrect';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, selected: state === 'selected' }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadows.card,
        {
          backgroundColor,
          borderColor,
          opacity: state === 'disabled' ? 0.45 : 1,
          transform: [{ scale: pressed && !disabled ? 0.97 : 1 }],
        },
        style,
      ]}
    >
      {children ??
        (label !== undefined ? (
          <AlifaText
            variant={glyph ? 'displayGlyphSmall' : 'bodyLg'}
            align="center"
            color={state === 'correct' ? colors.feedbackCorrect : colors.textPrimary}
          >
            {label}
          </AlifaText>
        ) : null)}
      {state === 'correct' ? (
        <AlifaIcon name="check" size={22} color={colors.feedbackCorrect} />
      ) : null}
      {state === 'incorrect' ? <AlifaIcon name="close" size={20} color={colors.secondary} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: a11y.childTouchTarget,
    borderRadius: radius.lg,
    borderWidth: 2.5,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
