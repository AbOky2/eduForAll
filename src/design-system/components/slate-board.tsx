import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { illustration, radius, shadows } from '../tokens';

const { slate } = illustration.school;

interface SlateBoardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * L'ardoise de l'écolier (v4) : un panneau d'ardoise mat aux coins doux, posé
 * sur une ombre — ni cadre de bois, ni tranche. On y écrit à la craie, le
 * geste de la classe.
 */
export function SlateBoard({ children, style }: SlateBoardProps) {
  return (
    <View style={[styles.board, shadows.card, style]}>
      <View style={styles.face}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: { borderRadius: radius.xxl, backgroundColor: slate.base },
  face: { flex: 1, borderRadius: radius.xxl, overflow: 'hidden', borderCurve: 'continuous' },
});
