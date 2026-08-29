/**
 * Référentiel du programme officiel tchadien — source de vérité pédagogique.
 *
 * SOURCE UNIQUE :
 *   « Programmes Réactualisés de l'Enseignement Primaire »
 *   République du Tchad — Ministère de l'Éducation Nationale
 *   Centre National des Curricula (CNC), N'Djaména, septembre 2004. 161 p.
 *   Arrêté ministériel fixant les programmes réactualisés (p. 5-6).
 *
 * Ce fichier n'invente rien : chaque entrée porte la page du document dont
 * elle est tirée. Les contenus marqués `official` sont cités ; les champs
 * `teachingOrder` sont la mise en ordre pédagogique (le programme donne un
 * inventaire, pas une chronologie — c'est le travail de l'instituteur) et
 * sont les seuls points à faire valider par un enseignant CP tchadien.
 *
 * Voir docs/programme-officiel-tchad.md pour la traçabilité complète.
 */

export const OFFICIAL_SOURCE = {
  title: 'Programmes Réactualisés de l’Enseignement Primaire',
  country: 'Tchad',
  authority: 'Ministère de l’Éducation Nationale — Centre National des Curricula (CNC)',
  place: 'N’Djaména',
  date: 'septembre 2004',
  pages: 161,
} as const;

/**
 * Organisation du cycle primaire (p. 15).
 * Six ans, trois cours de deux niveaux. Le CP accueille les enfants de 6 ans.
 */
export const SCHOOL_YEAR = {
  /** p. 126 — « l'année scolaire dure neuf (9) mois. Elle va du 1er octobre au 30 juin. » */
  startsOn: '1er octobre',
  endsOn: '30 juin',
  months: 9,
  terms: 3,
  /** Semaines de classe effectives retenues pour la progression (9 mois - congés). */
  effectiveWeeks: 30,
  /** p. 126 — volume hebdomadaire de travail effectif, identique du CP1 au CM2. */
  weeklyHours: 28,
  /** p. 126 — « CP 10 à 20 mn » : durée d'une séance au cours préparatoire. */
  sessionMinutes: { min: 10, max: 20 },
} as const;

/**
 * Grille horaire hebdomadaire du CP1 et CP2 (p. 128).
 * Reproduite telle quelle — elle fixe le poids relatif de chaque discipline
 * et donc la répartition des leçons de l'application.
 */
export const WEEKLY_TIMETABLE_CP = [
  { subject: 'Morale et hygiène', minutes: 60, session: '10 mn', frequency: '1/jour' },
  {
    subject: 'Lecture',
    minutes: 460,
    session: '20 mn',
    frequency: '4 séances/jour x 5 + 2 séances/j x 1',
  },
  {
    subject: 'Écriture',
    minutes: 165,
    session: '15 mn',
    frequency: '2 séances/jour x 5 + 1 séance/j x 1',
  },
  { subject: 'Langage', minutes: 360, session: '20 mn', frequency: '3/jour' },
  {
    subject: 'Mathématiques',
    minutes: 210,
    session: '20 mn + 15 mn',
    frequency: '2 séances/j x 6',
  },
  { subject: 'Dessin', minutes: 100, session: '20 mn', frequency: '5 séances/semaine' },
  { subject: 'Chant', minutes: 60, session: '15 mn', frequency: '4 séances/semaine' },
  { subject: 'Récitation', minutes: 45, session: '15 mn', frequency: '3 séances/semaine' },
  { subject: 'Exercices physiques', minutes: 80, session: '20 mn', frequency: '4 séances/semaine' },
  { subject: 'Récréations', minutes: 140, session: '15 mn et 10 mn', frequency: '2 séances/j' },
] as const;

/**
 * Périmètre couvert par ALIFA : les quatre disciplines instrumentales du CP.
 * Ensemble elles pèsent 1195 mn sur 1680 mn hebdomadaires (71 %).
 * Le poids `share` pilote le nombre de leçons générées par discipline.
 */
