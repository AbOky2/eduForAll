import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { colors, radius } from '../tokens';
import { scaled, useResponsive } from '../responsive';

type ProgressTone = 'sun' | 'sand' | 'brown' | 'blue' | 'green';

interface EcolnaProgressBarProps {
  /** 0..1 */
  progress: number;
  /** Famille du remplissage ; `fill` l'emporte (couleur de discipline). */
  tone?: ProgressTone;
  fill?: string | undefined;
  /** Piste ; défaut `fill` neutre, une teinte claire sur une surface colorée. */
  track?: string | undefined;
  /** Épaisseur en dp avant mise à l'échelle (défaut 10). */
  height?: number;
  accessibilityLabel?: string;
}

const TONES: Record<ProgressTone, string> = {
  sun: colors.reward,
  sand: colors.reward,
  brown: colors.brand,
  blue: colors.brand,
  green: colors.success,
};

/**
 * Barre de progression v4 : une piste neutre franche, un remplissage plein,
 * sans reflet. La valeur glisse jusqu'à sa place sur un ressort (aussitôt en
 * mouvement réduit). Dès qu'il y a du progrès, au moins une pastille ronde
 * est visible : un enfant qui a fait une chose doit la voir.
 */
export function EcolnaProgressBar({
  progress,
  tone = 'sun',
  fill,
  track = colors.fill,
  height = 10,
  accessibilityLabel = 'Progression',
}: EcolnaProgressBarProps) {
  const { scale } = useResponsive();
  const reducedMotion = useReducedMotion();
  const thickness = scaled(height, scale);
  const clamped = Math.min(1, Math.max(0, progress));
  const color = fill ?? TONES[tone];
  const [value] = useState(() => new Animated.Value(clamped));

  useEffect(() => {
    if (reducedMotion) {
      value.setValue(clamped);
      return;
    }
    Animated.spring(value, { toValue: clamped, speed: 10, bounciness: 2, useNativeDriver: false }).start();
  }, [clamped, reducedMotion, value]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height: thickness, borderRadius: thickness / 2, backgroundColor: track }]}
    >
      {clamped > 0 ? (
        <Animated.View
          style={{
            width: value.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'], extrapolate: 'clamp' }),
            minWidth: thickness,
            height: thickness,
            borderRadius: thickness / 2,
            backgroundColor: color,
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden', borderRadius: radius.pill },
});
