/**
 * Assemblage du CP2 — deuxième année du cours préparatoire.
 *
 * Le programme officiel traite CP1 et CP2 d'un seul tenant ; la répartition
 * entre les deux années est la décision pédagogique documentée dans
 * official-program.ts. Le CP2 reprend l'inventaire là où le CP1 s'arrête :
 * consonnes restantes, voyelles nasales, groupes consonantiques, syllabes
 * inverses, équivalences graphémiques ; nombres de 20 à 100, centaine,
 * opérations avec retenue, multiplication et division par 2 et par 5.
 */
import {
  calendarLesson,
  comparisonLesson,
  copyLesson,
  countingLesson,
  cp2ReadingLesson,
  cp2SoundLesson,
  doubleHalfLesson,
  groupingLesson,
  linesLesson,
  mentalTableLesson,
  moneyLesson,
  numberWritingLesson,
  numbersInWordsLesson,
  operationLesson,
  problemLesson,
  readingRevisionLesson,
  rulerLesson,
  sentenceReadingLesson,
  shapeLesson,
  signsLesson,
  tableOfFiveLesson,
  uppercaseLesson,
} from './builders';
import { buildLanguage } from './cp1';
import type { LessonSpec, WorldSpec } from './lesson';
import {
  CP2_READING_UNITS,
  CP2_TERM1,
  CP2_TERM2,
  CP2_TERM3,
  type Cp2Unit,
} from './data/reading-cp2';
import { CP2_PROBLEMS } from './data/math';

const DISTRACTOR_SYLLABLES = [
  'ban',
  'bon',
  'bin',
  'lan',
  'lon',
  'lin',
  'man',
  'mon',
  'min',
  'bla',
  'cla',
  'fla',
  'bra',
  'cra',
  'dra',
  'tra',
  'gra',
  'ar',
  'or',
  'ir',
  'ur',
  'al',
  'el',
  'il',
  'eur',
  'oir',
];

function required(value: string | null): string {
  if (!value) {
    throw new Error('lesson chaining lost its predecessor');
  }
  return value;
}

const CP2_THEME_GROUPS = [
  {
    id: 'cp1-langage-1',
    title: 'Moi et mon école',
    subtitle: 'Décrire, présenter, situer',
    ids: ['ecole', 'corps-humain', 'habits', 'famille'],
  },
  {
    id: 'cp1-langage-2',
    title: 'Ma maison, mon village',
    subtitle: 'Raconter la vie autour de moi',
    ids: ['maison', 'village', 'metiers', 'animaux'],
  },
  {
    id: 'cp1-langage-3',
    title: 'La nature et les repas',
    subtitle: 'Expliquer et justifier',
    ids: ['plantes', 'phenomenes-naturels', 'aliments', 'marche'],
  },
  {
    id: 'cp1-langage-4',
    title: 'Bouger et vivre ensemble',
    subtitle: 'Dialoguer et exprimer ce qu’on ressent',
    ids: ['voyages', 'jeux', 'transport', 'maladies', 'fetes', 'sentiments'],
  },
];

// ---------------------------------------------------------------------------
// Lecture
// ---------------------------------------------------------------------------

interface ReadingGroup {
  id: string;
  title: string;
  subtitle: string;
  units: Cp2Unit[];
  withRevision: boolean;
}

