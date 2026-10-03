import type { ViewStyle } from 'react-native';

/**
 * Soft, low elevation only — the mockups never use hard drop shadows.
 * Android relies on `elevation`; iOS on shadow* properties.
 */
export const shadows: Record<'card' | 'raised' | 'floating' | 'none', ViewStyle> = {
  none: {},
  card: {
    shadowColor: '#7d562d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  raised: {
    shadowColor: '#7d562d',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  /** Ce qui flotte au-dessus du contenu : barre d'onglets, feuille de réponse. */
  floating: {
    shadowColor: '#5b3912',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 10,
  },
};
