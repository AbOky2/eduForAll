/**
 * Typographie v4 « Épure ».
 *
 * - **Ecolna Sans** porte toute l'interface : c'est Figtree (OFL) dont le
 *   « a » à un seul étage est figé par défaut (assets/fonts/FONTLOG-EcolnaSans.txt).
 *   Géométrique, chaleureuse, nette à toutes les graisses ; les titres sont
 *   serrés (approche négative), le texte courant garde son approche native.
 *   Ainsi l'enfant ne voit jamais deux formes de « a » : celle de l'école.
 * - **Andika** (SIL International) porte ce que l'enfant apprend à lire :
 *   lettres, syllabes, mots, nombres. Dessinée pour l'alphabétisation, elle a
 *   le « a » et le « g » à un seul étage de l'écriture scolaire, et des b, d,
 *   p, q qui ne sont pas des miroirs les uns des autres.
 *
 * Les tailles sont celles du téléphone ; `useTypography` les multiplie par
 * l'échelle de la fenêtre (×1,15 / ×1,3, plafonnée par la hauteur).
 */
export const fontFamilies = {
  regular: 'EcolnaSans-Regular',
  medium: 'EcolnaSans-Medium',
  semiBold: 'EcolnaSans-SemiBold',
  bold: 'EcolnaSans-Bold',
  extraBold: 'EcolnaSans-ExtraBold',
  /** Rétrocompatible : les étiquettes v3 (Plus Jakarta) passent à Ecolna Sans. */
  label: 'EcolnaSans-SemiBold',
  glyph: 'Andika-Bold',
  glyphRegular: 'Andika-Regular',
} as const;

export type TypographyVariant =
  | 'displayHero'
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
  | 'labelSm'
  | 'button'
  | 'buttonSm'
  | 'tag';

interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

export const typography: Record<TypographyVariant, TypographyStyle> = {
  /** La voix d'un écran : salutation, « Bravo ! ». */
  displayHero: { fontFamily: fontFamilies.extraBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.7 },
  /** Ce que l'enfant apprend à lire, en grand (« ba », « 12 + 5 »). */
  displayGlyph: { fontFamily: fontFamilies.glyph, fontSize: 64, lineHeight: 78 },
  displayGlyphSmall: { fontFamily: fontFamilies.glyph, fontSize: 36, lineHeight: 46 },

  headlineLg: { fontFamily: fontFamilies.extraBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.5 },
  headlineMd: { fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  headlineSm: { fontFamily: fontFamilies.bold, fontSize: 18, lineHeight: 24, letterSpacing: -0.15 },

  bodyLg: { fontFamily: fontFamilies.medium, fontSize: 17, lineHeight: 25 },
  bodyMd: { fontFamily: fontFamilies.medium, fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: fontFamilies.regular, fontSize: 13, lineHeight: 18 },

  labelLg: { fontFamily: fontFamilies.semiBold, fontSize: 16, lineHeight: 22 },
  labelMd: { fontFamily: fontFamilies.semiBold, fontSize: 14, lineHeight: 20 },
  labelSm: { fontFamily: fontFamilies.semiBold, fontSize: 12, lineHeight: 16, letterSpacing: 0.1 },

  button: { fontFamily: fontFamilies.bold, fontSize: 18, lineHeight: 24 },
  buttonSm: { fontFamily: fontFamilies.bold, fontSize: 15, lineHeight: 20 },
  /** Pastilles courtes, en capitales espacées (« NOUVEAU »). */
  tag: { fontFamily: fontFamilies.bold, fontSize: 11, lineHeight: 14, letterSpacing: 0.8 },
};
