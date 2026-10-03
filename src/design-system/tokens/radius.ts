/**
 * Rayons v4. Les surfaces sont généreusement arrondies, sans jamais devenir
 * des pilules (sauf les boutons d'action, les puces et les pistes) :
 * 12 champ et petite tuile · 16 réponse · 20 carte · 28 grand panneau.
 */
export const radius = {
  xs: 6,
  sm: 10,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;
