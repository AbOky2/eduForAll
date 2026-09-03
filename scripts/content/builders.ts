/**
 * Lesson builders — turn the pedagogical data into lessons.
 *
 * One builder per lesson archetype of the Chadian CP. Everything is
 * deterministic: same data in, byte-identical manifest out.
 */
import { say, numberToWords } from './audio';
import type { LessonSpec } from './lesson';
import {
  skillLanguage,
  skillLetter,
  skillMath,
  skillNumber,
  skillReading,
  skillSound,
  skillWriting,
  termOfWeek,
} from './lesson';
import {
  MAX_ORDERED_WORDS,
  attributeStep,
  audioMcqStep,
  composeSyllableStep,
  composeWordStep,
  countObjectsStep,
  compareNumbersStep,
  fillMissingLetterStep,
  graphismStep,
  imageMcqStep,
  listenRepeatStep,
  listenStep,
  matchPairsStep,
  miniStoryStep,
  moneyStep,
  numberSequenceStep,
  operationStep,
  orderWordsStep,
  soundPositionStep,
  spatialStep,
  tapLetterStep,
  tapSyllableStep,
  textMcqStep,
  traceLetterStep,
  wordProblemStep,
  type AnyStep,
  type SpatialRelation,
} from './steps';
import type { SoundUnit, WordEntry } from './data/reading-cp1';
import type { Cp2Unit } from './data/reading-cp2';
import type { Theme } from './data/vocabulary';
import {
  CFA_COINS,
  COUNTABLES,
  OFFICIAL_SHAPES,
  SCHOOL_MONTHS,
  WEEKDAYS,
  type Countable,
  type WordProblem,
} from './data/math';

/** Deterministic rotation through a list — no randomness, stable output. */
export function pick<T>(list: readonly T[], index: number): T {
  const value = list[((index % list.length) + list.length) % list.length];
  if (value === undefined) {
    throw new Error('pick from empty list');
  }
  return value;
}

function rotate<T>(list: readonly T[], start: number, count: number): T[] {
  return Array.from({ length: count }, (_, offset) => pick(list, start + offset));
}

/** Three plausible number options containing the answer, ordered ascending. */
export function numberOptions(answer: number, spread = 2, max = 100): number[] {
  const candidates = new Set<number>([answer]);
  for (let delta = 1; candidates.size < 3; delta += 1) {
    if (answer + delta * spread <= max) {
      candidates.add(answer + delta * spread);
    }
    if (answer - delta * spread >= 0) {
      candidates.add(answer - delta * spread);
    }
    if (delta > max) {
      break;
    }
  }
  return [...candidates].slice(0, 3).sort((a, b) => a - b);
}

function base(id: string, skills: string[]) {
  return { lessonId: id, skills };
}

function wordCount(sentence: string): number {
  return sentence.replace(/[.!?]$/, '').split(' ').length;
}

// ===========================================================================
// LECTURE
// ===========================================================================

/** Leçon 1 d'un son : découverte, reconnaissance auditive, localisation. */
export function soundDiscoveryLesson(
  unit: SoundUnit,
  level: 'cp1',
  previousId: string | null,
  distractorGlyphs: string[],
): LessonSpec {
  const id = `${level}-lecture-${unit.id}-1`;
  const skills = [skillSound(unit.id)];
  const ctx = base(id, skills);
  const steps: AnyStep[] = [
    listenStep(
      ctx,
      unit.glyph,
      unit.kind === 'consonne' ? say.letter(unit.glyph) : say.sound(unit.glyph),
      `Écoute le son « ${unit.glyph} ».`,
    ),
    // Une lettre se touche comme lettre ; un digramme (ou, oi, ch) se touche
    // entier — le couper en deux détruirait justement ce qu'on enseigne.
    unit.glyph.length === 1
      ? tapLetterStep(ctx, unit.glyph, [
          unit.glyph,
          ...distractorGlyphs.filter((glyph) => glyph.length === 1).slice(0, 3),
        ])
      : tapSyllableStep(ctx, unit.glyph, [
          unit.glyph,
          ...distractorGlyphs.filter((glyph) => glyph !== unit.glyph).slice(0, 3),
        ]),
  ];
  for (const word of unit.words.slice(0, 3)) {
    if (word.position) {
      steps.push(soundPositionStep(ctx, word.word, unit.glyph, word.position));
    }
  }
  const illustrated = unit.words.filter((word) => word.icon);
  if (illustrated.length >= 3) {
    const [correct, ...rest] = illustrated;
    steps.push(
      imageMcqStep(
        ctx,
        { word: correct!.word, icon: correct!.icon as string },
        rest.slice(0, 2).map((entry) => ({ word: entry.word, icon: entry.icon as string })),
      ),
    );
  }
  steps.push(listenRepeatStep(ctx, unit.words[0]!.word));

  return {
    id,
    title: unit.name,
    shortDescription: `Découvrir le son « ${unit.glyph} » et le reconnaître dans des mots.`,
    learningObjectives: [
      `Reconnaître le son « ${unit.glyph} » à l’oral`,
      `Situer le son « ${unit.glyph} » au début, au milieu ou à la fin d’un mot`,
    ],
    skills,
    estimatedDurationMinutes: 12,
    term: termOfWeek(unit.week),
    week: unit.week,
    officialReference: unit.officialReference,
    prerequisiteLessonIds: previousId ? [previousId] : [],
    steps: steps.slice(0, 8),
  };
}

/** Leçon 2 d'un son : combinatoire — syllabes puis mots. */
export function soundCombinationLesson(
  unit: SoundUnit,
  level: 'cp1',
  previousId: string,
  otherSyllables: string[],
): LessonSpec {
  const id = `${level}-lecture-${unit.id}-2`;
  const skills = [skillSound(unit.id), skillReading('combinatoire')];
  const ctx = base(id, skills);
  const steps: AnyStep[] = [];

  if (unit.syllables.length > 0) {
    const target = unit.syllables[0] as string;
    steps.push(
      listenStep(ctx, target, say.syllable(target), 'Écoute la syllabe.'),
      audioMcqStep(ctx, target, rotate(otherSyllables, 0, 2), say.syllable, 'grid'),
      composeSyllableStep(ctx, unit.syllables[1] ?? target, [pick(otherSyllables, 3)[0] as string]),
      tapSyllableStep(ctx, unit.syllables[2] ?? target, [
        unit.syllables[2] ?? target,
        ...rotate(otherSyllables, 4, 3),
      ]),
    );
  }

  const words = unit.words.filter((word) => word.syllables.length >= 2);
  for (const word of words.slice(0, 2)) {
    steps.push(composeWordStep(ctx, word.word, word.syllables, [pick(otherSyllables, 7)]));
  }
  const first = unit.words[0] as WordEntry;
  const maskedIndex = indexOfSound(first.word, [unit.glyph]);
  steps.push(
    fillMissingLetterStep(
      ctx,
      first.word,
      maskedIndex,
      letterDistractors(first.word[maskedIndex] as string),
    ),
  );
  steps.push(listenRepeatStep(ctx, unit.sentence));

  return {
    id,
    title: `${unit.name} : les syllabes`,
    shortDescription: `Former des syllabes et des mots avec « ${unit.glyph} ».`,
    learningObjectives: [
      `Fusionner « ${unit.glyph} » avec les voyelles connues`,
      'Composer des mots à partir de leurs syllabes',
    ],
    skills,
    estimatedDurationMinutes: 14,
    term: termOfWeek(unit.week),
    week: unit.week,
    officialReference: unit.officialReference,
    prerequisiteLessonIds: [previousId],
    steps: steps.slice(0, 9),
  };
}

