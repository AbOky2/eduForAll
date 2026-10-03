/**
 * Illustrations de discipline — `SubjectArt` (brief identité v2, § 7).
 *
 * Quatre pictogrammes du palier M (grille 48 × 48), en mode couleur, qui
 * remplacent les carrés pastel et leurs icônes au trait fin partout où une
 * discipline apparaît : carte d'accueil, carte « Apprendre », onboarding
 * page 2, nœud courant de la carte. Le pictogramme EST la tuile : un disque
 * doux de sa famille (Ø 48, donc `size` = diamètre de la tuile) porte un
 * objet de la journée d'un écolier du Tchad.
 *
 * | Discipline | Famille      | Objet                                                    |
 * |------------|--------------|----------------------------------------------------------|
 * | Langage    | bleu pétrole | une grande bulle qui sourit, une petite bulle qui répond |
 * | Lecture    | sable / terre| un livre ouvert, le « a » imprimé, un signet terre cuite |
 * | Écriture   | or           | l'ardoise en cadre de bois, un « a » à la craie, un crayon |
 * | Calcul     | vert acacia  | le chiffre « 3 » et trois galets                         |
 *
 * Langage « Galets & craie » (§ 4) : lumière unique en haut à gauche, ombre
 * en croissant net en bas à droite, reflet signature (tiret blanc à bouts
 * ronds vers 10–11 h) sur les volumes, pastille-ombre sous ce qui est posé.
 * Les deux « a » se répondent : celui de Lecture est le « a » imprimé de
 * Quicksand (celui des leçons), celui d'Écriture est tracé à la main — le
 * seul geste fait main du système, la craie (§ 4.4) : forme pleine, épaisseur
 * modulée (plus épaisse en descendant), inclinée de 5°. Le « 3 » de Calcul
 * reprend la construction du « 3 » de Quicksand (barre plate, diagonale,
 * panse ouverte) pour que l'enfant retrouve le chiffre de ses leçons.
 *
 * `muted` (discipline verrouillée) : même dessin, tons `colors.locked` /
 * `colors.lockedContainer`, sans reflet ni ombre — toujours reconnaissable.
 *
 * Budget (§ 15) : au plus 6 chemins + le reflet, aucun dégradé, aucun masque.
 * Chaînes `d` précalculées (au plus une décimale, segments droits sur des
 * unités entières ou demi-entières), uniquement react-native-svg et les
 * jetons : le composant se rend hors appareil (planche
 * `scripts/design-sheets/disciplines.sheet.tsx`).
 */
import { memo } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { colors, illustration } from '../tokens';

export type SubjectArtId = 'language' | 'reading' | 'writing' | 'math';

export interface SubjectArtProps {
  subject: SubjectArtId;
  /** Diamètre de la tuile en dp (défaut 48). Lisible dès 32. */
  size?: number;
  /** Discipline verrouillée : même dessin, tons `locked`, sans reflet. */
  muted?: boolean;
}

const { white } = illustration;

/** Trait de 4 u (palier M), bouts et jointures ronds. */
const LINE = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