export const ALIFA_SUBJECTS = [
  { id: 'reading', label: 'Lecture', minutes: 460, share: 0.385 },
  { id: 'language', label: 'Langage', minutes: 360, share: 0.301 },
  { id: 'math', label: 'Calcul', minutes: 210, share: 0.176 },
  { id: 'writing', label: 'Écriture', minutes: 165, share: 0.138 },
] as const;

export type AlifaSubjectId = (typeof ALIFA_SUBJECTS)[number]['id'];

// ---------------------------------------------------------------------------
// A. LANGAGE / ÉLOCUTION — p. 18-19
// ---------------------------------------------------------------------------

/**
 * Objectifs officiels du langage au CP (p. 18), cités.
 */
export const LANGUAGE_OBJECTIVES = [
  'prendre la parole dans des situations diverses (dialogue, récit, explication, justification, résumé simple)',
  's’exprimer de façon compréhensible quant à la prononciation et à l’articulation',
  'connaître les éléments composant un mot (sons, syllabes), pouvoir les reproduire',
  'faire varier à bon propos les temps élémentaires (présent, futur, passé composé de l’indicatif)',
  'faire varier les pronoms personnels',
  'utiliser à bon escient les mots de liaison les plus usités (conjonctions, prépositions)',
  'acquérir et réinvestir du vocabulaire en s’appuyant sur le vécu proche et éloigné',
  'formuler convenablement des demandes',
  'répondre de manière juste à des demandes',
  'mémoriser et dire des structures langagières',
] as const;

/**
 * Les 19 thèmes de vocabulaire du langage au CP (p. 19) — liste officielle
 * exhaustive, dans l'ordre du document. Chaque thème donne une leçon CP1
 * (découverte) et une leçon CP2 (approfondissement).
 */
export const LANGUAGE_THEMES = [
  { id: 'ecole', official: 'l’école' },
  { id: 'corps-humain', official: 'le corps humain' },
  { id: 'habits', official: 'les habits' },
  { id: 'maison', official: 'la case, la maison' },
  { id: 'village', official: 'le quartier, le village, la ville' },
  { id: 'famille', official: 'la famille' },
  {
    id: 'metiers',
    official:
      'les métiers : le cultivateur, l’éleveur, le forgeron, le cordonnier, le tailleur, le chasseur, le pêcheur, etc.',
  },
  { id: 'animaux', official: 'les animaux sauvages et domestiques' },
  { id: 'plantes', official: 'les plantes' },
  { id: 'phenomenes-naturels', official: 'les phénomènes naturels : la pluie, le vent, etc.' },
  { id: 'voyages', official: 'les voyages' },
  { id: 'jeux', official: 'les jeux' },
  { id: 'aliments', official: 'les aliments' },
  { id: 'marche', official: 'le marché' },
  { id: 'transport', official: 'les moyens de transport' },
  { id: 'maladies', official: 'les maladies' },
  { id: 'fetes', official: 'les cérémonies, les fêtes' },
  { id: 'sentiments', official: 'les sentiments' },
] as const;

/** Structures langagières à faire acquérir (p. 19), citées. */
export const LANGUAGE_STRUCTURES = [
  'les verbes transitifs directs et indirects',
  'les structures pour poser des questions, pour y répondre',
  'les structures pour désigner, décrire, présenter, localiser',
  'les structures pour exprimer la possession, le genre et le nombre',
] as const;

// ---------------------------------------------------------------------------
// B. LECTURE — p. 23-24
// ---------------------------------------------------------------------------

export const READING_OBJECTIVES = [
  'connaître les éléments composant un mot (syllabes/lettres)',
  'maîtriser la combinatoire des voyelles, semi-voyelles et consonnes',
  'aborder le déchiffrage de mots inconnus et leur donner un sens',
  'donner après lecture d’une phrase ou d’un texte simple des renseignements ponctuels',
  'connaître et utiliser des signes morpho-syntaxiques simples (accents, apostrophes, ponctuation, majuscules)',
  'lire en articulant correctement des phrases et des textes simples déjà étudiés',
] as const;

/**
 * Inventaire officiel des sons à étudier au CP (p. 23-24), cité intégralement.
 * Le programme donne les catégories sans chronologie : la mise en ordre est
 * dans READING_TEACHING_ORDER ci-dessous.
 */
