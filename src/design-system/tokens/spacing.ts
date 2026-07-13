/** 4pt base grid, matching the vertical rhythm of the Stitch mockups. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  /** Default horizontal screen margin observed across mockups. */
  screenMargin: 20,
} as const;

export type SpacingToken = keyof typeof spacing;
