/**
 * Portraits v4 « Épure » — les douze enfants (direction v4 § 8).
 *
 * Guide de style établi par prototype mesuré (rendu à 200, 96, 64 et 40 px,
 * niveaux de gris, silhouettes, dégagement du bord, nombre d'éléments) :
 * - à plat : une couleur par matière ; la seule ombre est le cou, dans le ton
 *   d'ombre de la peau ; ni contour, ni reflet, ni dégradé, ni accessoire
 *   d'écolier, ni motif dans le disque ;
 * - une tête commune (54 × 58), les yeux sous le milieu (proportions d'enfant),
 *   des yeux pleins avec un point de lumière, un nez d'un trait, une bouche
 *   d'un trait (calme) ou ouverte avec la langue (joie, yeux plissés) ;
 * - la texture des cheveux crépus portée par le seul contour : un bord
 *   festonné (arcs dont la flèche vaut 0,42 à 0,5 demi-corde) ;
 * - six peaux tenues de 25 à 62 % de luminosité, réchauffées en s'éclaircissant ;
 *   des cheveux noir aubergine, qui se détachent de la peau par la teinte ;
 * - un cadrage commun : ×1,06 (détail complet) ou ×1,10 (petit) autour de
 *   (60, 66) ; rien n'est coupé par le bord sauf les épaules.
 */
