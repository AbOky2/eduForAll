import { StyleSheet } from 'react-native';

import { EcolnaGalet, EcolnaText } from '../primitives';
import { colors, radius, spacing, type TypographyVariant } from '../tokens';

interface LetterTileProps {
  label: string;
  onPress: () => void;
  /** `tray` : dans la réserve (galet blanc) ; `placed` : posée dans la réponse. */
  tone: 'tray' | 'placed';
  disabled?: boolean;
  variant: TypographyVariant;
  minWidth: number;
  height: number;
  accessibilityLabel?: string;
}

/**
 * Une tuile qu'on pose : lettre, syllabe ou mot. Dans la réserve, un galet
 * blanc qui attend ; posée, elle passe au pétrole — on voit ce qu'on a
 * construit, et la toucher la renvoie dans la réserve.
 */
export function LetterTile({
  label,
  onPress,
  tone,
  disabled = false,
  variant,
  minWidth,
  height,
  accessibilityLabel,
}: LetterTileProps) {
  const placed = tone === 'placed';
  return (
    <EcolnaGalet
      face={disabled ? colors.lockedContainer : placed ? colors.secondaryFixed : colors.card}
      edge={disabled ? colors.lockedEdge : placed ? colors.secondaryFixedDim : colors.cardEdge}
      border={placed ? colors.secondary : colors.cardEdge}
      borderWidth={placed ? 3 : 2}
      radius={radius.lg}
      depth="md"
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? label}
      faceStyle={[styles.face, { minWidth, height }]}
    >
      <EcolnaText
        variant={variant}
        color={disabled ? colors.textSecondary : placed ? colors.onSecondaryContainer : colors.textPrimary}
      >
        {label}
      </EcolnaText>
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  face: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
});