export const READING_INVENTORY = {
  /** p. 23 — « 1) Voyelles simples » */
  simpleVowels: ['i', 'a', 'y', 'u', 'o', 'e', 'é', 'è', 'ê'],
  /** p. 23 — « 2) Voyelles nasales » */
  nasalVowels: ['in', 'ain', 'ein', 'un', 'um', 'an', 'en', 'on', 'om'],
  /** p. 23 — « 3) Semi voyelles ou semi consonnes » */
  semiVowels: ['ied', 'ier', 'y', 'oin', 'ui', 'iu'],
  /** p. 23 — « 4) Consonnes » (22) */
  consonants: [
    't',
    'h',
    'p',
    'n',
    'l',
    'd',
    'v',
    'm',
    'r',
    'b',
    'j',
    'f',
    's',
    'c',
    'g',
    'k',
    'z',
    'x',
    'ch',
    'w',
    'qu',
  ],
  /** p. 24 — « Autres sons » */
  otherSounds: ['ou', 'eu', 'an', 'oi', 'en', 'in', 'on', 'ai', 'ei', 'au'],
  /** p. 24 — groupes consonantiques (14) */
  consonantClusters: [
    'bl',
    'pl',
    'cl',
    'fl',
    'br',
    'cr',
    'vr',
    'fr',
    'dr',
    'pr',
    'gr',
    'gn',
    'gu',
    'tr',
  ],
  /** p. 24 — syllabes inverses et finales (18) */
  reverseSyllables: [
    'ac',
    'or',
    'ir',
    'ur',
    'il',
    'al',
    'el',
    'ec',
    'oc',
    'es',
    'er',
    'ar',
    'as',
    'oeur',
    'eur',
    'oir',
    'air',
    'ic',
  ],
  /** p. 24 — équivalences graphémiques, citées telles quelles */
  graphemeEquivalences: [
    { sound: 'o', spellings: ['o', 'au', 'eau'] },
    { sound: 'eu', spellings: ['eu', 'oeu'] },
    { sound: 'é', spellings: ['é', 'et', 'ez', 'ed', 'er'] },
    { sound: 'è', spellings: ['è', 'ei', 'ai', 'est'] },
    { sound: 'an', spellings: ['an', 'en', 'am', 'em'] },
    { sound: 'on', spellings: ['on', 'om'] },
    { sound: 's', spellings: ['c', 's', 'ç'] },
    { sound: 'z', spellings: ['s', 'z'] },
    { sound: 'j', spellings: ['g', 'j'] },
    { sound: 'in', spellings: ['in', 'aim', 'eim', 'ain', 'ein'] },
  ],
} as const;

// ---------------------------------------------------------------------------
// C. ÉCRITURE — p. 25-26
// ---------------------------------------------------------------------------

export const WRITING_OBJECTIVES = [
  'maîtriser l’usage des outils et des supports de l’écrit',
  'appliquer les contraintes de l’écriture',
  'reproduire des formes, des modèles, des trajectoires',
] as const;

/**
 * Contenus officiels de l'écriture au CP (p. 26), dans l'ordre du document.
 * Point capital : « L'étude de l'écriture proprement dite est précédée du
 * graphisme » — le tracé de lettres ne vient qu'après les exercices de
 * graphisme préparatoire.
 */
