import { StyleSheet, View } from 'react-native';

import { BadgeArt, type BadgeArtId } from '../illustrations/badge-art';
import { EcolnaText } from '../primitives';
import { scaled, useResponsive } from '../responsive';
import { colors, radius, spacing } from '../tokens';
import { typography } from '../tokens/typography';

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
   * ligne quand il le peut, et chaque tuile réserve deux lignes — les rangées
   * de l'étagère gardent la même hauteur, quel que soit le nom.
   */
  fill?: boolean | undefined;
  /**
   * `inline` : la médaille et son nom côte à côte, dans une puce de verre —
   * la rangée compacte de la célébration.
   */
  layout?: 'stack' | 'inline' | undefined;
}

/**
 * Une médaille de la collection (brief v2 § 9). Verrouillée, elle garde sa
 * forme, sa famille (en pâle) et son nom, et dit ce qu'il faut faire pour
 * l'obtenir : un badge est un objectif, jamais une boîte mystère.
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
  layout = 'stack',
}: BadgeTileProps) {
  const { scale } = useResponsive();
  const accessibilityLabel = `${label}. ${earned ? description : `${description} ${lockedHint}`}`;

  if (layout === 'inline') {
    return (
      <View
        style={[
          styles.inline,
          {
            backgroundColor: onDark ? colors.onColorGlass : colors.fill,
            gap: scaled(spacing.xs, scale),
            paddingVertical: scaled(spacing.xxs, scale),
            paddingLeft: scaled(spacing.xxs, scale),
            paddingRight: scaled(spacing.md, scale),
          },
        ]}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
      >
        <BadgeArt id={id} earned={earned} size={size} />
        <EcolnaText variant="labelLg" color={onDark ? colors.white : colors.textPrimary} numberOfLines={1}>
          {label}
        </EcolnaText>
      </View>
    );
  }

  // Deux lignes réservées : « Premiers pas » et « Trois jours de suite » font
  // des tuiles de même hauteur.
  const twoLines = 2 * scaled(typography.labelSm.lineHeight, scale);
  return (
    <View
      // Jamais plus large que sa cellule : le nom passe sur deux lignes, jamais sur la voisine.
      style={[
        styles.tile,
        fill ? styles.fill : { width: Math.max(96, size + 24), maxWidth: '100%' },
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
    >
      <BadgeArt id={id} earned={earned} size={size} />
      <EcolnaText
        variant="labelSm"
        align="center"
        color={onDark ? colors.white : earned ? colors.textPrimary : colors.textSecondary}
        numberOfLines={2}
        style={fill ? { minHeight: twoLines } : undefined}
      >
        {label}
      </EcolnaText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', gap: spacing.xxs, paddingHorizontal: spacing.xxs, alignSelf: 'center' },
  fill: { width: '100%' },
  inline: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.pill },
});
