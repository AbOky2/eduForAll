import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../tokens';

interface AlifaProgressBarProps {
  /** 0..1 */
  progress: number;
  /** Sand on sky-blue track — the lesson header bar (mockup S12). */
  tone?: 'sand' | 'brown' | 'blue';
  height?: number;
  accessibilityLabel?: string;
}

const TONES = {
  sand: { fill: colors.primaryContainer, track: colors.secondaryFixed },
  brown: { fill: colors.primary, track: colors.surfaceContainerHigh },
  blue: { fill: colors.secondary, track: colors.surfaceContainerHigh },
} as const;

export function AlifaProgressBar({
  progress,
  tone = 'sand',
  height = 10,
  accessibilityLabel = 'Progression',
}: AlifaProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));
  const palette = TONES[tone];
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height, borderRadius: height / 2, backgroundColor: palette.track }]}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: palette.fill,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden', borderRadius: radius.pill },
});
