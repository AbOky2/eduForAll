/**
 * Step builders — one per exercise type of the content schema.
 *
 * Builders are the only place that knows the shape of a step, so the lesson
 * files below read as pedagogy ("teach the sound l, then build syllables with
 * it") rather than as JSON assembly.
 */
import { audio, say } from './audio';
import { illustration } from './assets';

export type AnyStep = Record<string, unknown>;

let counter = 0;

export function stepId(lessonId: string): string {
  counter += 1;
  return `${lessonId}-s${counter}`;
}

export function resetStepCounter(): void {
  counter = 0;
}

interface Base {
  lessonId: string;
  skills: string[];
}

// ---------------------------------------------------------------------------
// Lecture — sons, syllabes, mots, phrases
// ---------------------------------------------------------------------------

export function listenStep(
  { lessonId, skills }: Base,
  glyph: string,
  audioId: string,
  instruction = 'Écoute bien.',
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'listen',
    skills,
    instruction: say.instruction(instruction),
    glyph,
    audioId,
  };
}

export function tapLetterStep(
  { lessonId, skills }: Base,
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

export function tapSyllableStep(
  { lessonId, skills }: Base,
  target: string,
  options: string[],
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'tap_syllable',
    skills,
    instruction: say.instruction('Touche la syllabe que tu entends.'),
    hint: say.hint('Écoute encore : quelle est la première lettre ?'),
    target,
    options,
    audioId: say.syllable(target),
  };
}

export function audioMcqStep(
  { lessonId, skills }: Base,
  correct: string,
  distractors: string[],
  registerAudio: (value: string) => string,
  layout: 'list' | 'grid' = 'list',
  instruction = 'Que viens-tu d’entendre ?',
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'audio_multiple_choice',
    skills,
    instruction: say.instruction(instruction),
    hint: say.hint('Écoute encore une fois.'),
    audioId: registerAudio(correct),
    choices: [correct, ...distractors].map((label) => ({ id: label, label })),
    correctChoiceId: correct,
    layout,
  };
}

export function textMcqStep(
  { lessonId, skills }: Base,
  question: string,
  correct: string,
  distractors: string[],
  instruction = 'Lis et choisis la bonne réponse.',
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'text_multiple_choice',
    skills,
    instruction: say.instruction(instruction),
    hint: say.hint('Relis la question doucement.'),
    question,
    choices: [correct, ...distractors].map((label) => ({ id: label, label })),
    correctChoiceId: correct,
  };
}

export function imageMcqStep(
  { lessonId, skills }: Base,
  correct: { word: string; icon: string },
  distractors: { word: string; icon: string }[],
  instruction = 'Touche l’image du mot que tu entends.',
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'image_multiple_choice',
    skills,
    instruction: say.instruction(instruction),
    hint: say.hint('Écoute encore le mot.'),
    audioId: say.word(correct.word),
    choices: [correct, ...distractors].map((candidate) => ({
      id: candidate.word,
      illustrationId: illustration(candidate.icon),
      label: candidate.word,
    })),
    correctChoiceId: correct.word,
  };
}