/** Leçon de son du CP2 — plusieurs graphies réunies dans la même famille. */
export function cp2SoundLesson(
  unit: Cp2Unit,
  index: number,
  previousId: string | null,
  otherSyllables: string[],
): LessonSpec {
  const id = `cp2-lecture-${unit.id}-1`;
  const skills = [skillSound(unit.id)];
  const ctx = base(id, skills);
  const steps: AnyStep[] = [
    listenStep(ctx, unit.glyph, say.sound(unit.glyph), `Écoute le son « ${unit.glyph} ».`),
  ];
  for (const word of unit.words.slice(0, 2)) {
    if (word.position) {
      steps.push(soundPositionStep(ctx, word.word, unit.glyph, word.position));
    }
  }
  if (unit.syllables.length >= 2) {
    steps.push(
      audioMcqStep(
        ctx,
        unit.syllables[0] as string,
        rotate(otherSyllables, index, 2),
        say.syllable,
        'grid',
      ),
    );
  }
  const illustrated = unit.words.filter((word) => word.icon);
  if (illustrated.length >= 3) {
    const [correct, ...rest] = illustrated;
    steps.push(
      imageMcqStep(
        ctx,
        { word: correct!.word, icon: correct!.icon as string },
        rest.slice(0, 2).map((entry) => ({ word: entry.word, icon: entry.icon as string })),
      ),
    );
  }
  if (unit.variants.length > 1) {
    steps.push(
      textMcqStep(
        ctx,
        `Quelles lettres font le son « ${unit.glyph} » ?`,
        unit.variants.join(', '),
        [rotate(otherSyllables, index + 5, 2).join(', ')],
        'Regarde bien : plusieurs écritures font le même son.',
      ),
    );
  }
  steps.push(listenRepeatStep(ctx, unit.words[0]!.word));

  return {
    id,
    title: unit.name,
    shortDescription: `Découvrir le son « ${unit.glyph} » et ses écritures.`,
    learningObjectives: [
      `Reconnaître le son « ${unit.glyph} »`,
      `Connaître les écritures : ${unit.variants.join(', ')}`,
    ],
    skills,
    estimatedDurationMinutes: 12,
    term: termOfWeek(unit.week),
    week: unit.week,
    officialReference: unit.officialReference,
    prerequisiteLessonIds: previousId ? [previousId] : [],
    steps: steps.slice(0, 8),
  };
}

/** Leçon 2 du CP2 : lire des mots et une phrase avec le son étudié. */
export function cp2ReadingLesson(
  unit: Cp2Unit,
  previousId: string,
  otherSyllables: string[],
): LessonSpec {
  const id = `cp2-lecture-${unit.id}-2`;
  const skills = [skillSound(unit.id), skillReading('phrase')];
  const ctx = base(id, skills);
  const words = unit.words;
  const steps: AnyStep[] = [];

  for (const word of words.filter((entry) => entry.syllables.length >= 2).slice(0, 2)) {
    steps.push(composeWordStep(ctx, word.word, word.syllables, [pick(otherSyllables, 2)]));
  }
  const maskedIndex = indexOfSound(words[0]!.word, [...unit.variants, unit.glyph]);
  steps.push(
    fillMissingLetterStep(
      ctx,
      words[0]!.word,
      maskedIndex,
      letterDistractors(words[0]!.word[maskedIndex] as string),
    ),
    wordCount(unit.sentence) <= MAX_ORDERED_WORDS
      ? orderWordsStep(ctx, unit.sentence)
      : listenRepeatStep(ctx, unit.sentence),
    matchPairsStep(
      ctx,
      words.slice(0, 3).map((word) => [word.word, word.syllables[0] as string]),
    ),
    listenRepeatStep(ctx, unit.sentence),
  );

  return {
    id,
    title: `${unit.name} : je lis`,
    shortDescription: `Lire des mots et une phrase avec « ${unit.glyph} ».`,
    learningObjectives: [
      `Déchiffrer des mots contenant « ${unit.glyph} »`,
      'Lire une phrase simple en articulant correctement',
    ],
    skills,
    estimatedDurationMinutes: 14,
    term: termOfWeek(unit.week),
    week: unit.week,
    officialReference: unit.officialReference,
    prerequisiteLessonIds: [previousId],
    steps: steps.slice(0, 8),
  };
}

/** Révision d'un groupe de sons déjà vus. */
export function readingRevisionLesson(
  level: 'cp1' | 'cp2',
  index: number,
  units: SoundUnit[] | Cp2Unit[],
  week: number,
  previousId: string,
): LessonSpec {
  const id = `${level}-lecture-revision-${index + 1}`;
  const skills = units.map((unit) => skillSound(unit.id));
  const ctx = base(id, skills);
  const allWords = units.flatMap((unit) => unit.words);
  const steps: AnyStep[] = [];

  const syllables = units.flatMap((unit) => unit.syllables).filter(Boolean);
  if (syllables.length >= 3) {
    steps.push(
      audioMcqStep(
        ctx,
        syllables[0] as string,
        [syllables[1] as string, syllables[2] as string],
        say.syllable,
        'grid',
      ),
    );
  }
  const illustrated = allWords.filter((word) => word.icon);
  if (illustrated.length >= 3) {
    steps.push(
      imageMcqStep(
        ctx,
        { word: illustrated[0]!.word, icon: illustrated[0]!.icon as string },
        illustrated.slice(1, 3).map((entry) => ({ word: entry.word, icon: entry.icon as string })),
      ),
    );
  }
  const composable = allWords.filter((word) => word.syllables.length >= 2);
  if (composable[0]) {
    steps.push(
      composeWordStep(ctx, composable[0].word, composable[0].syllables, [
        pick(syllables.length ? syllables : ['ba'], 1),
      ]),
    );
  }
  steps.push(
    matchPairsStep(
      ctx,
      units.slice(0, 3).map((unit) => [unit.glyph, unit.words[0]!.word]),
      'Associe chaque son à un mot.',
    ),
    listenRepeatStep(ctx, units[0]!.sentence),
  );

  return {
    id,
    title: `Je revois : ${units.map((unit) => unit.glyph).join(', ')}`,
    shortDescription: 'Reprendre ensemble les sons des dernières semaines.',
    learningObjectives: ['Consolider les sons étudiés', 'Relire des mots déjà rencontrés'],
    skills,
    estimatedDurationMinutes: 12,
    term: termOfWeek(week),
    week,
    officialReference:
      'Lecture CP — « acquisition d’un capital de mots à utiliser pour démontrer le mécanisme de la lecture » (p. 23)',
    prerequisiteLessonIds: [previousId],
    steps: steps.slice(0, 7),
  };
}

/**
 * Where the studied sound actually sits in the word. A CP2 family such as
 * « fr, gr, pr, tr, vr » has no single grapheme: each word carries one of
 * them, so the first variant the word contains wins.
 */
function indexOfSound(word: string, candidates: string[]): number {
  for (const candidate of candidates) {
    const found = word.indexOf(candidate);
    if (found >= 0) {
      return found;
    }
  }
  // No variant found (silent letters, elision): mask the first letter.
  return 0;
}

const LETTER_POOL = ['a', 'e', 'i', 'o', 'u', 'm', 'l', 's', 'r', 't', 'b', 'p'];

/** Wrong letters that are plausible but different from the masked one. */
function letterDistractors(answer: string): string[] {
  return LETTER_POOL.filter((candidate) => candidate !== answer).slice(0, 2);
}

// ===========================================================================
// LANGAGE / ÉLOCUTION — 6 h par semaine (p. 128)
// ===========================================================================

const LANGUAGE_REF = 'Langage/Élocution CP — thèmes de vocabulaire (p. 19) et objectifs (p. 18)';

/** Leçon 1 d'un thème : le vocabulaire, entendu puis reconnu. */
export function vocabularyLesson(
  theme: Theme,
  level: 'cp1' | 'cp2',
  week: number,
  previousId: string | null,
): LessonSpec {
  const id = `${level}-langage-${theme.id}-1`;
  const skills = [skillLanguage(theme.id)];
  const ctx = base(id, skills);
  const words = level === 'cp1' ? theme.cp1Words : theme.cp2Words;
  const steps: AnyStep[] = [];

  for (let index = 0; index < 4; index += 1) {
    const correct = pick(words, index);
    const distractors = [pick(words, index + 1), pick(words, index + 2)].filter(
      (entry) => entry.word !== correct.word,
    );
    steps.push(
      imageMcqStep(
        ctx,
        { word: correct.word, icon: correct.icon },
        distractors.map((entry) => ({ word: entry.word, icon: entry.icon })),
        'Touche l’image du mot que tu entends.',
      ),
    );
  }
  // Articulation : « s'exprimer de façon compréhensible quant à la
  // prononciation et à l'articulation » (p. 18). On redit chaque mot, un par
  // un, puis la série — pas d'exercice artificiel sur la forme du mot.
  steps.push(
    listenRepeatStep(ctx, pick(words, 0).word),
    listenRepeatStep(
      ctx,
      words
        .map((entry) => entry.word)
        .slice(0, 3)
        .join(', '),
    ),
  );

  return {
    id,
    title: theme.title,
    shortDescription: `${theme.subtitle}.`,
    learningObjectives: [
      `Nommer les mots du thème « ${theme.official} »`,
      'Prononcer et articuler les mots nouveaux',
    ],
    skills,
    estimatedDurationMinutes: 12,
    term: termOfWeek(week),
    week,
    officialReference: `${LANGUAGE_REF} — « ${theme.official} »`,
    prerequisiteLessonIds: previousId ? [previousId] : [],
    steps: steps.slice(0, 8),
  };
}

