import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { fr } from '@/localization/fr/strings';
import { a11y, colors } from '../tokens';
import { EcolnaIcon } from '../icons/ecolna-icon';
import { EcolnaGalet } from './ecolna-galet';

type AudioButtonVariant = 'sand' | 'sky' | 'bordered';

interface EcolnaAudioButtonProps {
  onPress: () => void;
  size?: number;
  variant?: AudioButtonVariant;
  playing?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

/**
 * « Écouter » a une seule apparence dans toute l'app : un galet pétrole et
 * son haut-parleur. Les variantes ne changent que l'insistance :
 * - `sand`     le grand bouton d'un exercice (nom historique des maquettes) ;
 * - `sky`      un petit bouton posé à côté d'un mot ;
 * - `bordered` un galet blanc, pour une consigne qu'on peut réentendre.
 */
const VARIANTS: Record<
  AudioButtonVariant,
  { face: string; edge: string; ink: string; border?: string }
> = {
  sand: { face: colors.secondary, edge: colors.secondaryShade, ink: colors.onSecondary },
  sky: { face: colors.secondaryFixed, edge: colors.secondaryFixedDim, ink: colors.secondary },
  bordered: {
    face: colors.card,
    edge: colors.cardEdge,
    ink: colors.secondary,
    border: colors.cardEdge,
  },
};

/**
 * The always-recognizable "listen" button. While audio plays, a ring widens
 * and fades behind it — the one looping motion the app allows, and only
 * while the sound lasts (none at all under reduced motion). Replays on tap.
 */
export function EcolnaAudioButton({
  onPress,
  size: requestedSize = 72,
  variant = 'sand',
  playing = false,
  disabled = false,
  accessibilityLabel = fr.common.listen,
}: EcolnaAudioButtonProps) {
  // Jamais sous la cible tactile minimale, quelle que soit l'échelle demandée.
  const size = Math.max(a11y.minTouchTarget, requestedSize);
  const palette = VARIANTS[variant];
  const reducedMotion = useReducedMotion();
  const [wave] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (playing && !reducedMotion) {
      wave.setValue(0);
      const loop = Animated.loop(
        Animated.timing(wave, { toValue: 1, duration: 1100, useNativeDriver: true }),
      );
      loop.start();
      return () => loop.stop();
    }
    wave.setValue(0);
    return undefined;
  }, [playing, wave, reducedMotion]);

  const ringScale = wave.interpolate({ inputRange: [0, 1], outputRange: [1, 1.45] });
  const ringOpacity = wave.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.55, 0] });

  return (
    <View style={styles.wrap}>
      {playing && !reducedMotion ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: colors.secondaryFixedDim,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
      ) : null}
      <EcolnaGalet
        face={palette.face}
        edge={palette.edge}
        border={palette.border}
        radius={size / 2}
        depth={size >= 64 ? 'md' : 'sm'}
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={fr.common.listenHint}
        hitSlop={6}
        faceStyle={[styles.face, { width: size, height: size }]}
      >
        <EcolnaIcon name="speaker" size={Math.round(size * 0.56)} color={palette.ink} mode="mono" />
      </EcolnaGalet>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  ring: { position: 'absolute', top: 0, borderWidth: 6 },
  face: { alignItems: 'center', justifyContent: 'center' },
});