function buildReading(): WorldSpec[] {
  const worlds: WorldSpec[] = [];
  let previous: string | null = null;
  let revisionIndex = 0;
  let unitIndex = 0;

  const groups: ReadingGroup[] = [
    {
      id: 'cp2-lecture-consonnes',
      title: 'Je reprends les sons',
      subtitle: 'k, qu, z, x, h, w, y',
      units: CP2_TERM1.slice(0, 3),
      withRevision: true,
    },
    {
      id: 'cp2-lecture-nasales',
      title: 'Les sons dans le nez',
      subtitle: 'an, on, in, un',
      units: CP2_TERM1.slice(3),
      withRevision: true,
    },
    {
      id: 'cp2-lecture-groupes',
      title: 'Les groupes de lettres',
      subtitle: 'bl, cl, br, tr, gn, gu…',
      units: CP2_TERM2.slice(0, 4),
      withRevision: true,
    },
    {
      id: 'cp2-lecture-sons',
      title: 'D’autres sons',
      subtitle: 'eu, au, eau, ai, ei',
      units: CP2_TERM2.slice(4),
      withRevision: true,
    },
    {
      id: 'cp2-lecture-inverses',
      title: 'Les syllabes inverses',
      subtitle: 'ar, or, al, ac, eur, oir…',
      units: CP2_TERM3.slice(0, 6),
      withRevision: true,
    },
    {
      id: 'cp2-lecture-equivalences',
      title: 'Un son, plusieurs écritures',
      subtitle: 'o = au = eau, é = er = ez…',
      units: CP2_TERM3.slice(6),
      withRevision: false,
    },
  ];

  for (const group of groups) {
    const lessons: LessonSpec[] = [];
    for (const unit of group.units) {
      const discovery = cp2SoundLesson(unit, unitIndex, previous, DISTRACTOR_SYLLABLES);
      lessons.push(discovery);
      const reading = cp2ReadingLesson(unit, discovery.id, DISTRACTOR_SYLLABLES);
      lessons.push(reading);
      previous = reading.id;
      unitIndex += 1;
    }
    if (group.withRevision) {
      const revision = readingRevisionLesson(
        'cp2',
        revisionIndex,
        group.units,
        group.units[group.units.length - 1]!.week,
        required(previous),
      );
      revisionIndex += 1;
      lessons.push(revision);
      previous = revision.id;
    }
    worlds.push({
      id: group.id,
      title: group.title,
      subtitle: group.subtitle,
      subject: 'reading',
      lessons,
    });
  }

  // Deux mondes de consolidation, placés aux semaines creuses de fin de
  // trimestre (8-10 et 18-20), comme les semaines de révision d'une classe.
  const consolidation: { id: string; title: string; subtitle: string; weeks: number[] }[] = [
    {
      id: 'cp2-lecture-textes-1',
      title: 'Je lis des textes',
      subtitle: 'Fin du premier trimestre',
      weeks: [8, 9, 10],
    },
    {
      id: 'cp2-lecture-textes-2',
      title: 'Je lis plus vite',
      subtitle: 'Fin du deuxième trimestre',
      weeks: [18, 19, 20],
    },
  ];
  for (const [groupIndex, group] of consolidation.entries()) {
    const lessons: LessonSpec[] = [];
    for (const [index, week] of group.weeks.entries()) {
      const lesson = sentenceReadingLesson(
        'cp2',
        CP2_READING_UNITS,
        groupIndex * 3 + index,
        week,
        required(previous),
      );
      lessons.push(lesson);
      previous = lesson.id;
    }
    worlds.push({
      id: group.id,
      title: group.title,
      subtitle: group.subtitle,
      subject: 'reading',
      lessons,
    });
  }

  return worlds;
}

// ---------------------------------------------------------------------------
// Écriture — majuscules, copie, nombres
// ---------------------------------------------------------------------------

/** Familles de majuscules du programme (p. 27), citées dans son ordre. */
const UPPERCASE_FAMILIES = [
  ['i', 'h', 'k', 'j', 'z'],
  ['p', 'b', 'r', 'f'],
  ['s', 'l', 'd', 'c'],
  ['g', 'x', 'e', 't'],
  ['u', 'v', 'w', 'y'],
  ['a', 'n', 'm', 'o'],
];

function buildWriting(): WorldSpec[] {
  const worlds: WorldSpec[] = [];
  let previous: string | null = null;

  const uppercase: LessonSpec[] = [];
  for (const [index, family] of UPPERCASE_FAMILIES.entries()) {
    const lesson = uppercaseLesson(
      family,
      index,
      1 + index,
      previous ? required(previous) : 'cp2-ecriture-majuscules-0',
    );
    // La première leçon d'écriture du CP2 n'a pas de prérequis.
    if (index === 0) {
      lesson.prerequisiteLessonIds = [];
    }
    uppercase.push(lesson);
    previous = lesson.id;
  }
  worlds.push({
    id: 'cp2-ecriture-majuscules',
    title: 'Majuscule et minuscule',
    subtitle: 'Reconnaître et tracer les deux écritures',
    subject: 'writing',
    lessons: uppercase,
  });

  const copies: LessonSpec[] = [];
  const copySources = [...CP2_TERM1.slice(3), ...CP2_TERM2.slice(0, 3)];
  for (const [index, unit] of copySources.entries()) {
    const lesson = copyLesson(
      unit.words,
      unit.sentence,
      index,
      8 + index * 2,
      required(previous),
      'cp2',
    );
    copies.push(lesson);
    previous = lesson.id;
  }
  worlds.push({
    id: 'cp2-ecriture-copie',
    title: 'Je copie des phrases',
    subtitle: 'Des mots et des phrases tirés de la lecture',
    subject: 'writing',
    lessons: copies,
  });

  const numbers: LessonSpec[] = [];
  for (const [index, group] of [
    [10, 11, 12],
    [20, 30, 40],
    [50, 60, 70],
    [80, 90, 100],
  ].entries()) {
    const lesson = numberWritingLesson(group, index, 22 + index * 2, required(previous), 'cp2');
    numbers.push(lesson);
    previous = lesson.id;
  }
  worlds.push({
    id: 'cp2-ecriture-chiffres',
    title: 'J’écris les grands nombres',
    subtitle: 'En chiffres et en toutes lettres',
    subject: 'writing',
    lessons: numbers,
  });

  const finalCopies: LessonSpec[] = [];
  for (const [index, unit] of CP2_TERM3.slice(0, 4).entries()) {
    const lesson = copyLesson(
      unit.words,
      unit.sentence,
      index + 10,
      27 + index,
      required(previous),
      'cp2',
    );
    finalCopies.push(lesson);
    previous = lesson.id;
  }
  worlds.push({
    id: 'cp2-ecriture-dictee',
    title: 'J’écris ce que j’entends',
    subtitle: 'Écrire des mots et des phrases dictés',
    subject: 'writing',
    lessons: finalCopies,
  });

  return worlds;
}

