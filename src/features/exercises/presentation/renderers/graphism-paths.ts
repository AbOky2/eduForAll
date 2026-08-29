/**
 * Pre-writing graphism skeletons — the phase the programme puts *before* any
 * letter: « L'étude de l'écriture proprement dite est précédée du graphisme »
 * (Programmes Réactualisés de l'Enseignement Primaire, MEN Tchad, 2004, p. 26).
 *
 * Each pattern is one repeating unit inside a normalized 1×1 cell (y grows
 * downward). The renderer tiles the unit across the ruled line, exactly like
 * a child filling a row on an « ardoise » or a « cahier à double lignes ».
 */
export type Stroke = readonly (readonly [number, number])[];

export type GraphismPattern =
  | 'points'
  | 'ligne-verticale'
  | 'ligne-horizontale'
  | 'oblique'
  | 'rond'
  | 'courbe'
  | 'boucle-haut'
  | 'boucle-bas'
  | 'pont'
  | 'enchainement';

const UNIT_STROKES: Record<GraphismPattern, readonly Stroke[]> = {
  // « traçage des points »
  points: [[[0.5, 0.5]]],
  // « des lignes verticales » — top to bottom, the writing direction
  'ligne-verticale': [
    [
      [0.5, 0.12],
      [0.5, 0.4],
      [0.5, 0.68],
      [0.5, 0.9],
    ],
  ],
  // « des lignes horizontales » — always left to right (p. 26)
  'ligne-horizontale': [
    [
      [0.06, 0.5],
      [0.35, 0.5],
      [0.65, 0.5],
      [0.94, 0.5],
    ],
  ],
  // « des obliques »
  oblique: [
    [
      [0.14, 0.9],
      [0.38, 0.63],
      [0.62, 0.37],
      [0.86, 0.12],
    ],
  ],
  // « des ronds »
  rond: [
    [
      [0.72, 0.32],
      [0.5, 0.16],
      [0.28, 0.32],
      [0.2, 0.52],
      [0.28, 0.74],
      [0.5, 0.88],
      [0.72, 0.74],
      [0.8, 0.52],
      [0.72, 0.32],
    ],
  ],
  // « des courbes »
  courbe: [
    [
      [0.06, 0.78],
      [0.28, 0.3],
      [0.5, 0.5],
      [0.72, 0.8],
      [0.94, 0.34],
    ],
  ],
  // « traçage des boucles vers le haut »
  'boucle-haut': [
    [
      [0.1, 0.88],
      [0.3, 0.5],
      [0.46, 0.12],
      [0.62, 0.34],
      [0.56, 0.7],
      [0.66, 0.88],
      [0.9, 0.8],
    ],
  ],
  // « traçage des boucles vers le bas »
  'boucle-bas': [
    [
      [0.1, 0.16],
      [0.34, 0.22],
      [0.5, 0.56],
      [0.6, 0.9],
      [0.44, 0.98],
      [0.34, 0.74],
      [0.9, 0.3],
    ],
  ],
  // Arches — the shape under m, n, and the first joined writing
  pont: [
    [
      [0.1, 0.88],
      [0.16, 0.42],
      [0.5, 0.2],
      [0.84, 0.42],
      [0.9, 0.88],
    ],
  ],
  // « traçage des boucles et enchaînement » — loop then bridge, joined
  enchainement: [
    [
      [0.04, 0.86],
      [0.2, 0.44],
      [0.34, 0.14],
      [0.46, 0.44],
      [0.42, 0.86],
      [0.6, 0.9],
      [0.68, 0.5],
      [0.84, 0.42],
      [0.96, 0.7],
    ],
  ],
};

/** How many times the unit is repeated across the ruled line. */
const REPEATS: Record<GraphismPattern, number> = {
  points: 5,
  'ligne-verticale': 4,
  'ligne-horizontale': 1,
  oblique: 4,
  rond: 3,
  courbe: 2,
  'boucle-haut': 3,
  'boucle-bas': 3,
  pont: 3,
  enchainement: 2,
};

/** Human-readable instruction fragment, used by content generation and a11y. */
export const PATTERN_LABELS: Record<GraphismPattern, string> = {
  points: 'les points',
  'ligne-verticale': 'les lignes debout',
  'ligne-horizontale': 'la ligne couchée',
  oblique: 'les lignes penchées',
  rond: 'les ronds',
  courbe: 'les courbes',
  'boucle-haut': 'les boucles vers le haut',
  'boucle-bas': 'les boucles vers le bas',
  pont: 'les ponts',
  enchainement: 'les boucles enchaînées',
};

/**
 * Tiles the unit across the row and returns strokes in normalized page
 * coordinates, left to right — the reading and writing direction taught by
 * the programme.
 */
export function strokesForPattern(pattern: GraphismPattern): readonly Stroke[] {
  const unit = UNIT_STROKES[pattern];
  const repeats = REPEATS[pattern];
  const cell = 1 / repeats;
  const out: Stroke[] = [];
  for (let index = 0; index < repeats; index += 1) {
    for (const stroke of unit) {
      out.push(stroke.map(([x, y]) => [index * cell + x * cell, y] as const));
    }
  }
  return out;
}
