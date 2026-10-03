import { memo } from 'react';
import Svg, { G, Path } from 'react-native-svg';

import { illustration } from '../tokens';

/**
 * Deux petits dessins d'école, objets du contenu plutôt que décor : la pousse
 * de la carte de classe (CP1 / CP2) et l'enclos vide du comptage « zéro ».
 * Trois tons par matière, une seule lumière en haut à gauche ; aucune couleur
 * en dur (jetons `illustration`).
 */

const nature = illustration.nature;
const white = illustration.white;
const wood = illustration.school.wood;

type Pt = readonly [number, number];

/** Une décimale au plus : des chemins nets, sans bruit. */
const q = (value: number) => Math.round(value * 10) / 10;
const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * La primitive des galets : un segment épaissi (pilule). Un disque est une
 * pilule de longueur nulle. Tracée dans le sens antihoraire, pour que
 * plusieurs pilules fusionnent en un seul chemin (règle de remplissage
 * `nonzero`).
 */
interface Capsule {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly r: number;
}

const pill = (x1: number, y1: number, x2: number, y2: number, r: number): Capsule => ({
  x1,
  y1,
  x2,
  y2,
  r,
});

function capsuleD({ x1, y1, x2, y2, r }: Capsule): string {
  const s = q(r);
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 0.05) {
    return `M${q(x1 - r)} ${q(y1)}a${s} ${s} 0 1 0 ${q(2 * r)} 0a${s} ${s} 0 1 0 ${q(-2 * r)} 0Z`;
  }
  // Normale « vers le haut » du segment.
  const nx = ((y2 - y1) / len) * r;
  const ny = (-(x2 - x1) / len) * r;
  return (
    `M${q(x2 + nx)} ${q(y2 + ny)}L${q(x1 + nx)} ${q(y1 + ny)}` +
    `A${s} ${s} 0 0 0 ${q(x1 - nx)} ${q(y1 - ny)}L${q(x2 - nx)} ${q(y2 - ny)}` +
    `A${s} ${s} 0 0 0 ${q(x2 + nx)} ${q(y2 + ny)}Z`
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// ClassLevelArt — cartes CP1 / CP2 : la même pousse qui grandit
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Feuille-galet partant de (ox, oy) dans la direction `angleDeg` : large au
 * premier tiers, effilée vers une pointe ronde de rayon ≥ 2,4 u (jamais une
 * pointe vive). `upper` est la moitié haute, du pétiole à la pointe par la
 * nervure : la face éclairée.
 */
function leafD(ox: number, oy: number, angleDeg: number, length: number, width: number) {
  const t = rad(angleDeg);
  const cos = Math.cos(t);
  const sin = Math.sin(t);
  const p = (x: number, y: number) => `${q(ox + x * cos - y * sin)} ${q(oy + x * sin + y * cos)}`;
  const r = Math.max(2.4, width * 0.2);
  const L = length - r;
  const hw = width / 2;
  const upperEdge = `M${p(0, 0)}C${p(L * 0.18, -hw * 1.3)} ${p(L * 0.62, -hw * 1.05)} ${p(L, -r)}`;
  return {
    full:
      `${upperEdge}A${q(r)} ${q(r)} 0 0 1 ${p(L, r)}` +
      `C${p(L * 0.62, hw * 1.05)} ${p(L * 0.18, hw * 1.3)} ${p(0, 0)}Z`,
    upper: `${upperEdge}A${q(r)} ${q(r)} 0 0 1 ${p(L + r, 0)}Z`,
  };
}

const SPROUT = {
  lowLeft: leafD(48, 41, 196, 31, 17),
  lowRight: leafD(48, 41, -16, 31, 17),
  highLeft: leafD(48, 29, 204, 19, 11),
  highRight: leafD(48, 29, -24, 19, 11),
  bud: 'M41 10C41 6 44 4 46 7C47 4 49 4 50 7C52 4 55 6 55 10V12C55 17 52 19 48 19C44 19 41 17 41 12Z',
  budLight: 'M41 10C41 6 44 4 46 7C46.5 10 46 15 47 19C43.5 18.5 41 16.5 41 12Z',
  sepals: 'M40 14C41 20 45 22 48 21C51 22 55 20 56 14C53 17 50 18 48 18C46 18 43 17 40 14Z',
} as const;

const POT = {
  shadow: 'M39 87H69A3 3 0 0 1 69 93H39A3 3 0 0 1 39 87Z',
  body: 'M26 68H70L65 86C64.4 88.3 62.5 90 60 90H36C33.5 90 31.6 88.3 31 86Z',
  bodyShade: 'M59 68H70L65 86C64.4 88.3 62.5 90 60 90H50C57 86 60 78 59 68Z',
  underRim: 'M27 70H69L68 74H28Z',
  rim: 'M26 56H70A4 4 0 0 1 74 60V66A4 4 0 0 1 70 70H26A4 4 0 0 1 22 66V60A4 4 0 0 1 26 56Z',
  rimLower: 'M22 63H74V66A4 4 0 0 1 70 70H26A4 4 0 0 1 22 66Z',
  glint: 'M33 75L35 83',
} as const;

/**
 * La pousse dans son pot de terre cuite : CP1 deux feuilles ; CP2 plus haute,
 * quatre feuilles et un bouton de fleur. `selected` : pot plus saturé (sable
 * → terre cuite) et reflet. L'ombre portée prend la teinte d'ombre du fond
 * (`groundShade`, défaut : celle d'une carte blanche) — jamais un gris.
 */
export const ClassLevelArt = memo(function ClassLevelArt({
  level,
  size,
  selected = false,
  groundShade = illustration.school.paper.shade,
}: {
  level: 'CP1' | 'CP2';
  size: number;
  selected?: boolean;
  /** Ombre du fond sur lequel l'art est posé (un jeton), pour la pastille-ombre. */
  groundShade?: string;
}) {
  const clay = selected ? illustration.fabric.terracotta : illustration.fabric.sand;
  const leaf = nature.sprout;
  const grown = level === 'CP2';
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Path d={POT.shadow} fill={groundShade} />
      <Path d={grown ? 'M48 60V17' : 'M48 60V41'} stroke={leaf.base} strokeWidth={5} strokeLinecap="round" />
      {grown ? (
        <G>
          <Path d={SPROUT.highRight.full} fill={leaf.shade} />
          <Path d={`${SPROUT.highLeft.full}${SPROUT.highRight.upper}${SPROUT.sepals}`} fill={leaf.base} />
          <Path d={SPROUT.highLeft.upper} fill={leaf.light} />
          <Path d={SPROUT.bud} fill={illustration.fabric.saffron.base} />
          <Path d={SPROUT.budLight} fill={illustration.fabric.saffron.light} />
        </G>
      ) : null}
      <Path d={SPROUT.lowRight.full} fill={leaf.shade} />
      <Path d={`${SPROUT.lowLeft.full}${SPROUT.lowRight.upper}`} fill={leaf.base} />
      <Path d={SPROUT.lowLeft.upper} fill={leaf.light} />
      <Path d={POT.body} fill={clay.base} />
      <Path d={`${POT.bodyShade}${POT.underRim}`} fill={clay.shade} />
      <Path d={POT.rim} fill={clay.light} />
      <Path d={POT.rimLower} fill={clay.base} />
      {selected ? <Path d={POT.glint} stroke={white} strokeWidth={3} strokeLinecap="round" /> : null}
    </Svg>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// EmptyQuantityScene — comptage quand la quantité vaut zéro
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Un enclos rond vu un peu d'en haut : la barrière fait tout le tour (arc du
 * fond, arc de devant) et l'on voit le pré à l'intérieur — vide, avec sa
 * gamelle vide. Piquets tous les 45° sur l'ellipse de la clôture (centre
 * 60, 66 ; rayons 50 × 25), arrondis à l'unité ; celui du milieu devant est
 * omis pour dégager la vue sur la gamelle.
 */
const PEN_BACK_POSTS: readonly Pt[] = [
  [25, 48],
  [60, 41],
  [95, 48],
];
const PEN_FRONT_POSTS: readonly Pt[] = [
  [10, 66],
  [25, 84],
  [95, 84],
  [110, 66],
];
/** Piquets-pilules de 8 u (bords droits sur des unités entières). */
const postsD = (posts: readonly Pt[]) =>
  posts.map(([x, y]) => capsuleD(pill(x, y - 16, x, y - 3, 4))).join('');
/** Moitié droite de chaque piquet : son ombre. */
const postShadesD = (posts: readonly Pt[]) =>
  posts.map(([x, y]) => `M${x} ${y - 20}A4 4 0 0 1 ${x + 4} ${y - 16}V${y - 3}A4 4 0 0 1 ${x} ${y + 1}Z`).join('');

const PEN = {
  floor: capsuleD(pill(35, 66, 85, 66, 31)),
  backRails: 'M10 59A50 25 0 0 1 110 59M10 52A50 25 0 0 1 110 52',
  frontRails: 'M110 59A50 25 0 0 1 10 59M110 52A50 25 0 0 1 10 52',
  backPosts: postsD(PEN_BACK_POSTS),
  backPostShades: postShadesD(PEN_BACK_POSTS),
  frontPosts: postsD(PEN_FRONT_POSTS),
  frontPostShades: postShadesD(PEN_FRONT_POSTS),
  bowlShadow: capsuleD(pill(55, 71, 73, 71, 2)),
  bowlBody: 'M46 58H74C74 66 68 71 60 71C52 71 46 66 46 58Z',
  bowlBodyShade: 'M65 58H74C74 66 68 71 60 71C65 69 66 64 65 58Z',
  bowlRim: capsuleD(pill(48, 58, 72, 58, 4)),
  bowlHollow: capsuleD(pill(49, 58, 71, 58, 2)),
  tufts: 'M30 63L28 58M33 63V57M36 63L38 58M84 61L82 56M87 61V55M90 61L92 56',
} as const;

/** Un enclos vide : barrière de bois en arc, herbe rase, une gamelle vide. */
export const EmptyQuantityScene = memo(function EmptyQuantityScene({ size }: { size: number }) {
  const clay = illustration.school.clay;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Path d={PEN.floor} fill={nature.grass} />
      <Path d={PEN.backRails} stroke={wood.shade} strokeWidth={4} strokeLinecap="round" fill="none" />
      <Path d={PEN.backPosts} fill={wood.base} />
      <Path d={PEN.backPostShades} fill={wood.shade} />
      <Path d={PEN.tufts} stroke={nature.acacia.base} strokeWidth={2.5} strokeLinecap="round" />
      <Path d={PEN.bowlShadow} fill={nature.acacia.light} />
      <Path d={PEN.bowlBody} fill={clay.base} />
      <Path d={PEN.bowlBodyShade} fill={clay.shade} />
      <Path d={PEN.bowlRim} fill={clay.light} />
      <Path d={PEN.bowlHollow} fill={clay.shade} />
      <Path d={PEN.frontRails} stroke={wood.shade} strokeWidth={4} strokeLinecap="round" fill="none" />
      <Path d={PEN.frontPosts} fill={wood.base} />
      <Path d={PEN.frontPostShades} fill={wood.shade} />
    </Svg>
  );
});

