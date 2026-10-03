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
  /** Couleur du contour d'une étoile à gagner (défaut : gris ; sur la nuit, un blanc voilé). */
  inactiveColor?: string;
  /** Sur la nuit : l'étoile gagnée se passe de liseré (le soleil y est à 8,4:1). */
  onDark?: boolean;
  /** Écart entre les étoiles (défaut : spacing.md). */
  gap?: number;
  /** En ligne, trois étoiles égales (listes, parcours) — sans l'étoile du milieu en majesté. */
  flat?: boolean;
}

/** Une étoile qui éclôt : 0 → 1 en ressort, après `delay`. */
function PoppingStar({
  earned,
  size,
  delay,
  animate,
  inactiveColor,
  onDark,
}: {
  earned: boolean;
  size: number;
  delay: number;
  animate: boolean;
  inactiveColor: string;
  onDark: boolean;
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
      {earned ? (
        <>
          <EcolnaIcon name="star" filled size={size} color={colors.reward} />
          {/* Un liseré ambre : l'étoile garde son bord sur blanc, même en plein soleil. */}
          {onDark ? null : (
            <View pointerEvents="none" style={StyleSheet.absoluteFill}>
              <EcolnaIcon name="star-outline" size={size} color={colors.rewardDeep} />
            </View>
          )}
        </>
      ) : (
        // À gagner : un contour, pas un aplat — la forme dit « pas encore ».
        <EcolnaIcon name="star-outline" size={size} color={inactiveColor} />
      )}
    </Animated.View>
  );
}

/**
 * Les étoiles d'une leçon (v4) : pleines et plates, au liseré ambre, pour les
 * gagnées ; un simple contour pour celles qui restent — la forme, pas
 * seulement la teinte, sépare 1 étoile de 3. Jamais de rouge, jamais de reflet.
 * L'étoile du milieu est plus grande et plus haute. Sur l'écran de réussite,
 * les gagnées éclosent l'une après l'autre (≤ 1 s en tout), sauf si le
 * système demande moins de mouvement.
 */
export function StarRow({
  earned,
  total = 3,
  size = 44,
  celebrate = false,
  inactiveColor = colors.starInactive,
  onDark = false,
  gap = spacing.md,
  flat = false,
}: StarRowProps) {
  const reducedMotion = useReducedMotion();
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={fr.a11y.stars(earned, total)}
      style={[styles.row, { gap }]}
    >
      {Array.from({ length: total }, (_, index) => (
        <View key={index} style={index === 1 && !flat ? styles.middle : undefined}>
          <PoppingStar
            earned={index < earned}
            size={Math.round(index === 1 && !flat ? size * 1.35 : size)}
            delay={250 + index * 220}
            animate={celebrate && !reducedMotion && index < earned}
            inactiveColor={inactiveColor}
            onDark={onDark}
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
  },
  middle: { marginBottom: spacing.sm },
});
