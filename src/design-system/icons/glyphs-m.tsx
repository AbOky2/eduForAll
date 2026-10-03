/**
 * Palier M — pictogrammes enfant sur la grille 48 (design/brief-identite-v2.md § 6.3).
 *
 * Tout ce qu'un enfant touche ou lit comme du sens, affiché de 32 à 96 dp.
 * Formes clés sur unités paires (cercle Ø40, carré 36 r 6, portrait 32 × 40,
 * paysage 40 × 32), trait de 4 u à bouts et jointures ronds, écarts et
 * contre-formes ≥ 4 u. Les chemins sont les lignes médianes du trait : le
 * bord extérieur tombe 2 u plus loin.
 *
 * Trois modes de rendu (§ 6.4), une seule silhouette :
 * - `mono`  : le trait, une couleur (`color`) — inactif, parent, désactivé ;
 * - `duo`   : silhouette remplie de la teinte de sa famille, trait et détails
 *             dans l'encre de la famille (paires vérifiées ≥ 4,5:1) ;
 * - `color` : trois tons par matière, lumière en haut à gauche (croissant
 *             d'ombre en bas à droite), et le reflet signature.
 *
 * Mode couleur : une matière soutenue (pétrole, terre cuite, vert) n'a pas
 * de contour — sa forme d'ombre, pleine, porte la silhouette, et un
 * exemplaire « base » réduit et poussé vers la lumière laisse voir le
 * croissant. Une matière claire (or, papier, safran) garde un contour de 4 u
 * dans son ton le plus foncé : sans lui, elle disparaît sur un fond clair
 * (§ 4.2).
 */
import type { ReactElement } from 'react';
import { Path } from 'react-native-svg';

import { colors, illustration } from '../tokens';
import type { IconName } from './glyphs-s';

export type IconMode = 'mono' | 'duo' | 'color';

/** Familles de couleur (§ 6.4) : teinte pleine et encre lisible dessus. */
const FAMILIES = {
  /** #5b3912 sur #f0bd8b : 6,06:1. */
  brown: { tint: colors.primaryFixedDim, ink: colors.onPrimaryContainer },
  /** #255f80 sur #a3d8fe : 4,56:1. */
  blue: { tint: colors.secondaryContainer, ink: colors.onSecondaryContainer },
  /** #533d00 sur #ffd166 : 7,16:1. */
  gold: { tint: illustration.nature.sun, ink: colors.onTertiaryContainer },
  /** #3e6837 sur #bff0b0 : 5,03:1. */
  green: { tint: colors.feedbackCorrectContainer, ink: colors.feedbackCorrect },
} as const;

type Family = keyof typeof FAMILIES;

/** Couleurs résolues au rendu : la couleur `mono`, la teinte et l'encre de la famille. */
const FG = '@fg';
const TINT = '@tint';
const INK = '@ink';

interface Paint {
  readonly fill?: string;
  readonly stroke?: string;
  /** Épaisseur du trait (défaut 4 u). */
  readonly w?: number;
}

/** Un chemin et sa peinture dans chaque mode (absent = non dessiné dans ce mode). */
interface MLayer {
  readonly d: string;
  readonly mono?: Paint;
  readonly duo?: Paint;
  readonly color?: Paint;
}

export interface MGlyph {
  readonly family: Family;
  readonly layers: readonly MLayer[];
}

const { white } = illustration;
const { clay, paper, wood } = illustration.school;
const { indigo, saffron, sky } = illustration.fabric;
const { gold } = illustration.metal;
const { bark, sprout: sproutGreen } = illustration.nature;

/** Trait de 4 u : `color` en mono, encre en duo, `stroke` en couleur. */
const line = (d: string, stroke: string): MLayer => ({
  d,
  mono: { stroke: FG },
  duo: { stroke: INK },
  color: { stroke },
});

/** Zone peinte en mode couleur seulement. */
const area = (d: string, fill: string, stroke?: string): MLayer => ({
  d,
  color: stroke === undefined ? { fill } : { fill, stroke },
});

