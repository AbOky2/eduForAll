import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../tokens';
import { scaled, useResponsive } from '../responsive';

type ProgressTone = 'sun' | 'sand' | 'brown' | 'blue' | 'green';

interface EcolnaProgressBarProps {
  /** 0..1 */
  progress: number;
  /** Famille du remplissage ; `fill` l'emporte (couleur de discipline). */
  tone?: ProgressTone;
  fill?: string | undefined;
  /** Piste ; défaut sable, `onColor` pour une barre posée sur une couleur. */
  track?: string | undefined;
  /** Épaisseur en dp avant mise à l'échelle (défaut 12). */
  height?: number;
  accessibilityLabel?: string;
}

const TONES: Record<ProgressTone, string> = {
  sun: colors.sun,
  sand: colors.primaryContainer,
  brown: colors.primary,
  blue: colors.secondary,
  green: colors.feedbackCorrect,
};

/**
 * Barre de progression « bonbon » : une piste sable creusée, un remplissage
 * plein avec un reflet sur son tiers haut. Toujours au moins une pastille
 * visible dès que la progression n'est pas nulle — un enfant qui a fait une
 * chose doit la voir.
 */
export function EcolnaProgressBar({
  progress,
  tone = 'sun',
  fill,
  track = colors.surfaceContainerHigh,
  height = 12,
  accessibilityLabel = 'Progression',
}: EcolnaProgressBarProps) {
  const { scale } = useResponsive();
  const thickness = scaled(height, scale);
  const clamped = Math.min(1, Math.max(0, progress));
  const color = fill ?? TONES[tone];
  const shine = Math.max(2, Math.round(thickness * 0.24));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, { height: thickness, borderRadius: thickness / 2, backgroundColor: track }]}
    >
      {clamped > 0 ? (
        <View
          style={{
            width: `${clamped * 100}%`,
            minWidth: thickness,
            height: thickness,
            borderRadius: thickness / 2,
            backgroundColor: color,
          }}
        >
          <View
            style={[
              styles.shine,
              {
                top: Math.round(thickness * 0.2),
                left: thickness / 2,
                right: thickness / 2,
                height: shine,
                borderRadius: shine / 2,
              },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden', borderRadius: radius.pill },
  shine: { position: 'absolute', backgroundColor: colors.highlight },
});
