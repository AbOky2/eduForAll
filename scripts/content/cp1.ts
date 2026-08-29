/**
 * Assemblage du CP1 — une année scolaire complète.
 *
 * Les quatre disciplines instrumentales tournent en parallèle du premier au
 * dernier jour, comme dans une classe réelle : le programme officiel prévoit
 * de la lecture, du langage, de l'écriture et du calcul *chaque jour*
 * (grille horaire p. 128). Rien n'est verrouillé au niveau d'une discipline ;
 * la progression est portée par les prérequis de leçon à leçon.
 */
import {
  calendarLesson,
  colorLesson,
  comparisonLesson,
  copyLesson,
  countingLesson,
  doubleHalfLesson,
  graphismLesson,
  groupingLesson,
  letterWritingLesson,
  mentalTableLesson,
  moneyLesson,
  numberWritingLesson,
  numbersInWordsLesson,
  operationLesson,
  operationVerbsLesson,
  problemLesson,
  quantityLesson,
  readingRevisionLesson,
  sentenceReadingLesson,
  shapeLesson,
  signsLesson,
  sizeLesson,
  soundCombinationLesson,
  soundDiscoveryLesson,
  spatialLesson,
  storyLesson,
  structureLesson,
  vocabularyLesson,
} from './builders';
import type { LessonSpec, WorldSpec } from './lesson';
import {
  CP1_CONSONANTS,
  CP1_READING_UNITS,
  CP1_SOUNDS,
  CP1_VOWELS,
  type SoundUnit,
} from './data/reading-cp1';
import { CP1_PROBLEMS } from './data/math';
import { THEMES } from './data/vocabulary';

/** Syllabes servant de distracteurs — puisées dans les sons déjà étudiés. */
const DISTRACTOR_SYLLABLES = [
  'ba',
  'ma',
  'ta',
  'la',
  'sa',
  'ra',
  'pa',
  'da',
  'bi',
  'mi',
  'ti',
  'li',
  'si',
  'ri',
  'pi',
  'di',
  'bo',
  'mo',
  'to',
  'lo',
  'so',
  'ro',
  'po',
  'do',
];

/** A lesson chained after another always has a predecessor — fail loudly if not. */
function required(value: string | null): string {
  if (!value) {
    throw new Error('lesson chaining lost its predecessor');
  }
  return value;
}

// ---------------------------------------------------------------------------
// Lecture
// ---------------------------------------------------------------------------

