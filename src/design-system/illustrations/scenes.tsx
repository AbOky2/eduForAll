import { memo, useId, useMemo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { AvatarHeadArt } from '../avatars/ecolna-avatar';
import { illustration, skinTones } from '../tokens';
import {
  acacia,
  arcD,
  bandD,
  bandExtrema,
  capsuleD,
  capsulesD,
  disc,
  frameFor,
  pill,
  q,
  rad,
  raysD,
  slopeD,
  towardLight,
  type BandSpec,
  type Pt,
} from './scene-geometry';

/**
 * Scènes et petites illustrations — direction « Galets & craie »
 * (design/brief-identite-v2.md § 4 et § 10).
 *
 * - Une seule lumière, en haut à gauche ; trois tons par matière ; l'ombre est
 *   une forme nette posée en bas à droite (croissant), jamais un dégradé.
 * - Collines et dunes en bandes arrondies posées sur une base horizontale ;
 *   ombres portées en pilule ; un seul dégradé par scène, celui du ciel.
 * - Les scènes remplissent toute la boîte qu'on leur donne : le cœur de la
 *   composition reste entier et centré, le ciel et le sol s'étendent (bandeau
 *   de tablette, carte de téléphone, volet portrait). Pas de coins arrondis :
 *   c'est la carte hôte qui détoure (`overflow: 'hidden'`).
 * - Aucune couleur en dur : jetons `illustration` uniquement.
 *
 * `ReadingChildScene` et `AvatarFace` sont encore les dessins v1 : ils
 * attendent les enfants de `src/design-system/avatars/`.
 */

interface SceneProps {
  width?: number;
  height?: number;
}

const nature = illustration.nature;
const white = illustration.white;

// ─────────────────────────────────────────────────────────────────────────────
// SunCloudScene — écran « hors connexion »
// ─────────────────────────────────────────────────────────────────────────────

const SC_SUN = disc(160, 84, 43);
const SC_SUN_LIT = towardLight(SC_SUN, 3);
const SC_LOBES = [disc(110, 123, 31), disc(77, 135, 20), disc(147, 129, 24)];
const SC_FOOT = pill(74, 142, 166, 142, 14);

const SUN_CLOUD = {
  rays: raysD(160, 84, 55, 66, 8, 0),
  sunShade: capsuleD(SC_SUN),
  sunBase: capsuleD(SC_SUN_LIT),
  sunGlint: arcD(SC_SUN_LIT.x1, SC_SUN_LIT.y1, SC_SUN_LIT.r - 7, 198, 248),
  face: 'M140 83C142 76.5 150 76.5 152 83M168 83C170 76.5 178 76.5 180 83M149 95C154 102 166 102 171 95',
  cloudShade: capsulesD([...SC_LOBES, SC_FOOT]),
  cloudBase: capsulesD([...SC_LOBES.map((c) => towardLight(c, 3.5)), towardLight(SC_FOOT, 1.6)]),
} as const;

const SC_BACK: BandSpec = {
  core: [
    [-30, 158],
    [60, 146],
    [176, 152],
    [268, 147],
  ],
  step: 110,
  crest: 150,
  trough: 160,
};
const SC_FRONT: BandSpec = {
  core: [
    [40, 179],
    [204, 156],
    [370, 178],
  ],
  step: 160,
  crest: 162,
  trough: 179,
};

/** Smiling sun behind a cloud over a dune (offline info screen, S20). */
export const SunCloudScene = memo(function SunCloudScene({ width = 280, height = 200 }: SceneProps) {
  const skyId = useId();
  const art = useMemo(() => {
    const f = frameFor(width, height, 280, 200);
    const back = bandExtrema(SC_BACK, f.ox, f.oy, f.W);
    const front = bandExtrema(SC_FRONT, f.ox, f.oy, f.W);
    return {
      f,
      back: bandD(back, f.H),
      front: bandD(front, f.H),
      frontLight: slopeD(front, 'light', 0.4),
      frontShade: slopeD(front, 'shade', 1),
    };
  }, [width, height]);
  const { f } = art;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${f.W} ${f.H}`}>
      <Defs>
        <LinearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={nature.sky} />
          <Stop offset="1" stopColor={nature.skyHigh} />
        </LinearGradient>
      </Defs>
      <Rect x={-1} y={-1} width={f.W + 2} height={f.H + 2} fill={`url(#${skyId})`} />
      <G transform={`translate(${f.ox} ${f.oy})`}>
        <Path d={SUN_CLOUD.rays} stroke={nature.sun} strokeWidth={10} strokeLinecap="round" fill="none" />
        <Path d={SUN_CLOUD.sunShade} fill={nature.sunDeep} />
        <Path d={SUN_CLOUD.sunBase} fill={nature.sun} />
        <Path d={SUN_CLOUD.sunGlint} stroke={white} strokeWidth={5} strokeLinecap="round" fill="none" />
        <Ellipse cx={137} cy={94} rx={6} ry={4} fill={illustration.fabric.terracotta.light} />
        <Ellipse cx={183} cy={94} rx={6} ry={4} fill={illustration.fabric.terracotta.light} />
        <Path d={SUN_CLOUD.face} stroke={nature.bark.shade} strokeWidth={4.5} strokeLinecap="round" fill="none" />
        <Path d={SUN_CLOUD.cloudShade} fill={illustration.fabric.cream.shade} />
        <Path d={SUN_CLOUD.cloudBase} fill={white} />
      </G>
      <Path d={art.back} fill={nature.dune.light} />
      <Path d={art.front} fill={nature.dune.base} />
      <Path d={art.frontLight} fill={nature.dune.light} />
      <Path d={art.frontShade} fill={nature.dune.shade} />
    </Svg>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// OfflineReadyScene — onboarding 3 « Fonctionne sans connexion »
// ─────────────────────────────────────────────────────────────────────────────

const dusk = nature.dusk;
const slate = illustration.school.slate;
const wood = illustration.school.wood;
const mat = nature.dune;

/** Étoile dodue à 5 branches, pointes arrondies par le trait (astuce § 4.1). */
function starD(cx: number, cy: number, outer: number, inner: number): string {
  let d = '';
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const t = rad(-90 + i * 36);
    d += `${i === 0 ? 'M' : 'L'}${q(cx + r * Math.cos(t))} ${q(cy + r * Math.sin(t))}`;
  }
  return `${d}Z`;
}

const OR_STAR = starD(56, 40, 9, 4.5);
const OR_FAR: BandSpec = {
  core: [
    [20, 140],
    [120, 134],
    [230, 141],
    [330, 135],
  ],
  step: 110,
  crest: 135,
  trough: 141,
};
const OR_NEAR: BandSpec = {
  core: [
    [-40, 150],
    [140, 147],
    [320, 150],
  ],
  step: 180,
  crest: 147,
  trough: 150,
};
const OR_TREES = [acacia(-34, 141, 1.15), acacia(318, 139, 0.9)];

/** Tablette posée sur une natte, petit panneau solaire, ciel du soir (onboarding 3). */
export const OfflineReadyScene = memo(function OfflineReadyScene({
  width = 280,
  height = 200,
}: SceneProps) {
  const skyId = useId();
  const art = useMemo(() => {
    const f = frameFor(width, height, 280, 200);
    return {
      f,
      far: bandD(bandExtrema(OR_FAR, f.ox, f.oy, f.W), f.H),
      near: bandD(bandExtrema(OR_NEAR, f.ox, f.oy, f.W), f.H),
    };
  }, [width, height]);
  const { f } = art;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${f.W} ${f.H}`}>
      <Defs>
        <LinearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={dusk.skyHigh} />
          <Stop offset="0.6" stopColor={dusk.skyMid} />
          <Stop offset="0.8" stopColor={dusk.skyLow} />
        </LinearGradient>
      </Defs>
      <Rect x={-1} y={-1} width={f.W + 2} height={f.H + 2} fill={`url(#${skyId})`} />
      <G transform={`translate(${f.ox} ${f.oy})`}>
        <Path d={OR_STAR} fill={nature.starlight} stroke={nature.starlight} strokeWidth={3} strokeLinejoin="round" />
        <Circle cx={258} cy={134} r={15} fill={nature.sunDeep} />
        {OR_TREES.map((tree, i) => (
          <G key={i}>
            <Path d={tree.trunk} fill={dusk.dune.shade} />
            <Path d={tree.branches} stroke={dusk.dune.shade} strokeWidth={tree.branchWidth} strokeLinecap="round" fill="none" />
            <Path d={`${tree.back.full}${tree.front.full}`} fill={dusk.dune.shade} />
          </G>
        ))}
      </G>
      <Path d={art.far} fill={dusk.dune.light} />
      <Path d={art.near} fill={dusk.dune.base} />
      <G transform={`translate(${f.ox} ${f.oy})`}>
        {/* Natte tressée en feuilles de rônier : tranche, face, trame, bandes teintes */}
        <Rect x={26} y={153} width={228} height={34} rx={5} fill={mat.shade} />
        <Rect x={26} y={150} width={228} height={34} rx={5} fill={mat.light} />
        <Path d="M33 158H247M33 167H247M33 176H247" stroke={mat.base} strokeWidth={2} strokeLinecap="round" />
        <Path d="M36 150V184M46 150V184M234 150V184M244 150V184" stroke={illustration.school.clay.base} strokeWidth={5} />
        {/* Chevalet de bois (comme le tableau de la classe) et tablette posée dessus */}
        <Path d="M97 180H107M179 180H189M137 178H147" stroke={mat.base} strokeWidth={4} strokeLinecap="round" />
        <Path d="M140 66V176" stroke={wood.shade} strokeWidth={5} strokeLinecap="round" />
        <Path d="M140 62L99 177M140 62L181 177" stroke={wood.base} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
        <Rect x={84} y={78} width={112} height={86} rx={11} fill={slate.base} />
        <Path d={arcD(95, 89, 7, 185, 265)} stroke={slate.light} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Rect x={91} y={85} width={98} height={72} rx={4} fill={illustration.school.paper.base} />
        <Circle cx={140} cy={81.5} r={1.5} fill={slate.light} />
        <Circle cx={140} cy={121} r={20} fill={nature.sprout.base} />
        <Path
          d="M131 121L138 128L151 115"
          stroke={white}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path d={arcD(140, 121, 14, 200, 250)} stroke={white} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Rect x={80} y={160} width={120} height={8} rx={4} fill={wood.base} />
        <Path d="M84 162H196" stroke={wood.light} strokeWidth={2} strokeLinecap="round" />
        {/* Panneau solaire tourné vers le soleil couchant, et son câble */}
        <Path
          d="M216 172C210 179 200 178 194 168"
          stroke={slate.shade}
          strokeWidth={3}
          strokeLinecap="round"
          fill="none"
        />
        <Rect x={206} y={169} width={24} height={5} rx={2.5} fill={mat.base} />
        <Path d="M216 150V170" stroke={slate.shade} strokeWidth={4} strokeLinecap="round" />
        <G transform="rotate(14 216 150)">
          <Rect x={196} y={122} width={40} height={28} rx={4} fill={slate.light} />
          <Rect x={199} y={125} width={34} height={22} rx={2} fill={slate.base} />
          <Path d="M210 125V147M222 125V147M199 136H233" stroke={slate.light} strokeWidth={2} />
        </G>
      </G>
    </Svg>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ProfileStageScene — fond du héros « Crée ton profil »
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Paysage calme et lumineux, peu contrasté : le personnage choisi et son
 * ardoise se posent dessus. Ciel chaud, deux bandes de dunes, acacia à gauche,
 * soleil bas à droite, aucun personnage. Dessiné directement en dp.
 */
export const ProfileStageScene = memo(function ProfileStageScene({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const skyId = useId();
  const art = useMemo(() => {
    const W = Math.max(width, 1);
    const H = Math.max(height, 1);
    const u = Math.min(W, H) / 100;
    const portrait = H > W;
    const yFar = H * 0.6;
    const yNear = H * 0.74;
    const far: BandSpec = {
      core: [
        [W * 0.14, yFar - 2 * u],
        [W * 0.48, yFar + 2 * u],
        [W * 0.86, yFar - 1 * u],
      ],
      step: Math.max(W * 0.3, 30 * u),
      crest: yFar - 1.5 * u,
      trough: yFar + 2 * u,
    };
    const near: BandSpec = {
      core: [
        [W * 0.18, yNear + 2 * u],
        [W * 0.62, yNear - 3 * u],
        [W * 1.05, yNear + 1 * u],
      ],
      step: Math.max(W * 0.4, 40 * u),
      crest: yNear - 2 * u,
      trough: yNear + 2 * u,
    };
    const farPts = bandExtrema(far, 0, 0, W);
    const nearPts = bandExtrema(near, 0, 0, W);
    // Trois galets au premier plan, en bas à droite (le clin d'œil de la marque).
    const px = W * 0.86;
    const py = H - 7 * u;
    const pebbles = [
      pill(px - 1.6 * u, py, px + 0.8 * u, py, 2.6 * u),
      pill(px + 5 * u, py + 0.8 * u, px + 5.8 * u, py + 0.8 * u, 1.8 * u),
      disc(px - 6.8 * u, py + 1.3 * u, 1.3 * u),
    ];
    return {
      W: q(W),
      H: q(H),
      far: bandD(farPts, H),
      near: bandD(nearPts, H),
      nearLight: slopeD(nearPts, 'light', 0.6),
      nearShade: slopeD(nearPts, 'shade', 0.8),
      sun: { cx: q(W * 0.8), cy: q(yFar - 3 * u), r: q(9 * u) },
      tree: acacia(W * (portrait ? 0.1 : 0.13), yFar + 1 * u, (portrait ? 0.85 : 1.05) * u),
      pebbleShade: capsulesD(pebbles),
      pebbleBase: capsulesD(pebbles.map((c) => towardLight(c, 0.5 * u))),
    };
  }, [width, height]);
  const { tree } = art;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${art.W} ${art.H}`}>
      <Defs>
        <LinearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={nature.sky} />
          <Stop offset="1" stopColor={nature.skyHigh} />
        </LinearGradient>
      </Defs>
      <Rect x={-1} y={-1} width={art.W + 2} height={art.H + 2} fill={`url(#${skyId})`} />
      <Circle cx={art.sun.cx} cy={art.sun.cy} r={art.sun.r} fill={nature.sunGlow} />
      <Path d={tree.trunk} fill={nature.bark.light} />
      <Path d={tree.trunkShade} fill={nature.bark.base} />
      <Path d={tree.branches} stroke={nature.bark.light} strokeWidth={tree.branchWidth} strokeLinecap="round" fill="none" />
      <Path d={tree.back.full} fill={nature.acacia.base} />
      <Path d={tree.back.light} fill={nature.acacia.light} />
      <Path d={tree.front.full} fill={nature.acacia.base} />
      <Path d={tree.front.light} fill={nature.acacia.light} />
      <Path d={tree.front.shade} fill={nature.acacia.shade} />
      <Path d={art.far} fill={nature.dune.light} />
      <Path d={art.near} fill={nature.dune.base} />
      <Path d={art.nearLight} fill={nature.dune.light} />
      <Path d={art.nearShade} fill={nature.dune.shade} />
      <Path d={art.pebbleShade} fill={nature.dune.shade} />
      <Path d={art.pebbleBase} fill={nature.dune.light} />
    </Svg>
  );
});

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

// ─────────────────────────────────────────────────────────────────────────────
// ReadingChildScene — onboarding 1 « Ton école t'accompagne partout »
// ─────────────────────────────────────────────────────────────────────────────

const fabric = illustration.fabric;
const paper = illustration.school.paper;
const cream = fabric.cream;

/**
 * Un enfant assis en tailleur, vu de face, en (cx, 152) sur la natte : têtes
 * de la distribution (3,5 têtes de haut debout, 2,5 assis — brief § 10),
 * corps en galets, lumière en haut à gauche. `bookSide` : le côté de la main
 * qui tient le livre partagé.
 */
function seatedChild(cx: number, bookSide: 1 | -1, bookX: number) {
  // Tête un peu forte : des enfants de six ans, pas des adolescents.
  const s = 0.41;
  // Torse : galet 26 × 28 ; l'ombre est le même galet, la face rentrée de
  // 2,5 u à droite et 1,5 u en bas.
  const torso = `M${cx - 13} 125A9 9 0 0 1 ${cx - 4} 116H${cx + 4}A9 9 0 0 1 ${cx + 13} 125V137A7 7 0 0 1 ${cx + 6} 144H${cx - 6}A7 7 0 0 1 ${cx - 13} 137Z`;
  const torsoLit = `M${cx - 13} 125A9 9 0 0 1 ${cx - 4} 116H${cx + 2}A9 9 0 0 1 ${cx + 10.5} 125V136A7 7 0 0 1 ${cx + 4} 142.5H${cx - 6}A7 7 0 0 1 ${cx - 13} 136Z`;
  const shoulderBook = { x: cx + 11 * bookSide, y: 121 };
  const elbowBook = { x: cx + 14 * bookSide, y: 134 };
  const handBook = { x: bookX - 19 * bookSide, y: 133 };
  const shoulderFree = { x: cx - 11 * bookSide, y: 121 };
  const elbowFree = { x: cx - 14 * bookSide, y: 133 };
  const handFree = { x: cx - 6 * bookSide, y: 142 };
  return {
    head: `translate(${q(cx - 60 * s)} ${q(97 - 53 * s)}) scale(${s})`,
    neck: capsuleD(pill(cx, 106, cx, 117, 4)),
    lap: capsuleD(pill(cx - 15, 147, cx + 15, 147, 7)),
    lapLit: capsuleD(pill(cx - 15.5, 145.8, cx + 13.5, 145.8, 5.6)),
    // Deux pieds devant les jambes croisées : c'est ce qui dit « en tailleur ».
    feet: capsulesD([pill(cx - 9, 152.5, cx - 3, 152.5, 2.6), pill(cx + 3, 152.5, cx + 9, 152.5, 2.6)]),
    torso,
    torsoLit,
    sleeves: capsulesD([
      pill(shoulderBook.x, shoulderBook.y, elbowBook.x, elbowBook.y, 4.2),
      pill(shoulderFree.x, shoulderFree.y, elbowFree.x, elbowFree.y, 4.2),
    ]),
    forearms: capsulesD([
      pill(elbowBook.x, elbowBook.y, handBook.x, handBook.y, 3.2),
      pill(elbowFree.x, elbowFree.y, handFree.x, handFree.y, 3.2),
    ]),
    hands: capsulesD([disc(handBook.x, handBook.y, 3.4), disc(handFree.x, handFree.y, 3.4)]),
  };
}

const RC_GIRL = seatedChild(150, 1, 175);
const RC_BOY = seatedChild(200, -1, 175);
const RC_TREE = acacia(70, 151, 3.1);
const RC_FAR: BandSpec = {
  core: [
    [20, 131],
    [130, 125],
    [250, 131],
  ],
  step: 120,
  crest: 125,
  trough: 131,
};
const RC_NEAR: BandSpec = {
  core: [
    [-30, 148],
    [140, 145],
    [310, 148],
  ],
  step: 170,
  crest: 145,
  trough: 148,
};

/** La chèvre qui dort à l'ombre, couchée, tête vers la gauche. */
const GOAT = {
  shadow: capsuleD(pill(44, 158.5, 80, 158.5, 2.2)),
  bodyShade: capsuleD(pill(52, 149, 77, 149, 9.5)),
  body: capsuleD(pill(51, 147.6, 75.5, 147.6, 8.2)),
  patch: capsuleD(pill(62, 144, 68, 144, 4)),
  legs: capsulesD([pill(55, 157, 61, 157, 2.6), pill(68, 157, 74, 157, 2.6)]),
  tail: capsuleD(pill(83, 143, 85, 139.5, 2.2)),
  ear: capsuleD(pill(46.5, 138.5, 52, 144, 2.4)),
  head: capsuleD(disc(42, 143, 7)),
  muzzle: capsuleD(pill(35, 146, 39, 146, 4.2)),
  horn: 'M43.5 136.5C44 132.5 47.5 131 50.5 132.5',
  eye: 'M39.3 141.6Q41.1 143.2 42.9 141.6',
};

/**
 * Fin d'après-midi sous un acacia (onboarding 1, brief § 10) : une fille et
 * un garçon de la distribution — deux peaux, deux régions — lisent le même
 * livre, assis en tailleur sur une natte ; une chèvre dort à l'ombre. Les
 * têtes viennent des avatars (`AvatarHeadArt`) : ce sont les enfants que
 * l'enfant choisira à l'écran suivant.
 */
export const ReadingChildScene = memo(function ReadingChildScene({
  width = 280,
  height = 200,
}: SceneProps) {
  const skyId = useId();
  const art = useMemo(() => {
    const f = frameFor(width, height, 280, 200);
    return {
      f,
      far: bandD(bandExtrema(RC_FAR, f.ox, f.oy, f.W), f.H),
      near: bandD(bandExtrema(RC_NEAR, f.ox, f.oy, f.W), f.H),
    };
  }, [width, height]);
  const { f } = art;
  const girlSkin = skinTones.miel;
  const boySkin = skinTones.cacao;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${f.W} ${f.H}`}>
      <Defs>
        <LinearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={nature.sky} />
          <Stop offset="1" stopColor={nature.skyHigh} />
        </LinearGradient>
      </Defs>
      <Rect x={-1} y={-1} width={f.W + 2} height={f.H + 2} fill={`url(#${skyId})`} />
      <G transform={`translate(${f.ox} ${f.oy})`}>
        {/* Le soleil bas de la fin d'après-midi, posé sur les dunes */}
        <Circle cx={244} cy={118} r={20} fill={nature.sunGlow} />
        <Circle cx={244} cy={118} r={13} fill={nature.sun} />
      </G>
      <Path d={art.far} fill={nature.dune.light} />
      <Path d={art.near} fill={nature.dune.base} />
      <G transform={`translate(${f.ox} ${f.oy})`}>
        {/* L'ombre de l'acacia, une pilule plate posée au sol */}
        <Path d={capsuleD(pill(18, 155, 150, 155, 5))} fill={nature.dune.shade} />

        {/* Acacia : tronc, branches en éventail, couronne plate en deux étages */}
        <Path d={RC_TREE.trunk} fill={nature.bark.light} />
        <Path d={RC_TREE.trunkShade} fill={nature.bark.base} />
        <Path
          d={RC_TREE.branches}
          stroke={nature.bark.light}
          strokeWidth={RC_TREE.branchWidth}
          strokeLinecap="round"
          fill="none"
        />
        <Path d={RC_TREE.back.full} fill={nature.acacia.base} />
        <Path d={RC_TREE.back.light} fill={nature.acacia.light} />
        <Path d={RC_TREE.front.full} fill={nature.acacia.base} />
        <Path d={RC_TREE.front.light} fill={nature.acacia.light} />
        <Path d={RC_TREE.front.shade} fill={nature.acacia.shade} />

        {/* La chèvre endormie */}
        <Path d={GOAT.shadow} fill={nature.duneDeep} />
        <Path d={GOAT.legs} fill={cream.shade} />
        <Path d={GOAT.tail} fill={cream.shade} />
        <Path d={GOAT.bodyShade} fill={cream.shade} />
        <Path d={GOAT.body} fill={cream.base} />
        <Path d={GOAT.patch} fill={nature.bark.light} />
        <Path d={GOAT.ear} fill={cream.shade} />
        <Path d={GOAT.head} fill={cream.base} />
        <Path d={GOAT.muzzle} fill={cream.base} />
        <Path d={GOAT.horn} stroke={nature.bark.base} strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <Path d={GOAT.eye} stroke={illustration.ink} strokeWidth={1.3} strokeLinecap="round" fill="none" />

        {/* Natte tressée : tranche, face, trame, bandes teintes */}
        <Rect x={112} y={151} width={126} height={17} rx={4} fill={mat.shade} />
        <Rect x={112} y={148} width={126} height={17} rx={4} fill={mat.light} />
        <Path d="M118 154H232M118 160H232" stroke={mat.base} strokeWidth={1.6} strokeLinecap="round" />
        <Path d="M121 148V165M128 148V165M222 148V165M229 148V165" stroke={illustration.school.clay.base} strokeWidth={3} />

        {/* La fille (avatar 4) : haut prune */}
        <Path d={RC_GIRL.feet} fill={girlSkin.shade} />
        <Path d={RC_GIRL.lap} fill={fabric.plum.shade} />
        <Path d={RC_GIRL.lapLit} fill={fabric.plum.base} />
        <Path d={RC_GIRL.neck} fill={girlSkin.shade} />
        <Path d={RC_GIRL.torso} fill={fabric.plum.shade} />
        <Path d={RC_GIRL.torsoLit} fill={fabric.plum.base} />
        <G transform={RC_GIRL.head}>
          <AvatarHeadArt avatarId="avatar-4" expression="joy" />
        </G>

        {/* Le garçon (avatar 1) : chemise d'écolier pétrole, short kaki */}
        <Path d={RC_BOY.feet} fill={boySkin.shade} />
        <Path d={RC_BOY.lap} fill={fabric.khaki.shade} />
        <Path d={RC_BOY.lapLit} fill={fabric.khaki.base} />
        <Path d={RC_BOY.neck} fill={boySkin.shade} />
        <Path d={RC_BOY.torso} fill={fabric.indigo.shade} />
        <Path d={RC_BOY.torsoLit} fill={fabric.indigo.base} />
        <G transform={RC_BOY.head}>
          <AvatarHeadArt avatarId="avatar-1" />
        </G>

        {/* Le livre partagé, ouvert et levé entre eux : deux pages, la couverture, trois lignes */}
        <Path d="M152 126Q163.5 121.5 175 126V144Q163.5 139.5 152 144Z" fill={paper.light} />
        <Path d="M175 126Q186.5 121.5 198 126V144Q186.5 139.5 175 144Z" fill={paper.base} />
        <Path d="M152 144Q163.5 139.5 175 144Q186.5 139.5 198 144V147Q186.5 142.5 175 147Q163.5 142.5 152 147Z" fill={illustration.school.clay.base} />
        <Path d="M175 126V144" stroke={paper.shade} strokeWidth={1.5} />
        <Path
          d="M157 130.5H170M157 134.5H168M157 138.5H170M180 130.5H193M180 134.5H191M180 138.5H193"
          stroke={paper.shade}
          strokeWidth={1.6}
          strokeLinecap="round"
        />

        {/* Les bras par-dessus le livre : manches, avant-bras, mains */}
        <Path d={RC_GIRL.sleeves} fill={fabric.plum.base} />
        <Path d={RC_GIRL.forearms} fill={girlSkin.base} />
        <Path d={RC_GIRL.hands} fill={girlSkin.base} />
        <Path d={RC_BOY.sleeves} fill={fabric.indigo.base} />
        <Path d={RC_BOY.forearms} fill={boySkin.base} />
        <Path d={RC_BOY.hands} fill={boySkin.base} />

        {/* Touffes d'herbe au bord de la natte */}
        <Path
          d="M104 152L102 146M107 152L108 145M246 152L244 146M249 152L251 147"
          stroke={nature.acacia.base}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </G>
    </Svg>
  );
});
