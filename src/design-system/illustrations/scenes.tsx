import { memo, useId, useMemo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { illustration } from '../tokens';

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

const SAND = '#d4a373';
const SAND_LIGHT = '#f0d5b1';
const SKY = '#f9e9ce';
const SUN = '#ffd166';
const TREE = '#7d562d';
const LEAF = '#5b7a4a';
const SKIN = '#8a5a3b';
const CLOTH = '#2b6485';
const INK = '#161a32';

interface SceneProps {
  width?: number;
  height?: number;
}

/** Child reading under an acacia at sunset (splash / onboarding 1). */
export function ReadingChildScene({ width = 280, height = 200 }: SceneProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 200">
      <Rect width={280} height={200} rx={20} fill={SKY} />
      <Circle cx={200} cy={92} r={40} fill={SUN} opacity={0.9} />
      <Ellipse cx={140} cy={185} rx={170} ry={45} fill={SAND_LIGHT} />
      <Ellipse cx={215} cy={175} rx={120} ry={32} fill={SAND} opacity={0.55} />
      {/* Acacia */}
      <Path
        d="M78 155c-2-28 -6-48 -18-70"
        stroke={TREE}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M62 88c-14-6-26-4-38 3M62 88c2-12 10-20 22-24M62 88c12-4 26-2 36 6"
        stroke={TREE}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx={30} cy={86} rx={22} ry={9} fill={LEAF} />
      <Ellipse cx={84} cy={58} rx={26} ry={10} fill={LEAF} />
      <Ellipse cx={104} cy={92} rx={22} ry={9} fill={LEAF} />
      {/* Child sitting with book */}
      <Circle cx={150} cy={128} r={13} fill={SKIN} />
      <Path d="M138 138c-8 6-12 16-12 26h48c0-10-4-20-12-26z" fill={CLOTH} />
      <Path d="M132 158l18-8 18 8-18 6z" fill="#fdf6e9" stroke={INK} strokeWidth={1.4} />
      <Path d="M150 150v14" stroke={INK} strokeWidth={1.2} />
    </Svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Géométrie partagée
// ─────────────────────────────────────────────────────────────────────────────

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

const disc = (cx: number, cy: number, r: number): Capsule => ({ x1: cx, y1: cy, x2: cx, y2: cy, r });
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

const capsulesD = (shapes: readonly Capsule[]) => shapes.map(capsuleD).join('');

/**
 * Ombre en croissant : la même forme, décalée de `a` vers la lumière et
 * amincie juste assez pour rester dedans. Posée sur la forme d'ombre, il n'en
 * reste qu'un croissant net en bas à droite, effilé jusqu'à zéro vers 10 h 30.
 */
const towardLight = (c: Capsule, a: number): Capsule => ({
  x1: c.x1 - a,
  y1: c.y1 - a,
  x2: c.x2 - a,
  y2: c.y2 - a,
  r: c.r - a * Math.SQRT2,
});

/** Arc horaire — sert au reflet signature, vers 10–11 h. */
function arcD(cx: number, cy: number, r: number, fromDeg: number, toDeg: number): string {
  const a0 = rad(fromDeg);
  const a1 = rad(toDeg);
  return `M${q(cx + r * Math.cos(a0))} ${q(cy + r * Math.sin(a0))}A${q(r)} ${q(r)} 0 0 1 ${q(cx + r * Math.cos(a1))} ${q(cy + r * Math.sin(a1))}`;
}

/** Rayons-pilules : segments droits aux extrémités entières. */
function raysD(cx: number, cy: number, r0: number, r1: number, count: number, startDeg: number): string {
  let d = '';
  for (let i = 0; i < count; i += 1) {
    const t = rad(startDeg + (360 / count) * i);
    d += `M${Math.round(cx + r0 * Math.cos(t))} ${Math.round(cy + r0 * Math.sin(t))}L${Math.round(cx + r1 * Math.cos(t))} ${Math.round(cy + r1 * Math.sin(t))}`;
  }
  return d;
}

/** Courbe tendue passant par des extrêmes, tangente horizontale à chacun. */
function through(points: readonly Pt[]): string {
  let d = '';
  for (let i = 1; i < points.length; i += 1) {
    const p0 = points[i - 1];
    const p1 = points[i];
    if (!p0 || !p1) {
      continue;
    }
    const k = (p1[0] - p0[0]) / 2;
    d += `C${q(p0[0] + k)} ${q(p0[1])} ${q(p1[0] - k)} ${q(p1[1])} ${q(p1[0])} ${q(p1[1])}`;
  }
  return d;
}

/** Une bande de dune : crêtes arrondies, base horizontale (jamais une ellipse). */
interface BandSpec {
  /** Extrêmes alternés (crête, creux…) en coordonnées du cœur. */
  readonly core: readonly Pt[];
  /** Au-delà du cœur : demi-période et hauteurs des ondulations. */
  readonly step: number;
  readonly crest: number;
  readonly trough: number;
}

/** Les extrêmes de la bande, prolongés jusqu'aux deux bords de la boîte. */
function bandExtrema(spec: BandSpec, ox: number, oy: number, width: number): Pt[] {
  const pts: Pt[] = spec.core.map(([x, y]) => [x + ox, y + oy] as const);
  const second = pts[1];
  const beforeLast = pts[pts.length - 2];
  let first = pts[0];
  let last = pts[pts.length - 1];
  if (!first || !last || !second || !beforeLast) {
    return pts;
  }
  let firstIsCrest = first[1] < second[1];
  while (first[0] > 0) {
    firstIsCrest = !firstIsCrest;
    first = [first[0] - spec.step, (firstIsCrest ? spec.crest : spec.trough) + oy];
    pts.unshift(first);
  }
  let lastIsCrest = last[1] < beforeLast[1];
  while (last[0] < width) {
    lastIsCrest = !lastIsCrest;
    last = [last[0] + spec.step, (lastIsCrest ? spec.crest : spec.trough) + oy];
    pts.push(last);
  }
  return pts;
}

function bandD(points: readonly Pt[], bottom: number): string {
  const first = points[0];
  if (!first) {
    return '';
  }
  return `M${q(first[0])} ${q(bottom)}V${q(first[1])}${through(points)}V${q(bottom)}Z`;
}

/**
 * Modelé d'une bande : un croissant de lumière sur chaque pente qui monte vers
 * la droite (face au soleil), un croissant d'ombre sur chaque pente qui
 * descend. Les deux sont épais près de la crête et s'effilent vers le creux :
 * la crête devient une arête nette, comme sur une vraie dune. L'épaisseur est
 * proportionnelle à la hauteur de la pente (`ratio` × dénivelé) : une petite
 * ondulation au bord du cadre reste discrète, la grande dune garde son arête.
 */
function slopeD(points: readonly Pt[], side: 'light' | 'shade', ratio: number): string {
  let d = '';
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    if (!a || !b) {
      continue;
    }
    const descending = b[1] > a[1];
    if ((side === 'shade') !== descending) {
      continue;
    }
    const dx = b[0] - a[0];
    const k = dx / 2;
    const depth = ratio * Math.abs(b[1] - a[1]);
    const outer = `M${q(a[0])} ${q(a[1])}C${q(a[0] + k)} ${q(a[1])} ${q(b[0] - k)} ${q(b[1])} ${q(b[0])} ${q(b[1])}`;
    const back = descending
      ? // de la crête (a) au creux (b) : épais côté a
        `C${q(b[0] - dx * 0.6)} ${q(b[1] + depth * 0.15)} ${q(a[0] + dx * 0.2)} ${q(a[1] + depth)} ${q(a[0])} ${q(a[1])}`
      : // du creux (a) à la crête (b) : épais côté b
        `C${q(b[0] - dx * 0.2)} ${q(b[1] + depth)} ${q(a[0] + dx * 0.6)} ${q(a[1] + depth * 0.15)} ${q(a[0])} ${q(a[1])}`;
    d += `${outer}${back}Z`;
  }
  return d;
}

/** Cadre adaptatif : le cœur (coreW × coreH) reste entier, centré, posé en bas. */
interface Frame {
  readonly W: number;
  readonly H: number;
  readonly ox: number;
  readonly oy: number;
}

function frameFor(width: number, height: number, coreW: number, coreH: number): Frame {
  const ratio = width / Math.max(height, 1);
  if (ratio >= coreW / coreH) {
    const W = q(coreH * ratio);
    return { W, H: coreH, ox: q((W - coreW) / 2), oy: 0 };
  }
  const H = q(coreW / ratio);
  return { W: coreW, H, ox: 0, oy: q(H - coreH) };
}

const nature = illustration.nature;
const white = illustration.white;

/**
 * Lentille-galet : le profil d'un étage de couronne, bouts arrondis (rayon
 * `r`). `light` longe le haut, épais à gauche ; `shade` longe le bas, épais à
 * droite — la lumière vient d'en haut à gauche.
 */
function lensD(cx: number, cy: number, w: number, t: number, r: number) {
  const P = (x: number, y: number) => `${q(cx + x)} ${q(cy + y)}`;
  const s = q(r);
  const top = `M${P(-w, -r)}C${P(-0.62 * w, -1.15 * t)} ${P(0.62 * w, -1.15 * t)} ${P(w, -r)}`;
  const bottom = `C${P(0.62 * w, 0.5 * t)} ${P(-0.62 * w, 0.5 * t)} ${P(-w, r)}`;
  return {
    full: `${top}A${s} ${s} 0 0 1 ${P(w, r)}${bottom}A${s} ${s} 0 0 1 ${P(-w, -r)}Z`,
    light: `${top}C${P(0.62 * w, -0.85 * t)} ${P(-0.62 * w, -0.3 * t)} ${P(-w, -r)}Z`,
    shade: `M${P(w, r)}${bottom}C${P(-0.62 * w, 0.4 * t)} ${P(0.62 * w, -0.25 * t)} ${P(w, r)}Z`,
  };
}

/**
 * Acacia du Sahel (Acacia tortilis), pied en (x, y), échelle u (≈ 30 u de
 * haut) : tronc court qui fourche, trois branches en éventail, couronne plate
 * en deux étages minces — l'étage du fond plus court, décalé vers la lumière.
 */
function acacia(x: number, y: number, u: number) {
  const P = (px: number, py: number) => `${q(x + px * u)} ${q(y + py * u)}`;
  return {
    trunk: `M${P(-1.7, 0.6)}C${P(-1.1, -4)} ${P(-0.3, -7.6)} ${P(-0.1, -10)}L${P(2, -10)}C${P(1.9, -7)} ${P(1.6, -3.4)} ${P(1.9, 0.6)}Z`,
    trunkShade: `M${P(0.6, 0.6)}C${P(0.8, -3.6)} ${P(1.1, -7.2)} ${P(1.1, -10)}L${P(2, -10)}C${P(1.9, -7)} ${P(1.6, -3.4)} ${P(1.9, 0.6)}Z`,
    branches: `M${P(0.6, -9.2)}C${P(-1.2, -13.4)} ${P(-4.6, -16.6)} ${P(-8, -20.4)}M${P(1, -9.6)}C${P(1.3, -13.6)} ${P(1.5, -17.4)} ${P(1.6, -21)}M${P(1.4, -9.4)}C${P(3.8, -13.6)} ${P(6.8, -16.4)} ${P(10.5, -20.2)}`,
    branchWidth: q(1.5 * u),
    back: lensD(x - 3 * u, y - 25.2 * u, 12.5 * u, 4.2 * u, 0.7 * u),
    front: lensD(x + 0.5 * u, y - 21.5 * u, 18.5 * u, 5.4 * u, 0.8 * u),
  };
}

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

/** Avatar portraits — four distinct children, flat and dignified (S05). */
export function AvatarFace({ variant, size = 64 }: { variant: 1 | 2 | 3 | 4; size?: number }) {
  const skins = ['#8a5a3b', '#6e452c', '#9c6b46', '#7a4f33'] as const;
  const cloths = [CLOTH, '#c96f2f', '#5b7a4a', '#8c5fa8'] as const;
  const skin = skins[variant - 1] ?? skins[0];
  const cloth = cloths[variant - 1] ?? cloths[0];
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={32} fill={SAND_LIGHT} />
      {/* hair */}
      <Circle cx={32} cy={26} r={16.5} fill={INK} />
      {variant === 2 ? (
        <G>
          <Circle cx={18} cy={20} r={5} fill={INK} />
          <Circle cx={46} cy={20} r={5} fill={INK} />
        </G>
      ) : null}
      {variant === 4 ? <Rect x={16} y={8} width={32} height={10} rx={5} fill={cloth} /> : null}
      <Circle cx={32} cy={30} r={13} fill={skin} />
      <Circle cx={27} cy={28} r={1.8} fill={INK} />
      <Circle cx={37} cy={28} r={1.8} fill={INK} />
      <Path
        d="M27 35c3 2.6 7 2.6 10 0"
        stroke={INK}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M17 58c3-10 8-15 15-15s12 5 15 15z" fill={cloth} />
    </Svg>
  );
}
