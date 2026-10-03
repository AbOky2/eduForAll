/**
 * Pièces d'avatar — la bibliothèque de formes des douze enfants d'ECOLNA
 * (design/brief-identite-v2.md § 8). Réutilisable par les scènes : chaque
 * pièce dessine dans le repère 0 0 120 120 du portrait ; une scène la place
 * avec un `transform="translate(…) scale(…)"` sur un `G`.
 *
 * Construction (§ 8.1) : une tête identique pour tous, des yeux posés sur la
 * ligne y 58, une lumière unique en haut à gauche, trois tons par matière,
 * aucun contour. La diversité vient de l'architecture des cheveux, de la
 * forme des sourcils et du nez, des vêtements — jamais d'un recoloriage.
 *
 * Règles de rendu : uniquement `Path`, `Circle`, `Ellipse`, `Rect`, `G` ;
 * chaînes `d` précalculées (au plus une décimale) ; aucune opacité, aucun
 * dégradé ; traits à bouts et jointures ronds. Ce fichier n'importe que
 * react-native-svg et les jetons, pour être rendu hors appareil
 * (scripts/design-sheets/avatars.sheet.tsx).
 */
import { Circle, Path, Rect } from 'react-native-svg';

import { illustration, skinTones, type BackdropName, type FabricName, type Ramp, type SkinTone } from '@/design-system/tokens';

export type AvatarLod = 'full' | 'small';
export type AvatarExpression = 'calm' | 'joy';
export type SkinRamp = (typeof skinTones)[SkinTone];

export type HairStyleId =
  | 'side-part'
  | 'puffs'
  | 'mini-afro'
  | 'cornrow-braids'
  | 'knotted-scarf'
  | 'round-afro'
  | 'natural-afro'
  | 'bucket-hat'
  | 'side-loops'
  | 'shaved-line'
  | 'crown-bun'
  | 'soft-curls';

export type GarmentId =
  | 'school-shirt'
  | 'pagne-dress'
  | 'jalabiya'
  | 'plain-top'
  | 'claudine-dress'
  | 'polo'
  | 'school-dress'
  | 'striped-tshirt'
  | 'embroidered-dress'
  | 'checked-shirt'
  | 'boubou-top'
  | 'pocket-tshirt';

export type SchoolMarker = 'strap' | 'slate' | 'pencil';
export type AccessoryId = 'glasses' | 'hearing-aid' | 'stud-earrings' | 'hoop-earrings' | 'bead-necklace';
export type BrowShape = 'arch' | 'straight' | 'round' | 'lifted';
export type NoseShape = 'broad' | 'round' | 'button';
export type BackdropMotif = 'lake-wave' | 'dune' | 'rising-sun' | 'acacia' | 'palm-fan';