function buildReading(): WorldSpec[] {
  const worlds: WorldSpec[] = [];
  let previous: string | null = null;
  let revisionIndex = 0;
  const seen: SoundUnit[] = [];

  const addRevision = (lessons: LessonSpec[], week: number): void => {
    const group = seen.slice(-4);
    if (group.length < 2 || !previous) {
      return;
    }
    const lesson = readingRevisionLesson('cp1', revisionIndex, group, week, previous);
    revisionIndex += 1;
    lessons.push(lesson);
    previous = lesson.id;
  };

  // Monde 1 — les six voyelles simples.
  const vowelLessons: LessonSpec[] = [];
  for (const unit of CP1_VOWELS) {
    const others = CP1_VOWELS.filter((candidate) => candidate.id !== unit.id).map(
      (candidate) => candidate.glyph,
    );
    const lesson = soundDiscoveryLesson(unit, 'cp1', previous, others);
    vowelLessons.push(lesson);
    previous = lesson.id;
    seen.push(unit);
  }
  addRevision(vowelLessons, 6);
  worlds.push({
    id: 'cp1-lecture-voyelles',
    title: 'Les voyelles',
    subtitle: 'a, i, o, u, e, é — les sons qui ouvrent la bouche',
    subject: 'reading',
    lessons: vowelLessons,
  });

  // Mondes 2 à 4 — les consonnes, par paquets de progression.
  const consonantGroups: { id: string; title: string; subtitle: string; units: SoundUnit[] }[] = [
    {
      id: 'cp1-lecture-consonnes-1',
      title: 'Les premières consonnes',
      subtitle: 'l, m, r, s — celles qu’on peut faire durer',
      units: CP1_CONSONANTS.slice(0, 4),
    },
    {
      id: 'cp1-lecture-consonnes-2',
      title: 'D’autres consonnes',
      subtitle: 'p, t, d, b, n, f, v',
      units: CP1_CONSONANTS.slice(4, 11),
    },
    {
      id: 'cp1-lecture-consonnes-3',
      title: 'Les dernières lettres',
      subtitle: 'j, ch, c, g',
      units: CP1_CONSONANTS.slice(11),
    },
  ];

  for (const group of consonantGroups) {
    const lessons: LessonSpec[] = [];
    for (const [index, unit] of group.units.entries()) {
      const others = CP1_CONSONANTS.filter((candidate) => candidate.id !== unit.id)
        .map((candidate) => candidate.glyph)
        .slice(0, 4);
      const discovery = soundDiscoveryLesson(unit, 'cp1', previous, others);
      lessons.push(discovery);
      const combination = soundCombinationLesson(
        unit,
        'cp1',
        discovery.id,
        DISTRACTOR_SYLLABLES.filter((syllable) => !unit.syllables.includes(syllable)),
      );
      lessons.push(combination);
      previous = combination.id;
      seen.push(unit);
      if ((index + 1) % 4 === 0) {
        addRevision(lessons, unit.week);
      }
    }
    if (lessons[lessons.length - 1]?.id.includes('revision') === false) {
      addRevision(lessons, group.units[group.units.length - 1]!.week);
    }
    worlds.push({ ...group, subject: 'reading', lessons });
  }

  // Monde 5 — les deux graphies composées du CP1.
  const soundLessons: LessonSpec[] = [];
  for (const unit of CP1_SOUNDS) {
    const discovery = soundDiscoveryLesson(
      unit,
      'cp1',
      previous,
      ['ou', 'oi', 'on', 'an'].filter((glyph) => glyph !== unit.glyph),
    );
    soundLessons.push(discovery);
    const combination = soundCombinationLesson(unit, 'cp1', discovery.id, DISTRACTOR_SYLLABLES);
    soundLessons.push(combination);
    previous = combination.id;
    seen.push(unit);
  }
  addRevision(soundLessons, 23);
  worlds.push({
    id: 'cp1-lecture-sons',
    title: 'Des sons nouveaux',
    subtitle: 'ou et oi — deux lettres, un seul son',
    subject: 'reading',
    lessons: soundLessons,
  });

  // Monde 6 — lire des phrases, avec les seuls sons déjà rencontrés.
  const sentenceLessons: LessonSpec[] = [];
  for (let index = 0; index < 7; index += 1) {
    const lesson = sentenceReadingLesson(
      'cp1',
      CP1_READING_UNITS.filter((unit) => unit.sentence.length > 6),
      index,
      24 + index,
      required(previous),
    );
    sentenceLessons.push(lesson);
    previous = lesson.id;
  }
  worlds.push({
    id: 'cp1-lecture-phrases',
    title: 'Je lis des phrases',
    subtitle: 'Mettre les mots ensemble et comprendre',
    subject: 'reading',
    lessons: sentenceLessons,
  });

  return worlds;
}

// ---------------------------------------------------------------------------
// Langage / élocution — les 18 thèmes officiels
// ---------------------------------------------------------------------------

const THEME_GROUPS = [
  {
    id: 'cp1-langage-1',
    title: 'Moi et mon école',
    subtitle: 'L’école, mon corps, mes habits, ma famille',
    ids: ['ecole', 'corps-humain', 'habits', 'famille'],
  },
  {
    id: 'cp1-langage-2',
    title: 'Ma maison, mon village',
    subtitle: 'La case, le village, les métiers, les animaux',
    ids: ['maison', 'village', 'metiers', 'animaux'],
  },
  {
    id: 'cp1-langage-3',
    title: 'La nature et les repas',
    subtitle: 'Les plantes, le temps, les aliments, le marché',
    ids: ['plantes', 'phenomenes-naturels', 'aliments', 'marche'],
  },
  {
    id: 'cp1-langage-4',
    title: 'Bouger et vivre ensemble',
    subtitle: 'Les voyages, les jeux, la santé, les fêtes',
    ids: ['voyages', 'jeux', 'transport', 'maladies', 'fetes', 'sentiments'],
  },
];

