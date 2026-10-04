import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { fr } from '@/localization/fr/strings';
import { a11y, colors, shadows } from '../tokens';
import { EcolnaIcon } from '../icons/ecolna-icon';
import { EcolnaGalet } from './ecolna-galet';

type AudioButtonVariant = 'sand' | 'sky' | 'bordered' | 'instruction';

interface EcolnaAudioButtonProps {
  onPress: () => void;
  size?: number;
  variant?: AudioButtonVariant;
  playing?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  /**
   * `speech` : la consigne (une bulle de parole — « ce qu'il faut faire ») ;
   * par défaut le haut-parleur, réservé au son à trouver (« ce qu'on cherche »).
   */
  icon?: 'speaker' | 'speech';
}

/**
 * « Écouter » a une seule apparence dans toute l'app : un galet pétrole et
 * son haut-parleur. Les variantes ne changent que l'insistance :
 * - `sand`     le grand bouton d'un exercice (nom historique des maquettes) ;
 * - `sky`      un petit bouton posé à côté d'un mot ;
 * - `bordered` un galet blanc, pour une consigne qu'on peut réentendre ;
 * - `instruction` la consigne d'un exercice, en tête : la bouée de qui ne lit
 *   pas encore — le contrôle le plus visible de l'en-tête après l'action.
 */
const VARIANTS: Record<
  AudioButtonVariant,
  {
    face: string;
    edge: string;
    ink: string;
    border?: string;
    borderWidth?: number;
    shadow?: ViewStyle;
    /** Part du diamètre occupée par le pictogramme (défaut 0,48). */
    iconRatio?: number;
  }
> = {
  // Le grand bouton d'un exercice : le disque plein de la marque.
  sand: { face: colors.brand, edge: colors.brand, ink: colors.white, shadow: shadows.glowBrand },
  // Posé à côté d'un mot : un disque bleuté.
  sky: { face: colors.brandTint, edge: colors.brandTint, ink: colors.brand },
  // Réentendre une consigne : un disque blanc fileté.
  bordered: {
    face: colors.white,
    edge: colors.border,
    ink: colors.brand,
    border: colors.border,
    shadow: shadows.card,
  },
  // La consigne en tête d'exercice : un disque bleu franc cerclé de la marque,
  // posé d'une ombre — il se voit au soleil (le filet brand fait 5,8:1 sur la
  // page) et passe avant « quitter » et « indice ».
  instruction: {
    face: colors.brandTintStrong,
    edge: colors.brand,
    ink: colors.brand,
    border: colors.brand,
    borderWidth: 2,
    shadow: shadows.card,
    iconRatio: 0.52,
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
  icon = 'speaker',
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
              borderColor: colors.brandTintStrong,
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
      ) : null}
      <EcolnaGalet
        face={palette.face}
        border={palette.border}
        borderWidth={palette.borderWidth ?? 1}
        shadow={palette.shadow}
        radius={size / 2}
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={fr.common.listenHint}
        hitSlop={6}
        faceStyle={[styles.face, { width: size, height: size }]}
      >
        <EcolnaIcon
          name={icon}
          size={Math.round(size * (palette.iconRatio ?? 0.48))}
          color={palette.ink}
          filled={icon === 'speech'}
        />
      </EcolnaGalet>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  ring: { position: 'absolute', top: 0, borderWidth: 6 },
  face: { alignItems: 'center', justifyContent: 'center' },
});
