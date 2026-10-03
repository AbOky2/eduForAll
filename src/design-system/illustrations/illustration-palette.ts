import { illustration, type Ramp } from '../tokens/illustration';

/**
 * Palette et géométrie des pictogrammes de contenu v4 « Épure »
 * (`object-icons.tsx`, `curriculum-icons.tsx`).
 *
 * Aucune couleur n'est écrite ici : tout vient des jetons
 * (`tokens/illustration.ts`, section `objects`, plus les peaux, les cheveux
 * et l'ardoise déjà définis). Un test refuse tout littéral hexadécimal dans
 * ce dossier.
 *
 * Grammaire commune :
 * - grille 48 × 48, l'objet occupe ≈ 40 unités (80–85 % de la case) ;
 * - aucun contour : une matière = une rampe `light` / `base` / `shade`,
 *   la lumière vient d'en haut à gauche ;
 * - les détails (nervures, coutures, pattes du fond) passent au `shade` de la
 *   rampe ; les yeux sont pleins avec un point de lumière, comme les portraits ;
 * - ni dégradé, ni reflet blanc, ni opacité.
 */

export type { Ramp };

export const O = illustration.objects;
export const SKIN = illustration.skin;
export const HAIR = illustration.hair;
export const FACE = illustration.face;
export const SLATE = illustration.school.slate;
export const CHALK = illustration.school.chalk;
export const CHALK_DIM = illustration.school.chalkDim;
export const WHITE = illustration.white;
/** Les francs CFA : laiton des petites pièces. */
export const COINS = illustration.coins;
/** La tenue kaki des écoles publiques. */
export const KHAKI = illustration.fabric.khaki;

/** Une décimale au plus : des tracés nets, sans bruit. */
const r1 = (value: number) => Math.round(value * 10) / 10;

/**
 * Le croissant d'ombre (ou de lumière) d'un disque : la part du disque
 * (`cx`, `cy`, `r`) que ne couvre pas le même disque décalé de (`ox`, `oy`).
 * Décaler vers le haut-gauche (`ox`, `oy` < 0) laisse l'ombre en bas à droite ;
 * vers le bas-droite, la lumière en haut à gauche.
 */
export function crescent(cx: number, cy: number, r: number, ox: number, oy: number): string {
  return ellipseCrescent(cx, cy, r, r, ox, oy);
}

/** Même croissant, pour une ellipse (`rx`, `ry`) décalée d'elle-même. */
export function ellipseCrescent(cx: number, cy: number, rx: number, ry: number, ox: number, oy: number): string {
  // Dans le repère normalisé (x / rx, y / ry), ce sont deux cercles unité.
  const nx = ox / rx;
  const ny = oy / ry;
  const d = Math.hypot(nx, ny);
  if (d <= 0 || d >= 2) {
    return '';
  }
  const ux = nx / d;
  const uy = ny / d;
  const h = Math.sqrt(1 - (d * d) / 4);
  const mx = nx / 2;
  const my = ny / 2;
  const p1x = cx + (mx - uy * h) * rx;
  const p1y = cy + (my + ux * h) * ry;
  const p2x = cx + (mx + uy * h) * rx;
  const p2y = cy + (my - ux * h) * ry;
  const a = `${r1(rx)} ${r1(ry)}`;
  return `M${r1(p1x)} ${r1(p1y)}A${a} 0 1 1 ${r1(p2x)} ${r1(p2y)}A${a} 0 0 0 ${r1(p1x)} ${r1(p1y)}Z`;
}

/**
 * La tête des portraits v4 (`avatars/portrait.tsx`), ramenée à un centre et
 * deux demi-axes : un ovale un peu plus plat en haut qu'au menton.
 */
export function egg(cx: number, cy: number, rx: number, ry: number): string {
  const x = (k: number) => r1(cx + k * rx);
  const y = (k: number) => r1(cy + k * ry);
  return (
    `M${x(0)} ${y(-1)}C${x(0.593)} ${y(-1)} ${x(1)} ${y(-0.603)} ${x(1)} ${y(-0.034)}` +
    `C${x(1)} ${y(0.569)} ${x(0.574)} ${y(1)} ${x(0)} ${y(1)}` +
    `C${x(-0.574)} ${y(1)} ${x(-1)} ${y(0.569)} ${x(-1)} ${y(-0.034)}` +
    `C${x(-1)} ${y(-0.603)} ${x(-0.593)} ${y(-1)} ${x(0)} ${y(-1)}Z`
  );
}

/** Un disque en tracé (pour réunir plusieurs disques dans un seul `Path`). */
export function disc(cx: number, cy: number, r: number): string {
  return `M${r1(cx - r)} ${r1(cy)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0Z`;
}

/** Une ellipse en tracé. */
export function oval(cx: number, cy: number, rx: number, ry: number): string {
  return `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(2 * rx)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-2 * rx)} 0Z`;
}

/**
 * Une pilule (segment épaissi, bouts ronds) de (`x1`, `y1`) à (`x2`, `y2`) :
 * pattes, manches, bâtons — un aplat, jamais un trait cerné.
 */
export function pill(x1: number, y1: number, x2: number, y2: number, r: number): string {
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 0.05) {
    return disc(x1, y1, r);
  }
  const nx = ((y2 - y1) / len) * r;
  const ny = (-(x2 - x1) / len) * r;
  const s = r1(r);
  return (
    `M${r1(x2 + nx)} ${r1(y2 + ny)}L${r1(x1 + nx)} ${r1(y1 + ny)}` +
    `A${s} ${s} 0 0 0 ${r1(x1 - nx)} ${r1(y1 - ny)}L${r1(x2 - nx)} ${r1(y2 - ny)}` +
    `A${s} ${s} 0 0 0 ${r1(x2 + nx)} ${r1(y2 + ny)}Z`
  );
}

/** Une goutte, pointe en haut, de rayon `r` à la base. */
export function drop(cx: number, cy: number, r: number): string {
  return (
    `M${r1(cx)} ${r1(cy - 2.3 * r)}C${r1(cx + 0.45 * r)} ${r1(cy - 1.5 * r)} ${r1(cx + r)} ${r1(cy - 0.7 * r)} ${r1(cx + r)} ${r1(cy)}` +
    `A${r1(r)} ${r1(r)} 0 0 1 ${r1(cx - r)} ${r1(cy)}C${r1(cx - r)} ${r1(cy - 0.7 * r)} ${r1(cx - 0.45 * r)} ${r1(cy - 1.5 * r)} ${r1(cx)} ${r1(cy - 2.3 * r)}Z`
  );
}
