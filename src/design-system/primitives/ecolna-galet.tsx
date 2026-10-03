import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type AccessibilityRole,
  type AccessibilityState,
  type Insets,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { depth as depthTokens, type DepthToken } from '../tokens/depth';
import { scaled, useResponsive } from '../responsive';

export interface EcolnaGaletProps {
  children: ReactNode;
  /** Couleur de la face. */
  face: string;
  /** Couleur de la tranche — le ton `shade` de la même famille. */
  edge: string;
  /** Liseré de la face (galets blancs sur fond clair). */
  border?: string | undefined;
  borderWidth?: number | undefined;
  radius: number;
  /** Hauteur de la tranche ; mise à l'échelle de la fenêtre. */
  depth?: DepthToken | number | undefined;
  onPress?: (() => void) | undefined;
  onPressIn?: (() => void) | undefined;
  disabled?: boolean | undefined;
  /** Garde la face enfoncée (choix posé, onglet actif). */
  pressedLook?: boolean | undefined;
  /** Style du conteneur (largeur, marges, flex). */
  style?: StyleProp<ViewStyle>;
  /** Style de la face (padding, disposition du contenu). */
  faceStyle?: StyleProp<ViewStyle>;
  /** Ombre portée, posée sous la tranche (ce qui flotte seulement). */
  shadow?: ViewStyle | undefined;
  accessibilityRole?: AccessibilityRole | undefined;
  accessibilityLabel?: string | undefined;
  accessibilityHint?: string | undefined;
  accessibilityState?: AccessibilityState | undefined;
  hitSlop?: number | Insets | undefined;
  testID?: string | undefined;
}

/**
 * Le galet (direction v3 § 2) : une face posée sur sa tranche. Appuyer
 * enfonce la face de toute la hauteur de la tranche, qu'elle recouvre alors —
 * l'objet a l'air physique, et l'enfant voit qu'il a agi en moins d'une image.
 *
 * Seule une transformation bouge : ni la hauteur du galet ni ses voisins ne
 * changent à l'appui. Sans `onPress`, le galet est un simple objet posé (une
 * carte qu'on regarde), sans rôle de bouton.
 */
export function EcolnaGalet({
  children,
  face,
  edge,
  border,
  borderWidth = 2,
  radius,
  depth = 'md',
  onPress,
  onPressIn,
  disabled = false,
  pressedLook = false,
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
  const { scale } = useResponsive();
  const lift = scaled(typeof depth === 'number' ? depth : depthTokens[depth], scale);
  // Android empile par `elevation` avant l'ordre des enfants : une tranche
  // ombrée passerait devant sa face. La face reçoit la même élévation, sans
  // ombre propre, et reste dessus.
  const elevation = shadow?.elevation ?? 0;
  const faceLayer = elevation > 0 ? { elevation, shadowColor: 'transparent' } : null;

  const layers = (pressed: boolean) => {
    const sunk = pressedLook || (pressed && !disabled);
    return (
      <>
        <View
          style={[styles.edge, { top: lift, borderRadius: radius, backgroundColor: edge }, shadow]}
        />
        <View
          style={[
            styles.face,
            {
              borderRadius: radius,
              backgroundColor: face,
              borderColor: border,
              borderWidth: border ? borderWidth : 0,
              transform: [{ translateY: sunk ? lift : 0 }],
            },
            faceLayer,
            faceStyle,
          ]}
        >
          {children}
        </View>
      </>
    );
  };

  if (!onPress) {
    return (
      <View
        style={[{ paddingBottom: lift }, style]}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        {layers(false)}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole={accessibilityRole ?? 'button'}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, ...accessibilityState }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={onPressIn}
      hitSlop={hitSlop}
      testID={testID}
      style={[{ paddingBottom: lift }, style]}
    >
      {({ pressed }) => layers(pressed)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  edge: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  // La face remplit le galet dans les deux axes : une carte en ligne ou une
  // tuile de grille à hauteur imposée ne laisse jamais dépasser sa tranche.
  face: { flexGrow: 1 },
});
