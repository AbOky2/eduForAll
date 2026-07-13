import { buildLesson } from '@/shared/testing/lesson-fixtures';

import type { StepOutcome } from './lesson-machine';
import { scoreLesson } from './scoring';

function outcome(overrides: Partial<StepOutcome> = {}): StepOutcome {
  return {
    stepId: 'step',
    exerciseType: 'audio_multiple_choice',
    firstTryCorrect: true,
    attempts: 1,
    usedHint: false,
    skills: ['skill-son-ba'],
    ...overrides,
  };
}

describe('scoreLesson', () => {
  const lesson = buildLesson();

  it('gives 3 stars for first-try mastery without hints', () => {
    const score = scoreLesson(lesson, [outcome(), outcome(), outcome()]);
    expect(score.stars).toBe(3);
    expect(score.struggledSkills).toHaveLength(0);
  });

  it('gives 2 stars when the objective is reached with some help', () => {
    const score = scoreLesson(lesson, [
      outcome(),
      outcome({ firstTryCorrect: false, attempts: 2 }),
      outcome({ firstTryCorrect: false, usedHint: true }),
    ]);
    expect(score.stars).toBe(2);
    expect(score.struggledSkills).toContain('skill-son-ba');
  });

  it('gives 1 star (never zero) when revision is needed', () => {
    const score = scoreLesson(lesson, [
      outcome({ firstTryCorrect: false, attempts: 4 }),
      outcome({ firstTryCorrect: false, attempts: 3, usedHint: true }),
      outcome({ firstTryCorrect: false, attempts: 3 }),
    ]);
    expect(score.stars).toBe(1);
    expect(score.errorCount).toBe(7);
  });

  it('counts hints and flags struggled skills for the revision engine', () => {
    const score = scoreLesson(lesson, [
      outcome({ usedHint: true, firstTryCorrect: false, skills: ['skill-son-ma'] }),
      outcome(),
      outcome(),
    ]);
    expect(score.hintsUsed).toBe(1);
    expect(score.struggledSkills).toEqual(['skill-son-ma']);
  });
});
