/**
 * Emblèmes de discipline v4 « Épure » (direction v4 § 6) — grille 48 × 48.
 *
 * Une famille : un disque plein dans la couleur de la discipline — le cercle,
 * géométrie de toute la v4 (vannerie, anneaux, médailles, portraits) —, un
 * symbole blanc et un second ton clair (la teinte de la discipline). Aucun
 * contour, aucun reflet, aucune ombre.
 *
 * | Discipline | Couleur          | Symbole                                         |
 * |------------|------------------|-------------------------------------------------|
 * | Langage    | lac Tchad        | deux bulles qui se répondent                    |
 * | Lecture    | terre cuite      | un livre ouvert, deux lignes de texte par page  |
 * | Écriture   | encre violette   | un crayon qui trace une boucle                  |
 * | Calcul     | bissap           | un escalier de cubes : un, deux, trois          |
 *
 * Variantes : `tile` (défaut) — la forme pleine et son symbole ; `glyph` — le
 * symbole seul, en blanc, pour une surface déjà colorée ; `muted` — fermé :
 * la forme en gris clair, le symbole en gris.
 */
import { memo } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { colors, subjectColors } from '../tokens';

export type SubjectArtId = 'language' | 'reading' | 'writing' | 'math';

export interface SubjectArtProps {
  subject: SubjectArtId;
  /** Côté de l'emblème en dp (défaut 48). Lisible dès 24. */
  size?: number;
  /** Discipline fermée : la forme en gris, le symbole en gris plus foncé. */
  muted?: boolean;
  /** `glyph` : le symbole seul, en blanc, sur une surface déjà colorée. */
  variant?: 'tile' | 'glyph';
}

interface Tones {
  /** Le symbole principal. */
  main: string;
  /** Le second ton du symbole. */
  second: string;
  /** Un détail posé sur le symbole principal (lignes, points). */
  accent: string;
}

/** Les symboles, centrés dans la grille 48, sur une zone de 30 × 30. */
function EmblemSymbol({ subject, tones }: { subject: SubjectArtId; tones: Tones }) {
  switch (subject) {
    case 'language':
      return (
        <>
          {/* La bulle qui répond, derrière, en haut à droite. */}
          <Path
            d="M23 11.5H35.5C37.4 11.5 39 13.1 39 15V23.5C39 25.4 37.4 27 35.5 27H35V30.5L31 27H23C21.1 27 19.5 25.4 19.5 23.5V15C19.5 13.1 21.1 11.5 23 11.5Z"
            fill={tones.second}
          />
          {/* La bulle qui parle, devant. */}
          <Path
            d="M12.5 18.5H28C30.2 18.5 32 20.3 32 22.5V32C32 34.2 30.2 36 28 36H18L13 40V36H12.5C10.3 36 8.5 34.2 8.5 32V22.5C8.5 20.3 10.3 18.5 12.5 18.5Z"
            fill={tones.main}
          />
          <Circle cx={14.6} cy={27.2} r={2} fill={tones.accent} />
          <Circle cx={20.2} cy={27.2} r={2} fill={tones.accent} />
          <Circle cx={25.8} cy={27.2} r={2} fill={tones.accent} />
        </>
      );
    case 'reading':
      return (
        <>
          {/* Deux pages qui s'ouvrent depuis le dos, au centre. */}
          <Path d="M24 15.5C20.5 13 15.5 12.2 10 12.8C9.1 12.9 8.5 13.6 8.5 14.5V33C8.5 34 9.4 34.8 10.4 34.6C15.4 33.9 20.3 34.6 24 37Z" fill={tones.main} />
          <Path d="M24 15.5C27.5 13 32.5 12.2 38 12.8C38.9 12.9 39.5 13.6 39.5 14.5V33C39.5 34 38.6 34.8 37.6 34.6C32.6 33.9 27.7 34.6 24 37Z" fill={tones.second} />
          <Path d="M12.5 19.5C15.4 19.3 18.2 19.8 20.5 21M12.5 25C15.4 24.8 18.2 25.3 20.5 26.5" stroke={tones.accent} strokeWidth={2.2} strokeLinecap="round" fill="none" />
          <Path d="M27.5 21C29.8 19.8 32.6 19.3 35.5 19.5M27.5 26.5C29.8 25.3 32.6 24.8 35.5 25" stroke={tones.accent} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        </>
      );
    case 'writing':
      return (
        <>
          {/* La boucle tracée, puis le crayon qui la finit. */}
          <Path d="M8.5 36.5C11.5 36.5 13 31.5 16 31.5C19 31.5 18 36.5 21 36.5C22.6 36.5 23.8 35.4 24.8 34" stroke={tones.second} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <G transform="rotate(45 30 21)">
            <Rect x={25} y={6} width={10} height={22} rx={2.5} fill={tones.main} />
            <Path d="M25 28H35L30 36Z" fill={tones.second} />
            <Rect x={25} y={9.5} width={10} height={2.6} fill={tones.accent} />
          </G>
        </>
      );
    case 'math':
      return (
        <>
          {/* Un, deux, trois : des cubes de 8 qui montent comme un escalier. */}
          <Rect x={9} y={29} width={8.5} height={8.5} rx={2.2} fill={tones.main} />
          <Rect x={19.75} y={29} width={8.5} height={8.5} rx={2.2} fill={tones.main} />
          <Rect x={19.75} y={19.25} width={8.5} height={8.5} rx={2.2} fill={tones.second} />
          <Rect x={30.5} y={29} width={8.5} height={8.5} rx={2.2} fill={tones.main} />
          <Rect x={30.5} y={19.25} width={8.5} height={8.5} rx={2.2} fill={tones.second} />
          <Rect x={30.5} y={9.5} width={8.5} height={8.5} rx={2.2} fill={tones.main} />
        </>
      );
  }
}

/**
 * L'emblème d'une discipline. Décoratif : la carte qui le porte donne le nom
 * de la discipline aux lecteurs d'écran.
 */
export const SubjectArt = memo(function SubjectArt({
  subject,
  size = 48,
  muted = false,
  variant = 'tile',
}: SubjectArtProps) {
  const family = subjectColors[subject];
  const tile = variant === 'tile';
  const tones: Tones = muted
    ? { main: colors.inkDisabled, second: colors.fillStrong, accent: colors.fill }
    : tile
      ? { main: colors.white, second: family.tintStrong, accent: family.solid }
      : { main: colors.white, second: colors.onColorSoft, accent: family.deep };
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {tile ? <Circle cx={24} cy={24} r={24} fill={muted ? colors.fill : family.solid} /> : null}
      <EmblemSymbol subject={subject} tones={tones} />
    </Svg>
  );
});
