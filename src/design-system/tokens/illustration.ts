/**
 * Jetons d'illustration — la palette des DESSINS (avatars, badges, scènes,
 * illustrations de discipline, logo). Elle prolonge la palette UI « Premium
 * Sahelian » (`colors.ts`) : mêmes terres, même bleu pétrole, même or, plus
 * ce qu'une interface n'a pas — des peaux, des cheveux, des tissus, un ciel.
 *
 * Une seule lumière pour toute l'app : le soleil vient d'en haut à gauche.
 * Chaque teinte est donc une rampe à trois tons — `light` (face éclairée),
 * `base`, `shade` (face à l'ombre) — et un dessin n'invente jamais un
 * quatrième ton. C'est ce qui fait qu'avatars, badges et scènes semblent
 * sortis de la même main.
 *
 * Voir design/brief-identite-v2.md § 5. Aucune couleur en dur dans les
 * dessins : tout passe par ce fichier.
 */

/** Rampe à trois tons, lumière en haut à gauche. */
export interface Ramp {
  readonly light: string;
  readonly base: string;
  readonly shade: string;
}

/**
 * Peaux : six rampes, de la plus foncée à la plus claire, pour que chaque
 * enfant du Tchad — du Logone au Tibesti — trouve la sienne. Valeurs du
 * dossier de recherche (design/recherche-design-v2.md), à revalider sur des
 * photos d'enfants tchadiens avant de les figer.
 *
 * - `shade` est plus chaud et plus saturé que la base, jamais plus gris : une
 *   peau foncée ombrée au gris devient terne, ombrée au brun-rouge elle vit.
 * - `light` (reflets : front, pommette, bout du nez) reste pêche/or.
 * - `lip` : les lèvres restent dans la famille rouge-brun de la peau — jamais
 *   de rouge ni de rose (marqueur de caricature documenté).
 * - `bounce` : lumière chaude renvoyée sur la mâchoire côté ombre.
 * - `blush` : joues, PRÉMÉLANGÉ (#e2725b à 30 % sur la base) — pas d'opacité.
 *
 * Sur `ebene` et `cacao`, le noir des cheveux ne contraste qu'à 1,3–1,7:1
 * avec la peau : la racine des cheveux se dessine par le reflet du front,
 * pas par une bande d'ombre.
 */
export const skinTones = {
  ebene: {
    light: '#825c46',
    base: '#46261c',
    shade: '#361712',
    lip: '#3c1614',
    bounce: '#652616',
    blush: '#753d2f',
  },
  cacao: {
    light: '#956a4c',
    base: '#5c3322',
    shade: '#491f17',
    lip: '#521f19',
    bounce: '#7b3117',
    blush: '#844633',
  },
  acajou: {
    light: '#a7764e',
    base: '#723f25',
    shade: '#5c2718',
    lip: '#68261b',
    bounce: '#913b15',
    blush: '#944e35',
  },
  cannelle: {
    light: '#bd8c5a',
    base: '#8c532f',
    shade: '#72361f',
    lip: '#823524',
    bounce: '#ab4e1b',
    blush: '#a65c3c',
  },
  miel: {
    light: '#d5a76d',
    base: '#a86d3f',
    shade: '#8a4a2c',
    lip: '#9e4b32',
    bounce: '#c76727',
    blush: '#b96e47',
  },
  sable: {
    light: '#edc690',
    base: '#c48c5c',
    shade: '#a36443',
    lip: '#ba694c',
    bounce: '#e38742',
    blush: '#cd845c',
  },
} as const satisfies Record<string, Ramp & { lip: string; bounce: string; blush: string }>;

export type SkinTone = keyof typeof skinTones;

