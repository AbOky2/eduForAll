import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { colors, shadows } from '../tokens';
import { AlifaIcon } from '../icons/alifa-icon';

type AudioButtonVariant = 'sand' | 'sky' | 'bordered';

interface AlifaAudioButtonProps {
  onPress: () => void;
  size?: number;
  variant?: AudioButtonVariant;
  playing?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

const VARIANTS: Record<AudioButtonVariant, { background: string; icon: string; border?: string }> = {
  // Big sand circle of the exercise screens (mockups S11, S12, S14).
  sand: { background: colors.primaryContainer, icon: colors.onPrimaryContainer },
  // Small sky-blue circle next to the greeting (mockup S06).
  sky: { background: colors.secondaryContainer, icon: colors.onSecondaryContainer },
  // White circle with a blue ring (mockup S10).
  bordered: { background: colors.card, icon: colors.secondary, border: colors.secondary },
};

/**
 * The always-recognizable "listen" button. Pulses gently while audio plays
 * (unless the OS asks for reduced motion). Replays on every tap.
 */
export function AlifaAudioButton({
  onPress,
  size = 72,
  variant = 'sand',
  playing = false,
  disabled = false,
  accessibilityLabel = 'Écouter',
}: AlifaAudioButtonProps) {
  const palette = VARIANTS[variant];
  const reducedMotion = useReducedMotion();
  const [pulse] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (playing && !reducedMotion) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.08, duration: 420, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 420, useNativeDriver: true }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(1);
    return undefined;
  }, [playing, pulse, reducedMotion]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Fait écouter le son"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: disabled ? 0.4 : pressed ? 0.85 : 1 })}
    >
      <Animated.View
        style={[
          styles.circle,
          shadows.card,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: palette.background,
            borderWidth: palette.border ? 2.5 : 0,
            borderColor: palette.border,
            transform: [{ scale: pulse }],
          },
        ]}
      >
        <AlifaIcon name="speaker" size={size * 0.45} color={palette.icon} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