/** Leçon 2 d'un thème : les structures langagières, dire et redire. */
export function structureLesson(
  theme: Theme,
  level: 'cp1' | 'cp2',
  week: number,
  previousId: string,
): LessonSpec {
  const id = `${level}-langage-${theme.id}-2`;
  const skills = [skillLanguage(theme.id), skillLanguage('structures')];
  const ctx = base(id, skills);
  const structures = level === 'cp1' ? theme.cp1Structures : theme.cp2Structures;
  const steps: AnyStep[] = [];

  // Les phrases courtes se remettent dans l'ordre ; les longues s'écoutent et
  // se répètent — au CP2 les structures officielles dépassent souvent 8 mots.
  const short = structures.filter((sentence) => wordCount(sentence) <= MAX_ORDERED_WORDS);
  const long = structures.filter((sentence) => wordCount(sentence) > MAX_ORDERED_WORDS);

  for (const structure of [...long, ...structures].slice(0, 2)) {
    steps.push(listenRepeatStep(ctx, structure));
  }
  for (const structure of short.slice(0, 2)) {
    steps.push(orderWordsStep(ctx, structure));
  }
  if (short.length === 0) {
    steps.push(listenRepeatStep(ctx, pick(structures, 2)));
  }
  steps.push(
    audioMcqStep(
      ctx,
      theme.exchange.answer,
      [...theme.exchange.distractors],
      say.sentence,
      'list',
      theme.exchange.question,
    ),
  );

  return {
    id,
    title: `${theme.title} : je parle`,
    shortDescription: 'Dire des phrases entières sur le thème.',
    learningObjectives: [
      'Mémoriser et dire des structures langagières',
      'Répondre de manière juste à une demande',
    ],
    skills,
    estimatedDurationMinutes: 13,
    term: termOfWeek(week),
    week,
    officialReference: `${LANGUAGE_REF} — structures : « les structures pour poser des questions, pour y répondre »`,
    prerequisiteLessonIds: [previousId],
    steps: steps.slice(0, 8),
  };
}

/** Leçon 3 : écouter une histoire du thème et y répondre. */
export function storyLesson(
  theme: Theme,
  level: 'cp1' | 'cp2',
  week: number,
  previousId: string,
): LessonSpec {
  const id = `${level}-langage-${theme.id}-3`;
  const skills = [skillLanguage(theme.id), skillLanguage('comprehension')];
  const ctx = base(id, skills);
  const structures = level === 'cp1' ? theme.cp1Structures : theme.cp2Structures;

  const short = structures.filter((sentence) => wordCount(sentence) <= MAX_ORDERED_WORDS);
  const steps: AnyStep[] = [
    miniStoryStep(ctx, theme.story.text, theme.story.question, theme.story.answer, [
      ...theme.story.distractors,
    ]),
    audioMcqStep(
      ctx,
      theme.exchange.answer,
      [...theme.exchange.distractors],
      say.sentence,
      'list',
      theme.exchange.question,
    ),
    listenRepeatStep(ctx, pick(structures, 0)),
    short.length > 0
      ? orderWordsStep(ctx, pick(short, 0))
      : listenRepeatStep(ctx, pick(structures, 1)),
  ];

  return {
    id,
    title: `${theme.title} : l’histoire`,
    shortDescription: 'Écouter une petite histoire et répondre aux questions.',
    learningObjectives: [
      'Comprendre un récit court à l’oral',
      'Donner un renseignement ponctuel après écoute',
    ],
    skills,
    estimatedDurationMinutes: 14,
    term: termOfWeek(week),
    week,
    officialReference: `${LANGUAGE_REF} — « prendre la parole dans des situations diverses (dialogue, récit…) »`,
    prerequisiteLessonIds: [previousId],
    steps,
  };
}

// ===========================================================================
// ÉCRITURE — le graphisme d'abord (p. 26)
// ===========================================================================

const GRAPHISM_REF =
  'Écriture CP — « L’étude de l’écriture proprement dite est précédée du graphisme » (p. 26)';
const WRITING_REF =
  'Écriture CP — « écriture des lettres de l’alphabet étudiées en lecture » (p. 26)';
const NUMBER_WRITING_REF =
  'Écriture CP — « écriture en chiffres et en lettres des nombres étudiés en mathématiques » (p. 26)';
const COPY_REF = 'Écriture CP — « copie de mots et de phrases tirés de la lecture » (p. 26)';

export function graphismLesson(
  patterns: { pattern: string; label: string }[],
  index: number,
  week: number,
  previousId: string | null,
): LessonSpec {
  const id = `cp1-ecriture-graphisme-${index + 1}`;
  const skills = [skillWriting('graphisme'), skillWriting(patterns[0]!.pattern)];
  const ctx = base(id, skills);
  const steps = patterns.map((entry) => graphismStep(ctx, entry.pattern, entry.label));
  while (steps.length < 3) {
    steps.push(graphismStep(ctx, patterns[0]!.pattern, patterns[0]!.label));
  }

  return {
    id,
    title: `Je trace ${patterns[0]!.label}`,
    shortDescription: 'Préparer sa main à écrire.',
    learningObjectives: [
      'Tenir correctement son outil et suivre un tracé',
      'Écrire de la gauche vers la droite',
    ],
    skills,
    estimatedDurationMinutes: 10,
    term: termOfWeek(week),
    week,
    officialReference: GRAPHISM_REF,
    prerequisiteLessonIds: previousId ? [previousId] : [],
    steps,
  };
}

export function letterWritingLesson(
  letters: string[],
  index: number,
  week: number,
  previousId: string,
  level: 'cp1' | 'cp2' = 'cp1',
): LessonSpec {
  const id = `${level}-ecriture-lettres-${index + 1}`;
  const skills = [skillWriting('lettres'), ...letters.map((letter) => skillLetter(letter))];
  const ctx = base(id, skills);
  const steps: AnyStep[] = [];
  for (const letter of letters) {
    steps.push(traceLetterStep(ctx, letter));
  }
  steps.push(tapLetterStep(ctx, letters[0] as string, [...letters, 'o'].slice(0, 4)));

  return {
    id,
    title: `J’écris ${letters.join(', ')}`,
    shortDescription: `Tracer les lettres ${letters.join(', ')}.`,
    learningObjectives: ['Reproduire la forme des lettres étudiées en lecture'],
    skills,
    estimatedDurationMinutes: 11,
    term: termOfWeek(week),
    week,
    officialReference: WRITING_REF,
    prerequisiteLessonIds: [previousId],
    steps: steps.slice(0, 6),
  };
}

export function numberWritingLesson(
  numbers: number[],
  index: number,
  week: number,
  previousId: string,
  level: 'cp1' | 'cp2' = 'cp1',
): LessonSpec {
  const id = `${level}-ecriture-chiffres-${index + 1}`;
  const skills = [skillWriting('chiffres'), skillNumber('ecriture')];
  const ctx = base(id, skills);
  const steps: AnyStep[] = [];
  // Le gabarit de tracé porte un chiffre ou un nombre à deux chiffres ;
  // cent se lit et s'associe, il ne se trace pas.
  for (const value of numbers.slice(0, 3).filter((candidate) => candidate < 100)) {
    steps.push(traceLetterStep(ctx, String(value)));
  }
  steps.push(
    matchPairsStep(
      ctx,
      numbers.slice(0, 3).map((value) => [String(value), numberToWords(value)]),
      'Associe le chiffre et son nom.',
    ),
  );

  return {
    id,
    title: `J’écris ${numbers.slice(0, 3).join(', ')}`,
    shortDescription: 'Écrire les nombres en chiffres et les lire en lettres.',
    learningObjectives: [
      'Écrire les nombres étudiés en mathématiques',
      'Lire un nombre écrit en lettres',
    ],
    skills,
    estimatedDurationMinutes: 11,
    term: termOfWeek(week),
    week,
    officialReference: NUMBER_WRITING_REF,
    prerequisiteLessonIds: [previousId],
    steps,
  };
}