import type { ReactElement } from 'react';
import { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

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
  gingham: { base: '#fff3ec', shade: '#f2643f', light: '#fbf7f0' },
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

export const HEAD_D = 'M60 28C76 28 87 39.5 87 56C87 73.5 75.5 86 60 86C44.5 86 33 73.5 33 56C33 39.5 44 28 60 28Z';
const EARS_D = 'M28 62A5.6 5.6 0 1 0 39.2 62A5.6 5.6 0 1 0 28 62ZM80.8 62A5.6 5.6 0 1 0 92 62A5.6 5.6 0 1 0 80.8 62Z';
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

/** Silhouette neutre (avant tout choix) : tête, oreilles, cou, buste. */
export const PORTRAIT_SILHOUETTE_D = `${HEAD_D}${EARS_D}${NECKS.crew}${BUSTS.crew}`;

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

/** Sourcils : la forme varie d'un enfant à l'autre (la tête, elle, est commune). */
const BROWS: Record<PortraitBrow, string> = {
  arch: 'M44.8 52.8Q49 49.4 53.2 51.6M66.8 51.6Q71 49.4 75.2 52.8',
  straight: 'M44.8 52.2Q49 50.6 53.2 51.4M66.8 51.4Q71 50.6 75.2 52.2',
  round: 'M44.8 52.8Q49 49.8 53.2 51.6M66.8 51.6Q71 49.8 75.2 52.8',
  lifted: 'M44.8 52.4Q49 50.2 53.2 50.6M66.8 50.6Q71 50.2 75.2 52.4',
};

/** Nez : un seul trait, plus ou moins large. */
const NOSES: Record<PortraitNose, string> = {
  broad: 'M56.2 68.4Q60 71.2 63.8 68.4',
  round: 'M56.6 68.4Q60 71 63.4 68.4',
  button: 'M57.2 68.6Q60 70.6 62.8 68.6',
};

export function PortraitFace({
  skin,
  brow,
  nose,
  expression,
  lod,
  brows = true,
}: {
  skin: PortraitSkin;
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
  return (
    <>
      <Path
        d="M37.7 70A4.8 3.2 0 1 0 47.3 70A4.8 3.2 0 1 0 37.7 70ZM72.7 70A4.8 3.2 0 1 0 82.3 70A4.8 3.2 0 1 0 72.7 70Z"
        fill={tone.blush}
      />
      {brows ? (
        <G transform={joy ? 'translate(0 -1.4)' : undefined}>
          <Path d={BROWS[brow]} stroke={HAIR} strokeWidth={full ? 2.2 : 3.2} {...round} />
        </G>
      ) : null}
      {joy ? (
        <Path
          d="M45.2 62.6Q49 57.4 52.8 62.6M67.2 62.6Q71 57.4 74.8 62.6"
          stroke={EYE}
          strokeWidth={full ? 2.7 : 3.4}
          {...round}
        />
      ) : (
        <>
          <Ellipse cx={49} cy={61} rx={full ? 3.1 : 3.6} ry={full ? 3.9 : 4.4} fill={EYE} />
          <Ellipse cx={71} cy={61} rx={full ? 3.1 : 3.6} ry={full ? 3.9 : 4.4} fill={EYE} />
          {full ? (
            <Path
              d="M49.05 59.4A1.15 1.15 0 1 0 51.35 59.4A1.15 1.15 0 1 0 49.05 59.4ZM71.05 59.4A1.15 1.15 0 1 0 73.35 59.4A1.15 1.15 0 1 0 71.05 59.4Z"
              fill={WHITE}
            />
          ) : null}
        </>
      )}
      {full ? <Path d={NOSES[nose]} stroke={tone.shade} strokeWidth={2} {...round} /> : null}
      {joy ? (
        <>
          <Path d="M53 73.6H67C67 78.8 64 81.8 60 81.8C56 81.8 53 78.8 53 73.6Z" fill={MOUTH} />
          <Path
            d="M56 80.1C57.6 78.6 62.4 78.6 64 80.1C63 81.2 61.6 81.8 60 81.8C58.4 81.8 57 81.2 56 80.1Z"
            fill={TONGUE}
          />
        </>
      ) : (
        <Path d="M55 75Q60 79.2 65 75" stroke={MOUTH} strokeWidth={full ? 2.4 : 3} {...round} />
      )}
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
  'striped-tshirt': {
    fabric: 'cream',
    neck: 'crew',
    detail: () => <Path d="M-4 105H124V110H-4ZM-4 115.5H124V120.5H-4Z" fill={FAB.navy.base} />,
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
    fabric: 'gingham',
    neck: 'vee',
    // Un vrai vichy : deux jeux de bandes corail à 40 % — les croisements foncent.
    detail: () => (
      <>
        <Path d="M-4 99H124V103.5H-4ZM-4 108H124V112.5H-4ZM-4 117H124V121.5H-4Z" fill={FAB.terracotta.base} opacity={0.4} />
        <Path
          d="M25 90H29.5V124H25ZM34 90H38.5V124H34ZM43 90H47.5V124H43ZM72.5 90H77V124H72.5ZM81.5 90H86V124H81.5ZM90.5 90H95V124H90.5Z"
          fill={FAB.terracotta.base}
          opacity={0.4}
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

function Accessories({
  accessories,
  lod,
  layer,
}: {
  accessories: readonly PortraitAccessory[];
  lod: PortraitLod;
  layer: 'ears' | 'face';
}) {
  const full = lod === 'full';
  return (
    <>
      {accessories.map((accessory) => {
        if (layer === 'face' && accessory === 'glasses') {
          return (
            <Path
              key={accessory}
              d="M42 61A7 7 0 1 0 56 61A7 7 0 1 0 42 61ZM64 61A7 7 0 1 0 78 61A7 7 0 1 0 64 61ZM56 60Q60 58 64 60"
              stroke={FAB.indigo.base}
              strokeWidth={full ? 2.4 : 3.2}
              fill="none"
            />
          );
        }
        if (layer === 'ears' && accessory === 'hearing-aid') {
          return (
            <Path
              key={accessory}
              d="M88 53.5C93.5 53.5 94.8 61 91.6 66.4"
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
              d="M31.5 68.4A2.1 2.1 0 1 0 35.7 68.4A2.1 2.1 0 1 0 31.5 68.4ZM84.3 68.4A2.1 2.1 0 1 0 88.5 68.4A2.1 2.1 0 1 0 84.3 68.4Z"
              fill={FAB.saffron.base}
            />
          );
        }
        if (layer === 'ears' && accessory === 'hoop-earrings' && full) {
          return (
            <Path
              key={accessory}
              d="M33.6 66.4A3.8 3.8 0 1 0 33.6 74A3.8 3.8 0 1 0 33.6 66.4ZM86.4 66.4A3.8 3.8 0 1 0 86.4 74A3.8 3.8 0 1 0 86.4 66.4Z"
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
  const hair = HAIRS[spec.hair](full, tone.shade);
  const garment = PORTRAIT_GARMENTS[spec.garment];
  return (
    <>
      {hair.back}
      {bust ? (
        <>
          <Path d={NECKS[garment.neck]} fill={tone.shade} />
          <Path d={BUSTS[garment.neck]} fill={FAB[garment.fabric].base} />
          {garment.detail ? garment.detail(full) : null}
        </>
      ) : null}
      <Path d={EARS_D} fill={tone.base} />
      <Path d={HEAD_D} fill={tone.base} />
      <Accessories accessories={spec.accessories} lod={lod} layer="ears" />
      <PortraitFace
        skin={spec.skin}
        brow={spec.brow}
        nose={spec.nose}
        expression={expression}
        lod={lod}
        brows={spec.hair !== 'bucket-hat'}
      />
      {hair.front}
      <Accessories accessories={spec.accessories} lod={lod} layer="face" />
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
