/**
 * Progression de lecture du CP2.
 *
 * Reprend l'inventaire officiel là où le CP1 s'arrête (p. 23-24) : consonnes
 * restantes, voyelles nasales, groupes consonantiques, syllabes inverses et
 * équivalences graphémiques. Chaque unité cite le passage du programme dont
 * elle est tirée.
 */
import type { WordEntry } from './reading-cp1';

export interface Cp2Unit {
  id: string;
  glyph: string;
  name: string;
  kind: 'consonne' | 'nasale' | 'groupe' | 'son' | 'inverse' | 'equivalence';
  /** Graphies réunies dans la même leçon (une seule leçon par famille). */
  variants: string[];
  syllables: string[];
  words: WordEntry[];
  sentence: string;
  week: number;
  officialReference: string;
}

const CONSONANT_REF = 'Lecture CP — « 4) Consonnes : […] c, g, k, z, x, ch, w, qu » (p. 23)';
const NASAL_REF =
  'Lecture CP — « 2) Voyelles nasales : in, ain, ein, un, um, an, en, on, om » (p. 23)';
const CLUSTER_REF =
  'Lecture CP — « bl, pl, cl, fl, br, cr, vr, fr, dr, pr, gr, gn, gu, tr » (p. 24)';
const OTHER_REF = 'Lecture CP — « Autres sons : ou, eu, an, oi, en, in, on, ai, ei, au » (p. 24)';
const REVERSE_REF =
  'Lecture CP — « ac, or, ir, ur, il, al, el, ec, oc, es, er, ar, as, oeur, eur, oir, air, ic » (p. 24)';
const EQUIV_REF =
  'Lecture CP — « o = au = eau ; eu = oeu ; é = et = ez = ed = er ; è = ei = ai = est ; an = en = am = em ; on = om ; c = s = ç ; s = z ; g = j » (p. 24)';

