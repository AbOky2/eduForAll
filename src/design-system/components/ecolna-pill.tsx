import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { EcolnaGalet, EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { colors, radius, spacing, type TypographyVariant } from '../tokens';

type PillTone = 'white' | 'sun' | 'petrol' | 'glass' | 'sand' | 'green';

interface EcolnaPillProps {
  label: string;
  icon?: ReactNode;
  tone?: PillTone;
  variant?: TypographyVariant;
  /** Une pastille qu'on touche devient un petit galet. */
  onPress?: (() => void) | undefined;
  accessibilityLabel?: string | undefined;
  style?: StyleProp<ViewStyle>;
}

const TONES: Record<PillTone, { face: string; ink: string; border?: string }> = {
  white: { face: colors.white, ink: colors.ink, border: colors.border },
  sun: { face: colors.rewardTint, ink: colors.onReward },
  petrol: { face: colors.brandTint, ink: colors.brandInk },
  sand: { face: colors.fill, ink: colors.inkSecondary },
  green: { face: colors.successTint, ink: colors.successInk },
  // Posée sur une surface « nuit » ou colorée : un voile blanc, texte blanc.
  glass: { face: colors.onColorTrack, ink: colors.white },
};

/**
 * Pastille (puce) v4 : un fait court (« 5 jours », « En cours »). Trois tons
 * utiles — neutre, marque, récompense — et le voile pour les surfaces
 * colorées. Qu'on la touche, elle s'enfonce comme toute surface.
 */
export function EcolnaPill({
  label,
  icon,
  tone = 'white',
  variant = 'labelMd',
  onPress,
  accessibilityLabel,
  style,
}: EcolnaPillProps) {
  const { scale } = useResponsive();
  const palette = TONES[tone];
  const body = (
    <View style={[styles.row, { paddingHorizontal: scaled(spacing.sm, scale) }]}>
      {icon}
      {label ? (
        <EcolnaText variant={variant} color={palette.ink}>
          {label}
        </EcolnaText>
      ) : null}
    </View>
  );
  if (onPress) {
    return (
      <EcolnaGalet
        face={palette.face}
        border={palette.border}
        borderWidth={1}
        radius={radius.pill}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel ?? label}
        hitSlop={8}
        style={[styles.self, style]}
        faceStyle={[styles.face, { minHeight: scaled(40, scale) }]}
      >
        {body}
      </EcolnaGalet>
    );
  }
  return (
    <View
      accessible
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.face,
        {
          minHeight: scaled(tone === 'glass' ? 24 : 36, scale),
          backgroundColor: palette.face,
          borderColor: palette.border ?? palette.face,
          borderWidth: palette.border ? 1.5 : 0,
          borderRadius: radius.pill,
        },
        style,
      ]}
    >
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  self: { alignSelf: 'flex-start' },
  face: { alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, paddingVertical: 2 },
});
