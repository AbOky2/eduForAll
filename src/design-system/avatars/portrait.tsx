/**
 * Portraits v4 « Épure » — les douze enfants (direction v4 § 8).
 *
 * Guide de style établi par prototype mesuré (rendu à 200, 96, 64 et 40 px,
 * niveaux de gris, silhouettes, dégagement du bord, nombre d'éléments) :
 * - à plat : une couleur par matière ; la seule ombre est le cou, dans le ton
 *   d'ombre de la peau ; ni contour, ni reflet, ni dégradé, ni accessoire
 *   d'écolier, ni motif dans le disque ;
 * - un visage propre à chacun, sur une seule construction : quatre têtes
 *   (ovale 54 × 58, ronde 58 × 55, longue 51 × 61, joufflue 57 × 57) dont le
 *   crâne est l'image affine de l'ovale — les coiffures s'y posent toutes —,
 *   trois regards (ronds et rapprochés, en amande, grands et écartés) et trois
 *   bouches au calme (sourire, petit sourire, croissant fermé) ; les yeux sous
 *   le milieu (proportions d'enfant), pleins avec un point de lumière, un nez
 *   d'un trait ; la joie plisse les yeux et ouvre une bouche accordée au visage ;
 * - la texture des cheveux crépus portée par le seul contour : un bord
 *   festonné (arcs dont la flèche vaut 0,42 à 0,5 demi-corde) ;
 * - six peaux tenues de 25 à 62 % de luminosité, réchauffées en s'éclaircissant ;
 *   des cheveux noir aubergine, qui se détachent de la peau par la teinte ;
 * - un cadrage commun : ×1,06 (détail complet) ou ×1,10 (petit) autour de
 *   (60, 66) ; rien n'est coupé par le bord sauf les épaules.
 */
import type { ReactElement } from 'react';
import { Circle, G, Path, Rect } from 'react-native-svg';

export type PortraitExpression = 'calm' | 'joy';
export type PortraitLod = 'full' | 'small';

export type PortraitSkin = 'ebene' | 'cacao' | 'acajou' | 'cannelle' | 'miel' | 'sable';
export type PortraitHair =
  | 'side-part'
  | 'puffs'
  | 'mini-afro'
  | 'cornrow-braids'
  | 'knotted-scarf'
  | 'round-afro'
  | 'natural-afro'
  | 'bucket-hat'
  | 'side-loops'
  | 'shaved-line'
  | 'crown-bun'
  | 'soft-curls';
export type PortraitGarment =
  | 'school-shirt'
  | 'pagne-dress'
  | 'jalabiya'
  | 'plain-top'
  | 'claudine-dress'
  | 'polo'
  | 'school-dress'
  | 'striped-tshirt'
  | 'embroidered-dress'
  | 'checked-shirt'
  | 'boubou-top'
  | 'pocket-tshirt';
export type PortraitAccessory = 'glasses' | 'hearing-aid' | 'stud-earrings' | 'hoop-earrings' | 'bead-necklace';
export type PortraitBrow = 'arch' | 'straight' | 'round' | 'lifted';
export type PortraitNose = 'broad' | 'round' | 'button';

// ── Palette ─────────────────────────────────────────────────────────────

/**
 * Peaux : `shade` = cou et nez (6 à 8 points plus sombre, même teinte) ;
 * `blush` = la joue, une couleur prémélangée (jamais une opacité sur la peau).
 */
export const PORTRAIT_SKINS: Record<PortraitSkin, { base: string; shade: string; blush: string }> = {
  ebene: { base: '#5b3524', shade: '#472819', blush: '#7f4130' },
  cacao: { base: '#74432b', shade: '#5d331f', blush: '#97503a' },
  acajou: { base: '#8c5233', shade: '#733f25', blush: '#ad5e43' },
  cannelle: { base: '#a8683e', shade: '#8c512d', blush: '#c5704f' },
  miel: { base: '#c3834f', shade: '#a5693a', blush: '#dc8562' },
  sable: { base: '#d39a6b', shade: '#b77f51', blush: '#e8967a' },
};

/** Noir aubergine : il se détache d'une peau chaude par la teinte, même quand la luminance est proche. */
const HAIR = '#1f1820';
const HAIR_LINE = '#3d3240';
const FADE = '#54423f';
const EYE = '#1a1220';
const MOUTH = '#2e1416';
const TONGUE = '#f07a68';
const WHITE = '#ffffff';

/**
 * Tissus : une teinte franche par vêtement, accordée aux jetons v4, et au
 * plus une seconde couleur. Les noms des quatre premiers (indigo, terracotta,
 * sage, plum) sont ceux des anciens avatars : un profil existant garde
 * l'enfant le plus proche de celui qu'il avait choisi.
 */
export const PORTRAIT_FABRICS = {
  indigo: { base: '#3b63f0', shade: '#2b4bd0', light: '#cfdaff' },
  terracotta: { base: '#f2643f', shade: '#d34d2b', light: '#ffd6c7' },
  sage: { base: '#148a5c', shade: '#0e6f49', light: '#c9f0dc' },
  plum: { base: '#7c5cf2', shade: '#6243d6', light: '#e4dcff' },
  sand: { base: '#f0c58e', shade: '#dca96a', light: '#fff3e0' },
  saffron: { base: '#ffb21e', shade: '#e69500', light: '#fff1c9' },
  sky: { base: '#4aaef0', shade: '#2f93d6', light: '#dcf0ff' },
  cream: { base: '#fbf7f0', shade: '#e8e0d2', light: '#ffffff' },
  rose: { base: '#ec4c8b', shade: '#cf3272', light: '#ffd3e4' },
  indigoDye: { base: '#2e3d9a', shade: '#222e7a', light: '#c9d0ff' },
  leaf: { base: '#2fbf71', shade: '#21a05d', light: '#d3f5e2' },
  teal: { base: '#12a3a0', shade: '#0c8582', light: '#c9f1ef' },
  navy: { base: '#1f2a5c', shade: '#151d45', light: '#d7dcf2' },
} as const;
export type PortraitFabric = keyof typeof PORTRAIT_FABRICS;

/**
 * Disques : les teintes claires de l'interface, un cran plus soutenues. Chacune
 * sert exactement deux fois, jamais dans la famille du vêtement. Pas de motif.
 */
export const PORTRAIT_BACKDROPS = {
  sky: '#e2e9ff',
  lavender: '#ece6ff',
  sand: '#ffe7d4',
  mint: '#d8f2ec',
  rose: '#ffe2ec',
  sun: '#fff0c4',
} as const;
export type PortraitBackdrop = keyof typeof PORTRAIT_BACKDROPS;

// ── Géométrie commune ───────────────────────────────────────────────────

