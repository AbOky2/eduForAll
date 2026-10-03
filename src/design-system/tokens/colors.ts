/**
 * ECOLNA color tokens — extracted verbatim from the Stitch project, which is
 * still named « ALIFA : L'École du Désert » (design system "Premium
 * Sahelian") : c'est une citation d'un artefact externe, pas le nom de l'app.
 * Light mode only for V1. See docs/design-audit.md §1 and, for the v3
 * surfaces and the « galet » roles, design/direction-ecrans-v3.md.
 */
export const palette = {
  // Primary — earth brown / sand
  primary: '#7d562d',
  onPrimary: '#ffffff',
  primaryContainer: '#d4a373',
  onPrimaryContainer: '#5b3912',
  primaryFixed: '#ffdcbd',
  primaryFixedDim: '#f0bd8b',
  inversePrimary: '#f0bd8b',

  // Secondary — petrol blue / sky
  secondary: '#2b6485',
  onSecondary: '#ffffff',
  secondaryContainer: '#a3d8fe',
  onSecondaryContainer: '#255f80',
  secondaryFixed: '#c7e7ff',
  secondaryFixedDim: '#98cdf2',

  // Tertiary — gold
  tertiary: '#785a00',
  onTertiary: '#ffffff',
  tertiaryContainer: '#d1a741',
  onTertiaryContainer: '#533d00',
  tertiaryFixed: '#ffdf9b',
  tertiaryFixedDim: '#edc157',

  // Error — reserved for destructive parent actions, never for child feedback
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Surfaces — ivoire de cahier qui monte vers le sable (direction v3 § 3).
  // Le générateur Material de Stitch avait produit des neutres lavande, d'une
  // autre température que la palette terre : on les réchauffe, sans toucher
  // aux trois couleurs de marque.
  surface: '#fcf8f1',
  surfaceDim: '#e8dcc8',
  surfaceBright: '#fcf8f1',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f8f1e5',
  surfaceContainer: '#f2e8d7',
  surfaceContainerHigh: '#ebddc6',
  surfaceContainerHighest: '#e3d2b6',
  onSurface: '#161a32',
  onSurfaceVariant: '#50453b',
  inverseSurface: '#2b2e48',
  inverseOnSurface: '#fbf3e4',
  outline: '#82756a',
  outlineVariant: '#d4c4b7',
} as const;

/**
 * Semantic aliases used by primitives and screens. Screens must not reach
 * into `palette` directly — go through `colors`.
 */
export const colors = {
  ...palette,

  /** Warm ivory of the learning/exercise screens: calmer than the home. */
  exerciseBackground: '#f6efdf',
  /** Default app background (home, maps, onboarding). */
  background: palette.surface,
  onBackground: palette.onSurface,

  card: palette.surfaceContainerLowest,
  /** Tranche d'un galet blanc : l'épaisseur sous la face (direction v3 § 2). */
  cardEdge: '#eadcc6',
  textPrimary: palette.onSurface,
  textSecondary: palette.onSurfaceVariant,
  textOnBrand: palette.onPrimaryContainer,

  /**
   * Le « soleil » : l'action principale de l'enfant (Commencer, C'est parti,
   * Vérifier). Texte `onSun` à 7,4:1 sur la face.
   */
  sun: '#f6b73c',
  sunLight: '#ffd27a',
  sunShade: '#cf8b17',
  onSun: '#47290a',
  /** Tranche du galet pétrole (actions secondaires fortes, sélection). */
  secondaryShade: '#1d4a64',
  /** Tranche du galet terre (carte héros). */
  primaryShade: '#5b3912',
  /**
   * Dunes ton sur ton dans la carte héros terre (1,12 et 1,23:1 avec
   * `primary`) ; le texte blanc y garde 5:1, il peut passer dessus.
   */
  primaryDuneFar: '#845e37',
  primaryDuneNear: '#8a643d',
  /** Texte clair secondaire sur la carte héros terre (5:1 sur `primary`). */
  onPrimaryMuted: '#ffdcbd',

  /** Child feedback — never rely on color alone (icon + audio + shape too). */
  feedbackCorrect: '#3e6837',
  feedbackCorrectContainer: '#bff0b0',
  feedbackCorrectShade: '#8fcf7d',
  feedbackIncorrect: palette.secondary,
  feedbackIncorrectContainer: palette.secondaryFixed,

  starActive: '#f2c40d',
  starInactive: palette.outlineVariant,

  /** Verrouillé : un gris CHAUD (jamais lavande), lisible à 3:1 sur son contenant. */
  locked: '#8a7d6c',
  lockedContainer: '#eee6da',
  lockedEdge: '#dccfbd',

  /** Tranche des galets destructifs (espace parent seulement). */
  errorEdge: '#efb3ac',

  /** Reflet posé sur un remplissage plein (barre de progression, galet coloré). */
  highlight: 'rgba(255,255,255,0.4)',

  /** Voile derrière une feuille ou une boîte de dialogue. */
  scrim: 'rgba(44,30,16,0.42)',
} as const;

/**
 * Une famille de couleur par discipline (direction v3 § 4) — la même sur
 * l'accueil, la sélection de module, la carte, l'en-tête de leçon. `ink` est
 * le texte posé sur `face` (≥ 5,7:1), `edge` la tranche du galet, `deep` la
 * couleur pleine (barres de progression, nœud courant).
 */
export const subjectColors = {
  language: { face: '#d7ecfb', edge: '#a9cfea', deep: '#2b6485', ink: '#255f80' },
  reading: { face: '#fbe1cf', edge: '#edbe9c', deep: '#c96f3f', ink: '#7a3d1c' },
  writing: { face: '#fff0c2', edge: '#f0d17c', deep: '#d9a21b', ink: '#5c4300' },
  math: { face: '#ddf0d2', edge: '#b4d69f', deep: '#4a9440', ink: '#2f5a26' },
} as const;

export type ColorToken = keyof typeof colors;
