/**
 * ECOLNA — jetons de couleur v4 « Épure » (design/direction-v4-epure.md).
 *
 * Une toile claire, une encre profonde, une couleur par rôle :
 * - `reward` (soleil) : agir et récompenser — l'action principale de
 *   l'enfant, les étoiles, la série ; texte encre brune dessus (9,6:1) ;
 * - `brand` (bleu) : choisir — sélection, focus, liens, « on réessaie »
 *   (jamais de rouge pour l'enfant) ;
 * - `night` (nuit du Sahel) : les grands moments — carte du jour, célébration ;
 * - une teinte par discipline, aux noms du pays : lac Tchad, terre cuite,
 *   encre violette (celle de l'école), bissap ;
 * - `success` (vert) : réussir.
 * Rien d'autre n'est coloré : ni beige, ni brun d'interface, ni dégradé
 * hors des surfaces « nuit » et des disciplines, ni reflet.
 * Ratios WCAG notés sur blanc. Mode clair seulement en V1.
 */
export const palette = {
  // ── Neutres ────────────────────────────────────────────────────────────
  /** Toile des écrans de navigation : un gris très clair, à peine froid. */
  canvas: '#f6f7f9',
  /** Cartes, feuilles, page d'exercice. */
  white: '#ffffff',
  /** Pistes de progression, puits, puces neutres. */
  fill: '#eef0f3',
  fillStrong: '#e2e6ec',
  /** Filets : 1 dp sur une carte posée, 2 dp sur ce qui se touche. */
  border: '#e4e7ec',
  borderStrong: '#cdd3dd',
  /** Encres : 16:1 · 6,7:1 · 4:1 (métadonnées seulement) sur la toile. */
  ink: '#1b2130',
  inkSecondary: '#4f5869',
  inkTertiary: '#737b8c',
  inkDisabled: '#a3a9b5',

  // ── Rôles ──────────────────────────────────────────────────────────────
  /** Bleu ECOLNA — 5,8:1 avec le blanc. */
  brand: '#2f5bdb',
  brandPressed: '#2448b8',
  brandTint: '#eaeffc',
  brandTintStrong: '#d3ddfa',
  /** Texte sur `brandTint` (8,5:1). */
  brandInk: '#1f3a9e',
  /** La nuit du Sahel : la carte du jour, la célébration (blanc 14,6:1, soleil 8,4:1). */
  night: '#1c2554',
  nightSoft: '#28367a',

  /** Soleil : l'action principale et la récompense. Jamais un texte sur blanc. */
  reward: '#ffb81c',
  rewardPressed: '#f2a100',
  rewardDeep: '#d98e00',
  rewardTint: '#fff1cc',
  /** Texte sur `reward` (9,6:1). */
  onReward: '#2b1b00',
  /** L'ambre foncé : un texte ou un pictogramme « soleil » sur fond clair (5,6:1). */
  rewardInk: '#8a5a00',
  success: '#1f9d55',
  successTint: '#e3f5ea',
  /** Texte vert sur blanc (6,2:1) et sur `successTint` (5,4:1). */
  successInk: '#15703c',

  /** Réservé aux actions destructives de l'adulte, jamais à l'enfant. */
  danger: '#d92d20',
  dangerTint: '#fef3f2',
  dangerInk: '#b42318',
} as const;

/**
 * Rôles sémantiques. Les écrans passent par `colors`, jamais par `palette`.
 * Les anciens noms (v1–v3) restent, remappés sur la palette v4, le temps
 * que chaque écran passe à la nouvelle grammaire.
 */