const r1 = (value: number) => Math.round(value * 10) / 10;

/** Un disque plein en un sous-tracé (deux demi-arcs) : plusieurs tiennent dans un seul `Path`. */
const dot = (x: number, y: number, r: number) =>
  `M${r1(x - r)} ${r1(y)}A${r1(r)} ${r1(r)} 0 1 0 ${r1(x + r)} ${r1(y)}A${r1(r)} ${r1(r)} 0 1 0 ${r1(x - r)} ${r1(y)}Z`;

// ── Têtes : quatre visages, une seule construction ──────────────────────
//
// Les coiffures sont dessinées sur la tête de référence (l'ovale 54 × 58).
// Chaque tête garde un crâne qui en est l'image affine — même courbure,
// autre largeur, autre hauteur —, si bien qu'une coiffure s'y pose par une
// simple mise à l'échelle autour de la ligne des tempes. Sous les tempes, la
// mâchoire est libre : c'est elle qui donne au visage sa forme.

export type PortraitHeadShape = 'oval' | 'round' | 'long' | 'cheeky';
export type PortraitEyes = 'round' | 'almond' | 'wide';
export type PortraitMouth = 'smile' | 'small' | 'crescent';

type Pt = readonly [number, number];
type Cubic = readonly [Pt, Pt, Pt, Pt];

/** La ligne des tempes : le crâne y est au plus large, les coiffures s'y raccordent. */
const TEMPLE_Y = 56;
/** La tête de référence des coiffures : l'ovale. */
const REF_HALF_WIDTH = 27;
const REF_CROWN = 28;

interface HeadSpec {
  /** Demi-largeur à la ligne des tempes. */
  hw: number;
  top: number;
  chin: number;
  /** Mâchoire : poignée verticale le long de la joue, horizontale au menton (fractions). */
  jawSide: number;
  jawChin: number;
  /** Joues pleines : le visage s'évase sous les tempes jusqu'à `hw` à la hauteur `y`. */
  cheek?: { hw: number; y: number };
  /** Les traits suivent la hauteur du visage. */
  eyeY: number;
  noseY: number;
  mouthY: number;
  blushDx: number;
  /** Bouche ouverte de la joie : demi-largeur et profondeur, accordées au visage. */
  joy: { hw: number; depth: number };
}

/**
 * Ovale 54 × 58 (la référence), rond 58 × 55 (pommettes hautes, menton
 * court), long 51 × 61 (menton étiré), joufflu 57 × 57 (crâne étroit, joues
 * pleines sous les tempes, mâchoire large).
 */
const HEADS: Record<PortraitHeadShape, HeadSpec> = {
  oval: {
    hw: 27,
    top: 28,
    chin: 86,
    jawSide: 0.583,
    jawChin: 0.574,
    eyeY: 61,
    noseY: 68.4,
    mouthY: 75,
    blushDx: 17.5,
    joy: { hw: 7, depth: 8.2 },
  },
  round: {
    hw: 29,
    top: 29,
    chin: 84,
    jawSide: 0.56,
    jawChin: 0.56,
    eyeY: 60.6,
    noseY: 67.8,
    mouthY: 74.2,
    blushDx: 19.4,
    joy: { hw: 7.8, depth: 7.4 },
  },
  long: {
    hw: 25.5,
    top: 26.5,
    chin: 87.5,
    jawSide: 0.56,
    jawChin: 0.46,
    eyeY: 61.6,
    noseY: 69.6,
    mouthY: 76.6,
    blushDx: 16,
    joy: { hw: 6.2, depth: 8.6 },
  },
  cheeky: {
    hw: 26.4,
    top: 28.5,
    chin: 85.5,
    cheek: { hw: 28.5, y: 66.5 },
    jawSide: 0.66,
    jawChin: 0.62,
    eyeY: 61.2,
    noseY: 68.8,
    mouthY: 75.4,
    blushDx: 18.8,
    joy: { hw: 7.6, depth: 7.8 },
  },
};

/** La moitié droite de la tête, du sommet au menton, en courbes de Bézier cubiques. */
function headRightHalf(h: HeadSpec): Cubic[] {
  const crown = TEMPLE_Y - h.top;
  const temple: Pt = [60 + h.hw, TEMPLE_Y];
  // Les poignées du crâne sont celles de la référence (0,593 et 0,589) : l'image affine.
  const segments: Cubic[] = [[[60, h.top], [60 + h.hw * 0.593, h.top], [60 + h.hw, TEMPLE_Y - crown * 0.589], temple]];
  let [x, y] = temple;
  if (h.cheek) {
    const [cx, cy] = [60 + h.cheek.hw, h.cheek.y];
    // La joue part des tempes déjà vers l'extérieur : un contour convexe, sans taille marquée.
    segments.push([[x, y], [x + (cx - x) * 0.6, y + (cy - y) * 0.3], [cx, cy - (cy - y) * 0.45], [cx, cy]]);
    [x, y] = [cx, cy];
  }
  segments.push([[x, y], [x, y + (h.chin - y) * h.jawSide], [60 + (x - 60) * h.jawChin, h.chin], [60, h.chin]]);
  return segments;
}

/** La tête entière : la moitié droite, puis son miroir parcouru à rebours. */
function headPath(segments: readonly Cubic[]): string {
  const f = (p: Pt) => `${r1(p[0])} ${r1(p[1])}`;
  const m = (p: Pt): Pt => [120 - p[0], p[1]];
  const [first] = segments;
  let d = first ? `M${f(first[0])}` : '';
  for (const [, c1, c2, end] of segments) {
    d += `C${f(c1)} ${f(c2)} ${f(end)}`;
  }
  for (const [start, c1, c2] of [...segments].reverse()) {
    d += `C${f(m(c2))} ${f(m(c1))} ${f(m(start))}`;
  }
  return `${d}Z`;
}

/** Abscisse du bord droit de la tête à la hauteur `y` (chaque courbe y est monotone). */
function headEdgeAt(segments: readonly Cubic[], y: number): number {
  for (const [p0, p1, p2, p3] of segments) {
    if (y < Math.min(p0[1], p3[1]) || y > Math.max(p0[1], p3[1])) {
      continue;
    }
    const at = (t: number, i: 0 | 1) => {
      const u = 1 - t;
      return u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i];
    };
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 32; k += 1) {
      const mid = (lo + hi) / 2;
      if ((at(mid, 1) - y) * (p3[1] - p0[1]) > 0) {
        hi = mid;
      } else {
        lo = mid;
      }
    }
    return at((lo + hi) / 2, 0);
  }
  return 60;
}

