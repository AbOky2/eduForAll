import { getDatabase } from '@/database/connection/database';
import { syncAchievements } from '@/features/achievements/application/sync-achievements';
import type { AchievementId } from '@/features/achievements/domain/achievements';
import { systemClock } from '@/core/time/clock';
import { recommendRevisions } from '@/features/revision/domain/revision-engine';
import { createRevisionRepository } from '@/features/revision/infrastructure/revision-repository';
import { masteryFor } from '../domain/mastery';
import { newLearningSessionId, type ChildProfileId, type LessonId } from '@/core/ids/ids';
import type { Lesson } from '@/content/schemas/curriculum-schema';
import type { StepOutcome } from '@/features/lesson-session/domain/lesson-machine';
import { scoreLesson, type LessonScore } from '@/features/lesson-session/domain/scoring';

/**
 * Persists everything a finished lesson produces, in one transaction:
 * result row, per-skill mastery counters, revision queue entries for
 * struggled skills, and a learning session row for the parent dashboard.
 *
 * Badges are recomputed after the transaction commits — they read the rows it
 * just wrote — and the freshly unlocked ones are handed to the result screen.
 */
export async function recordLessonCompletion(input: {
  childProfileId: ChildProfileId;
  lesson: Lesson;
  outcomes: readonly StepOutcome[];
  startedAt: string;
}): Promise<{ score: LessonScore; newAchievements: AchievementId[] }> {
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

    // Compteurs par notion : ils s'accumulent d'une leçon à l'autre. Le
    // niveau de maîtrise est recalculé plus bas, une fois qu'on sait ce que
    // le moteur de révision décide.
    for (const outcome of outcomes) {
      const errors = outcome.attempts - 1;
      for (const skillId of outcome.skills) {
        await txn.runAsync(
          `INSERT INTO skill_mastery
             (child_profile_id, skill_id, correct_count, error_count, hint_count,
              last_practiced_at, mastery)
           VALUES (?, ?, 1, ?, ?, ?, 'practicing')
           ON CONFLICT(child_profile_id, skill_id) DO UPDATE SET
             correct_count = skill_mastery.correct_count + 1,
             error_count = skill_mastery.error_count + excluded.error_count,
             hint_count = skill_mastery.hint_count + excluded.hint_count,
             last_practiced_at = excluded.last_practiced_at`,
          childProfileId,
          skillId,
          errors,
          outcome.usedHint ? 1 : 0,
          now,
        );
      }
    }

    // Le moteur de révision juge sur TOUT l'historique de l'enfant, pas sur la
    // séance qui vient de finir : il sait dire « il confond b et d » ou
    // « cette notion n'a pas été revue depuis huit jours ». Jusqu'ici il était
    // écrit, testé, et appelé par personne.
    const revisions = createRevisionRepository(txn);
    const snapshots = await revisions.findSkillSnapshots(childProfileId);
    const recommended = recommendRevisions(snapshots, systemClock);
    const recommendedIds = new Set(recommended.map((entry) => entry.skillId));

    // Une notion que le moteur ne reprogramme plus sort de la file : l'enfant
    // l'a montrée, on ne la lui repropose pas indéfiniment.
    await revisions.resolve(
      childProfileId,
      snapshots.map((snapshot) => snapshot.skillId).filter((id) => !recommendedIds.has(id)),
      now,
    );
    await revisions.schedule(childProfileId, recommended, now);

    for (const snapshot of snapshots) {
      await txn.runAsync(
        'UPDATE skill_mastery SET mastery = ? WHERE child_profile_id = ? AND skill_id = ?',
        masteryFor({
          correctCount: snapshot.correctCount,
          errorCount: snapshot.errorCount,
          needsReview: recommendedIds.has(snapshot.skillId),
        }),
        childProfileId,
        snapshot.skillId,
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

  const newAchievements = await syncAchievements(childProfileId);
  return { score, newAchievements };
}

export type { LessonScore };
export type LessonIdParam = LessonId;
