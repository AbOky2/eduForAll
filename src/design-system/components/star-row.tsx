import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { EcolnaIcon } from '../icons/ecolna-icon';
import { colors, spacing } from '../tokens';

interface StarRowProps {
  earned: number;
  total?: number;
  size?: number;
  /** Les étoiles gagnées éclosent l'une après l'autre (écran de réussite). */
  celebrate?: boolean;
}

/** Une étoile qui éclôt : 0 → 1 en ressort, après `delay`. */
function PoppingStar({
  earned,
  size,
  delay,
  animate,
}: {
  earned: boolean;
  size: number;
  delay: number;
  animate: boolean;
}) {
  const [grow] = useState(() => new Animated.Value(animate ? 0 : 1));
  useEffect(() => {
    if (!animate) {
      grow.setValue(1);
      return undefined;
    }
    const timer = setTimeout(() => {
      Animated.spring(grow, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 12 }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [animate, delay, grow]);
  return (
    <Animated.View style={{ transform: [{ scale: grow }] }}>
      <EcolnaIcon
        name={earned ? 'star' : 'star-outline'}
        size={size}
        mode={earned ? 'color' : 'mono'}
        color={colors.starInactive}
      />
    </Animated.View>
  );
}

/**
 * Result stars (mockup S16): earned gold with their highlight, remaining
 * outlined — never red. The middle star stands taller. On the result screen
 * the earned ones hatch one after the other (≤ 1 s in all), unless the
 * system asks for reduced motion.
 */
export function StarRow({ earned, total = 3, size = 44, celebrate = false }: StarRowProps) {
  const reducedMotion = useReducedMotion();
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${earned} étoile${earned > 1 ? 's' : ''} sur ${total}`}
      style={styles.row}
    >
      {Array.from({ length: total }, (_, index) => (
        <View key={index} style={index === 1 ? styles.middle : undefined}>
          <PoppingStar
            earned={index < earned}
            size={Math.round(index === 1 ? size * 1.35 : size)}
            delay={250 + index * 220}
            animate={celebrate && !reducedMotion && index < earned}
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
