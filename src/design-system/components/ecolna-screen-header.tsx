import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { fr } from '@/localization/fr/strings';

import { EcolnaIconButton, EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { a11y, colors, spacing, type TypographyVariant } from '../tokens';

interface EcolnaScreenHeaderProps {
  onBack: () => void;
  title?: string | undefined;
  /** Ligne sous le titre. */
  subtitle?: string | undefined;
  titleVariant?: TypographyVariant | undefined;
  /** Bouton de droite ; absent, un espace de même largeur garde le titre centré. */
  right?: ReactNode;
  titleColor?: string | undefined;
  /** Titre aligné à gauche, contre le bouton retour (espace parent). */
  alignTitle?: 'center' | 'left';
  /** Posé entre le bouton retour et le titre (l'avatar de l'enfant, espace parent). */
  leading?: ReactNode;
}

/**
 * En-tête d'écran secondaire : un galet « retour » à gauche, le titre, une
 * action à droite. Un seul endroit pour la cible tactile et l'étiquette
 * « Retour » (les flux Maestro la touchent).
 */
export function EcolnaScreenHeader({
  onBack,
  title,
  subtitle,
  titleVariant = 'headlineMd',
  right,
  titleColor = colors.textPrimary,
  alignTitle = 'center',
  leading,
}: EcolnaScreenHeaderProps) {
  const { screenPadding, scale } = useResponsive();
  const slot = Math.max(a11y.minTouchTarget, scaled(52, scale));
  return (
    <View style={[styles.header, { paddingHorizontal: screenPadding, gap: scaled(spacing.md, scale) }]}>
      <EcolnaIconButton icon="arrow-back" accessibilityLabel={fr.common.back} onPress={onBack} />
      {leading}
      <View style={[styles.titles, alignTitle === 'left' && styles.titlesLeft]}>
        {title ? (
          <EcolnaText variant={titleVariant} color={titleColor} align={alignTitle}>
            {title}
          </EcolnaText>
        ) : null}
        {subtitle ? (
          <EcolnaText variant="bodyMd" color={colors.textSecondary} align={alignTitle}>
            {subtitle}
          </EcolnaText>
        ) : null}
      </View>
      <View style={[styles.slot, { minWidth: alignTitle === 'center' ? slot : 0, gap: scaled(spacing.sm, scale) }]}>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  titles: { flex: 1, alignItems: 'center' },
  titlesLeft: { alignItems: 'flex-start' },
  // Plusieurs actions à droite (partager, paramètres) : côte à côte.
  slot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
});
