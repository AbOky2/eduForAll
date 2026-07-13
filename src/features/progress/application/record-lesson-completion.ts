import { getDatabase } from '@/database/connection/database';
import { newLearningSessionId, type ChildProfileId, type LessonId } from '@/core/ids/ids';
import type { Lesson } from '@/content/schemas/curriculum-schema';
import type { StepOutcome } from '@/features/lesson-session/domain/lesson-machine';
import { scoreLesson, type LessonScore } from '@/features/lesson-session/domain/scoring';

/**
 * Persists everything a finished lesson produces, in one transaction:
 * result row, per-skill mastery counters, revision queue entries for
 * struggled skills, and a learning session row for the parent dashboard.
 */
export async function recordLessonCompletion(input: {
  childProfileId: ChildProfileId;
  lesson: Lesson;
  outcomes: readonly StepOutcome[];
  startedAt: string;
}): Promise<LessonScore> {
  const { childProfileId, lesson, outcomes, startedAt } = input;
  const score = scoreLesson(lesson, outcomes);
  const now = new Date().toISOString();
  const db = await getDatabase();

  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT INTO lesson_progress
         (child_profile_id, lesson_id, status, stars, current_step_index,
          hints_used, error_count, completed_at, updated_at)
       VALUES (?, ?, 'completed', ?, 0, ?, ?, ?, ?)
       ON CONFLICT(child_profile_id, lesson_id) DO UPDATE SET
         status = 'completed',
         stars = MAX(lesson_progress.stars, excluded.stars),
         current_step_index = 0,
         hints_used = excluded.hints_used,
         error_count = excluded.error_count,
         completed_at = excluded.completed_at,
         updated_at = excluded.updated_at`,
      childProfileId,
      lesson.id,
      score.stars,
      score.hintsUsed,
      score.errorCount,
      now,
      now,
    );

    for (const outcome of outcomes) {
      const errors = outcome.attempts - 1;
      for (const skillId of outcome.skills) {
        await txn.runAsync(
          `INSERT INTO skill_mastery
             (child_profile_id, skill_id, correct_count, error_count, hint_count,
              last_practiced_at, mastery)
           VALUES (?, ?, 1, ?, ?, ?, ?)
           ON CONFLICT(child_profile_id, skill_id) DO UPDATE SET
             correct_count = skill_mastery.correct_count + 1,
             error_count = skill_mastery.error_count + excluded.error_count,
             hint_count = skill_mastery.hint_count + excluded.hint_count,
             last_practiced_at = excluded.last_practiced_at,
             mastery = excluded.mastery`,
          childProfileId,
          skillId,
          errors,
          outcome.usedHint ? 1 : 0,
          now,
          errors >= 2 || outcome.usedHint ? 'needs_review' : 'practicing',
        );
      }
    }

    for (const skillId of score.struggledSkills) {
      // One open entry per skill; re-struggling refreshes the due date.
      await txn.runAsync(
        `INSERT OR REPLACE INTO revision_queue
           (id,
            child_profile_id, skill_id, reason, due_at, resolved_at, created_at)
         VALUES (
           (SELECT id FROM revision_queue
             WHERE child_profile_id = ? AND skill_id = ? AND resolved_at IS NULL),
           ?, ?, 'repeated_errors', ?, NULL, ?)`,
        childProfileId,
        skillId,
        childProfileId,
        skillId,
        now,
        now,
      );
    }

    await txn.runAsync(
      `INSERT INTO learning_sessions (id, child_profile_id, started_at, ended_at, lessons_completed)
       VALUES (?, ?, ?, ?, 1)`,
      newLearningSessionId(),
      childProfileId,
      startedAt,
      now,
    );
  });

  return score;
}

export type { LessonScore };
export type LessonIdParam = LessonId;
