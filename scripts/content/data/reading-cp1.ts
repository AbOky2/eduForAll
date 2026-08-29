/**
 * Progression de lecture du CP1.
 *
 * L'inventaire des sons est celui du programme officiel (p. 23-24) ; l'ordre
 * est la mise en progression décrite dans official-program.ts
 * (READING_TEACHING_ORDER) : voyelles, puis consonnes continues, puis
 * occlusives, puis premières graphies composées.
 *
 * Règle tenue sur toute la liste : un mot n'apparaît que si toutes ses
 * lettres ont déjà été étudiées (déchiffrabilité), les finales muettes
 * usuelles du français exceptées. La vérification est automatique —
 * scripts/validate-content.ts échoue si la règle est rompue.
 */

export interface WordEntry {
  word: string;
  /** Découpage syllabique servant aux exercices de composition. */
  syllables: string[];
  /** Pictogramme, quand le mot est illustrable. */
  icon?: string;
  /** Où l'on entend le son étudié dans ce mot. */
  position?: 'debut' | 'milieu' | 'fin';
}

export interface SoundUnit {
  id: string;
  glyph: string;
  /** Titre enfant de la leçon. */
  name: string;
  kind: 'voyelle' | 'consonne' | 'son';
  /** Syllabes formées avec les voyelles déjà connues. */
  syllables: string[];
  words: WordEntry[];
  /** Phrase de fin de leçon, entièrement déchiffrable. */
  sentence: string;
  /** Semaine de classe. */
  week: number;
  officialReference: string;
}

const VOWEL_REF = 'Lecture CP — « 1) Voyelles simples : i, a, y, u, o, e, é, è, ê » (p. 23)';
const CONSONANT_REF =
  'Lecture CP — « 4) Consonnes : t, h, p, n, l, d, v, m, r, b, j, f, s, c, g, k, z, x, ch, w, qu » (p. 23)';
const OTHER_REF = 'Lecture CP — « Autres sons : ou, eu, an, oi, en, in, on, ai, ei, au » (p. 24)';

/** Trimestre 1 — les six voyelles qui ouvrent la combinatoire. */
export const CP1_VOWELS: SoundUnit[] = [
  {
    id: 'a',
    glyph: 'a',
    name: 'La lettre a',
    kind: 'voyelle',
    week: 1,
    syllables: [],
    officialReference: VOWEL_REF,
    words: [
      { word: 'arbre', syllables: ['ar', 'bre'], icon: 'icon-tree', position: 'debut' },
      { word: 'ami', syllables: ['a', 'mi'], icon: 'icon-friends', position: 'debut' },
      { word: 'chat', syllables: ['chat'], icon: 'icon-cat', position: 'milieu' },
      { word: 'papa', syllables: ['pa', 'pa'], icon: 'icon-father', position: 'milieu' },
    ],
    sentence: 'a a a',
  },
  {
    id: 'i',
    glyph: 'i',
    name: 'La lettre i',
    kind: 'voyelle',
    week: 2,
    syllables: [],
    officialReference: VOWEL_REF,
    words: [
      { word: 'lit', syllables: ['lit'], icon: 'icon-bed', position: 'milieu' },
      { word: 'ami', syllables: ['a', 'mi'], icon: 'icon-friends', position: 'fin' },
      { word: 'midi', syllables: ['mi', 'di'], position: 'fin' },
      { word: 'riz', syllables: ['riz'], icon: 'icon-rice', position: 'milieu' },
    ],
    sentence: 'i i i',
  },
  {
    id: 'o',
    glyph: 'o',
    name: 'La lettre o',
    kind: 'voyelle',
    week: 3,
    syllables: [],
    officialReference: VOWEL_REF,
    words: [
      { word: 'moto', syllables: ['mo', 'to'], icon: 'icon-moto', position: 'fin' },
      { word: 'dodo', syllables: ['do', 'do'], icon: 'icon-bed', position: 'fin' },
      { word: 'os', syllables: ['os'], position: 'debut' },
      { word: 'robe', syllables: ['robe'], icon: 'icon-boubou', position: 'milieu' },
    ],
    sentence: 'o o o',
  },
  {
    id: 'u',
    glyph: 'u',
    name: 'La lettre u',
    kind: 'voyelle',
    week: 4,
    syllables: [],
    officialReference: VOWEL_REF,
    words: [
      { word: 'lune', syllables: ['lu', 'ne'], icon: 'icon-moon', position: 'milieu' },
      { word: 'rue', syllables: ['rue'], icon: 'icon-road', position: 'milieu' },
      { word: 'jupe', syllables: ['ju', 'pe'], icon: 'icon-trousers', position: 'milieu' },
      { word: 'mule', syllables: ['mu', 'le'], position: 'milieu' },
    ],
    sentence: 'u u u',
  },
  {
    id: 'e',
    glyph: 'e',
    name: 'La lettre e',
    kind: 'voyelle',
    week: 5,
    syllables: [],
    officialReference: VOWEL_REF,
    words: [
      { word: 'melon', syllables: ['me', 'lon'], position: 'debut' },
      { word: 'petit', syllables: ['pe', 'tit'], position: 'debut' },
      { word: 'cheval', syllables: ['che', 'val'], icon: 'icon-donkey', position: 'milieu' },
      { word: 'venir', syllables: ['ve', 'nir'], position: 'debut' },
    ],
    sentence: 'e e e',
  },
  {
    id: 'é',
    glyph: 'é',
    name: 'La lettre é',
    kind: 'voyelle',
    week: 6,
    syllables: [],
    officialReference: VOWEL_REF,
    words: [
      { word: 'bébé', syllables: ['bé', 'bé'], icon: 'icon-baby', position: 'debut' },
      { word: 'école', syllables: ['é', 'cole'], icon: 'icon-school', position: 'debut' },
      { word: 'café', syllables: ['ca', 'fé'], position: 'fin' },
      { word: 'été', syllables: ['é', 'té'], icon: 'icon-sun', position: 'debut' },
    ],
    sentence: 'é é é',
  },
];

