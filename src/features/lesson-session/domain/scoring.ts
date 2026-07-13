import type { Lesson } from '@/content/schemas/curriculum-schema';

import type { StepOutcome } from './lesson-machine';

/**
 * Stars measure learning, not speed:
 *   3 — high mastery (mostly first-try, no hints)
 *   2 — objective reached with some help
 *   1 — lesson finished but the notions need revision
 * Zero stars is never shown to the child (finishing always earns at least 1).
 */
export interface LessonScore {
  readonly stars: 1 | 2 | 3;
  readonly firstTryRatio: number;
  readonly correctRatio: number;
  readonly hintsUsed: number;
  readonly errorCount: number;
  readonly struggledSkills: readonly string[];
}

export function scoreLesson(lesson: Lesson, outcomes: readonly StepOutcome[]): LessonScore {
  const total = outcomes.length;
  const firstTry = outcomes.filter((outcome) => outcome.firstTryCorrect).length;
  const hintsUsed = outcomes.filter((outcome) => outcome.usedHint).length;
  const errorCount = outcomes.reduce((sum, outcome) => sum + (outcome.attempts - 1), 0);

  const firstTryRatio = total === 0 ? 0 : firstTry / total;
  // Steps are only recorded once eventually correct, so correctRatio measures
  // how many were solved without excessive retries (≤ 2 attempts).
  const solvedEasily = outcomes.filter((outcome) => outcome.attempts <= 2).length;
  const correctRatio = total === 0 ? 0 : solvedEasily / total;

  const { threeStarsMinFirstTryRatio, twoStarsMinCorrectRatio } = lesson.completionRule;

  let stars: 1 | 2 | 3 = 1;
  if (firstTryRatio >= threeStarsMinFirstTryRatio && hintsUsed === 0) {
    stars = 3;
  } else if (correctRatio >= twoStarsMinCorrectRatio) {
    stars = 2;
  }

  // Skills the child struggled with (repeated errors or hint needed).
  const struggled = new Set<string>();
  for (const outcome of outcomes) {
    if (outcome.attempts >= 2 || outcome.usedHint) {
      for (const skill of outcome.skills) {
        struggled.add(skill);
      }
    }
  }

  return {
    stars,
    firstTryRatio,
    correctRatio,
    hintsUsed,
    errorCount,
    struggledSkills: [...struggled],
  };
}