// ---------------------------------------------------------------------------
// Mathématiques
// ---------------------------------------------------------------------------

function buildMath(): WorldSpec[] {
  const worlds: WorldSpec[] = [];
  let previous: string | null = null;

  const link = (make: (previousId: string) => LessonSpec): LessonSpec => {
    const lesson = make(required(previous));
    previous = lesson.id;
    return lesson;
  };

  const first = countingLesson('cp2', 0, 20, 0, 1, null);
  previous = first.id;

  worlds.push({
    id: 'cp2-calcul-rappel',
    title: 'Je reprends le CP1',
    subtitle: 'Les nombres jusqu’à 20, les formes',
    subject: 'math',
    lessons: [
      first,
      link((p) => shapeLesson('cp2', 2, p)),
      link((p) => comparisonLesson('cp2', 3, p, 100)),
      link((p) => signsLesson('cp2', 3, p)),
      link((p) => calendarLesson('cp2', 4, p)),
    ],
  });

  worlds.push({
    id: 'cp2-calcul-nombres-100',
    title: 'Les nombres jusqu’à 100',
    subtitle: 'La dizaine, la centaine',
    subject: 'math',
    lessons: [
      link((p) => countingLesson('cp2', 20, 50, 1, 5, p)),
      link((p) => countingLesson('cp2', 50, 70, 2, 7, p)),
      link((p) => countingLesson('cp2', 70, 100, 3, 9, p)),
      link((p) => groupingLesson('cp2', 'centaine', 11, p)),
      link((p) => numbersInWordsLesson('cp2', [21, 35, 48, 60, 72, 90], 0, 12, p)),
    ],
  });

  worlds.push({
    id: 'cp2-calcul-retenue',
    title: 'Le calcul avec retenue',
    subtitle: 'Additionner et soustraire de plus grands nombres',
    subject: 'math',
    lessons: [
      link((p) =>
        operationLesson(
          'cp2',
          'simple_addition',
          [
            [17, 8],
            [26, 7],
            [38, 5],
            [45, 9],
          ],
          0,
          13,
          p,
          true,
        ),
      ),
      link((p) =>
        operationLesson(
          'cp2',
          'simple_addition',
          [
            [24, 18],
            [36, 27],
            [45, 35],
            [58, 24],
          ],
          1,
          15,
          p,
          true,
        ),
      ),
      link((p) =>
        operationLesson(
          'cp2',
          'simple_subtraction',
          [
            [32, 7],
            [41, 8],
            [53, 6],
            [64, 9],
          ],
          0,
          17,
          p,
          true,
        ),
      ),
      link((p) =>
        operationLesson(
          'cp2',
          'simple_subtraction',
          [
            [45, 18],
            [62, 27],
            [70, 35],
            [84, 46],
          ],
          1,
          19,
          p,
          true,
        ),
      ),
      link((p) => mentalTableLesson('cp2', 'addition', 20, p)),
      link((p) => mentalTableLesson('cp2', 'soustraction', 20, p)),
    ],
  });

  worlds.push({
    id: 'cp2-calcul-multiplication',
    title: 'Multiplier et partager',
    subtitle: 'Par 2 et par 5',
    subject: 'math',
    lessons: [
      link((p) =>
        operationLesson(
          'cp2',
          'simple_multiplication',
          [
            [6, 2],
            [8, 2],
            [12, 2],
            [15, 2],
          ],
          0,
          21,
          p,
        ),
      ),
      link((p) =>
        operationLesson(
          'cp2',
          'simple_multiplication',
          [
            [4, 5],
            [7, 5],
            [9, 5],
            [12, 5],
          ],
          1,
          22,
          p,
        ),
      ),
      link((p) => tableOfFiveLesson(23, p)),
      link((p) =>
        operationLesson(
          'cp2',
          'simple_division',
          [
            [12, 2],
            [18, 2],
            [24, 2],
            [30, 2],
          ],
          0,
          24,
          p,
        ),
      ),
      link((p) =>
        operationLesson(
          'cp2',
          'simple_division',
          [
            [20, 5],
            [35, 5],
            [45, 5],
            [50, 5],
          ],
          1,
          25,
          p,
        ),
      ),
      link((p) => doubleHalfLesson('cp2', 26, p)),
    ],
  });

  worlds.push({
    id: 'cp2-calcul-vie-courante',
    title: 'Le calcul de tous les jours',
    subtitle: 'L’argent, les lignes, les problèmes',
    subject: 'math',
    lessons: [
      link((p) => moneyLesson('cp2', 27, p)),
      link((p) => rulerLesson(28, p)),
      link((p) => linesLesson(28, p)),
      link((p) => problemLesson('cp2', CP2_PROBLEMS.slice(0, 4), 0, 29, p)),
      link((p) => problemLesson('cp2', CP2_PROBLEMS.slice(4, 8), 1, 30, p)),
    ],
  });

  return worlds;
}

export function buildCp2(): WorldSpec[] {
  const language = buildLanguage('cp2', CP2_THEME_GROUPS);
  return [...language, ...buildReading(), ...buildWriting(), ...buildMath()];
}