export function buildLanguage(level: 'cp1' | 'cp2', groups = THEME_GROUPS): WorldSpec[] {
  const worlds: WorldSpec[] = [];
  let previous: string | null = null;
  let themeIndex = 0;

  for (const group of groups) {
    const lessons: LessonSpec[] = [];
    for (const themeId of group.ids) {
      const theme = THEMES.find((candidate) => candidate.id === themeId);
      if (!theme) {
        throw new Error(`unknown theme: ${themeId}`);
      }
      const week = Math.min(30, 1 + Math.floor((themeIndex * 30) / THEMES.length));
      const vocabulary = vocabularyLesson(theme, level, week, previous);
      lessons.push(vocabulary);
      const structures = structureLesson(theme, level, week, vocabulary.id);
      lessons.push(structures);
      previous = structures.id;
      // Une leçon d'écoute d'histoire un thème sur deux au CP1, tous au CP2.
      if (level === 'cp2' || themeIndex % 2 === 0) {
        const story = storyLesson(theme, level, week, structures.id);
        lessons.push(story);
        previous = story.id;
      }
      themeIndex += 1;
    }
    worlds.push({
      id: level === 'cp1' ? group.id : group.id.replace('cp1', 'cp2'),
      title: group.title,
      subtitle: group.subtitle,
      subject: 'language',
      lessons,
    });
  }
  return worlds;
}

// ---------------------------------------------------------------------------
// Écriture — graphisme, puis lettres, puis chiffres, puis copie
// ---------------------------------------------------------------------------

/** Les tracés nommés par le programme (p. 26), dans son ordre. */
const GRAPHISM_SEQUENCE = [
  [
    { pattern: 'points', label: 'les points' },
    { pattern: 'ligne-verticale', label: 'les lignes debout' },
  ],
  [
    { pattern: 'ligne-horizontale', label: 'la ligne couchée' },
    { pattern: 'oblique', label: 'les lignes penchées' },
  ],
  [
    { pattern: 'rond', label: 'les ronds' },
    { pattern: 'courbe', label: 'les courbes' },
  ],
  [
    { pattern: 'boucle-haut', label: 'les boucles vers le haut' },
    { pattern: 'boucle-bas', label: 'les boucles vers le bas' },
  ],
  [
    { pattern: 'pont', label: 'les ponts' },
    { pattern: 'enchainement', label: 'les boucles enchaînées' },
  ],
];

/** Familles graphiques de lettres, comme au tableau (cf. p. 27). */
const LETTER_FAMILIES = [
  ['i', 'u', 't'],
  ['m', 'n', 'r'],
  ['c', 'o', 'a'],
  ['e', 'é', 's'],
  ['d', 'p'],
  ['l', 'b'],
  ['f', 'v'],
  ['j', 'g'],
];

function buildWriting(): WorldSpec[] {
  const worlds: WorldSpec[] = [];
  let previous: string | null = null;

  const graphism: LessonSpec[] = [];
  for (const [index, patterns] of GRAPHISM_SEQUENCE.entries()) {
    const lesson = graphismLesson(patterns, index, index + 1, previous);
    graphism.push(lesson);
    previous = lesson.id;
  }
  worlds.push({
    id: 'cp1-ecriture-graphisme',
    title: 'Ma main apprend',
    subtitle: 'Les tracés qui préparent à écrire',
    subject: 'writing',
    lessons: graphism,
  });

  const letters: LessonSpec[] = [];
  for (const [index, family] of LETTER_FAMILIES.entries()) {
    const lesson = letterWritingLesson(family, index, 6 + index * 2, required(previous));
    letters.push(lesson);
    previous = lesson.id;
  }
  worlds.push({
    id: 'cp1-ecriture-lettres',
    title: 'J’écris les lettres',
    subtitle: 'Les lettres étudiées en lecture',
    subject: 'writing',
    lessons: letters,
  });

  const numbers: LessonSpec[] = [];
  for (const [index, group] of [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ].entries()) {
    const lesson = numberWritingLesson(group, index, 22 + index, required(previous));
    numbers.push(lesson);
    previous = lesson.id;
  }
  worlds.push({
    id: 'cp1-ecriture-chiffres',
    title: 'J’écris les nombres',
    subtitle: 'Les chiffres, en chiffres et en lettres',
    subject: 'writing',
    lessons: numbers,
  });

  const copies: LessonSpec[] = [];
  const sources = CP1_CONSONANTS.slice(-5);
  for (const [index, unit] of sources.entries()) {
    const lesson = copyLesson(
      unit.words,
      unit.sentence,
      index,
      26 + index,
      required(previous),
      'cp1',
    );
    copies.push(lesson);
    previous = lesson.id;
  }
  worlds.push({
    id: 'cp1-ecriture-copie',
    title: 'Je copie et j’écris',
    subtitle: 'Des mots et des phrases tirés de la lecture',
    subject: 'writing',
    lessons: copies,
  });

  return worlds;
}

// ---------------------------------------------------------------------------
// Mathématiques
// ---------------------------------------------------------------------------

