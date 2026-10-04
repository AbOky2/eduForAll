import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { EcolnaIcon } from '../icons/ecolna-icon';
import { colors, spacing } from '../tokens';
import { fr } from '@/localization/fr/strings';

/** L'étoile du milieu est en majesté : 1,35 fois plus grande, et relevée. */
export const STAR_MIDDLE_RATIO = 1.35;

/**
 * Le rythme de l'éclosion (écran de réussite), en ms : la première étoile
 * part à `start`, les suivantes toutes les `stagger` ; chacune monte à 1,15
 * en `rise`, puis se pose à 1 sur un ressort.
 */
export const STAR_CELEBRATION = { start: 150, stagger: 180, rise: 220 } as const;

/** Le moment où l'étoile `index` commence d'éclore. */
export function starPopDelay(index: number): number {
  return STAR_CELEBRATION.start + index * STAR_CELEBRATION.stagger;
}

/**
 * Le moment où la dernière des `total` étoiles atteint son sommet : ce qui
 * suit (le texte, les médailles) entre à partir de là, jamais avant.
 */
export function starsPeakAt(total = 3): number {
  return starPopDelay(Math.max(0, total - 1)) + STAR_CELEBRATION.rise;
}

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

/**
 * Une étoile qui éclôt après `delay` : gagnée, elle monte de 0 à 1,15 puis se
 * pose à 1 sur un ressort ; à gagner, son contour paraît simplement, à son
 * tour — le manque ne se montre pas avant la fête.
 */
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
    const entrance = earned
      ? Animated.sequence([
          Animated.delay(delay),
          Animated.timing(grow, {
            toValue: 1.15,
            duration: STAR_CELEBRATION.rise,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(grow, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 8 }),
        ])
      : Animated.timing(grow, {
          toValue: 1,
          delay,
          duration: STAR_CELEBRATION.rise,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        });
    entrance.start();
    return () => entrance.stop();
  }, [animate, delay, earned, grow]);
  return (
    <Animated.View
      style={
        earned
          ? { transform: [{ scale: grow }] }
          : { opacity: grow, transform: [{ scale: grow.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }
      }
    >
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
 * elles éclosent l'une après l'autre (`STAR_CELEBRATION`, moins d'une
 * seconde en tout), sauf si le système demande moins de mouvement.
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
      {Array.from({ length: total }, (_, index) => {
        const majesty = index === 1 && !flat;
        return (
          <View
            key={index}
            // L'étoile du milieu se relève d'un huitième de sa taille.
            style={majesty ? { marginBottom: Math.max(spacing.sm, Math.round(size / 8)) } : undefined}
          >
            <PoppingStar
              earned={index < earned}
              size={Math.round(majesty ? size * STAR_MIDDLE_RATIO : size)}
              delay={starPopDelay(index)}
              animate={celebrate && !reducedMotion}
              inactiveColor={inactiveColor}
              onDark={onDark}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