/**
 * Copie et dictée — « copie de mots et de phrases tirés de la lecture » (p. 26).
 * Au CP la dictée n'est pas une discipline : c'est un exercice d'écriture.
 */
export function copyLesson(
  words: WordEntry[],
  sentence: string,
  index: number,
  week: number,
  previousId: string,
  level: 'cp1' | 'cp2',
): LessonSpec {
  const id = `${level}-ecriture-copie-${index + 1}`;
  const skills = [skillWriting('copie'), skillWriting('dictee')];
  const ctx = base(id, skills);
  const steps: AnyStep[] = [];

  for (const word of words.slice(0, 2)) {
    steps.push(
      audioMcqStep(
        ctx,
        word.word,
        words.slice(2, 4).map((entry) => entry.word),
        say.word,
        'grid',
        'Écoute le mot, puis touche la bonne écriture.',
      ),
    );
  }
  for (const word of words.filter((entry) => entry.syllables.length >= 2).slice(0, 2)) {
    steps.push(composeWordStep(ctx, word.word, word.syllables, []));
  }
  steps.push(
    wordCount(sentence) <= MAX_ORDERED_WORDS
      ? orderWordsStep(ctx, sentence)
      : listenRepeatStep(ctx, sentence),
  );

  return {
    id,
    title: `Je copie : ${words[0]!.word}`,
    shortDescription: 'Écrire des mots et une phrase entendus.',
    learningObjectives: [
      'Copier des mots tirés de la lecture',
      'Écrire une phrase entendue en respectant l’ordre des mots',
    ],
    skills,
    estimatedDurationMinutes: 12,
    term: termOfWeek(week),
    week,
    officialReference: COPY_REF,
    prerequisiteLessonIds: [previousId],
    steps: steps.slice(0, 7),
  };
}

export function uppercaseLesson(
  letters: string[],
  index: number,
  week: number,
  previousId: string,
): LessonSpec {
  const id = `cp2-ecriture-majuscules-${index + 1}`;
  const skills = [skillWriting('majuscules')];
  const ctx = base(id, skills);
  const steps: AnyStep[] = letters
    .slice(0, 3)
    .map((letter) => traceLetterStep(ctx, letter.toLowerCase()));
  steps.push(
    matchPairsStep(
      ctx,
      letters.slice(0, 3).map((letter) => [letter.toUpperCase(), letter.toLowerCase()]),
      'Associe la majuscule et la minuscule.',
    ),
  );

  return {
    id,
    title: `Les majuscules ${letters
      .slice(0, 3)
      .map((letter) => letter.toUpperCase())
      .join(' ')}`,
    shortDescription: 'Reconnaître et tracer les lettres majuscules.',
    learningObjectives: ['S’initier à l’écriture des majuscules'],
    skills,
    estimatedDurationMinutes: 11,
    term: termOfWeek(week),
    week,
    officialReference: 'Écriture CP — « initiation à l’écriture des majuscules » (p. 26)',
    prerequisiteLessonIds: [previousId],
    steps,
  };
}

// ===========================================================================
// MATHÉMATIQUES — activités mathématiques (p. 58-59) et calcul mental (p. 65)
// ===========================================================================

const REF = {
  sizes: 'Mathématiques CP — « les tailles : grand, petit, long, court » (p. 58)',
  colors: 'Mathématiques CP — « les couleurs : rouge, bleu, jaune, vert, blanc, noir » (p. 58)',
  shapes: 'Mathématiques CP — « les formes : rond, carré, rectangulaire, triangulaire » (p. 58)',
  markers:
    'Mathématiques CP — « les repères : devant, derrière, à droite, à gauche, au-dessus, à l’intérieur, à l’extérieur, sur, sous… » (p. 58)',
  quantities: 'Mathématiques CP — « les quantités : peu, beaucoup, rien, nul » (p. 58)',
  comparisons:
    'Mathématiques CP — « les comparaisons : plus… que ; moins… que ; autant de… que de… » (p. 58)',
  numbers20: 'Mathématiques CP — « les nombres de 0 à 20 (CP1) » (p. 58)',
  numbers100: 'Mathématiques CP — « les nombres de 20 à 100 (CP2) » (p. 58)',
  ten: 'Mathématiques CP — « notion de dizaine » (p. 58)',
  hundred: 'Mathématiques CP — « notion de centaine » (p. 58)',
  inWords:
    'Mathématiques CP — « lecture et écriture en chiffres et en lettres de ces nombres » (p. 59)',
  addSub:
    'Mathématiques CP — « l’addition et la soustraction des nombres entiers (sens et technique) » (p. 59)',
  carry:
    'Mathématiques CP — « l’addition et la soustraction des nombres entiers avec retenue » (p. 59)',
  multDiv: 'Mathématiques CP — « la multiplication et la division par 2 et par 5 » (p. 59)',
  doubleHalf: 'Calcul mental CP — « la notion de double et de moitié » (p. 65)',
  tableOfFive: 'Calcul mental CP — « la table de multiplication par 5 (CP2) » (p. 65)',
  figures:
    'Mathématiques CP — « identification des figures simples : carré, rectangle, triangle » (p. 59)',
  lines: 'Mathématiques CP — « les lignes courbes, droites et brisées » (p. 59)',
  money: 'Mathématiques CP — « les pièces de monnaie » (p. 59)',
  calendar: 'Mathématiques CP — « les jours, les semaines, les mois » (p. 59)',
  problems:
    'Calcul mental CP — « les courts énoncés des problèmes liés à la vie courante » (p. 65)',
  verbs: 'Mathématiques CP — « l’emploi des verbes : ajouter, enlever, ôter, réunir » (p. 58)',
  signs:
    'Mathématiques CP — « les signes de l’addition, de la soustraction, d’égalité, de la multiplication et de la division » (p. 58)',
  tables: 'Calcul mental CP — « les tables d’addition et de soustraction » (p. 65)',
  ruler: 'Mathématiques CP — « l’utilisation du double décimètre » (p. 59)',
};

function mathLesson(
  id: string,
  title: string,
  shortDescription: string,
  objectives: string[],
  skills: string[],
  steps: AnyStep[],
  week: number,
  officialReference: string,
  previousId: string | null,
  minutes = 12,
): LessonSpec {
  return {
    id,
    title,
    shortDescription,
    learningObjectives: objectives,
    skills,
    estimatedDurationMinutes: minutes,
    term: termOfWeek(week),
    week,
    officialReference,
    prerequisiteLessonIds: previousId ? [previousId] : [],
    steps: steps.slice(0, 8),
  };
}

