/**
 * La tranche des galets (direction v3 § 2) : l'épaisseur d'un objet qu'on
 * touche, dessinée comme une bande pleine sous sa face. Appuyer enfonce la
 * face de toute la hauteur de la tranche — le retour tactile est visuel,
 * instantané, et ne dépend ni du son ni de la vibration.
 *
 * Valeurs en dp avant mise à l'échelle ; les composants les multiplient par
 * `scale` (arrondi au dp) pour qu'un galet de tablette garde ses proportions.
 */
export const depth = {
  /** Petits galets : pastilles, boutons d'icône de l'espace parent. */
  sm: 3,
  /** Boutons, cartes de réponse, tuiles. */
  md: 5,
  /** Grandes cartes : héros, modules, nœuds de la carte. */
  lg: 6,
} as const;

export type DepthToken = keyof typeof depth;
