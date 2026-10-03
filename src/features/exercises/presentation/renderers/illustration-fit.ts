/**
 * Une illustration ne touche jamais le filet de sa carte : elle prend au plus
 * cette part de l'intérieur (≈ 12 % d'air de chaque côté). Au-delà, le toit
 * de l'école ou l'ardoise du maître frôlent le bord — et une image rognée
 * trompe l'enfant autant qu'elle fait « cassé ».
 */
export const ILLUSTRATION_FILL = 0.76;

export interface IllustrationFit {
  /** La taille voulue (celle de la classe de fenêtre, éventuellement grossie). */
  preferred: number;
  /** Largeur intérieure mesurée de la carte (onLayout) ; 0 tant qu'elle ne l'est pas. */
  innerWidth: number;
  /** Hauteur intérieure de la carte, quand elle est fixée ; 0 sinon. */
  innerHeight?: number;
  /** Taille sûre en attendant la mesure : jamais plus grande que `preferred`. */
  fallback: number;
  /** Illustrations côte à côte sur une même ligne (défaut 1). */
  perRow?: number;
  /** Écart entre deux illustrations d'une même ligne. */
  gap?: number;
  /** Part de l'intérieur qu'elles peuvent occuper ensemble. */
  fill?: number;
}

/**
 * La taille d'une illustration posée dans une carte : sa taille voulue,
 * bornée par l'intérieur mesuré de la carte. Avant la première mesure, un
 * repli raisonnable plutôt qu'une image qui déborde puis rétrécit.
 */
export function fitIllustration({
  preferred,
  innerWidth,
  innerHeight = 0,
  fallback,
  perRow = 1,
  gap = 0,
  fill = ILLUSTRATION_FILL,
}: IllustrationFit): number {
  if (!(innerWidth > 0)) {
    return Math.max(1, Math.round(Math.min(preferred, fallback)));
  }
  const columns = Math.max(1, Math.floor(perRow));
  const byWidth = (innerWidth * fill - gap * (columns - 1)) / columns;
  const byHeight = innerHeight > 0 ? innerHeight * fill : Infinity;
  return Math.max(1, Math.floor(Math.min(preferred, byWidth, byHeight)));
}

export interface ObjectPacking {
  /** Côté de chaque objet. */
  size: number;
  /** Objets par rangée : des rangées égales, la dernière jamais plus longue. */
  perRow: number;
}

/**
 * Range `count` objets à compter dans une scène de largeur `width` : le moins
 * de rangées possible tant que chaque objet garde au moins `shrink` de sa
 * taille voulue, puis des rangées équilibrées (12 → 4 × 3, pas 5 + 5 + 2),
 * pour qu'un enfant compte rangée par rangée. Une hauteur (`height` > 0)
 * borne en plus la taille, rangées comprises.
 */
export function packObjects({
  count,
  width,
  gap,
  preferred,
  height = 0,
  shrink = 0.8,
}: {
  count: number;
  width: number;
  gap: number;
  preferred: number;
  height?: number;
  shrink?: number;
}): ObjectPacking {
  if (count <= 0 || !(width > 0)) {
    return { size: Math.max(1, Math.round(preferred)), perRow: Math.max(1, count) };
  }
  const byWidth = (perRow: number) => (width - gap * (perRow - 1)) / perRow;
  let perRow = 1;
  while (perRow < count && byWidth(perRow + 1) >= preferred * shrink) {
    perRow += 1;
  }
  const rows = Math.ceil(count / perRow);
  const balanced = Math.ceil(count / rows);
  const byHeight = height > 0 ? (height - gap * (rows - 1)) / rows : Infinity;
  const size = Math.min(preferred, byWidth(balanced), byHeight);
  return { size: Math.max(1, Math.floor(size)), perRow: balanced };
}