/** « les tailles : grand, petit, long, court ». */
export function sizeLesson(level: 'cp1', week: number, previousId: string | null): LessonSpec {
  const id = `${level}-calcul-tailles`;
  const skills = [skillMath('tailles')];
  const ctx = base(id, skills);
  return mathLesson(
    id,
    'Grand ou petit ?',
    'Comparer les tailles et les longueurs.',
    ['Distinguer grand et petit', 'Distinguer long et court'],
    skills,
    [
      attributeStep(
        ctx,
        'size',
        'Touche le grand rond.',
        [
          { id: 'grand', shape: 'rond', color: 'bleu', scale: 1 },
          { id: 'petit', shape: 'rond', color: 'bleu', scale: 0.45 },
        ],
        'grand',
      ),
      attributeStep(
        ctx,
        'size',
        'Touche le petit carré.',
        [
          { id: 'grand', shape: 'carre', color: 'jaune', scale: 1 },
          { id: 'petit', shape: 'carre', color: 'jaune', scale: 0.4 },
        ],
        'petit',
      ),
      attributeStep(
        ctx,
        'size',
        'Touche la ligne la plus longue.',
        [
          { id: 'longue', shape: 'ligne', color: 'rouge', scale: 1 },
          { id: 'courte', shape: 'ligne', color: 'rouge', scale: 0.4 },
        ],
        'longue',
      ),
      attributeStep(
        ctx,
        'size',
        'Touche la ligne la plus courte.',
        [
          { id: 'longue', shape: 'ligne', color: 'vert', scale: 1 },
          { id: 'courte', shape: 'ligne', color: 'vert', scale: 0.35 },
        ],
        'courte',
      ),
      attributeStep(
        ctx,
        'size',
        'Touche le grand triangle.',
        [
          { id: 'petit', shape: 'triangle', color: 'noir', scale: 0.45 },
          { id: 'grand', shape: 'triangle', color: 'noir', scale: 1 },
        ],
        'grand',
      ),
    ],
    week,
    REF.sizes,
    previousId,
    10,
  );
}

/** « les couleurs : rouge, bleu, jaune, vert, blanc, noir ». */
export function colorLesson(level: 'cp1', week: number, previousId: string): LessonSpec {
  const id = `${level}-calcul-couleurs`;
  const skills = [skillMath('couleurs')];
  const ctx = base(id, skills);
  const asked = ['rouge', 'bleu', 'jaune', 'vert', 'noir'] as const;
  const steps = asked.map((color, index) => {
    const others = asked.filter((candidate) => candidate !== color);
    return attributeStep(
      ctx,
      'color',
      `Touche le rond ${color}.`,
      [
        { id: color, shape: 'rond', color },
        { id: pick(others, index), shape: 'rond', color: pick(others, index) },
        { id: pick(others, index + 1), shape: 'rond', color: pick(others, index + 1) },
      ],
      color,
    );
  });
  return mathLesson(
    id,
    'Les couleurs',
    'Nommer et reconnaître les six couleurs.',
    ['Reconnaître rouge, bleu, jaune, vert, blanc et noir'],
    skills,
    steps,
    week,
    REF.colors,
    previousId,
    10,
  );
}

/** « les formes : rond, carré, rectangulaire, triangulaire ». */
export function shapeLesson(level: 'cp1' | 'cp2', week: number, previousId: string): LessonSpec {
  const id = `${level}-calcul-formes`;
  const skills = [skillMath('formes')];
  const ctx = base(id, skills);
  const steps = OFFICIAL_SHAPES.map((shape, index) => {
    const others = OFFICIAL_SHAPES.filter((candidate) => candidate.id !== shape.id);
    return attributeStep(
      ctx,
      'shape',
      `Touche le ${shape.label}.`,
      [
        { id: shape.id, shape: shape.id, color: 'bleu' },
        { id: pick(others, index).id, shape: pick(others, index).id, color: 'jaune' },
        { id: pick(others, index + 1).id, shape: pick(others, index + 1).id, color: 'vert' },
      ],
      shape.id,
    );
  });
  steps.push(
    matchPairsStep(
      ctx,
      [
        ['rond', 'la lune'],
        ['carré', 'la fenêtre'],
        ['triangle', 'le toit'],
      ],
      'Associe la forme à un objet.',
    ),
  );
  return mathLesson(
    id,
    'Les formes',
    'Reconnaître le rond, le carré, le rectangle et le triangle.',
    ['Identifier les figures simples', 'Nommer une forme géométrique'],
    skills,
    steps,
    week,
    `${REF.shapes} ; ${REF.figures}`,
    previousId,
    11,
  );
}

/** « les repères : devant, derrière, sur, sous, entre… ». */
export function spatialLesson(level: 'cp1', week: number, previousId: string): LessonSpec {
  const id = `${level}-calcul-reperes`;
  const skills = [skillMath('reperes')];
  const ctx = base(id, skills);
  const cases: {
    instruction: string;
    correct: SpatialRelation;
    others: SpatialRelation[];
    object: string;
    reference: string;
  }[] = [
    {
      instruction: 'Le chat est sur la natte. Touche la bonne image.',
      correct: 'sur',
      others: ['sous', 'a-cote'],
      object: 'icon-cat',
      reference: 'icon-mat',
    },
    {
      instruction: 'Le chat est sous la natte. Touche la bonne image.',
      correct: 'sous',
      others: ['sur', 'a-droite'],
      object: 'icon-cat',
      reference: 'icon-mat',
    },
    {
      instruction: 'La calebasse est à côté du canari. Touche la bonne image.',
      correct: 'a-cote',
      others: ['sur', 'sous'],
      object: 'icon-calabash',
      reference: 'icon-jar',
    },
    {
      instruction: 'La chèvre est entre les deux arbres. Touche la bonne image.',
      correct: 'entre',
      others: ['a-gauche', 'a-droite'],
      object: 'icon-goat',
      reference: 'icon-tree',
    },
    {
      instruction: 'L’oiseau est au-dessus de la case. Touche la bonne image.',
      correct: 'au-dessus',
      others: ['en-dessous', 'dans'],
      object: 'icon-bird',
      reference: 'icon-hut',
    },
  ];
  const steps = cases.map((entry) =>
    spatialStep(
      ctx,
      entry.instruction,
      entry.object,
      entry.reference,
      [entry.correct, ...entry.others],
      entry.correct,
    ),
  );
  return mathLesson(
    id,
    'Où est-ce ?',
    'Sur, sous, à côté, entre, au-dessus.',
    ['Situer un objet par rapport à un autre', 'Employer les mots de repérage'],
    skills,
    steps,
    week,
    REF.markers,
    previousId,
    11,
  );
}

/** « les quantités : peu, beaucoup, rien, nul ». */
export function quantityLesson(level: 'cp1', week: number, previousId: string): LessonSpec {
  const id = `${level}-calcul-quantites`;
  const skills = [skillMath('quantites')];
  const ctx = base(id, skills);
  return mathLesson(
    id,
    'Peu ou beaucoup ?',
    'Estimer une quantité sans compter.',
    ['Distinguer peu, beaucoup, rien'],
    skills,
    [
      attributeStep(
        ctx,
        'quantity',
        'Touche la carte où il y a beaucoup de ronds.',
        [
          { id: 'beaucoup', shape: 'rond', color: 'bleu', count: 10 },
          { id: 'peu', shape: 'rond', color: 'bleu', count: 2 },
        ],
        'beaucoup',
      ),
      attributeStep(
        ctx,
        'quantity',
        'Touche la carte où il y a peu de carrés.',
        [
          { id: 'beaucoup', shape: 'carre', color: 'jaune', count: 9 },
          { id: 'peu', shape: 'carre', color: 'jaune', count: 2 },
        ],
        'peu',
      ),
      attributeStep(
        ctx,
        'quantity',
        'Touche la carte où il n’y a rien.',
        [
          { id: 'rien', shape: 'rond', color: 'blanc', count: 0 },
          { id: 'quelques', shape: 'rond', color: 'rouge', count: 4 },
        ],
        'rien',
      ),
      attributeStep(
        ctx,
        'quantity',
        'Touche la carte où il y a beaucoup de triangles.',
        [
          { id: 'peu', shape: 'triangle', color: 'vert', count: 1 },
          { id: 'beaucoup', shape: 'triangle', color: 'vert', count: 8 },
        ],
        'beaucoup',
      ),
    ],
    week,
    REF.quantities,
    previousId,
    10,
  );
}

/** « les comparaisons : plus… que ; moins… que ; autant de… que de… ». */
export function comparisonLesson(
  level: 'cp1' | 'cp2',
  week: number,
  previousId: string,
  max: number,
): LessonSpec {
  const id = `${level}-calcul-comparaisons`;
  const skills = [skillMath('comparaisons')];
  const ctx = base(id, skills);
  const pairs: [number, number][] =
    max <= 20
      ? [
          [3, 7],
          [9, 4],
          [12, 15],
          [18, 11],
        ]
      : [
          [34, 43],
          [78, 67],
          [55, 45],
          [90, 89],
        ];
  const steps = pairs.map(([left, right], index) =>
    compareNumbersStep(ctx, left, right, index % 2 === 0 ? 'greater' : 'smaller'),
  );
  return mathLesson(
    id,
    'Plus grand, plus petit',
    'Comparer deux nombres.',
    ['Comparer deux nombres', 'Employer « plus grand que » et « plus petit que »'],
    skills,
    steps,
    week,
    REF.comparisons,
    previousId,
    10,
  );
}

