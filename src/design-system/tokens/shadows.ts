import type { ViewStyle } from 'react-native';

/**
 * Soft, low elevation only — the mockups never use hard drop shadows.
 * Android relies on `elevation`; iOS on shadow* properties.
 */
export const shadows: Record<'card' | 'raised' | 'none', ViewStyle> = {
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
};
