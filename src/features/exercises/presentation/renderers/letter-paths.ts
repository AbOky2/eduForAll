/**
 * Guided tracing skeletons. Each letter is one or more strokes; a stroke is
 * an ordered list of checkpoints in a normalized 1×1 box (y grows downward).
 * Deliberately coarse: the exercise validates passage through checkpoints
 * with a generous radius, not calligraphic accuracy (see docs/design-decisions.md).
 *
 * Les formes rondes sont prises sur de vraies ellipses (`arc`) : la courbe
 * douce qui passe par les jalons est alors une ellipse nette, pas une patate.
 * Un jalon doublé (`corner`) est un angle vif (v, z, 2, 4…) ; un trait dont
 * le dernier jalon est le premier (`loop`) se referme sans couture (o, 0, 8).
 * Le corps des lettres courtes tient entre la hauteur d'x (0,34) et la ligne
 * de base (0,85) ; hampes et chiffres montent vers 0,07–0,12 ; les jambages
 * descendent à 1.
 */
export type Stroke = readonly (readonly [number, number])[];

type Checkpoint = readonly [number, number];

const round3 = (value: number) => Math.round(value * 1000) / 1000;

/**
 * `count` jalons sur un arc d'ellipse, de l'angle `from` à l'angle `to`
 * (degrés ; 0° à droite, 90° en haut : l'angle croît dans le sens inverse
 * des aiguilles d'une montre, à l'écran).
 */
function arc(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
  count: number,
): Checkpoint[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = ((from + ((to - from) * index) / (count - 1)) * Math.PI) / 180;
    return [round3(cx + rx * Math.cos(angle)), round3(cy - ry * Math.sin(angle))] as const;
  });
}

/** Un trait fermé : son dernier jalon est exactement le premier. */
function loop(points: readonly Checkpoint[]): Checkpoint[] {
  const [first] = points;
  return first ? [...points.slice(0, -1), first] : [];
}

/** Un angle vif : le jalon est doublé, la courbe y arrive et en repart droit. */
const corner = (x: number, y: number): Checkpoint[] => [
  [x, y],
  [x, y],
];

/** Le corps rond des lettres courtes : entre la hauteur d'x et la ligne de base. */
const BODY_CY = 0.595;
const BODY_RY = 0.255;

/** La panse de a, d, g, q : partie d'en haut à droite, elle tourne vers la gauche et revient au trait. */
const bowl = arc(0.48, BODY_CY, 0.25, BODY_RY, 45, 350, 9);
/** La panse de b et p : partie du trait, elle tourne vers la droite et y revient. */
const belly = arc(0.5, BODY_CY, 0.22, BODY_RY, 150, -150, 8);
/** Le e : la barre, puis le rond vers le haut et la gauche. */
const eBody: Stroke = [
  [0.25, BODY_CY],
  [0.5, BODY_CY],
  ...arc(0.5, BODY_CY, 0.25, BODY_RY, 0, 320, 9),
];
/** Le pont de n et h. */
const bridge = (stem: number, right: number): Checkpoint[] => [
  ...arc((stem + right) / 2, 0.5, (right - stem) / 2, 0.16, 180, 0, 5),
  [right, 0.68],
  [right, 0.85],
];

