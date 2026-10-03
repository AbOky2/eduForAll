import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing, type TypographyVariant } from '../tokens';
import { scaled, useResponsive } from '../responsive';
import { EcolnaGalet } from './ecolna-galet';
import { EcolnaText } from './ecolna-text';

/**
 * - `primary`   le soleil : l'action principale de l'enfant (une par écran) ;
 * - `accent`    pétrole : action forte mais seconde (Réessayer, Valider côté parent) ;
 * - `secondary` galet blanc : l'alternative (Rejouer, Annuler) ;
 * - `ghost`     un lien, sans galet (Retour à l'accueil) ;
 * - `danger`    actions destructives de l'espace parent, jamais côté enfant.
 */
type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'lg' | 'md' | 'sm';

interface EcolnaButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  icon?: ReactNode;
  /** Icône après le libellé (« Continuer → »). */
  iconAfter?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle> | undefined;
  testID?: string;
}

const VARIANTS: Record<
  Exclude<ButtonVariant, 'ghost'>,
  { face: string; edge: string; text: string; border?: string }
> = {
  primary: { face: colors.sun, edge: colors.sunShade, text: colors.onSun },
  accent: { face: colors.secondary, edge: colors.secondaryShade, text: colors.onSecondary },
  secondary: {
    face: colors.card,
    edge: colors.cardEdge,
    text: colors.secondary,
    border: colors.cardEdge,
  },
  danger: { face: colors.errorContainer, edge: colors.errorEdge, text: colors.onErrorContainer },
};

const SIZES: Record<ButtonSize, { height: number; text: TypographyVariant; padding: number }> = {
  // Action principale de l'enfant : ≥ 64 dp, une cible qu'on ne rate pas.
  lg: { height: 60, text: 'button', padding: spacing.xxl },
  md: { height: 52, text: 'button', padding: spacing.xl },
  // Espace parent, actions de ligne.
  sm: { height: 40, text: 'buttonSm', padding: spacing.lg },
};

export function EcolnaButton({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  icon,
  iconAfter = false,
  accessibilityHint,
  style,
  testID,
}: EcolnaButtonProps) {
  const { scale } = useResponsive();
  const metrics = SIZES[size];
  const height = scaled(metrics.height, scale);

  const content = (color: string) => (
    <View style={[styles.row, iconAfter && styles.rowReverse]}>
      {icon}
      <EcolnaText variant={metrics.text} color={color} align="center" numberOfLines={2}>
        {label}
      </EcolnaText>
    </View>
  );

  if (variant === 'ghost') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        testID={testID}
        hitSlop={8}
        style={({ pressed }) => [
          styles.ghost,
          { minHeight: scaled(44, scale), opacity: disabled ? 0.5 : pressed ? 0.6 : 1 },
          style,
        ]}
      >
        {content(colors.primary)}
      </Pressable>
    );
  }

  const palette = disabled
    ? { face: colors.lockedContainer, edge: colors.lockedEdge, text: colors.locked }
    : VARIANTS[variant];

  return (
    <EcolnaGalet
      face={palette.face}
      edge={palette.edge}
      border={'border' in palette ? palette.border : undefined}
      radius={radius.pill}
      depth={size === 'sm' ? 'sm' : 'md'}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={style}
      faceStyle={[
        styles.face,
        { minHeight: height, paddingHorizontal: scaled(metrics.padding, scale) },
      ]}
    >
      {content(palette.text)}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  face: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  rowReverse: { flexDirection: 'row-reverse' },
  ghost: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
});
