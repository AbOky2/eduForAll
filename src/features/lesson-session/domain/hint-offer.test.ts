import { buildLesson } from '@/shared/testing/lesson-fixtures';

import {
  createLessonMachine,
  lessonReducer,
  type LessonEvent,
  type LessonMachineState,
} from './lesson-machine';
import { isHintOffered } from './hint-offer';

/** L'étape « composer » de la leçon type porte un indice. */
function awaitingCompose(): LessonMachineState {
  const state = createLessonMachine(buildLesson(), 2);
  return lessonReducer(state, { type: 'STEP_PRESENTED' });
}

const wrong: LessonEvent = {
  type: 'ANSWER_SUBMITTED',
  answer: { kind: 'sequence', values: ['m', 'a'] },
};

describe("l'ampoule d'indice", () => {
  it("n'est pas offerte avant la question : la curiosité ne coûte pas d'étoile", () => {
    expect(isHintOffered(awaitingCompose())).toBe(false);
  });

  it('est offerte après un premier essai manqué, une fois la feuille refermée', () => {
    const feedback = lessonReducer(awaitingCompose(), wrong);
    expect(isHintOffered(feedback)).toBe(false);
    const retry = lessonReducer(feedback, { type: 'FEEDBACK_DISMISSED' });
    expect(retry.phase).toBe('awaiting_answer');
    expect(isHintOffered(retry)).toBe(true);
  });

  it("s'efface pendant la feuille d'indice, et revient ensuite", () => {
    const retry = lessonReducer(lessonReducer(awaitingCompose(), wrong), {
      type: 'FEEDBACK_DISMISSED',
    });
    const hint = lessonReducer(retry, { type: 'HINT_REQUESTED' });
    expect(hint.phase).toBe('showing_hint');
    expect(isHintOffered(hint)).toBe(false);
    expect(isHintOffered(lessonReducer(hint, { type: 'HINT_DISMISSED' }))).toBe(true);
  });

  it("n'existe pas pour une étape sans indice", () => {
    const choice = lessonReducer(createLessonMachine(buildLesson(), 1), { type: 'STEP_PRESENTED' });
    const miss = lessonReducer(choice, {
      type: 'ANSWER_SUBMITTED',
      answer: { kind: 'choice', choiceId: 'ma' },
    });
    expect(isHintOffered(lessonReducer(miss, { type: 'FEEDBACK_DISMISSED' }))).toBe(false);
  });
});