export const LETTER_STROKES: Record<string, readonly Stroke[]> = {
  a: [
    bowl,
    [
      [0.73, 0.34],
      [0.73, 0.6],
      [0.73, 0.85],
    ],
  ],
  b: [
    [
      [0.28, 0.07],
      [0.28, 0.46],
      [0.28, 0.85],
    ],
    belly,
  ],
  c: [arc(0.5, BODY_CY, 0.25, BODY_RY, 45, 315, 8)],
  d: [
    bowl,
    [
      [0.73, 0.07],
      [0.73, 0.46],
      [0.73, 0.85],
    ],
  ],
  e: [eBody],
  é: [
    eBody,
    [
      [0.42, 0.18],
      [0.58, 0.06],
    ],
  ],
  è: [
    eBody,
    [
      [0.58, 0.18],
      [0.42, 0.06],
    ],
  ],
  ê: [eBody, [[0.37, 0.18], ...corner(0.5, 0.06), [0.63, 0.18]]],
  f: [
    [...arc(0.58, 0.22, 0.18, 0.15, 25, 180, 4), [0.4, 0.5], [0.4, 0.85]],
    [
      [0.22, 0.34],
      [0.4, 0.34],
      [0.6, 0.34],
    ],
  ],
  g: [bowl, [[0.73, 0.34], [0.73, 0.6], ...arc(0.53, 0.86, 0.2, 0.14, 0, -160, 4)]],
  h: [
    [
      [0.28, 0.07],
      [0.28, 0.46],
      [0.28, 0.85],
    ],
    bridge(0.28, 0.68),
  ],
  i: [
    [
      [0.5, 0.34],
      [0.5, 0.6],
      [0.5, 0.85],
    ],
    // Le point : un seul jalon, validé d'un toucher.
    [[0.5, 0.17]],
  ],
  j: [[[0.56, 0.34], [0.56, 0.6], ...arc(0.38, 0.86, 0.18, 0.14, 0, -160, 4)], [[0.56, 0.17]]],
  k: [
    [
      [0.3, 0.07],
      [0.3, 0.46],
      [0.3, 0.85],
    ],
    [
      [0.7, 0.34],
      [0.5, 0.47],
      [0.3, 0.6],
    ],
    [
      [0.46, 0.5],
      [0.6, 0.67],
      [0.74, 0.85],
    ],
  ],
  l: [
    [
      [0.5, 0.07],
      [0.5, 0.46],
      [0.5, 0.85],
    ],
  ],
  m: [
    [
      [0.2, 0.34],
      [0.2, 0.6],
      [0.2, 0.85],
    ],
    [...arc(0.35, 0.48, 0.15, 0.14, 180, 0, 5), [0.5, 0.67], [0.5, 0.85]],
    [...arc(0.65, 0.48, 0.15, 0.14, 180, 0, 5), [0.8, 0.67], [0.8, 0.85]],
  ],
  n: [
    [
      [0.3, 0.34],
      [0.3, 0.6],
      [0.3, 0.85],
    ],
    bridge(0.3, 0.7),
  ],
  o: [loop(arc(0.5, BODY_CY, 0.25, BODY_RY, 60, 420, 9))],
  p: [
    [
      [0.28, 0.34],
      [0.28, 0.67],
      [0.28, 1.0],
    ],
    belly,
  ],
  q: [
    bowl,
    [
      [0.73, 0.34],
      [0.73, 0.67],
      [0.73, 1.0],
    ],
  ],
  r: [
    [
      [0.34, 0.34],
      [0.34, 0.6],
      [0.34, 0.85],
    ],
    arc(0.52, 0.53, 0.18, 0.19, 180, 45, 4),
  ],
  s: [
    [
      [0.69, 0.41],
      [0.6, 0.355],
      [0.47, 0.343],
      [0.35, 0.378],
      [0.31, 0.455],
      [0.37, 0.53],
      [0.5, 0.585],
      [0.63, 0.64],
      [0.69, 0.72],
      [0.65, 0.8],
      [0.53, 0.848],
      [0.4, 0.846],
      [0.29, 0.8],
    ],
  ],
  t: [
    [
      [0.48, 0.12],
      [0.48, 0.5],
      [0.48, 0.85],
    ],
    [
      [0.28, 0.34],
      [0.48, 0.34],
      [0.68, 0.34],
    ],
  ],
  u: [
    [[0.28, 0.34], ...arc(0.48, 0.6, 0.2, 0.25, 180, 360, 5), [0.68, 0.34]],
    [
      [0.68, 0.34],
      [0.68, 0.6],
      [0.68, 0.85],
    ],
  ],
  v: [[[0.24, 0.34], [0.37, 0.6], ...corner(0.5, 0.85), [0.63, 0.6], [0.76, 0.34]]],
  w: [
    [[0.12, 0.34], [0.22, 0.6], ...corner(0.32, 0.85), [0.41, 0.65], [0.5, 0.45]],
    [[0.5, 0.45], [0.59, 0.65], ...corner(0.68, 0.85), [0.78, 0.6], [0.88, 0.34]],
  ],
  x: [
    [
      [0.26, 0.34],
      [0.5, 0.595],
      [0.74, 0.85],
    ],
    [
      [0.74, 0.34],
      [0.5, 0.595],
      [0.26, 0.85],
    ],
  ],
  y: [
    [
      [0.24, 0.34],
      [0.36, 0.6],
      [0.49, 0.83],
    ],
    [
      [0.76, 0.34],
      [0.6, 0.68],
      [0.46, 0.94],
      [0.3, 1.0],
    ],
  ],
  z: [
    [
      [0.26, 0.34],
      [0.5, 0.34],
      [0.74, 0.34],
    ],
    [
      [0.74, 0.34],
      [0.5, 0.595],
      [0.26, 0.85],
    ],
    [
      [0.26, 0.85],
      [0.5, 0.85],
      [0.74, 0.85],
    ],
  ],

  // Chiffres — « écriture en chiffres […] des nombres étudiés en
  // mathématiques » (programme p. 26). Ils montent de la ligne de base (0,85)
  // à 0,12, comme les capitales.
  '0': [loop(arc(0.5, 0.485, 0.23, 0.365, 90, 450, 9))],
  '1': [[[0.32, 0.28], [0.41, 0.2], ...corner(0.5, 0.12), [0.5, 0.48], [0.5, 0.85]]],
  '2': [
    [
      ...arc(0.49, 0.3, 0.21, 0.18, 160, -35, 6),
      [0.46, 0.63],
      ...corner(0.27, 0.85),
      [0.5, 0.85],
      [0.74, 0.85],
    ],
  ],
  '3': [
    [...arc(0.48, 0.28, 0.2, 0.16, 150, -90, 6), [0.42, 0.44]],
    [[0.48, 0.44], ...arc(0.48, 0.645, 0.23, 0.205, 70, -150, 6)],
  ],
  '4': [
    [[0.6, 0.12], [0.41, 0.39], ...corner(0.22, 0.65), [0.5, 0.65], [0.78, 0.65]],
    [
      [0.6, 0.4],
      [0.6, 0.62],
      [0.6, 0.85],
    ],
  ],
  '5': [
    [[0.68, 0.12], [0.5, 0.12], ...corner(0.32, 0.12), [0.31, 0.27], [0.3, 0.43]],
    [[0.3, 0.43], ...arc(0.48, 0.63, 0.22, 0.22, 115, -150, 6)],
  ],
  '6': [
    [
      [0.66, 0.15],
      [0.5, 0.12],
      [0.37, 0.19],
      [0.3, 0.33],
      [0.29, 0.5],
      ...arc(0.5, 0.65, 0.21, 0.2, 180, 520, 9),
    ],
  ],
  '7': [
    [
      [0.26, 0.12],
      [0.5, 0.12],
      [0.74, 0.12],
    ],
    [
      [0.74, 0.12],
      [0.6, 0.48],
      [0.47, 0.85],
    ],
  ],
  '8': [
    loop(arc(0.5, 0.295, 0.18, 0.175, 270, -90, 9)),
    loop(arc(0.5, 0.66, 0.21, 0.19, 90, 450, 9)),
  ],
  '9': [[...arc(0.5, 0.31, 0.2, 0.19, -20, -360, 9), [0.69, 0.52], [0.62, 0.71], [0.5, 0.85]]],
};