/** Comptage d'une tranche de nombres, avec des objets du quotidien. */
export function countingLesson(
  level: 'cp1' | 'cp2',
  from: number,
  to: number,
  index: number,
  week: number,
  previousId: string | null,
): LessonSpec {
  const id = `${level}-calcul-nombres-${from}-${to}`;
  const skills = [skillNumber(`${from}-${to}`)];
  const ctx = base(id, skills);
  const steps: AnyStep[] = [];
  for (let offset = 0; offset < 3; offset += 1) {
    const value = Math.min(to, from + offset * Math.max(1, Math.floor((to - from) / 3)));
    const object = pick(COUNTABLES, index * 3 + offset) as Countable;
    if (value <= 12) {
      steps.push(countObjectsStep(ctx, object, value, numberOptions(value, 1, to)));
    }
  }
  const start = from;
  steps.push(
    numberSequenceStep(
      ctx,
      [start, start + 1, null, start + 3],
      start + 2,
      numberOptions(start + 2, 1, to),
    ),
    audioMcqStep(
      ctx,
      String(to),
      [String(to - 1), String(to + 1)],
      (value) => say.number(Number(value)),
      'grid',
      'Touche le nombre que tu entends.',
    ),
    matchPairsStep(
      ctx,
      [from, Math.floor((from + to) / 2), to].map((value) => [String(value), numberToWords(value)]),
      'Associe le nombre et son nom.',
    ),
  );
  return mathLesson(
    id,
    `Les nombres de ${from} à ${to}`,
    `Compter, lire et écrire les nombres de ${from} à ${to}.`,
    [`Compter jusqu’à ${to}`, 'Lire un nombre en chiffres et en lettres'],
    skills,
    steps,
    week,
    to <= 20 ? REF.numbers20 : REF.numbers100,
    previousId,
    12,
  );
}

/** Notion de dizaine (CP1) puis de centaine (CP2). */
export function groupingLesson(
  level: 'cp1' | 'cp2',
  kind: 'dizaine' | 'centaine',
  week: number,
  previousId: string,
): LessonSpec {
  const id = `${level}-calcul-${kind}`;
  const skills = [skillNumber(kind)];
  const ctx = base(id, skills);
  const steps: AnyStep[] =
    kind === 'dizaine'
      ? [
          textMcqStep(ctx, 'Combien font 10 unités ?', '1 dizaine', ['2 dizaines', '10 dizaines']),
          textMcqStep(ctx, 'Dans 14, combien y a-t-il de dizaines ?', '1', ['4', '14']),
          textMcqStep(ctx, 'Dans 14, combien y a-t-il d’unités ?', '4', ['1', '10']),
          numberSequenceStep(ctx, [10, null, 30, 40], 20, [15, 20, 25]),
          operationStep(ctx, 'simple_addition', 10, 5, numberOptions(15, 1, 20)),
        ]
      : [
          textMcqStep(ctx, 'Combien font 10 dizaines ?', '1 centaine', [
            '10 centaines',
            '1 dizaine',
          ]),
          textMcqStep(ctx, 'Dans 100, combien y a-t-il de dizaines ?', '10', ['1', '100']),
          numberSequenceStep(ctx, [70, 80, null, 100], 90, [85, 90, 95]),
          operationStep(ctx, 'simple_addition', 90, 10, numberOptions(100, 5, 100), false),
          textMcqStep(ctx, 'Dans 100, combien y a-t-il d’unités ?', '100', ['10', '1']),
        ];
  return mathLesson(
    id,
    kind === 'dizaine' ? 'Dizaines et unités' : 'La centaine',
    kind === 'dizaine' ? 'Grouper par dix pour compter plus vite.' : 'Cent, c’est dix dizaines.',
    [kind === 'dizaine' ? 'Comprendre la notion de dizaine' : 'Comprendre la notion de centaine'],
    skills,
    steps,
    week,
    kind === 'dizaine' ? REF.ten : REF.hundred,
    previousId,
    12,
  );
}

type Op = 'simple_addition' | 'simple_subtraction' | 'simple_multiplication' | 'simple_division';

const OP_TITLE: Record<Op, string> = {
  simple_addition: 'J’ajoute',
  simple_subtraction: 'J’enlève',
  simple_multiplication: 'Je multiplie',
  simple_division: 'Je partage',
};

export function operationLesson(
  level: 'cp1' | 'cp2',
  op: Op,
  pairsList: [number, number][],
  index: number,
  week: number,
  previousId: string,
  withCarry = false,
): LessonSpec {
  const id = `${level}-calcul-${op.replace('simple_', '')}-${index + 1}`;
  const skills = [
    skillMath(op.replace('simple_', '')),
    ...(withCarry ? [skillMath('retenue')] : []),
  ];
  const ctx = base(id, skills);
  const steps = pairsList.map(([a, b], index) => {
    const answer =
      op === 'simple_addition'
        ? a + b
        : op === 'simple_subtraction'
          ? a - b
          : op === 'simple_multiplication'
            ? a * b
            : a / b;
    return operationStep(
      ctx,
      op,
      a,
      b,
      numberOptions(answer, answer > 20 ? 2 : 1, 200),
      // La division garde ses images : « partager en parts égales » se
      // comprend en voyant les parts, pas en lisant le signe ÷.
      a <= 20 && b <= 20,
      // Un objet du quotidien par exercice, dans un ordre stable : l'enfant
      // recompte des chèvres puis des mangues, jamais deux fois la même scène.
      COUNTABLES[index % COUNTABLES.length],
    );
  });
  const verbRef =
    op === 'simple_multiplication' || op === 'simple_division'
      ? REF.multDiv
      : withCarry
        ? REF.carry
        : REF.addSub;
  return mathLesson(
    id,
    `${OP_TITLE[op]}${withCarry ? ' avec retenue' : ''}`,
    withCarry ? 'Poser une opération avec retenue.' : 'Le sens et la technique de l’opération.',
    [
      op === 'simple_addition'
        ? 'Maîtriser le sens de l’addition'
        : op === 'simple_subtraction'
          ? 'Maîtriser le sens de la soustraction'
          : op === 'simple_multiplication'
            ? 'Connaître la règle de multiplication par 2 et par 5'
            : 'Connaître la règle de division par 2 et par 5',
    ],
    skills,
    steps,
    week,
    verbRef,
    previousId,
    13,
  );
}

/** « la notion de double et de moitié » (calcul mental, p. 65). */
export function doubleHalfLesson(
  level: 'cp1' | 'cp2',
  week: number,
  previousId: string,
): LessonSpec {
  const id = `${level}-calcul-double-moitie`;
  const skills = [skillMath('double-moitie')];
  const ctx = base(id, skills);
  const doubles = level === 'cp1' ? [2, 3, 4, 5] : [10, 15, 20, 25];
  const steps: AnyStep[] = doubles
    .slice(0, 2)
    .map((value) =>
      operationStep(ctx, 'simple_multiplication', value, 2, numberOptions(value * 2, 1, 100)),
    );
  for (const value of doubles.slice(2, 4)) {
    steps.push(
      operationStep(ctx, 'simple_division', value * 2, 2, numberOptions(value, 1, 100), false),
    );
  }
  steps.push(
    textMcqStep(ctx, `Quel est le double de ${doubles[0]} ?`, String((doubles[0] as number) * 2), [
      String((doubles[0] as number) + 1),
      String((doubles[0] as number) * 3),
    ]),
  );
  return mathLesson(
    id,
    'Le double et la moitié',
    'Deux fois plus, deux fois moins.',
    ['Calculer le double d’un nombre', 'Calculer la moitié d’un nombre'],
    skills,
    steps,
    week,
    REF.doubleHalf,
    previousId,
    12,
  );
}

