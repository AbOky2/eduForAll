import { memo, type ReactElement } from 'react';
import Svg, { G, Path } from 'react-native-svg';

import { colors, illustration, type Ramp } from '../tokens';

/**
 * Les médailles ECOLNA — design/brief-identite-v2.md § 9 et § 14.4.
 *
 * Une seule famille. La médaille : rosette de douze festons dans le ton
 * `shade` du palier, face ronde en `base`, biseau `light` et reflet blanc en
 * haut à gauche (la lumière de toute l'app), pastille-ombre en pilule dessous.
 * Sur la face, UN objet qu'un enfant de six ans nomme tout de suite :
 * empreintes de pieds, chemin de pierres, cartable, cahiers, étoiles, dune,
 * livre, bulles, ardoise, couronne de cailloux, soleils, calebasse.
 *
 * Les paliers suivent le brief ; « Monde terminé », qu'il ne fixe pas, est
 * bleu ciel : le ciel au-dessus de la dune conquise.
 *
 * Les quatre jalons de leçons (1 / 5 / 20 / 50) portent en plus deux rubans
 * et 0 à 3 clous sur le bas de la rosette : le palier se lit à la forme, pas
 * seulement à la couleur (bronze → terre cuite → pétrole → or).
 *
 * Verrouillé ≠ caché : un badge non gagné garde sa silhouette entière, en
 * deux tons seulement (`colors.locked` pour la rosette et l'emblème,
 * `colors.lockedContainer` pour la face et les évidements qui gardent l'objet
 * lisible : la coche, le « a », les chiffres, les pierres), sans reflet, plus
 * la pastille cadenas du palier S. Un badge est un objectif, jamais une boîte
 * mystère.
 *
 * Choix d'atelier, vérifiés sur la planche (scripts/design-sheets/medailles.sheet.tsx) :
 * - Rubans en queue d'aronde arrondie (aucune pointe : coins r 2,5) plutôt
 *   qu'en languettes droites : à 48–96 px, des languettes arrondies sous un
 *   disque se lisent comme des pattes.
 * - Une matière claire posée sur une face claire (étoiles safran sur l'or,
 *   soleils sur le safran) garde un contour dans son propre ton foncé
 *   (§ 4.2). Les étoiles des médailles d'or sont safran : une étoile or pâle
 *   y serait l'étoile « à gagner » de l'app.
 * - Les soleils des médailles de régularité sont plus clairs que le ciel
 *   safran : c'est la chose la plus lumineuse du dessin.
 * - « Une semaine entière » : sept rayons épais, un par jour, plutôt que sept
 *   points au bout de rayons — un disque hérissé de tiges à boule est le
 *   pictogramme du virus que tous les parents connaissent.
 *
 * Grille 96 × 96, centre de la médaille (48, 44), emblème dans la boîte
 * 26–70 × 22–66 (les formes rondes débordent un peu, correction optique).
 * Tout est en chemins précalculés ; les deux états des quatorze badges sont
 * construits une seule fois, au chargement du module. N'importe que react,
 * react-native-svg et les jetons : la planche le rend hors appareil.
 */

export const BADGE_ART_IDS = [
  'first-lesson',
  'five-lessons',
  'twenty-lessons',
  'fifty-lessons',
  'first-perfect',
  'five-perfect',
  'first-world',
  'reader',
  'speaker',
  'writer',
  'counter',
  'streak-three',
  'streak-seven',
  'star-collector',
] as const;

/** Les quatorze `AchievementId` (src/features/achievements/domain/achievements.ts). */
export type BadgeArtId = (typeof BADGE_ART_IDS)[number];

/**
 * Ce que devient une forme sur un badge verrouillé : elle rejoint la
 * silhouette (`body`), devient un évidement couleur de face qui garde l'objet
 * lisible (`hole`), ou disparaît (`skip` : ombres et lumières, toujours
 * contenues dans leur forme, si bien que la silhouette ne change pas).
 */
type Lock = 'body' | 'hole' | 'skip';

interface Shape {
  readonly d: string;
  readonly fill?: string;
  /** Trait : bouts et jointures toujours ronds. */
  readonly stroke?: string;
  readonly width?: number;
  /** Épargne : la forme élargie de `cut` u, couleur de face, posée dessous pour la détacher d'une voisine. */
  readonly cut?: number;
  readonly lock: Lock;
}

interface Medal {
  /** Le palier : rosette `shade`, face `base`, biseau et clous `light`. */
  readonly ramp: Ramp;
  /** Jalons de leçons seulement. */
  readonly ribbons?: boolean;
  /** 5 / 20 / 50 leçons : un, deux, trois clous. */
  readonly notches?: 1 | 2 | 3;
  readonly emblem: readonly Shape[];
}

// ─── La médaille, commune aux quatorze ────────────────────────────────────

/** Douze festons r 12 centrés à 31 u, creux arrondis r 2,5 : pointes à 43 u, creux à 39,5 u. */
const ROSETTE = 'M39 5.1A12 12 0 0 1 57 5.1A2.5 2.5 0 0 0 59.7 5.8A12 12 0 0 1 75.3 14.8A2.5 2.5 0 0 0 77.2 16.7A12 12 0 0 1 86.2 32.3A2.5 2.5 0 0 0 86.9 35A12 12 0 0 1 86.9 53A2.5 2.5 0 0 0 86.2 55.7A12 12 0 0 1 77.2 71.3A2.5 2.5 0 0 0 75.3 73.2A12 12 0 0 1 59.7 82.2A2.5 2.5 0 0 0 57 82.9A12 12 0 0 1 39 82.9A2.5 2.5 0 0 0 36.3 82.2A12 12 0 0 1 20.7 73.2A2.5 2.5 0 0 0 18.8 71.3A12 12 0 0 1 9.8 55.7A2.5 2.5 0 0 0 9.1 53A12 12 0 0 1 9.1 35A2.5 2.5 0 0 0 9.8 32.3A12 12 0 0 1 18.8 16.7A2.5 2.5 0 0 0 20.7 14.8A12 12 0 0 1 36.3 5.8A2.5 2.5 0 0 0 39 5.1Z';
const FACE = 'M11 44a37 37 0 1 0 74 0a37 37 0 1 0 -74 0Z';
/** Biseau : arc de 2 u en `light`, collé au bord de la face côté lumière. */
const BEVEL = 'M13.2 53.3A36 36 0 0 1 57.3 9.2';
/** Le reflet signature : tiret blanc vers 10–11 h, rentré de 4 u. */
const REFLET = 'M18.8 32.2A31.5 31.5 0 0 1 35.2 15.2';
/** Pastille-ombre 56 × 6 : 65 % de la largeur de la médaille. */
const GROUND = 'M23 86H73A3 3 0 0 1 76 89A3 3 0 0 1 73 92H23A3 3 0 0 1 20 89A3 3 0 0 1 23 86Z';
/** Rubans 14 × 26, queue d'aronde arrondie, inclinés de 30° derrière la rosette. */
const RIBBON_LEFT = 'M26.9 64.5L39.1 71.5L28.2 90.3A2.2 2.2 0 0 1 24.3 90.1L22.9 87.2A1.5 1.5 0 0 0 21.4 86.3L18.2 86.6A2.2 2.2 0 0 1 16.1 83.3Z';
const RIBBON_RIGHT = 'M56.9 71.5L69.1 64.5L79.9 83.3A2.2 2.2 0 0 1 77.8 86.6L74.6 86.3A1.5 1.5 0 0 0 73.1 87.2L71.7 90.1A2.2 2.2 0 0 1 67.8 90.3Z';
/** Clous sur les festons du bas (6 h ; 5 h et 7 h ; 5, 6 et 7 h). */
const NOTCHES = ['', 'M45.6 84a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0Z', 'M65.6 78.6a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0ZM25.6 78.6a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0Z', 'M65.6 78.6a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0ZM45.6 84a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0ZM25.6 78.6a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0Z'] as const;