/** Les lignes du cahier, dans la boîte normalisée (y vers le bas). */
export const WRITING_LINES = { ascender: 0.07, xHeight: 0.34, baseline: 0.85 } as const;

/**
 * Les lettres sans hampe : leur corps tient entre la hauteur d'x et la ligne
 * de base (le point du i et du j, comme un accent, reste au-dessus).
 */
const SHORT_LETTERS = new Set([
  'a',
  'c',
  'e',
  'é',
  'è',
  'ê',
  'g',
  'i',
  'j',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
]);

/**
 * Pose le corps d'une lettre courte sur les lignes : son sommet sur la
 * hauteur d'x, sa base inchangée, les jambages et les accents à leur place.
 * Les squelettes ont été dessinés à des hauteurs d'x différentes (0,22 à
 * 0,34) ; sur une ardoise lignée, l'écart se verrait.
 */
function onTheLines(letter: string, strokes: readonly Stroke[]): readonly Stroke[] {
  if (!SHORT_LETTERS.has(letter)) {
    return strokes;
  }
  // Un accent (ou un point) est un trait entièrement au-dessus de 0,2 : il ne compte pas dans le corps.
  const body = strokes.filter((stroke) => stroke.some(([, y]) => y >= 0.2));
  const top = Math.min(...body.flat().map(([, y]) => y));
  const { xHeight, baseline } = WRITING_LINES;
  if (!(top < baseline) || Math.abs(top - xHeight) < 0.005) {
    return strokes;
  }
  const k = (baseline - xHeight) / (baseline - top);
  return strokes.map((stroke) =>
    body.includes(stroke)
      ? stroke.map(([x, y]) => [x, y <= baseline ? baseline - (baseline - y) * k : y] as const)
      : stroke,
  );
}

