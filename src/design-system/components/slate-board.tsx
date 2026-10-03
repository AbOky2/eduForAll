import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows } from '../tokens';

interface SlateBoardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * L'ardoise de l'écolier (v4) : un panneau aux coins doux dans la nuit de
 * l'app (aucune cinquième teinte sombre), posé sur une ombre — ni cadre de
 * bois, ni tranche. On y écrit à la craie, le geste de la classe.
 */
export function SlateBoard({ children, style }: SlateBoardProps) {
  return (
    <View style={[styles.board, shadows.card, style]}>
      <View style={styles.face}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { borderRadius: radius.xxl, backgroundColor: colors.night },
  face: { flex: 1, borderRadius: radius.xxl, overflow: 'hidden', borderCurve: 'continuous' },
});