function buildMath(): WorldSpec[] {
  const worlds: WorldSpec[] = [];
  let previous: string | null = null;

  /** Chains each lesson onto the previous one of the same subject. */
  const link = (make: (previousId: string) => LessonSpec): LessonSpec => {
    const lesson = make(required(previous));
    previous = lesson.id;
    return lesson;
  };

  const first = sizeLesson('cp1', 1, null);
  previous = first.id;

  worlds.push({
    id: 'cp1-calcul-observation',
    title: 'Je regarde et je compare',
    subtitle: 'Tailles, couleurs, formes, repères',
    subject: 'math',
    lessons: [
      first,
      link((p) => colorLesson('cp1', 2, p)),
      link((p) => shapeLesson('cp1', 3, p)),
      link((p) => spatialLesson('cp1', 4, p)),
      link((p) => quantityLesson('cp1', 5, p)),
      link((p) => comparisonLesson('cp1', 6, p, 20)),
      link((p) => operationVerbsLesson('cp1', 6, p)),
      link((p) => signsLesson('cp1', 6, p)),
    ],
  });

  worlds.push({
    id: 'cp1-calcul-nombres-10',
    title: 'Les nombres jusqu’à 10',
    subtitle: 'Compter, lire, écrire',
    subject: 'math',
    lessons: [
      link((p) => countingLesson('cp1', 0, 5, 0, 7, p)),
      link((p) => countingLesson('cp1', 6, 10, 1, 9, p)),
      link((p) => numbersInWordsLesson('cp1', [1, 2, 3, 4, 5, 6], 0, 11, p)),
      link((p) =>
        operationLesson(
          'cp1',
          'simple_addition',
          [
            [1, 2],
            [3, 2],
            [4, 1],
            [2, 3],
          ],
          0,
          12,
          p,
        ),
      ),
      link((p) =>
        operationLesson(
          'cp1',
          'simple_subtraction',
          [
            [5, 2],
            [4, 1],
            [6, 3],
            [7, 2],
          ],
          0,
          13,
          p,
        ),
      ),
      link((p) => mentalTableLesson('cp1', 'addition', 13, p)),
      link((p) => mentalTableLesson('cp1', 'soustraction', 14, p)),
      link((p) => problemLesson('cp1', CP1_PROBLEMS.slice(0, 4), 0, 14, p)),
    ],
  });

  worlds.push({
    id: 'cp1-calcul-nombres-20',
    title: 'Les nombres jusqu’à 20',
    subtitle: 'La dizaine et les unités',
    subject: 'math',
    lessons: [
      link((p) => countingLesson('cp1', 11, 15, 2, 15, p)),
      link((p) => countingLesson('cp1', 16, 20, 3, 17, p)),
      link((p) => groupingLesson('cp1', 'dizaine', 19, p)),
      link((p) => numbersInWordsLesson('cp1', [11, 12, 13, 15, 18, 20], 1, 20, p)),
      link((p) =>
        operationLesson(
          'cp1',
          'simple_addition',
          [
            [10, 4],
            [12, 3],
            [8, 6],
            [11, 5],
          ],
          1,
          21,
          p,
        ),
      ),
    ],
  });

  worlds.push({
    id: 'cp1-calcul-vie-courante',
    title: 'J’ajoute, j’enlève, je partage',
    subtitle: 'Le calcul de tous les jours',
    subject: 'math',
    lessons: [
      link((p) =>
        operationLesson(
          'cp1',
          'simple_subtraction',
          [
            [14, 4],
            [17, 5],
            [20, 8],
            [15, 3],
          ],
          1,
          22,
          p,
        ),
      ),
      link((p) => doubleHalfLesson('cp1', 24, p)),
      link((p) =>
        operationLesson(
          'cp1',
          'simple_multiplication',
          [
            [2, 2],
            [3, 2],
            [4, 2],
            [5, 2],
          ],
          0,
          25,
          p,
        ),
      ),
      link((p) =>
        operationLesson(
          'cp1',
          'simple_division',
          [
            [4, 2],
            [6, 2],
            [8, 2],
            [10, 2],
          ],
          0,
          26,
          p,
        ),
      ),
      link((p) => moneyLesson('cp1', 27, p)),
      link((p) => calendarLesson('cp1', 28, p)),
      link((p) => problemLesson('cp1', CP1_PROBLEMS.slice(4, 8), 1, 29, p)),
    ],
  });

  return worlds;
}

export function buildCp1(): WorldSpec[] {
  return [...buildLanguage('cp1'), ...buildReading(), ...buildWriting(), ...buildMath()];
}