export interface HeadGeometry {
  readonly spec: HeadSpec;
  readonly d: string;
  /** Oreilles : centres (gauche, droite), hauteur, rayon — et leur tracé. */
  readonly ear: { readonly left: number; readonly right: number; readonly y: number; readonly r: number };
  readonly ears: string;
  /** Mise à l'échelle des coiffures autour de la ligne des tempes (absente pour l'ovale). */
  readonly hairTransform: string | undefined;
  /** Bord droit de la tête à une hauteur donnée (tests : cou, oreilles). */
  readonly edgeAt: (y: number) => number;
}

const EAR_R = 5.6;

function buildHead(spec: HeadSpec): HeadGeometry {
  const segments = headRightHalf(spec);
  // L'oreille garde sa place par rapport aux yeux ; son centre sur le bord du visage.
  const earY = r1(62 + (spec.eyeY - 61));
  const right = r1(headEdgeAt(segments, earY) - 0.1);
  const left = r1(120 - right);
  const sx = spec.hw / REF_HALF_WIDTH;
  const sy = (TEMPLE_Y - spec.top) / (TEMPLE_Y - REF_CROWN);
  const identity = Math.abs(sx - 1) < 1e-6 && Math.abs(sy - 1) < 1e-6;
  return {
    spec,
    d: headPath(segments),
    ear: { left, right, y: earY, r: EAR_R },
    ears: dot(left, earY, EAR_R) + dot(right, earY, EAR_R),
    hairTransform: identity
      ? undefined
      : `matrix(${+sx.toFixed(4)} 0 0 ${+sy.toFixed(4)} ${+(60 - 60 * sx).toFixed(3)} ${+(TEMPLE_Y - TEMPLE_Y * sy).toFixed(3)})`,
    edgeAt: (y) => headEdgeAt(segments, y),
  };
}

/** Les quatre têtes, calculées une fois au chargement du module. */
export const PORTRAIT_HEADS: Record<PortraitHeadShape, HeadGeometry> = {
  oval: buildHead(HEADS.oval),
  round: buildHead(HEADS.round),
  long: buildHead(HEADS.long),
  cheeky: buildHead(HEADS.cheeky),
};

/** La tête de référence des coiffures (ovale 54 × 58). */
export const HEAD_D = PORTRAIT_HEADS.oval.d;

const NECKS = {
  crew: 'M51.5 76H68.5V99H51.5Z',
  vee: 'M51.5 76H68.5V92L60 104L51.5 92Z',
  scoop: 'M51.5 76H68.5V90.5C71 91 73.5 92 75 93C71 102 49 102 45 93C46.5 92 49 91 51.5 90.5Z',
} as const;
const SH_L = 'M-4 124C-4 105 17 94.6 46 92.6';
const SH_R = 'C103 94.6 124 105 124 124Z';
const BUSTS = {
  crew: `${SH_L}C50 98.6 70 98.6 74 92.6${SH_R}`,
  vee: `${SH_L}L60 104L74 92.6${SH_R}`,
  scoop: 'M-4 124C-4 105 16 95 45 93C49 102 71 102 75 93C104 95 124 105 124 124Z',
} as const;
type NeckKind = keyof typeof NECKS;

/**
 * Un bord festonné le long d'un arc d'ellipse (angles en degrés, y vers le
 * bas) : chaque lobe est un arc de cercle dont la corde est un pas de
 * l'ellipse, et dont la flèche vaut `bulge` × la demi-corde.
 */
function lobed(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number, bulge: number): string {
  const points: [number, number][] = [];
  for (let i = 0; i <= n; i += 1) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    points.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
  const [first] = points;
  let d = `M${r1(first?.[0] ?? 0)} ${r1(first?.[1] ?? 0)}`;
  for (let i = 1; i < points.length; i += 1) {
    const [x0, y0] = points[i - 1] ?? [0, 0];
    const [x1, y1] = points[i] ?? [0, 0];
    const c = Math.hypot(x1 - x0, y1 - y0) / 2;
    const s = bulge * c;
    const r = (c * c + s * s) / (2 * s);
    d += `A${r1(r)} ${r1(r)} 0 0 1 ${r1(x1)} ${r1(y1)}`;
  }
  return d;
}

const circleLobed = (cx: number, cy: number, r: number, n: number, bulge: number, start = -90) =>
  `${lobed(cx, cy, r, r, start, start + 360, n, bulge)}Z`;

/** La ligne frontale « line-up » commune, fermant un volume festonné. */
const lineUp = (side: number) =>
  `H84.8C84.8 48 83.6 44 80.6 41.6C75 40.6 67 40.2 60 40.2C53 40.2 45 40.6 39.4 41.6C36.4 44 35.2 48 35.2 ${side}H32.4`;

/** Volume crépu : un arc festonné sur le crâne, fermé sur la ligne frontale. */
const lobedCap = (cx: number, cy: number, rx: number, ry: number, n: number, bulge: number, a0: number, a1: number, side = 55) =>
  `${lobed(cx, cy, rx, ry, a0, a1, n, bulge)}L87.6 ${side}${lineUp(side)}Z`;

/** Calotte qui épouse le crâne : volume `top`, ligne frontale `hl`, tempes `corner`, pattes jusqu'à `side`. */
function cap(top = 23.5, hl = 40.5, side = 54, inset = 2.8, corner = 39.5): string {
  const l = 32.4;
  const r = 87.6;
  const li = r1(l + inset);
  const ri = r1(r - inset);
  const rc = r1(120 - corner);
  return (
    `M${l} ${side}C${r1(l - 1.6)} 37 42.5 ${top} 60 ${top}C77.5 ${top} ${r1(r + 1.6)} 37 ${r} ${side}` +
    `H${ri}C${ri} 47 ${r1(ri - 1.2)} 43.5 ${rc} ${r1(hl + 1)}C75 ${r1(hl + 0.4)} 67 ${hl} 60 ${hl}C53 ${hl} 45 ${r1(hl + 0.4)} ${corner} ${r1(hl + 1)}` +
    `C${r1(li + 1.2)} 43.5 ${li} 47 ${li} ${side}Z`
  );
}

/** Une natte : une chaîne d'ellipses qui se chevauchent (un seul tracé). */
function braid(x: number, y0: number, y1: number, w: number, n: number): string {
  const step = (y1 - y0) / n;
  const ry = r1(step * 0.72);
  const rx = r1(w / 2);
  let d = '';
  for (let i = 0; i < n; i += 1) {
    const cy = r1(y0 + step * (i + 0.5));
    d += `M${r1(x - rx)} ${cy}A${rx} ${ry} 0 1 0 ${r1(x + rx)} ${cy}A${rx} ${ry} 0 1 0 ${r1(x - rx)} ${cy}Z`;
  }
  return d;
}

