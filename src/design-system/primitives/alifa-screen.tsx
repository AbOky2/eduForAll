import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { colors, spacing } from '../tokens';

type ScreenBackground = 'default' | 'exercise' | 'plain-card';

interface AlifaScreenProps {
  children: ReactNode;
  /**
   * `default`  — #fbf8ff with the dotted pattern (home, maps — mockup S06)
   * `exercise` — warm ivory #F4F1DE (lesson screens — mockups S11–S15)
   * `plain-card` — flat surface, no pattern
   */
  background?: ScreenBackground;
  /** Extra bottom padding for screens without a tab bar. */
  withBottomInset?: boolean;
}

const DOT_SPACING = 20;

function DottedPattern() {
  // Static decorative layer; sized generously and clipped by the parent.
  const columns = 30;
  const rows = 60;
  const dots = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      dots.push(
        <Circle
          key={`${row}-${column}`}
          cx={column * DOT_SPACING + 10}
          cy={row * DOT_SPACING + 10}
          r={1}
          fill={colors.backgroundPatternDot}
        />,
      );
    }
  }
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%">
      {dots}
    </Svg>
  );
}

export function AlifaScreen({
  children,
  background = 'default',
  withBottomInset = true,
}: AlifaScreenProps) {
  const insets = useSafeAreaInsets();
  const backgroundColor =
    background === 'exercise' ? colors.exerciseBackground : colors.background;

  return (
    <View style={[styles.root, { backgroundColor, paddingTop: insets.top }]}>
      {background === 'default' ? <DottedPattern /> : null}
      <View
        style={[
          styles.content,
          { paddingBottom: withBottomInset ? insets.bottom + spacing.md : 0 },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});