export const WRITING_PROGRESSION = {
  /** Phase 1 — graphisme préparatoire, avant toute lettre (p. 26). */
  graphism: [
    {
      id: 'tenue-outil',
      official: 'tenue correcte des outils d’écriture (craie, crayon, stylo à billes)',
    },
    {
      id: 'supports',
      official:
        'utilisation de supports de graphisme et d’écriture (ardoise, cahier à double lignes, à carreaux, tableau)',
    },
    { id: 'lateralisation', official: 'exercices de structuration spatiale et de latéralisation' },
    {
      id: 'sens-ecriture',
      official: 'apprentissage du sens de l’écriture (gauche vers la droite)',
    },
    { id: 'lignes', official: 'traçage des lignes sur une ardoise, au tableau' },
    { id: 'boucles', official: 'traçage des boucles vers le bas, vers le haut' },
    {
      id: 'formes-base',
      official:
        'traçage des points, des ronds, des lignes verticales, des lignes horizontales, des obliques, des courbes',
    },
    { id: 'enchainement', official: 'traçage des boucles et enchaînement' },
    { id: 'point-place', official: 'écriture à partir d’un point placé' },
  ],
  /** Phase 2 et suivantes (p. 26). */
  letters: 'écriture des lettres de l’alphabet étudiées en lecture',
  numbers: 'écriture en chiffres et en lettres des nombres étudiés en mathématiques',
  uppercase: 'initiation à l’écriture des majuscules',
  copy: 'copie de mots et de phrases tirés de la lecture',
} as const;

// ---------------------------------------------------------------------------
// D. MATHÉMATIQUES — p. 58-59 (activités) et p. 65 (calcul mental)
// ---------------------------------------------------------------------------

export const MATH_OBJECTIVES = [
  'établir des relations entre les éléments d’un ensemble donné',
  'utiliser le langage mathématique dans les domaines interdisciplinaires',
  'maîtriser le sens de l’addition et de la soustraction',
  'connaître les règles de multiplication et de division par 2 et 5',
  'se familiariser avec les formes géométriques simples',
  'acquérir les notions de mesure',
] as const;

/**
 * Contenus officiels des activités mathématiques au CP (p. 58-59), cités dans
 * l'ordre exact du document. `level` indique le niveau quand le programme le
 * précise lui-même ; 'CP' = commun aux deux années.
 */
export const MATH_CONTENTS = [
  { id: 'tailles', official: 'les tailles : grand, petit, long, court', level: 'CP1' },
  {
    id: 'couleurs',
    official: 'les couleurs : rouge, bleu, jaune, vert, blanc, noir',
    level: 'CP1',
  },
  { id: 'formes', official: 'les formes : rond, carré, rectangulaire, triangulaire', level: 'CP1' },
  {
    id: 'reperes',
    official:
      'les repères : devant, derrière, à droite, à gauche, au-dessus, à l’intérieur, à l’extérieur, sur, sous, en-dessous, dessus, entre, en haut, en bas, à côté de',
    level: 'CP1',
  },
  { id: 'verbes', official: 'l’emploi des verbes : ajouter, enlever, ôter, réunir', level: 'CP1' },
  {
    id: 'signes',
    official:
      'les signes de l’addition, de la soustraction, d’égalité, de la multiplication et de la division',
    level: 'CP',
  },
  {
    id: 'comparaisons',
    official:
      'les comparaisons : plus… que ; moins… que ; autant de… que de… ; supérieur à ; inférieur à',
    level: 'CP1',
  },
  { id: 'quantites', official: 'les quantités : peu, beaucoup, rien, nul', level: 'CP1' },
  { id: 'nombres-0-20', official: 'les nombres de 0 à 20 (CP1)', level: 'CP1' },
  { id: 'dizaine', official: 'notion de dizaine', level: 'CP1' },
  { id: 'nombres-20-100', official: 'les nombres de 20 à 100 (CP2)', level: 'CP2' },
  { id: 'centaine', official: 'notion de centaine', level: 'CP2' },
  {
    id: 'nombres-en-lettres',
    official: 'lecture et écriture en chiffres et en lettres de ces nombres',
    level: 'CP',
  },
  {
    id: 'addition-soustraction',
    official: 'l’addition et la soustraction des nombres entiers (sens et technique)',
    level: 'CP',
  },
  {
    id: 'multiplication-division',
    official: 'la multiplication et la division par 2 et par 5',
    level: 'CP2',
  },
  { id: 'double-decimetre', official: 'l’utilisation du double décimètre', level: 'CP2' },
  {
    id: 'figures-simples',
    official: 'identification des figures simples : carré, rectangle, triangle',
    level: 'CP',
  },
  { id: 'lignes', official: 'les lignes courbes, droites et brisées', level: 'CP2' },
  { id: 'monnaie', official: 'les pièces de monnaie', level: 'CP' },
  { id: 'calendrier', official: 'les jours, les semaines, les mois', level: 'CP' },
  {
    id: 'retenue',
    official: 'l’addition et la soustraction des nombres entiers avec retenue',
    level: 'CP2',
  },
] as const;