/** Trimestres 1-3 — les consonnes, chacune immédiatement fusionnée en syllabes. */
export const CP1_CONSONANTS: SoundUnit[] = [
  {
    id: 'l',
    glyph: 'l',
    name: 'La lettre l',
    kind: 'consonne',
    week: 7,
    syllables: ['la', 'le', 'li', 'lo', 'lu', 'lé'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'lit', syllables: ['lit'], icon: 'icon-bed', position: 'debut' },
      { word: 'lune', syllables: ['lu', 'ne'], icon: 'icon-moon', position: 'debut' },
      { word: 'école', syllables: ['é', 'co', 'le'], icon: 'icon-school', position: 'fin' },
      { word: 'lait', syllables: ['lait'], icon: 'icon-milk', position: 'debut' },
    ],
    sentence: 'Le lit est là.',
  },
  {
    id: 'm',
    glyph: 'm',
    name: 'La lettre m',
    kind: 'consonne',
    week: 8,
    syllables: ['ma', 'me', 'mi', 'mo', 'mu', 'mé'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'maman', syllables: ['ma', 'man'], icon: 'icon-mother', position: 'debut' },
      { word: 'moto', syllables: ['mo', 'to'], icon: 'icon-moto', position: 'debut' },
      { word: 'ami', syllables: ['a', 'mi'], icon: 'icon-friends', position: 'milieu' },
      { word: 'mil', syllables: ['mil'], icon: 'icon-millet', position: 'debut' },
    ],
    sentence: 'Ma maman a la moto.',
  },
  {
    id: 'r',
    glyph: 'r',
    name: 'La lettre r',
    kind: 'consonne',
    week: 9,
    syllables: ['ra', 're', 'ri', 'ro', 'ru', 'ré'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'riz', syllables: ['riz'], icon: 'icon-rice', position: 'debut' },
      { word: 'rue', syllables: ['rue'], icon: 'icon-road', position: 'debut' },
      { word: 'mari', syllables: ['ma', 'ri'], position: 'milieu' },
      { word: 'radio', syllables: ['ra', 'dio'], position: 'debut' },
    ],
    sentence: 'Le riz est dans la rue.',
  },
  {
    id: 's',
    glyph: 's',
    name: 'La lettre s',
    kind: 'consonne',
    week: 10,
    syllables: ['sa', 'se', 'si', 'so', 'su', 'sé'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'sel', syllables: ['sel'], position: 'debut' },
      { word: 'salade', syllables: ['sa', 'la', 'de'], icon: 'icon-salad', position: 'debut' },
      { word: 'savon', syllables: ['sa', 'von'], icon: 'icon-soap', position: 'debut' },
      { word: 'rose', syllables: ['ro', 'se'], icon: 'icon-flower', position: 'milieu' },
    ],
    sentence: 'Sali a le savon.',
  },
  {
    id: 'p',
    glyph: 'p',
    name: 'La lettre p',
    kind: 'consonne',
    week: 11,
    syllables: ['pa', 'pe', 'pi', 'po', 'pu', 'pé'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'papa', syllables: ['pa', 'pa'], icon: 'icon-father', position: 'debut' },
      { word: 'pied', syllables: ['pied'], icon: 'icon-foot', position: 'debut' },
      { word: 'pile', syllables: ['pi', 'le'], position: 'debut' },
      { word: 'pain', syllables: ['pain'], icon: 'icon-bread', position: 'debut' },
    ],
    sentence: 'Papa a le pain.',
  },
  {
    id: 't',
    glyph: 't',
    name: 'La lettre t',
    kind: 'consonne',
    week: 12,
    syllables: ['ta', 'te', 'ti', 'to', 'tu', 'té'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'tomate', syllables: ['to', 'ma', 'te'], icon: 'icon-tomato', position: 'debut' },
      { word: 'tête', syllables: ['tê', 'te'], icon: 'icon-head', position: 'debut' },
      { word: 'moto', syllables: ['mo', 'to'], icon: 'icon-moto', position: 'milieu' },
      { word: 'natte', syllables: ['nat', 'te'], icon: 'icon-mat', position: 'milieu' },
    ],
    sentence: 'La tomate est petite.',
  },
  {
    id: 'd',
    glyph: 'd',
    name: 'La lettre d',
    kind: 'consonne',
    week: 13,
    syllables: ['da', 'de', 'di', 'do', 'du', 'dé'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'dent', syllables: ['dent'], icon: 'icon-tooth', position: 'debut' },
      { word: 'salade', syllables: ['sa', 'la', 'de'], icon: 'icon-salad', position: 'fin' },
      { word: 'midi', syllables: ['mi', 'di'], position: 'milieu' },
      { word: 'dos', syllables: ['dos'], position: 'debut' },
    ],
    sentence: 'La salade est sur la natte.',
  },
  {
    id: 'b',
    glyph: 'b',
    name: 'La lettre b',
    kind: 'consonne',
    week: 14,
    syllables: ['ba', 'be', 'bi', 'bo', 'bu', 'bé'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'bébé', syllables: ['bé', 'bé'], icon: 'icon-baby', position: 'debut' },
      { word: 'bol', syllables: ['bol'], icon: 'icon-pot', position: 'debut' },
      { word: 'boubou', syllables: ['bou', 'bou'], icon: 'icon-boubou', position: 'debut' },
      { word: 'robe', syllables: ['ro', 'be'], position: 'fin' },
    ],
    sentence: 'Le bébé a un boubou.',
  },
  {
    id: 'n',
    glyph: 'n',
    name: 'La lettre n',
    kind: 'consonne',
    week: 15,
    syllables: ['na', 'ne', 'ni', 'no', 'nu', 'né'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'banane', syllables: ['ba', 'na', 'ne'], icon: 'icon-banana', position: 'milieu' },
      { word: 'lune', syllables: ['lu', 'ne'], icon: 'icon-moon', position: 'fin' },
      { word: 'natte', syllables: ['nat', 'te'], icon: 'icon-mat', position: 'debut' },
      { word: 'nez', syllables: ['nez'], icon: 'icon-nose', position: 'debut' },
    ],
    sentence: 'La banane est bonne.',
  },
  {
    id: 'f',
    glyph: 'f',
    name: 'La lettre f',
    kind: 'consonne',
    week: 16,
    syllables: ['fa', 'fe', 'fi', 'fo', 'fu', 'fé'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'farine', syllables: ['fa', 'ri', 'ne'], position: 'debut' },
      { word: 'café', syllables: ['ca', 'fé'], position: 'milieu' },
      { word: 'fil', syllables: ['fil'], position: 'debut' },
      { word: 'feu', syllables: ['feu'], position: 'debut' },
    ],
    sentence: 'La farine est dans le bol.',
  },
  {
    id: 'v',
    glyph: 'v',
    name: 'La lettre v',
    kind: 'consonne',
    week: 17,
    syllables: ['va', 've', 'vi', 'vo', 'vu', 'vé'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'vélo', syllables: ['vé', 'lo'], icon: 'icon-bicycle', position: 'debut' },
      { word: 'savon', syllables: ['sa', 'von'], icon: 'icon-soap', position: 'milieu' },
      { word: 'vache', syllables: ['va', 'che'], icon: 'icon-cow', position: 'debut' },
      { word: 'olive', syllables: ['o', 'li', 've'], position: 'fin' },
    ],
    sentence: 'La vache est là.',
  },
  {
    id: 'j',
    glyph: 'j',
    name: 'La lettre j',
    kind: 'consonne',
    week: 18,
    syllables: ['ja', 'je', 'ji', 'jo', 'ju', 'jé'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'jupe', syllables: ['ju', 'pe'], icon: 'icon-trousers', position: 'debut' },
      { word: 'joli', syllables: ['jo', 'li'], position: 'debut' },
      { word: 'jardin', syllables: ['jar', 'din'], icon: 'icon-field', position: 'debut' },
      { word: 'jeu', syllables: ['jeu'], icon: 'icon-ball', position: 'debut' },
    ],
    sentence: 'Le jardin est joli.',
  },
  {
    id: 'ch',
    glyph: 'ch',
    name: 'Le son ch',
    kind: 'consonne',
    week: 19,
    syllables: ['cha', 'che', 'chi', 'cho', 'chu'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'chat', syllables: ['chat'], icon: 'icon-cat', position: 'debut' },
      { word: 'vache', syllables: ['va', 'che'], icon: 'icon-cow', position: 'fin' },
      { word: 'cheval', syllables: ['che', 'val'], icon: 'icon-donkey', position: 'debut' },
      { word: 'chèvre', syllables: ['chè', 'vre'], icon: 'icon-goat', position: 'debut' },
    ],
    sentence: 'Le chat est sur la natte.',
  },
  {
    id: 'c',
    glyph: 'c',
    name: 'La lettre c',
    kind: 'consonne',
    week: 20,
    syllables: ['ca', 'co', 'cu', 'cé', 'ci'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'case', syllables: ['ca', 'se'], icon: 'icon-hut', position: 'debut' },
      { word: 'école', syllables: ['é', 'co', 'le'], icon: 'icon-school', position: 'milieu' },
      { word: 'canari', syllables: ['ca', 'na', 'ri'], icon: 'icon-jar', position: 'debut' },
      { word: 'sac', syllables: ['sac'], icon: 'icon-satchel', position: 'fin' },
    ],
    sentence: 'La case de papa est là.',
  },
  {
    id: 'g',
    glyph: 'g',
    name: 'La lettre g',
    kind: 'consonne',
    week: 21,
    syllables: ['ga', 'go', 'gu', 'gé', 'gi'],
    officialReference: CONSONANT_REF,
    words: [
      { word: 'gomme', syllables: ['gom', 'me'], position: 'debut' },
      { word: 'figue', syllables: ['fi', 'gue'], position: 'milieu' },
      { word: 'légume', syllables: ['lé', 'gu', 'me'], icon: 'icon-salad', position: 'milieu' },
      { word: 'gare', syllables: ['ga', 're'], icon: 'icon-bus', position: 'debut' },
    ],
    sentence: 'La gomme est dans le sac.',
  },
];