/** Trimestre 1 — consonnes restantes de l'inventaire, puis voyelles nasales. */
export const CP2_TERM1: Cp2Unit[] = [
  {
    id: 'k-qu',
    glyph: 'k',
    name: 'Les lettres k et qu',
    kind: 'consonne',
    variants: ['k', 'qu'],
    syllables: ['ka', 'ki', 'ko', 'que', 'qui', 'quoi'],
    week: 1,
    officialReference: CONSONANT_REF,
    words: [
      { word: 'kilo', syllables: ['ki', 'lo'], icon: 'icon-scale', position: 'debut' },
      { word: 'quatre', syllables: ['qua', 'tre'], position: 'debut' },
      {
        word: 'moustique',
        syllables: ['mous', 'ti', 'que'],
        icon: 'icon-mosquito',
        position: 'fin',
      },
      { word: 'képi', syllables: ['ké', 'pi'], icon: 'icon-hat', position: 'debut' },
    ],
    sentence: 'Le moustique est sur le képi.',
  },
  {
    id: 'z-x',
    glyph: 'z',
    name: 'Les lettres z et x',
    kind: 'consonne',
    variants: ['z', 'x'],
    syllables: ['za', 'ze', 'zi', 'zo', 'zu'],
    week: 2,
    officialReference: CONSONANT_REF,
    words: [
      { word: 'zébu', syllables: ['zé', 'bu'], icon: 'icon-cow', position: 'debut' },
      { word: 'riz', syllables: ['riz'], icon: 'icon-rice', position: 'fin' },
      { word: 'taxi', syllables: ['ta', 'xi'], icon: 'icon-car', position: 'milieu' },
      { word: 'douze', syllables: ['dou', 'ze'], position: 'fin' },
    ],
    sentence: 'Le zébu boit dans le puits.',
  },
  {
    id: 'w-y-h',
    glyph: 'h',
    name: 'Les lettres h, w et y',
    kind: 'consonne',
    variants: ['h', 'w', 'y'],
    syllables: ['ha', 'he', 'hi', 'ho', 'ya', 'yo'],
    week: 3,
    officialReference: CONSONANT_REF,
    words: [
      { word: 'hibou', syllables: ['hi', 'bou'], icon: 'icon-bird', position: 'debut' },
      { word: 'hôpital', syllables: ['hô', 'pi', 'tal'], icon: 'icon-hospital', position: 'debut' },
      { word: 'wagon', syllables: ['wa', 'gon'], icon: 'icon-cart', position: 'debut' },
      { word: 'crayon', syllables: ['cra', 'yon'], icon: 'icon-pencil', position: 'milieu' },
    ],
    sentence: 'Le hibou est dans le baobab.',
  },
  {
    id: 'an',
    glyph: 'an',
    name: 'Le son an',
    kind: 'nasale',
    variants: ['an', 'en', 'am', 'em'],
    syllables: ['ban', 'dan', 'lan', 'man', 'pan', 'ran', 'tan', 'van'],
    week: 4,
    officialReference: NASAL_REF,
    words: [
      { word: 'enfant', syllables: ['en', 'fant'], icon: 'icon-baby', position: 'fin' },
      { word: 'banane', syllables: ['ba', 'na', 'ne'], icon: 'icon-banana', position: 'debut' },
      { word: 'dent', syllables: ['dent'], icon: 'icon-tooth', position: 'fin' },
      { word: 'champ', syllables: ['champ'], icon: 'icon-field', position: 'fin' },
    ],
    sentence: 'L’enfant marche dans le champ.',
  },
  {
    id: 'on',
    glyph: 'on',
    name: 'Le son on',
    kind: 'nasale',
    variants: ['on', 'om'],
    syllables: ['bon', 'con', 'don', 'fon', 'lon', 'mon', 'pon', 'son', 'ton'],
    week: 5,
    officialReference: NASAL_REF,
    words: [
      { word: 'mouton', syllables: ['mou', 'ton'], icon: 'icon-sheep', position: 'fin' },
      { word: 'savon', syllables: ['sa', 'von'], icon: 'icon-soap', position: 'fin' },
      { word: 'poisson', syllables: ['pois', 'son'], icon: 'icon-fish', position: 'fin' },
      { word: 'melon', syllables: ['me', 'lon'], position: 'fin' },
    ],
    sentence: 'Le mouton mange le melon.',
  },
  {
    id: 'in',
    glyph: 'in',
    name: 'Le son in',
    kind: 'nasale',
    variants: ['in', 'ain', 'ein', 'aim'],
    syllables: ['bin', 'din', 'fin', 'lin', 'min', 'pin', 'rin', 'tin', 'vin'],
    week: 6,
    officialReference: NASAL_REF,
    words: [
      { word: 'pain', syllables: ['pain'], icon: 'icon-bread', position: 'fin' },
      { word: 'main', syllables: ['main'], icon: 'icon-hand', position: 'fin' },
      { word: 'jardin', syllables: ['jar', 'din'], icon: 'icon-field', position: 'fin' },
      { word: 'lapin', syllables: ['la', 'pin'], icon: 'icon-dog', position: 'fin' },
    ],
    sentence: 'Ma main prend le pain.',
  },
  {
    id: 'un',
    glyph: 'un',
    name: 'Le son un',
    kind: 'nasale',
    variants: ['un', 'um'],
    syllables: ['brun', 'chacun', 'lundi', 'parfum'],
    week: 7,
    officialReference: NASAL_REF,
    words: [
      { word: 'lundi', syllables: ['lun', 'di'], position: 'debut' },
      { word: 'brun', syllables: ['brun'], position: 'fin' },
      { word: 'parfum', syllables: ['par', 'fum'], icon: 'icon-flower', position: 'fin' },
      { word: 'chacun', syllables: ['cha', 'cun'], position: 'fin' },
    ],
    sentence: 'Lundi, chacun va à l’école.',
  },
];

