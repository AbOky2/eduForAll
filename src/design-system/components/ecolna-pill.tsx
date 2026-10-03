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

const TONES: Record<PillTone, { face: string; edge: string; ink: string; border?: string }> = {
  white: { face: colors.card, edge: colors.cardEdge, ink: colors.textPrimary, border: colors.cardEdge },
  sun: { face: colors.tertiaryFixed, edge: colors.tertiaryFixedDim, ink: colors.onTertiaryContainer },
  petrol: { face: colors.secondaryFixed, edge: colors.secondaryFixedDim, ink: colors.onSecondaryContainer },
  sand: { face: colors.primaryFixed, edge: colors.primaryFixedDim, ink: colors.onPrimaryContainer },
  green: {
    face: colors.feedbackCorrectContainer,
    edge: colors.feedbackCorrectShade,
    ink: colors.feedbackCorrect,
  },
  // Posée sur la carte héros terre : une pastille claire, sans tranche.
  glass: { face: colors.primaryDuneNear, edge: colors.primaryDuneNear, ink: colors.onPrimary },
};

/**
 * Pastille : un fait court (« 5 jours », « EN COURS », « 3/18 »). Posée, elle
 * n'a pas de tranche ; qu'on la touche, elle devient un petit galet.
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
        edge={palette.edge}
        border={palette.border}
        radius={radius.pill}
        depth="sm"
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
