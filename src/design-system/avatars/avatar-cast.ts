/**
 * La distribution — douze enfants du Tchad, du lac au Tibesti et au Logone
 * (design/brief-identite-v2.md § 8.3). Six filles, six garçons ; chaque peau
 * portée par une fille et un garçon ; aucun marqueur religieux ; les indices
 * régionaux (jalabiya, boubou, foulard noué, pagne) décorrélés de la peau.
 *
 * Les quatre premiers descendent des anciens avatars (même genre, même
 * couleur dominante) : un profil créé avant la refonte garde un enfant
 * proche de celui qu'il avait choisi.
 *
 * Chacun a son visage (tête, yeux, bouche) et son disque, répartis selon
 * l'ordre d'affichage de la grille (3, 4 ou 6 colonnes) : deux voisins n'ont
 * jamais ni la même tête ni le même disque. Avec trois formes de tête, c'est
 * impossible à la fois en 3 et en 4 colonnes (la contrainte forme un graphe
 * qui n'est pas 3-coloriable) — d'où la quatrième, la tête joufflue, chaque
 * forme servant trois fois. Les invariants sont verrouillés par
 * `avatar-cast.test.ts`.
 */
import type {
  PortraitAccessory as AccessoryId,
  PortraitBackdrop as BackdropName,
  PortraitBrow as BrowShape,
  PortraitEyes as EyeShape,
  PortraitGarment as GarmentId,
  PortraitHair as HairStyleId,
  PortraitHeadShape as HeadShape,
  PortraitMouth as MouthShape,
  PortraitNose as NoseShape,
  PortraitSkin as SkinTone,
} from './portrait';

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
  readonly accessories: readonly AccessoryId[];
  /**
   * Le visage propre de chacun : forme de tête, regard, bouche au calme.
   * Deux voisins de la grille n'ont jamais la même tête, et aucun couple ne
   * partage la même combinaison tête + yeux + bouche.
   */
  readonly head: HeadShape;
  readonly eyes: EyeShape;
  readonly mouth: MouthShape;
  /** Sourcils et nez varient aussi. */
  readonly brows: BrowShape;
  readonly nose: NoseShape;
}

export const AVATAR_CAST: readonly AvatarArt[] = [
  {
    id: 'avatar-1',
    gender: 'boy',
    skin: 'cacao',
    hair: 'side-part',
    garment: 'school-shirt',
    backdrop: 'rose',
    accessories: [],
    head: 'oval',
    eyes: 'round',
    mouth: 'small',
    brows: 'straight',
    nose: 'broad',
  },
  {
    id: 'avatar-2',
    gender: 'girl',
    skin: 'acajou',
    hair: 'puffs',
    garment: 'pagne-dress',
    backdrop: 'sky',
    accessories: ['stud-earrings'],
    head: 'round',
    eyes: 'wide',
    mouth: 'smile',
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
    accessories: [],
    head: 'oval',
    eyes: 'almond',
    mouth: 'smile',
    brows: 'lifted',
    nose: 'broad',
  },
  {
    id: 'avatar-4',
    gender: 'girl',
    skin: 'miel',
    hair: 'cornrow-braids',
    garment: 'plain-top',
    backdrop: 'sky',
    accessories: [],
    head: 'cheeky',
    eyes: 'round',
    mouth: 'smile',
    brows: 'round',
    nose: 'button',
  },
  {
    id: 'avatar-5',
    gender: 'girl',
    skin: 'sable',
    hair: 'knotted-scarf',
    garment: 'claudine-dress',
    backdrop: 'lavender',
    accessories: ['hoop-earrings'],
    head: 'long',
    eyes: 'almond',
    mouth: 'crescent',
    brows: 'arch',
    nose: 'button',
  },
  {
    id: 'avatar-6',
    gender: 'boy',
    skin: 'ebene',
    hair: 'round-afro',
    garment: 'polo',
    backdrop: 'rose',
    accessories: ['glasses'],
    head: 'cheeky',
    eyes: 'wide',
    mouth: 'crescent',
    brows: 'arch',
    nose: 'round',
  },
  {
    id: 'avatar-7',
    gender: 'girl',
    skin: 'cacao',
    hair: 'natural-afro',
    garment: 'school-dress',
    backdrop: 'sun',
    accessories: ['bead-necklace'],
    head: 'round',
    eyes: 'almond',
    mouth: 'crescent',
    brows: 'round',
    nose: 'round',
  },
  {
    id: 'avatar-8',
    gender: 'boy',
    skin: 'acajou',
    hair: 'bucket-hat',
    garment: 'striped-tshirt',
    backdrop: 'mint',
    accessories: [],
    head: 'oval',
    eyes: 'wide',
    mouth: 'crescent',
    brows: 'straight',
    nose: 'broad',
  },
  {
    id: 'avatar-9',
    gender: 'girl',
    skin: 'ebene',
    hair: 'side-loops',
    garment: 'embroidered-dress',
    backdrop: 'sun',
    accessories: [],
    head: 'round',
    eyes: 'round',
    mouth: 'small',
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
    accessories: ['hearing-aid'],
    head: 'long',
    eyes: 'wide',
    mouth: 'small',
    brows: 'lifted',
    nose: 'round',
  },
  {
    id: 'avatar-11',
    gender: 'girl',
    skin: 'cannelle',
    hair: 'crown-bun',
    garment: 'boubou-top',
    backdrop: 'sand',
    accessories: [],
    head: 'cheeky',
    eyes: 'almond',
    mouth: 'small',
    brows: 'arch',
    nose: 'broad',
  },
  {
    id: 'avatar-12',
    gender: 'boy',
    skin: 'sable',
    hair: 'soft-curls',
    garment: 'pocket-tshirt',
    backdrop: 'lavender',
    accessories: [],
    head: 'long',
    eyes: 'round',
    mouth: 'smile',
    brows: 'round',
    nose: 'broad',
  },
];

const BY_ID = new Map<string, AvatarArt>(AVATAR_CAST.map((art) => [art.id, art]));

/** L'enfant dessiné pour un identifiant ; un identifiant inconnu donne avatar-1, jamais un crash. */
export function avatarArt(avatarId: string): AvatarArt {
  return BY_ID.get(avatarId) ?? (AVATAR_CAST[0] as AvatarArt);
}
