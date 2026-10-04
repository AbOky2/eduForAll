import { StyleSheet, View } from 'react-native';

import { BadgeArt, type BadgeArtId } from '../illustrations/badge-art';
import { EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { colors, spacing } from '../tokens';

/** Les tailles de nom possibles : l'étagère (petit), la célébration (grand). */
export type BadgeLabelVariant = 'labelSm' | 'labelMd' | 'labelLg';

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
  /**
   * Toute la largeur de sa cellule (étagère du profil) : le nom tient sur une
   * ligne quand il le peut. Les cases d'une rangée s'étirent à la plus haute
   * et la médaille est en tête : les médailles d'une rangée restent alignées,
   * sans ligne vide réservée sous les noms courts.
   */
  fill?: boolean | undefined;
  /** La taille du nom (défaut : `labelSm`, l'étagère). */
  labelVariant?: BadgeLabelVariant | undefined;
  /** Une largeur imposée (la case d'une rangée de médailles), plutôt que `badgeTileWidth`. */
  width?: number | undefined;
}

/** La largeur d'une tuile libre : la médaille et un peu d'air, jamais moins de 96 dp. */
export function badgeTileWidth(size: number): number {
  return Math.max(96, size + 24);
}

/**
 * Une médaille de la collection (brief v2 § 9) : le médaillon, son nom
 * dessous, deux lignes au plus. Verrouillée, elle garde sa forme, sa famille
 * (en pâle) et son nom, et dit ce qu'il faut faire pour l'obtenir : un badge
 * est un objectif, jamais une boîte mystère.
 */
export function BadgeTile({
  id,
  label,
  description,
  earned,
  lockedHint,
  size = 64,
  onDark = false,
  fill = false,
  labelVariant = 'labelSm',
  width,
}: BadgeTileProps) {
  const { scale } = useResponsive();
  const accessibilityLabel = `${label}. ${earned ? description : `${description} ${lockedHint}`}`;

  return (
    <View
      // Jamais plus large que sa cellule : le nom passe sur deux lignes, jamais sur la voisine.
      style={[
        styles.tile,
        fill ? styles.fill : { width: width ?? badgeTileWidth(size), maxWidth: '100%' },
        labelVariant === 'labelSm' ? undefined : { gap: scaled(spacing.xs, scale) },
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <BadgeArt id={id} earned={earned} size={size} />
      <EcolnaText
        variant={labelVariant}
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
  tile: { alignItems: 'center', gap: spacing.xxs, paddingHorizontal: spacing.xxs, alignSelf: 'center' },
  fill: { width: '100%' },
});