/**
 * Silhouette d'une matière : contour en mono, teinte + encre en duo ; en
 * couleur, l'ombre pleine (et le contour `rim` d'une matière claire).
 */
const silhouette = (d: string, shade: string, rim?: string, solid = false): MLayer => ({
  d,
  mono: solid ? { fill: FG, stroke: FG } : { stroke: FG },
  duo: { fill: TINT, stroke: INK },
  color: { fill: shade, stroke: rim ?? shade },
});

/**
 * Exemplaire « base » : la silhouette réduite par homothétie autour d'un point
 * de son noyau, près du haut-gauche. Elle reste dans la silhouette et laisse
 * voir, en bas à droite, le croissant d'ombre.
 */
const base = (d: string, fill: string, rimmed = false): MLayer => ({
  d,
  color: rimmed ? { fill } : { fill, stroke: fill },
});

/** Le reflet signature : tiret blanc à bouts ronds, vers 10–11 h. */
const glint = (d: string, w = 4): MLayer => ({ d, color: { stroke: white, w } });

// — Géométrie (lignes médianes, grille 48) ————————————————————————————————

const HOUSE = 'M8 22L21 9Q24 6 27 9L40 22V36A4 4 0 0 1 36 40H12A4 4 0 0 1 8 36Z';
const HOUSE_BASE =
  'M8.7 21.6L19.4 11Q21.8 8.5 24.3 11L35 21.6V33.1A3.3 3.3 0 0 1 31.7 36.4H12A3.3 3.3 0 0 1 8.7 33.1Z';
const ROOF = 'M8 22L21 9Q24 6 27 9L40 22Z';
const ROOF_BASE = 'M9.6 21L20 10.6Q22.4 8.2 24.8 10.6L35.2 21Z';
const DOOR = 'M20 40V32A4 4 0 0 1 28 32V40';
const DOOR_FILL = 'M20 40V32A4 4 0 0 1 28 32V40Z';

/**
 * Sac d'écolier : dôme, petite anse, rabat et boucle. Pas de poche en arc au
 * pied du sac (on y lisait une porte, donc une case), pas de grande anse (un
 * cadenas).
 */
const BAG = 'M10 24A10 10 0 0 1 20 14H28A10 10 0 0 1 38 24V38A4 4 0 0 1 34 42H14A4 4 0 0 1 10 38Z';
const BAG_BASE =
  'M10.6 23.3A8.6 8.6 0 0 1 19.2 14.7H26A8.6 8.6 0 0 1 34.6 23.3V35.3A3.4 3.4 0 0 1 31.2 38.8H14A3.4 3.4 0 0 1 10.6 35.3Z';
const BAG_LOOP = 'M20 14V10A4 4 0 0 1 28 10V14';
const FLAP_EDGE = 'M10 27C15 30.5 19 31.5 24 31.5C29 31.5 33 30.5 38 27';
const FLAP_BASE =
  'M10.6 25.9C14.9 28.9 18.3 29.8 22.6 29.8C26.9 29.8 30.3 28.9 34.6 25.9V23.3A8.6 8.6 0 0 0 26 14.7H19.2A8.6 8.6 0 0 0 10.6 23.3Z';
const BUCKLE = 'M22 30H26V33H22Z';

const ADULT_HEAD = 'M40 12A6 6 0 1 1 28 12A6 6 0 1 1 40 12Z';
const ADULT_BODY = 'M26 38V34A8 8 0 0 1 42 34V38A4 4 0 0 1 38 42H30A4 4 0 0 1 26 38Z';
const ADULT_BODY_BASE =
  'M26.6 36.9V33.5A6.7 6.7 0 0 1 40.1 33.5V36.9A3.4 3.4 0 0 1 36.7 40.2H30A3.4 3.4 0 0 1 26.6 36.9Z';
