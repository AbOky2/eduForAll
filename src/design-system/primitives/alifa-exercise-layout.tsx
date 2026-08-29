import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '../tokens';
import { useResponsive } from '../responsive';

interface AlifaExerciseLayoutProps {
  /** What the child looks at or listens to: question, audio button, board. */
  prompt: ReactNode;
  /** What the child touches to answer. */
  answers: ReactNode;
  /** Give the prompt more room than the answers (illustrations, boards). */
  promptWeight?: number;
}

/**
 * The two halves of every exercise: the stimulus and the answers.
 *
 * Stacked on a phone, side by side on a tablet held in landscape. That split
 * is not cosmetic — stacked on a wide short window, the answer cards fall
 * below the fold and a six-year-old has to scroll to find them, which is
 * exactly the moment an exercise stops being about reading.
 */
export function AlifaExerciseLayout({
  prompt,
  answers,
  promptWeight = 1,
}: AlifaExerciseLayoutProps) {
  const { splitPanes } = useResponsive();

  if (!splitPanes) {
    return (
      <View style={styles.stack}>
        {prompt}
        {answers}
      </View>
    );
  }

  return (
    <View style={styles.split}>
      <View style={[styles.pane, { flex: promptWeight }]}>{prompt}</View>
      <View style={styles.pane}>{answers}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { flex: 1, gap: spacing.xl, justifyContent: 'center' },
  split: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.xxl,
    alignItems: 'center',
  },
  pane: { flex: 1, gap: spacing.lg, justifyContent: 'center' },
});