const HAIR = illustration.hair;
const FACE = illustration.face;
const WHITE = illustration.white;
const GOLD = illustration.metal.gold;
const ROUND = { strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;

// ---------------------------------------------------------------------------
// Géométrie précalculée des coiffures, motifs et reflets. Construite à partir
// du contour exact de la tête : calottes = crâne décalé de 1,2–1,6 u + racine ;
// contours d'afro = chaînes d'arcs r 6–9 u posées à longueur d'arc égale
// (bosses de 1,5–2,5 u) ; croissants de reflet = racine décalée vers le visage.
// Arrondi à une décimale, extrémités des segments droits sur des unités
// entières. On édite ces chaînes à la main : elles sont la source.
// ---------------------------------------------------------------------------
const FOREHEAD_SHORT_D =
  'M51.9 31.9C45.8 32.8 39 35.1 36.1 41C41.6 38.5 48.4 37.4 51.9 31.9Z';
const FOREHEAD_ROUND_D =
  'M51.9 30.6C45.5 31.7 38.7 34.8 35.7 40.9C41.4 38.2 48.1 36.2 51.9 30.6Z';
const HAIR_SIDE_PART_BACK_D =
  'M28 51A9 9 0 0 1 28.7 43.8A9 9 0 0 1 30.1 37.9A9 9 0 0 1 33.1 31.5A9 9 0 0 1 36.6 26.7A9 9 0 0 1 41.9 21.8A9 9 0 0 1 47.1 18.8A9 9 0 0 1 53.8 16.6A9 9 0 0 1 59.7 16A9 9 0 0 1 66.8 16.8A9 9 0 0 1 72.5 18.6A9 9 0 0 1 78.7 22.3A9 9 0 0 1 83.1 26.3A9 9 0 0 1 87.3 32A9 9 0 0 1 89.8 37.5A9 9 0 0 1 91.4 44.5A9 9 0 0 1 92 51L60 60Z';
const HAIR_SIDE_PART_D =
  'M32 55C29.8 53.4 29.8 52 29.8 50C28.7 33.3 43.1 17.8 60 18.8C76.9 17.8 91.3 33.3 90.2 50C90.2 52 90.2 53.4 88 55L86 54C86 52.7 86.4 48.4 86 46C85.6 43.6 84.9 41.3 83.6 39.4C82.3 37.5 80.7 35.9 78.4 34.6C76.1 33.3 72.7 32.2 69.6 31.6C66.5 31 63.2 31 60 31C56.8 31 53.5 31 50.4 31.6C47.3 32.2 43.9 33.3 41.6 34.6C39.3 35.9 37.7 37.5 36.4 39.4C35.1 41.3 34.4 43.6 34 46C33.6 48.4 34 52.7 34 54Z';
const HAIR_SIDE_PART_LINE_D =
  'M46 31.6C46.2 27.4 46.6 22.8 47.4 18.6';
const HAIR_SIDE_PART_LIGHT_D =
  'M48.9 22.5A27.4 28.4 0 0 1 59 20';
const HAIR_SHORT_FADE_BACK_D =
  'M31 56C29.4 52 29 47 29.4 42C29.6 38.6 29.8 35.4 30.2 32.6C30.6 24.8 34.4 18.8 41.8 16C47.4 14.4 53.6 14 60 14C66.4 14 72.6 14.4 78.2 16C85.6 18.8 89.4 24.8 89.8 32.6C90.2 35.4 90.4 38.6 90.6 42C91 47 90.6 52 89 56L60 60Z';
const HAIR_SHORT_FADE_D =
  'M32 55C29.8 53.4 29.8 52 29.8 50C28.7 33.3 43.1 17.8 60 18.8C76.9 17.8 91.3 33.3 90.2 50C90.2 52 90.2 53.4 88 55L86 54C86 52.7 86.4 48.4 86 46C85.6 43.6 84.9 41.3 83.6 39.4C82.3 37.5 80.7 35.9 78.4 34.6C76.1 33.3 72.7 32.2 69.6 31.6C66.5 31 63.2 31 60 31C56.8 31 53.5 31 50.4 31.6C47.3 32.2 43.9 33.3 41.6 34.6C39.3 35.9 37.7 37.5 36.4 39.4C35.1 41.3 34.4 43.6 34 46C33.6 48.4 34 52.7 34 54Z';
const HAIR_SHORT_FADE_LINE_D =
  'M30 43L33 35';
const HAIR_SHORT_FADE_LIGHT_D =
  'M45.6 17.4C49.6 16.6 54.4 16.2 59 16.2';
const HAIR_SHORT_FADE_TUFTS_D =
  'M44.8 20.1A2 2 0 0 1 47.1 18.1M53 17.1A2 2 0 0 1 56 16.3M62.2 16.2A2 2 0 0 1 65.2 16.8M71.2 17.5A2 2 0 0 1 73.7 19.4M78.9 21.1A2 2 0 0 1 80.6 23.7';
const HAIR_MINI_AFRO_BACK_D =
  'M20 50A8 8 0 0 1 20.5 40.2A8 8 0 0 1 23.7 32.9A8 8 0 0 1 30.4 25.2A8 8 0 0 1 38.4 19.9A8 8 0 0 1 45.8 17A8 8 0 0 1 55.9 15.2A8 8 0 0 1 65.4 15.3A8 8 0 0 1 73.2 16.8A8 8 0 0 1 82.8 20.5A8 8 0 0 1 90.6 26A8 8 0 0 1 95.8 32A8 8 0 0 1 99.8 41.4A8 8 0 0 1 100 50C99.4 54 95 57 89 58L60 60L31 58C25 57 20.6 54 20 50Z';
const HAIR_MINI_AFRO_D =
  'M32 55C29.8 53.4 29.8 52 29.8 50C28.7 33.3 43.1 17.8 60 18.8C76.9 17.8 91.3 33.3 90.2 50C90.2 52 90.2 53.4 88 55L87 55C86.9 53.5 87.2 48.8 86.6 46C86 43.2 85 40.6 83.4 38.4C81.8 36.2 79.5 34.4 77 33C74.5 31.6 71.4 30.8 68.6 30.2C65.8 29.6 62.9 29.6 60 29.6C57.1 29.6 54.2 29.6 51.4 30.2C48.6 30.8 45.5 31.6 43 33C40.5 34.4 38.2 36.2 36.6 38.4C35 40.6 34 43.2 33.4 46C32.8 48.8 33.1 53.5 33 55Z';
const HAIR_MINI_AFRO_CURLS_D =
  'M33.7 30.7A2.2 2.2 0 0 1 35.6 27.9M44.7 23.8A2.2 2.2 0 0 1 47.6 22.1M58.3 20.8A2.2 2.2 0 0 1 61.7 20.8M72.4 22.1A2.2 2.2 0 0 1 75.3 23.8M84.4 27.9A2.2 2.2 0 0 1 86.3 30.7M92.1 37.1A2.2 2.2 0 0 1 92.9 40.3M26.8 41.2A2.2 2.2 0 0 1 27.5 37.9';
const HAIR_MINI_AFRO_LIGHT_D =
  'M25.1 40.1A36 27.8 0 0 1 35 26.8';
const HAIR_ROUND_AFRO_BACK_D =
  'M30 52A7.6 7.6 0 0 1 28.6 42.3A7.6 7.6 0 0 1 29.3 33.9A7.6 7.6 0 0 1 32.1 24.4A7.6 7.6 0 0 1 36.3 16.9A7.6 7.6 0 0 1 43.3 9.8A7.6 7.6 0 0 1 50.6 5.7A7.6 7.6 0 0 1 60.4 4A7.6 7.6 0 0 1 68.8 5.5A7.6 7.6 0 0 1 77.5 10.4A7.6 7.6 0 0 1 83.3 16.4A7.6 7.6 0 0 1 88.2 25.1A7.6 7.6 0 0 1 90.6 33.4A7.6 7.6 0 0 1 91.4 43.3A7.6 7.6 0 0 1 90 52L60 58Z';
const HAIR_ROUND_AFRO_FRONT_D =
  'M32 55C29.6 53.4 29.6 52 29.6 50C28.5 33.2 43 17.6 60 18.6C77 17.6 91.5 33.2 90.4 50C90.4 52 90.4 53.4 88 55L87 55C86.9 53.5 87.2 48.8 86.6 46C86 43.2 85 40.6 83.4 38.4C81.8 36.2 79.5 34.4 77 33C74.5 31.6 71.4 30.8 68.6 30.2C65.8 29.6 62.9 29.6 60 29.6C57.1 29.6 54.2 29.6 51.4 30.2C48.6 30.8 45.5 31.6 43 33C40.5 34.4 38.2 36.2 36.6 38.4C35 40.6 34 43.2 33.4 46C32.8 48.8 33.1 53.5 33 55Z';
const HAIR_ROUND_AFRO_LIGHT_D =
  'M35.7 27A27 33.2 0 0 1 48.2 11.8';
const HAIR_AFRO_BACK_D =
  'M24 63A6.5 6.5 0 0 1 19.7 55.1A6.5 6.5 0 0 1 18.1 47.5A6.5 6.5 0 0 1 18.6 38.1A6.5 6.5 0 0 1 20.9 30.8A6.5 6.5 0 0 1 25.9 22.6A6.5 6.5 0 0 1 32.3 16.3A6.5 6.5 0 0 1 38.8 12.2A6.5 6.5 0 0 1 47.5 8.7A6.5 6.5 0 0 1 55.1 7.3A6.5 6.5 0 0 1 64.7 7.2A6.5 6.5 0 0 1 73.4 9A6.5 6.5 0 0 1 80.5 11.8A6.5 6.5 0 0 1 88.5 17A6.5 6.5 0 0 1 93.9 22.4A6.5 6.5 0 0 1 99 30.5A6.5 6.5 0 0 1 101.5 39A6.5 6.5 0 0 1 101.9 46.7A6.5 6.5 0 0 1 100 56A6.5 6.5 0 0 1 96 63L60 64Z';
const HAIR_AFRO_FRONT_D =
  'M32 55C29.6 53.4 29.6 52 29.6 50C28.5 33.2 43 17.6 60 18.6C77 17.6 91.5 33.2 90.4 50C90.4 52 90.4 53.4 88 55L87 55C86.9 53.5 87.2 48.8 86.6 46C86 43.2 85 40.6 83.4 38.4C81.8 36.2 79.5 34.4 77 33C74.5 31.6 71.4 30.8 68.6 30.2C65.8 29.6 62.9 29.6 60 29.6C57.1 29.6 54.2 29.6 51.4 30.2C48.6 30.8 45.5 31.6 43 33C40.5 34.4 38.2 36.2 36.6 38.4C35 40.6 34 43.2 33.4 46C32.8 48.8 33.1 53.5 33 55Z';
const HAIR_AFRO_LIGHT_D =
  'M25.3 32.2A37.4 33 0 0 1 41.3 16';
const HAIR_AFRO_CURLS_D =
  'M24.8 53.2A2.4 2.4 0 0 1 24.1 49.3M45.8 15.3A2.4 2.4 0 0 1 49.4 13.8M60.6 12.5A2.4 2.4 0 0 1 64.5 12.9M75.3 15.3A2.4 2.4 0 0 1 78.7 17.4M87.5 23.2A2.4 2.4 0 0 1 89.7 26.5M94.9 34.9A2.4 2.4 0 0 1 95.7 38.8M96.1 48.2A2.4 2.4 0 0 1 95.5 52.1';
const HAIR_PUFFS_BACK_D =
  'M46.2 24A7 7 0 0 1 42.7 33.9A7 7 0 0 1 35.9 38.8A7 7 0 0 1 25 38.9A7 7 0 0 1 17.2 32.6A7 7 0 0 1 14.6 24.7A7 7 0 0 1 17.9 14.3A7 7 0 0 1 26.3 8.7A7 7 0 0 1 34.6 8.8A7 7 0 0 1 43.5 15.1A7 7 0 0 1 46.2 24ZM73.8 24A7 7 0 0 1 77.3 14A7 7 0 0 1 84.1 9.2A7 7 0 0 1 95 9.2A7 7 0 0 1 102.9 15.4A7 7 0 0 1 105.4 23.4A7 7 0 0 1 102.1 33.7A7 7 0 0 1 93.7 39.3A7 7 0 0 1 85.4 39.2A7 7 0 0 1 76.5 32.9A7 7 0 0 1 73.8 24Z';
const HAIR_PUFFS_FRONT_D =
  'M32 55C29.4 53.4 29.4 52 29.4 50C28.3 33.1 42.9 17.4 60 18.4C77.1 17.4 91.7 33.1 90.6 50C90.6 52 90.6 53.4 88 55L87 55C86.9 53.5 87.2 48.8 86.6 46C86 43.2 85 40.6 83.4 38.4C81.8 36.2 79.5 34.4 77 33C74.5 31.6 71.4 30.8 68.6 30.2C65.8 29.6 62.9 29.6 60 29.6C57.1 29.6 54.2 29.6 51.4 30.2C48.6 30.8 45.5 31.6 43 33C40.5 34.4 38.2 36.2 36.6 38.4C35 40.6 34 43.2 33.4 46C32.8 48.8 33.1 53.5 33 55Z';
const HAIR_PUFFS_PART_D =
  'M60 29V20';
const HAIR_PUFFS_LIGHT_D =
  'M18.9 20.7A12 12 0 0 1 25.5 13M78.1 20.7A12 12 0 0 1 84.7 13';
const HAIR_PUFFS_TIES_D =
  'M38 31L43 27M82 31L77 27';
const HAIR_PUFFS_CURLS_D =
  'M21 29.3A2.2 2.2 0 0 1 19.8 26M32.4 13.4A2.2 2.2 0 0 1 35.7 14.6M84.3 14.6A2.2 2.2 0 0 1 87.6 13.4M99 18.7A2.2 2.2 0 0 1 100.2 22M100.2 26A2.2 2.2 0 0 1 99 29.3';
const HAIR_CORNROWS_D =
  'M32 55C29.4 53.4 29.4 52 29.4 50C28.3 33.1 42.9 17.4 60 18.4C77.1 17.4 91.7 33.1 90.6 50C90.6 52 90.6 53.4 88 55L87 55C86.9 53.5 87.2 48.8 86.6 46C86 43.2 85 40.6 83.4 38.4C81.8 36.2 79.5 34.4 77 33C74.5 31.6 71.4 30.8 68.6 30.2C65.8 29.6 62.9 29.6 60 29.6C57.1 29.6 54.2 29.6 51.4 30.2C48.6 30.8 45.5 31.6 43 33C40.5 34.4 38.2 36.2 36.6 38.4C35 40.6 34 43.2 33.4 46C32.8 48.8 33.1 53.5 33 55Z';
const HAIR_CORNROWS_PARTS_D =
  'M44 33L47 25M52 31L53 24M60 30V23M68 31L67 24M76 33L73 25';
const HAIR_CORNROWS_BAND_D =
  'M32.4 46.6C32.4 31.6 44.4 21.6 60 21.6C75.6 21.6 87.6 31.6 87.6 46.6';
const HAIR_CORNROWS_BRAIDS_D =
  'M27.4 66.4C26.2 76.4 25.4 86.4 25 96M31.2 69C30.8 78.8 30.8 88.6 31 98M35 75.4C35 83 35.6 90.6 36.8 97';
const HAIR_CORNROWS_BRAID_MARKS_D =
  'M24 79L27 80M24 88L27 89M29 81L32 82M29 90L32 91M34 84L37 85M35 92L37 93';
const BEAD_GOLD_D =
  'M21.8 100A3.2 3.2 0 1 1 28.2 100A3.2 3.2 0 1 1 21.8 100Z';
const BEAD_SKY_D =
  'M27.8 102A3.2 3.2 0 1 1 34.2 102A3.2 3.2 0 1 1 27.8 102Z';
const BEAD_CLAY_D =
  'M33.8 101A3.2 3.2 0 1 1 40.2 101A3.2 3.2 0 1 1 33.8 101Z';
const HAIR_SCARF_HAIR_D =
  'M32 55C29.4 53.4 29.4 52 29.4 50C28.3 33.1 42.9 17.4 60 18.4C77.1 17.4 91.7 33.1 90.6 50C90.6 52 90.6 53.4 88 55L87 55C86.9 53.5 87.2 48.8 86.6 46C86 43.2 85 40.6 83.4 38.4C81.8 36.2 79.5 34.4 77 33C74.5 31.6 71.4 30.8 68.6 30.2C65.8 29.6 62.9 29.6 60 29.6C57.1 29.6 54.2 29.6 51.4 30.2C48.6 30.8 45.5 31.6 43 33C40.5 34.4 38.2 36.2 36.6 38.4C35 40.6 34 43.2 33.4 46C32.8 48.8 33.1 53.5 33 55Z';
const SCARF_D =
  'M31.2 50.4C30.6 49 28.3 45.2 27.8 42C27.3 38.8 27.1 34.6 28 31C28.9 27.4 30.9 23.6 33.4 20.6C35.9 17.6 39.2 14.7 43 12.8C46.8 10.9 51.7 9.8 56 9.4C60.3 9 64.9 9.4 69 10.4C73.1 11.4 77.3 13.2 80.6 15.4C83.9 17.6 86.6 20.4 88.6 23.4C90.6 26.4 91.8 30.1 92.4 33.4C93 36.7 92.8 40.2 92.2 43C91.6 45.8 89.4 49.2 88.8 50.4C88.3 48.8 87.3 43.6 85.8 40.6C84.3 37.6 82.1 34.7 79.6 32.6C77.1 30.5 73.9 28.8 70.6 27.8C67.3 26.8 63.5 26.4 60 26.4C56.5 26.4 52.7 26.8 49.4 27.8C46.1 28.8 42.9 30.5 40.4 32.6C37.9 34.7 35.7 37.6 34.2 40.6C32.7 43.6 31.7 48.8 31.2 50.4Z';
const SCARF_SHADE_D =
  'M88.8 50.4C86.6 43.6 83.4 37.6 79 33.6C84.4 33 89 30.4 91.6 27.4C92.8 31.4 92.8 36.8 92.2 43C91.8 46 90.6 48.6 88.8 50.4ZM77 16.6A4.6 4.6 0 1 1 86.2 16.6A4.6 4.6 0 1 1 77 16.6Z';
const SCARF_PETALS_D =
  'M78 15C73.4 9.8 73.6 3.4 78.6 2.6C83.4 1.8 85 8.6 82 14ZM84 16C86.4 9.2 92.6 7.4 95.2 11.4C97.6 15.2 92.4 19.6 86 19Z';
const SCARF_LIGHT_D =
  'M32.8 33.6C34.4 25.6 39.2 19.4 45.6 15.6';
const SCARF_WAVES_D =
  'M39.8 22.4C41.6 20.6 43.6 20.6 45.4 22.4S49.2 24.2 51 22.4M55.6 16.6C57.4 14.8 59.4 14.8 61.2 16.6S65 18.4 66.8 16.6M66.8 26C68.6 24.2 70.6 24.2 72.4 26S76.2 27.8 78 26';
const HAIR_HAT_SIDES_D =
  'M31 55C29.6 52 29 48 29 44H35C34.4 47.6 34 51.2 34 55ZM89 55C90.4 52 91 48 91 44H85C85.6 47.6 86 51.2 86 55Z';
const HAT_CROWN_D =
  'M30 36C30 22.4 37.4 12.2 47.4 10C55.6 8 64.4 8 72.6 10C82.6 12.2 90 22.4 90 36Z';
const HAT_BRIM_D =
  'M19 44.6C17.6 41 19.6 37.4 23.8 35.6C34.4 31.4 47 29.8 60 29.8C73 29.8 85.6 31.4 96.2 35.6C100.4 37.4 102.4 41 101 44.6C99.6 47.4 96.2 47.2 92.2 45.6C82.2 41.8 71.4 40.2 60 40.2C48.6 40.2 37.8 41.8 27.8 45.6C23.8 47.2 20.4 47.4 19 44.6Z';
const HAT_SHADE_D =
  'M79.6 33.6C80.4 25.4 78.6 17.6 74.8 11.4C83.6 14.2 90 23.6 90 34.6C86.8 34 83.2 33.6 79.6 33.6ZM101 44.6C99.6 47.4 96.2 47.2 92.2 45.6C82.2 41.8 71.4 40.2 60 40.2C71.4 39 83.2 39.6 93.4 42.6C96.6 43.6 99.6 44 101 44.6Z';
const HAT_STITCH_D =
  'M24.4 40.4C35.4 36 47.4 34.2 60 34.2C72.6 34.2 84.6 36 95.6 40.4';
const HAT_LIGHT_D =
  'M37.4 25.2C39.4 19.6 43.2 15.2 48.4 13';
const HAT_FOREHEAD_SHADOW_D =
  'M33.4 46.4C41.4 43.2 50.4 41.6 60 41.6C69.6 41.6 78.6 43.2 86.6 46.4C86.4 45 86.2 43.6 85.8 42.4C77.8 40.6 69.2 40 60 40C50.8 40 42.2 40.6 34.2 42.4C33.8 43.6 33.6 45 33.4 46.4Z';
const HAIR_LOOPS_FRONT_D =
  'M32 55C29.4 53.4 29.4 52 29.4 50C28.3 33.1 42.9 17.4 60 18.4C77.1 17.4 91.7 33.1 90.6 50C90.6 52 90.6 53.4 88 55L87 55C86.9 53.5 87.2 48.8 86.6 46C86 43.2 85 40.6 83.4 38.4C81.8 36.2 79.5 34.4 77 33C74.5 31.6 71.4 30.8 68.6 30.2C65.8 29.6 62.9 29.6 60 29.6C57.1 29.6 54.2 29.6 51.4 30.2C48.6 30.8 45.5 31.6 43 33C40.5 34.4 38.2 36.2 36.6 38.4C35 40.6 34 43.2 33.4 46C32.8 48.8 33.1 53.5 33 55Z';
const HAIR_LOOPS_D =
  'M33.2 41.2C25.4 40.6 19.4 34.6 19.8 27.2C20.2 20.2 26.6 15.6 33.6 17.2C37 18 39.6 19.8 41.4 22.2M86.8 41.2C94.6 40.6 100.6 34.6 100.2 27.2C99.8 20.2 93.4 15.6 86.4 17.2C83 18 80.4 19.8 78.6 22.2';
const HAIR_LOOPS_LIGHT_D =
  'M21.8 30.4C21.4 25 24.4 20.6 29.4 19.4M98.2 30.4C98.6 25 95.6 20.6 90.6 19.4';
const HAIR_LOOPS_CUFFS_D =
  'M38 21L42 25M82 21L78 25';
const HAIR_LOOPS_CENTER_D =
  'M60 29V19';
const HAIR_LOOPS_CENTER_MARKS_D =
  'M58 21L60 22L62 21M58 24L60 25L62 24';
const HAIR_LOOPS_PARTS_D =
  'M56 29.4C55.6 25.6 55.8 22 56.4 18.8M64 29.4C64.4 25.6 64.2 22 63.6 18.8';
const HAIR_CROWN_FRONT_D =
  'M32 55C29.4 53.4 29.4 52 29.4 50C28.3 33.1 42.9 17.4 60 18.4C77.1 17.4 91.7 33.1 90.6 50C90.6 52 90.6 53.4 88 55L87 55C86.9 53.5 87.2 48.8 86.6 46C86 43.2 85 40.6 83.4 38.4C81.8 36.2 79.5 34.4 77 33C74.5 31.6 71.4 30.8 68.6 30.2C65.8 29.6 62.9 29.6 60 29.6C57.1 29.6 54.2 29.6 51.4 30.2C48.6 30.8 45.5 31.6 43 33C40.5 34.4 38.2 36.2 36.6 38.4C35 40.6 34 43.2 33.4 46C32.8 48.8 33.1 53.5 33 55Z';
const HAIR_CROWN_BUN_D =
  'M41 15A6 6 0 0 1 45 8.2A6 6 0 0 1 52.2 5.1A6 6 0 0 1 60 4.2A6 6 0 0 1 67.8 5.1A6 6 0 0 1 75 8.2A6 6 0 0 1 79 15C79 19.6 70.6 22.4 60 22.4C49.4 22.4 41 19.6 41 15Z';
const HAIR_CROWN_BUN_MARKS_D =
  'M46.4 10.6C48.4 12.6 49.2 15.4 48.8 18.4M55.4 6.8C57.4 9.2 58.2 12.6 57.8 16.2M64.8 6.6C66.8 9 67.6 12.4 67.2 16M73.8 9.6C75.6 11.8 76.4 14.6 76 17.6';
const HAIR_CROWN_LIGHT_D =
  'M43.4 12C45.4 8.6 48.8 6.2 52.8 5.2';
const HAIR_CROWN_PARTS_D =
  'M44.8 33.6C47.4 28.4 51.4 24.4 56.2 22.4M75.2 33.6C72.6 28.4 68.6 24.4 63.8 22.4';
const HAIR_CROWN_BAND_D =
  'M32.4 46.4C32.8 35.2 44.2 27.2 60 27.2C75.8 27.2 87.2 35.2 87.6 46.4';
const HAIR_CURLS_BACK_D =
  'M26 51A7 7 0 0 1 26.1 40.3A7 7 0 0 1 28.5 32.1A7 7 0 0 1 34.5 22.8A7 7 0 0 1 40.9 17.2A7 7 0 0 1 51 12.6A7 7 0 0 1 59.4 11.4A7 7 0 0 1 70.4 13A7 7 0 0 1 78.2 16.6A7 7 0 0 1 86.5 23.9A7 7 0 0 1 91 31.1A7 7 0 0 1 94.1 41.7A7 7 0 0 1 94 51C94.4 56 92.4 60 90 61L60 60L30 61C27.6 60 26 56 26 51Z';
const HAIR_CURLS_D =
  'M32 55C29.8 53.4 29.8 52 29.8 50C28.7 33.3 43.1 17.8 60 18.8C76.9 17.8 91.3 33.3 90.2 50C90.2 52 90.2 53.4 88 55L87 55C86.8 49.6 86.2 45.2 84.4 41.2C83 41.8 81.2 41.4 80.4 40C79.6 38.6 79.8 37 80.6 36C78 33.8 75.2 32.4 72 31.4C71.4 33 69.6 34 67.8 33.6C66 33.2 64.8 31.8 64.8 30.2C63.2 30 61.6 30 60 30C58.4 30 56.8 30 55.2 30.2C55.2 31.8 54 33.2 52.2 33.6C50.4 34 48.6 33 48 31.4C44.8 32.4 42 33.8 39.4 36C40.2 37 40.4 38.6 39.6 40C38.8 41.4 37 41.8 35.6 41.2C33.8 45.2 33.2 49.6 33 55Z';
const HAIR_CURLS_MARKS_D =
  'M35.3 31.9A2.6 2.6 0 0 1 37.8 28.2M43.1 23A2.6 2.6 0 0 1 46.9 20.6M53.8 18.1A2.6 2.6 0 0 1 58.3 17.5M65.6 18A2.6 2.6 0 0 1 70 19.2M76.5 22.7A2.6 2.6 0 0 1 79.9 25.6M84.4 31.5A2.6 2.6 0 0 1 86.4 35.5';
const HAIR_CURLS_LIGHT_D =
  'M30.2 37.4A31 31.2 0 0 1 38.5 23.6';
const MOTIF_PALM_FAN_D =
  'M21 93L13 120M18 92L9 89M18 91L9 85M19 90L11 82M20 90L15 79M21 90L19 78M21 90L23 78M22 90L27 79M23 90L30 82M24 91L32 86';
const MOTIF_ACACIA_STEM_D =
  'M5 106C10 96 17 87.6 27 81';
const MOTIF_ACACIA_LEAVES_D =
  'M7 99L6 97M10 101L12 101M10 94L9 92M13 96L16 96M14 89L14 87M17 92L19 92M19 85L18 82M21 88L24 88M24 81L24 78M26 84L28 85';
const MOTIF_SUN_RAYS_D =
  'M5 88L2 86M14 80L12 77M26 80L28 77M35 88L38 86';
const MOTIF_SUN_D =
  'M7 96A13 13 0 0 1 33 96Z';
const ACACIA_PRINT_D =
  'M24.7 117.5A5.6 0.7 -62 1 1 30 107.6A5.6 0.7 -62 1 1 24.7 117.5ZM26.6 113.8A1.9 1.1 -114 1 1 25.1 110.3A1.9 1.1 -114 1 1 26.6 113.8ZM26.7 113.9A1.9 1.1 -10 1 1 30.5 113.2A1.9 1.1 -10 1 1 26.7 113.9ZM27.9 111.4A1.9 1.1 -114 1 1 26.3 108A1.9 1.1 -114 1 1 27.9 111.4ZM28 111.5A1.9 1.1 -10 1 1 31.8 110.8A1.9 1.1 -10 1 1 28 111.5ZM29.1 109.1A1.9 1.1 -114 1 1 27.5 105.7A1.9 1.1 -114 1 1 29.1 109.1ZM29.2 109.2A1.9 1.1 -10 1 1 33 108.6A1.9 1.1 -10 1 1 29.2 109.2ZM28.9 109.6A1.6 1.1 -62 1 1 30.4 106.8A1.6 1.1 -62 1 1 28.9 109.6ZM42.9 120.6A5.6 0.7 -78 1 1 45.2 109.6A5.6 0.7 -78 1 1 42.9 120.6ZM43.7 116.5A1.9 1.1 -130 1 1 41.2 113.6A1.9 1.1 -130 1 1 43.7 116.5ZM43.8 116.5A1.9 1.1 -26 1 1 47.2 114.9A1.9 1.1 -26 1 1 43.8 116.5ZM44.2 113.9A1.9 1.1 -130 1 1 41.8 110.9A1.9 1.1 -130 1 1 44.2 113.9ZM44.4 113.9A1.9 1.1 -26 1 1 47.8 112.2A1.9 1.1 -26 1 1 44.4 113.9ZM44.8 111.3A1.9 1.1 -130 1 1 42.3 108.4A1.9 1.1 -130 1 1 44.8 111.3ZM44.9 111.3A1.9 1.1 -26 1 1 48.3 109.7A1.9 1.1 -26 1 1 44.9 111.3ZM44.7 111.8A1.6 1.1 -78 1 1 45.4 108.7A1.6 1.1 -78 1 1 44.7 111.8ZM59.8 113.6A5.6 0.7 -70 1 1 63.6 103A5.6 0.7 -70 1 1 59.8 113.6ZM61.1 109.6A1.9 1.1 -122 1 1 59.1 106.4A1.9 1.1 -122 1 1 61.1 109.6ZM61.3 109.7A1.9 1.1 -18 1 1 64.9 108.5A1.9 1.1 -18 1 1 61.3 109.7ZM62.1 107.1A1.9 1.1 -122 1 1 60.1 103.9A1.9 1.1 -122 1 1 62.1 107.1ZM62.2 107.1A1.9 1.1 -18 1 1 65.8 106A1.9 1.1 -18 1 1 62.2 107.1ZM63 104.6A1.9 1.1 -122 1 1 60.9 101.4A1.9 1.1 -122 1 1 63 104.6ZM63.1 104.7A1.9 1.1 -18 1 1 66.7 103.5A1.9 1.1 -18 1 1 63.1 104.7ZM62.9 105.1A1.6 1.1 -70 1 1 64 102.1A1.6 1.1 -70 1 1 62.9 105.1Z';
const GINGHAM_BANDS_D =
  'M13 100H16V124H13ZM21 99H24V124H21ZM29 97H32V124H29ZM37 95H40V124H37ZM45 94H48V124H45ZM53 100H56V124H53ZM61 100H64V124H61ZM69 93H72V124H69ZM77 95H80V124H77ZM85 97H88V124H85ZM4 104H91V107H4ZM4 112H92V115H4ZM4 120H90V123H4Z';
const GINGHAM_CROSSINGS_D =
  'M13 104H16V107H13ZM13 112H16V115H13ZM13 120H16V123H13ZM21 104H24V107H21ZM21 112H24V115H21ZM21 120H24V123H21ZM29 104H32V107H29ZM29 112H32V115H29ZM29 120H32V123H29ZM37 104H40V107H37ZM37 112H40V115H37ZM37 120H40V123H37ZM45 104H48V107H45ZM45 112H48V115H45ZM45 120H48V123H45ZM53 104H56V107H53ZM53 112H56V115H53ZM53 120H56V123H53ZM61 104H64V107H61ZM61 112H64V115H61ZM61 120H64V123H61ZM69 104H72V107H69ZM69 112H72V115H69ZM69 120H72V123H69ZM77 104H80V107H77ZM77 112H80V115H77ZM77 120H80V123H77ZM85 104H88V107H85ZM85 112H88V115H85ZM85 120H88V123H85Z';
const LOWER_LIDS_CALM_D =
  'M42.5 58.5A5.5 6.5 0 0 0 53.5 58.5A5.5 6.5 0 0 1 42.5 58.5ZM66.5 58.5A5.5 6.5 0 0 0 77.5 58.5A5.5 6.5 0 0 1 66.5 58.5Z';
const LOWER_LIDS_JOY_D =
  'M42.6 59.5C44.4 59.2 51.6 59.2 53.4 59.5C51.6 58 44.4 58 42.6 59.5ZM66.6 59.5C68.4 59.2 75.6 59.2 77.4 59.5C75.6 58 68.4 58 66.6 59.5Z';
const CHEEKBONE_D =
  'M36.6 66.4C37.8 64.6 40.2 63.6 42.4 64C40.6 64.6 38.8 65.6 36.6 66.4Z';
const NOSE_TIP_D =
  'M56.4 65.9A2.6 1.4 0 1 1 61.6 65.9A2.6 1.4 0 1 1 56.4 65.9Z';
const LIP_SHINE_D =
  'M57.4 78.2C58.6 78.7 60.4 78.8 61.8 78.5C61.2 79.3 58.4 79.3 57.4 78.2Z';
// --- fin de la géométrie précalculée ---

// ---------------------------------------------------------------------------
// Visage (commun aux douze)
// ---------------------------------------------------------------------------

/** La tête, identique pour les douze (58 × 66 u, menton large et rond). */
export const HEAD_D =
  'M60 20C77 20 89 32 89 50C89 58 88.5 64 86.5 70C83 80 73 86 60 86C47 86 37 80 33.5 70C31.5 64 31 58 31 50C31 32 43 20 60 20Z';
/** Oreilles rx 5 ry 7 en x 30,5 et 89,5 ; même ton que la tête, donc même chemin. */
const EARS_D = 'M25.5 60A5 7 0 1 1 35.5 60A5 7 0 1 1 25.5 60ZM84.5 60A5 7 0 1 1 94.5 60A5 7 0 1 1 84.5 60Z';
const HEAD_AND_EARS_D = HEAD_D + EARS_D;
const EAR_INNER_D =
  'M30 56C27.8 56.2 27 58.4 27.2 60.4C27.4 62.2 28.6 63.4 30.2 63.4M90 56C92.2 56.2 93 58.4 92.8 60.4C92.6 62.2 91.4 63.4 89.8 63.4';
/** Cou de 18 u, évasé à la base pour remplir toutes les encolures. */
const NECK_D = 'M51 74H69V88C69 91.6 72 93 76 94V106H44V94C48 93 51 91.6 51 88Z';
/** Ombre du visage côté droit : suit exactement le contour de la tête. */
const FACE_SHADE_D =
  'M86.7 37.3C88.2 41 89 45.3 89 50C89 58 88.5 64 86.5 70C83.6 78.2 76.4 83.7 66.7 85.4C75 84.3 80.4 76.1 82.4 68.5C83.8 62.5 84.8 56.2 85.8 50C86.6 45.8 86.8 41.5 86.7 37.3Z';
/** Lumière chaude renvoyée sur la mâchoire, côté ombre. */
const BOUNCE_D =
  'M87.6 66.2C87.3 67.5 86.9 68.8 86.5 70C84.3 76.2 79.7 80.9 73.3 83.5C78.6 79.6 83 75 85.5 69.6C86.1 68.4 86.8 67.3 87.6 66.2Z';
const CHEEKS_D = 'M37.6 69A4 2.4 0 1 1 45.6 69A4 2.4 0 1 1 37.6 69ZM74.4 69A4 2.4 0 1 1 82.4 69A4 2.4 0 1 1 74.4 69Z';

const EYES_CALM_D =
  'M42.5 58A5.5 6.5 0 1 1 53.5 58A5.5 6.5 0 1 1 42.5 58ZM66.5 58A5.5 6.5 0 1 1 77.5 58A5.5 6.5 0 1 1 66.5 58Z';
/** Joie : la joue remonte la paupière inférieure (même dessus d'œil). */
const EYES_JOY_D =
  'M42.6 59.5C42.4 54.6 45 51.5 48 51.5C51 51.5 53.6 54.6 53.4 59.5C51.6 58 44.4 58 42.6 59.5ZM66.6 59.5C66.4 54.6 69 51.5 72 51.5C75 51.5 77.6 54.6 77.4 59.5C75.6 58 68.4 58 66.6 59.5Z';
/** Reflet r 1,9 décalé (−1,8 ; −2,2), identique sur tous les yeux ; r 2,4 en petit. */
const CATCHLIGHTS_D =
  'M44.3 55.8A1.9 1.9 0 1 1 48.1 55.8A1.9 1.9 0 1 1 44.3 55.8ZM68.3 55.8A1.9 1.9 0 1 1 72.1 55.8A1.9 1.9 0 1 1 68.3 55.8Z';
const CATCHLIGHTS_SMALL_D =
  'M43.8 55.8A2.4 2.4 0 1 1 48.6 55.8A2.4 2.4 0 1 1 43.8 55.8ZM67.8 55.8A2.4 2.4 0 1 1 72.6 55.8A2.4 2.4 0 1 1 67.8 55.8Z';
/** Paupière supérieure : un arc de 1,8 u couleur cheveux, pour tous (pas de cils genrés). */
const LIDS_D = 'M42.4 55.6A6 7 0 0 1 53.6 55.6M66.4 55.6A6 7 0 0 1 77.6 55.6';

/** Sourcils : arcs de 11 u, 7–8 u au-dessus des yeux ; la joie les monte de 2 u. */
const BROWS: Record<BrowShape, { calm: string; joy: string }> = {
  arch: {
    calm: 'M42.5 45.2Q48 40.7 53.5 44.6M77.5 45.2Q72 40.7 66.5 44.6',
    joy: 'M42.5 43.2Q48 38.7 53.5 42.6M77.5 43.2Q72 38.7 66.5 42.6',
  },
  straight: {
    calm: 'M42.6 44.8Q48 42.4 53.4 43.8M77.4 44.8Q72 42.4 66.6 43.8',
    joy: 'M42.6 42.8Q48 40.4 53.4 41.8M77.4 42.8Q72 40.4 66.6 41.8',
  },
  round: {
    calm: 'M43 45.6Q47.6 39.8 53 43.8M77 45.6Q72.4 39.8 67 43.8',
    joy: 'M43 43.6Q47.6 37.8 53 41.8M77 43.6Q72.4 37.8 67 41.8',
  },
  lifted: {
    calm: 'M42.6 44.4Q47.4 41.6 53.4 43M77.4 44.4Q72.6 41.6 66.6 43',
    joy: 'M42.6 42.4Q47.4 39.6 53.4 41M77.4 42.4Q72.6 39.6 66.6 41',
  },
};

/** Nez : base large (13–15 u), 5–6 u de haut, sans arête, au ton d'ombre. */
const NOSES: Record<NoseShape, string> = {
  broad:
    'M52.5 68.4C52.5 66.4 54 65.3 55.8 65.1C57.2 64.9 58 64 60 64C62 64 62.8 64.9 64.2 65.1C66 65.3 67.5 66.4 67.5 68.4C67.5 69.6 66.4 70.1 65.1 69.7C63.6 69.2 61.9 69.4 60 69.4C58.1 69.4 56.4 69.2 54.9 69.7C53.6 70.1 52.5 69.6 52.5 68.4Z',
  round:
    'M53 68.2C53 66.4 54.3 65.4 55.9 65.1C57.4 64.8 58.2 63.8 60 63.8C61.8 63.8 62.6 64.8 64.1 65.1C65.7 65.4 67 66.4 67 68.2C67 69.5 66 70 64.8 69.6C63.4 69.1 61.8 69.3 60 69.3C58.2 69.3 56.6 69.1 55.2 69.6C54 70 53 69.5 53 68.2Z',
  button:
    'M53.5 68.2C53.5 66.7 54.7 65.8 56.2 65.6C57.6 65.4 58.4 64.8 60 64.8C61.6 64.8 62.4 65.4 63.8 65.6C65.3 65.8 66.5 66.7 66.5 68.2C66.5 69.3 65.6 69.7 64.5 69.4C63.2 69 61.7 69.2 60 69.2C58.3 69.2 56.8 69 55.5 69.4C54.4 69.7 53.5 69.3 53.5 68.2Z',
};

const LIP_CALM_D = 'M52.5 75C55 80.5 65 80.5 67.5 75C64 77 56 77 52.5 75Z';
const SEAM_CALM_D = 'M52.5 75C56 77 64 77 67.5 75';
/** Joie : bouche en D (16 u, < 30 % du visage), dents ≤ 2,5 u, langue dans le bas. */
const MOUTH_JOY_D = 'M52 74.6C52 81 55.6 84 60 84C64.4 84 68 81 68 74.6C64.6 75.6 55.4 75.6 52 74.6Z';
const TEETH_JOY_D =
  'M53.4 75.6C56.6 76.4 63.4 76.4 66.6 75.6C66.5 76.6 66.3 77.4 66 78C62.6 78.6 57.4 78.6 54 78C53.7 77.4 53.5 76.6 53.4 75.6Z';
const TONGUE_JOY_D = 'M56.2 82C58 80.6 62 80.6 63.8 82C62.8 83.3 61.5 83.8 60 83.8C58.5 83.8 57.2 83.3 56.2 82Z';

/** Peaux sur lesquelles l'œil et les cheveux se confondent avec la peau. */
const DEEP_SKINS: readonly SkinTone[] = ['ebene', 'cacao', 'acajou'];
export const isDeepSkin = (tone: SkinTone): boolean => DEEP_SKINS.includes(tone);

/**
 * Tous les reflets de peau (ton `light`) en un seul chemin : reflet de front
 * le long de la racine, tiret de pommette, bout du nez, lèvre inférieure et —
 * sur les peaux foncées — croissant de paupière inférieure. La combinaison est
 * calculée une fois puis gardée.
 */
const lightCache = new Map<string, string>();
export function skinLightPath(
  foreheadLight: string | null,
  lod: AvatarLod,
  deep: boolean,
  expression: AvatarExpression,
): string {
  const key = `${foreheadLight ?? '-'}|${lod}|${deep ? 1 : 0}|${expression}`;
  let d = lightCache.get(key);
  if (d === undefined) {
    d =
      (foreheadLight ?? '') +
      NOSE_TIP_D +
      (lod === 'full' ? CHEEKBONE_D : '') +
      (expression === 'calm' && lod === 'full' ? LIP_SHINE_D : '') +
      (deep ? (expression === 'joy' ? LOWER_LIDS_JOY_D : LOWER_LIDS_CALM_D) : '');
    lightCache.set(key, d);
  }
  return d;
}

export function AvatarNeck({ skin }: { skin: SkinRamp }) {
  return <Path d={NECK_D} fill={skin.shade} />;
}

/**
 * Ombre du visage, nez et — sous un bord de chapeau — ombre portée sur le
 * front partagent le ton `shade` : un seul chemin, calculé une fois.
 */
const shadeCache = new Map<string, string>();
function faceShadePath(nose: NoseShape, hair: HairStyleId): string {
  const key = `${nose}|${hair}`;
  let d = shadeCache.get(key);
  if (d === undefined) {
    d = FACE_SHADE_D + NOSES[nose] + (FACE_SHADOW[hair] ?? '');
    shadeCache.set(key, d);
  }
  return d;
}

/** Oreilles + tête, ombre et nez, bounce, joues, reflets (le reflet de front suit la racine). */
export function AvatarHead({
  skinTone,
  nose,
  hair,
  lod,
  expression,
}: {
  skinTone: SkinTone;
  nose: NoseShape;
  hair: HairStyleId;
  lod: AvatarLod;
  expression: AvatarExpression;
}) {
  const skin = skinTones[skinTone];
  return (
    <>
      <Path d={HEAD_AND_EARS_D} fill={skin.base} />
      <Path d={EAR_INNER_D} stroke={skin.shade} strokeWidth={1.6} {...ROUND} />
      <Path d={faceShadePath(nose, hair)} fill={skin.shade} />
      <Path d={BOUNCE_D} fill={skin.bounce} />
      <Path d={CHEEKS_D} fill={skin.blush} />
      <Path d={skinLightPath(FOREHEAD_LIGHT[hair], lod, isDeepSkin(skinTone), expression)} fill={skin.light} />
    </>
  );
}

export function AvatarBrows({ shape, expression, lod }: { shape: BrowShape; expression: AvatarExpression; lod: AvatarLod }) {
  return <Path d={BROWS[shape][expression]} stroke={HAIR.base} strokeWidth={lod === 'full' ? 2.8 : 3.2} {...ROUND} />;
}

export function AvatarEyes({ expression, lod }: { expression: AvatarExpression; lod: AvatarLod }) {
  const full = lod === 'full';
  return (
    <>
      <Path d={expression === 'joy' ? EYES_JOY_D : EYES_CALM_D} fill={FACE.eye} />
      {full ? <Path d={LIDS_D} stroke={HAIR.base} strokeWidth={1.8} {...ROUND} /> : null}
      <Path d={full ? CATCHLIGHTS_D : CATCHLIGHTS_SMALL_D} fill={FACE.catchlight} />
    </>
  );
}

export function AvatarMouth({ expression, skin }: { expression: AvatarExpression; skin: SkinRamp }) {
  if (expression === 'joy') {
    return (
      <>
        <Path d={MOUTH_JOY_D} fill={FACE.mouth} />
        <Path d={TEETH_JOY_D} fill={FACE.teeth} />
        <Path d={TONGUE_JOY_D} fill={FACE.tongue} />
      </>
    );
  }
  return (
    <>
      <Path d={LIP_CALM_D} fill={skin.lip} />
      <Path d={SEAM_CALM_D} stroke={skin.shade} strokeWidth={1.4} {...ROUND} />
    </>
  );
}

/** Le visage complet (sourcils, yeux, bouche) posé sur `AvatarHead`. */
export function AvatarFeatures({
  brows,
  expression,
  lod,
  skin,
}: {
  brows: BrowShape;
  expression: AvatarExpression;
  lod: AvatarLod;
  skin: SkinRamp;
}) {
  return (
    <>
      <AvatarBrows shape={brows} expression={expression} lod={lod} />
      <AvatarEyes expression={expression} lod={lod} />
      <AvatarMouth expression={expression} skin={skin} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Cheveux : arrière (avant la tête), drapé (devant l'épaule), avant (après le visage)
// ---------------------------------------------------------------------------

interface HairProps {
  style: HairStyleId;
  lod: AvatarLod;
  skin: SkinRamp;
}

/** Le reflet de front suit la racine de chaque coiffure (aucun sous un chapeau). */
export const FOREHEAD_LIGHT: Record<HairStyleId, string | null> = {
  'side-part': FOREHEAD_SHORT_D,
  puffs: FOREHEAD_ROUND_D,
  'mini-afro': FOREHEAD_ROUND_D,
  'cornrow-braids': FOREHEAD_ROUND_D,
  'knotted-scarf': FOREHEAD_ROUND_D,
  'round-afro': FOREHEAD_ROUND_D,
  'natural-afro': FOREHEAD_ROUND_D,
  'bucket-hat': null,
  'side-loops': FOREHEAD_ROUND_D,
  'shaved-line': FOREHEAD_SHORT_D,
  'crown-bun': FOREHEAD_ROUND_D,
  'soft-curls': FOREHEAD_ROUND_D,
};

/** Ombre portée par une coiffe sur le front (le bord du bob). */
const FACE_SHADOW: Partial<Record<HairStyleId, string>> = {
  'bucket-hat': HAT_FOREHEAD_SHADOW_D,
};

/**
 * Ce que chaque coiffure laisse voir — un foulard noué montre la racine, les
 * oreilles et le cou : c'est un accessoire de mode, pas un voile.
 */
export const HAIR_COVERAGE: Record<HairStyleId, { hairline: boolean; ears: boolean; neck: boolean }> = {
  'side-part': { hairline: true, ears: true, neck: true },
  puffs: { hairline: true, ears: true, neck: true },
  'mini-afro': { hairline: true, ears: true, neck: true },
  'cornrow-braids': { hairline: true, ears: true, neck: true },
  'knotted-scarf': { hairline: true, ears: true, neck: true },
  'round-afro': { hairline: true, ears: true, neck: true },
  'natural-afro': { hairline: true, ears: true, neck: true },
  'bucket-hat': { hairline: false, ears: true, neck: true },
  'side-loops': { hairline: true, ears: true, neck: true },
  'shaved-line': { hairline: true, ears: true, neck: true },
  'crown-bun': { hairline: true, ears: true, neck: true },
  'soft-curls': { hairline: true, ears: true, neck: true },
};

export function HairBack({ style, lod }: HairProps) {
  const full = lod === 'full';
  switch (style) {
    case 'side-part':
      return <Path d={HAIR_SIDE_PART_BACK_D} fill={HAIR.base} />;
    case 'shaved-line':
      return <Path d={HAIR_SHORT_FADE_BACK_D} fill={HAIR.base} />;
    case 'mini-afro':
      return <Path d={HAIR_MINI_AFRO_BACK_D} fill={HAIR.base} />;
    case 'soft-curls':
      return <Path d={HAIR_CURLS_BACK_D} fill={HAIR.base} />;
    case 'puffs':
      return (
        <>
          <Path d={HAIR_PUFFS_BACK_D} fill={HAIR.base} />
          <Path d={HAIR_PUFFS_LIGHT_D} stroke={HAIR.light} strokeWidth={2.4} {...ROUND} />
          {full ? <Path d={HAIR_PUFFS_CURLS_D} stroke={HAIR.light} strokeWidth={1.4} {...ROUND} /> : null}
        </>
      );
    case 'round-afro':
      return (
        <>
          <Path d={HAIR_ROUND_AFRO_BACK_D} fill={HAIR.base} />
          <Path d={HAIR_ROUND_AFRO_LIGHT_D} stroke={HAIR.light} strokeWidth={2.4} {...ROUND} />
        </>
      );
    case 'natural-afro':
      return (
        <>
          <Path d={HAIR_AFRO_BACK_D} fill={HAIR.base} />
          <Path d={HAIR_AFRO_LIGHT_D} stroke={HAIR.light} strokeWidth={2.4} {...ROUND} />
          {full ? <Path d={HAIR_AFRO_CURLS_D} stroke={HAIR.light} strokeWidth={1.4} {...ROUND} /> : null}
        </>
      );
    case 'side-loops':
      return (
        <>
          <Path d={HAIR_LOOPS_D} stroke={HAIR.base} strokeWidth={5.6} {...ROUND} />
          <Path d={HAIR_LOOPS_LIGHT_D} stroke={HAIR.light} strokeWidth={1.6} {...ROUND} />
        </>
      );
    case 'crown-bun':
      return (
        <>
          <Path d={HAIR_CROWN_BUN_D} fill={HAIR.base} />
          <Path d={HAIR_CROWN_LIGHT_D} stroke={HAIR.light} strokeWidth={2.4} {...ROUND} />
          {full ? <Path d={HAIR_CROWN_BUN_MARKS_D} stroke={HAIR.light} strokeWidth={1.4} {...ROUND} /> : null}
        </>
      );
    default:
      return null;
  }
}

/** Ce qui tombe devant l'épaule : les trois nattes perlées (or, ciel, terre cuite). */
export function HairDrape({ style, lod }: HairProps) {
  if (style !== 'cornrow-braids') {
    return null;
  }
  return (
    <>
      <Path d={HAIR_CORNROWS_BRAIDS_D} stroke={HAIR.base} strokeWidth={5} {...ROUND} />
      {lod === 'full' ? <Path d={HAIR_CORNROWS_BRAID_MARKS_D} stroke={HAIR.light} strokeWidth={1.4} {...ROUND} /> : null}
      <Path d={BEAD_GOLD_D} fill={GOLD.base} />
      <Path d={BEAD_SKY_D} fill={illustration.fabric.sky.base} />
      <Path d={BEAD_CLAY_D} fill={illustration.fabric.terracotta.base} />
    </>
  );
}

export function HairFront({ style, lod, skin }: HairProps) {
  const full = lod === 'full';
  switch (style) {
    case 'side-part':
      return (
        <>
          <Path d={HAIR_SIDE_PART_D} fill={HAIR.base} />
          <Path d={HAIR_SIDE_PART_LINE_D} stroke={skin.light} strokeWidth={1.4} {...ROUND} />
          <Path d={HAIR_SIDE_PART_LIGHT_D} stroke={HAIR.light} strokeWidth={2.4} {...ROUND} />
        </>
      );
    case 'shaved-line':
      return (
        <>
          <Path d={HAIR_SHORT_FADE_D} fill={HAIR.base} />
          <Path d={HAIR_SHORT_FADE_LINE_D} stroke={skin.light} strokeWidth={1.4} {...ROUND} />
          <Path d={HAIR_SHORT_FADE_LIGHT_D} stroke={HAIR.light} strokeWidth={2.4} {...ROUND} />
          {full ? <Path d={HAIR_SHORT_FADE_TUFTS_D} stroke={HAIR.light} strokeWidth={1.4} {...ROUND} /> : null}
        </>
      );
    case 'mini-afro':
      return (
        <>
          <Path d={HAIR_MINI_AFRO_D} fill={HAIR.base} />
          <Path d={HAIR_MINI_AFRO_LIGHT_D} stroke={HAIR.light} strokeWidth={2.4} {...ROUND} />
          {full ? <Path d={HAIR_MINI_AFRO_CURLS_D} stroke={HAIR.light} strokeWidth={1.4} {...ROUND} /> : null}
        </>
      );
    case 'round-afro':
      return <Path d={HAIR_ROUND_AFRO_FRONT_D} fill={HAIR.base} />;
    case 'natural-afro':
      return <Path d={HAIR_AFRO_FRONT_D} fill={HAIR.base} />;
    case 'puffs':
      return (
        <>
          <Path d={HAIR_PUFFS_FRONT_D} fill={HAIR.base} />
          <Path d={HAIR_PUFFS_PART_D} stroke={skin.light} strokeWidth={1.4} {...ROUND} />
          <Path d={HAIR_PUFFS_TIES_D} stroke={GOLD.base} strokeWidth={3.6} {...ROUND} />
        </>
      );
    case 'cornrow-braids':
      return (
        <>
          <Path d={HAIR_CORNROWS_D} fill={HAIR.base} />
          {full ? <Path d={HAIR_CORNROWS_PARTS_D} stroke={skin.light} strokeWidth={1.4} {...ROUND} /> : null}
          <Path d={HAIR_CORNROWS_BAND_D} stroke={illustration.fabric.plum.light} strokeWidth={3.6} {...ROUND} />
        </>
      );
    case 'knotted-scarf': {
      const scarf = illustration.fabric.indigo;
      return (
        <>
          <Path d={HAIR_SCARF_HAIR_D} fill={HAIR.base} />
          <Path d={SCARF_D} fill={scarf.base} />
          <Path d={SCARF_PETALS_D} fill={scarf.base} />
          <Path d={SCARF_SHADE_D} fill={scarf.shade} />
          <Path d={SCARF_LIGHT_D} stroke={scarf.light} strokeWidth={2.4} {...ROUND} />
          <Path d={SCARF_WAVES_D} stroke={WHITE} strokeWidth={1.6} {...ROUND} />
        </>
      );
    }
    case 'bucket-hat': {
      const hat = illustration.fabric.indigo;
      return (
        <>
          <Path d={HAIR_HAT_SIDES_D} fill={HAIR.base} />
          <Path d={HAT_CROWN_D + HAT_BRIM_D} fill={hat.base} />
          <Path d={HAT_SHADE_D} fill={hat.shade} />
          <Path d={HAT_LIGHT_D} stroke={hat.light} strokeWidth={2.4} {...ROUND} />
          {full ? <Path d={HAT_STITCH_D} stroke={hat.light} strokeWidth={1.4} strokeDasharray="2.4 2.4" {...ROUND} /> : null}
        </>
      );
    }
    case 'side-loops':
      return (
        <>
          <Path d={HAIR_LOOPS_FRONT_D} fill={HAIR.base} />
          <Path d={HAIR_LOOPS_PARTS_D} stroke={skin.light} strokeWidth={1.4} {...ROUND} />
          <Path d={HAIR_LOOPS_CENTER_D} stroke={HAIR.light} strokeWidth={4} {...ROUND} />
          {full ? <Path d={HAIR_LOOPS_CENTER_MARKS_D} stroke={HAIR.base} strokeWidth={1.4} {...ROUND} /> : null}
          <Path d={HAIR_LOOPS_CUFFS_D} stroke={GOLD.base} strokeWidth={3.6} {...ROUND} />
        </>
      );
    case 'crown-bun':
      return (
        <>
          <Path d={HAIR_CROWN_FRONT_D} fill={HAIR.base} />
          {full ? <Path d={HAIR_CROWN_PARTS_D} stroke={skin.light} strokeWidth={1.4} {...ROUND} /> : null}
          <Path d={HAIR_CROWN_BAND_D} stroke={GOLD.base} strokeWidth={3.6} {...ROUND} />
        </>
      );
    case 'soft-curls':
      return (
        <>
          <Path d={HAIR_CURLS_D} fill={HAIR.base} />
          <Path d={HAIR_CURLS_LIGHT_D} stroke={HAIR.light} strokeWidth={2.4} {...ROUND} />
          {full ? <Path d={HAIR_CURLS_MARKS_D} stroke={HAIR.light} strokeWidth={1.4} {...ROUND} /> : null}
        </>
      );
  }
}

// ---------------------------------------------------------------------------
// Buste et vêtements
// ---------------------------------------------------------------------------

const BUST_CREW_D =
  'M6 124C6 110 11 101.6 21 98.6C29 96.2 38.6 93.6 51 92C53 97.8 67 97.8 69 92C81.4 93.6 91 96.2 99 98.6C109 101.6 114 110 114 124Z';
const BUST_SCOOP_D =
  'M6 124C6 110 11 101.6 21 98.6C28.6 96.4 36.6 94.4 46.4 93C49.6 101 70.4 101 73.6 93C83.4 94.4 91.4 96.4 99 98.6C109 101.6 114 110 114 124Z';
const BUST_VEE_D =
  'M6 124C6 110 11 101.6 21 98.6C29 96.2 38.6 93.6 51 92L60 101L69 92C81.4 93.6 91 96.2 99 98.6C109 101.6 114 110 114 124Z';
/** Tête, oreilles, cou et épaules d'un seul tenant : la place vide du profil. */
export const SILHOUETTE_D = HEAD_D + EARS_D + NECK_D + BUST_CREW_D;
const BUST_SHADE_D =
  'M89.4 94.8C98.6 96.8 107.4 101.6 110.6 110.4C112.4 115 113 119.4 113 124H91C93.2 114.4 93.2 103.6 89.4 94.8Z';

const SHIRT_COLLAR_D =
  'M51 91.4C47.6 92.6 44.6 95 43.4 98.2C42.6 100.6 44.4 102 46.8 101.6C51.4 100.8 56.4 100.6 60 101C57.2 98.4 54 95 51 91.4ZM69 91.4C72.4 92.6 75.4 95 76.6 98.2C77.4 100.6 75.6 102 73.2 101.6C68.6 100.8 63.6 100.6 60 101C62.8 98.4 66 95 69 91.4Z';
const SHIRT_BUTTONS_D =
  'M58.6 106A1.4 1.4 0 1 1 61.4 106A1.4 1.4 0 1 1 58.6 106ZM58.6 114A1.4 1.4 0 1 1 61.4 114A1.4 1.4 0 1 1 58.6 114Z';
/** Col Claudine : deux pans arrondis et plats qui se rejoignent au milieu. */
const CLAUDINE_COLLAR_D =
  'M51 91.6C47 92.4 42.6 94.2 41.4 97.2C40.6 99.4 42.2 100.8 45 100.6C50.2 100.2 55.6 98.8 59.6 96.4C56.4 95.4 53.4 93.8 51 91.6ZM69 91.6C73 92.4 77.4 94.2 78.6 97.2C79.4 99.4 77.8 100.8 75 100.6C69.8 100.2 64.4 98.8 60.4 96.4C63.6 95.4 66.6 93.8 69 91.6Z';
const POLO_COLLAR_D =
  'M51 91.4C48 93.4 45.6 96.6 45 100.4C44.8 101.8 46 102.6 47.2 102C51.2 100.2 55.6 98.6 58.6 97.4C56 95.6 53.4 93.6 51 91.4ZM69 91.4C72 93.4 74.4 96.6 75 100.4C75.2 101.8 74 102.6 72.8 102C68.8 100.2 64.4 98.6 61.4 97.4C64 95.6 66.6 93.6 69 91.4Z';
const POLO_PLACKET_D = 'M57 98H63V108C63 109.4 61.8 110.4 60 110.4C58.2 110.4 57 109.4 57 108Z';
const POLO_BUTTONS_D =
  'M58.8 101.4A1.2 1.2 0 1 1 61.2 101.4A1.2 1.2 0 1 1 58.8 101.4ZM58.8 106.4A1.2 1.2 0 1 1 61.2 106.4A1.2 1.2 0 1 1 58.8 106.4Z';
const CREW_RIB_D = 'M51 92C53 97.8 67 97.8 69 92';
const SCOOP_RIB_D = 'M46.4 93C49.6 101 70.4 101 73.6 93';
const SLIT_D = 'M60 98V105';
/** Cinq points de broderie or (jalabiya), Ø 2,6 u. */
const JALABIYA_DOTS_D =
  'M54.4 100.6A1.3 1.3 0 1 1 57 100.6A1.3 1.3 0 1 1 54.4 100.6ZM63 100.6A1.3 1.3 0 1 1 65.6 100.6A1.3 1.3 0 1 1 63 100.6ZM55 105A1.3 1.3 0 1 1 57.6 105A1.3 1.3 0 1 1 55 105ZM62.4 105A1.3 1.3 0 1 1 65 105A1.3 1.3 0 1 1 62.4 105ZM58.7 109.4A1.3 1.3 0 1 1 61.3 109.4A1.3 1.3 0 1 1 58.7 109.4Z';
/** Encolure brodée : six points le long de l'encolure dégagée. */
const SCOOP_DOTS_D =
  'M46.6 97.4A1.3 1.3 0 1 1 49.2 97.4A1.3 1.3 0 1 1 46.6 97.4ZM51.2 101.2A1.3 1.3 0 1 1 53.8 101.2A1.3 1.3 0 1 1 51.2 101.2ZM56.7 102.9A1.3 1.3 0 1 1 59.3 102.9A1.3 1.3 0 1 1 56.7 102.9ZM60.7 102.9A1.3 1.3 0 1 1 63.3 102.9A1.3 1.3 0 1 1 60.7 102.9ZM66.2 101.2A1.3 1.3 0 1 1 68.8 101.2A1.3 1.3 0 1 1 66.2 101.2ZM70.8 97.4A1.3 1.3 0 1 1 73.4 97.4A1.3 1.3 0 1 1 70.8 97.4Z';
/** Rayures de 4 u ; la part à l'ombre prend le ton d'ombre (le disque rogne les bouts). */
const STRIPES_LIGHT_D = 'M4 104H92V108H4ZM4 113H93V117H4Z';
const STRIPES_SHADE_D = 'M92 104H116V108H92ZM93 113H116V117H93Z';
const POCKET_D = 'M34 105H46C46.6 105 47 105.4 47 106V113C47 115.2 45.2 117 43 117H37C34.8 117 33 115.2 33 113V106C33 105.4 33.4 105 34 105Z';
const POCKET_SEAM_D = 'M35 108H45';

interface GarmentStyle {
  bust: string;
  fabric: FabricName;
}

/** Encolure et couleur dominante de chaque vêtement. */
export const GARMENTS: Record<GarmentId, GarmentStyle> = {
  'school-shirt': { bust: BUST_VEE_D, fabric: 'indigo' },
  'pagne-dress': { bust: BUST_SCOOP_D, fabric: 'terracotta' },
  jalabiya: { bust: BUST_CREW_D, fabric: 'sage' },
  'plain-top': { bust: BUST_SCOOP_D, fabric: 'plum' },
  'claudine-dress': { bust: BUST_CREW_D, fabric: 'sand' },
  polo: { bust: BUST_VEE_D, fabric: 'saffron' },
  'school-dress': { bust: BUST_CREW_D, fabric: 'sky' },
  'striped-tshirt': { bust: BUST_CREW_D, fabric: 'cream' },
  'embroidered-dress': { bust: BUST_SCOOP_D, fabric: 'terracotta' },
  'checked-shirt': { bust: BUST_VEE_D, fabric: 'cream' },
  'boubou-top': { bust: BUST_SCOOP_D, fabric: 'indigoDye' },
  'pocket-tshirt': { bust: BUST_CREW_D, fabric: 'sage' },
};

export function Garment({ id, lod }: { id: GarmentId; lod: AvatarLod }) {
  const style = GARMENTS[id];
  const fabric: Ramp = illustration.fabric[style.fabric];
  const full = lod === 'full';
  const base = (
    <>
      <Path d={style.bust} fill={fabric.base} />
      <Path d={BUST_SHADE_D} fill={fabric.shade} />
    </>
  );
  switch (id) {
    case 'school-shirt':
      return (
        <>
          {base}
          <Path d={SHIRT_COLLAR_D + SHIRT_BUTTONS_D} fill={fabric.light} />
        </>
      );
    case 'pagne-dress':
      return (
        <>
          {base}
          <Path d={SCOOP_RIB_D} stroke={fabric.shade} strokeWidth={2.4} {...ROUND} />
          {full ? <Path d={ACACIA_PRINT_D} fill={fabric.light} /> : null}
        </>
      );
    case 'jalabiya':
      return (
        <>
          {base}
          <Path d={CREW_RIB_D + SLIT_D} stroke={fabric.shade} strokeWidth={2.4} {...ROUND} />
          <Path d={JALABIYA_DOTS_D} fill={GOLD.base} />
        </>
      );
    case 'plain-top':
      return (
        <>
          {base}
          <Path d={SCOOP_RIB_D} stroke={fabric.light} strokeWidth={2.4} {...ROUND} />
        </>
      );
    case 'claudine-dress':
    case 'school-dress':
      return (
        <>
          {base}
          <Path d={CLAUDINE_COLLAR_D} fill={illustration.fabric.cream.light} />
        </>
      );
    case 'polo':
      return (
        <>
          {base}
          <Path d={POLO_PLACKET_D} fill={fabric.shade} />
          <Path d={POLO_COLLAR_D + POLO_BUTTONS_D} fill={fabric.light} />
        </>
      );
    case 'striped-tshirt': {
      const stripe = illustration.fabric.sky;
      return (
        <>
          {base}
          <Path d={STRIPES_LIGHT_D} fill={stripe.base} />
          <Path d={STRIPES_SHADE_D} fill={stripe.shade} />
          <Path d={CREW_RIB_D} stroke={stripe.base} strokeWidth={2.4} {...ROUND} />
        </>
      );
    }
    case 'embroidered-dress':
      return (
        <>
          {base}
          <Path d={SCOOP_RIB_D} stroke={fabric.shade} strokeWidth={2.4} {...ROUND} />
          <Path d={SCOOP_DOTS_D} fill={illustration.fabric.cream.base} />
        </>
      );
    case 'checked-shirt': {
      const check = illustration.fabric.terracotta;
      return (
        <>
          {base}
          <Path d={GINGHAM_BANDS_D} fill={check.light} />
          <Path d={GINGHAM_CROSSINGS_D} fill={check.base} />
          <Path d={SHIRT_COLLAR_D} fill={illustration.fabric.cream.light} />
        </>
      );
    }
    case 'boubou-top':
      return (
        <>
          {base}
          <Path d={SCOOP_RIB_D} stroke={fabric.light} strokeWidth={2.4} {...ROUND} />
          <Path d={SCOOP_DOTS_D} fill={GOLD.base} />
        </>
      );
    case 'pocket-tshirt':
      return (
        <>
          {base}
          <Path d={CREW_RIB_D} stroke={fabric.shade} strokeWidth={2.4} {...ROUND} />
          <Path d={POCKET_D} fill={fabric.light} />
          {full ? <Path d={POCKET_SEAM_D} stroke={fabric.base} strokeWidth={1.4} {...ROUND} /> : null}
        </>
      );
  }
}

// ---------------------------------------------------------------------------
// Marqueurs d'écolier et accessoires
// ---------------------------------------------------------------------------

/** Bretelle de cartable de 4–5 u qui passe sur l'épaule éclairée. */
const STRAP_D = 'M31.6 95.8C33.2 95.4 34.6 95 36.2 94.6C35.4 104.4 35 114.2 35 124H29C29.4 114.4 30.2 104.8 31.6 95.8Z';
const STRAP_LOOP = { x: 29, y: 106, width: 7, height: 4, rx: 1.6 };
/** Coin d'ardoise tenu contre la poitrine : cadre de bois, face d'ardoise, boucle de craie. */
const SLATE_FRAME = { x: 0, y: 0, width: 56, height: 40, rx: 6 };
const SLATE_FACE = { x: 5, y: 5, width: 46, height: 30, rx: 2 };
const SLATE_CHALK_D = 'M10 18.4C13.6 18.4 17.8 16 17.8 12.8C17.8 10.4 15.2 9.8 13.6 11.4C11.4 13.6 11.8 18.2 15 19.4C17.2 20.2 19.6 19.2 21.4 17.6';
const SLATE_TRANSFORM = 'translate(72 101) rotate(-14)';
/** Crayon derrière l'oreille droite (côté ombre), pointe vers l'arrière et le haut. */
const PENCIL_BODY_D = 'M2 -2H16V2H2C0.9 2 0 1.1 0 0C0 -1.1 0.9 -2 2 -2Z';
const PENCIL_WOOD_D = 'M16 -2L20 -1C21 -0.7 21 0.7 20 1L16 2Z';
const PENCIL_LEAD_D = 'M19 -1H20C21 -0.7 21 0.7 20 1H19Z';
const PENCIL_TRANSFORM = 'translate(84 54) rotate(-38)';

/** Lunettes rondes : monture 2,2 u, un éclat par verre. */
const GLASSES_D =
  'M39.4 58A8.6 8.6 0 1 1 56.6 58A8.6 8.6 0 1 1 39.4 58ZM63.4 58A8.6 8.6 0 1 1 80.6 58A8.6 8.6 0 1 1 63.4 58ZM56.6 56.4C58.8 54.8 61.2 54.8 63.4 56.4M40 56L32 55M80 56L88 55';
const GLASSES_GLINT_D = 'M41.8 55.1A6.8 6.8 0 0 1 44.1 52.4M65.8 55.1A6.8 6.8 0 0 1 68.1 52.4';
/** Appareil auditif contour d'oreille, côté lumière : boîtier derrière l'oreille + tube. */
const HEARING_AID_D = 'M28.6 51.8A6.6 8.6 0 0 0 23.6 60.4';
const HEARING_AID_TUBE_D = 'M28.6 51.8C30.8 51.4 32 53.6 31 56.2';
const STUDS_D =
  'M26.8 66.4A1.8 1.8 0 1 1 30.4 66.4A1.8 1.8 0 1 1 26.8 66.4ZM89.6 66.4A1.8 1.8 0 1 1 93.2 66.4A1.8 1.8 0 1 1 89.6 66.4Z';
const HOOPS_D = 'M26 69.2A2.6 2.6 0 1 1 31.2 69.2A2.6 2.6 0 1 1 26 69.2ZM88.8 69.2A2.6 2.6 0 1 1 94 69.2A2.6 2.6 0 1 1 88.8 69.2Z';
const NECKLACE_D =
  'M51.6 88.4A1.7 1.7 0 1 1 55 88.4A1.7 1.7 0 1 1 51.6 88.4ZM54.8 90.2A1.7 1.7 0 1 1 58.2 90.2A1.7 1.7 0 1 1 54.8 90.2ZM58.3 90.8A1.7 1.7 0 1 1 61.7 90.8A1.7 1.7 0 1 1 58.3 90.8ZM61.8 90.2A1.7 1.7 0 1 1 65.2 90.2A1.7 1.7 0 1 1 61.8 90.2ZM65 88.4A1.7 1.7 0 1 1 68.4 88.4A1.7 1.7 0 1 1 65 88.4Z';

/** Couche arrière : ce qui passe derrière l'oreille (crayon, boîtier d'appareil auditif). */
export function AccessoriesBack({ marker, accessories }: { marker: SchoolMarker; accessories: readonly AccessoryId[] }) {
  return (
    <>
      {marker === 'pencil' ? (
        <>
          <Path d={PENCIL_BODY_D} fill={illustration.fabric.saffron.base} transform={PENCIL_TRANSFORM} />
          <Path d={PENCIL_WOOD_D} fill={illustration.school.wood.light} transform={PENCIL_TRANSFORM} />
          <Path d={PENCIL_LEAD_D} fill={HAIR.base} transform={PENCIL_TRANSFORM} />
        </>
      ) : null}
      {accessories.includes('hearing-aid') ? (
        <Path d={HEARING_AID_D} stroke={illustration.fabric.sky.shade} strokeWidth={3.6} {...ROUND} />
      ) : null}
    </>
  );
}

/** Couche du buste : bretelle de cartable, coin d'ardoise, collier. */
export function AccessoriesBust({
  marker,
  accessories,
  strapColor,
  lod,
}: {
  marker: SchoolMarker;
  accessories: readonly AccessoryId[];
  strapColor: Ramp;
  lod: AvatarLod;
}) {
  return (
    <>
      {marker === 'strap' ? (
        <>
          <Path d={STRAP_D} fill={strapColor.base} />
          {lod === 'full' ? <Rect {...STRAP_LOOP} fill={strapColor.shade} /> : null}
        </>
      ) : null}
      {marker === 'slate' ? (
        <>
          <Rect {...SLATE_FRAME} fill={illustration.school.wood.base} transform={SLATE_TRANSFORM} />
          <Rect {...SLATE_FACE} fill={illustration.school.slate.base} transform={SLATE_TRANSFORM} />
          {lod === 'full' ? (
            <Path d={SLATE_CHALK_D} stroke={illustration.school.chalk} strokeWidth={2.2} transform={SLATE_TRANSFORM} {...ROUND} />
          ) : null}
        </>
      ) : null}
      {accessories.includes('bead-necklace') ? <Path d={NECKLACE_D} fill={GOLD.base} /> : null}
    </>
  );
}

/** Couche avant : lunettes, tube de l'appareil auditif, boucles d'oreilles. */
export function AccessoriesFront({ accessories, lod }: { accessories: readonly AccessoryId[]; lod: AvatarLod }) {
  return (
    <>
      {accessories.includes('glasses') ? (
        <>
          <Path d={GLASSES_D} stroke={illustration.fabric.sky.base} strokeWidth={2.2} {...ROUND} />
          {lod === 'full' ? <Path d={GLASSES_GLINT_D} stroke={WHITE} strokeWidth={1.4} {...ROUND} /> : null}
        </>
      ) : null}
      {accessories.includes('hearing-aid') ? (
        <Path d={HEARING_AID_TUBE_D} stroke={illustration.fabric.sky.shade} strokeWidth={1.4} {...ROUND} />
      ) : null}
      {accessories.includes('stud-earrings') ? <Path d={STUDS_D} fill={GOLD.base} /> : null}
      {accessories.includes('hoop-earrings') ? <Path d={HOOPS_D} stroke={GOLD.base} strokeWidth={1.4} {...ROUND} /> : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Disque de fond et motif ton sur ton
// ---------------------------------------------------------------------------

const MOTIF_WAVES_D = 'M5 78C9 75.4 13 75.4 17 78S25 80.6 29 78M3 87C7 84.4 11 84.4 15 87S23 89.6 27 87';
const MOTIF_DUNE_D = 'M0 90C9 83 21 81 33 85C38 86.6 42 89 45 92V120H0Z';

export function BackdropDisc({ backdrop, motif }: { backdrop: BackdropName; motif: BackdropMotif }) {
  const tone = illustration.backdropMotif[backdrop];
  return (
    <>
      <Circle cx={60} cy={60} r={60} fill={illustration.backdrop[backdrop]} />
      {motif === 'lake-wave' ? <Path d={MOTIF_WAVES_D} stroke={tone} strokeWidth={3} {...ROUND} /> : null}
      {motif === 'dune' ? <Path d={MOTIF_DUNE_D} fill={tone} /> : null}
      {motif === 'rising-sun' ? (
        <>
          <Path d={MOTIF_SUN_D} fill={tone} />
          <Path d={MOTIF_SUN_RAYS_D} stroke={tone} strokeWidth={3} {...ROUND} />
        </>
      ) : null}
      {motif === 'palm-fan' ? <Path d={MOTIF_PALM_FAN_D} stroke={tone} strokeWidth={2.4} {...ROUND} /> : null}
      {motif === 'acacia' ? (
        <>
          <Path d={MOTIF_ACACIA_STEM_D} stroke={tone} strokeWidth={2} {...ROUND} />
          <Path d={MOTIF_ACACIA_LEAVES_D} stroke={tone} strokeWidth={3} {...ROUND} />
        </>
      ) : null}
    </>
  );
}
