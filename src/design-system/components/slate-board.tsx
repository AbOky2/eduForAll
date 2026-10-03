import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { scaled, useResponsive } from '../responsive';
import { illustration, radius } from '../tokens';

const { wood, slate } = illustration.school;

interface SlateBoardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * L'ardoise de l'écolier (direction v3) : un cadre de bois posé sur sa
 * tranche, une face d'ardoise mate. On y écrit à la craie — le seul geste fait
 * main de toute l'identité (brief v2 § 4.4), le même que la boucle du logo.
 */
export function SlateBoard({ children, style }: SlateBoardProps) {
  const { scale } = useResponsive();
  const frame = scaled(14, scale);
  const lip = scaled(6, scale);
  return (
    <View style={[{ paddingBottom: lip }, style]}>
      <View style={[styles.lip, { top: lip, borderRadius: radius.xl + 4, backgroundColor: wood.shade }]} />
      <View
        style={[
          styles.frame,
          { padding: frame, borderRadius: radius.xl + 4, backgroundColor: wood.base },
        ]}
      >
        <View style={[styles.face, { borderRadius: radius.lg, backgroundColor: slate.base }]}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lip: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  frame: { flex: 1 },
  face: { flex: 1, overflow: 'hidden' },
});