export function composeSyllableStep(
  { lessonId, skills }: Base,
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

export function composeWordStep(
  { lessonId, skills }: Base,
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

export function fillMissingLetterStep(
  { lessonId, skills }: Base,
  word: string,
  missingIndex: number,
  /** Wrong letters to offer alongside the answer. The answer is added here. */
  distractors: string[],
): AnyStep {
  const answer = word[missingIndex];
  if (!answer) {
    throw new Error(`missingIndex ${missingIndex} out of range for "${word}"`);
  }
  // The answer is always among the options — the exercise is never unsolvable.
  const options = [answer, ...distractors.filter((candidate) => candidate !== answer).slice(0, 2)];
  if (options.length < 2) {
    throw new Error(`fill_missing_letter for "${word}" needs at least one distractor`);
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

export function matchPairsStep(
  { lessonId, skills }: Base,
  pairs: [string, string][],
  instruction = 'Associe ce qui va ensemble.',
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'match_pairs',
    skills,
    instruction: say.instruction(instruction),
    hint: say.hint('Commence par ce que tu connais déjà.'),
    pairs: pairs.map(([left, right], index) => ({ id: `p${index + 1}`, left, right })),
  };
}

/** Longest sentence a CP child is asked to reorder. */
export const MAX_ORDERED_WORDS = 8;

export function orderWordsStep({ lessonId, skills }: Base, sentence: string): AnyStep {
  const words = sentence.replace(/[.!?]$/, '').split(' ');
  if (words.length > MAX_ORDERED_WORDS) {
    throw new Error(
      `order_words: "${sentence}" has ${words.length} words, over the CP limit of ${MAX_ORDERED_WORDS}`,
    );
  }
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

export function soundPositionStep(
  { lessonId, skills }: Base,
  word: string,
  sound: string,
  answer: 'debut' | 'milieu' | 'fin',
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'sound_position',
    skills,
    instruction: say.instruction(`Où entends-tu « ${sound} » ?`),
    hint: say.hint('Dis le mot lentement, syllabe par syllabe.'),
    word,
    sound,
    audioId: say.word(word),
    answer,
  };
}

export function listenRepeatStep({ lessonId, skills }: Base, text: string): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'listen_and_repeat',
    skills,
    instruction: say.instruction('Écoute, puis répète à voix haute.'),
    text,
    audioId: text.split(' ').length > 1 ? say.sentence(text) : say.word(text),
  };
}

export function miniStoryStep(
  { lessonId, skills }: Base,
  story: string,
  question: string,
  correct: string,
  distractors: string[],
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'mini_story_question',
    skills,
    instruction: say.instruction('Écoute l’histoire, puis réponds.'),
    hint: say.hint('Réécoute l’histoire si tu veux.'),
    story,
    storyAudioId: say.story(story),
    question,
    questionAudioId: audio('question', question),
    choices: [correct, ...distractors].map((label) => ({ id: label, label })),
    correctChoiceId: correct,
  };
}

// ---------------------------------------------------------------------------
// Écriture — graphisme puis lettres, chiffres, majuscules, copie
// ---------------------------------------------------------------------------

export function graphismStep({ lessonId, skills }: Base, pattern: string, label: string): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'trace_graphism',
    skills,
    instruction: say.instruction(`Trace ${label} avec ton doigt.`),
    hint: say.hint('Pars du gros point et va vers la droite.'),
    pattern,
    // Keyed on the label, not the pattern: the same tracing is announced
    // differently in graphism (« la ligne couchée ») and geometry (« la ligne droite »).
    audioId: audio('graphisme', label, `Trace ${label}.`),
  };
}

export function traceLetterStep({ lessonId, skills }: Base, letter: string): AnyStep {
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

// ---------------------------------------------------------------------------
// Mathématiques
// ---------------------------------------------------------------------------

export function countObjectsStep(
  { lessonId, skills }: Base,
  object: { icon: string; plural: string; singular: string },
  count: number,
  options: number[],
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'count_objects',
    skills,
    instruction: say.instruction(`Compte les ${object.plural}.`),
    hint: say.hint('Touche chaque image en comptant à voix haute.'),
    illustrationId: illustration(object.icon),
    objectName: count > 1 ? object.plural : object.singular,
    count,
    options,
  };
}

export function numberSequenceStep(
  { lessonId, skills }: Base,
  sequence: (number | null)[],
  answer: number,
  options: number[],
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'number_sequence',
    skills,
    instruction: say.instruction('Quel nombre manque ?'),
    hint: say.hint('Compte à voix haute en partant du début.'),
    sequence,
    answer,
    options,
  };
}

export function compareNumbersStep(
  { lessonId, skills }: Base,
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
    hint: say.hint('Le nombre le plus grand est celui qu’on dit en dernier quand on compte.'),
    left,
    right,
    mode,
  };
}

