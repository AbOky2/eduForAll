import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { EcolnaIcon, type IconMode, type IconName } from '../icons/ecolna-icon';
import { colors, shadows } from '../tokens';
import { scaled, useResponsive } from '../responsive';
import { EcolnaGalet } from './ecolna-galet';

type IconButtonTone = 'white' | 'sun' | 'petrol' | 'quiet';

interface EcolnaIconButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  /** Diamètre de la face en dp avant mise à l'échelle (défaut 52). */
  size?: number;
  tone?: IconButtonTone;
  /** Mode du pictogramme (palier M) ; défaut `mono` sauf `sun`/`petrol`. */
  iconMode?: IconMode;
  accessibilityHint?: string | undefined;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const TONES: Record<IconButtonTone, { face: string; ink: string; border?: string; shadow?: ViewStyle }> = {
  // Le bouton d'icône courant : un disque blanc fileté, posé avec une ombre douce.
  white: { face: colors.white, ink: colors.ink, border: colors.border, shadow: shadows.card },
  sun: { face: colors.reward, ink: colors.onReward },
  petrol: { face: colors.brand, ink: colors.white },
  // Sur une surface déjà claire : un disque neutre, sans ombre.
  quiet: { face: colors.fill, ink: colors.ink },
};

/**
 * Un disque qui porte une seule icône : fermer, retour, indice, écouter.
 * Toujours au moins 48 dp ; l'icône occupe 46 % du disque.
 */
export function EcolnaIconButton({
  icon,
  accessibilityLabel,
  onPress,
  size = 52,
  tone = 'white',
  iconMode = 'mono',
  accessibilityHint,
  disabled = false,
  style,
}: EcolnaIconButtonProps) {
  const { scale } = useResponsive();
  const diameter = Math.max(48, scaled(size, scale));
  const palette = TONES[tone];
  return (
    <EcolnaGalet
      face={palette.face}
      border={palette.border}
      borderWidth={1}
      shadow={palette.shadow}
      radius={diameter / 2}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      hitSlop={6}
      // Un bouton rond ne s'étire jamais dans une colonne.
      style={[styles.self, style]}
      faceStyle={[styles.face, { width: diameter, height: diameter }]}
    >
      <EcolnaIcon
        name={icon}
        size={Math.round(diameter * 0.46)}
        // En mode couleur, l'icône garde la couleur de son sens (ampoule soleil…).
        color={iconMode === 'mono' ? palette.ink : undefined}
        mode={iconMode}
      />
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  self: { alignSelf: 'flex-start' },
  face: { alignItems: 'center', justifyContent: 'center' },
});