export const colors = {
  ...palette,

  background: palette.canvas,
  onBackground: palette.ink,
  /** La page d'un exercice : blanche, la lettre y est seule. */
  exerciseBackground: palette.white,
  card: palette.white,
  cardEdge: palette.border,

  textPrimary: palette.ink,
  textSecondary: palette.inkSecondary,
  textTertiary: palette.inkTertiary,
  textOnBrand: palette.white,

  /** Sur une surface colorée : un blanc qui s'efface (second ton, piste). */
  onColorSoft: 'rgba(255,255,255,0.55)',
  onColorTrack: 'rgba(255,255,255,0.28)',
  /**
   * La craie du modèle sur l'ardoise : un voile clair posé sur `night`, rendu
   * opaque — deux traits qui se croisent (b, k, x, 4) ne doublent pas leur
   * voile. 3,3:1 sur la nuit (lisible au soleil, WCAG 1.4.11) et encore
   * 4,4:1 sous la craie blanche de l'enfant : ce qui est écrit reste
   * distinct de ce qui reste à écrire.
   */
  slateChalk: '#6f769b',
  /** Une surface de verre sur la nuit : bouton second, puce. */
  onColorGlass: 'rgba(255,255,255,0.12)',
  /** Texte second sur la nuit (7:1). */
  onNightSecondary: 'rgba(255,255,255,0.74)',
  /** Ombre : l'encre, très diluée — jamais un brun. */
  shadow: '#0e1526',
  /** Voile derrière une feuille ou une boîte de dialogue. */
  scrim: 'rgba(14,21,38,0.42)',

  // ── Rôles v1–v3, remappés ───────────────────────────────────────────────
  primary: palette.brand,
  onPrimary: palette.white,
  primaryContainer: palette.brandTintStrong,
  onPrimaryContainer: palette.brandInk,
  primaryFixed: palette.brandTint,
  primaryFixedDim: palette.brandTintStrong,
  inversePrimary: palette.brandTintStrong,
  primaryShade: palette.brandPressed,

  secondary: palette.brand,
  onSecondary: palette.white,
  secondaryContainer: palette.brandTintStrong,
  onSecondaryContainer: palette.brandInk,
  secondaryFixed: palette.brandTint,
  secondaryFixedDim: palette.brandTintStrong,
  secondaryShade: palette.brandPressed,

  tertiary: palette.rewardInk,
  onTertiary: palette.white,
  tertiaryContainer: palette.reward,
  onTertiaryContainer: palette.onReward,
  tertiaryFixed: palette.rewardTint,
  tertiaryFixedDim: palette.reward,

  sun: palette.reward,
  sunLight: palette.rewardTint,
  sunShade: palette.rewardPressed,
  onSun: palette.onReward,

  error: palette.danger,
  onError: palette.white,
  errorContainer: palette.dangerTint,
  onErrorContainer: palette.dangerInk,
  errorEdge: '#fecdca',

  surface: palette.canvas,
  surfaceDim: palette.fillStrong,
  surfaceBright: palette.white,
  surfaceContainerLowest: palette.white,
  surfaceContainerLow: '#f8f9fb',
  surfaceContainer: palette.fill,
  surfaceContainerHigh: palette.fillStrong,
  surfaceContainerHighest: '#d8dde6',
  onSurface: palette.ink,
  onSurfaceVariant: palette.inkSecondary,
  inverseSurface: '#1d2233',
  inverseOnSurface: palette.white,
  outline: palette.inkTertiary,
  outlineVariant: palette.borderStrong,

  /** La piste de toute progression (barre, anneau, segments) : visible sur blanc comme sur la toile. */
  track: palette.borderStrong,

  feedbackCorrect: palette.success,
  feedbackCorrectContainer: palette.successTint,
  feedbackCorrectShade: '#b7e9cc',
  feedbackIncorrect: palette.brand,
  feedbackIncorrectContainer: palette.brandTint,

  starActive: palette.reward,
  /** L'étoile à gagner : un contour, pas un aplat — la forme dit « pas encore », même au soleil. */
  starInactive: palette.inkDisabled,

  /** Fermé : l'icône en gris clair, le texte en encre secondaire. */
  locked: palette.inkDisabled,
  lockedContainer: palette.fill,
  lockedEdge: palette.border,

  highlight: 'rgba(255,255,255,0.35)',
} as const;

/**
 * Une teinte par discipline, la même partout (tuile, chemin, barre de la
 * leçon). `solid` : graphismes, icônes, barres (≥ 3:1 sur blanc) ; `deep` :
 * une surface qui porte du texte blanc (≥ 4,9:1) ; `tint` : un fond doux ;
 * `ink` : un texte coloré sur blanc ou sur `tint` (≥ 6:1). Les clés v3
 * (`face`, `edge`) restent en alias.
 */
const subject = (solid: string, deep: string, tint: string, tintStrong: string, ink: string) =>
  ({ solid, deep, tint, tintStrong, ink, face: tint, edge: tintStrong }) as const;

export const subjectColors = {
  /** Langage — le bleu-vert du lac Tchad : parler, écouter. */
  language: subject('#0f9aa8', '#0b7a86', '#e2f5f6', '#bfe7ea', '#075e67'),
  /** Lecture — la terre cuite : les lettres et les sons. */
  reading: subject('#e0592a', '#c2481f', '#fdede6', '#f9d3c3', '#9a3815'),
  /** Écriture — l'encre violette de l'école : tracer. */
  writing: subject('#7a5af5', '#5b3cd8', '#f0edff', '#ddd5ff', '#4f33c2'),
  /** Calcul — le bissap : compter. */
  math: subject('#c9407e', '#a8306a', '#fbe8f1', '#f5cbdf', '#8e2457'),
} as const;

export type SubjectKey = keyof typeof subjectColors;

/**
 * Les teintes des paires trouvées (relier) : chaque paire garde la sienne des
 * deux côtés, avec son numéro — la couleur n'est jamais le seul indice. Le
 * bleu de la marque en est exclu : c'est la couleur du choix en cours.
 */
export const pairTints = (['reading', 'writing', 'math', 'language'] as const).map((key) => ({
  face: subjectColors[key].tint,
  edge: subjectColors[key].tintStrong,
  border: subjectColors[key].solid,
  ink: subjectColors[key].ink,
}));

export type ColorToken = keyof typeof colors;
