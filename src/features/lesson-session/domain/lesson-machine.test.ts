import { buildLesson } from '@/shared/testing/lesson-fixtures';

import {
  createLessonMachine,
  currentStep,
  lessonReducer,
  type LessonMachineState,
} from './lesson-machine';

function present(state: LessonMachineState): LessonMachineState {
  return lessonReducer(state, { type: 'STEP_PRESENTED' });
}

describe('lesson state machine', () => {
  it('walks a full lesson to completion', () => {
    let state = createLessonMachine(buildLesson());
    expect(state.phase).toBe('presenting');

    // Step 1: listen
    state = present(state);
    state = lessonReducer(state, { type: 'ANSWER_SUBMITTED', answer: { kind: 'acknowledge' } });
    state = lessonReducer(state, { type: 'FEEDBACK_DISMISSED' });
    expect(state.stepIndex).toBe(1);

    // Step 2: choice, correct first try
    state = present(state);
    state = lessonReducer(state, {
      type: 'ANSWER_SUBMITTED',
      answer: { kind: 'choice', choiceId: 'ba' },
    });
    expect(state.lastFeedback).toBe('correct');
    state = lessonReducer(state, { type: 'FEEDBACK_DISMISSED' });
    expect(state.stepIndex).toBe(2);

    // Step 3: compose
    state = present(state);
    state = lessonReducer(state, {
      type: 'ANSWER_SUBMITTED',
      answer: { kind: 'sequence', values: ['b', 'a'] },
    });
    state = lessonReducer(state, { type: 'FEEDBACK_DISMISSED' });

    expect(state.phase).toBe('completed');
    expect(state.outcomes).toHaveLength(3);
    expect(state.outcomes.every((outcome) => outcome.firstTryCorrect)).toBe(true);
  });

  it('keeps the child on the step after a wrong answer, without recording an outcome', () => {
    let state = present(createLessonMachine(buildLesson()));
    state = lessonReducer(state, { type: 'FEEDBACK_DISMISSED' }); // illegal: ignored
    expect(state.phase).toBe('awaiting_answer');

    state = { ...state, stepIndex: 1, phase: 'awaiting_answer' };
    state = lessonReducer(state, {
      type: 'ANSWER_SUBMITTED',
      answer: { kind: 'choice', choiceId: 'ma' },
    });
    expect(state.lastFeedback).toBe('incorrect');
    state = lessonReducer(state, { type: 'FEEDBACK_DISMISSED' });
    expect(state.phase).toBe('awaiting_answer');
    expect(state.stepIndex).toBe(1);
    expect(state.outcomes).toHaveLength(0);

    // Second try succeeds but is no longer "first try".
    state = lessonReducer(state, {
      type: 'ANSWER_SUBMITTED',
      answer: { kind: 'choice', choiceId: 'ba' },
    });
    state = lessonReducer(state, { type: 'FEEDBACK_DISMISSED' });
    expect(state.outcomes[0]?.firstTryCorrect).toBe(false);
    expect(state.outcomes[0]?.attempts).toBe(2);
  });

  it('ignores double submissions while feedback is showing', () => {
    let state = present(createLessonMachine(buildLesson()));
    state = lessonReducer(state, { type: 'ANSWER_SUBMITTED', answer: { kind: 'acknowledge' } });
    const afterFirst = state;
    state = lessonReducer(state, { type: 'ANSWER_SUBMITTED', answer: { kind: 'acknowledge' } });
    expect(state).toBe(afterFirst);
    expect(state.attemptsOnCurrentStep).toBe(1);
  });

  it('marks hint usage on the recorded outcome', () => {
    let state = createLessonMachine(buildLesson(), 2);
    expect(currentStep(state).type).toBe('compose_syllable');
    state = present(state);
    state = lessonReducer(state, { type: 'HINT_REQUESTED' });
    expect(state.phase).toBe('showing_hint');
    state = lessonReducer(state, { type: 'HINT_DISMISSED' });
    state = lessonReducer(state, {
      type: 'ANSWER_SUBMITTED',
      answer: { kind: 'sequence', values: ['b', 'a'] },
    });
    state = lessonReducer(state, { type: 'FEEDBACK_DISMISSED' });
    expect(state.phase).toBe('completed');
    expect(state.outcomes.at(-1)?.usedHint).toBe(true);
    expect(state.outcomes.at(-1)?.firstTryCorrect).toBe(false);
  });

  it('resumes at a saved step index within bounds', () => {
    const resumed = createLessonMachine(buildLesson(), 99);
    expect(resumed.stepIndex).toBe(2);
    const negative = createLessonMachine(buildLesson(), -4);
    expect(negative.stepIndex).toBe(0);
  });

  it('ignores invalid answers entirely (no attempt burned)', () => {
    let state = present(createLessonMachine(buildLesson(), 1));
    state = lessonReducer(state, {
      type: 'ANSWER_SUBMITTED',
      answer: { kind: 'number', value: 4 },
    });
    expect(state.phase).toBe('awaiting_answer');
    expect(state.attemptsOnCurrentStep).toBe(0);
  });
});
