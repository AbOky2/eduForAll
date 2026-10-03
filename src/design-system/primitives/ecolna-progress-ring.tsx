import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../tokens';

interface EcolnaProgressRingProps {
  /** 0..1 */
  progress: number;
  /** Diamètre extérieur en dp. */
  size: number;
  /** Épaisseur de l'anneau en dp. */
  stroke: number;
  color: string;
  track?: string;
  /** Ce qui se pose au centre (icône, chiffre). */
  children?: ReactNode;
  accessibilityLabel?: string;
}

/**
 * L'anneau de progression (tuiles de discipline, objectif du jour) : un arc
 * aux bouts ronds qui part de midi. Plein, il passe au soleil — la boucle est
 * bouclée. Rien n'est dessiné sous 1 % : un anneau vide reste une piste nette.
 */
export function EcolnaProgressRing({
  progress,
  size,
  stroke,
  color,
  track = colors.fill,
  children,
  accessibilityLabel,
}: EcolnaProgressRingProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const complete = clamped >= 1;
  return (
    <View
      style={{ width: size, height: size }}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        {clamped > 0.01 ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={complete ? colors.reward : color}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - clamped)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
      </Svg>
      {children ? <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
