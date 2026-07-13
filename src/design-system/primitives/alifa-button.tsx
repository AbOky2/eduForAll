import type { ReactNode } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { a11y, colors, radius, shadows, spacing } from '../tokens';
import { AlifaText } from './alifa-text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface AlifaButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: ReactNode;
  accessibilityHint?: string;
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { background: string; text: string; borderColor?: string }
> = {
  // Sand pill with dark-brown text — "Commencer", "Vérifier" in the mockups.
  primary: { background: colors.primaryContainer, text: colors.onPrimaryContainer },
  // White bordered pill with petrol-blue text — "Rejouer".
  secondary: {
    background: colors.card,
    text: colors.secondary,
    borderColor: colors.outlineVariant,
  },
  ghost: { background: 'transparent', text: colors.primary },
  // Parent-space destructive actions only. Never in the child flow.
  danger: { background: colors.errorContainer, text: colors.onErrorContainer },
};

export function AlifaButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  icon,
  accessibilityHint,
  style,
}: AlifaButtonProps) {
  const palette = VARIANT_STYLES[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && shadows.card,
        {
          backgroundColor: palette.background,
          borderColor: palette.borderColor ?? 'transparent',
          borderWidth: palette.borderColor ? 1.5 : 0,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {icon}
      <AlifaText variant="labelLg" color={palette.text} align="center">
        {label}
      </AlifaText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: a11y.childTouchTarget - 8,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
});