/** Pastille cadenas (24 u, en bas à droite) : le cadenas rond du palier S, agrandi de 15 % pour rester lisible en 1x. */
const PASTILLE = 'M65 74a11 11 0 1 0 22 0a11 11 0 1 0 -22 0Z';
const LOCK_SHACKLE = 'M72 73.5V68.8A4 4 0 0 1 80 68.8V73.5';
const LOCK_BODY = 'M69.1 76.9a6.9 6.9 0 1 0 13.8 0a6.9 6.9 0 1 0 -13.8 0Z';
const LOCK_KEYHOLE = 'M74.2 76.9a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0Z';

// ─── Les quatorze emblèmes ────────────────────────────────────────────────

const MEDALS: Record<BadgeArtId, Medal> = {
  'first-lesson': {
    ramp: illustration.metal.bronze,
    ribbons: true,
    emblem: [
      { d: 'M39 67.8C40.2 67.7 41.9 67.2 42.6 66.3C43.4 65.4 43.8 64 43.6 62.5C43.5 60.9 42.4 59 42 57.2C41.7 55.4 41.4 53.5 41.5 51.6C41.6 49.8 42.7 47.8 42.7 46.2C42.7 44.6 42.5 43.1 41.6 41.9C40.7 40.8 38.7 39.6 37.2 39.4C35.6 39.2 33.6 39.7 32.3 40.6C31 41.4 29.8 42.7 29.3 44.5C28.8 46.2 29 48.9 29.3 51.2C29.6 53.4 30.4 55.8 31 58C31.6 60.2 32.3 62.8 33 64.3C33.8 65.9 34.5 66.8 35.5 67.4C36.5 68 37.8 68 39 67.8ZM34.7 33.9a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0ZM30.3 33.1a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0ZM26.8 34.7a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0ZM24.4 37.6a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0ZM22.7 41.2a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z', fill: illustration.fabric.cream.shade, lock: 'body' }, // pied gauche : le pas d'avant
      { d: 'M57 57.8C55.8 57.7 54.1 57.2 53.4 56.3C52.6 55.4 52.2 54 52.4 52.5C52.5 50.9 53.6 49 54 47.2C54.3 45.4 54.6 43.5 54.5 41.6C54.4 39.8 53.3 37.8 53.3 36.2C53.3 34.6 53.5 33.1 54.4 31.9C55.3 30.8 57.3 29.6 58.8 29.4C60.4 29.2 62.4 29.7 63.7 30.6C65 31.4 66.2 32.7 66.7 34.5C67.2 36.2 67 38.9 66.7 41.2C66.4 43.4 65.6 45.8 65 48C64.4 50.2 63.7 52.8 63 54.3C62.2 55.9 61.5 56.8 60.5 57.4C59.5 58 58.2 58 57 57.8ZM54.1 23.9a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0ZM60.1 23.1a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0 -5.6 0ZM64.2 24.7a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0ZM67.2 27.6a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0ZM69.3 31.2a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z', fill: illustration.fabric.cream.base, lock: 'body' }, // pied droit : le pas suivant
    ],
  },
  'five-lessons': {
    ramp: illustration.fabric.terracotta,
    ribbons: true,
    notches: 1,
    emblem: [
      { d: 'M30.8 76.8C33.6 77 35.7 75.7 38 74.6C40.3 73.5 42.8 71.8 44.6 70.2C46.3 68.6 47.6 66.7 48.7 64.9C49.8 63.1 50.5 61.4 51.2 59.7C51.9 58.1 52.3 56.5 52.8 55C53.3 53.6 53.8 52.2 54.4 50.9C55 49.6 55.4 48.5 56.4 47.3C57.3 46.1 59.1 45 60 43.9C60.8 42.8 61.6 41.7 61.5 40.7C61.4 39.7 60.4 38.3 59.5 37.8C58.6 37.4 57.5 37.6 56 38.1C54.5 38.6 52.3 39.7 50.7 40.9C49 42 47.5 43.5 46.1 44.8C44.7 46.2 43.6 47.7 42.5 49.1C41.5 50.4 40.5 51.7 39.6 52.8C38.6 53.9 37.8 54.8 36.9 55.5C36.1 56.1 35.4 56.5 34.6 56.8C33.8 57.1 33.5 57.1 32.2 57.2C31 57.2 29.3 56.1 27.2 57.2C25.1 58.2 20.6 60.9 19.6 63.6C18.6 66.4 19.5 71.3 21.4 73.5C23.2 75.7 28 76.6 30.8 76.8Z', fill: illustration.fabric.sand.base, lock: 'body' }, // le chemin de sable, large à nos pieds, étroit au fanion
      { d: 'M58.5 21A1.5 1.5 0 0 1 60 22.5V39.5A1.5 1.5 0 0 1 58.5 41A1.5 1.5 0 0 1 57 39.5V22.5A1.5 1.5 0 0 1 58.5 21Z', fill: illustration.nature.bark.shade, lock: 'body' }, // hampe
      { d: 'M62.1 23.9A1.5 1.5 0 0 0 60 25.3L60 34.7A1.5 1.5 0 0 0 62.1 36.1L69.7 32.7A3 3 0 0 0 69.7 27.3Z', fill: illustration.metal.gold.base, lock: 'body' }, // fanion
      { d: 'M60 30L60 34.7A1.5 1.5 0 0 0 62.1 36.1L68.7 33.2A1.7 1.7 0 0 0 68 30Z', fill: illustration.metal.gold.shade, lock: 'skip' }, // fanion : ombre
      { d: 'M55.5 20.5a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z', fill: illustration.metal.gold.base, lock: 'body' }, // pommeau
      { d: 'M25.2 66.6a7 4.4 0 1 0 14 0a7 4.4 0 1 0 -14 0ZM36.8 60.1a6.1 3.9 0 1 0 12.2 0a6.1 3.9 0 1 0 -12.2 0ZM42.4 52a5.3 3.4 0 1 0 10.6 0a5.3 3.4 0 1 0 -10.6 0ZM47 46.1a4.6 3 0 1 0 9.2 0a4.6 3 0 1 0 -9.2 0ZM51.7 42.4a4 2.7 0 1 0 8 0a4 2.7 0 1 0 -8 0Z', fill: illustration.nature.bark.shade, lock: 'hole' }, // cinq pierres : ombre (évidées si verrouillé)
      { d: 'M25.4 66a6.2 3.6 0 1 0 12.4 0a6.2 3.6 0 1 0 -12.4 0ZM37 59.5a5.3 3.1 0 1 0 10.6 0a5.3 3.1 0 1 0 -10.6 0ZM42.6 51.4a4.5 2.6 0 1 0 9 0a4.5 2.6 0 1 0 -9 0ZM47.2 45.5a3.8 2.2 0 1 0 7.6 0a3.8 2.2 0 1 0 -7.6 0ZM51.9 41.8a3.2 1.9 0 1 0 6.4 0a3.2 1.9 0 1 0 -6.4 0Z', fill: illustration.nature.bark.base, lock: 'skip' }, // cinq pierres, de la plus proche à la plus lointaine
    ],
  },
  'twenty-lessons': {
    ramp: illustration.fabric.indigo,
    ribbons: true,
    notches: 2,
    emblem: [
      { d: 'M42 29V27.5A6 6 0 0 1 54 27.5V29', stroke: illustration.fabric.terracotta.shade, width: 4, lock: 'body' }, // poignée
      { d: 'M28 44A16 16 0 0 1 44 28H52A16 16 0 0 1 68 44V60A6 6 0 0 1 62 66H34A6 6 0 0 1 28 60Z', fill: illustration.fabric.terracotta.base, lock: 'body' }, // cartable : même silhouette que l'onglet « Apprendre »
      { d: 'M33.5 50H62.5A2.5 2.5 0 0 1 65 52.5A2.5 2.5 0 0 1 62.5 55H33.5A2.5 2.5 0 0 1 31 52.5A2.5 2.5 0 0 1 33.5 50Z', fill: illustration.fabric.terracotta.shade, lock: 'hole' }, // ombre du rabat (évidée si verrouillé : pas un cadenas)
      { d: 'M28 44A16 16 0 0 1 44 28H52A16 16 0 0 1 68 44V46A6 6 0 0 1 62 52H34A6 6 0 0 1 28 46Z', fill: illustration.fabric.terracotta.light, lock: 'body' }, // rabat
      { d: 'M46.5 44.9A1.7 1.7 0 0 1 49.5 44.9L50.8 47.4A1 1 0 0 0 51.5 47.9L54.3 48.4A1.7 1.7 0 0 1 55.2 51.3L53.3 53.3A1 1 0 0 0 53 54.1L53.4 56.8A1.7 1.7 0 0 1 50.9 58.6L48.4 57.4A1 1 0 0 0 47.6 57.4L45.1 58.6A1.7 1.7 0 0 1 42.6 56.8L43 54.1A1 1 0 0 0 42.7 53.3L40.8 51.3A1.7 1.7 0 0 1 41.7 48.4L44.5 47.9A1 1 0 0 0 45.2 47.4Z', fill: illustration.fabric.saffron.shade, stroke: illustration.fabric.saffron.shade, width: 2.2, lock: 'body' }, // boucle en étoile : contour et ombre
      { d: 'M46.3 45.3A1.5 1.5 0 0 1 48.9 45.3L50 47.5A0.7 0.7 0 0 0 50.6 47.9L53 48.3A1.5 1.5 0 0 1 53.8 50.8L52.1 52.5A0.7 0.7 0 0 0 51.9 53.2L52.2 55.6A1.5 1.5 0 0 1 50.1 57.1L47.9 56A0.7 0.7 0 0 0 47.3 56L45 57.1A1.5 1.5 0 0 1 42.9 55.6L43.3 53.2A0.7 0.7 0 0 0 43.1 52.5L41.4 50.8A1.5 1.5 0 0 1 42.2 48.3L44.6 47.9A0.7 0.7 0 0 0 45.1 47.5Z', fill: illustration.fabric.saffron.base, lock: 'hole' }, // boucle en étoile
    ],
  },
  'fifty-lessons': {
    ramp: illustration.metal.gold,
    ribbons: true,
    notches: 3,
    emblem: [
      { d: 'M29 56H67A3 3 0 0 1 70 59V63A3 3 0 0 1 67 66H29A3 3 0 0 1 26 63V59A3 3 0 0 1 29 56Z', fill: illustration.fabric.indigo.base, lock: 'body' }, // cahier du bas
      { d: 'M38 59H66A2 2 0 0 1 68 61A2 2 0 0 1 66 63H38A2 2 0 0 1 36 61A2 2 0 0 1 38 59Z', fill: illustration.school.paper.base, lock: 'hole' }, // ses pages
      { d: 'M33 47H65A3 3 0 0 1 68 50V53A3 3 0 0 1 65 56H33A3 3 0 0 1 30 53V50A3 3 0 0 1 33 47Z', fill: illustration.fabric.terracotta.base, lock: 'body' }, // cahier du milieu
      { d: 'M33.5 50.5H57.5A1.5 1.5 0 0 1 59 52A1.5 1.5 0 0 1 57.5 53.5H33.5A1.5 1.5 0 0 1 32 52A1.5 1.5 0 0 1 33.5 50.5Z', fill: illustration.school.paper.base, lock: 'hole' }, // ses pages
      { d: 'M31 39H60A3 3 0 0 1 63 42V44A3 3 0 0 1 60 47H31A3 3 0 0 1 28 44V42A3 3 0 0 1 31 39Z', fill: illustration.nature.acacia.base, lock: 'body' }, // cahier du haut
      { d: 'M37.5 42H59.5A1.5 1.5 0 0 1 61 43.5A1.5 1.5 0 0 1 59.5 45H37.5A1.5 1.5 0 0 1 36 43.5A1.5 1.5 0 0 1 37.5 42Z', fill: illustration.school.paper.base, lock: 'hole' }, // ses pages
      { d: 'M42.6 17.8A2.3 2.3 0 0 1 46.7 17.2L48.9 20.3A1.4 1.4 0 0 0 50 20.8L53.7 20.9A2.3 2.3 0 0 1 55.5 24.7L53.3 27.7A1.4 1.4 0 0 0 53.1 28.9L54.1 32.5A2.3 2.3 0 0 1 51.2 35.3L47.6 34.2A1.4 1.4 0 0 0 46.4 34.3L43.3 36.4A2.3 2.3 0 0 1 39.7 34.5L39.7 30.7A1.4 1.4 0 0 0 39.2 29.7L36.2 27.4A2.3 2.3 0 0 1 36.9 23.3L40.5 22.2A1.4 1.4 0 0 0 41.3 21.3Z', fill: illustration.fabric.saffron.shade, stroke: illustration.fabric.saffron.shade, width: 2.7, lock: 'body' }, // étoile : contour et ombre
      { d: 'M42.5 18.3A2 2 0 0 1 46.1 17.8L48 20.5A1 1 0 0 0 48.8 20.9L52.2 21A2 2 0 0 1 53.8 24.2L51.8 26.9A1 1 0 0 0 51.6 27.8L52.6 31A2 2 0 0 1 50 33.5L46.8 32.5A1 1 0 0 0 45.9 32.6L43.1 34.5A2 2 0 0 1 40 32.8L40 29.4A1 1 0 0 0 39.6 28.6L36.9 26.6A2 2 0 0 1 37.6 23L40.8 22A1 1 0 0 0 41.4 21.4Z', fill: illustration.fabric.saffron.base, lock: 'body' }, // étoile
    ],
  },
  'first-perfect': {
    ramp: illustration.metal.gold,
    emblem: [
      { d: 'M43.7 25.6A4.9 4.9 0 0 1 52.3 25.6L56 32.1A2.7 2.7 0 0 0 57.8 33.4L65.1 34.9A4.9 4.9 0 0 1 67.8 43.1L62.7 48.6A2.7 2.7 0 0 0 62 50.7L62.9 58.2A4.9 4.9 0 0 1 55.9 63.2L49.1 60.1A2.7 2.7 0 0 0 46.9 60.1L40.1 63.2A4.9 4.9 0 0 1 33.1 58.2L34 50.7A2.7 2.7 0 0 0 33.3 48.6L28.2 43.1A4.9 4.9 0 0 1 30.9 34.9L38.2 33.4A2.7 2.7 0 0 0 40 32.1Z', fill: illustration.fabric.saffron.shade, stroke: illustration.fabric.saffron.shade, width: 3.2, lock: 'body' }, // étoile : contour et ombre
      { d: 'M43.4 26.4A4.1 4.1 0 0 1 50.5 26.4L53.9 32.4A2 2 0 0 0 55.3 33.4L62.2 34.8A4.1 4.1 0 0 1 64.4 41.6L59.6 46.8A2 2 0 0 0 59.1 48.4L59.9 55.3A4.1 4.1 0 0 1 54.2 59.5L47.8 56.6A2 2 0 0 0 46.1 56.6L39.7 59.5A4.1 4.1 0 0 1 34 55.3L34.8 48.4A2 2 0 0 0 34.3 46.8L29.5 41.6A4.1 4.1 0 0 1 31.7 34.8L38.6 33.4A2 2 0 0 0 40 32.4Z', fill: illustration.fabric.saffron.base, lock: 'body' }, // étoile
      { d: 'M35.6 47.1L42.2 54.9A3 3 0 1 0 46.6 50.8L39.2 43.7A2.5 2.5 0 0 0 35.6 47.1ZM46.7 55L61.1 39A2.2 2.2 0 0 0 58 35.9L42.4 50.8A3 3 0 1 0 46.7 55Z', fill: illustration.school.chalk, lock: 'hole' }, // coche de craie : plus épaisse en descendant
    ],
  },
  'five-perfect': {
    ramp: illustration.metal.gold,
    emblem: [
      { d: 'M20.6 51.7A1.6 1.6 0 0 1 23.2 50.6L25.1 52.1A1 1 0 0 0 25.9 52.3L28.3 51.7A1.6 1.6 0 0 1 30.2 53.7L29.3 56A1 1 0 0 0 29.4 56.9L30.7 59A1.6 1.6 0 0 1 29.3 61.4L26.9 61.3A1 1 0 0 0 26.1 61.7L24.5 63.5A1.6 1.6 0 0 1 21.8 63L21.2 60.6A1 1 0 0 0 20.6 59.9L18.3 59A1.6 1.6 0 0 1 18 56.3L20 54.9A1 1 0 0 0 20.5 54.2Z', fill: illustration.fabric.saffron.shade, stroke: illustration.fabric.saffron.shade, width: 2, cut: 2.5, lock: 'body' }, // étoile 1 : contour et ombre
      { d: 'M20.8 51.9A1.3 1.3 0 0 1 22.9 51L24.6 52.3A0.7 0.7 0 0 0 25.2 52.5L27.4 51.9A1.3 1.3 0 0 1 28.9 53.6L28.1 55.7A0.7 0.7 0 0 0 28.2 56.3L29.4 58.2A1.3 1.3 0 0 1 28.2 60.1L26 60A0.7 0.7 0 0 0 25.5 60.3L24.1 62A1.3 1.3 0 0 1 21.8 61.5L21.2 59.4A0.7 0.7 0 0 0 20.8 58.9L18.8 58.1A1.3 1.3 0 0 1 18.5 55.9L20.4 54.6A0.7 0.7 0 0 0 20.7 54.1Z', fill: illustration.fabric.saffron.base, lock: 'body' }, // étoile 1
      { d: 'M72.8 50.6A1.6 1.6 0 0 1 75.4 51.7L75.5 54.2A1 1 0 0 0 76 54.9L78 56.3A1.6 1.6 0 0 1 77.7 59L75.4 59.9A1 1 0 0 0 74.8 60.6L74.2 63A1.6 1.6 0 0 1 71.5 63.5L69.9 61.7A1 1 0 0 0 69.1 61.3L66.7 61.4A1.6 1.6 0 0 1 65.3 59L66.6 56.9A1 1 0 0 0 66.7 56L65.8 53.7A1.6 1.6 0 0 1 67.7 51.7L70.1 52.3A1 1 0 0 0 70.9 52.1Z', fill: illustration.fabric.saffron.shade, stroke: illustration.fabric.saffron.shade, width: 2, cut: 2.5, lock: 'body' }, // étoile 2 : contour et ombre
      { d: 'M72.3 51A1.3 1.3 0 0 1 74.3 51.9L74.5 54.1A0.7 0.7 0 0 0 74.8 54.6L76.6 55.9A1.3 1.3 0 0 1 76.4 58.1L74.3 58.9A0.7 0.7 0 0 0 73.9 59.4L73.3 61.5A1.3 1.3 0 0 1 71.1 62L69.7 60.3A0.7 0.7 0 0 0 69.1 60L66.9 60.1A1.3 1.3 0 0 1 65.8 58.2L67 56.3A0.7 0.7 0 0 0 67 55.7L66.3 53.6A1.3 1.3 0 0 1 67.8 51.9L69.9 52.5A0.7 0.7 0 0 0 70.5 52.3Z', fill: illustration.fabric.saffron.base, lock: 'body' }, // étoile 2
      { d: 'M28.1 36.9A2 2 0 0 1 31.5 36.1L33.6 38.6A1.2 1.2 0 0 0 34.5 39L37.7 38.9A2 2 0 0 1 39.5 41.9L37.7 44.6A1.2 1.2 0 0 0 37.6 45.7L38.7 48.7A2 2 0 0 1 36.4 51.3L33.3 50.5A1.2 1.2 0 0 0 32.3 50.7L29.8 52.7A2 2 0 0 1 26.6 51.2L26.4 48.1A1.2 1.2 0 0 0 25.9 47.2L23.2 45.4A2 2 0 0 1 23.6 41.9L26.5 40.7A1.2 1.2 0 0 0 27.2 40Z', fill: illustration.fabric.saffron.shade, stroke: illustration.fabric.saffron.shade, width: 2.3, cut: 2.5, lock: 'body' }, // étoile 3 : contour et ombre
      { d: 'M28.1 37.2A1.7 1.7 0 0 1 31.1 36.6L32.9 38.8A0.9 0.9 0 0 0 33.6 39.1L36.4 39A1.7 1.7 0 0 1 38 41.6L36.5 44.1A0.9 0.9 0 0 0 36.4 44.8L37.4 47.5A1.7 1.7 0 0 1 35.3 49.8L32.5 49.1A0.9 0.9 0 0 0 31.8 49.2L29.6 51A1.7 1.7 0 0 1 26.8 49.7L26.6 46.9A0.9 0.9 0 0 0 26.2 46.2L23.8 44.6A1.7 1.7 0 0 1 24.1 41.6L26.8 40.5A0.9 0.9 0 0 0 27.3 40Z', fill: illustration.fabric.saffron.base, lock: 'body' }, // étoile 3
      { d: 'M64.5 36.1A2 2 0 0 1 67.9 36.9L68.8 40A1.2 1.2 0 0 0 69.5 40.7L72.4 41.9A2 2 0 0 1 72.8 45.4L70.1 47.2A1.2 1.2 0 0 0 69.6 48.1L69.4 51.2A2 2 0 0 1 66.2 52.7L63.7 50.7A1.2 1.2 0 0 0 62.7 50.5L59.6 51.3A2 2 0 0 1 57.3 48.7L58.4 45.7A1.2 1.2 0 0 0 58.3 44.6L56.5 41.9A2 2 0 0 1 58.3 38.9L61.5 39A1.2 1.2 0 0 0 62.4 38.6Z', fill: illustration.fabric.saffron.shade, stroke: illustration.fabric.saffron.shade, width: 2.3, cut: 2.5, lock: 'body' }, // étoile 4 : contour et ombre
      { d: 'M64 36.6A1.7 1.7 0 0 1 67 37.2L67.8 40A0.9 0.9 0 0 0 68.3 40.5L71 41.6A1.7 1.7 0 0 1 71.3 44.6L68.9 46.2A0.9 0.9 0 0 0 68.5 46.9L68.3 49.7A1.7 1.7 0 0 1 65.5 51L63.3 49.2A0.9 0.9 0 0 0 62.6 49.1L59.8 49.8A1.7 1.7 0 0 1 57.7 47.5L58.7 44.8A0.9 0.9 0 0 0 58.6 44.1L57.1 41.6A1.7 1.7 0 0 1 58.7 39L61.5 39.1A0.9 0.9 0 0 0 62.2 38.8Z', fill: illustration.fabric.saffron.base, lock: 'body' }, // étoile 4
      { d: 'M45.6 26.6A2.8 2.8 0 0 1 50.4 26.6L52.5 30.6A1.6 1.6 0 0 0 53.7 31.4L58.1 32.2A2.8 2.8 0 0 1 59.6 36.8L56.5 40A1.6 1.6 0 0 0 56 41.3L56.7 45.8A2.8 2.8 0 0 1 52.7 48.6L48.7 46.7A1.6 1.6 0 0 0 47.3 46.7L43.3 48.6A2.8 2.8 0 0 1 39.3 45.8L40 41.3A1.6 1.6 0 0 0 39.5 40L36.4 36.8A2.8 2.8 0 0 1 37.9 32.2L42.3 31.4A1.6 1.6 0 0 0 43.5 30.6Z', fill: illustration.fabric.saffron.shade, stroke: illustration.fabric.saffron.shade, width: 3.2, cut: 2.5, lock: 'body' }, // étoile 5 : contour et ombre
      { d: 'M45.2 27.2A2.4 2.4 0 0 1 49.5 27.2L51.4 30.7A1.2 1.2 0 0 0 52.2 31.4L56.1 32A2.4 2.4 0 0 1 57.4 36.1L54.7 38.9A1.2 1.2 0 0 0 54.3 40L54.9 43.9A2.4 2.4 0 0 1 51.5 46.4L47.9 44.6A1.2 1.2 0 0 0 46.8 44.6L43.3 46.4A2.4 2.4 0 0 1 39.8 43.9L40.4 40A1.2 1.2 0 0 0 40.1 38.9L37.3 36.1A2.4 2.4 0 0 1 38.6 32L42.5 31.4A1.2 1.2 0 0 0 43.4 30.7Z', fill: illustration.fabric.saffron.base, lock: 'body' }, // étoile 5
    ],
  },
  'first-world': {
    ramp: illustration.fabric.sky,
    emblem: [
      { d: 'M53.5 20A1.5 1.5 0 0 1 55 21.5V44.5A1.5 1.5 0 0 1 53.5 46A1.5 1.5 0 0 1 52 44.5V21.5A1.5 1.5 0 0 1 53.5 20Z', fill: illustration.nature.bark.shade, lock: 'body' }, // hampe
      { d: 'M57.1 22.9A1.5 1.5 0 0 0 55 24.3L55 34.7A1.5 1.5 0 0 0 57.1 36.1L65.8 32.2A3 3 0 0 0 65.8 26.8Z', fill: illustration.fabric.terracotta.base, lock: 'body' }, // fanion
      { d: 'M55 29.5L55 34.7A1.5 1.5 0 0 0 57.1 36.1L64.2 32.9A1.8 1.8 0 0 0 63.5 29.5Z', fill: illustration.fabric.terracotta.shade, lock: 'skip' }, // fanion : ombre
      { d: 'M50.5 19.5a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z', fill: illustration.metal.gold.base, lock: 'body' }, // pommeau
      { d: 'M15.8 63C26 59 39 46 51 43.6C55 42.8 57.5 43.6 60 46.4L81.8 60A37.4 37.4 0 0 1 15.8 63Z', fill: illustration.school.clay.base, lock: 'body' }, // la dune : long versant au vent, jusqu'au bord de la face
      { d: 'M51 43.6C55 42.8 57.5 43.6 60 46.4L81.8 60A37.4 37.4 0 0 1 67.4 76C64 62 58 50 51 43.6Z', fill: illustration.school.clay.shade, lock: 'skip' }, // le versant sous le vent, à l'ombre
    ],
  },
  reader: {
    ramp: illustration.nature.bark,
    emblem: [
      { d: 'M32.1 37.6L27.2 35.3M38.6 30.2L35.6 25.6M48 27.5L48 22M57.4 30.2L60.4 25.6M63.9 37.6L68.8 35.3', stroke: illustration.metal.gold.base, width: 4, lock: 'body' }, // rayons
      { d: 'M34 45a14 14 0 1 0 28 0a14 14 0 1 0 -28 0Z', fill: illustration.metal.gold.base, lock: 'body' }, // soleil levant
      { d: 'M48 50C40 46 32 45.5 24 47.5V65C32 63 40 63.5 48 67C56 63.5 64 63 72 65V47.5C64 45.5 56 46 48 50Z', fill: illustration.fabric.indigo.base, lock: 'body' }, // couverture
      { d: 'M47 48.5C40 44.5 33 44 26 45.5V62C33 60.5 40 61 47 64.5Z', fill: illustration.school.paper.base, lock: 'hole' }, // page de gauche
      { d: 'M49 48.5C56 44.5 63 44 70 45.5V62C63 60.5 56 61 49 64.5Z', fill: illustration.school.paper.shade, lock: 'hole' }, // page de droite, à l'ombre
    ],
  },
  speaker: {
    ramp: illustration.fabric.indigo,
    emblem: [
      { d: 'M35 22H49A11 11 0 0 1 60 33V37A11 11 0 0 1 49 48H35A11 11 0 0 1 24 37V33A11 11 0 0 1 35 22ZM28.8 43.9A1 1 0 0 1 29.9 43.2L37.5 44.5A1 1 0 0 1 37.9 46.4L30.8 50.9A2.2 2.2 0 0 1 27.5 48.5Z', fill: illustration.fabric.cream.base, lock: 'body' }, // grande bulle
      { d: 'M34 33C37.5 38.5 45.5 38.5 49 33', stroke: illustration.fabric.indigo.shade, width: 4, lock: 'hole' }, // sourire
      { d: 'M52 40H61A10 10 0 0 1 71 50V52A10 10 0 0 1 61 62H52A10 10 0 0 1 42 52V50A10 10 0 0 1 52 40ZM59.9 59.8A1 1 0 0 1 60.4 58L66.4 58A1 1 0 0 1 67.3 58.6L69 62.5A1.5 1.5 0 0 1 66.9 64.3Z', fill: illustration.metal.gold.base, cut: 2, lock: 'body' }, // petite bulle qui répond
      { d: 'M46.9 51a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0ZM53.9 51a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0ZM60.9 51a2.6 2.6 0 1 0 5.2 0a2.6 2.6 0 1 0 -5.2 0Z', fill: illustration.fabric.indigo.shade, lock: 'hole' }, // la réponse
    ],
  },
  writer: {
    ramp: illustration.metal.gold,
    emblem: [
      { d: 'M30 26H66A6 6 0 0 1 72 32V56A6 6 0 0 1 66 62H30A6 6 0 0 1 24 56V32A6 6 0 0 1 30 26Z', fill: illustration.school.wood.shade, lock: 'body' }, // cadre : ombre
      { d: 'M30 26H66A6 6 0 0 1 72 32V54A6 6 0 0 1 66 60H30A6 6 0 0 1 24 54V32A6 6 0 0 1 30 26Z', fill: illustration.school.wood.base, lock: 'body' }, // cadre de bois
      { d: 'M31 31H65A2 2 0 0 1 67 33V53A2 2 0 0 1 65 55H31A2 2 0 0 1 29 53V33A2 2 0 0 1 31 31Z', fill: illustration.school.slate.base, lock: 'hole' }, // ardoise
      { d: 'M51 41.1L50.3 39.7A1.6 1.6 0 1 0 47.5 41.2L48.3 42.5A1.5 1.5 0 0 0 51 41.1ZM50 39.2L48.9 38.2A1.7 1.7 0 1 0 46.7 40.7L47.9 41.7A1.6 1.6 0 0 0 50 39.2ZM48.4 37.9L47 37.2A1.8 1.8 0 1 0 45.6 40.4L47.1 41A1.7 1.7 0 0 0 48.4 37.9ZM46.5 37L44.9 36.8A1.8 1.8 0 1 0 44.5 40.4L46.1 40.5A1.8 1.8 0 0 0 46.5 37ZM44.4 36.8L42.8 37A1.9 1.9 0 1 0 43.3 40.7L44.9 40.4A1.8 1.8 0 0 0 44.4 36.8ZM42.2 37.1L40.7 37.8A1.9 1.9 0 1 0 42.4 41.3L43.8 40.5A1.9 1.9 0 0 0 42.2 37.1ZM40.1 38.2L38.9 39.5A1.9 1.9 0 0 0 41.6 42.1L42.9 40.9A1.9 1.9 0 1 0 40.1 38.2ZM38.6 40L37.8 41.8A1.9 1.9 0 0 0 41.2 43.3L42 41.6A1.9 1.9 0 1 0 38.6 40ZM37.7 42.4L37.5 44.1A1.8 1.8 0 0 0 41.1 44.5L41.4 42.8A1.9 1.9 0 1 0 37.7 42.4ZM37.6 44.8L38 46.3A1.8 1.8 0 0 0 41.4 45.4L41.1 43.9A1.8 1.8 0 1 0 37.6 44.8ZM38.3 46.9L39.2 48A1.7 1.7 0 0 0 42 46.1L41.2 44.9A1.8 1.8 0 1 0 38.3 46.9ZM39.6 48.4L40.9 49.2A1.6 1.6 0 0 0 42.7 46.6L41.6 45.7A1.7 1.7 0 1 0 39.6 48.4ZM41.3 49.4L42.8 49.7A1.5 1.5 0 0 0 43.7 46.9L42.3 46.4A1.6 1.6 0 1 0 41.3 49.4ZM43.1 49.8L44.7 49.8A1.5 1.5 0 0 0 44.7 46.8L43.1 46.8A1.5 1.5 0 0 0 43.1 49.8ZM45.2 49.7L46.7 49.2A1.5 1.5 0 0 0 45.8 46.3L44.2 46.8A1.5 1.5 0 0 0 45.2 49.7ZM47.2 48.9L48.6 47.8A1.5 1.5 0 0 0 46.9 45.4L45.4 46.5A1.5 1.5 0 0 0 47.2 48.9ZM47.9 38.1L47.9 39.1A1.9 1.9 0 0 0 51.7 39.4L51.7 38.4A1.9 1.9 0 0 0 47.9 38.1ZM47.9 39.1L47.8 40.1A1.9 1.9 0 0 0 51.6 40.3L51.7 39.4A1.9 1.9 0 0 0 47.9 39.1ZM47.8 40.1L47.7 41A1.9 1.9 0 0 0 51.5 41.3L51.6 40.3A1.9 1.9 0 0 0 47.8 40.1ZM47.7 41L47.7 42A1.9 1.9 0 0 0 51.5 42.3L51.5 41.3A1.9 1.9 0 0 0 47.7 41ZM47.7 42L47.6 43A1.9 1.9 0 0 0 51.4 43.3L51.5 42.3A1.9 1.9 0 0 0 47.7 42ZM47.6 43L47.5 44A1.9 1.9 0 0 0 51.3 44.2L51.4 43.3A1.9 1.9 0 0 0 47.6 43ZM47.5 44L47.5 44.9A1.9 1.9 0 0 0 51.3 45.2L51.3 44.2A1.9 1.9 0 0 0 47.5 44ZM47.5 44.9L47.4 45.9A1.9 1.9 0 0 0 51.2 46.2L51.3 45.2A1.9 1.9 0 0 0 47.5 44.9ZM47.4 46.3L47.5 47.2A1.8 1.8 0 0 0 51.2 47L51.2 46.1A1.9 1.9 0 1 0 47.4 46.3ZM47.7 47.8L48 48.5A1.8 1.8 0 0 0 51.3 47.3L51.1 46.5A1.8 1.8 0 1 0 47.7 47.8ZM48.4 49L48.9 49.5A1.7 1.7 0 0 0 51.5 47.3L51.1 46.7A1.8 1.8 0 1 0 48.4 49ZM49.5 49.9L50.1 50.1A1.6 1.6 0 0 0 51.6 47.3L51 46.9A1.7 1.7 0 1 0 49.5 49.9ZM50.6 50.2L51.4 50.3A1.5 1.5 0 0 0 51.9 47.3L51.1 47.1A1.6 1.6 0 1 0 50.6 50.2ZM51.8 50.3L52.7 50.1A1.4 1.4 0 0 0 52.5 47.2L51.5 47.3A1.5 1.5 0 1 0 51.8 50.3ZM53 50L54 49.7A1.4 1.4 0 0 0 53.2 47L52.2 47.3A1.4 1.4 0 1 0 53 50ZM54.2 49.6L55.3 49A1.3 1.3 0 0 0 54.2 46.6L53 47.1A1.4 1.4 0 1 0 54.2 49.6Z', fill: illustration.school.chalk, lock: 'body' }, // « a » cursif à la craie, plus épais en descendant
      { d: 'M53.1 63A2.2 2.2 0 0 1 54.9 60.5L64.4 59.2A2.2 2.2 0 0 1 66.9 61A2.2 2.2 0 0 1 65.1 63.5L55.6 64.8A2.2 2.2 0 0 1 53.1 63Z', fill: illustration.school.chalk, lock: 'body' }, // bâton de craie
    ],
  },
  counter: {
    ramp: illustration.nature.acacia,
    emblem: [
      { d: 'M32.6 56A2 2 0 0 1 30.6 54.4L27.3 39.8A2 2 0 0 1 30.6 37.9L37.2 43.4A2 2 0 0 0 40.2 42.9L46.3 32.1A2 2 0 0 1 49.7 32.1L55.8 42.9A2 2 0 0 0 58.8 43.4L65.4 37.9A2 2 0 0 1 68.7 39.8L65.4 54.4A2 2 0 0 1 63.4 56Z', fill: illustration.metal.gold.base, lock: 'body' }, // couronne
      { d: 'M31 53H65A3 3 0 0 1 68 56V61A3 3 0 0 1 65 64H31A3 3 0 0 1 28 61V56A3 3 0 0 1 31 53Z', fill: illustration.metal.gold.shade, lock: 'body' }, // bandeau
      { d: 'M19 31.5a7 7 0 1 0 14 0a7 7 0 1 0 -14 0ZM40 26.5a8 8 0 1 0 16 0a8 8 0 1 0 -16 0ZM63 31.5a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z', fill: illustration.fabric.cream.shade, lock: 'body' }, // trois cailloux : ombre
      { d: 'M19.3 30.8a6 6 0 1 0 12.1 0a6 6 0 1 0 -12.1 0ZM40.3 25.8a7 7 0 1 0 14.1 0a7 7 0 1 0 -14.1 0ZM63.3 30.8a6 6 0 1 0 12.1 0a6 6 0 1 0 -12.1 0Z', fill: illustration.fabric.cream.base, lock: 'body' }, // trois cailloux
      { d: 'M24.6 29.2L27 27.6V35.6M45.2 24.6C45.4 21.6 50.8 21.6 50.8 24.8C50.8 27.2 45.4 28.8 45.2 31.4H51M67.4 28.4C68.4 27.2 72.8 27.2 72.8 30C72.8 31.8 70.6 32 69.8 32C70.6 32 73.2 32.4 73.2 34.6C73.2 37.4 68.6 37.6 67.2 36', stroke: illustration.fabric.indigo.shade, width: 2.6, lock: 'hole' }, // 1, 2, 3
    ],
  },
  'streak-three': {
    ramp: illustration.fabric.saffron,
    emblem: [
      { d: 'M29 44.5L29 39.5M22.8 46.2L21 43.1M35.2 46.2L37 43.1M48 44.5L48 39.5M41.8 46.2L40 43.1M54.2 46.2L56 43.1M67 44.5L67 39.5M60.8 46.2L59 43.1M73.2 46.2L75 43.1', stroke: illustration.metal.gold.light, width: 3.4, lock: 'body' }, // rayons
      { d: 'M19.5 57a9.5 9.5 0 1 0 19 0a9.5 9.5 0 1 0 -19 0ZM38.5 57a9.5 9.5 0 1 0 19 0a9.5 9.5 0 1 0 -19 0ZM57.5 57a9.5 9.5 0 1 0 19 0a9.5 9.5 0 1 0 -19 0Z', fill: illustration.metal.gold.base, lock: 'body' }, // trois soleils : ombre
      { d: 'M19.9 56.1a8.2 8.2 0 1 0 16.4 0a8.2 8.2 0 1 0 -16.4 0ZM38.9 56.1a8.2 8.2 0 1 0 16.4 0a8.2 8.2 0 1 0 -16.4 0ZM57.9 56.1a8.2 8.2 0 1 0 16.4 0a8.2 8.2 0 1 0 -16.4 0Z', fill: illustration.metal.gold.light, lock: 'body' }, // trois soleils levants, un par jour
      { d: 'M14.7 61C21.1 61 21.1 56 29 56C34.2 56 34.2 61 38.5 61C42.8 61 42.8 56 48 56C53.2 56 53.2 61 57.5 61C61.8 61 61.8 56 67 56C74.9 56 74.9 61 81.3 61A37.4 37.4 0 0 1 14.7 61Z', fill: illustration.fabric.terracotta.base, lock: 'body' }, // trois dunes jusqu'au bord de la face
      { d: 'M19.3 68H76.7A37.4 37.4 0 0 1 19.3 68Z', fill: illustration.fabric.terracotta.shade, lock: 'skip' }, // la terre au premier plan
    ],
  },
  'streak-seven': {
    ramp: illustration.fabric.saffron,
    emblem: [
      { d: 'M48 26.5L48 19.5M61.7 33.1L67.2 28.7M65.1 47.9L71.9 49.5M55.6 59.8L58.6 66.1M40.4 59.8L37.4 66.1M30.9 47.9L24.1 49.5M34.3 33.1L28.8 28.7', stroke: illustration.metal.gold.light, width: 5.5, lock: 'body' }, // sept rayons : un par jour de la semaine
      { d: 'M35.5 44a12.5 12.5 0 1 0 25 0a12.5 12.5 0 1 0 -25 0Z', fill: illustration.metal.gold.base, lock: 'body' }, // soleil : ombre
      { d: 'M35.9 42.9a11 11 0 1 0 22 0a11 11 0 1 0 -22 0Z', fill: illustration.metal.gold.light, lock: 'body' }, // soleil
    ],
  },
  'star-collector': {
    ramp: illustration.metal.gold,
    emblem: [
      { d: 'M30.5 30.3A1.6 1.6 0 0 1 33.3 29.6L35 31.6A1 1 0 0 0 35.8 31.9L38.5 31.7A1.6 1.6 0 0 1 40 34.2L38.7 36.4A1 1 0 0 0 38.6 37.3L39.6 39.7A1.6 1.6 0 0 1 37.7 41.9L35.2 41.4A1 1 0 0 0 34.3 41.6L32.3 43.3A1.6 1.6 0 0 1 29.6 42.2L29.4 39.6A1 1 0 0 0 28.9 38.9L26.7 37.5A1.6 1.6 0 0 1 26.9 34.6L29.3 33.5A1 1 0 0 0 29.8 32.8Z', fill: illustration.fabric.saffron.shade, stroke: illustration.fabric.saffron.shade, width: 2, cut: 2.5, lock: 'body' }, // étoile 1 : contour et ombre
      { d: 'M30.5 30.6A1.4 1.4 0 0 1 32.9 30L34.4 31.7A0.7 0.7 0 0 0 35 32L37.3 31.8A1.4 1.4 0 0 1 38.6 33.9L37.5 35.9A0.7 0.7 0 0 0 37.4 36.5L38.3 38.7A1.4 1.4 0 0 1 36.7 40.6L34.4 40.1A0.7 0.7 0 0 0 33.8 40.2L32 41.7A1.4 1.4 0 0 1 29.8 40.8L29.5 38.5A0.7 0.7 0 0 0 29.2 38L27.2 36.7A1.4 1.4 0 0 1 27.4 34.3L29.5 33.3A0.7 0.7 0 0 0 29.9 32.9Z', fill: illustration.fabric.saffron.base, lock: 'body' }, // étoile 1
      { d: 'M62.5 28.7A1.7 1.7 0 0 1 65.5 29.4L66.2 32A1 1 0 0 0 66.8 32.7L69.4 33.7A1.7 1.7 0 0 1 69.7 36.8L67.4 38.3A1 1 0 0 0 67 39.1L66.8 41.9A1.7 1.7 0 0 1 64 43.1L61.8 41.4A1 1 0 0 0 60.9 41.2L58.2 41.9A1.7 1.7 0 0 1 56.2 39.6L57.2 37A1 1 0 0 0 57.1 36.1L55.6 33.8A1.7 1.7 0 0 1 57.1 31.1L59.9 31.2A1 1 0 0 0 60.7 30.9Z', fill: illustration.fabric.saffron.shade, stroke: illustration.fabric.saffron.shade, width: 2, cut: 2.5, lock: 'body' }, // étoile 2 : contour et ombre
      { d: 'M62.1 29.2A1.5 1.5 0 0 1 64.6 29.7L65.3 32.1A0.7 0.7 0 0 0 65.7 32.6L68 33.5A1.5 1.5 0 0 1 68.3 36.1L66.3 37.4A0.7 0.7 0 0 0 65.9 38L65.8 40.5A1.5 1.5 0 0 1 63.4 41.5L61.4 40A0.7 0.7 0 0 0 60.8 39.9L58.4 40.5A1.5 1.5 0 0 1 56.7 38.5L57.5 36.2A0.7 0.7 0 0 0 57.4 35.6L56.1 33.5A1.5 1.5 0 0 1 57.4 31.2L59.9 31.3A0.7 0.7 0 0 0 60.5 31Z', fill: illustration.fabric.saffron.base, lock: 'body' }, // étoile 2
      { d: 'M70.6 18A1 1 0 0 1 72.2 18.6L72.3 19.9A1 1 0 0 0 72.8 20.6L74 21.3A1 1 0 0 1 73.9 23L72.7 23.6A1 1 0 0 0 72.2 24.3L71.9 25.6A1 1 0 0 1 70.3 26.1L69.3 25.1A1 1 0 0 0 68.5 24.8L67.2 24.9A1 1 0 0 1 66.2 23.5L66.9 22.3A1 1 0 0 0 66.9 21.4L66.3 20.2A1 1 0 0 1 67.4 18.9L68.7 19.1A1 1 0 0 0 69.6 18.9Z', fill: illustration.fabric.saffron.shade, stroke: illustration.fabric.saffron.shade, width: 2, cut: 2.5, lock: 'body' }, // étoile 3 : contour et ombre
      { d: 'M70 18.4A0.7 0.7 0 0 1 71.2 18.8L71.4 19.9A0.6 0.6 0 0 0 71.6 20.3L72.6 20.9A0.7 0.7 0 0 1 72.5 22.2L71.5 22.6A0.6 0.6 0 0 0 71.2 23L71 24.1A0.7 0.7 0 0 1 69.8 24.5L69 23.7A0.6 0.6 0 0 0 68.6 23.5L67.5 23.6A0.7 0.7 0 0 1 66.7 22.5L67.3 21.6A0.6 0.6 0 0 0 67.3 21.1L66.8 20.1A0.7 0.7 0 0 1 67.6 19.1L68.7 19.3A0.6 0.6 0 0 0 69.2 19.1Z', fill: illustration.fabric.saffron.base, lock: 'body' }, // étoile 3
      { d: 'M45.9 21.4A2.3 2.3 0 0 1 50.1 21.4L51.8 24.7A1.4 1.4 0 0 0 52.8 25.4L56.5 26.1A2.3 2.3 0 0 1 57.8 30L55.1 32.7A1.4 1.4 0 0 0 54.8 33.8L55.3 37.5A2.3 2.3 0 0 1 52 40L48.6 38.3A1.4 1.4 0 0 0 47.4 38.3L44 40A2.3 2.3 0 0 1 40.7 37.5L41.2 33.8A1.4 1.4 0 0 0 40.9 32.7L38.2 30A2.3 2.3 0 0 1 39.5 26.1L43.2 25.4A1.4 1.4 0 0 0 44.2 24.7Z', fill: illustration.fabric.saffron.shade, stroke: illustration.fabric.saffron.shade, width: 2.7, cut: 2.5, lock: 'body' }, // étoile 4 : contour et ombre
      { d: 'M45.7 21.9A2 2 0 0 1 49.3 21.9L50.8 24.9A1 1 0 0 0 51.6 25.4L54.9 26A2 2 0 0 1 56 29.4L53.6 31.8A1 1 0 0 0 53.4 32.6L53.8 36A2 2 0 0 1 50.9 38.1L47.9 36.6A1 1 0 0 0 47 36.6L44 38.1A2 2 0 0 1 41.1 36L41.6 32.6A1 1 0 0 0 41.3 31.8L39 29.4A2 2 0 0 1 40.1 26L43.4 25.4A1 1 0 0 0 44.1 24.9Z', fill: illustration.fabric.saffron.base, lock: 'body' }, // étoile 4
      { d: 'M24 46H72A24 21 0 0 1 24 46Z', fill: illustration.school.wood.base, lock: 'body' }, // calebasse
      { d: 'M25.5 44H70.5A2.5 2.5 0 0 1 73 46.5A2.5 2.5 0 0 1 70.5 49H25.5A2.5 2.5 0 0 1 23 46.5A2.5 2.5 0 0 1 25.5 44Z', fill: illustration.school.wood.light, lock: 'body' }, // bord
      { d: 'M30 56C32 53.5 34 53.5 36 56S40 58.5 42 56S46 53.5 48 56S52 58.5 54 56S58 53.5 60 56S64 58.5 66 56', stroke: illustration.school.wood.shade, width: 2.4, lock: 'hole' }, // décor pyrogravé
    ],
  },
};

