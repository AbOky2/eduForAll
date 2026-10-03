import { useEffect, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { colors, radius as radii } from '../tokens';

interface NudgeRingProps {
  /** Allume l'anneau. Remonter par `key` à chaque nouvel appui trop tôt. */
  active: boolean;
  children: ReactNode;
  /** Rayon de l'élément entouré (l'anneau ajoute son propre écart). */
  radius?: number;
  /** Ce que le lecteur d'écran dit quand l'anneau s'allume. */
  announcement?: string | null | undefined;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ce qui manque s'entoure d'un anneau ocre qui pulse deux fois (2 × 600 ms),
 * ou reste fixe deux secondes en mouvement réduit. Aucun rouge, aucune erreur,
 * aucun bouton grisé : un appui trop tôt montre où agir (brief v2 § 12.3).
 * L'ocre `tertiary` fait 6:1 sur le fond ivoire — un or clair s'y perdrait.
 */
export function NudgeRing({
  active,
  children,
  radius = radii.xl,
  announcement,
  style,
}: NudgeRingProps) {
  const reducedMotion = useReducedMotion();
  const [glow] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!active) {
      return undefined;
    }
    if (announcement) {
      AccessibilityInfo.announceForAccessibility(announcement);
    }
    const pulse = reducedMotion
      ? Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.delay(2000),
          Animated.timing(glow, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      : Animated.sequence(
          [0, 1].flatMap(() => [
            Animated.timing(glow, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(glow, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]),
        );
    pulse.start();
    return () => pulse.stop();
    // L'annonce suit l'allumage, pas chaque nouveau texte.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, glow, reducedMotion]);
  return (
    <View style={style}>
      {children}
      {active ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.ring, { opacity: glow, borderRadius: radius + 6 }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    top: -8,
    right: -8,
    bottom: -8,
    left: -8,
    borderWidth: 4,
    borderColor: colors.rewardInk,
  },
});
