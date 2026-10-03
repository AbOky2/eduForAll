/**
 * La distribution — douze enfants du Tchad, du lac au Tibesti et au Logone
 * (design/brief-identite-v2.md § 8.3). Six filles, six garçons ; chaque peau
 * portée par une fille et un garçon ; aucun marqueur religieux ; les indices
 * régionaux (jalabiya, boubou, foulard noué, pagne) décorrélés de la peau.
 *
 * Les quatre premiers descendent des anciens avatars (même genre, même
 * couleur dominante) : un profil créé avant la refonte garde un enfant
 * proche de celui qu'il avait choisi. Les invariants sont verrouillés par
 * `avatar-cast.test.ts`.
 */
import type { BackdropName, SkinTone } from '@/design-system/tokens';

import type {
  AccessoryId,
  BackdropMotif,
  BrowShape,
  GarmentId,
  HairStyleId,
  NoseShape,
  SchoolMarker,
} from './avatar-parts';

export const AVATAR_ART_IDS = [
  'avatar-1',
  'avatar-2',
  'avatar-3',
  'avatar-4',
  'avatar-5',
  'avatar-6',
  'avatar-7',
  'avatar-8',
  'avatar-9',
  'avatar-10',
  'avatar-11',
  'avatar-12',
] as const;
export type AvatarArtId = (typeof AVATAR_ART_IDS)[number];

export type AvatarGender = 'girl' | 'boy';

export interface AvatarArt {
  readonly id: AvatarArtId;
  readonly gender: AvatarGender;
  readonly skin: SkinTone;
  readonly hair: HairStyleId;
  readonly garment: GarmentId;
  readonly backdrop: BackdropName;
  /** Un seul marqueur d'écolier par enfant. */
  readonly marker: SchoolMarker;
  readonly accessories: readonly AccessoryId[];
  /** La forme du visage varie aussi, pas seulement la couleur (sourcils, nez). */
  readonly brows: BrowShape;
  readonly nose: NoseShape;
}

/** Un motif par famille de disque : on reconnaît un paysage, jamais un logo. */
export const BACKDROP_MOTIFS: Record<BackdropName, BackdropMotif> = {
  sky: 'lake-wave',
  sand: 'dune',
  sun: 'rising-sun',
  mint: 'acacia',
  lavender: 'palm-fan',
  rose: 'rising-sun',
};

export const AVATAR_CAST: readonly AvatarArt[] = [
  {
    id: 'avatar-1',
    gender: 'boy',
    skin: 'cacao',
    hair: 'side-part',
    garment: 'school-shirt',
    backdrop: 'sky',
    marker: 'strap',
    accessories: [],
    brows: 'straight',
    nose: 'broad',
  },
  {
    id: 'avatar-2',
    gender: 'girl',
    skin: 'acajou',
    hair: 'puffs',
    garment: 'pagne-dress',
    backdrop: 'sun',
    marker: 'slate',
    accessories: ['stud-earrings'],
    brows: 'arch',
    nose: 'round',
  },
  {
    id: 'avatar-3',
    gender: 'boy',
    skin: 'miel',
    hair: 'mini-afro',
    garment: 'jalabiya',
    backdrop: 'sand',
    marker: 'strap',
    accessories: [],
    brows: 'lifted',
    nose: 'broad',
  },
  {
    id: 'avatar-4',
    gender: 'girl',
    skin: 'miel',
    hair: 'cornrow-braids',
    garment: 'plain-top',
    backdrop: 'lavender',
    marker: 'pencil',
    accessories: [],
    brows: 'round',
    nose: 'button',
  },
  {
    id: 'avatar-5',
    gender: 'girl',
    skin: 'sable',
    hair: 'knotted-scarf',
    garment: 'claudine-dress',
    backdrop: 'sun',
    marker: 'slate',
    accessories: ['hoop-earrings'],
    brows: 'arch',
    nose: 'button',
  },
  {
    id: 'avatar-6',
    gender: 'boy',
    skin: 'ebene',
    hair: 'round-afro',
    garment: 'polo',
    backdrop: 'sky',
    marker: 'strap',
    accessories: ['glasses'],
    brows: 'arch',
    nose: 'round',
  },
  {
    id: 'avatar-7',
    gender: 'girl',
    skin: 'cacao',
    hair: 'natural-afro',
    garment: 'school-dress',
    backdrop: 'lavender',
    marker: 'pencil',
    accessories: ['bead-necklace'],
    brows: 'round',
    nose: 'round',
  },
  {
    id: 'avatar-8',
    gender: 'boy',
    skin: 'acajou',
    hair: 'bucket-hat',
    garment: 'striped-tshirt',
    backdrop: 'sun',
    marker: 'slate',
    accessories: [],
    brows: 'straight',
    nose: 'broad',
  },
  {
    id: 'avatar-9',
    gender: 'girl',
    skin: 'ebene',
    hair: 'side-loops',
    garment: 'embroidered-dress',
    backdrop: 'sand',
    marker: 'strap',
    accessories: [],
    brows: 'lifted',
    nose: 'broad',
  },
  {
    id: 'avatar-10',
    gender: 'boy',
    skin: 'cannelle',
    hair: 'shaved-line',
    garment: 'checked-shirt',
    backdrop: 'mint',
    marker: 'pencil',
    accessories: ['hearing-aid'],
    brows: 'lifted',
    nose: 'round',
  },
  {
    id: 'avatar-11',
    gender: 'girl',
    skin: 'cannelle',
    hair: 'crown-bun',
    garment: 'boubou-top',
    backdrop: 'sky',
    marker: 'strap',
    accessories: [],
    brows: 'arch',
    nose: 'broad',
  },
  {
    id: 'avatar-12',
    gender: 'boy',
    skin: 'sable',
    hair: 'soft-curls',
    garment: 'pocket-tshirt',
    backdrop: 'mint',
    marker: 'pencil',
    accessories: [],
    brows: 'round',
    nose: 'broad',
  },
];

const BY_ID = new Map<string, AvatarArt>(AVATAR_CAST.map((art) => [art.id, art]));

/** L'enfant dessiné pour un identifiant ; un identifiant inconnu donne avatar-1, jamais un crash. */
export function avatarArt(avatarId: string): AvatarArt {
  return BY_ID.get(avatarId) ?? (AVATAR_CAST[0] as AvatarArt);
}
