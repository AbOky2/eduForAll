/** Border radii from the Stitch Tailwind config (4/8/12/16/24/full). */
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;