const CHILD_HEAD = 'M16.5 19.5A4.5 4.5 0 1 1 7.5 19.5A4.5 4.5 0 1 1 16.5 19.5Z';
const CHILD_BODY = 'M6 40V38A6 6 0 0 1 18 38V40A2 2 0 0 1 16 42H8A2 2 0 0 1 6 40Z';
const CHILD_BODY_BASE =
  'M6.5 39.2V37.5A5 5 0 0 1 16.6 37.5V39.2A1.7 1.7 0 0 1 14.9 40.9H8.2A1.7 1.7 0 0 1 6.5 39.2Z';

const SPEAKER =
  'M8 18H13.4A1.6 1.6 0 0 0 14.5 17.6L22 10.8A1.2 1.2 0 0 1 24 11.7V36.3A1.2 1.2 0 0 1 22 37.2L14.5 30.4A1.6 1.6 0 0 0 13.4 30H8A2 2 0 0 1 6 28V20A2 2 0 0 1 8 18Z';
const SPEAKER_BASE =
  'M8.6 18.5H13.2A1.3 1.3 0 0 0 14.1 18.1L20.4 12.4A1 1 0 0 1 22.1 13.2V33.9A1 1 0 0 1 20.4 34.6L14.1 28.9A1.3 1.3 0 0 0 13.2 28.6H8.6A1.7 1.7 0 0 1 7 26.9V20.2A1.7 1.7 0 0 1 8.6 18.5Z';
const WAVES = 'M31.7 17.6A10 10 0 0 1 31.7 30.4M37.8 12.4A18 18 0 0 1 37.8 35.6';

const REPLAY_DISC = 'M37 26A13 13 0 1 1 11 26A13 13 0 1 1 37 26Z';
const REPLAY_DISC_BASE = 'M34.5 25.3A11.2 11.2 0 1 1 12.1 25.3A11.2 11.2 0 1 1 34.5 25.3Z';
const REPLAY_ARC = 'M24 11A15 15 0 1 1 10.4 19.7';
const REPLAY_HEAD =
  'M15.9 10.3L24.3 6.1A0.8 0.8 0 0 1 25.5 6.8V15.2A0.8 0.8 0 0 1 24.3 15.9L15.9 11.7A0.8 0.8 0 0 1 15.9 10.3Z';

const PLAY =
  'M14.8 14.3V33.7A3 3 0 0 0 19.3 36.3L35.8 26.6A3 3 0 0 0 35.8 21.4L19.3 11.7A3 3 0 0 0 14.8 14.3Z';
const PLAY_BASE =
  'M15.2 14.7V31A2.5 2.5 0 0 0 19 33.2L32.9 25.1A2.5 2.5 0 0 0 32.9 20.7L19 12.5A2.5 2.5 0 0 0 15.2 14.7Z';

const PILLS =
  'M11 14A4 4 0 0 1 19 14V34A4 4 0 0 1 11 34ZM29 14A4 4 0 0 1 37 14V34A4 4 0 0 1 29 34Z';
const PILLS_BASE =
  'M11.4 13.8A3.4 3.4 0 0 1 18.2 13.8V31A3.4 3.4 0 0 1 11.4 31ZM29.4 13.8A3.4 3.4 0 0 1 36.2 13.8V31A3.4 3.4 0 0 1 29.4 31Z';

const STAR =
  'M25.2 8.8L29.5 16.2A2.2 2.2 0 0 0 30.9 17.3L39.3 19A1.4 1.4 0 0 1 40.1 21.4L34.4 27.7A2.2 2.2 0 0 0 33.8 29.4L34.7 37.9A1.4 1.4 0 0 1 32.7 39.4L24.9 35.9A2.2 2.2 0 0 0 23.1 35.9L15.3 39.4A1.4 1.4 0 0 1 13.3 37.9L14.2 29.4A2.2 2.2 0 0 0 13.6 27.7L7.9 21.4A1.4 1.4 0 0 1 8.7 19L17.1 17.3A2.2 2.2 0 0 0 18.5 16.2L22.8 8.8A1.4 1.4 0 0 1 25.2 8.8Z';
