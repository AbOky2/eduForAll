import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { EcolnaIcon, type IconName } from '../icons/ecolna-icon';
import { EcolnaCard, EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { colors, radius, spacing } from '../tokens';

interface EcolnaStatCardProps {
  icon: IconName;
  value: string;
  label: string;
  container: string;
  tint: string;
  /** Complément sous la valeur — barre de progression, sous-titre. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * Un chiffre de l'espace parent : un glyphe du palier S dans un disque teinté,
 * l'intitulé, la valeur. Sobre — l'adulte lit, il ne joue pas.
 */
export function EcolnaStatCard({
  icon,
  value,
  label,
  container,
  tint,
  children,
  style,
}: EcolnaStatCardProps) {
  const { scale } = useResponsive();
  const disc = scaled(48, scale);
  return (
    <EcolnaCard style={[styles.card, style]} accessibilityLabel={`${label} : ${value}`}>
      <View style={[styles.disc, { width: disc, height: disc, backgroundColor: container }]}>
        <EcolnaIcon name={icon} size={24} color={tint} />
      </View>
      <View style={styles.text}>
        <EcolnaText variant="labelMd" color={colors.textSecondary}>
          {label}
        </EcolnaText>
        <EcolnaText variant="headlineLg">{value}</EcolnaText>
        {children}
      </View>
    </EcolnaCard>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  disc: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  text: { flex: 1, gap: spacing.xxs },
});