type Operation =
  'simple_addition' | 'simple_subtraction' | 'simple_multiplication' | 'simple_division';

const OPERATION_INSTRUCTION: Record<Operation, string> = {
  simple_addition: 'Combien font-ils en tout ?',
  simple_subtraction: 'Combien en reste-t-il ?',
  simple_multiplication: 'Combien cela fait-il en tout ?',
  simple_division: 'Combien chacun en a-t-il ?',
};

export function operationStep(
  { lessonId, skills }: Base,
  type: Operation,
  a: number,
  b: number,
  options: number[],
  showQuantities = true,
): AnyStep {
  return {
    id: stepId(lessonId),
    type,
    skills,
    instruction: say.instruction(OPERATION_INSTRUCTION[type]),
    hint: say.hint('Compte les points sur les cartes.'),
    a,
    b,
    options,
    showQuantities,
  };
}

export function wordProblemStep(
  { lessonId, skills }: Base,
  statement: string,
  answer: number,
  options: number[],
  icon?: string,
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'visual_word_problem',
    skills,
    instruction: say.instruction('Écoute le problème et trouve la réponse.'),
    hint: say.hint('Réécoute l’histoire : qu’est-ce qu’on ajoute, qu’est-ce qu’on enlève ?'),
    statement,
    statementAudioId: say.sentence(statement),
    ...(icon ? { illustrationId: illustration(icon) } : {}),
    answer,
    options,
  };
}

export function attributeStep(
  { lessonId, skills }: Base,
  attribute: 'size' | 'color' | 'shape' | 'quantity',
  instruction: string,
  choices: {
    id: string;
    shape: 'rond' | 'carre' | 'rectangle' | 'triangle' | 'ligne';
    color?: 'rouge' | 'bleu' | 'jaune' | 'vert' | 'blanc' | 'noir';
    scale?: number;
    count?: number;
    label?: string;
  }[],
  correctChoiceId: string,
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'attribute_choice',
    skills,
    instruction: say.instruction(instruction),
    hint: say.hint('Regarde bien chaque image avant de choisir.'),
    attribute,
    audioId: audio('instr', instruction),
    choices: choices.map((choice) => ({
      id: choice.id,
      shape: choice.shape,
      color: choice.color ?? 'bleu',
      scale: choice.scale ?? 1,
      count: choice.count ?? 1,
      ...(choice.label ? { label: choice.label } : {}),
    })),
    correctChoiceId,
  };
}

export type SpatialRelation =
  | 'sur'
  | 'sous'
  | 'dans'
  | 'devant'
  | 'derriere'
  | 'a-gauche'
  | 'a-droite'
  | 'au-dessus'
  | 'en-dessous'
  | 'entre'
  | 'a-cote';

export function spatialStep(
  { lessonId, skills }: Base,
  instruction: string,
  objectIcon: string,
  referenceIcon: string,
  relations: SpatialRelation[],
  correct: SpatialRelation,
): AnyStep {
  return {
    id: stepId(lessonId),
    type: 'spatial_position',
    skills,
    instruction: say.instruction(instruction),
    hint: say.hint('Écoute encore le mot qui dit où c’est.'),
    audioId: audio('instr', instruction),
    objectIllustrationId: illustration(objectIcon),
    referenceIllustrationId: illustration(referenceIcon),
    choices: relations.map((relation) => ({ id: relation, relation })),
    correctChoiceId: correct,
  };
}

export function moneyStep({ lessonId, skills }: Base, coins: number[], options: number[]): AnyStep {
  const answer = coins.reduce((sum, coin) => sum + coin, 0);
  if (!options.includes(answer)) {
    throw new Error(`money options must contain the answer ${answer}`);
  }
  return {
    id: stepId(lessonId),
    type: 'count_money',
    skills,
    instruction: say.instruction('Compte l’argent. Combien y a-t-il ?'),
    hint: say.hint('Compte les grosses pièces d’abord.'),
    coins,
    answer,
    options,
  };
}
