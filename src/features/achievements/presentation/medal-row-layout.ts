import type { BadgeLabelVariant } from '@/design-system/components/badge-tile';
import { scaled } from '@/design-system/responsive';
import { spacing, typography } from '@/design-system/tokens';

/** Une médaille ne descend jamais sous cette taille, en dp. */
export const MIN_MEDAL = 56;
/** L'air d'une tuile autour de sa médaille (`badgeTileWidth`). */
const TILE_AIR = 24;
/**
 * Le nom le plus long tient en deux lignes d'environ onze signes
 * (« Trois jours / de suite », « Une semaine / entière ») : 6,4 em par ligne
 * en Ecolna Sans demi-gras, plus l'air de la tuile.
 */
const LABEL_EM = 6.4;
const LABEL_VARIANTS: readonly BadgeLabelVariant[] = ['labelLg', 'labelMd', 'labelSm'];

export interface MedalRowLayout {
  /** Médailles par rangée (les rangées sont équilibrées : 2 + 2, jamais 3 + 1). */
  perRow: number;
  /** Côté de la médaille, en dp. */
  medal: number;
  /** Largeur de la case (médaille et nom), en dp. */
  cell: number;
  /** Écart entre deux cases. */
  gap: number;
  /** La plus grande taille de nom qui tient en deux lignes dans la case. */
  labelVariant: BadgeLabelVariant;
}

/** La largeur qu'il faut à un nom, en deux lignes, dans la taille `variant`. */
function labelNeed(variant: BadgeLabelVariant, scale: number): number {
  return Math.ceil(LABEL_EM * scaled(typography[variant].fontSize, scale)) + 2 * spacing.xxs;
}

/**
 * La rangée des médailles gagnées sur l'écran de réussite : des médaillons
 * aussi grands que possible (jusqu'à `base`), côte à côte, leur nom dessous
 * jamais tronqué. Une ou deux médailles ont toute la place ; à trois ou
 * quatre, elles rapetissent et leur nom aussi ; quand même le petit nom ne
 * tiendrait plus, elles passent sur deux rangées égales.
 */
export function medalRowLayout({
  count,
  width,
  base,
  scale,
}: {
  count: number;
  width: number;
  base: number;
  scale: number;
}): MedalRowLayout {
  const total = Math.max(1, count);
  // À quatre par rangée, les cases se serrent.
  const gapFor = (perRow: number) => scaled(perRow >= 4 ? spacing.xs : spacing.lg, scale);
  const slotFor = (perRow: number) =>
    Math.floor((width - (perRow - 1) * gapFor(perRow)) / perRow);
  const minCell = Math.max(MIN_MEDAL + TILE_AIR, labelNeed('labelSm', scale));

  let fitting = 1;
  for (let perRow = total; perRow >= 1; perRow -= 1) {
    if (slotFor(perRow) >= minCell) {
      fitting = perRow;
      break;
    }
  }
  const perRow = Math.ceil(total / Math.ceil(total / fitting));
  const slot = slotFor(perRow);
  const medal = Math.max(MIN_MEDAL, Math.min(base, slot - TILE_AIR));
  // Assez large pour qu'un nom court (« Belle lecture ») tienne sur une ligne.
  const cell = Math.min(slot, Math.max(medal + TILE_AIR, scaled(140, scale)));
  const labelVariant =
    LABEL_VARIANTS.find((variant) => labelNeed(variant, scale) <= cell) ?? 'labelSm';
  return { perRow, medal, cell, gap: gapFor(perRow), labelVariant };
}
