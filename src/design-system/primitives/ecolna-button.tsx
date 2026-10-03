import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing, type TypographyVariant } from '../tokens';
import { scaled, useResponsive } from '../responsive';
import { EcolnaGalet } from './ecolna-galet';
import { EcolnaText } from './ecolna-text';

/**
 * - `primary`   le soleil : l'action principale de l'enfant (une par écran) ;
 * - `accent`    la marque : action forte mais seconde (Réessayer, Valider côté parent) ;
 * - `secondary` surface blanche filetée : l'alternative (Rejouer, Annuler) ;
 * - `ghost`     un lien, sans surface (Retour à l'accueil) ;
 * - `danger`    actions destructives de l'espace parent, jamais côté enfant.
 *
 * `onDark` : sur la nuit (célébration), `secondary` devient une surface de
 * verre au texte blanc et `ghost` un lien blanc.
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
  /** Posé sur une surface sombre (la nuit de la célébration). */
  onDark?: boolean;
  /** Icône après le libellé (« Continuer → »). */
  iconAfter?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle> | undefined;
  testID?: string;
}

const VARIANTS: Record<
  Exclude<ButtonVariant, 'ghost'>,
  { face: string; text: string; border?: string; shadow?: ViewStyle }
> = {
  // Le soleil porte son propre halo doré : l'action se voit de loin.
  primary: { face: colors.reward, text: colors.onReward, shadow: shadows.glowReward },
  accent: { face: colors.brand, text: colors.white, shadow: shadows.glowBrand },
  secondary: { face: colors.white, text: colors.ink, border: colors.borderStrong },
  danger: { face: colors.dangerTint, text: colors.dangerInk, border: '#fecdca' },
};

const SIZES: Record<ButtonSize, { height: number; text: TypographyVariant; padding: number }> = {
  // Action principale de l'enfant : 60 dp × l'échelle, une cible qu'on ne rate pas.
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
  onDark = false,
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
        {content(onDark ? colors.white : colors.brand)}
      </Pressable>
    );
  }

  const palette = disabled
    ? { face: colors.fill, text: colors.inkDisabled, border: undefined, shadow: undefined }
    : onDark && variant === 'secondary'
      ? { face: colors.onColorGlass, text: colors.white, border: colors.onColorTrack, shadow: undefined }
      : VARIANTS[variant];

  return (
    <EcolnaGalet
      face={palette.face}
      border={palette.border}
      borderWidth={1.5}
      radius={radius.pill}
      shadow={palette.shadow}
      haptic={variant === 'primary' || variant === 'accent' ? 'light' : 'selection'}
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