/** Trimestre 3 — les deux premières graphies composées du CP1. */
export const CP1_SOUNDS: SoundUnit[] = [
  {
    id: 'ou',
    glyph: 'ou',
    name: 'Le son ou',
    kind: 'son',
    week: 22,
    syllables: ['bou', 'cou', 'dou', 'fou', 'lou', 'mou', 'nou', 'pou', 'rou', 'sou', 'tou'],
    officialReference: OTHER_REF,
    words: [
      { word: 'poule', syllables: ['pou', 'le'], icon: 'icon-hen', position: 'milieu' },
      { word: 'loup', syllables: ['loup'], icon: 'icon-wolf', position: 'milieu' },
      { word: 'mouton', syllables: ['mou', 'ton'], icon: 'icon-sheep', position: 'milieu' },
      { word: 'boubou', syllables: ['bou', 'bou'], icon: 'icon-boubou', position: 'milieu' },
    ],
    sentence: 'Le mouton et la poule sont là.',
  },
  {
    id: 'oi',
    glyph: 'oi',
    name: 'Le son oi',
    kind: 'son',
    week: 23,
    syllables: ['boi', 'foi', 'joi', 'loi', 'moi', 'noi', 'poi', 'roi', 'soi', 'toi', 'voi'],
    officialReference: OTHER_REF,
    words: [
      { word: 'roi', syllables: ['roi'], icon: 'icon-king', position: 'fin' },
      { word: 'bois', syllables: ['bois'], icon: 'icon-wood', position: 'milieu' },
      { word: 'poisson', syllables: ['pois', 'son'], icon: 'icon-fish', position: 'milieu' },
      { word: 'noir', syllables: ['noir'], position: 'milieu' },
    ],
    sentence: 'Le roi a le poisson.',
  },
];

export const CP1_READING_UNITS = [...CP1_VOWELS, ...CP1_CONSONANTS, ...CP1_SOUNDS];
