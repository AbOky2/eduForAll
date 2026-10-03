import { createContext, useContext, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, spacing, subjectColors, type SubjectKey, type TypographyVariant } from '../tokens';
import { scaled, useResponsive } from '../responsive';
import { EcolnaCard } from './ecolna-card';

/** La discipline de la leçon en cours, fournie par l'écran de leçon. */
export const ExerciseSubjectContext = createContext<SubjectKey | null>(null);

/** Côte à côte, le stimulus prend la hauteur du bloc de réponses. */
const StimulusFillContext = createContext(false);

/**
 * Ce que l'enfant regarde ou écoute (le stimulus) : une surface plate dans la
 * teinte de la discipline, sans filet ni ombre. Ce qu'il touche est blanc et
 * fileté — « regarder » et « toucher » ne se confondent jamais. Côte à côte,
 * elle s'étire à la hauteur des réponses : bords hauts et bas communs.
 */
export function EcolnaStimulus({
  children,
  padded = true,
  style,
  accessibilityLabel,
}: {
  children: ReactNode;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string | undefined;
}) {
  const subject = useContext(ExerciseSubjectContext);
  const fill = useContext(StimulusFillContext);
  return (
    <EcolnaCard
      rounded="xl"
      padded={padded}
      backgroundColor={subject ? subjectColors[subject].tint : colors.fill}
      accessibilityLabel={accessibilityLabel}
      style={[style, fill && styles.grow]}
    >
      {children}
    </EcolnaCard>
  );
}

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
    <View style={styles.splitFrame}>
      <View style={[styles.split, { gap }]}>
        <View style={[styles.pane, { flex: promptWeight, gap: scaled(spacing.md, scale) }]}>
          <StimulusFillContext.Provider value>{prompt}</StimulusFillContext.Provider>
        </View>
        <View style={[styles.pane, { gap: scaled(spacing.md, scale) }]}>{answers}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { flex: 1, justifyContent: 'center' },
  alone: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  splitFrame: { flex: 1, justifyContent: 'center' },
  // Les deux volets prennent la hauteur du plus grand : bords communs.
  split: { flexDirection: 'row', alignItems: 'stretch' },
  pane: { flex: 1, justifyContent: 'center' },
  grow: { flexGrow: 1 },
});
