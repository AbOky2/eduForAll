import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../tokens';
import { scaled, useResponsive } from '../responsive';
import { EcolnaGalet } from './ecolna-galet';

interface EcolnaCardProps {
  children: ReactNode;
  onPress?: (() => void) | undefined;
  /** Rounded 24 for hero cards, 16 for standard cards. */
  rounded?: 'lg' | 'xl' | 'xxl';
  padded?: boolean;
  backgroundColor?: string;
  /** Héritage v3 (la tranche) : ignoré. */
  edgeColor?: string | undefined;
  accessibilityLabel?: string | undefined;
  accessibilityHint?: string | undefined;
  style?: StyleProp<ViewStyle>;
  /** Style de la face (disposition du contenu) quand la carte se touche. */
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * La carte v4 : une surface blanche, un filet, une ombre douce. Celle qu'on
 * touche s'enfonce sous le doigt (ressort) ; celle qu'on regarde est posée.
 * Une carte colorée (`backgroundColor`) n'a ni filet ni ombre : sa couleur suffit.
 */
export function EcolnaCard({
  children,
  onPress,
  rounded = 'lg',
  padded = true,
  backgroundColor = colors.card,
  accessibilityLabel,
  accessibilityHint,
  style,
  contentStyle,
}: EcolnaCardProps) {
  const { scale } = useResponsive();
  const padding = padded ? scaled(spacing.lg, scale) : 0;
  const cornerRadius = radius[rounded];
  const white = backgroundColor === colors.card;

  if (onPress) {
    return (
      <EcolnaGalet
        face={backgroundColor}
        border={white ? colors.border : undefined}
        radius={cornerRadius}
        shadow={shadows.raised}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={style}
        faceStyle={[{ padding }, contentStyle]}
      >
        {children}
      </EcolnaGalet>
    );
  }

  const surface = {
    borderRadius: cornerRadius,
    padding,
    backgroundColor,
    borderColor: white ? colors.border : 'transparent',
    borderWidth: white ? 1 : 0,
  };

  // Une carte-cadre (sans marge, une illustration dedans) découpe son contenu
  // dans l'arrondi ; l'ombre se pose alors sur un contenant à part, car un
  // `overflow: hidden` la rognerait sur iOS.
  if (!padded) {
    return (
      <View accessibilityLabel={accessibilityLabel} style={[white && shadows.card, styles.curve, { borderRadius: cornerRadius }, style]}>
        <View style={[styles.clip, surface, contentStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <View accessibilityLabel={accessibilityLabel} style={[styles.curve, white && shadows.card, surface, style, contentStyle]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden', flexGrow: 1, borderCurve: 'continuous' },
  curve: { borderCurve: 'continuous' },
});
