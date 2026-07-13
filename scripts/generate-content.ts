/* eslint-disable no-console */
/**
 * Deterministic curriculum generator for ALIFA V1.
 *
 * Produces:
 *   - src/content/manifests/curriculum-v1.json  (validated against Zod schemas)
 *   - assets/audio/manifest.json                (every audio asset + placeholder flag)
 *   - assets/audio/tts-map.json                 (audioId -> French text, for the
 *                                                placeholder TTS pipeline, see
 *                                                docs/audio-pipeline.md)
 *
 * The content is original, aligned with the CP1/CP2 francophone progression
 * (see docs/pedagogical-validation.md for what still needs teacher review).
 * Regenerating with the same inputs yields byte-identical output.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { curriculumManifestSchema } from '../src/content/schemas/curriculum-schema';

const ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// Audio registry: every spoken thing gets a stable id and a TTS text.
// ---------------------------------------------------------------------------
const ttsMap = new Map<string, string>();

const ACCENT_SLUGS: Record<string, string> = {
  é: 'e-accent', è: 'e-grave', ê: 'e-circ', ë: 'e-trema',
  à: 'a-grave', â: 'a-circ', ù: 'u-grave', û: 'u-circ',
  î: 'i-circ', ï: 'i-trema', ô: 'o-circ', ç: 'c-cedille',
};

function slug(text: string): string {
  const lowered = text.toLowerCase();
  // Single accented characters keep a distinct id ("é" must not collide with "e").
  const base = lowered.length === 1 && ACCENT_SLUGS[lowered] ? ACCENT_SLUGS[lowered] : lowered;
  return base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function audio(kind: string, text: string, spokenOverride?: string): string {
  const id = `${kind}-${slug(text)}`;
  const spoken = spokenOverride ?? text;
  const existing = ttsMap.get(id);
  if (existing !== undefined && existing !== spoken) {
    throw new Error(`audio id collision: ${id} ("${existing}" vs "${spoken}")`);
  }
  ttsMap.set(id, spoken);
  return id;
}

const say = {
  instruction: (text: string) => ({ text, audioId: audio('instr', text) }),
  hint: (text: string) => ({ text, audioId: audio('hint', text) }),
  letter: (letter: string) => audio('lettre', letter, `${letter}.`),
  syllable: (syllable: string) => audio('syllabe', syllable, `${syllable}.`),
  word: (word: string) => audio('mot', word, `${word}.`),
  sentence: (sentence: string) => audio('phrase', sentence),
  number: (value: number) => audio('nombre', String(value), NUMBER_WORDS[value] ?? String(value)),
  story: (story: string) => audio('histoire', story.slice(0, 50), story),
};

const NUMBER_WORDS: Record<number, string> = {
  0: 'zéro', 1: 'un', 2: 'deux', 3: 'trois', 4: 'quatre', 5: 'cinq', 6: 'six', 7: 'sept',
  8: 'huit', 9: 'neuf', 10: 'dix', 11: 'onze', 12: 'douze', 13: 'treize', 14: 'quatorze',
  15: 'quinze', 16: 'seize', 17: 'dix-sept', 18: 'dix-huit', 19: 'dix-neuf', 20: 'vingt',
  30: 'trente', 40: 'quarante', 50: 'cinquante', 60: 'soixante', 70: 'soixante-dix',
  80: 'quatre-vingts', 90: 'quatre-vingt-dix', 100: 'cent',
};

// Illustrated objects available as bundled SVG icons (assets/illustrations).
const COUNTABLE = {
  goat: { id: 'icon-goat', name: 'chèvres', singular: 'chèvre' },
  mango: { id: 'icon-mango', name: 'mangues', singular: 'mangue' },
  hut: { id: 'icon-hut', name: 'cases', singular: 'case' },
  star: { id: 'icon-star', name: 'étoiles', singular: 'étoile' },
  calabash: { id: 'icon-calabash', name: 'calebasses', singular: 'calebasse' },
} as const;

const WORD_ICONS: Record<string, string> = {
  moto: 'icon-moto',
  lit: 'icon-bed',
  tomate: 'icon-tomato',
  salade: 'icon-salad',
  papa: 'icon-father',
  ami: 'icon-friends',
  chat: 'icon-cat',
  mouton: 'icon-sheep',
  savon: 'icon-soap',
  roi: 'icon-king',
  loup: 'icon-wolf',
  bois: 'icon-wood',
};

const usedIllustrations = new Set<string>();
function illustration(id: string): string {
  usedIllustrations.add(id);
  return id;
}

// ---------------------------------------------------------------------------
// Step builders
// ---------------------------------------------------------------------------
let stepCounter = 0;
function stepId(lessonId: string): string {
  stepCounter += 1;
  return `${lessonId}-s${stepCounter}`;
}

type AnyStep = Record<string, unknown>;

function listenStep(lessonId: string, skills: string[], glyph: string, audioId: string): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'listen',
    skills,
    instruction: say.instruction('Écoute bien.'),
    glyph,
    audioId,
  };
}

function tapLetterStep(
  lessonId: string,
  skills: string[],
  target: string,
  options: string[],
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'tap_letter',
    skills,
    instruction: say.instruction('Touche la lettre que tu entends.'),
    hint: say.hint('Écoute encore une fois, puis regarde bien chaque lettre.'),
    target,
    options,
    audioId: say.letter(target),
  };
}

function audioMcqStep(
  lessonId: string,
  skills: string[],
  correct: string,
  distractors: string[],
  registerAudio: (value: string) => string,
  layout: 'list' | 'grid' = 'list',
): AnyStep {
  const choices = [correct, ...distractors].map((label) => ({ id: label, label }));
  return {
    id: stepId(lessonId),
    type: 'audio_multiple_choice',
    skills,
    instruction: say.instruction('Que viens-tu d’entendre ?'),
    hint: say.hint('Écoute encore une fois.'),
    audioId: registerAudio(correct),
    choices,
    correctChoiceId: correct,
    layout,
  };
}

function composeSyllableStep(
  lessonId: string,
  skills: string[],
  target: string,
  extraTiles: string[],
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'compose_syllable',
    skills,
    instruction: say.instruction('Forme la syllabe.'),
    hint: say.hint('Regarde bien la première lettre.'),
    target,
    tiles: [...target.split(''), ...extraTiles],
    audioId: say.syllable(target),
  };
}

function composeWordStep(
  lessonId: string,
  skills: string[],
  target: string,
  syllables: string[],
  extraTiles: string[],
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'compose_word',
    skills,
    instruction: say.instruction('Forme le mot que tu entends.'),
    hint: say.hint('Écoute le mot, puis cherche la première syllabe.'),
    target,
    tiles: [...syllables, ...extraTiles],
    audioId: say.word(target),
  };
}

function traceLetterStep(lessonId: string, skills: string[], letter: string): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'trace_letter',
    skills,
    instruction: say.instruction('Trace la lettre avec ton doigt.'),
    hint: say.hint('Suis le chemin en partant du point.'),
    letter,
    audioId: say.letter(letter),
  };
}

function imageMcqStep(lessonId: string, skills: string[], word: string, distractors: string[]): AnyStep {
  const iconOf = (candidate: string): string => {
    const icon = WORD_ICONS[candidate];
    if (!icon) {
      throw new Error(`no icon for word: ${candidate}`);
    }
    return illustration(icon);
  };
  return {
    id: stepId(lessonId),
    type: 'image_multiple_choice',
    skills,
    instruction: say.instruction('Touche l’image du mot que tu entends.'),
    hint: say.hint('Écoute encore le mot.'),
    audioId: say.word(word),
    choices: [word, ...distractors].map((candidate) => ({
      id: candidate,
      illustrationId: iconOf(candidate),
      label: candidate,
    })),
    correctChoiceId: word,
  };
}

function fillMissingLetterStep(
  lessonId: string,
  skills: string[],
  word: string,
  missingIndex: number,
  options: string[],
): AnyStep {
  const answer = word[missingIndex];
  if (!answer) {
    throw new Error(`missingIndex out of range for ${word}`);
  }
  return {
    id: stepId(lessonId),
    type: 'fill_missing_letter',
    skills,
    instruction: say.instruction('Complète le mot avec la bonne lettre.'),
    hint: say.hint('Dis le mot lentement dans ta tête.'),
    maskedWord: `${word.slice(0, missingIndex)}_${word.slice(missingIndex + 1)}`,
    answer,
    options,
    audioId: say.word(word),
  };
}

function matchPairsStep(
  lessonId: string,
  skills: string[],
  pairs: Array<[string, string]>,
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'match_pairs',
    skills,
    instruction: say.instruction('Associe ce qui va ensemble.'),
    hint: say.hint('Commence par ce que tu connais déjà.'),
    pairs: pairs.map(([left, right], index) => ({ id: `p${index + 1}`, left, right })),
  };
}

function orderWordsStep(lessonId: string, skills: string[], sentence: string): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'order_words',
    skills,
    instruction: say.instruction('Remets les mots dans l’ordre.'),
    hint: say.hint('Écoute la phrase : quel est le premier mot ?'),
    sentence: sentence.replace(/[.!?]$/, '').split(' '),
    distractors: [],
    audioId: say.sentence(sentence),
  };
}

function countObjectsStep(
  lessonId: string,
  skills: string[],
  object: (typeof COUNTABLE)[keyof typeof COUNTABLE],
  count: number,
  options: number[],
): AnyStep {
  for (const value of [count, ...options]) {
    say.number(value);
  }
  return {
    id: stepId(lessonId),
    type: 'count_objects',
    skills,
    instruction: say.instruction(`Compte les ${object.name}.`),
    hint: say.hint('Touche chaque image en comptant dans ta tête.'),
    illustrationId: illustration(object.id),
    objectName: object.name,
    count,
    options: options.includes(count) ? options : [...options, count].sort((a, b) => a - b),
  };
}

function numberSequenceStep(
  lessonId: string,
  skills: string[],
  sequence: Array<number | null>,
  answer: number,
  options: number[],
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'number_sequence',
    skills,
    instruction: say.instruction('Quel nombre manque ?'),
    hint: say.hint('Compte dans ta tête, doucement.'),
    sequence,
    answer,
    options,
  };
}

function compareNumbersStep(
  lessonId: string,
  skills: string[],
  left: number,
  right: number,
  mode: 'greater' | 'smaller',
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'compare_numbers',
    skills,
    instruction: say.instruction(
      mode === 'greater' ? 'Touche le nombre le plus grand.' : 'Touche le nombre le plus petit.',
    ),
    hint: say.hint('Pense à la file des nombres.'),
    left,
    right,
    mode,
  };
}

function additionStep(
  lessonId: string,
  skills: string[],
  a: number,
  b: number,
  wrong: number[],
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'simple_addition',
    skills,
    instruction: say.instruction(`Combien font ${a} et ${b} ?`),
    hint: say.hint('Compte d’abord le premier groupe, puis ajoute le deuxième.'),
    a,
    b,
    options: [...wrong, a + b].sort((x, y) => x - y),
    showQuantities: true,
  };
}

function subtractionStep(
  lessonId: string,
  skills: string[],
  a: number,
  b: number,
  wrong: number[],
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'simple_subtraction',
    skills,
    instruction: say.instruction(`${a} moins ${b}, combien reste-t-il ?`),
    hint: say.hint('Enlève les objets un par un.'),
    a,
    b,
    options: [...wrong, a - b].sort((x, y) => x - y),
    showQuantities: true,
  };
}

function wordProblemStep(
  lessonId: string,
  skills: string[],
  statement: string,
  answer: number,
  wrong: number[],
  illustrationId?: string,
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'visual_word_problem',
    skills,
    instruction: say.instruction('Écoute bien le petit problème.'),
    hint: say.hint('Imagine la scène avec des objets.'),
    statement,
    statementAudioId: say.sentence(statement),
    ...(illustrationId ? { illustrationId: illustration(illustrationId) } : {}),
    answer,
    options: [...wrong, answer].sort((x, y) => x - y),
  };
}

function listenAndRepeatStep(lessonId: string, skills: string[], text: string): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'listen_and_repeat',
    skills,
    instruction: say.instruction('Écoute, puis répète à voix haute.'),
    text,
    audioId: text.includes(' ') ? say.sentence(text) : say.syllable(text),
  };
}

function miniStoryStep(
  lessonId: string,
  skills: string[],
  story: string,
  question: string,
  correct: string,
  distractors: string[],
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'mini_story_question',
    skills,
    instruction: say.instruction('Écoute la petite histoire.'),
    hint: say.hint('Écoute encore l’histoire, la réponse s’y trouve.'),
    story,
    storyAudioId: say.story(story),
    question,
    questionAudioId: say.sentence(question),
    choices: [correct, ...distractors].map((label) => ({ id: slug(label), label })),
    correctChoiceId: slug(correct),
  };
}

function textMcqStep(
  lessonId: string,
  skills: string[],
  question: string,
  correct: string,
  distractors: string[],
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'text_multiple_choice',
    skills,
    instruction: say.instruction('Lis bien, puis choisis la bonne réponse.'),
    hint: say.hint('Relis la question doucement.'),
    question,
    choices: [correct, ...distractors].map((label) => ({ id: slug(label), label })),
    correctChoiceId: slug(correct),
  };
}

// ---------------------------------------------------------------------------
// Lesson assembly
// ---------------------------------------------------------------------------
interface LessonSpec {
  id: string;
  title: string;
  shortDescription: string;
  learningObjectives: string[];
  skills: string[];
  estimatedDurationMinutes: number;
  prerequisiteLessonIds: string[];
  steps: AnyStep[];
}

function lesson(spec: LessonSpec): LessonSpec {
  return spec;
}

const skillLetter = (letter: string) => `skill-lettre-${letter}`;
const skillSound = (sound: string) => `skill-son-${slug(sound)}`;
const skillNumber = (topic: string) => `skill-nombre-${slug(topic)}`;
const skillReading = (topic: string) => `skill-lecture-${slug(topic)}`;

// ======================= CP1 =======================

function cp1LetterLesson(
  index: number,
  letters: [string, string],
  prerequisite: string | null,
): LessonSpec {
  const id = `cp1-lettres-${index}`;
  const [first, second] = letters;
  const skills = [skillLetter(first), skillLetter(second)];
  return lesson({
    id,
    title: `Les lettres ${first} et ${second}`,
    shortDescription: `Découvrir, écouter et tracer les lettres ${first} et ${second}.`,
    learningObjectives: [
      `Reconnaître la lettre ${first} et son son`,
      `Reconnaître la lettre ${second} et son son`,
      'Tracer les lettres avec le doigt',
    ],
    skills,
    estimatedDurationMinutes: 6,
    prerequisiteLessonIds: prerequisite ? [prerequisite] : [],
    steps: [
      listenStep(id, [skills[0]!], first, say.letter(first)),
      tapLetterStep(id, [skills[0]!], first, [first, second, 'o' === first ? 'e' : 'o']),
      traceLetterStep(id, [skills[0]!], first),
      listenStep(id, [skills[1]!], second, say.letter(second)),
      tapLetterStep(id, [skills[1]!], second, [second, first, 'i' === second ? 'u' : 'i']),
      traceLetterStep(id, [skills[1]!], second),
      audioMcqStep(id, skills, first, [second], say.letter),
    ],
  });
}

function cp1SyllableLesson(
  index: number,
  consonant: string,
  vowels: string[],
  prerequisite: string,
): LessonSpec {
  const id = `cp1-syllabes-${consonant}`;
  const syllables = vowels.map((vowel) => `${consonant}${vowel}`);
  const skills = syllables.map((syllable) => skillSound(syllable));
  const [firstSyllable, secondSyllable] = syllables;
  const otherConsonant = consonant === 'm' ? 'b' : 'm';
  return lesson({
    id,
    title: `Les syllabes avec ${consonant.toUpperCase()}`,
    shortDescription: `Écouter et former ${syllables.slice(0, 3).join(', ')}…`,
    learningObjectives: [
      `Associer ${consonant} aux voyelles pour former des syllabes`,
      'Reconnaître une syllabe entendue',
      'Former une syllabe avec des lettres',
    ],
    skills,
    estimatedDurationMinutes: 7,
    prerequisiteLessonIds: [prerequisite],
    steps: [
      listenStep(id, [skills[0]!], firstSyllable!, say.syllable(firstSyllable!)),
      audioMcqStep(
        id,
        [skills[0]!],
        firstSyllable!,
        [`${otherConsonant}${vowels[0]}`, `${consonant}${vowels[1]}`],
        say.syllable,
      ),
      composeSyllableStep(id, [skills[0]!], firstSyllable!, [otherConsonant]),
      listenAndRepeatStep(id, [skills[1] ?? skills[0]!], secondSyllable ?? firstSyllable!),
      composeSyllableStep(id, [skills[1] ?? skills[0]!], secondSyllable ?? firstSyllable!, [
        otherConsonant,
      ]),
      audioMcqStep(
        id,
        skills.slice(0, 3),
        syllables[2] ?? firstSyllable!,
        [firstSyllable!, secondSyllable ?? firstSyllable!],
        say.syllable,
      ),
    ],
  });
}

function buildCp1(): { worlds: unknown[]; lessonIds: string[] } {
  const lessons: LessonSpec[] = [];

  // ---- World 1 : letters ----
  const letterPairs: Array<[string, string]> = [
    ['a', 'i'],
    ['o', 'e'],
    ['u', 'é'],
    ['m', 'b'],
    ['t', 'l'],
    ['s', 'd'],
  ];
  const world1Lessons = letterPairs.map((pair, index) =>
    cp1LetterLesson(index + 1, pair, index === 0 ? null : `cp1-lettres-${index}`),
  );
  // Distinguish visually close letters — the classic b/d confusion.
  const bd = lesson({
    id: 'cp1-lettres-proches',
    title: 'Les lettres qui se ressemblent',
    shortDescription: 'Bien distinguer b et d, puis p et q.',
    learningObjectives: ['Distinguer b et d', 'Distinguer p et q'],
    skills: [skillLetter('b'), skillLetter('d'), skillLetter('p'), skillLetter('q')],
    estimatedDurationMinutes: 6,
    prerequisiteLessonIds: ['cp1-lettres-6'],
    steps: [
      textMcqStep(
        'cp1-lettres-proches',
        [skillLetter('b')],
        'Où est la lettre b ?',
        'b',
        ['d', 'p'],
      ),
      tapLetterStep('cp1-lettres-proches', [skillLetter('d')], 'd', ['b', 'd', 'q']),
      traceLetterStep('cp1-lettres-proches', [skillLetter('b')], 'b'),
      traceLetterStep('cp1-lettres-proches', [skillLetter('d')], 'd'),
      tapLetterStep('cp1-lettres-proches', [skillLetter('p')], 'p', ['p', 'q', 'b']),
      audioMcqStep('cp1-lettres-proches', [skillLetter('b'), skillLetter('d')], 'b', ['d'], say.letter),
    ],
  });
  world1Lessons.push(bd);
  lessons.push(...world1Lessons);

  // ---- World 2 : syllables ----
  const syllableSeries: Array<[string, string[]]> = [
    ['b', ['a', 'e', 'i', 'o', 'u']],
    ['m', ['a', 'e', 'i', 'o', 'u']],
    ['t', ['a', 'i', 'o', 'u']],
    ['l', ['a', 'e', 'i', 'o', 'u']],
    ['s', ['a', 'i', 'o', 'u']],
  ];
  const world2Lessons = syllableSeries.map(([consonant, vowels], index) =>
    cp1SyllableLesson(index + 1, consonant, vowels, index === 0 ? 'cp1-lettres-4' : `cp1-syllabes-${syllableSeries[index - 1]![0]}`),
  );
  const contrast = lesson({
    id: 'cp1-syllabes-contrastes',
    title: 'Ba ou ma ?',
    shortDescription: 'Bien entendre la différence entre des syllabes proches.',
    learningObjectives: ['Distinguer ba/ma et ta/da à l’oreille'],
    skills: [skillSound('ba'), skillSound('ma'), skillSound('ta'), skillSound('da')],
    estimatedDurationMinutes: 5,
    prerequisiteLessonIds: ['cp1-syllabes-m'],
    steps: [
      audioMcqStep('cp1-syllabes-contrastes', [skillSound('ba'), skillSound('ma')], 'ba', ['ma'], say.syllable),
      audioMcqStep('cp1-syllabes-contrastes', [skillSound('ma'), skillSound('ba')], 'ma', ['ba'], say.syllable),
      listenAndRepeatStep('cp1-syllabes-contrastes', [skillSound('ta')], 'ta'),
      audioMcqStep('cp1-syllabes-contrastes', [skillSound('ta'), skillSound('da')], 'ta', ['da'], say.syllable),
      matchPairsStep('cp1-syllabes-contrastes', [skillSound('ba'), skillSound('ma')], [
        ['b + a', 'ba'],
        ['m + a', 'ma'],
        ['t + a', 'ta'],
      ]),
    ],
  });
  world2Lessons.push(contrast);
  lessons.push(...world2Lessons);

  // ---- World 3 : first words ----
  const world3 = [
    lesson({
      id: 'cp1-mots-famille',
      title: 'Papa, tata…',
      shortDescription: 'Lire ses premiers mots avec des syllabes connues.',
      learningObjectives: ['Assembler deux syllabes identiques ou proches', 'Lire papa, tata'],
      skills: [skillReading('mots-simples')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp1-syllabes-contrastes'],
      steps: [
        composeWordStep('cp1-mots-famille', [skillReading('mots-simples')], 'papa', ['pa', 'pa'], ['ma']),
        imageMcqStep('cp1-mots-famille', [skillReading('mots-simples')], 'papa', ['ami', 'moto']),
        composeWordStep('cp1-mots-famille', [skillReading('mots-simples')], 'tata', ['ta', 'ta'], ['da']),
        audioMcqStep('cp1-mots-famille', [skillReading('mots-simples')], 'papa', ['tata', 'baba'], say.word),
        listenAndRepeatStep('cp1-mots-famille', [skillReading('mots-simples')], 'papa'),
      ],
    }),
    lesson({
      id: 'cp1-mots-objets',
      title: 'Moto, dodo…',
      shortDescription: 'Lire des mots de deux syllabes différentes.',
      learningObjectives: ['Assembler deux syllabes différentes', 'Associer un mot et son image'],
      skills: [skillReading('mots-simples')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp1-mots-famille'],
      steps: [
        composeWordStep('cp1-mots-objets', [skillReading('mots-simples')], 'moto', ['mo', 'to'], ['ma']),
        imageMcqStep('cp1-mots-objets', [skillReading('mots-simples')], 'moto', ['lit', 'tomate']),
        composeWordStep('cp1-mots-objets', [skillReading('mots-simples')], 'dodo', ['do', 'do'], ['bo']),
        imageMcqStep('cp1-mots-objets', [skillReading('mots-simples')], 'lit', ['moto', 'salade']),
        audioMcqStep('cp1-mots-objets', [skillReading('mots-simples')], 'moto', ['dodo', 'mama'], say.word),
      ],
    }),
    lesson({
      id: 'cp1-mots-image',
      title: 'Le mot et son image',
      shortDescription: 'Associer des mots du quotidien à leur image.',
      learningObjectives: ['Lire un mot et retrouver son image'],
      skills: [skillReading('mot-image')],
      estimatedDurationMinutes: 5,
      prerequisiteLessonIds: ['cp1-mots-objets'],
      steps: [
        imageMcqStep('cp1-mots-image', [skillReading('mot-image')], 'tomate', ['salade', 'moto']),
        imageMcqStep('cp1-mots-image', [skillReading('mot-image')], 'salade', ['tomate', 'lit']),
        matchPairsStep('cp1-mots-image', [skillReading('mot-image')], [
          ['moto', 'mo-to'],
          ['tomate', 'to-ma-te'],
          ['salade', 'sa-la-de'],
        ]),
        imageMcqStep('cp1-mots-image', [skillReading('mot-image')], 'ami', ['papa', 'lit']),
      ],
    }),
    lesson({
      id: 'cp1-mots-lettre-manquante',
      title: 'La lettre cachée',
      shortDescription: 'Retrouver la lettre qui manque dans un mot.',
      learningObjectives: ['Compléter un mot avec la bonne lettre'],
      skills: [skillReading('lettre-manquante')],
      estimatedDurationMinutes: 5,
      prerequisiteLessonIds: ['cp1-mots-image'],
      steps: [
        fillMissingLetterStep('cp1-mots-lettre-manquante', [skillReading('lettre-manquante')], 'papa', 0, ['p', 'b', 't']),
        fillMissingLetterStep('cp1-mots-lettre-manquante', [skillReading('lettre-manquante')], 'moto', 2, ['t', 'd', 'l']),
        fillMissingLetterStep('cp1-mots-lettre-manquante', [skillReading('lettre-manquante')], 'salade', 0, ['s', 'l', 'm']),
        fillMissingLetterStep('cp1-mots-lettre-manquante', [skillReading('lettre-manquante')], 'tomate', 4, ['t', 'd', 'b']),
      ],
    }),
    lesson({
      id: 'cp1-mots-revision',
      title: 'Je lis mes premiers mots',
      shortDescription: 'Réviser tous les mots appris en jouant.',
      learningObjectives: ['Lire les mots appris', 'Gagner en confiance'],
      skills: [skillReading('mots-simples'), skillReading('mot-image')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp1-mots-lettre-manquante'],
      steps: [
        audioMcqStep('cp1-mots-revision', [skillReading('mots-simples')], 'tomate', ['tata', 'moto'], say.word, 'grid'),
        composeWordStep('cp1-mots-revision', [skillReading('mots-simples')], 'salade', ['sa', 'la', 'de'], ['ma']),
        imageMcqStep('cp1-mots-revision', [skillReading('mot-image')], 'moto', ['lit', 'ami']),
        fillMissingLetterStep('cp1-mots-revision', [skillReading('lettre-manquante')], 'moto', 0, ['m', 'n', 'b']),
        listenAndRepeatStep('cp1-mots-revision', [skillReading('mots-simples')], 'salade'),
      ],
    }),
  ];
  lessons.push(...world3);

  // ---- World 4 : listen and write (dictation) ----
  const world4 = [
    lesson({
      id: 'cp1-dictee-lettres',
      title: 'Dictée de lettres',
      shortDescription: 'Écouter une lettre et la retrouver.',
      learningObjectives: ['Écrire une lettre entendue en la choisissant'],
      skills: [skillSound('dictee-lettres')],
      estimatedDurationMinutes: 5,
      prerequisiteLessonIds: ['cp1-lettres-proches'],
      steps: [
        audioMcqStep('cp1-dictee-lettres', [skillSound('dictee-lettres')], 'a', ['e', 'i'], say.letter, 'grid'),
        audioMcqStep('cp1-dictee-lettres', [skillSound('dictee-lettres')], 'm', ['b', 't'], say.letter, 'grid'),
        audioMcqStep('cp1-dictee-lettres', [skillSound('dictee-lettres')], 'u', ['o', 'e'], say.letter, 'grid'),
        audioMcqStep('cp1-dictee-lettres', [skillSound('dictee-lettres')], 's', ['l', 'd'], say.letter, 'grid'),
      ],
    }),
    lesson({
      id: 'cp1-dictee-syllabes',
      title: 'Dictée de syllabes',
      shortDescription: 'Écouter une syllabe et la former.',
      learningObjectives: ['Reconstituer une syllabe entendue'],
      skills: [skillSound('dictee-syllabes')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp1-dictee-lettres', 'cp1-syllabes-contrastes'],
      steps: [
        audioMcqStep('cp1-dictee-syllabes', [skillSound('dictee-syllabes')], 'ba', ['ma', 'ta', 'la'], say.syllable, 'grid'),
        composeSyllableStep('cp1-dictee-syllabes', [skillSound('dictee-syllabes')], 'mi', ['b', 'o']),
        audioMcqStep('cp1-dictee-syllabes', [skillSound('dictee-syllabes')], 'lu', ['lo', 'su', 'bu'], say.syllable, 'grid'),
        composeSyllableStep('cp1-dictee-syllabes', [skillSound('dictee-syllabes')], 'so', ['t', 'a']),
      ],
    }),
    lesson({
      id: 'cp1-dictee-mots',
      title: 'Dictée de mots',
      shortDescription: 'Écouter un mot très simple et le retrouver.',
      learningObjectives: ['Reconnaître un mot entendu parmi des mots proches'],
      skills: [skillSound('dictee-mots')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp1-dictee-syllabes'],
      steps: [
        audioMcqStep('cp1-dictee-mots', [skillSound('dictee-mots')], 'papa', ['mama', 'baba', 'tata'], say.word, 'grid'),
        audioMcqStep('cp1-dictee-mots', [skillSound('dictee-mots')], 'moto', ['dodo', 'toto', 'momo'], say.word, 'grid'),
        composeWordStep('cp1-dictee-mots', [skillSound('dictee-mots')], 'mama', ['ma', 'ma'], ['ba']),
        audioMcqStep('cp1-dictee-mots', [skillSound('dictee-mots')], 'lit', ['li', 'la'], say.word, 'grid'),
      ],
    }),
    lesson({
      id: 'cp1-dictee-tuiles',
      title: 'J’écris avec des tuiles',
      shortDescription: 'Recomposer des mots entendus avec des tuiles.',
      learningObjectives: ['Écrire un mot simple avec des syllabes'],
      skills: [skillSound('dictee-mots')],
      estimatedDurationMinutes: 7,
      prerequisiteLessonIds: ['cp1-dictee-mots'],
      steps: [
        composeWordStep('cp1-dictee-tuiles', [skillSound('dictee-mots')], 'tata', ['ta', 'ta'], ['da']),
        composeWordStep('cp1-dictee-tuiles', [skillSound('dictee-mots')], 'moto', ['mo', 'to'], ['do']),
        composeWordStep('cp1-dictee-tuiles', [skillSound('dictee-mots')], 'salade', ['sa', 'la', 'de'], ['so']),
        composeWordStep('cp1-dictee-tuiles', [skillSound('dictee-mots')], 'tomate', ['to', 'ma', 'te'], ['ti']),
      ],
    }),
  ];
  lessons.push(...world4);

  // ---- World 5 : numbers 0-20 ----
  const world5 = [
    lesson({
      id: 'cp1-nombres-0-5',
      title: 'Les nombres de 0 à 5',
      shortDescription: 'Compter de petites quantités.',
      learningObjectives: ['Compter jusqu’à 5', 'Reconnaître les chiffres'],
      skills: [skillNumber('0-5')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: [],
      steps: [
        countObjectsStep('cp1-nombres-0-5', [skillNumber('0-5')], COUNTABLE.goat, 3, [2, 3, 5]),
        countObjectsStep('cp1-nombres-0-5', [skillNumber('0-5')], COUNTABLE.mango, 4, [3, 4, 5]),
        audioMcqStep('cp1-nombres-0-5', [skillNumber('0-5')], '5', ['2', '4'], (v) => say.number(Number(v)), 'grid'),
        countObjectsStep('cp1-nombres-0-5', [skillNumber('0-5')], COUNTABLE.star, 5, [4, 5, 6]),
        numberSequenceStep('cp1-nombres-0-5', [skillNumber('0-5')], [1, 2, null, 4], 3, [3, 5, 2]),
      ],
    }),
    lesson({
      id: 'cp1-nombres-6-10',
      title: 'Les nombres de 6 à 10',
      shortDescription: 'Compter jusqu’à 10.',
      learningObjectives: ['Compter jusqu’à 10', 'Compléter une suite'],
      skills: [skillNumber('6-10')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp1-nombres-0-5'],
      steps: [
        countObjectsStep('cp1-nombres-6-10', [skillNumber('6-10')], COUNTABLE.mango, 7, [6, 7, 8]),
        countObjectsStep('cp1-nombres-6-10', [skillNumber('6-10')], COUNTABLE.calabash, 9, [8, 9, 10]),
        numberSequenceStep('cp1-nombres-6-10', [skillNumber('6-10')], [6, 7, null, 9], 8, [8, 10, 7]),
        audioMcqStep('cp1-nombres-6-10', [skillNumber('6-10')], '10', ['6', '8'], (v) => say.number(Number(v)), 'grid'),
        countObjectsStep('cp1-nombres-6-10', [skillNumber('6-10')], COUNTABLE.goat, 8, [7, 8, 9]),
      ],
    }),
    lesson({
      id: 'cp1-nombres-comparer',
      title: 'Plus grand, plus petit',
      shortDescription: 'Comparer deux nombres.',
      learningObjectives: ['Comparer des nombres jusqu’à 10'],
      skills: [skillNumber('comparer')],
      estimatedDurationMinutes: 5,
      prerequisiteLessonIds: ['cp1-nombres-6-10'],
      steps: [
        compareNumbersStep('cp1-nombres-comparer', [skillNumber('comparer')], 3, 7, 'greater'),
        compareNumbersStep('cp1-nombres-comparer', [skillNumber('comparer')], 9, 5, 'smaller'),
        compareNumbersStep('cp1-nombres-comparer', [skillNumber('comparer')], 6, 8, 'greater'),
        compareNumbersStep('cp1-nombres-comparer', [skillNumber('comparer')], 4, 2, 'smaller'),
      ],
    }),
    lesson({
      id: 'cp1-nombres-11-20',
      title: 'Les nombres jusqu’à 20',
      shortDescription: 'Découvrir les nombres de 11 à 20.',
      learningObjectives: ['Lire et ordonner les nombres jusqu’à 20'],
      skills: [skillNumber('11-20')],
      estimatedDurationMinutes: 7,
      prerequisiteLessonIds: ['cp1-nombres-comparer'],
      steps: [
        audioMcqStep('cp1-nombres-11-20', [skillNumber('11-20')], '13', ['15', '17'], (v) => say.number(Number(v)), 'grid'),
        numberSequenceStep('cp1-nombres-11-20', [skillNumber('11-20')], [11, 12, null, 14], 13, [13, 15, 16]),
        audioMcqStep('cp1-nombres-11-20', [skillNumber('11-20')], '16', ['13', '18'], (v) => say.number(Number(v)), 'grid'),
        numberSequenceStep('cp1-nombres-11-20', [skillNumber('11-20')], [16, 17, 18, null], 19, [19, 20, 15]),
        compareNumbersStep('cp1-nombres-11-20', [skillNumber('11-20')], 14, 17, 'greater'),
      ],
    }),
    lesson({
      id: 'cp1-additions',
      title: 'Mes premières additions',
      shortDescription: 'Ajouter de petites quantités.',
      learningObjectives: ['Additionner jusqu’à 10 avec des objets'],
      skills: [skillNumber('addition')],
      estimatedDurationMinutes: 7,
      prerequisiteLessonIds: ['cp1-nombres-6-10'],
      steps: [
        additionStep('cp1-additions', [skillNumber('addition')], 2, 3, [4, 6]),
        additionStep('cp1-additions', [skillNumber('addition')], 4, 2, [5, 7]),
        additionStep('cp1-additions', [skillNumber('addition')], 5, 4, [8, 10]),
        wordProblemStep(
          'cp1-additions',
          [skillNumber('addition')],
          'Amina a 3 mangues. Moussa lui donne 2 mangues. Combien de mangues a-t-elle maintenant ?',
          5,
          [4, 6],
          'icon-mango',
        ),
      ],
    }),
    lesson({
      id: 'cp1-soustractions',
      title: 'Mes premières soustractions',
      shortDescription: 'Enlever de petites quantités.',
      learningObjectives: ['Soustraire jusqu’à 10 avec des objets'],
      skills: [skillNumber('soustraction')],
      estimatedDurationMinutes: 7,
      prerequisiteLessonIds: ['cp1-additions'],
      steps: [
        subtractionStep('cp1-soustractions', [skillNumber('soustraction')], 5, 2, [2, 4]),
        subtractionStep('cp1-soustractions', [skillNumber('soustraction')], 7, 3, [3, 5]),
        subtractionStep('cp1-soustractions', [skillNumber('soustraction')], 9, 4, [4, 6]),
        wordProblemStep(
          'cp1-soustractions',
          [skillNumber('soustraction')],
          'Ali a 6 chèvres. 2 chèvres partent au puits. Combien de chèvres restent ?',
          4,
          [3, 5],
          'icon-goat',
        ),
      ],
    }),
  ];
  lessons.push(...world5);

  const worlds = [
    {
      id: 'cp1-monde-1',
      title: 'Monde 1',
      subtitle: 'Les lettres',
      subject: 'reading',
      lessons: world1Lessons,
    },
    {
      id: 'cp1-monde-2',
      title: 'Monde 2',
      subtitle: 'Les syllabes',
      subject: 'reading',
      lessons: world2Lessons,
    },
    { id: 'cp1-monde-3', title: 'Monde 3', subtitle: 'Premiers mots', subject: 'reading', lessons: world3 },
    { id: 'cp1-monde-4', title: 'Monde 4', subtitle: 'Écouter et écrire', subject: 'dictation', lessons: world4 },
    { id: 'cp1-monde-5', title: 'Monde 5', subtitle: 'Les nombres de 0 à 20', subject: 'math', lessons: world5 },
  ];
  return { worlds, lessonIds: lessons.map((l) => l.id) };
}

// ======================= CP2 =======================

function cp2SoundLesson(sound: string, words: [string, string], prerequisite: string): LessonSpec {
  const id = `cp2-son-${slug(sound)}`;
  const skill = skillSound(sound);
  const [word1, word2] = words;
  return lesson({
    id,
    title: `Le son « ${sound} »`,
    shortDescription: `Entendre et lire le son ${sound} dans des mots.`,
    learningObjectives: [`Reconnaître le son ${sound}`, `Lire des mots avec ${sound}`],
    skills: [skill],
    estimatedDurationMinutes: 7,
    prerequisiteLessonIds: [prerequisite],
    steps: [
      listenStep(id, [skill], sound, say.syllable(sound)),
      audioMcqStep(id, [skill], word1, [word2, 'moto'], say.word),
      fillMissingLetterStep(id, [skill], word1, word1.indexOf(sound[0]!), [
        sound[0]!,
        'a',
        'l',
      ]),
      listenAndRepeatStep(id, [skill], word2),
      audioMcqStep(id, [skill], word2, [word1], say.word),
    ],
  });
}

function buildCp2(): { worlds: unknown[] } {
  // ---- World 1 : consolidate CP1 ----
  const world1 = [
    lesson({
      id: 'cp2-consolider-syllabes',
      title: 'Je me souviens des syllabes',
      shortDescription: 'Revoir les syllabes du CP1 avec fluidité.',
      learningObjectives: ['Lire des syllabes rapidement et sûrement'],
      skills: [skillSound('ba'), skillSound('ma'), skillSound('lu')],
      estimatedDurationMinutes: 5,
      prerequisiteLessonIds: [],
      steps: [
        audioMcqStep('cp2-consolider-syllabes', [skillSound('ba')], 'ba', ['ma', 'da'], say.syllable),
        composeSyllableStep('cp2-consolider-syllabes', [skillSound('lu')], 'lu', ['s']),
        audioMcqStep('cp2-consolider-syllabes', [skillSound('ma')], 'mi', ['ni', 'bi'], say.syllable),
        listenAndRepeatStep('cp2-consolider-syllabes', [skillSound('ba')], 'bo'),
      ],
    }),
    lesson({
      id: 'cp2-consolider-mots',
      title: 'Je me souviens des mots',
      shortDescription: 'Relire les mots simples du CP1.',
      learningObjectives: ['Lire des mots de deux et trois syllabes'],
      skills: [skillReading('mots-simples')],
      estimatedDurationMinutes: 5,
      prerequisiteLessonIds: ['cp2-consolider-syllabes'],
      steps: [
        imageMcqStep('cp2-consolider-mots', [skillReading('mots-simples')], 'salade', ['tomate', 'moto']),
        composeWordStep('cp2-consolider-mots', [skillReading('mots-simples')], 'tomate', ['to', 'ma', 'te'], ['ta']),
        fillMissingLetterStep('cp2-consolider-mots', [skillReading('mots-simples')], 'moto', 0, ['m', 'b', 'd']),
        audioMcqStep('cp2-consolider-mots', [skillReading('mots-simples')], 'salade', ['tomate', 'papa'], say.word),
      ],
    }),
    lesson({
      id: 'cp2-consolider-nombres',
      title: 'Les nombres jusqu’à 20',
      shortDescription: 'Revoir les nombres et les petites opérations.',
      learningObjectives: ['Compter, comparer et calculer jusqu’à 20'],
      skills: [skillNumber('11-20')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: [],
      steps: [
        numberSequenceStep('cp2-consolider-nombres', [skillNumber('11-20')], [12, 14, null, 18], 16, [15, 16, 17]),
        compareNumbersStep('cp2-consolider-nombres', [skillNumber('11-20')], 13, 19, 'greater'),
        additionStep('cp2-consolider-nombres', [skillNumber('addition')], 8, 5, [12, 14]),
        subtractionStep('cp2-consolider-nombres', [skillNumber('soustraction')], 15, 6, [8, 10]),
      ],
    }),
    lesson({
      id: 'cp2-consolider-dictee',
      title: 'Petite dictée de rentrée',
      shortDescription: 'Écouter et écrire des mots connus.',
      learningObjectives: ['Écrire des mots simples entendus'],
      skills: [skillSound('dictee-mots')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp2-consolider-mots'],
      steps: [
        audioMcqStep('cp2-consolider-dictee', [skillSound('dictee-mots')], 'papa', ['baba', 'tata'], say.word, 'grid'),
        composeWordStep('cp2-consolider-dictee', [skillSound('dictee-mots')], 'moto', ['mo', 'to'], ['ma']),
        composeWordStep('cp2-consolider-dictee', [skillSound('dictee-mots')], 'salade', ['sa', 'la', 'de'], ['si']),
        audioMcqStep('cp2-consolider-dictee', [skillSound('dictee-mots')], 'tomate', ['tata', 'moto'], say.word, 'grid'),
      ],
    }),
    lesson({
      id: 'cp2-consolider-fluence',
      title: 'Je lis de mieux en mieux',
      shortDescription: 'Lire vite et bien, sans se tromper.',
      learningObjectives: ['Gagner en fluidité de lecture'],
      skills: [skillReading('fluence')],
      estimatedDurationMinutes: 5,
      prerequisiteLessonIds: ['cp2-consolider-dictee'],
      steps: [
        textMcqStep('cp2-consolider-fluence', [skillReading('fluence')], 'Quel mot est un animal ?', 'chat', ['moto', 'salade']),
        matchPairsStep('cp2-consolider-fluence', [skillReading('fluence')], [
          ['moto', 'véhicule'],
          ['tomate', 'légume'],
          ['papa', 'famille'],
        ]),
        listenAndRepeatStep('cp2-consolider-fluence', [skillReading('fluence')], 'La moto de papa.'),
        textMcqStep('cp2-consolider-fluence', [skillReading('fluence')], 'Quel mot se mange ?', 'salade', ['lit', 'moto']),
      ],
    }),
  ];

  // ---- World 2 : complex sounds ----
  const world2 = [
    cp2SoundLesson('ou', ['loup', 'mouton'], 'cp2-consolider-fluence'),
    cp2SoundLesson('on', ['savon', 'melon'], 'cp2-son-ou'),
    cp2SoundLesson('an', ['maman', 'banane'], 'cp2-son-on'),
    cp2SoundLesson('ch', ['chat', 'mouche'], 'cp2-son-an'),
    cp2SoundLesson('oi', ['roi', 'bois'], 'cp2-son-ch'),
    lesson({
      id: 'cp2-sons-contrastes',
      title: 'Ou ou on ?',
      shortDescription: 'Bien distinguer les sons proches.',
      learningObjectives: ['Distinguer ou/on et ch/j à l’oreille'],
      skills: [skillSound('ou'), skillSound('on'), skillSound('ch')],
      estimatedDurationMinutes: 5,
      prerequisiteLessonIds: ['cp2-son-oi'],
      steps: [
        audioMcqStep('cp2-sons-contrastes', [skillSound('ou'), skillSound('on')], 'loup', ['long'], say.word),
        audioMcqStep('cp2-sons-contrastes', [skillSound('on'), skillSound('ou')], 'savon', ['savou'], say.word),
        audioMcqStep('cp2-sons-contrastes', [skillSound('ch')], 'chat', ['ja'], say.word),
        matchPairsStep('cp2-sons-contrastes', [skillSound('ou'), skillSound('on')], [
          ['l + ou + p', 'loup'],
          ['sav + on', 'savon'],
          ['m + ou + che', 'mouche'],
        ]),
      ],
    }),
  ];

  // ---- World 3 : reading sentences ----
  const world3 = [
    lesson({
      id: 'cp2-phrases-ordre',
      title: 'Des mots en ordre',
      shortDescription: 'Construire ses premières phrases.',
      learningObjectives: ['Remettre les mots d’une phrase dans l’ordre'],
      skills: [skillReading('phrase')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp2-sons-contrastes'],
      steps: [
        orderWordsStep('cp2-phrases-ordre', [skillReading('phrase')], 'Ali lit un livre.'),
        orderWordsStep('cp2-phrases-ordre', [skillReading('phrase')], 'La chèvre mange.'),
        orderWordsStep('cp2-phrases-ordre', [skillReading('phrase')], 'Amina va au marché.'),
        listenAndRepeatStep('cp2-phrases-ordre', [skillReading('phrase')], 'Ali lit un livre.'),
      ],
    }),
    lesson({
      id: 'cp2-phrases-comprendre',
      title: 'Je comprends ce que je lis',
      shortDescription: 'Lire une phrase et répondre à une question.',
      learningObjectives: ['Comprendre une phrase simple'],
      skills: [skillReading('comprehension')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp2-phrases-ordre'],
      steps: [
        textMcqStep('cp2-phrases-comprendre', [skillReading('comprehension')], 'Le soleil brille. Quel temps fait-il ?', 'Il fait beau', ['Il pleut', 'Il fait nuit']),
        textMcqStep('cp2-phrases-comprendre', [skillReading('comprehension')], 'Moussa boit de l’eau. Que fait Moussa ?', 'Il boit', ['Il mange', 'Il dort']),
        orderWordsStep('cp2-phrases-comprendre', [skillReading('phrase')], 'Le soleil brille.'),
        textMcqStep('cp2-phrases-comprendre', [skillReading('comprehension')], 'Zara garde les chèvres. Qui garde les chèvres ?', 'Zara', ['Ali', 'Maman']),
      ],
    }),
    lesson({
      id: 'cp2-phrases-consignes',
      title: 'Je lis les consignes',
      shortDescription: 'Comprendre de petites consignes écrites.',
      learningObjectives: ['Lire et comprendre une consigne'],
      skills: [skillReading('consignes')],
      estimatedDurationMinutes: 5,
      prerequisiteLessonIds: ['cp2-phrases-comprendre'],
      steps: [
        textMcqStep('cp2-phrases-consignes', [skillReading('consignes')], '« Touche l’animal. » Que dois-tu toucher ?', 'chat', ['tomate', 'lit']),
        imageMcqStep('cp2-phrases-consignes', [skillReading('consignes')], 'mouton', ['chat', 'moto']),
        textMcqStep('cp2-phrases-consignes', [skillReading('consignes')], '« Choisis le fruit. » Que dois-tu choisir ?', 'banane', ['savon', 'bois']),
        orderWordsStep('cp2-phrases-consignes', [skillReading('phrase')], 'Touche la bonne image.'),
      ],
    }),
    lesson({
      id: 'cp2-phrases-image',
      title: 'La phrase et l’image',
      shortDescription: 'Associer une phrase à la bonne image.',
      learningObjectives: ['Relier une phrase à une image'],
      skills: [skillReading('comprehension')],
      estimatedDurationMinutes: 5,
      prerequisiteLessonIds: ['cp2-phrases-consignes'],
      steps: [
        imageMcqStep('cp2-phrases-image', [skillReading('comprehension')], 'chat', ['mouton', 'loup']),
        matchPairsStep('cp2-phrases-image', [skillReading('comprehension')], [
          ['Le roi sourit.', 'roi'],
          ['Le chat dort.', 'chat'],
          ['Le loup court.', 'loup'],
        ]),
        imageMcqStep('cp2-phrases-image', [skillReading('comprehension')], 'roi', ['papa', 'ami']),
        listenAndRepeatStep('cp2-phrases-image', [skillReading('phrase')], 'Le chat dort sur le lit.'),
      ],
    }),
    lesson({
      id: 'cp2-phrases-revision',
      title: 'Je lis des phrases',
      shortDescription: 'Réviser la lecture de phrases en confiance.',
      learningObjectives: ['Lire des phrases complètes'],
      skills: [skillReading('phrase'), skillReading('comprehension')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp2-phrases-image'],
      steps: [
        orderWordsStep('cp2-phrases-revision', [skillReading('phrase')], 'Maman prépare la salade.'),
        textMcqStep('cp2-phrases-revision', [skillReading('comprehension')], 'Maman prépare la salade. Que prépare maman ?', 'la salade', ['la moto', 'le savon']),
        orderWordsStep('cp2-phrases-revision', [skillReading('phrase')], 'Le mouton boit au puits.'),
        textMcqStep('cp2-phrases-revision', [skillReading('comprehension')], 'Le mouton boit au puits. Où boit le mouton ?', 'au puits', ['au marché', 'à l’école']),
      ],
    }),
  ];

  // ---- World 4 : dictations and mini-stories ----
  const world4 = [
    lesson({
      id: 'cp2-dictee-mots',
      title: 'Dictée de mots',
      shortDescription: 'Écrire des mots avec les nouveaux sons.',
      learningObjectives: ['Écrire des mots avec ou, on, ch'],
      skills: [skillSound('dictee-mots')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp2-sons-contrastes'],
      steps: [
        audioMcqStep('cp2-dictee-mots', [skillSound('dictee-mots')], 'loup', ['long', 'lit'], say.word, 'grid'),
        composeWordStep('cp2-dictee-mots', [skillSound('dictee-mots')], 'savon', ['sa', 'von'], ['vou']),
        audioMcqStep('cp2-dictee-mots', [skillSound('dictee-mots')], 'mouche', ['bouche', 'mouton'], say.word, 'grid'),
        composeWordStep('cp2-dictee-mots', [skillSound('dictee-mots')], 'melon', ['me', 'lon'], ['lou']),
      ],
    }),
    lesson({
      id: 'cp2-dictee-groupes',
      title: 'Dictée de groupes de mots',
      shortDescription: 'Écrire de petits groupes de mots.',
      learningObjectives: ['Reconstituer un groupe de mots entendu'],
      skills: [skillSound('dictee-phrases')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp2-dictee-mots'],
      steps: [
        orderWordsStep('cp2-dictee-groupes', [skillSound('dictee-phrases')], 'le petit chat'),
        orderWordsStep('cp2-dictee-groupes', [skillSound('dictee-phrases')], 'un grand mouton'),
        orderWordsStep('cp2-dictee-groupes', [skillSound('dictee-phrases')], 'la banane de Zara'),
        listenAndRepeatStep('cp2-dictee-groupes', [skillSound('dictee-phrases')], 'le petit chat'),
      ],
    }),
    lesson({
      id: 'cp2-dictee-phrases',
      title: 'Dictée de phrases',
      shortDescription: 'Écrire une phrase entière.',
      learningObjectives: ['Reconstituer une phrase entendue'],
      skills: [skillSound('dictee-phrases')],
      estimatedDurationMinutes: 7,
      prerequisiteLessonIds: ['cp2-dictee-groupes'],
      steps: [
        orderWordsStep('cp2-dictee-phrases', [skillSound('dictee-phrases')], 'Le chat boit du lait.'),
        orderWordsStep('cp2-dictee-phrases', [skillSound('dictee-phrases')], 'Maman achète un melon.'),
        orderWordsStep('cp2-dictee-phrases', [skillSound('dictee-phrases')], 'Le roi a un mouton.'),
        audioMcqStep('cp2-dictee-phrases', [skillSound('dictee-phrases')], 'melon', ['savon', 'mouton'], say.word, 'grid'),
      ],
    }),
    lesson({
      id: 'cp2-mini-histoires',
      title: 'Mes premières histoires',
      shortDescription: 'Écouter une histoire et répondre.',
      learningObjectives: ['Comprendre une histoire courte'],
      skills: [skillReading('histoire')],
      estimatedDurationMinutes: 8,
      prerequisiteLessonIds: ['cp2-dictee-phrases'],
      steps: [
        miniStoryStep(
          'cp2-mini-histoires',
          [skillReading('histoire')],
          'Amina va au marché avec sa maman. Elle achète trois mangues et un melon. Sur le chemin du retour, elle partage une mangue avec son ami Moussa.',
          'Que partage Amina avec Moussa ?',
          'une mangue',
          ['un melon', 'une banane'],
        ),
        miniStoryStep(
          'cp2-mini-histoires',
          [skillReading('histoire')],
          'Le soir, Mahamat garde les chèvres près du puits. Une petite chèvre blanche saute et joue. Mahamat rit et la ramène doucement vers la maison.',
          'Où Mahamat garde-t-il les chèvres ?',
          'près du puits',
          ['au marché', 'à l’école'],
        ),
        textMcqStep('cp2-mini-histoires', [skillReading('histoire')], 'Qui garde les chèvres ?', 'Mahamat', ['Amina', 'Moussa']),
        miniStoryStep(
          'cp2-mini-histoires',
          [skillReading('histoire')],
          'La pluie tombe sur le village. Zara met son livre sous son bras et court sous l’arbre. Elle lit son histoire préférée en attendant le soleil.',
          'Que fait Zara sous l’arbre ?',
          'elle lit',
          ['elle dort', 'elle chante'],
        ),
      ],
    }),
  ];

  // ---- World 5 : numbers to 100 ----
  const world5 = [
    lesson({
      id: 'cp2-dizaines',
      title: 'Dizaines et unités',
      shortDescription: 'Comprendre comment les nombres sont construits.',
      learningObjectives: ['Décomposer un nombre en dizaines et unités'],
      skills: [skillNumber('dizaines')],
      estimatedDurationMinutes: 7,
      prerequisiteLessonIds: ['cp2-consolider-nombres'],
      steps: [
        textMcqStep('cp2-dizaines', [skillNumber('dizaines')], 'Dans 24, combien y a-t-il de dizaines ?', '2', ['4', '24']),
        textMcqStep('cp2-dizaines', [skillNumber('dizaines')], 'Dans 37, combien y a-t-il d’unités ?', '7', ['3', '37']),
        numberSequenceStep('cp2-dizaines', [skillNumber('dizaines')], [10, 20, null, 40], 30, [25, 30, 35]),
        audioMcqStep('cp2-dizaines', [skillNumber('dizaines')], '40', ['30', '50'], (v) => say.number(Number(v)), 'grid'),
      ],
    }),
    lesson({
      id: 'cp2-nombres-50',
      title: 'Les nombres jusqu’à 50',
      shortDescription: 'Lire et ordonner jusqu’à 50.',
      learningObjectives: ['Lire, comparer et ordonner jusqu’à 50'],
      skills: [skillNumber('jusqu-a-50')],
      estimatedDurationMinutes: 6,
      prerequisiteLessonIds: ['cp2-dizaines'],
      steps: [
        numberSequenceStep('cp2-nombres-50', [skillNumber('jusqu-a-50')], [35, 36, null, 38], 37, [37, 39, 40]),
        compareNumbersStep('cp2-nombres-50', [skillNumber('jusqu-a-50')], 42, 24, 'greater'),
        numberSequenceStep('cp2-nombres-50', [skillNumber('jusqu-a-50')], [20, 25, 30, null], 35, [35, 40, 32]),
        compareNumbersStep('cp2-nombres-50', [skillNumber('jusqu-a-50')], 48, 50, 'smaller'),
      ],
    }),
    lesson({
      id: 'cp2-nombres-100',
      title: 'Les nombres jusqu’à 100',
      shortDescription: 'Découvrir les grands nombres.',
      learningObjectives: ['Lire et comparer jusqu’à 100'],
      skills: [skillNumber('jusqu-a-100')],
      estimatedDurationMinutes: 7,
      prerequisiteLessonIds: ['cp2-nombres-50'],
      steps: [
        audioMcqStep('cp2-nombres-100', [skillNumber('jusqu-a-100')], '70', ['60', '80'], (v) => say.number(Number(v)), 'grid'),
        numberSequenceStep('cp2-nombres-100', [skillNumber('jusqu-a-100')], [60, 70, null, 90], 80, [75, 80, 85]),
        compareNumbersStep('cp2-nombres-100', [skillNumber('jusqu-a-100')], 89, 98, 'greater'),
        audioMcqStep('cp2-nombres-100', [skillNumber('jusqu-a-100')], '100', ['90', '80'], (v) => say.number(Number(v)), 'grid'),
      ],
    }),
    lesson({
      id: 'cp2-additions',
      title: 'Additions plus grandes',
      shortDescription: 'Additionner avec des dizaines.',
      learningObjectives: ['Additionner jusqu’à 50'],
      skills: [skillNumber('addition')],
      estimatedDurationMinutes: 7,
      prerequisiteLessonIds: ['cp2-dizaines'],
      steps: [
        additionStep('cp2-additions', [skillNumber('addition')], 12, 5, [15, 18]),
        additionStep('cp2-additions', [skillNumber('addition')], 20, 14, [30, 36]),
        additionStep('cp2-additions', [skillNumber('addition')], 23, 12, [33, 37]),
        wordProblemStep(
          'cp2-additions',
          [skillNumber('addition')],
          'Au marché, Khadidja vend 14 mangues le matin et 12 mangues le soir. Combien de mangues a-t-elle vendues ?',
          26,
          [24, 28],
          'icon-mango',
        ),
      ],
    }),
    lesson({
      id: 'cp2-soustractions',
      title: 'Soustractions plus grandes',
      shortDescription: 'Soustraire avec des dizaines.',
      learningObjectives: ['Soustraire jusqu’à 50'],
      skills: [skillNumber('soustraction')],
      estimatedDurationMinutes: 7,
      prerequisiteLessonIds: ['cp2-additions'],
      steps: [
        subtractionStep('cp2-soustractions', [skillNumber('soustraction')], 18, 6, [10, 14]),
        subtractionStep('cp2-soustractions', [skillNumber('soustraction')], 30, 12, [16, 20]),
        subtractionStep('cp2-soustractions', [skillNumber('soustraction')], 45, 15, [25, 35]),
        wordProblemStep(
          'cp2-soustractions',
          [skillNumber('soustraction')],
          'Ali a 25 chèvres. Il en vend 10 au marché. Combien de chèvres lui reste-t-il ?',
          15,
          [10, 20],
          'icon-goat',
        ),
      ],
    }),
    lesson({
      id: 'cp2-problemes',
      title: 'Petits problèmes du village',
      shortDescription: 'Résoudre des problèmes de la vie de tous les jours.',
      learningObjectives: ['Choisir la bonne opération', 'Résoudre un problème simple'],
      skills: [skillNumber('problemes')],
      estimatedDurationMinutes: 8,
      prerequisiteLessonIds: ['cp2-soustractions'],
      steps: [
        wordProblemStep(
          'cp2-problemes',
          [skillNumber('problemes')],
          'Mariam a 8 calebasses. Elle en remplit 3 d’eau. Combien de calebasses sont encore vides ?',
          5,
          [3, 6],
          'icon-calabash',
        ),
        wordProblemStep(
          'cp2-problemes',
          [skillNumber('problemes')],
          'Dans la classe, il y a 12 filles et 13 garçons. Combien y a-t-il d’enfants en tout ?',
          25,
          [23, 26],
        ),
        wordProblemStep(
          'cp2-problemes',
          [skillNumber('problemes')],
          'Moussa cueille 20 mangues. Il en donne 5 à ses amis. Combien de mangues garde-t-il ?',
          15,
          [12, 18],
          'icon-mango',
        ),
        additionStep('cp2-problemes', [skillNumber('problemes')], 15, 10, [20, 30]),
      ],
    }),
  ];

  const worlds = [
    { id: 'cp2-monde-1', title: 'Monde 1', subtitle: 'Consolider le CP1', subject: 'reading', lessons: world1 },
    { id: 'cp2-monde-2', title: 'Monde 2', subtitle: 'Sons complexes', subject: 'reading', lessons: world2 },
    { id: 'cp2-monde-3', title: 'Monde 3', subtitle: 'Petites phrases', subject: 'reading', lessons: world3 },
    { id: 'cp2-monde-4', title: 'Monde 4', subtitle: 'Dictées courtes', subject: 'dictation', lessons: world4 },
    { id: 'cp2-monde-5', title: 'Monde 5', subtitle: 'Nombres jusqu’à 100', subject: 'math', lessons: world5 },
  ];
  return { worlds };
}

// ---------------------------------------------------------------------------
// Assemble, validate, write
// ---------------------------------------------------------------------------
const cp1 = buildCp1();
const cp2 = buildCp2();

const manifest = {
  schemaVersion: 1,
  contentVersion: '1.0.0',
  generatedAt: '2026-07-13T00:00:00.000Z',
  levels: [
    { id: 'CP1', title: 'CP1', worlds: cp1.worlds },
    { id: 'CP2', title: 'CP2', worlds: cp2.worlds },
  ],
  assets: [
    ...[...ttsMap.keys()].sort().map((id) => ({
      id,
      kind: 'audio' as const,
      file: `audio/fr/${id}.m4a`,
      placeholder: true,
    })),
    ...[...usedIllustrations].sort().map((id) => ({
      id,
      kind: 'illustration' as const,
      file: `illustrations/${id}.svg`,
      placeholder: false,
    })),
  ],
};

const parsedResult = curriculumManifestSchema.safeParse(manifest);
if (!parsedResult.success) {
  console.error('MANIFEST INVALID:');
  for (const issue of parsedResult.error.issues.slice(0, 20)) {
    console.error(` - ${issue.path.join('.')}: ${issue.message}`);
  }
  throw new Error('curriculum manifest failed validation');
}
const parsed = parsedResult;

const lessonTotal = parsed.data.levels.reduce(
  (sum, level) => sum + level.worlds.reduce((s, world) => s + world.lessons.length, 0),
  0,
);
const cp1Total = parsed.data.levels[0]!.worlds.reduce((s, world) => s + world.lessons.length, 0);

function writeJson(relativePath: string, data: unknown): void {
  const fullPath = join(ROOT, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, `${JSON.stringify(data, null, 1)}\n`);
  console.log(`wrote ${relativePath}`);
}

writeJson('src/content/manifests/curriculum-v1.json', parsed.data);

// Static require() map so Metro bundles every pedagogical sound offline.
const audioRegistry = [
  '/* AUTO-GENERATED by scripts/generate-content.ts — do not edit by hand. */',
  '/* eslint-disable @typescript-eslint/no-require-imports */',
  '',
  'export const audioSources: Record<string, number> = {',
  ...[...ttsMap.keys()]
    .sort()
    .map((id) => `  '${id}': require('../../assets/audio/fr/${id}.m4a'),`),
  '};',
  '',
  'export function resolveAudioSource(audioId: string): number | null {',
  '  return audioSources[audioId] ?? null;',
  '}',
  '',
].join('\n');
writeFileSync(join(ROOT, 'src/content/audio-registry.generated.ts'), audioRegistry);
console.log('wrote src/content/audio-registry.generated.ts');
writeJson('assets/audio/manifest.json', {
  generatedAt: manifest.generatedAt,
  voice: 'placeholder-tts',
  entries: [...ttsMap.keys()].sort().map((id) => ({ id, file: `fr/${id}.m4a`, placeholder: true })),
});
writeJson('assets/audio/tts-map.json', Object.fromEntries([...ttsMap.entries()].sort()));

console.log(
  `OK — ${lessonTotal} lessons (CP1: ${cp1Total}, CP2: ${lessonTotal - cp1Total}), ` +
    `${ttsMap.size} audio assets, ${usedIllustrations.size} illustrations`,
);
