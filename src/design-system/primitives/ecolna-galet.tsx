import { useState, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  type AccessibilityRole,
  type AccessibilityState,
  type Insets,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { useReducedMotion } from '../accessibility/use-reduced-motion';

export type HapticKind = 'selection' | 'light' | 'none';

export interface EcolnaGaletProps {
  children: ReactNode;
  /** Couleur de la surface. */
  face: string;
  /** Filet de la surface (cartes blanches sur fond clair). */
  border?: string | undefined;
  borderWidth?: number | undefined;
  radius: number;
  onPress?: (() => void) | undefined;
  onPressIn?: (() => void) | undefined;
  disabled?: boolean | undefined;
  /** Choix posé : la surface ne rebondit plus (l'état se lit dans ses couleurs). */
  pressedLook?: boolean | undefined;
  /** Retour tactile à l'appui (défaut : `selection` pour ce qui se touche). */
  haptic?: HapticKind | undefined;
  /** Style du conteneur (largeur, marges, flex). */
  style?: StyleProp<ViewStyle>;
  /** Style de la surface (padding, disposition du contenu). */
  faceStyle?: StyleProp<ViewStyle>;
  /** Ombre de la surface (`shadows.card` / `raised` / `floating`). */
  shadow?: ViewStyle | undefined;
  accessibilityRole?: AccessibilityRole | undefined;
  accessibilityLabel?: string | undefined;
  accessibilityHint?: string | undefined;
  accessibilityState?: AccessibilityState | undefined;
  hitSlop?: number | Insets | undefined;
  testID?: string | undefined;
}

/** Ressort de l'appui : vif à l'enfoncement, souple au relâché. */
const PRESS_IN = { toValue: 0.96, speed: 40, bounciness: 0, useNativeDriver: true } as const;
const PRESS_OUT = { toValue: 1, speed: 18, bounciness: 9, useNativeDriver: true } as const;

export function triggerHaptic(kind: HapticKind): void {
  if (kind === 'selection') {
    Haptics.selectionAsync().catch(() => undefined);
  } else if (kind === 'light') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }
}

/**
 * La surface v4 « Épure » — tout ce qui se pose ou se touche : une face plate,
 * un filet, une ombre douce. Ce qui se touche le dit par le mouvement, pas par
 * une épaisseur dessinée : à l'appui, la surface s'enfonce (ressort à 0,96) et
 * l'appareil répond d'un léger retour haptique. Sans `onPress`, c'est un
 * simple objet posé, sans rôle de bouton.
 *
 * (Le nom `EcolnaGalet` reste pour les écrans v3 ; `EcolnaSurface` est l'alias v4.)
 */
export function EcolnaGalet({
  children,
  face,
  border,
  borderWidth = 1.5,
  radius,
  onPress,
  onPressIn,
  disabled = false,
  pressedLook = false,
  haptic = 'selection',
  style,
  faceStyle,
  shadow,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  hitSlop,
  testID,
}: EcolnaGaletProps) {
  const reducedMotion = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(1));

  const surface = [
    styles.face,
    {
      borderRadius: radius,
      backgroundColor: face,
      borderColor: border,
      borderWidth: border ? borderWidth : 0,
    },
    shadow,
    faceStyle,
  ];

  if (!onPress) {
    return (
      <Animated.View
        style={[surface, style]}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        {children}
      </Animated.View>
    );
  }

  const animate = !reducedMotion && !pressedLook && !disabled;
  return (
    <Pressable
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, ...accessibilityState }}
      disabled={disabled}
      onPress={() => {
        triggerHaptic(haptic);
        onPress();
      }}
      onPressIn={() => {
        if (animate) {
          Animated.spring(scale, PRESS_IN).start();
        }
        onPressIn?.();
      }}
      onPressOut={() => {
        if (animate) {
          Animated.spring(scale, PRESS_OUT).start();
        }
      }}
      hitSlop={hitSlop}
      testID={testID}
      style={style}
    >
      <Animated.View style={[surface, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

export const EcolnaSurface = EcolnaGalet;

const styles = StyleSheet.create({
  // La surface remplit son conteneur : une carte en ligne ou une tuile de
  // grille à hauteur imposée ne laisse jamais d'écart.
  face: { flexGrow: 1, borderCurve: 'continuous' },
});