/** Trimestre 2 — groupes consonantiques, puis sons composés restants. */
export const CP2_TERM2: Cp2Unit[] = [
  {
    id: 'bl-cl-fl-pl-gl',
    glyph: 'bl',
    name: 'Les groupes bl, cl, fl, pl, gl',
    kind: 'groupe',
    variants: ['bl', 'cl', 'fl', 'pl', 'gl'],
    syllables: ['bla', 'ble', 'cla', 'cle', 'fla', 'fle', 'pla', 'ple', 'gla', 'gle'],
    week: 11,
    officialReference: CLUSTER_REF,
    words: [
      { word: 'blanc', syllables: ['blanc'], position: 'debut' },
      { word: 'classe', syllables: ['clas', 'se'], icon: 'icon-desk', position: 'debut' },
      { word: 'fleur', syllables: ['fleur'], icon: 'icon-flower', position: 'debut' },
      { word: 'plume', syllables: ['plu', 'me'], icon: 'icon-bird', position: 'debut' },
    ],
    sentence: 'La fleur blanche est dans la classe.',
  },
  {
    id: 'br-cr-dr',
    glyph: 'br',
    name: 'Les groupes br, cr, dr',
    kind: 'groupe',
    variants: ['br', 'cr', 'dr'],
    syllables: ['bra', 'bre', 'cra', 'cre', 'dra', 'dre'],
    week: 12,
    officialReference: CLUSTER_REF,
    words: [
      { word: 'bras', syllables: ['bras'], icon: 'icon-hand', position: 'debut' },
      { word: 'crayon', syllables: ['cra', 'yon'], icon: 'icon-pencil', position: 'debut' },
      { word: 'arbre', syllables: ['ar', 'bre'], icon: 'icon-tree', position: 'fin' },
      { word: 'drap', syllables: ['drap'], icon: 'icon-mat', position: 'debut' },
    ],
    sentence: 'Le crayon est sous l’arbre.',
  },
  {
    id: 'fr-gr-pr-tr-vr',
    glyph: 'tr',
    name: 'Les groupes fr, gr, pr, tr, vr',
    kind: 'groupe',
    variants: ['fr', 'gr', 'pr', 'tr', 'vr'],
    syllables: ['fra', 'fre', 'gra', 'gre', 'pra', 'pre', 'tra', 'tre', 'vra', 'vre'],
    week: 13,
    officialReference: CLUSTER_REF,
    words: [
      { word: 'frère', syllables: ['frè', 're'], icon: 'icon-friends', position: 'debut' },
      { word: 'grand', syllables: ['grand'], position: 'debut' },
      { word: 'trois', syllables: ['trois'], position: 'debut' },
      { word: 'chèvre', syllables: ['chè', 'vre'], icon: 'icon-goat', position: 'fin' },
    ],
    sentence: 'Mon frère garde trois chèvres.',
  },
  {
    id: 'gn-gu',
    glyph: 'gn',
    name: 'Les groupes gn et gu',
    kind: 'groupe',
    variants: ['gn', 'gu'],
    syllables: ['gna', 'gne', 'gni', 'gue', 'gui'],
    week: 14,
    officialReference: CLUSTER_REF,
    words: [
      { word: 'montagne', syllables: ['mon', 'ta', 'gne'], position: 'fin' },
      { word: 'agneau', syllables: ['ag', 'neau'], icon: 'icon-sheep', position: 'milieu' },
      { word: 'figue', syllables: ['fi', 'gue'], position: 'fin' },
      { word: 'guitare', syllables: ['gui', 'ta', 're'], icon: 'icon-drum', position: 'debut' },
    ],
    sentence: 'L’agneau monte sur la montagne.',
  },
  {
    id: 'eu',
    glyph: 'eu',
    name: 'Le son eu',
    kind: 'son',
    variants: ['eu', 'œu'],
    syllables: ['beu', 'deu', 'feu', 'jeu', 'leu', 'meu', 'neu', 'peu', 'seu'],
    week: 15,
    officialReference: OTHER_REF,
    words: [
      { word: 'feu', syllables: ['feu'], icon: 'icon-lightning', position: 'fin' },
      { word: 'jeu', syllables: ['jeu'], icon: 'icon-ball', position: 'fin' },
      { word: 'fleur', syllables: ['fleur'], icon: 'icon-flower', position: 'milieu' },
      { word: 'sœur', syllables: ['sœur'], icon: 'icon-mother', position: 'milieu' },
    ],
    sentence: 'Ma sœur aime le jeu.',
  },
  {
    id: 'au-eau',
    glyph: 'au',
    name: 'Le son au, eau',
    kind: 'son',
    variants: ['au', 'eau', 'o'],
    syllables: ['bau', 'chau', 'gau', 'mau', 'sau', 'tau'],
    week: 16,
    officialReference: OTHER_REF,
    words: [
      { word: 'eau', syllables: ['eau'], icon: 'icon-water', position: 'debut' },
      { word: 'chapeau', syllables: ['cha', 'peau'], icon: 'icon-hat', position: 'fin' },
      { word: 'oiseau', syllables: ['oi', 'seau'], icon: 'icon-bird', position: 'fin' },
      { word: 'chaud', syllables: ['chaud'], icon: 'icon-sun', position: 'milieu' },
    ],
    sentence: 'L’oiseau boit de l’eau.',
  },
  {
    id: 'ai-ei',
    glyph: 'ai',
    name: 'Le son ai, ei',
    kind: 'son',
    variants: ['ai', 'ei', 'è', 'est'],
    syllables: ['bai', 'fai', 'lai', 'mai', 'pai', 'rai', 'sai', 'tai'],
    week: 17,
    officialReference: OTHER_REF,
    words: [
      { word: 'lait', syllables: ['lait'], icon: 'icon-milk', position: 'milieu' },
      { word: 'maison', syllables: ['mai', 'son'], icon: 'icon-hut', position: 'debut' },
      { word: 'balai', syllables: ['ba', 'lai'], icon: 'icon-broom', position: 'fin' },
      { word: 'reine', syllables: ['rei', 'ne'], icon: 'icon-mother', position: 'debut' },
    ],
    sentence: 'Le lait est dans la maison.',
  },
];

