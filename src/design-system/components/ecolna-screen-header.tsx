import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { fr } from '@/localization/fr/strings';

import { EcolnaIcon } from '../icons/ecolna-icon';
import { EcolnaText } from '../primitives';
import { a11y, colors, spacing, type TypographyVariant } from '../tokens';

interface EcolnaScreenHeaderProps {
  onBack: () => void;
  title?: string | undefined;
  /** Ligne sous le titre — la devise du niveau sur la carte de progression. */
  subtitle?: string | undefined;
  titleVariant?: TypographyVariant | undefined;
  /** Bouton de droite ; absent, un espace de même largeur garde le titre centré. */
  right?: ReactNode;
  titleColor?: string | undefined;
}

/**
 * En-tête d'écran secondaire : retour à gauche, titre centré, action à droite.
 * Un seul endroit pour la cible tactile de 44 pt et l'étiquette « Retour ».
 */
export function EcolnaScreenHeader({
  onBack,
  title,
  subtitle,
  titleVariant = 'headlineSm',
  right,
  titleColor = colors.primary,
}: EcolnaScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={fr.common.back}
        onPress={onBack}
        style={styles.button}
      >
        <EcolnaIcon name="arrow-back" size={22} color={colors.onSurfaceVariant} />
      </Pressable>
      <View style={styles.titles}>
        {title ? (
          <EcolnaText variant={titleVariant} color={titleColor} align="center">
            {title}
          </EcolnaText>
        ) : null}
        {subtitle ? (
          <EcolnaText variant="bodyMd" color={colors.textSecondary} align="center">
            {subtitle}
          </EcolnaText>
        ) : null}
      </View>
      <View style={styles.button}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenMargin,
    paddingVertical: spacing.sm,
  },
  titles: { flex: 1, alignItems: 'center' },
  button: {
    width: a11y.minTouchTarget,
    height: a11y.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