const ON_THE_LINES = new Map(
  Object.entries(LETTER_STROKES).map(([letter, strokes]) => [letter, onTheLines(letter, strokes)]),
);

export function strokesForLetter(letter: string): readonly Stroke[] | null {
  return ON_THE_LINES.get(letter.toLowerCase()) ?? null;
}

/**
 * Ce qui se trace sur l'ardoise : les traits, dans une boîte de hauteur 1 et
 * de largeur `aspect` (1 pour une lettre ou un chiffre). Un nombre à deux
 * chiffres (« 10 », « 12 », … « 90 », programme de CP2) est composé des
 * squelettes de ses chiffres posés côte à côte, sans les déformer.
 */
export interface TraceGlyph {
  readonly strokes: readonly Stroke[];
  readonly aspect: number;
}

/** Entre deux chiffres d'un nombre : l'écart de leurs axes, en hauteurs de boîte. */
const DIGIT_GAP = 0.2;
/** De l'air de part et d'autre d'un nombre composé. */
const COMPOSED_MARGIN = 0.12;

export function glyphForTrace(text: string): TraceGlyph | null {
  const characters = [...text.toLowerCase()];
  if (characters.length === 1) {
    const strokes = strokesForLetter(text);
    return strokes ? { strokes, aspect: 1 } : null;
  }
  const parts: (readonly Stroke[])[] = [];
  for (const character of characters) {
    const strokes = ON_THE_LINES.get(character);
    if (!strokes) {
      return null;
    }
    parts.push(strokes);
  }
  const extents = parts.map((strokes) => {
    const xs = strokes.flat().map(([x]) => x);
    return [Math.min(...xs), Math.max(...xs)] as const;
  });
  const content =
    extents.reduce((sum, [min, max]) => sum + (max - min), 0) + DIGIT_GAP * (parts.length - 1);
  const aspect = Math.max(1, content + 2 * COMPOSED_MARGIN);
  let cursor = (aspect - content) / 2;
  const strokes = parts.flatMap((glyph, index) => {
    const [min, max] = extents[index] ?? [0, 0];
    const shift = cursor - min;
    cursor += max - min + DIGIT_GAP;
    return glyph.map((stroke) => stroke.map(([x, y]) => [x + shift, y] as const));
  });
  return { strokes, aspect };
}

// ---------------------------------------------------------------------------
// Géométrie de l'ardoise (en points écran, une fois la boîte posée).
// ---------------------------------------------------------------------------

export type Point = readonly [number, number];

/** Un trait qui se referme sur son départ (o, 0, 8) : sa courbe n'a pas de couture. */
function isLoop(points: readonly Point[]): boolean {
  const first = points[0];
  const last = points[points.length - 1];
  return points.length > 3 && !!first && !!last && first[0] === last[0] && first[1] === last[1];
}

/** Les deux points de contrôle du segment i → i+1 (Catmull-Rom → Bézier cubique). */
function controls(points: readonly Point[], i: number): readonly [Point, Point] | null {
  const p1 = points[i];
  const p2 = points[i + 1];
  if (!p1 || !p2) {
    return null;
  }
  if (p1[0] === p2[0] && p1[1] === p2[1]) {
    // Le jalon doublé d'un angle vif : un segment nul, sans boucle.
    return [p1, p2];
  }
  const closed = isLoop(points);
  const p0 = points[i - 1] ?? (closed ? points[points.length - 2] : undefined) ?? p1;
  const p3 = points[i + 2] ?? (closed ? points[1] : undefined) ?? p2;
  return [
    [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6],
    [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6],
  ];
}

/**
 * Une courbe douce par les jalons : le modèle se dessine depuis le chemin
 * lui-même, si bien que modèle, jalons et bille coïncident toujours.
 * `segments` limite la courbe à ses premiers segments — ce que l'enfant a
 * déjà écrit suit exactement le modèle, sans angle.
 */
