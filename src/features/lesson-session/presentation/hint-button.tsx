import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '@/design-system/accessibility/use-reduced-motion';
import { EcolnaIconButton } from '@/design-system/primitives';
import { useResponsive } from '@/design-system/responsive';
import { colors, shadows } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

interface HintButtonProps {
  /** Offerte : après un premier essai manqué (hint-offer.ts). */
  visible: boolean;
  onPress: () => void;
  /** Le diamètre de la bouée de consigne : l'ampoule lui répond, à l'autre bout de la rangée. */
  diameter: number;
}

/**
 * L'ampoule d'indice, au bout de la rangée de consigne. Cachée, elle n'est
 * rien (la rangée garde sa place, pas elle) ; offerte, c'est la bonne action :
 * un disque soleil du diamètre de la bouée, porté par le halo doré des
 * actions soleil, qui arrive d'un ressort (0,9 → 1) et d'une seule
 * pulsation — ni ressort ni pulsation en mouvement réduit.
 */
export function HintButton({ visible, onPress, diameter }: HintButtonProps) {
  const { scale } = useResponsive();
  const reducedMotion = useReducedMotion();
  // 0,9 dès le départ : la première image de l'ampoule est déjà celle du ressort.
  const [pop] = useState(() => new Animated.Value(0.9));
  const [glow] = useState(() => new Animated.Value(0));
  const announced = useRef(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    if (reducedMotion) {
      pop.setValue(1);
      glow.setValue(0);
      return;
    }
    if (announced.current) {
      return;
    }
    announced.current = true;
    Animated.parallel([
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 9 }),
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 560, useNativeDriver: true }),
      ]),
    ]).start();
  }, [visible, reducedMotion, pop, glow]);

  if (!visible) {
    return null;
  }
  return (
    <Animated.View testID="hint-button" style={{ transform: [{ scale: pop }] }}>
      {/* Le halo doré des actions soleil, comme « Continuer » : elle se voit de loin. */}
      <View
        pointerEvents="none"
        style={[styles.disc, shadows.glowReward, { borderRadius: diameter / 2 }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.disc,
          shadows.glowReward,
          {
            borderRadius: diameter / 2,
            opacity: glow,
            transform: [
              { scale: glow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
            ],
          },
        ]}
      />
      <EcolnaIconButton
        icon="lightbulb"
        tone="sun"
        // La taille d'EcolnaIconButton se donne avant mise à l'échelle.
        size={diameter / scale}
        accessibilityLabel={fr.lesson.hint}
        onPress={onPress}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  disc: { ...StyleSheet.absoluteFill, backgroundColor: colors.reward },
});
