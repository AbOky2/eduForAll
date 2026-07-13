import { StyleSheet, View } from 'react-native';

import { AlifaIcon } from '../icons/alifa-icon';
import { colors, spacing } from '../tokens';

interface StarRowProps {
  earned: number;
  total?: number;
  size?: number;
}

/** Result stars (mockup S16): earned gold, remaining outlined — never red. */
export function StarRow({ earned, total = 3, size = 44 }: StarRowProps) {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${earned} étoile${earned > 1 ? 's' : ''} sur ${total}`}
      style={styles.row}
    >
      {Array.from({ length: total }, (_, index) => (
        <View key={index} style={index === 1 ? styles.middle : undefined}>
          <AlifaIcon
            name={index < earned ? 'star' : 'star-outline'}
            size={index === 1 ? size * 1.35 : size}
            color={index < earned ? colors.starActive : colors.starInactive}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.md,
  },
  middle: { marginBottom: spacing.sm },
});
