import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing, type TypographyVariant } from '../tokens';
import { scaled, useResponsive } from '../responsive';

interface EcolnaExerciseLayoutProps {
  /** What the child looks at or listens to: question, audio button, board. */
  prompt: ReactNode | null;
  /** What the child touches to answer. */
  answers: ReactNode;
  /** Give the prompt more room than the answers (illustrations, boards). */
  promptWeight?: number;
}

/**
 * Les tailles communes à tous les exercices (direction v3 § 6) : une réponse
 * se vise sans viser. Sur tablette, ≥ 120 dp de haut et un glyphe de
 * 70 dp ; au téléphone, ≥ 72 dp. Un seul endroit, pour que les dix-huit
 * types d'exercice parlent la même langue.
 */
export interface ExerciseMetrics {
  /** Hauteur minimale d'une carte de réponse. */
  answerHeight: number;
  /** Largeur d'une carte-nombre ou d'une tuile de lettre. */
  tileWidth: number;
  /** Glyphe des réponses courtes (syllabes, nombres). */
  answerGlyph: TypographyVariant;
  /** Pictogramme dans une réponse en image. */
  objectSize: number;
  /** Le grand bouton « écouter » d'un exercice. */
  listenSize: number;
  /** Écart entre réponses. */
  gap: number;
}

export function useExerciseMetrics(): ExerciseMetrics {
  const { isTablet, scale } = useResponsive();
  return {
    answerHeight: scaled(isTablet ? 96 : 72, scale),
    tileWidth: scaled(isTablet ? 120 : 88, scale),
    answerGlyph: isTablet ? 'displayGlyph' : 'displayGlyphSmall',
    objectSize: scaled(isTablet ? 96 : 72, scale),
    listenSize: scaled(isTablet ? 100 : 88, scale),
    gap: scaled(isTablet ? spacing.lg : spacing.md, scale),
  };
}

/**
 * The two halves of every exercise: the stimulus and the answers.
 *
 * Stacked on a phone, side by side on a tablet held in landscape. That split
 * is not cosmetic — stacked on a wide short window, the answer cards fall
 * below the fold and a six-year-old has to scroll to find them, which is
 * exactly the moment an exercise stops being about reading.
 */
export function EcolnaExerciseLayout({
  prompt,
  answers,
  promptWeight = 1,
}: EcolnaExerciseLayoutProps) {
  const { splitPanes, scale } = useResponsive();
  const gap = scaled(splitPanes ? spacing.xxl : spacing.xl, scale);

  // Sans stimulus à montrer (la consigne suffit), les réponses se centrent :
  // un volet vide à gauche ferait croire qu'une image n'a pas chargé.
  if (!prompt) {
    return <View style={[styles.stack, styles.alone]}>{answers}</View>;
  }

  if (!splitPanes) {
    return (
      <View style={[styles.stack, { gap }]}>
        {prompt}
        {answers}
      </View>
    );
  }

  return (
    <View style={[styles.split, { gap }]}>
      <View style={[styles.pane, { flex: promptWeight, gap: scaled(spacing.md, scale) }]}>
        {prompt}
      </View>
      <View style={[styles.pane, { gap: scaled(spacing.md, scale) }]}>{answers}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { flex: 1, justifyContent: 'center' },
  alone: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  split: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pane: { flex: 1, justifyContent: 'center' },
});
