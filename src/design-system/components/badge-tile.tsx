import { StyleSheet, View } from 'react-native';

import { BadgeArt, type BadgeArtId } from '../illustrations/badge-art';
import { EcolnaText } from '../primitives';
import { colors, spacing } from '../tokens';

interface BadgeTileProps {
  id: BadgeArtId;
  label: string;
  description: string;
  earned: boolean;
  /** Ajouté à la description quand le badge n'est pas gagné. */
  lockedHint: string;
  size?: number | undefined;
  /** Posée sur la nuit (célébration) : libellé blanc. */
  onDark?: boolean | undefined;
}

/**
 * Une médaille de la collection (brief v2 § 9). Verrouillée, elle montre sa
 * silhouette et garde son nom et ce qu'il faut faire pour l'obtenir : un
 * badge est un objectif, jamais une boîte mystère.
 */
export function BadgeTile({
  id,
  label,
  description,
  earned,
  lockedHint,
  size = 64,
  onDark = false,
}: BadgeTileProps) {
  return (
    <View
      style={[styles.tile, { width: Math.max(96, size + 24) }]}
      accessibilityRole="image"
      accessibilityLabel={`${label}. ${earned ? description : `${description} ${lockedHint}`}`}
    >
      <BadgeArt id={id} earned={earned} size={size} />
      <EcolnaText
        variant="labelSm"
        align="center"
        color={onDark ? colors.white : earned ? colors.textPrimary : colors.textSecondary}
        numberOfLines={2}
      >
        {label}
      </EcolnaText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', gap: spacing.xxs },
});
