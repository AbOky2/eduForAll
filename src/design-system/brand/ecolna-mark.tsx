import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { EcolnaText } from '../primitives/ecolna-text';
import { colors, spacing } from '../tokens';
import { fr } from '@/localization/fr/strings';

/** Les pages du livre ouvert — mêmes tracés que assets/icons/ecolna-logo-source.svg. */
const LEFT_PAGE = 'M512 370C444 300 344 286 256 294L256 740C344 732 444 746 512 816Z';
const RIGHT_PAGE = 'M512 370C580 300 680 286 768 294L768 740C680 732 580 746 512 816Z';

/**
 * Le symbole ECOLNA (v4) : le livre ouvert de l'icône, sur le bleu de la
 * marque — page blanche à gauche, page soleil à droite. Une seule géométrie
 * pour l'icône d'app et l'interface.
 */
export const EcolnaMark = memo(function EcolnaMark({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Rect width={1024} height={1024} rx={236} fill={colors.brand} />
      <Path d={LEFT_PAGE} fill={colors.white} />
      <Path d={RIGHT_PAGE} fill={colors.reward} />
      <Path d="M512 370L512 816" stroke={colors.brand} strokeWidth={40} strokeLinecap="round" />
    </Svg>
  );
});

/** Le symbole et le nom, côte à côte — l'en-tête de l'accueil des nouveaux. */
export function EcolnaLogo({ size }: { size: number }) {
  return (
    <View style={styles.row} accessible accessibilityRole="header" accessibilityLabel={fr.common.appName}>
      <EcolnaMark size={size} />
      <EcolnaText variant="headlineMd" style={{ fontSize: Math.round(size * 0.56), lineHeight: size }}>
        {fr.common.appName}
      </EcolnaText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