export function smoothPath(points: readonly Point[], segments = points.length - 1): string {
  const [first] = points;
  if (!first) {
    return '';
  }
  let d = `M${first[0]} ${first[1]}`;
  for (let i = 0; i < Math.min(segments, points.length - 1); i += 1) {
    const c = controls(points, i);
    const p2 = points[i + 1];
    if (!c || !p2) {
      break;
    }
    d += `C${c[0][0]} ${c[0][1]} ${c[1][0]} ${c[1][1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/** Échantillons par segment de la courbe : le jalon k est l'échantillon k × SAMPLES_PER_SEGMENT. */
export const SAMPLES_PER_SEGMENT = 12;

/** La courbe douce, échantillonnée (le premier et le dernier jalon compris). */
export function sampleStroke(points: readonly Point[]): Point[] {
  const samples: Point[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const c = controls(points, i);
    const p1 = points[i];
    const p2 = points[i + 1];
    if (!c || !p1 || !p2) {
      break;
    }
    for (let step = 0; step < SAMPLES_PER_SEGMENT; step += 1) {
      const t = step / SAMPLES_PER_SEGMENT;
      const u = 1 - t;
      const a = u * u * u;
      const b = 3 * u * u * t;
      const k = 3 * u * t * t;
      const e = t * t * t;
      samples.push([
        a * p1[0] + b * c[0][0] + k * c[1][0] + e * p2[0],
        a * p1[1] + b * c[0][1] + k * c[1][1] + e * p2[1],
      ]);
    }
  }
  const last = points[points.length - 1];
  if (last) {
    samples.push(last);
  }
  return samples;
}

/** Longueur cumulée le long d'une suite de points (0 au départ). */
export function cumulativeLengths(samples: readonly Point[]): number[] {
  const lengths: number[] = [];
  let total = 0;
  samples.forEach((point, index) => {
    const previous = samples[index - 1];
    if (previous) {
      total += Math.hypot(point[0] - previous[0], point[1] - previous[1]);
    }
    lengths.push(total);
  });
  return lengths;
}

/** Le point situé à `distance` du départ, et la direction du chemin à cet endroit (vecteur unitaire). */
export function pointAlong(
  samples: readonly Point[],
  distance: number,
): { point: Point; direction: Point } | null {
  const lengths = cumulativeLengths(samples);
  for (let i = 1; i < samples.length; i += 1) {
    const a = samples[i - 1];
    const b = samples[i];
    const before = lengths[i - 1] ?? 0;
    const after = lengths[i] ?? 0;
    if (!a || !b || after <= before || after < distance) {
      continue;
    }
    const t = (distance - before) / (after - before);
    const length = after - before;
    return {
      point: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
      direction: [(b[0] - a[0]) / length, (b[1] - a[1]) / length],
    };
  }
  return null;
}

/** La direction (unitaire) d'un trait échantillonné à l'échantillon `index`. */
function directionAt(samples: readonly Point[], index: number): Point | null {
  const a = samples[Math.max(0, index - 1)];
  const b = samples[Math.min(samples.length - 1, index + 1)];
  if (!a || !b) {
    return null;
  }
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  return length > 0 ? [(b[0] - a[0]) / length, (b[1] - a[1]) / length] : null;
}

/**
 * Les raccords : un bout franc posé en angle sur un autre trait (le 5, le 7,
 * le z) laisserait une encoche. Un disque de la largeur de la bande, posé là,
 * arrondit le raccord comme une plume l'aurait fait. Deux traits qui se
 * prolongent (le u : on monte, puis on redescend) n'en ont pas besoin — le
 * disque dépasserait de la ligne.
 */
export function strokeJoints(strokes: readonly (readonly Point[])[], radius: number): Point[] {
  const joints: Point[] = [];
  strokes.forEach((stroke, index) => {
    if (stroke.length < 2) {
      return;
    }
    const ends = [0, stroke.length - 1];
    for (const endIndex of ends) {
      const end = stroke[endIndex];
      const own = directionAt(stroke, endIndex);
      if (!end || !own) {
        continue;
      }
      const angled = strokes.some((other, otherIndex) => {
        if (otherIndex === index || other.length < 2) {
          return false;
        }
        let nearest = -1;
        let best = radius;
        other.forEach(([x, y], sample) => {
          const distance = Math.hypot(x - end[0], y - end[1]);
          if (distance <= best) {
            best = distance;
            nearest = sample;
          }
        });
        const theirs = nearest >= 0 ? directionAt(other, nearest) : null;
        return theirs !== null && Math.abs(own[0] * theirs[1] - own[1] * theirs[0]) > 0.35;
      });
      if (angled) {
        joints.push(end);
      }
    }
  });
  return joints;
}

/** Un rectangle à laisser libre (la pastille du modèle). */
export interface KeepOut {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface StrokeLabelOptions {
  /** Chaque trait, déjà échantillonné (un trait d'un seul jalon : un point). */
  readonly strokes: readonly (readonly Point[])[];
  /** La demi-épaisseur de la bande du modèle. */
  readonly bandHalf: number;
  /** Le rayon du jalon de départ, autour duquel se pose le numéro. */
  readonly startRadius: number;
  /** Le rayon occupé par un numéro. */
  readonly labelRadius: number;
  readonly bounds: { readonly width: number; readonly height: number };
  readonly keepOut?: readonly KeepOut[];
}

const LABEL_DIRECTIONS = Array.from({ length: 16 }, (_, index) => {
  const angle = (index / 16) * Math.PI * 2;
  return [Math.cos(angle), Math.sin(angle)] as const;
});
const LABEL_RINGS = [1, 1.35, 1.7] as const;

/**
 * Où poser le numéro de chaque trait (1, 2…) : contre son départ, hors de
 * toute bande, de préférence à gauche (le sens de la lecture), et jamais sur
 * un autre numéro ni sur la pastille du modèle.
 */
export function placeStrokeLabels({
  strokes,
  bandHalf,
  startRadius,
  labelRadius,
  bounds,
  keepOut = [],
}: StrokeLabelOptions): Point[] {
  const all = strokes.flat();
  const placed: Point[] = [];
  const gap = Math.max(4, labelRadius * 0.3);
  const distance = startRadius + labelRadius + gap;
  const needed = labelRadius + gap;
  for (const stroke of strokes) {
    const start = stroke[0];
    if (!start) {
      placed.push([0, 0]);
      continue;
    }
    let best: { point: Point; clearance: number; preference: number } | null = null;
    // Au plus près du départ ; plus loin seulement si tout le tour est pris (le croisement du 8).
    for (const [ring, dx, dy] of LABEL_RINGS.flatMap((ring) =>
      LABEL_DIRECTIONS.map(([dx, dy]) => [ring, dx, dy] as const),
    )) {
      if (best !== null && best.clearance >= needed && ring > 1) {
        break;
      }
      const point: Point = [start[0] + dx * distance * ring, start[1] + dy * distance * ring];
      const inside =
        point[0] - labelRadius >= 4 &&
        point[1] - labelRadius >= 4 &&
        point[0] + labelRadius <= bounds.width - 4 &&
        point[1] + labelRadius <= bounds.height - 4;
      const blocked = keepOut.some(
        (box) =>
          point[0] + labelRadius > box.x &&
          point[0] - labelRadius < box.x + box.width &&
          point[1] + labelRadius > box.y &&
          point[1] - labelRadius < box.y + box.height,
      );
      if (!inside || blocked) {
        continue;
      }
      const fromBands = Math.min(
        ...all.map(([x, y]) => Math.hypot(point[0] - x, point[1] - y) - bandHalf),
      );
      const fromLabels = Math.min(
        Infinity,
        ...placed.map(([x, y]) => Math.hypot(point[0] - x, point[1] - y) - labelRadius),
      );
      const clearance = Math.min(fromBands, fromLabels);
      // À gauche, un peu au-dessus : là où l'œil d'un lecteur débutant commence.
      const preference = -dx - 0.35 * dy;
      const better =
        best === null ||
        (clearance >= needed && best.clearance < needed) ||
        (clearance >= needed && best.clearance >= needed && preference > best.preference) ||
        (clearance < needed && best.clearance < needed && clearance > best.clearance);
      if (better) {
        best = { point, clearance, preference };
      }
    }
    placed.push(best?.point ?? [start[0] - distance, start[1]]);
  }
  return placed;
}
