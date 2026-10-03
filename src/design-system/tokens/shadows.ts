import type { ViewStyle } from 'react-native';

/**
 * Élévation v4 : des ombres en couches, douces et froides (l'encre diluée,
 * jamais un brun), portées par `boxShadow` — natif sur iOS et Android avec la
 * nouvelle architecture, et sur le web. Contrairement à `elevation`, une
 * ombre `boxShadow` ne change pas l'ordre d'empilement des vues Android.
 *
 * Trois niveaux seulement : posé (carte), levé (carte qu'on touche, au
 * repos), flottant (barre d'onglets, feuille, boîte de dialogue).
 */
export const shadows: Record<'card' | 'raised' | 'floating' | 'none' | 'glowReward' | 'glowBrand', ViewStyle> = {
  none: {},
  card: { boxShadow: '0px 1px 2px rgba(14, 21, 38, 0.05), 0px 4px 14px rgba(14, 21, 38, 0.04)' },
  raised: { boxShadow: '0px 2px 6px rgba(14, 21, 38, 0.06), 0px 12px 28px rgba(14, 21, 38, 0.08)' },
  floating: { boxShadow: '0px 4px 12px rgba(14, 21, 38, 0.07), 0px 20px 44px rgba(14, 21, 38, 0.13)' },
  /** Le halo de l'action soleil : elle se voit de loin, sans tranche. */
  glowReward: { boxShadow: '0px 6px 18px rgba(242, 161, 0, 0.35)' },
  /** Le halo d'une action pleine de la marque (bouton d'écoute, accent). */
  glowBrand: { boxShadow: '0px 6px 18px rgba(47, 91, 219, 0.26)' },
};
