import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AlifaIcon, type IconName } from '../icons/alifa-icon';
import { AlifaCard, AlifaText } from '../primitives';
import { colors, radius, spacing } from '../tokens';

interface AlifaStatCardProps {
  icon: IconName;
  value: string;
  label: string;
  container: string;
  tint: string;
  /** `row` : icône à gauche (espace parent) ; `column` : tuile centrée (profil enfant). */
  orientation?: 'row' | 'column';
  /** Complément sous la valeur — barre de progression, sous-titre. */
  children?: ReactNode;
}

/** Un chiffre dont on est fier, avec son icône dans un disque de couleur. */
export function AlifaStatCard({
  icon,
  value,
  label,
  container,
  tint,
  orientation = 'row',
  children,
}: AlifaStatCardProps) {
  const column = orientation === 'column';
  return (
    <AlifaCard
      style={column ? styles.columnCard : styles.rowCard}
      accessibilityLabel={`${label} : ${value}`}
    >
      <View style={[styles.disc, column ? styles.discSmall : styles.discLarge, { backgroundColor: container }]}>
        <AlifaIcon name={icon} size={column ? 20 : 22} color={tint} filled={column} />
      </View>
      <View style={column ? styles.columnText : styles.rowText}>
        {column ? null : (
          <AlifaText variant="labelMd" color={colors.textSecondary}>
            {label}
          </AlifaText>
        )}
        <AlifaText variant="headlineMd">{value}</AlifaText>
        {column ? (
          <AlifaText variant="labelSm" color={colors.textSecondary} align="center">
            {label}
          </AlifaText>
        ) : null}
        {children}
      </View>
    </AlifaCard>
  );
}

const styles = StyleSheet.create({
  rowCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  columnCard: { flex: 1, alignItems: 'center', gap: spacing.xxs },
  disc: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  discLarge: { width: 44, height: 44 },
  discSmall: { width: 36, height: 36 },
  rowText: { flex: 1, gap: spacing.xxs },
  columnText: { alignItems: 'center', gap: spacing.xxs },
});
