import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { colors } from '../tokens';
import { scaled, useResponsive } from '../responsive';

interface EcolnaSegmentedProgressProps {
  /** Nombre d'étapes (exercices de la leçon). */
  total: number;
  /** Étapes terminées. */
  done: number;
  /** Couleur des segments faits (la discipline). */
  fill: string;
  /** Épaisseur en dp avant mise à l'échelle (défaut 10). */
  height?: number;
  accessibilityLabel: string;
}

/** Le segment de l'étape en cours : il se remplit à moitié, sur un ressort. */
function CurrentSegment({ fill, thickness }: { fill: string; thickness: number }) {
  const reducedMotion = useReducedMotion();
  const [grow] = useState(() => new Animated.Value(reducedMotion ? 1 : 0));
  useEffect(() => {
    if (reducedMotion) {
      grow.setValue(1);
      return;
    }
    Animated.spring(grow, { toValue: 1, speed: 8, bounciness: 4, useNativeDriver: false }).start();
  }, [grow, reducedMotion]);
  return (
    <View style={[styles.segment, { height: thickness, borderRadius: thickness / 2, backgroundColor: colors.track }]}>
      <Animated.View
        style={{
          width: grow.interpolate({ inputRange: [0, 1], outputRange: ['0%', '50%'] }),
          minWidth: thickness,
          height: thickness,
          borderRadius: thickness / 2,
          backgroundColor: fill,
        }}
      />
    </View>
  );
}

/**
 * La progression d'une leçon : un segment par exercice, comme les pas d'un
 * chemin. Faits : pleins, dans la couleur de la discipline ; en cours : à
 * moitié plein, dans la même couleur, sans transparence ; à venir : la piste
 * neutre, assez soutenue pour se voir au soleil. L'enfant voit combien il en reste
 * sans lire un nombre.
 */
export function EcolnaSegmentedProgress({
  total,
  done,
  fill,
  height = 10,
  accessibilityLabel,
}: EcolnaSegmentedProgressProps) {
  const { scale } = useResponsive();
  const thickness = scaled(height, scale);
  const gap = Math.max(4, Math.round(thickness * 0.5));
  const count = Math.max(1, total);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: count, now: Math.min(done, count) }}
      style={[styles.row, { gap }]}
    >
      {Array.from({ length: count }, (_, index) =>
        index < done ? (
          <View
            key={index}
            style={[styles.segment, { height: thickness, borderRadius: thickness / 2, backgroundColor: fill }]}
          />
        ) : index === done ? (
          <CurrentSegment key={`current-${index}`} fill={fill} thickness={thickness} />
        ) : (
          <View
            key={index}
            style={[styles.segment, { height: thickness, borderRadius: thickness / 2, backgroundColor: colors.track }]}
          />
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', width: '100%' },
  segment: { flex: 1, overflow: 'hidden' },
});