// ---------------------------------------------------------------------------
// Langage — bulle elliptique 32 × 24 centrée (20, 20), queue vers le bas à
// gauche ; petite bulle 14 × 11 en (34, 32) qui répond, queue vers la droite.
// ---------------------------------------------------------------------------
const LANGUAGE = {
  /** Bulle et sa queue (pointe arrondie r 2). */
  bubble: 'M4 20A16 12 0 1 1 36 20A16 12 0 1 1 4 20ZM12 28L17.5 31L12.8 34A2 2 0 0 1 10 31.2Z',
  /** Croissant d’ombre en bas à droite (de −33° à 101°, 1,8 u au plus épais). */
  shade: 'M33.5 13.6A16 12 0 0 1 17.1 31.8A17.2 13.2 0 0 0 33.5 13.6Z',
  /**
   * La bouche qui sourit : un seul arc de craie, trait 4 u. La bouche ouverte
   * (en D, langue rose) de la première version se lisait comme un visage qui
   * crie dès 48 dp ; un sourire dit « on se parle, gentiment ».
   */
  smile: 'M18 20.5Q23 26.5 28 20.5',
  /** Reflet : arc rentré de 6 u, de 9 h à 10 h 30. */
  sheen: 'M10.1 19.4A10 6 0 0 1 14.1 15.1',
  /** Réserve autour de la petite bulle (trait de 6 u couleur du disque). */
  replyGap: 'M27 32A7 5.5 0 1 1 41 32A7 5.5 0 1 1 27 32Z',
  /** Petite bulle qui répond. */
  reply:
    'M27 32A7 5.5 0 1 1 41 32A7 5.5 0 1 1 27 32ZM35.5 36L39.5 33.5L40.1 36.5A1.5 1.5 0 0 1 37.6 37.9Z',
} as const;

interface LanguageTones {
  disc: string;
  bubble: string;
  shade: string | null;
  mouth: string;
  reply: string;
  sheen: string | null;
}
const LANGUAGE_COLOR: LanguageTones = {
  disc: illustration.backdrop.sky,
  bubble: illustration.fabric.indigo.base,
  shade: illustration.fabric.indigo.shade,
  mouth: white,
  reply: illustration.fabric.indigo.light,
  sheen: white,
};
const LANGUAGE_MUTED: LanguageTones = {
  disc: colors.lockedContainer,
  bubble: colors.locked,
  shade: null,
  mouth: colors.lockedContainer,
  reply: colors.locked,
  sheen: null,
};