/** « la table de multiplication par 5 (CP2) ». */
export function tableOfFiveLesson(week: number, previousId: string): LessonSpec {
  const id = 'cp2-calcul-table-5';
  const skills = [skillMath('table-5')];
  const ctx = base(id, skills);
  const steps: AnyStep[] = [2, 3, 4, 6].map((value) =>
    operationStep(ctx, 'simple_multiplication', value, 5, numberOptions(value * 5, 5, 100), false),
  );
  steps.push(
    matchPairsStep(
      ctx,
      [
        ['5 × 2', '10'],
        ['5 × 4', '20'],
        ['5 × 10', '50'],
      ],
      'Associe chaque calcul à son résultat.',
    ),
  );
  return mathLesson(
    id,
    'La table de 5',
    'Multiplier par cinq de tête.',
    ['Connaître la table de multiplication par 5'],
    skills,
    steps,
    week,
    REF.tableOfFive,
    previousId,
    12,
  );
}

/** « les pièces de monnaie » — en francs CFA. */
export function moneyLesson(level: 'cp1' | 'cp2', week: number, previousId: string): LessonSpec {
  const id = `${level}-calcul-monnaie`;
  const skills = [skillMath('monnaie')];
  const ctx = base(id, skills);
  const sets: number[][] =
    level === 'cp1'
      ? [
          [5, 5],
          [10, 5],
          [25, 25],
          [50, 25, 25],
        ]
      : [
          [100, 50],
          [50, 25, 25],
          [100, 100, 50],
          [500, 100],
        ];
  const steps = sets.map((coins) => {
    const total = coins.reduce((sum, coin) => sum + coin, 0);
    return moneyStep(ctx, coins, numberOptions(total, Math.max(5, Math.round(total / 4)), 2000));
  });
  return mathLesson(
    id,
    'Compter l’argent',
    'Reconnaître les pièces et faire le total.',
    ['Reconnaître les pièces de monnaie', 'Additionner des pièces pour trouver une somme'],
    skills,
    steps,
    week,
    REF.money,
    previousId,
    12,
  );
}

/** « les jours, les semaines, les mois ». */
export function calendarLesson(level: 'cp1' | 'cp2', week: number, previousId: string): LessonSpec {
  const id = `${level}-calcul-calendrier`;
  const skills = [skillMath('calendrier')];
  const ctx = base(id, skills);
  const steps: AnyStep[] = [
    orderWordsStep(ctx, WEEKDAYS.slice(0, 4).join(' ')),
    textMcqStep(ctx, 'Quel jour vient après mardi ?', 'mercredi', ['lundi', 'samedi']),
    textMcqStep(ctx, 'Combien de jours y a-t-il dans une semaine ?', '7', ['5', '10']),
  ];
  if (level === 'cp2') {
    steps.push(
      orderWordsStep(ctx, SCHOOL_MONTHS.slice(0, 4).join(' ')),
      textMcqStep(ctx, 'Quel mois ouvre l’année scolaire au Tchad ?', 'octobre', [
        'janvier',
        'juin',
      ]),
    );
  } else {
    steps.push(
      textMcqStep(ctx, 'Quel jour vient avant vendredi ?', 'jeudi', ['dimanche', 'mardi']),
    );
  }
  return mathLesson(
    id,
    'Les jours et les mois',
    'La semaine, le mois, l’année.',
    ['Nommer les jours de la semaine dans l’ordre', 'Situer un jour par rapport à un autre'],
    skills,
    steps,
    week,
    REF.calendar,
    previousId,
    11,
  );
}

/** « les courts énoncés des problèmes liés à la vie courante ». */
export function problemLesson(
  level: 'cp1' | 'cp2',
  problems: WordProblem[],
  index: number,
  week: number,
  previousId: string,
): LessonSpec {
  const id = `${level}-calcul-problemes-${index + 1}`;
  const skills = [skillMath('problemes')];
  const ctx = base(id, skills);
  const steps = problems.map((problem) =>
    wordProblemStep(
      ctx,
      problem.statement,
      problem.answer,
      numberOptions(problem.answer, problem.answer > 20 ? 5 : 1, 100),
      problem.icon,
    ),
  );
  return mathLesson(
    id,
    'Petits problèmes',
    'Résoudre des situations de tous les jours.',
    ['Comprendre un énoncé et choisir l’opération', 'Résoudre un problème de la vie courante'],
    skills,
    steps,
    week,
    REF.problems,
    previousId,
    14,
  );
}

/** « les lignes courbes, droites et brisées » (CP2). */
export function linesLesson(week: number, previousId: string): LessonSpec {
  const id = 'cp2-calcul-lignes';
  const skills = [skillMath('lignes')];
  const ctx = base(id, skills);
  return mathLesson(
    id,
    'Les lignes',
    'Droite, courbe ou brisée ?',
    ['Distinguer une ligne droite, une ligne courbe et une ligne brisée'],
    skills,
    [
      graphismStep(ctx, 'ligne-horizontale', 'la ligne droite'),
      graphismStep(ctx, 'courbe', 'la ligne courbe'),
      graphismStep(ctx, 'oblique', 'les lignes penchées'),
      textMcqStep(ctx, 'Comment s’appelle une ligne qui ne tourne jamais ?', 'une ligne droite', [
        'une ligne courbe',
        'une ligne brisée',
      ]),
    ],
    week,
    REF.lines,
    previousId,
    11,
  );
}

/** « lecture et écriture en chiffres et en lettres de ces nombres ». */
export function numbersInWordsLesson(
  level: 'cp1' | 'cp2',
  values: number[],
  index: number,
  week: number,
  previousId: string,
): LessonSpec {
  const id = `${level}-calcul-nombres-en-lettres-${index + 1}`;
  const skills = [skillNumber('en-lettres')];
  const ctx = base(id, skills);
  const steps: AnyStep[] = [
    matchPairsStep(
      ctx,
      values.slice(0, 3).map((value) => [String(value), numberToWords(value)]),
      'Associe le nombre écrit en chiffres et en lettres.',
    ),
    matchPairsStep(
      ctx,
      values.slice(3, 6).map((value) => [String(value), numberToWords(value)]),
      'Associe le nombre écrit en chiffres et en lettres.',
    ),
  ];
  for (const value of values.slice(0, 3)) {
    steps.push(
      textMcqStep(ctx, `Comment écrit-on ${value} en lettres ?`, numberToWords(value), [
        numberToWords(value + 1),
        numberToWords(Math.max(0, value - 1)),
      ]),
    );
  }
  return mathLesson(
    id,
    'Les nombres en lettres',
    'Lire et écrire les nombres en toutes lettres.',
    ['Lire un nombre écrit en lettres', 'Écrire un nombre en toutes lettres'],
    skills,
    steps,
    week,
    REF.inWords,
    previousId,
    12,
  );
}

/**
 * « l'emploi des verbes : ajouter, enlever, ôter, réunir » (p. 58).
 * Le programme demande explicitement ce travail de vocabulaire : l'enfant doit
 * savoir quel mot appelle quelle opération avant de savoir la poser.
 */
export function operationVerbsLesson(
  level: 'cp1' | 'cp2',
  week: number,
  previousId: string,
): LessonSpec {
  const id = `${level}-calcul-verbes`;
  const skills = [skillMath('verbes')];
  const ctx = base(id, skills);
  return mathLesson(
    id,
    'Ajouter ou enlever ?',
    'Les mots qui disent ce qu’on fait.',
    [
      'Comprendre les verbes ajouter, enlever, ôter, réunir',
      'Choisir l’opération d’après l’énoncé',
    ],
    skills,
    [
      textMcqStep(ctx, 'Quand on AJOUTE, est-ce qu’on en a plus ou moins ?', 'plus', [
        'moins',
        'pareil',
      ]),
      textMcqStep(ctx, 'Quand on ENLÈVE, est-ce qu’on en a plus ou moins ?', 'moins', [
        'plus',
        'pareil',
      ]),
      matchPairsStep(
        ctx,
        [
          ['ajouter', '+'],
          ['enlever', '−'],
          ['réunir', '+'],
        ],
        'Associe le mot et le signe.',
      ),
      wordProblemStep(
        ctx,
        'Amina a 4 mangues. Elle en AJOUTE 3. Combien en a-t-elle ?',
        7,
        numberOptions(7, 1, 20),
        'icon-mango',
      ),
      wordProblemStep(
        ctx,
        'Le berger a 9 chèvres. Il en ÔTE 2 du troupeau. Combien en reste-t-il ?',
        7,
        numberOptions(7, 1, 20),
        'icon-goat',
      ),
    ],
    week,
    REF.verbs,
    previousId,
    12,
  );
}

