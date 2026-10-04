import { exerciseStepSchema, type ExerciseStep } from '@/content/schemas/exercise-schema';
import { buildLesson } from '@/shared/testing/lesson-fixtures';

import {
  createLessonMachine,
  lessonReducer,
  type LessonEvent,
  type LessonMachineState,
} from './lesson-machine';
import { hintAudioSequence, makesSound, retryAudioSequence, stimulusAudioId } from './step-audio';

const instruction = { text: 'Touche l’image du mot que tu entends.', audioId: 'instr-image' };

const imageStep = exerciseStepSchema.parse({
  id: 's-image',
  type: 'image_multiple_choice',
  skills: ['skill-mot'],
  instruction,
  audioId: 'mot-ecole',
  choices: [
    { id: 'ecole', illustrationId: 'icon-school' },
    { id: 'maitre', illustrationId: 'icon-teacher' },
  ],
  correctChoiceId: 'ecole',
  hint: { text: 'Écoute encore le mot.', audioId: 'hint-ecoute-mot' },
});

const countStep = exerciseStepSchema.parse({
  id: 's-count',
  type: 'count_objects',
  skills: ['skill-compter'],
  instruction: { text: 'Combien vois-tu de chèvres ?', audioId: 'instr-combien' },
  illustrationId: 'icon-goat',
  objectName: 'chèvres',
  count: 3,
  options: [2, 3, 4],
  hint: { text: 'Touche chaque image en comptant.', audioId: 'hint-compte' },
});

const storyStep = exerciseStepSchema.parse({
  id: 's-story',
  type: 'mini_story_question',
  skills: ['skill-histoire'],
  instruction: { text: 'Écoute l’histoire.', audioId: 'instr-histoire' },
  story: 'Ali va au marché.',
  storyAudioId: 'histoire-marche',
  question: 'Où va Ali ?',
  questionAudioId: 'question-marche',
  choices: [
    { id: 'marche', label: 'au marché' },
    { id: 'ecole', label: 'à l’école' },
  ],
  correctChoiceId: 'marche',
  hint: { text: 'Réécoute l’histoire si tu veux.', audioId: 'hint-histoire' },
});

const problemStep = exerciseStepSchema.parse({
  id: 's-problem',
  type: 'visual_word_problem',
  skills: ['skill-probleme'],
  instruction: { text: 'Écoute et compte.', audioId: 'instr-probleme' },
  statement: 'Awa a 2 mangues, elle en reçoit 1.',
  statementAudioId: 'enonce-mangues',
  answer: 3,
  options: [2, 3, 4],
});

/** Une image sans mot à entendre (le dessin suffit) : rien à rejouer. */
const silentImageStep = exerciseStepSchema.parse({
  ...imageStep,
  id: 's-image-muette',
  audioId: undefined,
});

function lessonOf(steps: ExerciseStep[]) {
  return buildLesson({ steps });
}

/** L'enfant en face de la question `index`. */
function awaiting(steps: ExerciseStep[], index = 0): LessonMachineState {
  return lessonReducer(createLessonMachine(lessonOf(steps), index), { type: 'STEP_PRESENTED' });
}

const missImage: LessonEvent = {
  type: 'ANSWER_SUBMITTED',
  answer: { kind: 'choice', choiceId: 'maitre' },
};

describe('le son de l’étape', () => {
  it('est le mot, l’histoire ou l’énoncé selon l’exercice', () => {
    expect(stimulusAudioId(imageStep)).toBe('mot-ecole');
    expect(stimulusAudioId(storyStep)).toBe('histoire-marche');
    expect(stimulusAudioId(problemStep)).toBe('enonce-mangues');
  });

  it('manque aux exercices qui se regardent', () => {
    expect(stimulusAudioId(countStep)).toBeNull();
    expect(stimulusAudioId(silentImageStep)).toBeNull();
    expect(makesSound(countStep)).toBe(false);
    expect(makesSound(imageStep)).toBe(true);
  });
});

describe('l’indice qui aide', () => {
  it('dit sa phrase, puis rejoue le mot', () => {
    expect(hintAudioSequence(imageStep)).toEqual(['hint-ecoute-mot', 'mot-ecole']);
  });

  it('rejoue l’histoire après « Réécoute l’histoire »', () => {
    expect(hintAudioSequence(storyStep)).toEqual(['hint-histoire', 'histoire-marche']);
  });

  it('ne dit que sa phrase quand l’étape est muette', () => {
    expect(hintAudioSequence(countStep)).toEqual(['hint-compte']);
  });

  it('rejoue au moins le son quand la phrase n’est pas enregistrée', () => {
    const unvoiced = exerciseStepSchema.parse({
      ...imageStep,
      hint: { text: 'Écoute encore le mot.' },
    });
    expect(hintAudioSequence(unvoiced)).toEqual(['mot-ecole']);
  });
});

describe('« Réessayer » rejoue le son', () => {
  it('au premier essai manqué, quand le bouton ramène à la même question', () => {
    const feedback = lessonReducer(awaiting([imageStep, countStep, storyStep]), missImage);
    expect(feedback.phase).toBe('showing_feedback');
    expect(retryAudioSequence(feedback)).toEqual(['mot-ecole']);
  });

  it('pas au deuxième : c’est l’indice qui s’ouvre, et il dit lui-même phrase et mot', () => {
    let state = lessonReducer(awaiting([imageStep, countStep, storyStep]), missImage);
    state = lessonReducer(state, { type: 'FEEDBACK_DISMISSED' });
    state = lessonReducer(state, missImage);
    expect(lessonReducer(state, { type: 'FEEDBACK_DISMISSED' }).phase).toBe('showing_hint');
    expect(retryAudioSequence(state)).toEqual([]);
  });

  it('pas au troisième : on passe à l’étape suivante', () => {
    let state = lessonReducer(awaiting([imageStep, countStep, storyStep]), missImage);
    state = lessonReducer(state, { type: 'FEEDBACK_DISMISSED' });
    state = lessonReducer(state, missImage);
    state = lessonReducer(state, { type: 'FEEDBACK_DISMISSED' });
    state = lessonReducer(state, { type: 'HINT_DISMISSED' });
    state = lessonReducer(state, missImage);
    expect(state.attemptsOnCurrentStep).toBe(3);
    expect(retryAudioSequence(state)).toEqual([]);
  });

  it('pas après une bonne réponse, ni sur une étape muette', () => {
    const right = lessonReducer(awaiting([imageStep, countStep, storyStep]), {
      type: 'ANSWER_SUBMITTED',
      answer: { kind: 'choice', choiceId: 'ecole' },
    });
    expect(retryAudioSequence(right)).toEqual([]);
    const missCount = lessonReducer(awaiting([imageStep, countStep, storyStep], 1), {
      type: 'ANSWER_SUBMITTED',
      answer: { kind: 'number', value: 2 },
    });
    expect(missCount.lastFeedback).toBe('incorrect');
    expect(retryAudioSequence(missCount)).toEqual([]);
  });
});
