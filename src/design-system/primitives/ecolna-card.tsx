import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../tokens';
import { scaled, useResponsive } from '../responsive';
import { EcolnaGalet } from './ecolna-galet';

interface EcolnaCardProps {
  children: ReactNode;
  onPress?: (() => void) | undefined;
  /** Rounded 24 for hero cards, 16 for standard cards. */
  rounded?: 'lg' | 'xl';
  padded?: boolean;
  backgroundColor?: string;
  /** Tranche du galet quand la carte se touche (défaut : `cardEdge`). */
  edgeColor?: string | undefined;
  accessibilityLabel?: string | undefined;
  accessibilityHint?: string | undefined;
  style?: StyleProp<ViewStyle>;
  /** Style de la face (disposition du contenu) quand la carte se touche. */
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * La carte. Celle qu'on touche est un galet (direction v3 § 2) : face
 * blanche, liseré et tranche sable, elle s'enfonce sous le doigt. Celle qu'on
 * regarde seulement est posée à plat — un liseré, une ombre courte, pas de
 * tranche : la tranche veut dire « touche-moi ».
 */
export function EcolnaCard({
  children,
  onPress,
  rounded = 'lg',
  padded = true,
  backgroundColor = colors.card,
  edgeColor,
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
        edge={edgeColor ?? colors.cardEdge}
        border={white ? colors.cardEdge : undefined}
        radius={cornerRadius}
        depth={rounded === 'xl' ? 'lg' : 'md'}
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={style}
        faceStyle={[styles.clip, { padding }, contentStyle]}
      >
        {children}
      </EcolnaGalet>
    );
  }

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.clip,
        shadows.card,
        {
          borderRadius: cornerRadius,
          padding,
          backgroundColor,
          borderColor: white ? colors.cardEdge : 'transparent',
          borderWidth: white ? 1.5 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});