/**
 * « les signes de l'addition, de la soustraction, d'égalité, de la
 * multiplication et de la division » (p. 58) — les cinq signes pour eux-mêmes.
 */
export function signsLesson(level: 'cp1' | 'cp2', week: number, previousId: string): LessonSpec {
  const id = `${level}-calcul-signes`;
  const skills = [skillMath('signes')];
  const ctx = base(id, skills);
  const cp2Steps =
    level === 'cp2'
      ? [
          textMcqStep(ctx, 'Quel signe veut dire qu’on multiplie ?', '×', ['÷', '+']),
          textMcqStep(ctx, 'Quel signe veut dire qu’on partage ?', '÷', ['×', '−']),
        ]
      : [];
  return mathLesson(
    id,
    'Les signes du calcul',
    'Reconnaître +, −, =, × et ÷.',
    ['Reconnaître et nommer les signes des opérations'],
    skills,
    [
      textMcqStep(ctx, 'Quel signe veut dire qu’on ajoute ?', '+', ['−', '=']),
      textMcqStep(ctx, 'Quel signe veut dire qu’on enlève ?', '−', ['+', '=']),
      textMcqStep(ctx, 'Quel signe veut dire « c’est pareil » ?', '=', ['+', '−']),
      ...cp2Steps,
      matchPairsStep(
        ctx,
        [
          ['+', 'plus'],
          ['−', 'moins'],
          ['=', 'égal'],
        ],
        'Associe le signe et son nom.',
      ),
    ],
    week,
    REF.signs,
    previousId,
    11,
  );
}

/**
 * « les tables d'addition et de soustraction » (calcul mental, p. 65).
 * Sans support visuel : c'est du calcul de tête, pas du dénombrement.
 */
export function mentalTableLesson(
  level: 'cp1' | 'cp2',
  kind: 'addition' | 'soustraction',
  week: number,
  previousId: string,
): LessonSpec {
  const id = `${level}-calcul-table-${kind}`;
  const skills = [skillMath(`table-${kind}`)];
  const ctx = base(id, skills);
  const pairsList: [number, number][] =
    kind === 'addition'
      ? level === 'cp1'
        ? [
            [2, 3],
            [4, 4],
            [5, 3],
            [6, 2],
            [7, 3],
          ]
        : [
            [8, 7],
            [9, 6],
            [7, 8],
            [9, 9],
            [6, 8],
          ]
      : level === 'cp1'
        ? [
            [7, 3],
            [8, 4],
            [9, 5],
            [10, 6],
            [6, 2],
          ]
        : [
            [15, 7],
            [16, 8],
            [14, 6],
            [18, 9],
            [17, 8],
          ];
  const steps = pairsList.map(([a, b]) =>
    operationStep(
      ctx,
      kind === 'addition' ? 'simple_addition' : 'simple_subtraction',
      a,
      b,
      numberOptions(kind === 'addition' ? a + b : a - b, 1, 30),
      false,
    ),
  );
  return mathLesson(
    id,
    `La table d’${kind === 'addition' ? 'addition' : 'a soustraction'}`.replace('d’a ', 'de '),
    'Calculer de tête, sans compter sur ses doigts.',
    ['Mémoriser les tables d’addition et de soustraction', 'Gagner en rapidité de calcul'],
    skills,
    steps,
    week,
    REF.tables,
    previousId,
    10,
  );
}

/**
 * « l'utilisation du double décimètre » (p. 59).
 * La règle est dessinée à l'écran : l'enfant lit les graduations et compare
 * des longueurs. La manipulation d'une vraie règle reste à faire en classe —
 * c'est indiqué dans docs/known-limitations.md.
 */
export function rulerLesson(week: number, previousId: string): LessonSpec {
  const id = 'cp2-calcul-double-decimetre';
  const skills = [skillMath('double-decimetre')];
  const ctx = base(id, skills);
  return mathLesson(
    id,
    'Le double décimètre',
    'Mesurer et comparer des longueurs.',
    ['Se servir d’une règle graduée', 'Comparer deux longueurs'],
    skills,
    [
      textMcqStep(ctx, 'Combien de centimètres y a-t-il sur un double décimètre ?', '20', [
        '10',
        '100',
      ]),
      attributeStep(
        ctx,
        'size',
        'Touche le trait le plus long.',
        [
          { id: 'long', shape: 'ligne', color: 'bleu', scale: 1, label: '10 cm' },
          { id: 'court', shape: 'ligne', color: 'bleu', scale: 0.5, label: '5 cm' },
        ],
        'long',
      ),
      attributeStep(
        ctx,
        'size',
        'Touche le trait le plus court.',
        [
          { id: 'long', shape: 'ligne', color: 'vert', scale: 1, label: '8 cm' },
          { id: 'court', shape: 'ligne', color: 'vert', scale: 0.4, label: '3 cm' },
        ],
        'court',
      ),
      textMcqStep(ctx, 'Un trait va de 0 à 7. Combien mesure-t-il ?', '7 cm', ['0 cm', '17 cm']),
      textMcqStep(
        ctx,
        'Un trait de 12 cm est-il plus long ou plus court qu’un trait de 9 cm ?',
        'plus long',
        ['plus court', 'pareil'],
      ),
    ],
    week,
    REF.ruler,
    previousId,
    12,
  );
}

export { CFA_COINS };

/**
 * Lecture de phrases et de petits textes — « lire en articulant correctement
 * des phrases et des textes simples déjà étudiés » (p. 23). Construite à
 * partir des sons déjà vus, jamais d'un mot non déchiffrable.
 */
export function sentenceReadingLesson(
  level: 'cp1' | 'cp2',
  units: (SoundUnit | Cp2Unit)[],
  index: number,
  week: number,
  previousId: string,
): LessonSpec {
  const id = `${level}-lecture-phrases-${index + 1}`;
  const skills = [skillReading('phrase'), skillReading('comprehension')];
  const ctx = base(id, skills);
  const sentences = units.map((unit) => unit.sentence);
  const words = units.flatMap((unit) => unit.words);
  const illustrated = words.filter((word) => word.icon);

  const short = sentences.filter((sentence) => wordCount(sentence) <= MAX_ORDERED_WORDS);
  const steps: AnyStep[] = [
    orderWordsStep(ctx, pick(short, index)),
    orderWordsStep(ctx, pick(short, index + 1)),
  ];
  if (illustrated.length >= 3) {
    steps.push(
      imageMcqStep(
        ctx,
        { word: pick(illustrated, index).word, icon: pick(illustrated, index).icon as string },
        [pick(illustrated, index + 1), pick(illustrated, index + 2)]
          .filter((entry) => entry.word !== pick(illustrated, index).word)
          .map((entry) => ({ word: entry.word, icon: entry.icon as string })),
      ),
    );
  }
  steps.push(
    textMcqStep(
      ctx,
      `Dans la phrase « ${pick(sentences, index)} », quel est le premier mot ?`,
      (pick(sentences, index).split(' ')[0] as string).replace(/[.,]/g, ''),
      [(pick(sentences, index).split(' ')[1] ?? 'la').replace(/[.,]/g, ''), 'chèvre'],
    ),
    listenRepeatStep(ctx, pick(sentences, index + 2)),
  );

  return {
    id,
    title: 'Je lis des phrases',
    shortDescription: 'Lire et comprendre des phrases faites de sons connus.',
    learningObjectives: [
      'Lire une phrase simple en articulant',
      'Donner un renseignement ponctuel après lecture',
    ],
    skills,
    estimatedDurationMinutes: 13,
    term: termOfWeek(week),
    week,
    officialReference:
      'Lecture CP — « lire en articulant correctement des phrases et des textes simples déjà étudiés » (p. 23)',
    prerequisiteLessonIds: [previousId],
    steps: steps.slice(0, 7),
  };
}
