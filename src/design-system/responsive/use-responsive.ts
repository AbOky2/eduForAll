import { useMemo } from 'react';
import { useWindowDimensions, type TextStyle } from 'react-native';

import { typography, type TypographyVariant } from '../tokens/typography';

/**
 * Responsive foundation.
 *
 * ALIFA is built for tablets — that is the hardware the children in the pilot
 * receive — but the same build has to stay usable on a phone for testing and
 * for whatever a family already owns. Rather than branching on device type,
 * layouts branch on window size classes (Material 3), which also handles
 * rotation and split-screen for free.
 *
 * Sizes are in dp:
 *   compact  < 600   phone portrait
 *   medium   600–904 small tablet, phone landscape
 *   expanded ≥ 905   tablet landscape, large tablet
 */
export type WindowSize = 'compact' | 'medium' | 'expanded';

export interface Responsive {
  readonly width: number;
  readonly height: number;
  readonly windowSize: WindowSize;
  readonly isTablet: boolean;
  readonly isLandscape: boolean;
  /**
   * Multiplier for the type scale and the pedagogical glyphs. A six-year-old
   * at arm's length on a 10" tablet needs bigger letters than on a phone held
   * close, not the same letters stretched across more pixels.
   */
  readonly scale: number;
  /** Horizontal screen margin. */
  readonly screenPadding: number;
  /**
   * Maximum width of the readable column. Beyond this the content is centred
   * with air on both sides — a line of text spanning a 1280 dp tablet is
   * unreadable for a beginning reader.
   */
  readonly contentMaxWidth: number;
  /** Columns for card grids (activities, modules, answers). */
  readonly gridColumns: number;
  /**
   * True when the stimulus and the answers should sit side by side instead of
   * stacked — a landscape tablet has the width for it and gains vertical room
   * that would otherwise force scrolling inside an exercise.
   */
  readonly splitPanes: boolean;
}

export function windowSizeOf(width: number): WindowSize {
  if (width < 600) {
    return 'compact';
  }
  return width < 905 ? 'medium' : 'expanded';
}

const BY_SIZE: Record<
  WindowSize,
  Pick<Responsive, 'scale' | 'screenPadding' | 'contentMaxWidth' | 'gridColumns'>
> = {
  compact: { scale: 1, screenPadding: 20, contentMaxWidth: 560, gridColumns: 2 },
  medium: { scale: 1.15, screenPadding: 32, contentMaxWidth: 720, gridColumns: 2 },
  expanded: { scale: 1.3, screenPadding: 48, contentMaxWidth: 1000, gridColumns: 3 },
};

export function useResponsive(): Responsive {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const windowSize = windowSizeOf(width);
    const isLandscape = width > height;
    const base = BY_SIZE[windowSize];
    return {
      width,
      height,
      windowSize,
      isTablet: windowSize !== 'compact',
      isLandscape,
      splitPanes: windowSize === 'expanded' && isLandscape,
      ...base,
    };
  }, [width, height]);
}

/**
 * Scales a design-token size for the current window. Rounded to whole dp so
 * text sits on the pixel grid instead of blurring on low-DPI panels — the
 * cheap tablets this ships on are often 1x or 1.5x.
 */
export function scaled(value: number, scale: number): number {
  return Math.round(value * scale);
}

/**
 * The type scale, scaled for the current window. Memoised per scale factor so
 * a screenful of text shares one style object instead of allocating per node.
 */
const typographyCache = new Map<number, Record<TypographyVariant, TextStyle>>();

export function useTypography(): Record<TypographyVariant, TextStyle> {
  const { scale } = useResponsive();
  const cached = typographyCache.get(scale);
  if (cached) {
    return cached;
  }
  const entries = Object.entries(typography) as [
    TypographyVariant,
    (typeof typography)[TypographyVariant],
  ][];
  const built = Object.fromEntries(
    entries.map(([variant, style]) => [
      variant,
      {
        ...style,
        fontSize: scaled(style.fontSize, scale),
        lineHeight: scaled(style.lineHeight, scale),
      },
    ]),
  ) as Record<TypographyVariant, TextStyle>;
  typographyCache.set(scale, built);
  return built;
}
