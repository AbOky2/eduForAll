import { StyleSheet, View } from 'react-native';

import { AlifaIcon, type IconName } from '../icons/alifa-icon';
import { AlifaText } from '../primitives';
import { colors, radius, spacing } from '../tokens';

interface BadgeTileProps {
  icon: IconName;
  label: string;
  description: string;
  earned: boolean;
  tint: string;
  container: string;
  /** Ajouté à la description quand le badge n'est pas gagné. */
  lockedHint: string;
  size?: number | undefined;
}

/**
 * Une pastille de badge. Verrouillée, elle garde son nom et ce qu'il faut
 * faire pour l'obtenir : un badge est un objectif, jamais une boîte mystère.
 */
export function BadgeTile({
  icon,
  label,
  description,
  earned,
  tint,
  container,
  lockedHint,
  size = 64,
}: BadgeTileProps) {
  return (
    <View
      style={styles.tile}
      accessibilityRole="image"
      accessibilityLabel={`${label}. ${earned ? description : `${description} ${lockedHint}`}`}
    >
      <View
        style={[
          styles.disc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: earned ? container : colors.lockedContainer,
          },
        ]}
      >
        <AlifaIcon
          name={earned ? icon : 'lock'}
          size={Math.round(size * 0.45)}
          color={earned ? tint : colors.locked}
          filled={earned}
        />
      </View>
      <AlifaText variant="labelSm" align="center" color={earned ? colors.textPrimary : colors.locked}>
        {label}
      </AlifaText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: 'center', gap: spacing.xs, width: 96 },
  disc: { alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
});