const STAR_BASE =
  'M24.5 11.4L27.9 17.4A1.8 1.8 0 0 0 29 18.2L35.7 19.6A1.1 1.1 0 0 1 36.4 21.5L31.8 26.6A1.8 1.8 0 0 0 31.3 27.9L32.1 34.7A1.1 1.1 0 0 1 30.5 35.9L24.2 33.1A1.8 1.8 0 0 0 22.8 33.1L16.5 35.9A1.1 1.1 0 0 1 14.9 34.7L15.7 27.9A1.8 1.8 0 0 0 15.2 26.6L10.6 21.5A1.1 1.1 0 0 1 11.3 19.6L18 18.2A1.8 1.8 0 0 0 19.1 17.4L22.5 11.4A1.1 1.1 0 0 1 24.5 11.4Z';

const SUN_DISC = 'M33 24A9 9 0 1 1 15 24A9 9 0 1 1 33 24Z';
const SUN_DISC_BASE = 'M30.5 23.3A7.2 7.2 0 1 1 16.1 23.3A7.2 7.2 0 1 1 30.5 23.3Z';
const SUN_RAYS =
  'M41 24H43.5M36 36L37.8 37.8M24 41V43.5M12 36L10.2 37.8M7 24H4.5M12 12L10.2 10.2M24 7V4.5M36 12L37.8 10.2';

const MOUND = 'M8 42C8 37 14 34 24 34C34 34 40 37 40 42Z';
const MOUND_BASE = 'M9.4 41.2C9.4 37 14.5 34.5 22.9 34.5C31.3 34.5 36.3 37 36.3 41.2Z';
const STEM = 'M24 34V18';
/** Deux feuilles, la droite plus haute et plus grande : la pousse a déjà poussé d'un côté. */
const LEAVES =
  'M24 25C24 18.5 18 14 9.5 14C9.5 20.5 15.5 25 24 25ZM24 19C24 11.5 30.5 7 38.5 7C38.5 14.5 32 19 24 19Z';
const LEAVES_BASE =
  'M21.8 23.3C21.8 18.1 17 14.5 10.2 14.5C10.2 19.7 15 23.3 21.8 23.3ZM24.8 17.6C24.8 11.6 30 8 36.4 8C36.4 14 31.2 17.6 24.8 17.6Z';

const BULB = 'M19 26C19 23 14 21.5 14 16A10 10 0 0 1 34 16C34 21.5 29 23 29 26Z';
const BULB_BASE =
  'M19.2 23.8C19.2 21.2 15 20 15 15.4A8.4 8.4 0 0 1 31.8 15.4C31.8 20 27.6 21.2 27.6 23.8Z';
const BULB_CAP = 'M19 34H29M21 42H27';

const DISC = 'M42 24A18 18 0 1 1 6 24A18 18 0 1 1 42 24Z';
const DISC_BASE = 'M39.6 23.4A16.2 16.2 0 1 1 7.2 23.4A16.2 16.2 0 1 1 39.6 23.4Z';
const CHECK = 'M16 24L21.5 29.5L32 19';

const LOCK_BODY = 'M36 30A12 12 0 1 1 12 30A12 12 0 1 1 36 30Z';
const LOCK_BODY_BASE = 'M33.3 29.2A10.1 10.1 0 1 1 13.1 29.2A10.1 10.1 0 1 1 33.3 29.2Z';
const SHACKLE = 'M16 21V14A8 8 0 0 1 32 14V21';
const KEYHOLE = 'M27 30A3 3 0 1 1 21 30A3 3 0 1 1 27 30Z';

/**
 * Livre ouvert sans trait de reliure : le creux en V du haut et du bas dit la
 * reliure, et la page de gauche garde assez de place pour un « a » lisible.
 */
const BOOK =
  'M6 14C6 11.5 7.5 10.3 10 10C15.5 9.3 20.5 10.5 24 14C27.5 10.5 32.5 9.3 38 10C40.5 10.3 42 11.5 42 14V34C42 36 40.5 37 38.5 37C33 37 28 38 24 42C20 38 15 37 9.5 37C7.5 37 6 36 6 34Z';
