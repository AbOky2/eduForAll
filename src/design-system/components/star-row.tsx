import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { EcolnaIcon } from '../icons/ecolna-icon';
import { colors, spacing } from '../tokens';
import { fr } from '@/localization/fr/strings';

interface StarRowProps {
  earned: number;
  total?: number;
  size?: number;
  /** Les étoiles gagnées éclosent l'une après l'autre (écran de réussite). */
  celebrate?: boolean;
  /** Couleur d'une étoile à gagner (défaut : gris clair ; sur la nuit, un blanc voilé). */
  inactiveColor?: string;
}

/** Une étoile qui éclôt : 0 → 1 en ressort, après `delay`. */
function PoppingStar({
  earned,
  size,
  delay,
  animate,
  inactiveColor,
}: {
  earned: boolean;
  size: number;
  delay: number;
  animate: boolean;
  inactiveColor: string;
}) {
  const [grow] = useState(() => new Animated.Value(animate ? 0 : 1));
  useEffect(() => {
    if (!animate) {
      grow.setValue(1);
      return undefined;
    }
    const timer = setTimeout(() => {
      Animated.spring(grow, {
        toValue: 1,
        useNativeDriver: true,
        speed: 14,
        bounciness: 12,
      }).start();
    }, delay);
    return () => clearTimeout(timer);
  }, [animate, delay, grow]);
  return (
    <Animated.View style={{ transform: [{ scale: grow }] }}>
      <EcolnaIcon name="star" filled size={size} color={earned ? colors.reward : inactiveColor} />
    </Animated.View>
  );
}

/**
 * Les étoiles d'une leçon (v4) : pleines et plates — soleil pour les gagnées,
 * gris clair pour celles qui restent, jamais de rouge, jamais de reflet.
 * L'étoile du milieu est plus grande et plus haute. Sur l'écran de réussite,
 * les gagnées éclosent l'une après l'autre (≤ 1 s en tout), sauf si le
 * système demande moins de mouvement.
 */
export function StarRow({
  earned,
  total = 3,
  size = 44,
  celebrate = false,
  inactiveColor = colors.fillStrong,
}: StarRowProps) {
  const reducedMotion = useReducedMotion();
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={fr.a11y.stars(earned, total)}
      style={styles.row}
    >
      {Array.from({ length: total }, (_, index) => (
        <View key={index} style={index === 1 ? styles.middle : undefined}>
          <PoppingStar
            earned={index < earned}
            size={Math.round(index === 1 ? size * 1.35 : size)}
            delay={250 + index * 220}
            animate={celebrate && !reducedMotion && index < earned}
            inactiveColor={inactiveColor}
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
