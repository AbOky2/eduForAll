import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { EcolnaIcon, type IconMode, type IconName } from '../icons/ecolna-icon';
import { colors } from '../tokens';
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

const TONES: Record<IconButtonTone, { face: string; edge: string; ink: string; border?: string }> = {
  white: { face: colors.card, edge: colors.cardEdge, ink: colors.onSurfaceVariant, border: colors.cardEdge },
  sun: { face: colors.sun, edge: colors.sunShade, ink: colors.onSun },
  petrol: { face: colors.secondary, edge: colors.secondaryShade, ink: colors.onSecondary },
  // Sur une surface déjà colorée : un galet ton sur ton.
  quiet: { face: colors.surfaceContainer, edge: colors.surfaceContainerHighest, ink: colors.onSurfaceVariant },
};

/**
 * Un galet rond qui porte une seule icône : fermer, retour, indice, écouter.
 * Toujours au moins 48 dp, et l'icône au palier M dès que la taille le permet.
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
      edge={palette.edge}
      border={palette.border}
      radius={diameter / 2}
      depth="sm"
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      hitSlop={6}
      // Un bouton rond ne s'étire jamais : dans une colonne, sa tranche
      // suivrait la largeur du parent.
      style={[styles.self, style]}
      faceStyle={[styles.face, { width: diameter, height: diameter }]}
    >
      <EcolnaIcon
        name={icon}
        size={Math.round(diameter * 0.52)}
        color={palette.ink}
        mode={iconMode}
      />
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  self: { alignSelf: 'flex-start' },
  face: { alignItems: 'center', justifyContent: 'center' },
});
