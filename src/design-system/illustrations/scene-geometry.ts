/**
 * Géométrie des scènes — direction « Galets & craie » (brief v2 § 4).
 *
 * Fonctions pures qui produisent des chaînes `d` : pilules et disques (les
 * galets), croissants d'ombre, bandes de dunes à base horizontale, acacia.
 * Partagées par les scènes (`scenes.tsx`) et les fonds d'écran
 * (`backdrops.tsx`), pour que le paysage derrière l'interface et celui des
 * illustrations sortent de la même main. Une décimale au plus partout.
 */

export type Pt = readonly [number, number];

/** Une décimale au plus : des chemins nets, sans bruit. */
export const q = (value: number) => Math.round(value * 10) / 10;
export const rad = (deg: number) => (deg * Math.PI) / 180;

/**
 * La primitive des galets : un segment épaissi (pilule). Un disque est une
 * pilule de longueur nulle. Tracée dans le sens antihoraire, pour que
 * plusieurs pilules fusionnent en un seul chemin (règle de remplissage
 * `nonzero`).
 */
export interface Capsule {
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly r: number;
}

export const disc = (cx: number, cy: number, r: number): Capsule => ({ x1: cx, y1: cy, x2: cx, y2: cy, r });
export const pill = (x1: number, y1: number, x2: number, y2: number, r: number): Capsule => ({
  x1,
  y1,
  x2,
  y2,
  r,
});

export function capsuleD({ x1, y1, x2, y2, r }: Capsule): string {
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

export const capsulesD = (shapes: readonly Capsule[]) => shapes.map(capsuleD).join('');

/**
 * Ombre en croissant : la même forme, décalée de `a` vers la lumière et
 * amincie juste assez pour rester dedans. Posée sur la forme d'ombre, il n'en
 * reste qu'un croissant net en bas à droite, effilé jusqu'à zéro vers 10 h 30.
 */
export const towardLight = (c: Capsule, a: number): Capsule => ({
  x1: c.x1 - a,
  y1: c.y1 - a,
  x2: c.x2 - a,
  y2: c.y2 - a,
  r: c.r - a * Math.SQRT2,
});

/** Arc horaire — sert au reflet signature, vers 10–11 h. */
export function arcD(cx: number, cy: number, r: number, fromDeg: number, toDeg: number): string {
  const a0 = rad(fromDeg);
  const a1 = rad(toDeg);
  return `M${q(cx + r * Math.cos(a0))} ${q(cy + r * Math.sin(a0))}A${q(r)} ${q(r)} 0 0 1 ${q(cx + r * Math.cos(a1))} ${q(cy + r * Math.sin(a1))}`;
}

/** Rayons-pilules : segments droits aux extrémités entières. */
export function raysD(cx: number, cy: number, r0: number, r1: number, count: number, startDeg: number): string {
  let d = '';
  for (let i = 0; i < count; i += 1) {
    const t = rad(startDeg + (360 / count) * i);
    d += `M${Math.round(cx + r0 * Math.cos(t))} ${Math.round(cy + r0 * Math.sin(t))}L${Math.round(cx + r1 * Math.cos(t))} ${Math.round(cy + r1 * Math.sin(t))}`;
  }
  return d;
}

/** Courbe tendue passant par des extrêmes, tangente horizontale à chacun. */
export function through(points: readonly Pt[]): string {
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
export interface BandSpec {
  /** Extrêmes alternés (crête, creux…) en coordonnées du cœur. */
  readonly core: readonly Pt[];
  /** Au-delà du cœur : demi-période et hauteurs des ondulations. */
  readonly step: number;
  readonly crest: number;
  readonly trough: number;
}

/** Les extrêmes de la bande, prolongés jusqu'aux deux bords de la boîte. */
export function bandExtrema(spec: BandSpec, ox: number, oy: number, width: number): Pt[] {
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

export function bandD(points: readonly Pt[], bottom: number): string {
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
export function slopeD(points: readonly Pt[], side: 'light' | 'shade', ratio: number): string {
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
export interface Frame {
  readonly W: number;
  readonly H: number;
  readonly ox: number;
  readonly oy: number;
}

export function frameFor(width: number, height: number, coreW: number, coreH: number): Frame {
  const ratio = width / Math.max(height, 1);
  if (ratio >= coreW / coreH) {
    const W = q(coreH * ratio);
    return { W, H: coreH, ox: q((W - coreW) / 2), oy: 0 };
  }
  const H = q(coreW / ratio);
  return { W: coreW, H, ox: 0, oy: q(H - coreH) };
}


/**
 * Lentille-galet : le profil d'un étage de couronne, bouts arrondis (rayon
 * `r`). `light` longe le haut, épais à gauche ; `shade` longe le bas, épais à
 * droite — la lumière vient d'en haut à gauche.
 */
export function lensD(cx: number, cy: number, w: number, t: number, r: number) {
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
export function acacia(x: number, y: number, u: number) {
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