/** Trimestre 3 — syllabes inverses, équivalences, semi-voyelles. */
export const CP2_TERM3: Cp2Unit[] = [
  {
    id: 'ar-or-ir-ur',
    glyph: 'ar',
    name: 'Les syllabes ar, or, ir, ur',
    kind: 'inverse',
    variants: ['ar', 'or', 'ir', 'ur'],
    syllables: ['ar', 'or', 'ir', 'ur'],
    week: 21,
    officialReference: REVERSE_REF,
    words: [
      { word: 'jardin', syllables: ['jar', 'din'], icon: 'icon-field', position: 'debut' },
      { word: 'porte', syllables: ['por', 'te'], icon: 'icon-door', position: 'milieu' },
      { word: 'partir', syllables: ['par', 'tir'], position: 'fin' },
      { word: 'mur', syllables: ['mur'], icon: 'icon-hut', position: 'fin' },
    ],
    sentence: 'La porte du jardin est ouverte.',
  },
  {
    id: 'al-el-il-ol',
    glyph: 'al',
    name: 'Les syllabes al, el, il, ol',
    kind: 'inverse',
    variants: ['al', 'el', 'il', 'ol'],
    syllables: ['al', 'el', 'il', 'ol'],
    week: 22,
    officialReference: REVERSE_REF,
    words: [
      { word: 'animal', syllables: ['a', 'ni', 'mal'], icon: 'icon-donkey', position: 'fin' },
      { word: 'sel', syllables: ['sel'], position: 'fin' },
      { word: 'fil', syllables: ['fil'], position: 'fin' },
      { word: 'bol', syllables: ['bol'], icon: 'icon-pot', position: 'fin' },
    ],
    sentence: 'Le sel est dans le bol.',
  },
  {
    id: 'ac-ec-oc-ic',
    glyph: 'ac',
    name: 'Les syllabes ac, ec, oc, ic',
    kind: 'inverse',
    variants: ['ac', 'ec', 'oc', 'ic'],
    syllables: ['ac', 'ec', 'oc', 'ic'],
    week: 23,
    officialReference: REVERSE_REF,
    words: [
      { word: 'sac', syllables: ['sac'], icon: 'icon-satchel', position: 'fin' },
      { word: 'lac', syllables: ['lac'], icon: 'icon-water', position: 'fin' },
      { word: 'docteur', syllables: ['doc', 'teur'], icon: 'icon-medicine', position: 'debut' },
      {
        word: 'directeur',
        syllables: ['di', 'rec', 'teur'],
        icon: 'icon-teacher',
        position: 'milieu',
      },
    ],
    sentence: 'Le sac est près du lac.',
  },
  {
    id: 'as-es-er',
    glyph: 'er',
    name: 'Les syllabes as, es, er',
    kind: 'inverse',
    variants: ['as', 'es', 'er'],
    syllables: ['as', 'es', 'er'],
    week: 24,
    officialReference: REVERSE_REF,
    words: [
      { word: 'tasse', syllables: ['tas', 'se'], icon: 'icon-pot', position: 'debut' },
      { word: 'reste', syllables: ['res', 'te'], position: 'milieu' },
      { word: 'berger', syllables: ['ber', 'ger'], icon: 'icon-herder', position: 'milieu' },
      {
        word: 'cartable',
        syllables: ['car', 'ta', 'ble'],
        icon: 'icon-satchel',
        position: 'debut',
      },
    ],
    sentence: 'Le berger reste près du puits.',
  },
  {
    id: 'eur-oeur',
    glyph: 'eur',
    name: 'Les syllabes eur et œur',
    kind: 'inverse',
    variants: ['eur', 'œur'],
    syllables: ['eur', 'œur'],
    week: 25,
    officialReference: REVERSE_REF,
    words: [
      { word: 'fleur', syllables: ['fleur'], icon: 'icon-flower', position: 'fin' },
      { word: 'sœur', syllables: ['sœur'], icon: 'icon-mother', position: 'fin' },
      { word: 'docteur', syllables: ['doc', 'teur'], icon: 'icon-medicine', position: 'fin' },
      { word: 'cœur', syllables: ['cœur'], icon: 'icon-happy', position: 'fin' },
    ],
    sentence: 'Ma sœur a une fleur.',
  },
  {
    id: 'oir-air',
    glyph: 'oir',
    name: 'Les syllabes oir et air',
    kind: 'inverse',
    variants: ['oir', 'air'],
    syllables: ['oir', 'air'],
    week: 26,
    officialReference: REVERSE_REF,
    words: [
      { word: 'noir', syllables: ['noir'], position: 'fin' },
      { word: 'soir', syllables: ['soir'], icon: 'icon-moon', position: 'fin' },
      { word: 'lait', syllables: ['lait'], icon: 'icon-milk', position: 'fin' },
      { word: 'maire', syllables: ['mai', 're'], icon: 'icon-teacher', position: 'fin' },
    ],
    sentence: 'Le soir, le ciel est noir.',
  },
  {
    id: 'equiv-o',
    glyph: 'o = au = eau',
    kind: 'equivalence',
    name: 'o, au, eau : le même son',
    variants: ['o', 'au', 'eau'],
    syllables: [],
    week: 27,
    officialReference: EQUIV_REF,
    words: [
      { word: 'moto', syllables: ['mo', 'to'], icon: 'icon-moto' },
      { word: 'chaud', syllables: ['chaud'], icon: 'icon-sun' },
      { word: 'chapeau', syllables: ['cha', 'peau'], icon: 'icon-hat' },
      { word: 'eau', syllables: ['eau'], icon: 'icon-water' },
    ],
    sentence: 'Il fait chaud, je bois de l’eau.',
  },
  {
    id: 'equiv-e',
    glyph: 'é = er = ez',
    kind: 'equivalence',
    name: 'é, er, ez : le même son',
    variants: ['é', 'er', 'ez', 'et'],
    syllables: [],
    week: 28,
    officialReference: EQUIV_REF,
    words: [
      { word: 'bébé', syllables: ['bé', 'bé'], icon: 'icon-baby' },
      { word: 'nez', syllables: ['nez'], icon: 'icon-nose' },
      { word: 'parler', syllables: ['par', 'ler'], icon: 'icon-mouth' },
      { word: 'pied', syllables: ['pied'], icon: 'icon-foot' },
    ],
    sentence: 'Le bébé va parler.',
  },
  {
    id: 'equiv-s',
    glyph: 'c = s = ç',
    kind: 'equivalence',
    name: 'c, s, ç : le même son',
    variants: ['c', 's', 'ç'],
    syllables: [],
    week: 29,
    officialReference: EQUIV_REF,
    words: [
      { word: 'cinéma', syllables: ['ci', 'né', 'ma'], icon: 'icon-school' },
      { word: 'savon', syllables: ['sa', 'von'], icon: 'icon-soap' },
      { word: 'leçon', syllables: ['le', 'çon'], icon: 'icon-book' },
      { word: 'glace', syllables: ['gla', 'ce'], icon: 'icon-water' },
    ],
    sentence: 'La leçon commence.',
  },
  {
    id: 'semi-voyelles',
    glyph: 'ui',
    kind: 'son',
    name: 'Les sons ui, oin, ier',
    variants: ['ui', 'oin', 'ier', 'ied'],
    syllables: ['ui', 'oin', 'ier'],
    week: 30,
    officialReference:
      'Lecture CP — « 3) Semi voyelles ou semi consonnes : ied, ier, y, oin, ui, iu » (p. 23)',
    words: [
      { word: 'puits', syllables: ['puits'], icon: 'icon-well', position: 'debut' },
      { word: 'nuit', syllables: ['nuit'], icon: 'icon-moon', position: 'milieu' },
      { word: 'loin', syllables: ['loin'], icon: 'icon-road', position: 'fin' },
      { word: 'panier', syllables: ['pa', 'nier'], icon: 'icon-basket', position: 'fin' },
    ],
    sentence: 'Le puits est loin.',
  },
];

export const CP2_READING_UNITS = [...CP2_TERM1, ...CP2_TERM2, ...CP2_TERM3];