/** Calcul mental au CP (p. 65), cité. */
export const MENTAL_MATH_CONTENTS = [
  { id: 'tables-addition', official: 'les tables d’addition et de soustraction', level: 'CP' },
  { id: 'double-moitie', official: 'la notion de double et de moitié', level: 'CP' },
  { id: 'mult-div-2', official: 'la multiplication et la division par 2', level: 'CP' },
  { id: 'table-5', official: 'la table de multiplication par 5 (CP2)', level: 'CP2' },
  {
    id: 'problemes-courts',
    official: 'les courts énoncés des problèmes liés à la vie courante',
    level: 'CP',
  },
] as const;

// ---------------------------------------------------------------------------
// MISE EN ORDRE PÉDAGOGIQUE — décision ALIFA, à valider par un enseignant
// ---------------------------------------------------------------------------

/**
 * Le programme officiel donne l'inventaire des sons, pas leur chronologie.
 * L'ordre ci-dessous est celui d'un CP francophone sahélien classique :
 * voyelles d'abord, puis consonnes continues (faciles à faire durer et à
 * fusionner : l, m, r, s, f), puis occlusives (p, t, d, b), puis les
 * graphies plus rares. Chaque son reste dans l'inventaire officiel.
 *
 * ⚠ C'est le point n° 1 à soumettre à l'enseignant validateur.
 */
export const READING_TEACHING_ORDER = {
  CP1: {
    /** Trimestre 1 — les voyelles simples, socle de la combinatoire. */
    term1Vowels: ['a', 'i', 'o', 'u', 'e', 'é'],
    /** Trimestre 1-2 — consonnes continues, fusion immédiate en syllabes. */
    term1Consonants: ['l', 'm', 'r', 's'],
    /** Trimestre 2 — occlusives et fricatives usuelles. */
    term2Consonants: ['p', 't', 'd', 'b', 'n', 'f', 'v'],
    /** Trimestre 3 — graphies restantes du CP1 et premiers digrammes. */
    term3Consonants: ['j', 'ch', 'c', 'g'],
    term3Sounds: ['ou', 'oi'],
    /** Voyelles restantes de l'inventaire abordées en fin de CP1. */
    term3Vowels: ['è', 'ê'],
  },
  CP2: {
    /** Trimestre 1 — reprise, consonnes rares, voyelles nasales. */
    term1Consonants: ['k', 'z', 'x', 'w', 'qu', 'h', 'y'],
    term1Nasals: ['an', 'on', 'in', 'un'],
    /** Trimestre 2 — groupes consonantiques (inventaire officiel complet). */
    term2Clusters: [
      'bl',
      'cl',
      'fl',
      'pl',
      'br',
      'cr',
      'dr',
      'fr',
      'gr',
      'pr',
      'tr',
      'vr',
      'gn',
      'gu',
    ],
    /** Trimestre 2-3 — sons composés restants. */
    term2Sounds: ['eu', 'au', 'ai', 'ei'],
    /** Trimestre 3 — syllabes inverses (inventaire officiel complet). */
    term3Reverse: [
      'ar',
      'or',
      'ir',
      'ur',
      'al',
      'el',
      'il',
      'ac',
      'ec',
      'oc',
      'ic',
      'as',
      'es',
      'er',
      'eur',
      'oeur',
      'oir',
      'air',
    ],
    /** Trimestre 3 — équivalences graphémiques et semi-voyelles. */
    term3Equivalences: [
      'o=au=eau',
      'é=et=ez=er',
      'è=ei=ai',
      'an=en=am=em',
      'on=om',
      'c=s=ç',
      's=z',
      'g=j',
    ],
    term3SemiVowels: ['ui', 'oin', 'ier', 'ied'],
  },
} as const;
