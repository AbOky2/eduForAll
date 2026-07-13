/**
 * Typography tokens. Quicksand carries display/headline/body (including the
 * large pedagogical glyphs); Plus Jakarta Sans 600 carries labels (buttons,
 * nav, badges) — exactly as in the Stitch mockups.
 */
export const fontFamilies = {
  regular: 'Quicksand-Regular',
  medium: 'Quicksand-Medium',
  semiBold: 'Quicksand-SemiBold',
  bold: 'Quicksand-Bold',
  label: 'PlusJakartaSans-SemiBold',
} as const;

export type TypographyVariant =
  | 'displayGlyph'
  | 'displayGlyphSmall'
  | 'headlineLg'
  | 'headlineMd'
  | 'headlineSm'
  | 'bodyLg'
  | 'bodyMd'
  | 'bodySm'
  | 'labelLg'
  | 'labelMd'
  | 'labelSm';

interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

export const typography: Record<TypographyVariant, TypographyStyle> = {
  /** Huge letters/syllables/numbers the child learns from ("ba", "12 + 5"). */
  displayGlyph: { fontFamily: fontFamilies.bold, fontSize: 56, lineHeight: 64 },
  displayGlyphSmall: { fontFamily: fontFamilies.bold, fontSize: 34, lineHeight: 42 },

  headlineLg: { fontFamily: fontFamilies.bold, fontSize: 28, lineHeight: 36 },
  headlineMd: { fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 30 },
  headlineSm: { fontFamily: fontFamilies.semiBold, fontSize: 18, lineHeight: 26 },

  bodyLg: { fontFamily: fontFamilies.medium, fontSize: 17, lineHeight: 26 },
  bodyMd: { fontFamily: fontFamilies.medium, fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 18 },

  labelLg: { fontFamily: fontFamilies.label, fontSize: 16, lineHeight: 22, letterSpacing: 0.2 },
  labelMd: { fontFamily: fontFamilies.label, fontSize: 14, lineHeight: 20, letterSpacing: 0.2 },
  labelSm: { fontFamily: fontFamilies.label, fontSize: 12, lineHeight: 16, letterSpacing: 0.4 },
};
