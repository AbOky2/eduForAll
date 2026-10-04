import { createContext, useContext, useState, type ReactNode } from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
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
  /**
   * La carte choisie, marquée « à revoir », pendant la reprise (cartes
   * rouvertes) : la toucher ne répond pas — elle frémit et redit ce qu'elle
   * est (son mot, sa syllabe), face au mot à trouver. Sans cette prop, une
   * carte marquée reste inerte.
   */
  onEcho?: (() => void) | undefined;
}

const LOOK: Record<AnswerCardState, { face: string; edge: string; border: string; ink: string }> = {
  // Le bord d'une réponse au repos se voit au soleil, sur un écran bon marché.
  default: {
    face: colors.white,
    edge: colors.borderStrong,
    border: colors.borderStrong,
    ink: colors.ink,
  },
  selected: {
    face: colors.brandTint,
    edge: colors.brand,
    border: colors.brand,
    ink: colors.brandInk,
  },
  correct: {
    face: colors.successTint,
    edge: colors.success,
    border: colors.success,
    ink: colors.successInk,
  },
  // Doux : le bleu de la marque, jamais rouge (le programme et la direction l'interdisent).
  incorrect: {
    face: colors.brandTint,
    edge: colors.brand,
    border: colors.brand,
    ink: colors.brandInk,
  },
  // Inerte pendant le retour, mais jamais grisée ni éteinte : un enfant lit
  // le gris comme « c'est cassé ». Elle garde sa face, son filet et son ombre
  // posée — la même après « juste » qu'après « à revoir ».
  disabled: {
    face: colors.white,
    edge: colors.borderStrong,
    border: colors.borderStrong,
    ink: colors.ink,
  },
};

/** La secousse d'une carte marquée qu'on retouche : ± 6 dp, amortie. */
const NUDGE = { inputRange: [0, 0.18, 0.42, 0.66, 0.86, 1], outputRange: [0, 6, -6, 3.5, -1.5, 0] };
const NUDGE_MS = 380;

/**
 * Le verdict de l'étape, fourni par l'écran de leçon pendant la feuille de
 * retour : la carte choisie (`selected`) le montre elle-même — verte et
 * cochée si c'est juste, bleue avec la flèche de reprise sinon. Une paire
 * teintée (relier) garde sa teinte.
 */
export const AnswerVerdictContext = createContext<'correct' | 'incorrect' | null>(null);

/**
 * L'état d'une carte d'un exercice à choix unique. Inerte (feuille de retour) :
 * la carte choisie porte le verdict, les autres attendent. Rouverte pendant la
 * feuille « à revoir » (toucher une autre carte vaut « Réessayer ») : la carte
 * choisie GARDE sa marque et ne répond plus — retouchée, elle redit ce
 * qu'elle est (`useAnswerEcho`) —, les autres se touchent.
 */
export function useAnswerCardState(interactive: boolean): (picked: boolean) => AnswerCardState {
  const verdict = useContext(AnswerVerdictContext);
  return (picked) => {
    if (!interactive) {
      // Sans verdict (sous la feuille d'indice), l'ancien choix ne reste pas
      // « choisi » : toutes les cartes attendent, blanches.
      return picked && verdict ? 'selected' : 'disabled';
    }
    return picked && verdict ? 'selected' : 'default';
  };
}

/**
 * La reprise par la carte (feuille « à revoir » rouverte) : la carte choisie
 * n'est pas un appui mort. Renvoie, pour une carte, l'action `onEcho` de
 * `EcolnaAnswerCard` — `say` (dire son mot, s'il a un son) pour la carte
 * choisie pendant la reprise, rien ailleurs.
 */
export function useAnswerEcho(
  interactive: boolean,
): (picked: boolean, say?: () => void) => (() => void) | undefined {
  const verdict = useContext(AnswerVerdictContext);
  const open = interactive && verdict === 'incorrect';
  return (picked, say = quiet) => (open && picked ? say : undefined);
}

function quiet(): void {}

/**
 * Une réponse qu'on touche (v4) : une surface blanche, un filet de 2 dp, une
 * ombre douce ; elle s'enfonce sous le doigt. Choisie : filet bleu de 3 dp sur
 * un fond bleuté ; juste : vert, avec une pastille cochée ; à revoir : bleu
 * calme, avec une flèche de reprise — jamais la couleur seule, jamais du rouge,
 * jamais de gris (voir `AnswerVerdictContext`).
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
  onEcho,
}: EcolnaAnswerCardProps) {
  const { scale } = useResponsive();
  const reducedMotion = useReducedMotion();
  const verdict = useContext(AnswerVerdictContext);
  const [nudge] = useState(() => new Animated.Value(0));
  const shown: AnswerCardState = state === 'selected' && verdict && !tint ? verdict : state;
  const look = shown === 'selected' && tint ? tint : LOOK[shown];
  // Marquée « à revoir » pendant la reprise : elle se touche, sans répondre.
  const echo = shown === 'incorrect' && onEcho ? onEcho : undefined;
  const disabled = shown === 'disabled' || shown === 'correct' || (shown === 'incorrect' && !echo);
  const badge = scaled(30, scale);
  const sunk = shown === 'selected' || shown === 'correct' || shown === 'incorrect';

  const press = echo
    ? () => {
        if (!reducedMotion) {
          nudge.setValue(0);
          Animated.timing(nudge, {
            toValue: 1,
            duration: NUDGE_MS,
            useNativeDriver: true,
          }).start();
        }
        echo();
      }
    : onPress;

  return (
    // La secousse porte sur toute la carte ; la mise en page (`style`) aussi.
    <Animated.View style={[style, { transform: [{ translateX: nudge.interpolate(NUDGE) }] }]}>
      <EcolnaGalet
        face={look.face}
        border={look.border}
        borderWidth={shown === 'default' || shown === 'disabled' ? 2 : 3}
        radius={radius.xl}
        // Une carte inerte garde son ombre : elle attend, elle n'est pas éteinte.
        shadow={shown === 'default' || shown === 'disabled' ? shadows.card : undefined}
        onPress={press}
        disabled={disabled}
        pressedLook={sunk}
        haptic={echo ? 'light' : 'selection'}
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled, selected: shown === 'selected' }}
        style={styles.fill}
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
        {shown === 'correct' || shown === 'incorrect' ? (
          <View
            style={[
              styles.badge,
              {
                width: badge,
                height: badge,
                borderRadius: badge / 2,
                backgroundColor: shown === 'correct' ? colors.success : colors.brand,
              },
            ]}
          >
            <EcolnaIcon
              name={shown === 'correct' ? 'check' : 'replay'}
              size={Math.round(badge * 0.62)}
              color={colors.onPrimary}
            />
          </View>
        ) : null}
        {mark ? (
          <View
            style={[
              styles.mark,
              {
                minWidth: badge,
                height: badge,
                borderRadius: badge / 2,
                backgroundColor: look.ink,
              },
            ]}
          >
            <EcolnaText variant="labelLg" color={colors.onPrimary}>
              {mark}
            </EcolnaText>
          </View>
        ) : null}
      </EcolnaGalet>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // La carte remplit la case que la mise en page lui donne (rangée étirée).
  fill: { flexGrow: 1 },
  face: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
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