/** La natte relevée (n° 9) : un ruban effilé (9,4 → 5,8) qui monte du sommet et retombe à droite. */
const PONYTAIL_POINTS: readonly [number, number][] = [
  [66.5, 23],
  [71.5, 18.5],
  [77.5, 16.5],
  [83.5, 17.6],
  [88, 21.2],
  [91, 26.8],
  [92.6, 33],
  [93.2, 39.5],
  [93, 46],
];

function tangent(k: number): [number, number] {
  const pts = PONYTAIL_POINTS;
  const [nx, ny] = pts[Math.min(k + 1, pts.length - 1)] ?? [0, 0];
  const [px, py] = pts[Math.max(k - 1, 0)] ?? [0, 0];
  const n = Math.hypot(nx - px, ny - py);
  return [(nx - px) / n, (ny - py) / n];
}

function ponytail(): { ribbon: string; chevrons: string } {
  const pts = PONYTAIL_POINTS;
  const left: [number, number][] = [];
  const right: [number, number][] = [];
  pts.forEach(([x, y], k) => {
    const [tx, ty] = tangent(k);
    const w = (9.4 - (3.6 * k) / (pts.length - 1)) / 2;
    left.push([x - ty * w, y + tx * w]);
    right.push([x + ty * w, y - tx * w]);
  });
  const smooth = (side: [number, number][]) => {
    const [a] = side;
    let d = `L${r1(a?.[0] ?? 0)} ${r1(a?.[1] ?? 0)}`;
    for (let i = 1; i < side.length - 1; i += 1) {
      const [x, y] = side[i] ?? [0, 0];
      const [nx, ny] = side[i + 1] ?? [0, 0];
      d += `Q${r1(x)} ${r1(y)} ${r1((x + nx) / 2)} ${r1((y + ny) / 2)}`;
    }
    const [z] = side.slice(-1);
    return `${d}L${r1(z?.[0] ?? 0)} ${r1(z?.[1] ?? 0)}`;
  };
  const [l0] = left;
  const [rEnd] = right.slice(-1);
  const ribbon = `M${r1(l0?.[0] ?? 0)} ${r1(l0?.[1] ?? 0)}${smooth(left)}A2.9 2.9 0 0 0 ${r1(rEnd?.[0] ?? 0)} ${r1(rEnd?.[1] ?? 0)}${smooth([...right].reverse())}Z`;
  let chevrons = '';
  for (let k = 1; k < pts.length - 1; k += 1) {
    const [x, y] = pts[k] ?? [0, 0];
    const [tx, ty] = tangent(k);
    const w = (9.4 - (3.6 * k) / (pts.length - 1)) / 2 - 1.2;
    chevrons += `M${r1(x - ty * w - tx * 1.6)} ${r1(y + tx * w - ty * 1.6)}L${r1(x)} ${r1(y)}L${r1(x + ty * w - tx * 1.6)} ${r1(y - tx * w - ty * 1.6)}`;
  }
  return { ribbon, chevrons };
}

// Les formes calculées une fois, au chargement du module.
const SHAPES = {
  miniAfro: lobedCap(60, 43, 30, 22.5, 7, 0.42, 168, 372),
  roundAfro: lobedCap(60, 41, 31.5, 28.5, 8, 0.42, 165, 375),
  afroHalo: `${lobed(60, 52, 37, 36, 140, 400, 11, 0.5)}Z`,
  puffs: circleLobed(37.5, 29.5, 12.5, 9, 0.42) + circleLobed(82.5, 29.5, 12.5, 9, 0.42, -70),
  braids: braid(31.5, 50, 98, 7, 7) + braid(88.5, 50, 98, 7, 7),
  ponytail: ponytail(),
  standardCap: cap(24.5, 40.5),
  puffsCap: cap(25, 40.5),
  twistsCap: cap(26, 41.5, 54, 2.8, 40.5),
  fadeSides: cap(26, 41.5, 52, 2.8, 40.5),
  hatHair: cap(30, 46, 55, 2.8, 41),
} as const;