function LanguageArt({ tones: t }: { tones: LanguageTones }) {
  return (
    <>
      <Circle cx={24} cy={24} r={24} fill={t.disc} />
      <Path d={LANGUAGE.bubble} fill={t.bubble} />
      {t.shade ? <Path d={LANGUAGE.shade} fill={t.shade} /> : null}
      <Path {...LINE} d={LANGUAGE.smile} stroke={t.mouth} strokeWidth={4} />
      {t.sheen ? <Path {...LINE} d={LANGUAGE.sheen} stroke={t.sheen} strokeWidth={4} /> : null}
      <Path d={LANGUAGE.replyGap} fill={t.disc} stroke={t.disc} strokeWidth={6} />
      <Path d={LANGUAGE.reply} fill={t.reply} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Lecture — livre ouvert en paysage 40 × 32 (x 4 → 44, y 8 → 40) : pages en
// aile de mouette (le pli plonge de 2 u), couverture qui déborde de 2 u, « a »
// de Quicksand de 16 u sur la page de gauche, signet qui pend sous le livre.
// ---------------------------------------------------------------------------
const READING = {
  /** Pastille-ombre (30 × 4, 71 % de la largeur du livre). */
  ground: 'M11 40L37 40A2 2 0 0 1 39 42A2 2 0 0 1 37 44L11 44A2 2 0 0 1 9 42A2 2 0 0 1 11 40Z',
  /** Signet terre cuite, queue d’aronde aux coins arrondis. */
  ribbon: 'M27 37L32 37L32 41.9A1.5 1.5 0 0 1 29.6 43.1L29.5 43L29.4 43.1A1.5 1.5 0 0 1 27 41.9Z',
  /** Couverture. */
  cover:
    'M8.4 12.4L24 14L39.6 12.4A4 4 0 0 1 44 16.4L44 31.1A6 6 0 0 1 39.2 37L24.6 39.9A3 3 0 0 1 23.4 39.9L8.8 37A6 6 0 0 1 4 31.1L4 16.4A4 4 0 0 1 8.4 12.4Z',
  /** Page de gauche, tournée vers la lumière. */
  pageLeft: 'M12.7 8.7L24 10L24 36L7.8 34.2A2 2 0 0 1 6 32.2L6 14.7A6 6 0 0 1 12.7 8.7Z',
  /** Page de droite, un ton plus bas. */
  pageRight: 'M24 10L35.3 8.7A6 6 0 0 1 42 14.7L42 32.2A2 2 0 0 1 40.2 34.2L24 36Z',
  /** « a » : panse 11 × 12 (rapport 0,92 de Quicksand) + fût, trait 4. */
  glyph: 'M9.5 22A5.5 6 0 1 1 20.5 22A5.5 6 0 1 1 9.5 22ZM20.5 16V28',
} as const;

interface ReadingTones {
  disc: string;
  ground: string | null;
  ribbon: string;
  cover: string;
  pageLeft: string;
  pageRight: string;
  glyph: string;
}
const READING_COLOR: ReadingTones = {
  disc: illustration.backdrop.sand,
  ground: illustration.backdropMotif.sand,
  ribbon: illustration.school.clay.base,
  cover: illustration.nature.bark.base,
  pageLeft: illustration.school.paper.light,
  pageRight: illustration.school.paper.shade,
  glyph: illustration.nature.bark.shade,
};
const READING_MUTED: ReadingTones = {
  disc: colors.lockedContainer,
  ground: null,
  ribbon: colors.locked,
  cover: colors.locked,
  pageLeft: white,
  pageRight: white,
  glyph: colors.locked,
};

function ReadingArt({ tones: t }: { tones: ReadingTones }) {
  return (
    <>
      <Circle cx={24} cy={24} r={24} fill={t.disc} />
      {t.ground ? <Path d={READING.ground} fill={t.ground} /> : null}
      <Path d={READING.ribbon} fill={t.ribbon} />
      <Path d={READING.cover} fill={t.cover} />
      <Path d={READING.pageLeft} fill={t.pageLeft} />
      <Path d={READING.pageRight} fill={t.pageRight} />
      <Path {...LINE} d={READING.glyph} stroke={t.glyph} strokeWidth={4} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Écriture — ardoise en paysage 40 × 32 (cadre 4 u, rayons 6 / 2), ombre du
// bois en bas à droite ; « a » cursif à la craie ; crayon couché sur le
// rebord, pointe à gauche. La mine partage le chemin de l'ardoise et le bois
// taillé celui de la craie : 6 chemins.
// ---------------------------------------------------------------------------
const WRITING = {
  /** Cadre entier, dans son ton d’ombre. */
  frameShade:
    'M10 6L38 6A6 6 0 0 1 44 12L44 32A6 6 0 0 1 38 38L10 38A6 6 0 0 1 4 32L4 12A6 6 0 0 1 10 6Z',
  /** Face éclairée du cadre (l’ombre reste visible sur 2 u à droite et en bas). */
  frame:
    'M10 6L36 6A6 6 0 0 1 42 12L42 32A4 4 0 0 1 38 36L10 36A6 6 0 0 1 4 30L4 12A6 6 0 0 1 10 6Z',
  /** Ardoise 32 × 24, r 2 — et la mine du crayon. */
  slate:
    'M10 10L38 10A2 2 0 0 1 40 12L40 32A2 2 0 0 1 38 34L10 34A2 2 0 0 1 8 32L8 12A2 2 0 0 1 10 10ZM11 33.9L11 37.1L10.5 36.9A1.5 1.5 0 0 1 10.5 34.1Z',
  /** « a » à la craie (panse modulée, fût 3,6 → 4,4 u, délié 3 u, incliné de 5°) — et le bois taillé. */
  chalk:
    'M14.8 20.4A7.2 8 5 1 1 29.2 21.6A7.2 8 5 1 1 14.8 20.4ZM19.2 20.4A3.4 4.2 5 1 0 26 21A3.4 4.2 5 1 0 19.2 20.4ZM29.7 15.7L29.4 23.9C29.1 25.8 29.5 25.9 31.3 24.7A1.5 1.5 0 0 1 33.1 27.1C29.9 29.9 24.9 28.4 25 23.5L26.1 15.3A1.8 1.8 0 0 1 29.7 15.7ZM15.5 32V39L10.4 36.9V34.1Z',
  /** Corps du crayon. */
  pencil: 'M15 32L39.5 32A2.5 2.5 0 0 1 42 34.5L42 36.5A2.5 2.5 0 0 1 39.5 39L15 39Z',
  /** Facette d’ombre du crayon. */
  pencilShade: 'M15 35.5L42 35.5L42 36.5A2.5 2.5 0 0 1 39.5 39L15 39Z',
  /** Reflet du crayon. */
  sheen: 'M19 34H25',
  /** Verrouillé : le crayon entier (corps, bois, mine) d’un seul ton. */
  pencilSilhouette:
    'M10.1 34.1L15 32L39.5 32A2.5 2.5 0 0 1 42 34.5L42 36.5A2.5 2.5 0 0 1 39.5 39L15 39L10.1 36.9A1.5 1.5 0 0 1 10.1 34.1Z',
} as const;

interface WritingTones {
  disc: string;
  frameShade: string;
  frame: string;
  slate: string;
  chalk: string;
  pencil: string;
  pencilShade: string;
  sheen: string;
}
const WRITING_COLOR: WritingTones = {
  disc: illustration.backdrop.sun,
  frameShade: illustration.school.wood.shade,
  frame: illustration.school.wood.base,
  slate: illustration.school.slate.base,
  chalk: illustration.school.chalk,
  pencil: illustration.metal.gold.base,
  pencilShade: illustration.metal.gold.shade,
  sheen: white,
};

function WritingArt({ tones: t }: { tones: WritingTones }) {
  return (
    <>
      <Circle cx={24} cy={24} r={24} fill={t.disc} />
      <Path d={WRITING.frameShade} fill={t.frameShade} />
      <Path d={WRITING.frame} fill={t.frame} />
      <Path d={WRITING.slate} fill={t.slate} />
      <Path d={WRITING.chalk} fill={t.chalk} />
      <Path d={WRITING.pencil} fill={t.pencil} />
      <Path d={WRITING.pencilShade} fill={t.pencilShade} />
      <Path {...LINE} d={WRITING.sheen} stroke={t.sheen} strokeWidth={2} />
    </>
  );
}

/**
 * Verrouillé : cadre et ardoise d'un seul ton, séparés par un filet blanc ;
 * le crayon entier détouré de blanc. En deux tons, c'est la forme — pas la
 * couleur — qui doit dire « ardoise » et « crayon » (sinon le bois taillé,
 * seul tache claire sous l'ardoise, se lit comme la queue d'une bulle).
 */
function WritingMutedArt() {
  return (
    <>
      <Circle cx={24} cy={24} r={24} fill={colors.lockedContainer} />
      <Path d={WRITING.frameShade} fill={colors.locked} />
      <Path d={WRITING.slate} fill={colors.locked} stroke={white} strokeWidth={1.5} />
      <Path d={WRITING.chalk} fill={white} />
      <Path
        d={WRITING.pencilSilhouette}
        fill={white}
        stroke={white}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Path d={WRITING.pencilSilhouette} fill={colors.locked} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Calcul — le « 3 » de Quicksand (20 u de haut, trait 4) au-dessus de trois
// galets de tailles différentes (dôme dessus, dessous plus plat), écartés de
// 3 u, posés sur une pastille-ombre.
// ---------------------------------------------------------------------------
const MATH = {
  /** Pastille-ombre (28 × 3) sous la rangée. */
  ground:
    'M11.5 38.5L36.5 38.5A1.5 1.5 0 0 1 38 40A1.5 1.5 0 0 1 36.5 41.5L11.5 41.5A1.5 1.5 0 0 1 10 40A1.5 1.5 0 0 1 11.5 38.5Z',
  /** « 3 » : barre plate, diagonale, panse ouverte (r 4,7). */
  glyph: 'M19.5 8H28L21.9 14.8A4.7 4.7 0 1 1 20.2 22.5',
  /** Galets entiers, dans leur ton d’ombre. */
  pebbleShade:
    'M5.1 37.2A5.4 4.2 -8 0 1 15.7 35.6A5.4 2.9 -8 0 1 5.1 37.2ZM18.2 35.8A6.4 5 0 0 1 31 35.8A6.4 3.3 0 0 1 18.2 35.8ZM33.7 36.1A4.6 3.6 9 0 1 42.7 37.5A4.6 2.5 9 0 1 33.7 36.1Z',
  /** Faces éclairées : chaque galet réduit à 84 % vers son point haut-gauche (croissant exact). */
  pebble:
    'M5.2 36.6A4.5 3.5 -8 0 1 14.2 35.4A4.5 2.4 -8 0 1 5.2 36.6ZM18.5 35.2A5.4 4.2 0 0 1 29.3 35.2A5.4 2.8 0 0 1 18.5 35.2ZM33.9 35.7A3.9 3 9 0 1 41.6 36.9A3.9 2.1 9 0 1 33.9 35.7Z',
  /** Reflets des galets. */
  sheen:
    'M6.8 36.2A2.9 1.9 -8 0 1 8.8 34.3M20.1 34.9A3.8 2.6 0 0 1 23 32.7M35.6 35.8A2.3 1.4 9 0 1 37.4 34.9',
} as const;

interface MathTones {
  disc: string;
  ground: string | null;
  glyph: string;
  pebbleShade: string | null;
  pebble: string;
  sheen: string | null;
}
const MATH_COLOR: MathTones = {
  disc: illustration.backdrop.mint,
  ground: illustration.backdropMotif.mint,
  glyph: colors.feedbackCorrect,
  pebbleShade: illustration.nature.acacia.shade,
  pebble: illustration.nature.acacia.base,
  sheen: white,
};
const MATH_MUTED: MathTones = {
  disc: colors.lockedContainer,
  ground: null,
  glyph: colors.locked,
  pebbleShade: null,
  pebble: colors.locked,
  sheen: null,
};

function MathArt({ tones: t }: { tones: MathTones }) {
  return (
    <>
      <Circle cx={24} cy={24} r={24} fill={t.disc} />
      {t.ground ? <Path d={MATH.ground} fill={t.ground} /> : null}
      <Path {...LINE} d={MATH.glyph} stroke={t.glyph} strokeWidth={4} />
      {/* verrouillé : le galet entier suffit, d'un seul ton */}
      <Path d={MATH.pebbleShade} fill={t.pebbleShade ?? t.pebble} />
      {t.pebbleShade ? <Path d={MATH.pebble} fill={t.pebble} /> : null}
      {t.sheen ? <Path {...LINE} d={MATH.sheen} stroke={t.sheen} strokeWidth={1.6} /> : null}
    </>
  );
}

/**
 * Pictogramme d'une discipline. Décoratif : la carte qui le porte donne le
 * nom de la discipline aux lecteurs d'écran.
 */
export const SubjectArt = memo(function SubjectArt({
  subject,
  size = 48,
  muted = false,
}: SubjectArtProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {subject === 'language' ? (
        <LanguageArt tones={muted ? LANGUAGE_MUTED : LANGUAGE_COLOR} />
      ) : null}
      {subject === 'reading' ? <ReadingArt tones={muted ? READING_MUTED : READING_COLOR} /> : null}
      {subject === 'writing' ? (
        muted ? (
          <WritingMutedArt />
        ) : (
          <WritingArt tones={WRITING_COLOR} />
        )
      ) : null}
      {subject === 'math' ? <MathArt tones={muted ? MATH_MUTED : MATH_COLOR} /> : null}
    </Svg>
  );
});
