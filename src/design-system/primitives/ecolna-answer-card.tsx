import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { a11y, colors, radius, shadows, spacing, type TypographyVariant } from '../tokens';
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
  /**
   * Repère posé dans le coin (le numéro d'une paire) : il double la teinte,
   * pour qui ne distingue pas les couleurs.
   */
  mark?: string | undefined;
}

const LOOK: Record<AnswerCardState, { face: string; edge: string; border: string; ink: string }> = {
  default: { face: colors.white, edge: colors.border, border: colors.border, ink: colors.ink },
  selected: { face: colors.brandTint, edge: colors.brand, border: colors.brand, ink: colors.brandInk },
  correct: { face: colors.successTint, edge: colors.success, border: colors.success, ink: colors.successInk },
  // Doux : le bleu de la marque, jamais rouge (le programme et la direction l'interdisent).
  incorrect: { face: colors.brandTint, edge: colors.brand, border: colors.brand, ink: colors.brandInk },
  disabled: { face: colors.fill, edge: colors.fill, border: colors.fill, ink: colors.inkSecondary },
};

/**
 * Une réponse qu'on touche (v4) : une surface blanche, un filet de 2 dp, une
 * ombre douce ; elle s'enfonce sous le doigt. Choisie : filet bleu de 3 dp sur
 * un fond bleuté ; juste : vert, avec une pastille cochée ; à revoir : bleu
 * calme, avec une flèche de reprise — jamais la couleur seule, jamais du rouge.
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
  mark,
}: EcolnaAnswerCardProps) {
  const { scale } = useResponsive();
  const look = state === 'selected' && tint ? tint : LOOK[state];
  const disabled = state === 'disabled' || state === 'correct' || state === 'incorrect';
  const badge = scaled(30, scale);
  const sunk = state === 'selected' || state === 'correct' || state === 'incorrect';

  return (
    <EcolnaGalet
      face={look.face}
      border={look.border}
      borderWidth={state === 'default' || state === 'disabled' ? 2 : 3}
      radius={radius.xl}
      shadow={state === 'default' ? shadows.card : undefined}
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
          <EcolnaText variant={glyph ? glyphVariant : 'headlineSm'} align="center" color={look.ink}>
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
              backgroundColor: state === 'correct' ? colors.success : colors.brand,
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
      {mark ? (
        <View
          style={[
            styles.mark,
            { minWidth: badge, height: badge, borderRadius: badge / 2, backgroundColor: look.ink },
          ]}
        >
          <EcolnaText variant="labelLg" color={colors.onPrimary}>
            {mark}
          </EcolnaText>
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
  mark: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    paddingHorizontal: spacing.xxs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
