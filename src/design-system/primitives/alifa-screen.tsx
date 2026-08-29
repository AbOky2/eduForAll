import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { colors, spacing } from '../tokens';
import { useResponsive } from '../responsive';

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
  /** Adds the standard horizontal margin. Screens that scroll add their own. */
  padded?: boolean;
}

const DOT_SPACING = 20;

/**
 * Decorative dot grid. Sized from the actual window so a 1280 dp tablet is
 * covered edge to edge instead of showing the pattern stop two thirds across.
 */
function DottedPattern({ width, height, step }: { width: number; height: number; step: number }) {
  const columns = Math.ceil(width / step) + 1;
  const rows = Math.ceil(height / step) + 1;
  const dots = [];
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      dots.push(
        <Circle
          key={`${row}-${column}`}
          cx={column * step + step / 2}
          cy={row * step + step / 2}
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

/**
 * Every screen sits inside this. It paints the background of the mockups and
 * — the part that matters on a tablet — keeps the content in a centred column
 * of readable width. A line of text stretched across a 10" screen is
 * unreadable for a child who is still decoding letter by letter.
 */
export function AlifaScreen({
  children,
  background = 'default',
  withBottomInset = true,
  padded = false,
}: AlifaScreenProps) {
  const insets = useSafeAreaInsets();
  const { width, height, contentMaxWidth, screenPadding, scale } = useResponsive();
  const backgroundColor = background === 'exercise' ? colors.exerciseBackground : colors.background;

  return (
    <View style={[styles.root, { backgroundColor, paddingTop: insets.top }]}>
      {background === 'default' ? (
        <DottedPattern width={width} height={height} step={Math.round(DOT_SPACING * scale)} />
      ) : null}
      <View style={styles.centering}>
        <View
          style={[
            styles.content,
            {
              maxWidth: contentMaxWidth,
              paddingBottom: withBottomInset ? insets.bottom + spacing.md : 0,
              paddingHorizontal: padded ? screenPadding : 0,
            },
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centering: { flex: 1, alignItems: 'center', width: '100%' },
  content: { flex: 1, width: '100%' },
});