const LEFT_PAGE =
  'M6 14C6 11.5 7.5 10.3 10 10C15.5 9.3 20.5 10.5 24 14V42C20 38 15 37 9.5 37C7.5 37 6 36 6 34Z';
/**
 * « a » scripte (panse et fût), 13 u de haut, sur la page de gauche. Pas de
 * lignes de texte à côté : « a » suivi de deux traits se lisait « a = ».
 */
const LETTER_A = 'M21.5 25.5A4.5 4.5 0 1 1 12.5 25.5A4.5 4.5 0 1 1 21.5 25.5ZM21.5 21V30';

export const M_GLYPHS: Partial<Readonly<Record<IconName, MGlyph>>> = {
  // Maison : murs de terre crue blanchis, toit de terre cuite, porte sombre.
  home: {
    family: 'brown',
    layers: [
      silhouette(HOUSE, paper.shade, wood.shade),
      base(HOUSE_BASE, paper.base, true),
      area(ROOF, clay.shade, clay.shade),
      area(ROOF_BASE, clay.base),
      area(DOOR_FILL, bark.shade),
      line(DOOR, bark.shade),
      { d: HOUSE, color: { stroke: wood.shade } },
      glint('M20.5 17.5L23.5 14.5', 3),
    ],
  },
  // Apprendre : le sac d'écolier pétrole, rabat clair, boucle safran.
  learn: {
    family: 'blue',
    layers: [
      line(BAG_LOOP, indigo.shade),
      silhouette(BAG, indigo.shade),
      base(BAG_BASE, indigo.base),
      area(FLAP_BASE, indigo.light),
      line(FLAP_EDGE, indigo.shade),
      {
        d: BUCKLE,
        mono: { fill: FG, stroke: FG },
        duo: { fill: INK, stroke: INK },
        color: { fill: saffron.base, stroke: saffron.shade },
      },
      glint('M14.1 23A6 6 0 0 1 19 18.1'),
    ],
  },
  // Un enfant (safran) et un adulte (pétrole) côte à côte.
  parents: {
    family: 'blue',
    layers: [
      silhouette(ADULT_BODY, indigo.shade),
      base(ADULT_BODY_BASE, indigo.base),
      silhouette(ADULT_HEAD, indigo.base),
      silhouette(CHILD_BODY, saffron.shade),
      base(CHILD_BODY_BASE, saffron.base),
      silhouette(CHILD_HEAD, saffron.base, saffron.shade),
      glint('M29.8 10.5A4.5 4.5 0 0 1 32.5 7.8', 3),
    ],
  },
  speaker: {
    family: 'blue',
    layers: [
      silhouette(SPEAKER, indigo.shade),
      base(SPEAKER_BASE, indigo.base),
      line('M14 18V30', indigo.shade),
      line(WAVES, indigo.light),
      glint('M17.5 22.5L20 20.3', 3),
    ],
  },
  // Réécouter : flèche circulaire autour d'un disque ciel (duo, couleur).
  replay: {
    family: 'blue',
    layers: [
      { d: REPLAY_DISC, duo: { fill: TINT }, color: { fill: sky.shade } },
      area(REPLAY_DISC_BASE, sky.base),
      line(REPLAY_ARC, indigo.base),
      {
        d: REPLAY_HEAD,
        mono: { fill: FG, stroke: FG },
        duo: { fill: INK, stroke: INK },
        color: { fill: indigo.base, stroke: indigo.base },
      },
      glint('M14.8 23.5A9.5 9.5 0 0 1 17.6 18.9'),
    ],
  },
  play: {
    family: 'brown',
    layers: [
      silhouette(PLAY, clay.shade, undefined, true),
      base(PLAY_BASE, clay.base),
      glint('M19 18.5L23 20.8'),
    ],
  },
  pause: {
    family: 'brown',
    layers: [
      silhouette(PILLS, clay.shade, undefined, true),
      base(PILLS_BASE, clay.base),
      glint('M14.5 15V19'),
    ],
  },
  // Étoile gagnée : pleine dans tous les modes.
  star: {
    family: 'gold',
    layers: [
      silhouette(STAR, gold.shade, gold.shade, true),
      base(STAR_BASE, gold.base, true),
      glint('M15 21.5L19.5 20.5'),
    ],
  },
  // Étoile à gagner : contour ; en duo et couleur, un or pâle qui attend.
  'star-outline': {
    family: 'gold',
    layers: [
      {
        d: STAR,
        mono: { stroke: FG },
        duo: { fill: gold.light, stroke: INK },
        color: { fill: gold.light, stroke: gold.shade },
      },
    ],
  },
  sun: {
    family: 'gold',
    layers: [
      silhouette(SUN_DISC, gold.shade, gold.shade),
      base(SUN_DISC_BASE, gold.base, true),
      line(SUN_RAYS, saffron.shade),
      glint('M19.6 23.2A4.5 4.5 0 0 1 23.2 19.6', 3),
    ],
  },
  sprout: {
    family: 'green',
    layers: [
      silhouette(MOUND, clay.shade),
      base(MOUND_BASE, clay.base),
      line(STEM, sproutGreen.shade),
      silhouette(LEAVES, sproutGreen.shade),
      base(LEAVES_BASE, sproutGreen.base),
      glint('M28.5 13L32 10.5', 3),
    ],
  },
  lightbulb: {
    family: 'gold',
    layers: [
      silhouette(BULB, gold.shade, gold.shade),
      base(BULB_BASE, gold.base, true),
      line(BULB_CAP, illustration.school.slate.light),
      glint('M18 17A6 6 0 0 1 21 12'),
    ],
  },
  // Réussi : coche dans un disque vert tendre.
  check: {
    family: 'green',
    layers: [
      silhouette(DISC, sproutGreen.shade),
      base(DISC_BASE, sproutGreen.base),
      { d: CHECK, mono: { stroke: FG }, duo: { stroke: INK }, color: { stroke: white } },
      glint('M10.5 20.4A14 14 0 0 1 16 12.5', 3),
    ],
  },
  // Cadenas rond de laiton, anse d'acier.
  lock: {
    family: 'gold',
    layers: [
      line(SHACKLE, illustration.school.slate.light),
      silhouette(LOCK_BODY, gold.shade, gold.shade),
      base(LOCK_BODY_BASE, gold.base, true),
      {
        d: KEYHOLE,
        mono: { fill: FG },
        duo: { fill: INK },
        color: { fill: colors.onTertiaryContainer },
      },
      glint('M16 27.5A8 8 0 0 1 20 22.3'),
    ],
  },
  // Lecture : livre ouvert, « a » sur la page de gauche.
  book: {
    family: 'brown',
    layers: [
      silhouette(BOOK, paper.shade, wood.shade),
      area(LEFT_PAGE, paper.base),
      { d: BOOK, color: { stroke: wood.shade } },
      line(LETTER_A, colors.onPrimaryContainer),
    ],
  },
};

const ROUND = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** Les calques d'un pictogramme M dans un mode donné. */
export function renderMGlyph(glyph: MGlyph, mode: IconMode, color: string): ReactElement[] {
  const family = FAMILIES[glyph.family];
  const resolve = (value: string): string =>
    value === FG ? color : value === TINT ? family.tint : value === INK ? family.ink : value;
  const elements: ReactElement[] = [];
  glyph.layers.forEach((layer, index) => {
    const paint = layer[mode];
    if (!paint) {
      return;
    }
    const fill = paint.fill === undefined ? 'none' : resolve(paint.fill);
    elements.push(
      paint.stroke === undefined ? (
        <Path key={index} d={layer.d} fill={fill} />
      ) : (
        <Path
          key={index}
          d={layer.d}
          fill={fill}
          stroke={resolve(paint.stroke)}
          strokeWidth={paint.w ?? 4}
          {...ROUND}
        />
      ),
    );
  });
  return elements;
}
