/** Accessibility constants applied across all interactive primitives. */
export const a11y = {
  /** Minimum touch target in dp (Android guidance; child-first app aims higher). */
  minTouchTarget: 48,
  /** Preferred touch target for primary child interactions. */
  childTouchTarget: 64,
  /** Minimum contrast ratio for body text. */
  minContrastBody: 4.5,
  minContrastLargeText: 3,
} as const;