const FAB = PORTRAIT_FABRICS;
const round = { strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

// ── Cheveux : derrière la tête, puis devant ────────────────────────────

type HairDraw = (full: boolean, shade: string) => { back?: ReactElement; front: ReactElement };

const HAIRS: Record<PortraitHair, HairDraw> = {
  'side-part': (full, shade) => ({
    front: (
      <>
        <Path
          d="M32.4 55C30.4 36 42 21.5 58 21.5C66 21.5 73 23 78.5 27C85 31.5 89.6 41 87.6 55H84.8C84.8 48 83.6 44 80.6 41.4C75 40.6 67 40.2 60 40.2C53 40.2 45 40.6 39.4 41.4C36.4 44 35.2 48 35.2 55Z"
          fill={HAIR}
        />
        {full ? <Path d="M48 40.6C47 33 50 26.5 55 23" stroke={shade} strokeWidth={1.6} {...round} /> : null}
      </>
    ),
  }),
  puffs: (full, shade) => ({
    back: <Path d={SHAPES.puffs} fill={HAIR} />,
    front: (
      <>
        <Path d={SHAPES.puffsCap} fill={HAIR} />
        <Rect x={40.5} y={33.5} width={9} height={5.4} rx={2.7} transform="rotate(-40 45 36.2)" fill={FAB.saffron.base} />
        <Rect x={70.5} y={33.5} width={9} height={5.4} rx={2.7} transform="rotate(40 75 36.2)" fill={FAB.saffron.base} />
        {full ? <Path d="M60 25.4V40" stroke={shade} strokeWidth={1.6} {...round} /> : null}
      </>
    ),
  }),
  'mini-afro': () => ({ front: <Path d={SHAPES.miniAfro} fill={HAIR} /> }),
  'cornrow-braids': (full) => ({
    back: (
      <>
        <Path d={SHAPES.braids} fill={HAIR} />
        <Circle cx={31.5} cy={101} r={full ? 3.4 : 4} fill={FAB.saffron.base} />
        <Circle cx={88.5} cy={101} r={full ? 3.4 : 4} fill={FAB.sky.base} />
      </>
    ),
    front: (
      <>
        <Path d={SHAPES.standardCap} fill={HAIR} />
        {full ? (
          <Path
            d="M47.5 26.6C46.6 31 46.8 35.5 48 40M60 24.6V40M72.5 26.6C73.4 31 73.2 35.5 72 40"
            stroke={HAIR_LINE}
            strokeWidth={1.5}
            {...round}
          />
        ) : null}
      </>
    ),
  }),
  'knotted-scarf': (full) => ({
    front: (
      <>
        <Path
          d="M31 50C29.6 32 42.5 19.5 60 19.5C77.5 19.5 90.4 32 89 50C83 44.6 72.5 41.6 60 41.6C47.5 41.6 37 44.6 31 50Z"
          fill={FAB.teal.base}
        />
        <Path d="M70 24.5C71.5 15.5 80 11.5 85 14.5C89 17 86.5 24 77.5 27.5Z" fill={FAB.teal.base} />
        <Path d="M77 26C85.5 23.5 93 27 92 32.5C91 37 83.5 35.5 76.5 30Z" fill={FAB.teal.shade} />
        <Circle cx={75.6} cy={27.4} r={5} fill={FAB.teal.shade} />
        {full ? (
          <Path d="M40 33.5H52M56 27.5H68M45.5 39.5H55M66 34H76" stroke={FAB.teal.light} strokeWidth={2.2} {...round} />
        ) : null}
      </>
    ),
  }),
  'round-afro': () => ({ front: <Path d={SHAPES.roundAfro} fill={HAIR} /> }),
  'natural-afro': () => ({
    back: <Path d={SHAPES.afroHalo} fill={HAIR} />,
    front: (
      <Path
        d="M34 56C32 40 43.5 27 60 27C76.5 27 88 40 86 56H84.6C84.4 49 82.6 45 79.4 42.4C74.4 39.8 67.6 39 60 39C52.4 39 45.6 39.8 40.6 42.4C37.4 45 35.6 49 35.4 56Z"
        fill={HAIR}
      />
    ),
  }),
  'bucket-hat': () => ({
    front: (
      <>
        <Path d={SHAPES.hatHair} fill={HAIR} />
        <Path d="M38 42.5C38 28.5 47.5 19.5 60 19.5C72.5 19.5 82 28.5 82 42.5Z" fill={FAB.saffron.base} />
        <Path
          d="M37.5 40H82.5L91.4 49C92.4 50.1 91.6 51.6 90.1 51.4C80 50.3 70 49.8 60 49.8C50 49.8 40 50.3 29.9 51.4C28.4 51.6 27.6 50.1 28.6 49Z"
          fill={FAB.saffron.shade}
        />
        <Path d="M38.4 35.6H81.6V40.6H38.4Z" fill={FAB.navy.base} />
      </>
    ),
  }),
  'side-loops': (full) => ({
    back: (
      <>
        <Path d={SHAPES.ponytail.ribbon} fill={HAIR} />
        {full ? <Path d={SHAPES.ponytail.chevrons} stroke={HAIR_LINE} strokeWidth={1.4} {...round} /> : null}
        <Circle cx={93} cy={49.2} r={full ? 3.2 : 3.8} fill={FAB.saffron.base} />
      </>
    ),
    front: (
      <>
        <Path d={SHAPES.standardCap} fill={HAIR} />
        <Rect x={60} y={19} width={10.5} height={6} rx={3} transform="rotate(-42 65.2 22)" fill={FAB.saffron.base} />
        {full ? (
          <Path
            d="M47 27.2C46.4 31.5 46.8 36 48 40M58 25C58.4 30 58.6 35 59 40M70 26C70.8 30.5 71.4 35.5 71.4 40"
            stroke={HAIR_LINE}
            strokeWidth={1.5}
            {...round}
          />
        ) : null}
      </>
    ),
  }),
  'shaved-line': () => ({
    front: (
      <>
        <Path d={SHAPES.fadeSides} fill={FADE} />
        <Path
          d="M33.4 46C33.6 34 44.5 26 60 26C75.5 26 86.4 34 86.6 46C80.6 42.6 71 41.4 60 41.4C49 41.4 39.4 42.6 33.4 46Z"
          fill={HAIR}
        />
      </>
    ),
  }),
  'crown-bun': () => ({
    back: <Circle cx={60} cy={20} r={10} fill={HAIR} />,
    front: (
      <>
        <Path d={SHAPES.standardCap} fill={HAIR} />
        <Path d="M42.5 30C48 26.6 54 25.4 60 25.4C66 25.4 72 26.6 77.5 30" stroke={FAB.saffron.base} strokeWidth={4} {...round} />
      </>
    ),
  }),
  'soft-curls': () => ({
    front: (
      <>
        <Path d={SHAPES.twistsCap} fill={HAIR} />
        <Path
          d="M35.1 33A6.4 6.4 0 1 0 47.9 33A6.4 6.4 0 1 0 35.1 33ZM43.2 26.5A6.8 6.8 0 1 0 56.8 26.5A6.8 6.8 0 1 0 43.2 26.5ZM53 24A7 7 0 1 0 67 24A7 7 0 1 0 53 24ZM63.2 26.5A6.8 6.8 0 1 0 76.8 26.5A6.8 6.8 0 1 0 63.2 26.5ZM72.1 33A6.4 6.4 0 1 0 84.9 33A6.4 6.4 0 1 0 72.1 33Z"
          fill={HAIR}
        />
      </>
    ),
  }),
};

/**
 * Ce que chaque coiffure laisse voir — un foulard noué montre la racine, les
 * oreilles et le cou : c'est un accessoire de mode, pas un voile.
 */
export const HAIR_COVERAGE: Record<PortraitHair, { hairline: boolean; ears: boolean; neck: boolean }> = {
  'side-part': { hairline: true, ears: true, neck: true },
  puffs: { hairline: true, ears: true, neck: true },
  'mini-afro': { hairline: true, ears: true, neck: true },
  'cornrow-braids': { hairline: true, ears: true, neck: true },
  'knotted-scarf': { hairline: true, ears: true, neck: true },
  'round-afro': { hairline: true, ears: true, neck: true },
  'natural-afro': { hairline: true, ears: true, neck: true },
  'bucket-hat': { hairline: false, ears: true, neck: true },
  'side-loops': { hairline: true, ears: true, neck: true },
  'shaved-line': { hairline: true, ears: true, neck: true },
  'crown-bun': { hairline: true, ears: true, neck: true },
  'soft-curls': { hairline: true, ears: true, neck: true },
};

// ── Visage ──────────────────────────────────────────────────────────────

/**
 * Yeux : trois regards. Ronds et rapprochés, en amande (plus larges que
 * hauts, le coin extérieur relevé), grands et écartés. Le point de lumière
 * suit chaque œil ; la joie les plisse en arcs accordés à leur forme.
 */
interface EyeSpec {
  /** Demi-écart entre les centres. */
  dx: number;
  rx: number;
  ry: number;
  /** Inclinaison (degrés), coin extérieur vers le haut. */
  tilt: number;
  /** Arc de la joie : demi-largeur et flèche. */
  joy: { hw: number; rise: number };
  /** Les sourcils se rapprochent d'un œil moins haut. */
  browDy: number;
  /** Point de lumière : décalage horizontal, en fraction de `rx` (près du centre sur un œil large). */
  glint: number;
}

const EYES: Record<PortraitEyes, EyeSpec> = {
  round: { dx: 10, rx: 3.6, ry: 3.8, tilt: 0, joy: { hw: 3.6, rise: 2.6 }, browDy: -0.2, glint: 0.38 },
  almond: { dx: 11, rx: 4.3, ry: 3.2, tilt: 4, joy: { hw: 4.3, rise: 2.1 }, browDy: 0.7, glint: 0.26 },
  wide: { dx: 12.5, rx: 3.5, ry: 4.5, tilt: 0, joy: { hw: 4.2, rise: 3 }, browDy: -0.5, glint: 0.38 },
};

/** Sourcils, le gauche, relatifs au centre de l'œil : départ, contrôle, arrivée ; le droit en miroir. */
const BROWS: Record<PortraitBrow, readonly [number, number, number, number, number, number]> = {
  arch: [-4.2, -8.2, 0, -11.6, 4.2, -9.4],
  straight: [-4.2, -8.8, 0, -10.4, 4.2, -9.6],
  round: [-4.2, -8.2, 0, -11.2, 4.2, -9.4],
  lifted: [-4.2, -8.6, 0, -10.8, 4.2, -10.4],
};

/** Nez : un seul trait, plus ou moins large — demi-largeur, creux, décalage vertical. */
const NOSES: Record<PortraitNose, readonly [number, number, number]> = {
  broad: [3.8, 2.8, 0],
  round: [3.4, 2.6, 0],
  button: [2.8, 2, 0.2],
};

/** Les centres des deux yeux pour une tête et un regard. */
export function eyeCenters(head: PortraitHeadShape, eyes: PortraitEyes): { left: number; right: number; y: number } {
  const { dx } = EYES[eyes];
  return { left: 60 - dx, right: 60 + dx, y: HEADS[head].eyeY };
}

function eyesPath(e: EyeSpec, y: number, k: number): string {
  let d = '';
  for (const side of [-1, 1] as const) {
    const cx = 60 + side * e.dx;
    const theta = -side * e.tilt;
    const rad = (theta * Math.PI) / 180;
    const [ux, uy] = [Math.cos(rad) * e.rx * k, Math.sin(rad) * e.rx * k];
    const [rx, ry] = [r1(e.rx * k), r1(e.ry * k)];
    const a = `A${rx} ${ry} ${theta} 1 0`;
    d += `M${r1(cx - ux)} ${r1(y - uy)}${a} ${r1(cx + ux)} ${r1(y + uy)}${a} ${r1(cx - ux)} ${r1(y - uy)}Z`;
  }
  return d;
}

function mouthPaths(
  head: HeadSpec,
  mouth: PortraitMouth,
  joy: boolean,
  full: boolean,
): { line?: string; fill?: string; tongue?: string } {
  const y = head.mouthY;
  if (joy) {
    // La bouche ouverte suit le visage : large et courte sur un visage rond, étroite et haute sur un long.
    const { hw: w, depth } = head.joy;
    const top = y - 1.4;
    const bottom = top + depth;
    const sx = w / 7;
    const sy = depth / 8.2;
    const t = (dx: number) => r1(60 + dx * sx);
    const u = (dy: number) => r1(bottom - dy * sy);
    return {
      fill: `M${t(-7)} ${r1(top)}H${t(7)}C${t(7)} ${r1(top + depth * 0.634)} ${t(4)} ${r1(bottom)} 60 ${r1(bottom)}C${t(-4)} ${r1(bottom)} ${t(-7)} ${r1(top + depth * 0.634)} ${t(-7)} ${r1(top)}Z`,
      tongue: `M${t(-4)} ${u(1.7)}C${t(-2.4)} ${u(3.2)} ${t(2.4)} ${u(3.2)} ${t(4)} ${u(1.7)}C${t(3)} ${u(0.6)} ${t(1.6)} ${u(0)} 60 ${u(0)}C${t(-1.6)} ${u(0)} ${t(-3)} ${u(0.6)} ${t(-4)} ${u(1.7)}Z`,
    };
  }
  if (mouth === 'crescent') {
    // Le sourire fermé : un croissant plein, effilé aux commissures.
    const belly = full ? 7 : 8.4;
    return { fill: `M54.4 ${r1(y - 0.4)}Q60 ${r1(y + 2)} 65.6 ${r1(y - 0.4)}Q60 ${r1(y + belly)} 54.4 ${r1(y - 0.4)}Z` };
  }
  if (mouth === 'small') {
    return { line: `M56.2 ${r1(y + 0.3)}Q60 ${r1(y + 3.6)} 63.8 ${r1(y + 0.3)}` };
  }
  return { line: `M55 ${r1(y)}Q60 ${r1(y + 4.2)} 65 ${r1(y)}` };
}

export function PortraitFace({
  skin,
  head,
  eyes,
  mouth,
  brow,
  nose,
  expression,
  lod,
  brows = true,
}: {
  skin: PortraitSkin;
  head: PortraitHeadShape;
  eyes: PortraitEyes;
  mouth: PortraitMouth;
  brow: PortraitBrow;
  nose: PortraitNose;
  expression: PortraitExpression;
  lod: PortraitLod;
  /** Sous un chapeau, les sourcils ne se voient pas. */
  brows?: boolean;
}) {
  const tone = PORTRAIT_SKINS[skin];
  const full = lod === 'full';
  const joy = expression === 'joy';
  const h = HEADS[head];
  const e = EYES[eyes];
  const y = h.eyeY;
  const blushY = h.mouthY - 5;
  const [bx0, by0, bcx, bcy, bx1, by1] = BROWS[brow];
  // Joie : les sourcils se lèvent.
  const lift = e.browDy + (joy ? -1.4 : 0);
  const browD = ([-1, 1] as const)
    .map((side) => {
      const cx = 60 + side * e.dx;
      // Le sourcil gauche est décrit tel quel ; le droit en est le miroir.
      const p = (dx: number, dy: number) => `${r1(cx - side * dx)} ${r1(y + dy + lift)}`;
      return `M${p(bx0, by0)}Q${p(bcx, bcy)} ${p(bx1, by1)}`;
    })
    .join('');
  const [nw, ndip, ndy] = NOSES[nose];
  const ny = h.noseY + ndy;
  const k = full ? 1 : 1.16;
  const m = mouthPaths(h, mouth, joy, full);
  return (
    <>
      <Path
        d={`M${r1(60 - h.blushDx - 4.8)} ${blushY}A4.8 3.2 0 1 0 ${r1(60 - h.blushDx + 4.8)} ${blushY}A4.8 3.2 0 1 0 ${r1(60 - h.blushDx - 4.8)} ${blushY}ZM${r1(60 + h.blushDx - 4.8)} ${blushY}A4.8 3.2 0 1 0 ${r1(60 + h.blushDx + 4.8)} ${blushY}A4.8 3.2 0 1 0 ${r1(60 + h.blushDx - 4.8)} ${blushY}Z`}
        fill={tone.blush}
      />
      {brows ? <Path d={browD} stroke={HAIR} strokeWidth={full ? 2.2 : 3.2} {...round} /> : null}
      {joy ? (
        <Path
          d={([-1, 1] as const)
            .map((side) => {
              const cx = 60 + side * e.dx;
              const base = r1(y + 1.6);
              return `M${r1(cx - e.joy.hw)} ${base}Q${r1(cx)} ${r1(base - 2 * e.joy.rise)} ${r1(cx + e.joy.hw)} ${base}`;
            })
            .join('')}
          stroke={EYE}
          strokeWidth={full ? 2.7 : 3.4}
          {...round}
        />
      ) : (
        <>
          <Path d={eyesPath(e, y, k)} fill={EYE} />
          {full ? (
            <Path
              d={([-1, 1] as const)
                .map((side) => dot(60 + side * e.dx + e.rx * e.glint, y - e.ry * 0.42, Math.min(e.rx, e.ry) * 0.37))
                .join('')}
              fill={WHITE}
            />
          ) : null}
        </>
      )}
      {full ? (
        <Path d={`M${r1(60 - nw)} ${r1(ny)}Q60 ${r1(ny + ndip)} ${r1(60 + nw)} ${r1(ny)}`} stroke={tone.shade} strokeWidth={2} {...round} />
      ) : null}
      {m.fill ? <Path d={m.fill} fill={MOUTH} /> : null}
      {m.tongue ? <Path d={m.tongue} fill={TONGUE} /> : null}
      {m.line ? <Path d={m.line} stroke={MOUTH} strokeWidth={full ? 2.4 : 3} {...round} /> : null}
    </>
  );
}

// ── Vêtements ───────────────────────────────────────────────────────────

interface GarmentSpec {
  /** Nom du tissu dominant (les quatre premiers sont ceux des anciens avatars). */
  fabric: PortraitFabric;
  neck: NeckKind;
  detail?: (full: boolean) => ReactElement | null;
}

const COLLAR_D = 'M47 92.8L60 104.4L52.6 107.2L44 96.4ZM73 92.8L60 104.4L67.4 107.2L76 96.4Z';

export const PORTRAIT_GARMENTS: Record<PortraitGarment, GarmentSpec> = {
  'school-shirt': { fabric: 'indigo', neck: 'vee', detail: () => <Path d={COLLAR_D} fill={FAB.indigo.light} /> },
  'pagne-dress': {
    fabric: 'terracotta',
    neck: 'scoop',
    detail: (full) => (
      <>
        <Path d="M-4 108H124V115H-4Z" fill={FAB.saffron.base} />
        {full ? (
          <Path
            d="M34.1 111.5A1.9 1.9 0 1 0 37.9 111.5A1.9 1.9 0 1 0 34.1 111.5ZM46.1 111.5A1.9 1.9 0 1 0 49.9 111.5A1.9 1.9 0 1 0 46.1 111.5ZM58.1 111.5A1.9 1.9 0 1 0 61.9 111.5A1.9 1.9 0 1 0 58.1 111.5ZM70.1 111.5A1.9 1.9 0 1 0 73.9 111.5A1.9 1.9 0 1 0 70.1 111.5ZM82.1 111.5A1.9 1.9 0 1 0 85.9 111.5A1.9 1.9 0 1 0 82.1 111.5Z"
            fill={FAB.terracotta.base}
          />
        ) : null}
      </>
    ),
  },
  jalabiya: {
    fabric: 'sage',
    neck: 'crew',
    detail: () => (
      <>
        <Path d="M46 94.8C50 100.8 70 100.8 74 94.8" stroke={FAB.sage.light} strokeWidth={2.6} {...round} />
        <Path d="M60 99.6V112" stroke={FAB.sage.light} strokeWidth={2.4} {...round} />
      </>
    ),
  },
  'plain-top': { fabric: 'plum', neck: 'scoop' },
  'claudine-dress': {
    fabric: 'sand',
    neck: 'crew',
    detail: () => (
      <Path
        d="M46 92.6C44 97.8 46.6 102.4 52 102.4C56.4 102.4 59.4 99.6 60 96.8C55 96.6 49.4 95.2 46 92.6ZM74 92.6C76 97.8 73.4 102.4 68 102.4C63.6 102.4 60.6 99.6 60 96.8C65 96.6 70.6 95.2 74 92.6Z"
        fill={WHITE}
      />
    ),
  },
  polo: {
    fabric: 'saffron',
    neck: 'vee',
    detail: (full) => (
      <>
        <Path d="M47 92.8L60 104.4L53.2 107L44.6 96.6ZM73 92.8L60 104.4L66.8 107L75.4 96.6Z" fill={FAB.saffron.shade} />
        {full ? <Circle cx={60} cy={110.5} r={1.6} fill={FAB.saffron.shade} /> : null}
      </>
    ),
  },
  'school-dress': { fabric: 'sky', neck: 'crew' },
  // Une marinière inversée : fond marine, rayures crème. Posé sur la toile
  // claire, un vêtement de teinte moyenne garde le bord bas du disque.
  'striped-tshirt': {
    fabric: 'navy',
    neck: 'crew',
    detail: () => <Path d="M-4 105H124V110H-4ZM-4 115.5H124V120.5H-4Z" fill={FAB.cream.base} />,
  },
  'embroidered-dress': {
    fabric: 'rose',
    neck: 'scoop',
    detail: (full) =>
      full ? (
        <Path
          d="M44.6 98A1.9 1.9 0 1 0 48.4 98A1.9 1.9 0 1 0 44.6 98ZM49.6 102.4A1.9 1.9 0 1 0 53.4 102.4A1.9 1.9 0 1 0 49.6 102.4ZM55.5 104.4A1.9 1.9 0 1 0 59.3 104.4A1.9 1.9 0 1 0 55.5 104.4ZM60.7 104.4A1.9 1.9 0 1 0 64.5 104.4A1.9 1.9 0 1 0 60.7 104.4ZM66.6 102.4A1.9 1.9 0 1 0 70.4 102.4A1.9 1.9 0 1 0 66.6 102.4ZM71.6 98A1.9 1.9 0 1 0 75.4 98A1.9 1.9 0 1 0 71.6 98Z"
          fill={FAB.saffron.base}
        />
      ) : null,
  },
  'checked-shirt': {
    fabric: 'sky',
    neck: 'vee',
    // Un vichy bleu : deux jeux de bandes blanches à 35 % sur le bleu — les
    // croisements s'éclaircissent. Teinte moyenne : le bord du disque tient.
    detail: () => (
      <>
        <Path d="M-4 99H124V103.5H-4ZM-4 108H124V112.5H-4ZM-4 117H124V121.5H-4Z" fill={WHITE} opacity={0.35} />
        <Path
          d="M25 90H29.5V124H25ZM34 90H38.5V124H34ZM43 90H47.5V124H43ZM72.5 90H77V124H72.5ZM81.5 90H86V124H81.5ZM90.5 90H95V124H90.5Z"
          fill={WHITE}
          opacity={0.35}
        />
        <Path d={COLLAR_D} fill={FAB.cream.base} />
      </>
    ),
  },
  'boubou-top': {
    fabric: 'indigoDye',
    neck: 'scoop',
    detail: () => <Path d="M45 96C49 105 71 105 75 96" stroke={FAB.saffron.base} strokeWidth={3.2} {...round} />,
  },
  'pocket-tshirt': {
    fabric: 'leaf',
    neck: 'crew',
    detail: (full) => (full ? <Rect x={69} y={104} width={12} height={11} rx={3} fill={FAB.leaf.shade} /> : null),
  },
};

// ── Accessoires (la personne, jamais l'écolier) ─────────────────────────

/** Les accessoires suivent la tête (oreilles) et le regard (lunettes). */
function Accessories({
  accessories,
  lod,
  layer,
  head,
  eyes,
}: {
  accessories: readonly PortraitAccessory[];
  lod: PortraitLod;
  layer: 'ears' | 'face';
  head: PortraitHeadShape;
  eyes: PortraitEyes;
}) {
  const full = lod === 'full';
  const { ear } = PORTRAIT_HEADS[head];
  return (
    <>
      {accessories.map((accessory) => {
        if (layer === 'face' && accessory === 'glasses') {
          const c = eyeCenters(head, eyes);
          const r = 7;
          return (
            <Path
              key={accessory}
              d={`${dot(c.left, c.y, r)}${dot(c.right, c.y, r)}M${r1(c.left + r)} ${r1(c.y - 1)}Q60 ${r1(c.y - 3)} ${r1(c.right - r)} ${r1(c.y - 1)}`}
              stroke={FAB.indigo.base}
              strokeWidth={full ? 2.4 : 3.2}
              fill="none"
            />
          );
        }
        if (layer === 'ears' && accessory === 'hearing-aid') {
          const x = ear.right;
          const y = ear.y;
          return (
            <Path
              key={accessory}
              d={`M${r1(x + 1.6)} ${r1(y - 8.5)}C${r1(x + 7.1)} ${r1(y - 8.5)} ${r1(x + 8.4)} ${r1(y - 1)} ${r1(x + 5.2)} ${r1(y + 4.4)}`}
              stroke={FAB.sky.base}
              strokeWidth={full ? 3.6 : 4.4}
              {...round}
            />
          );
        }
        if (layer === 'ears' && accessory === 'stud-earrings' && full) {
          return (
            <Path
              key={accessory}
              d={dot(ear.left, ear.y + 6.4, 2.1) + dot(ear.right, ear.y + 6.4, 2.1)}
              fill={FAB.saffron.base}
            />
          );
        }
        if (layer === 'ears' && accessory === 'hoop-earrings' && full) {
          return (
            <Path
              key={accessory}
              d={dot(ear.left, ear.y + 8.2, 3.8) + dot(ear.right, ear.y + 8.2, 3.8)}
              stroke={FAB.saffron.base}
              strokeWidth={1.8}
              fill="none"
            />
          );
        }
        return null;
      })}
    </>
  );
}

// ── Portrait complet ────────────────────────────────────────────────────

export interface PortraitSpec {
  skin: PortraitSkin;
  head: PortraitHeadShape;
  eyes: PortraitEyes;
  mouth: PortraitMouth;
  hair: PortraitHair;
  garment: PortraitGarment;
  accessories: readonly PortraitAccessory[];
  brow: PortraitBrow;
  nose: PortraitNose;
}

/** Cadrage commun : la tête remplit 48 à 50 % du disque, le buste passe le bord. */
const frameOf = (lod: PortraitLod) => `translate(60 66) scale(${lod === 'full' ? 1.06 : 1.1}) translate(-60 -66)`;

function Figure({ spec, expression, lod, bust }: { spec: PortraitSpec; expression: PortraitExpression; lod: PortraitLod; bust: boolean }) {
  const tone = PORTRAIT_SKINS[spec.skin];
  const full = lod === 'full';
  const head = PORTRAIT_HEADS[spec.head];
  const hair = HAIRS[spec.hair](full, tone.shade);
  const garment = PORTRAIT_GARMENTS[spec.garment];
  // La coiffure, dessinée sur l'ovale, se pose sur chaque crâne par une mise à l'échelle.
  const fit = (layer: ReactElement | undefined) =>
    layer && head.hairTransform ? <G transform={head.hairTransform}>{layer}</G> : (layer ?? null);
  return (
    <>
      {fit(hair.back)}
      {bust ? (
        <>
          <Path d={NECKS[garment.neck]} fill={tone.shade} />
          <Path d={BUSTS[garment.neck]} fill={FAB[garment.fabric].base} />
          {garment.detail ? garment.detail(full) : null}
        </>
      ) : null}
      <Path d={head.ears} fill={tone.base} />
      <Path d={head.d} fill={tone.base} />
      <Accessories accessories={spec.accessories} lod={lod} layer="ears" head={spec.head} eyes={spec.eyes} />
      <PortraitFace
        skin={spec.skin}
        head={spec.head}
        eyes={spec.eyes}
        mouth={spec.mouth}
        brow={spec.brow}
        nose={spec.nose}
        expression={expression}
        lod={lod}
        brows={spec.hair !== 'bucket-hat'}
      />
      {fit(hair.front)}
      <Accessories accessories={spec.accessories} lod={lod} layer="face" head={spec.head} eyes={spec.eyes} />
    </>
  );
}

/** Le portrait cadré, sans disque ni découpe : à poser dans un `Svg` 120 × 120. */
export function PortraitArt({ spec, expression, lod }: { spec: PortraitSpec; expression: PortraitExpression; lod: PortraitLod }) {
  return (
    <G transform={frameOf(lod)}>
      <Figure spec={spec} expression={expression} lod={lod} bust />
    </G>
  );
}

/**
 * La tête seule (repère 120, sans buste ni cou), pour une scène qui la pose
 * sur un corps : les enfants des illustrations sont ceux de la distribution.
 */
export function PortraitHead({ spec, expression, lod }: { spec: PortraitSpec; expression: PortraitExpression; lod: PortraitLod }) {
  return <Figure spec={spec} expression={expression} lod={lod} bust={false} />;
}
