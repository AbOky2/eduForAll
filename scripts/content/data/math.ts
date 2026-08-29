/**
 * Données des activités mathématiques et du calcul mental (programme p. 58-59
 * et p. 65). Les énoncés de problèmes sont « les courts énoncés des problèmes
 * liés à la vie courante » demandés p. 65 — tous situés dans le quotidien
 * d'un enfant tchadien.
 */

export interface Countable {
  icon: string;
  singular: string;
  plural: string;
}

export const COUNTABLES: Countable[] = [
  { icon: 'icon-goat', singular: 'chèvre', plural: 'chèvres' },
  { icon: 'icon-mango', singular: 'mangue', plural: 'mangues' },
  { icon: 'icon-hen', singular: 'poule', plural: 'poules' },
  { icon: 'icon-calabash', singular: 'calebasse', plural: 'calebasses' },
  { icon: 'icon-hut', singular: 'case', plural: 'cases' },
  { icon: 'icon-fish', singular: 'poisson', plural: 'poissons' },
  { icon: 'icon-egg', singular: 'œuf', plural: 'œufs' },
  { icon: 'icon-tree', singular: 'arbre', plural: 'arbres' },
  { icon: 'icon-flower', singular: 'fleur', plural: 'fleurs' },
  { icon: 'icon-banana', singular: 'banane', plural: 'bananes' },
  { icon: 'icon-ball', singular: 'ballon', plural: 'ballons' },
  { icon: 'icon-sheep', singular: 'mouton', plural: 'moutons' },
];

export interface WordProblem {
  statement: string;
  answer: number;
  icon: string;
}

/** CP1 — addition et soustraction dans les vingt premiers nombres. */
export const CP1_PROBLEMS: WordProblem[] = [
  {
    statement: 'Amina a 3 mangues. Sa maman lui en donne 2. Combien a-t-elle de mangues ?',
    answer: 5,
    icon: 'icon-mango',
  },
  {
    statement: 'Il y a 6 chèvres au puits. 2 chèvres partent. Combien reste-t-il de chèvres ?',
    answer: 4,
    icon: 'icon-goat',
  },
  {
    statement: 'Moussa ramasse 4 œufs. Il en trouve 3 autres. Combien a-t-il d’œufs ?',
    answer: 7,
    icon: 'icon-egg',
  },
  {
    statement: 'La poule a 8 poussins. 3 se cachent. Combien en vois-tu ?',
    answer: 5,
    icon: 'icon-hen',
  },
  {
    statement: 'Papa achète 5 poissons. Il en donne 1 au voisin. Combien lui en reste-t-il ?',
    answer: 4,
    icon: 'icon-fish',
  },
  {
    statement: 'Il y a 7 calebasses. Fatimé en apporte 2. Combien y a-t-il de calebasses ?',
    answer: 9,
    icon: 'icon-calabash',
  },
  {
    statement: 'Le berger compte 10 moutons. 4 entrent dans l’enclos. Combien restent dehors ?',
    answer: 6,
    icon: 'icon-sheep',
  },
  {
    statement: 'Amina a 9 billes. Elle en perd 3. Combien lui reste-t-il de billes ?',
    answer: 6,
    icon: 'icon-marble',
  },
];

/** CP2 — nombres jusqu'à cent, et premiers partages. */
export const CP2_PROBLEMS: WordProblem[] = [
  {
    statement: 'Le commerçant a 25 mangues. Il en vend 10. Combien lui en reste-t-il ?',
    answer: 15,
    icon: 'icon-mango',
  },
  {
    statement: 'Il y a 18 poules dans la cour. Papa en achète 12. Combien y a-t-il de poules ?',
    answer: 30,
    icon: 'icon-hen',
  },
  {
    statement: 'Maman partage 20 arachides entre 2 enfants. Combien chacun en a-t-il ?',
    answer: 10,
    icon: 'icon-peanut',
  },
  {
    statement: 'Le pêcheur prend 45 poissons. Il en vend 20 au marché. Combien lui en reste-t-il ?',
    answer: 25,
    icon: 'icon-fish',
  },
  {
    statement: 'Un sac de mil coûte 50 francs. Papa en achète 2. Combien paie-t-il ?',
    answer: 100,
    icon: 'icon-millet',
  },
  {
    statement: 'Il y a 5 paniers de 5 tomates. Combien y a-t-il de tomates ?',
    answer: 25,
    icon: 'icon-tomato',
  },
  {
    statement: 'Le berger a 40 chèvres. 15 boivent au puits. Combien n’ont pas encore bu ?',
    answer: 25,
    icon: 'icon-goat',
  },
  {
    statement: 'Amina range 30 œufs dans des boîtes de 5. Combien de boîtes remplit-elle ?',
    answer: 6,
    icon: 'icon-egg',
  },
];

/** « les jours, les semaines, les mois » (p. 59). */
export const WEEKDAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

/** L'année scolaire tchadienne va d'octobre à juin (p. 126). */
export const SCHOOL_MONTHS = [
  'octobre',
  'novembre',
  'décembre',
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
];

/** Pièces réellement en circulation au Tchad (franc CFA d'Afrique centrale). */
export const CFA_COINS = [5, 10, 25, 50, 100, 500] as const;

/** « les couleurs : rouge, bleu, jaune, vert, blanc, noir » (p. 58). */
export const OFFICIAL_COLORS = ['rouge', 'bleu', 'jaune', 'vert', 'blanc', 'noir'] as const;

/** « les formes : rond, carré, rectangulaire, triangulaire » (p. 58). */
export const OFFICIAL_SHAPES = [
  { id: 'rond', label: 'rond' },
  { id: 'carre', label: 'carré' },
  { id: 'rectangle', label: 'rectangle' },
  { id: 'triangle', label: 'triangle' },
] as const;
