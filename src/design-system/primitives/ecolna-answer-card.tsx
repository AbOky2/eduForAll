import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { a11y, colors, radius, spacing, type TypographyVariant } from '../tokens';
import { EcolnaIcon } from '../icons/ecolna-icon';
import { scaled, useResponsive } from '../responsive';
import { EcolnaGalet } from './ecolna-galet';
import { EcolnaText } from './ecolna-text';

export type AnswerCardState = 'default' | 'selected' | 'correct' | 'incorrect' | 'disabled';

interface EcolnaAnswerCardProps {
  label?: string;
  children?: ReactNode;
  onPress: () => void;
  state?: AnswerCardState;
  /** Large pedagogical glyph (syllables, numbers) vs body text. */
  glyph?: boolean;
  /** Taille du glyphe (défaut `displayGlyphSmall`) — voir `useExerciseMetrics`. */
  glyphVariant?: TypographyVariant | undefined;
  accessibilityLabel?: string | undefined;
  style?: StyleProp<ViewStyle> | undefined;
  /** Style de la face (hauteur, disposition) — les grilles égalisent ici. */
  contentStyle?: StyleProp<ViewStyle> | undefined;
  /**
   * Teinte d'un choix posé (`selected`) : une paire trouvée garde la même
   * couleur à gauche et à droite, pour qu'on voie ce qui va avec quoi.
   */
  tint?: { face: string; edge: string; border: string; ink: string } | undefined;
}

const LOOK: Record<AnswerCardState, { face: string; edge: string; border: string; ink: string }> = {
  default: { face: colors.card, edge: colors.cardEdge, border: colors.cardEdge, ink: colors.textPrimary },
  selected: {
    face: colors.secondaryFixed,
    edge: colors.secondaryFixedDim,
    border: colors.secondary,
    ink: colors.onSecondaryContainer,
  },
  correct: {
    face: colors.feedbackCorrectContainer,
    edge: colors.feedbackCorrectShade,
    border: colors.feedbackCorrect,
    ink: colors.feedbackCorrect,
  },
  // Doux : pétrole, jamais rouge (le programme et la direction l'interdisent).
  incorrect: {
    face: colors.secondaryFixed,
    edge: colors.secondaryFixedDim,
    border: colors.secondary,
    ink: colors.onSecondaryContainer,
  },
  disabled: {
    face: colors.lockedContainer,
    edge: colors.lockedEdge,
    border: colors.lockedEdge,
    ink: colors.locked,
  },
};

/**
 * Une réponse qu'on touche : un galet blanc (direction v3 § 2). Choisie, elle
 * se pare de pétrole ; juste, de vert avec une coche ; à revoir, de pétrole
 * avec une flèche de reprise — jamais la couleur seule, jamais du rouge.
 */
export function EcolnaAnswerCard({
  label,
  children,
  onPress,
  state = 'default',
  glyph = true,
  glyphVariant = 'displayGlyphSmall',
  accessibilityLabel,
  style,
  contentStyle,
  tint,
}: EcolnaAnswerCardProps) {
  const { scale } = useResponsive();
  const look = state === 'selected' && tint ? tint : LOOK[state];
  const disabled = state === 'disabled' || state === 'correct' || state === 'incorrect';
  const badge = scaled(28, scale);
  const sunk = state === 'selected' || state === 'correct' || state === 'incorrect';

  return (
    <EcolnaGalet
      face={look.face}
      edge={look.edge}
      border={look.border}
      borderWidth={state === 'default' || state === 'disabled' ? 2 : 3}
      radius={radius.lg}
      depth="md"
      onPress={onPress}
      disabled={disabled}
      pressedLook={sunk}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled, selected: state === 'selected' }}
      style={style}
      faceStyle={[
        styles.face,
        { minHeight: scaled(a11y.childTouchTarget + 8, scale) },
        contentStyle,
      ]}
    >
      {children ??
        (label !== undefined ? (
          <EcolnaText
            variant={glyph ? glyphVariant : 'headlineSm'}
            align="center"
            color={look.ink}
          >
            {label}
          </EcolnaText>
        ) : null)}
      {state === 'correct' || state === 'incorrect' ? (
        <View
          style={[
            styles.badge,
            {
              width: badge,
              height: badge,
              borderRadius: badge / 2,
              backgroundColor: state === 'correct' ? colors.feedbackCorrect : colors.secondary,
            },
          ]}
        >
          <EcolnaIcon
            name={state === 'correct' ? 'check' : 'replay'}
            size={Math.round(badge * 0.62)}
            color={colors.onPrimary}
          />
        </View>
      ) : null}
    </EcolnaGalet>
  );
}

const styles = StyleSheet.create({
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
