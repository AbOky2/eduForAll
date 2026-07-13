/**
 * ALIFA color tokens — extracted verbatim from the Stitch project
 * « ALIFA : L'École du Désert » (design system "Premium Sahelian").
 * Light mode only for V1. See docs/design-audit.md §1.
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

  // Surfaces
  surface: '#fbf8ff',
  surfaceDim: '#d6d8f9',
  surfaceBright: '#fbf8ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f4f2ff',
  surfaceContainer: '#edecff',
  surfaceContainerHigh: '#e6e6ff',
  surfaceContainerHighest: '#dfe0ff',
  onSurface: '#161a32',
  onSurfaceVariant: '#50453b',
  inverseSurface: '#2b2e48',
  inverseOnSurface: '#f1efff',
  outline: '#82756a',
  outlineVariant: '#d4c4b7',
} as const;

/**
 * Semantic aliases used by primitives and screens. Screens must not reach
 * into `palette` directly — go through `colors`.
 */
export const colors = {
  ...palette,

  /** Warm ivory used on learning/exercise screens (noise-textured in Stitch). */
  exerciseBackground: '#F4F1DE',
  /** Default app background (home, maps, onboarding). */
  background: palette.surface,
  onBackground: palette.onSurface,
  /** Dots of the home-screen background pattern. */
  backgroundPatternDot: palette.outlineVariant,

  card: palette.surfaceContainerLowest,
  textPrimary: palette.onSurface,
  textSecondary: palette.onSurfaceVariant,
  textOnBrand: palette.onPrimaryContainer,

  /** Child feedback — never rely on color alone (icon + audio + shape too). */
  feedbackCorrect: '#3e6837',
  feedbackCorrectContainer: '#bff0b0',
  feedbackIncorrect: palette.secondary,
  feedbackIncorrectContainer: palette.secondaryFixed,

  starActive: '#f2c40d',
  starInactive: palette.outlineVariant,

  locked: '#b9b6c9',
  lockedContainer: '#efedf6',
} as const;

export type ColorToken = keyof typeof colors;