export const illustration = {
  /** Encre : pupilles, rares traits. Celle de l'UI, pour que tout s'accorde. */
  ink: '#161a32',
  white: '#ffffff',

  skin: skinTones,

  /** Cheveux : un noir chaud, et son reflet (jamais un gris, jamais #000). */
  hair: { light: '#4a362e', base: '#1f1614', shade: '#120c0b' } satisfies Ramp,

  face: {
    /** Œil : une seule forme presque noire, chaude, sans blanc cerclé. */
    eye: '#140d0d',
    catchlight: '#ffffff',
    /** Bouche ouverte (joie). */
    mouth: '#3a1416',
    tongue: '#d46a5a',
    teeth: '#fffaf2',
  },

  /** Tissus — boubous, pagnes, chemises, foulards. */
  fabric: {
    indigo: { light: '#4a86ab', base: '#2b6485', shade: '#1d4a64' },
    terracotta: { light: '#e58b5c', base: '#c96f3f', shade: '#a2522a' },
    saffron: { light: '#ffcf6b', base: '#f2ad3a', shade: '#cc8a1f' },
    sage: { light: '#a5c690', base: '#7fa56b', shade: '#5d8250' },
    plum: { light: '#b184c2', base: '#8f5ea8', shade: '#6c4384' },
    sky: { light: '#d4edff', base: '#a3d8fe', shade: '#6fb8e6' },
    sand: { light: '#f5cfa5', base: '#e0b184', shade: '#c08c58' },
    rose: { light: '#f6b2a8', base: '#e8877d', shade: '#c6655c' },
    /** La tenue kaki des écoles publiques. */
    khaki: { light: '#e0cf9f', base: '#c9b27a', shade: '#a38d58' },
    cream: { light: '#ffffff', base: '#fbf3e4', shade: '#e9d9bd' },
    night: { light: '#4b4f72', base: '#2b2e48', shade: '#1d1f33' },
    /**
     * Le vrai indigo des teinturiers du Sahel (bleu profond tirant sur le
     * violet), distinct du bleu pétrole de `indigo` : le boubou de l'avatar 11
     * ne doit pas se confondre avec la chemise d'écolier de l'avatar 1.
     * Équipe personnages.
     */
    indigoDye: { light: '#5b6db0', base: '#3a4a8c', shade: '#29346a' },
  } satisfies Record<string, Ramp>,

  /** Disques de fond des avatars : les « containers » doux de l'UI. */
  backdrop: {
    sky: '#c7e7ff',
    sand: '#ffdcbd',
    sun: '#ffe7a8',
    mint: '#cfeec4',
    lavender: '#e2e1ff',
    rose: '#fbd9d3',
  },

  /**
   * Motif ton sur ton des disques d'avatar (vague du lac, dune, soleil levant,
   * brin d'acacia, éventail de rônier) : chaque disque PRÉMÉLANGÉ à 14 % vers
   * un ton plus profond de sa propre famille, soit ≈ 1,08–1,12:1 de contraste
   * avec le disque — on le devine, il ne parle pas (brief § 8.1). Mêmes clés
   * que `backdrop`. Équipe personnages.
   */
  backdropMotif: {
    sky: '#b6ddf9',
    sand: '#f9d2af',
    sun: '#fcde97',
    mint: '#c2e3b5',
    lavender: '#d6d4fa',
    rose: '#f6cbc5',
  },

  /** Le paysage : ciel chaud, dunes, acacia, soleil. */
  nature: {
    skyHigh: '#fdf4e3',
    sky: '#fbe9cc',
    skyCool: '#d9eefc',
    sun: '#ffd166',
    sunGlow: '#ffe7a3',
    sunDeep: '#f2b13d',
    dune: { light: '#f4dcb8', base: '#e8c290', shade: '#d4a373' } satisfies Ramp,
    duneDeep: '#b98955',
    acacia: { light: '#94b36c', base: '#6f9050', shade: '#557339' } satisfies Ramp,
    /**
     * Vert tendre de la jeune pousse et de la réussite (pictogrammes `sprout`
     * et `check` en mode couleur). Plus frais que l'acacia, qui grisaille en
     * petit. Coche blanche sur `base` : 3,75:1 ; `shade` sur blanc : 5,08:1.
     * Équipe icônes.
     */
    sprout: { light: '#7cbf62', base: '#4a9440', shade: '#3e7c33' } satisfies Ramp,
    bark: { light: '#9a6c3c', base: '#7d562d', shade: '#5b3912' } satisfies Ramp,
    grass: '#a3bf6f',
    earth: '#c58f5d',
    water: '#86c5e3',
    night: '#2b2e48',
    nightDeep: '#1d1f33',
    starlight: '#ffe9a3',
    /**
     * Le soir (OfflineReadyScene, « Fonctionne sans connexion ») : un seul
     * dégradé de ciel — bleu de l'heure bleue en haut, rose poudré, abricot à
     * l'horizon ; jamais un violet saturé — et ce que la lumière basse fait du
     * paysage : `dune.light` les dunes lointaines, `dune.base` le sol proche,
     * `dune.shade` les silhouettes d'acacia sur l'horizon. Niveaux de gris :
     * ciel ≈ 45 → 70 → 84 L*, l'étoile `starlight` reste lisible en haut.
     * Équipe décors.
     */
    dusk: {
      skyHigh: '#5e6b9b',
      skyMid: '#d79f9c',
      skyLow: '#f8cb98',
      dune: { light: '#c98f78', base: '#a9715c', shade: '#9a6553' } satisfies Ramp,
    },
  },

  /** Objets d'école. */
  school: {
    wood: { light: '#d9a874', base: '#b98350', shade: '#93622f' } satisfies Ramp,
    slate: { light: '#44545e', base: '#2f3d45', shade: '#222d33' } satisfies Ramp,
    chalk: '#f4f1e8',
    paper: { light: '#ffffff', base: '#fdf6e9', shade: '#f0e2c8' } satisfies Ramp,
    clay: { light: '#e39a6c', base: '#c97a4a', shade: '#a65e33' } satisfies Ramp,
  },

  /** Médailles. */
  metal: {
    gold: { light: '#fff0b3', base: '#f2c40d', shade: '#c99a06' } satisfies Ramp,
    bronze: { light: '#f2bd91', base: '#cd8a57', shade: '#a0653a' } satisfies Ramp,
  },

  /** Le reflet « grain de soleil » posé en haut à gauche des volumes ronds. */
  sheen: '#fffaf0',

  /**
   * Marque (logo, icône d'app, mot-symbole). Valeurs de départ du dossier de
   * recherche ; l'équipe marque les affine et en reste propriétaire.
   */
  brand: {
    goldTop: '#ffd978',
    goldBottom: '#f2b13f',
    wood: '#9a5d2a',
    woodShade: '#7a4519',
    slate: '#1d3a4c',
    chalk: '#fbf3e4',
    wordmark: '#3d2a17',
  },

  /**
   * Marque, piste B « L'éléphanteau-livre » (finaliste du jury, brief § 11.1).
   * Équipe marque B ; à retirer si la piste A l'emporte et qu'on ne garde pas
   * l'éléphanteau comme mascotte. Les pages sont `fabric.cream.base` (gauche,
   * côté lumière) et `fabric.sand.base` (droite, côté ombre), le fond
   * `brand.goldTop` → `brand.goldBottom`.
   */
  elephanteau: {
    /**
     * Peau « taupe chaud » : un gris d'éléphant réchauffé par la poussière de
     * latérite (les éléphants de Zakouma se roulent dans la terre rouge).
     * `base` garde ≥ 2,2:1 contre `brand.goldBottom` et la page sable, pour
     * que la silhouette tienne à 29 px et en niveaux de gris.
     */
    skin: { light: '#aa9588', base: '#8d7567', shade: '#74594e' } satisfies Ramp,
    /** Lignes de texte des pages, ton sur ton (≈ 1,1:1 avec leur page). */
    lineOnCream: '#f1e5ce',
    lineOnSand: '#d6a676',
  },
} as const;

export type FabricName = keyof typeof illustration.fabric;
export type BackdropName = keyof typeof illustration.backdrop;