// ─── Construction : une fois, au chargement du module ─────────────────────

const ROUND = { strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function shapeElements(shape: Shape, key: number, earned: boolean, face: string): ReactElement[] {
  if (!earned && shape.lock === 'skip') {
    return [];
  }
  const tone = earned ? null : shape.lock === 'body' ? colors.locked : colors.lockedContainer;
  const fill = shape.fill ? (tone ?? shape.fill) : 'none';
  const stroke = shape.stroke ? (tone ?? shape.stroke) : undefined;
  const elements: ReactElement[] = [];
  if (shape.cut) {
    const spread = (shape.stroke ? (shape.width ?? 2) : 0) + shape.cut * 2;
    elements.push(<Path key={`${key}e`} d={shape.d} fill={face} stroke={face} strokeWidth={spread} {...ROUND} />);
  }
  elements.push(
    stroke ? (
      <Path key={key} d={shape.d} fill={fill} stroke={stroke} strokeWidth={shape.width ?? 2} {...ROUND} />
    ) : (
      <Path key={key} d={shape.d} fill={fill} />
    ),
  );
  return elements;
}

function buildMedal(medal: Medal, earned: boolean): ReactElement {
  const face = earned ? medal.ramp.base : colors.lockedContainer;
  const rim = earned ? medal.ramp.shade : colors.locked;
  return (
    <G>
      {medal.ribbons ? <Path d={RIBBON_LEFT} fill={earned ? medal.ramp.base : colors.locked} /> : null}
      {medal.ribbons ? <Path d={RIBBON_RIGHT} fill={earned ? medal.ramp.base : colors.locked} /> : null}
      <Path d={ROSETTE} fill={rim} />
      <Path d={FACE} fill={face} />
      {earned ? <Path d={BEVEL} fill="none" stroke={medal.ramp.light} strokeWidth={2} {...ROUND} /> : null}
      {earned ? (
        <Path d={REFLET} fill="none" stroke={illustration.white} strokeWidth={3.6} {...ROUND} />
      ) : null}
      {medal.notches ? (
        <Path d={NOTCHES[medal.notches]} fill={earned ? medal.ramp.light : colors.lockedContainer} />
      ) : null}
      {medal.emblem.flatMap((shape, index) => shapeElements(shape, index, earned, face))}
      {earned ? null : (
        <G>
          <Path d={PASTILLE} fill={colors.card} stroke={colors.locked} strokeWidth={2} />
          <Path d={LOCK_SHACKLE} fill="none" stroke={colors.onSurfaceVariant} strokeWidth={3} {...ROUND} />
          <Path d={LOCK_BODY} fill={colors.onSurfaceVariant} />
          <Path d={LOCK_KEYHOLE} fill={colors.card} />
        </G>
      )}
    </G>
  );
}

const ART = Object.fromEntries(
  BADGE_ART_IDS.map((id) => [id, { earned: buildMedal(MEDALS[id], true), locked: buildMedal(MEDALS[id], false) }]),
) as Record<BadgeArtId, { readonly earned: ReactElement; readonly locked: ReactElement }>;

interface BadgeArtProps {
  id: BadgeArtId;
  earned: boolean;
  /** Côté en dp. Lisible dès 40 dp ; 64–96 dp dans « Tes badges ». */
  size: number;
  /**
   * Couleur de la pastille-ombre : l'ombre du fond sur lequel la médaille est
   * posée, jamais un gris. Par défaut celle des surfaces claires de l'app.
   */
  shadowColor?: string | undefined;
}

/** Une médaille, gagnée (couleur, reflet) ou verrouillée (silhouette + cadenas). */
export const BadgeArt = memo(function BadgeArt({ id, earned, size, shadowColor }: BadgeArtProps) {
  // Un identifiant inconnu (base plus récente que l'app) ne fait jamais planter l'écran.
  const art = ART[id] ?? ART['first-lesson'];
  return (
    <Svg width={size} height={size} viewBox="0 0 96 96">
      <Path d={GROUND} fill={shadowColor ?? colors.surfaceContainerHigh} />
      {earned ? art.earned : art.locked}
    </Svg>
  );
});
