import type { SQLiteDatabase } from 'expo-sqlite';

import { asId, type ChildProfileId, type LessonId } from '@/core/ids/ids';

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

export interface LessonProgress {
  readonly childProfileId: ChildProfileId;
  readonly lessonId: LessonId;
  readonly status: LessonStatus;
  readonly stars: number;
  readonly currentStepIndex: number;
  readonly hintsUsed: number;
  readonly errorCount: number;
  readonly completedAt: string | null;
}

export interface CompletedLessonResult {
  readonly childProfileId: ChildProfileId;
  readonly lessonId: LessonId;
  readonly stars: number;
  readonly hintsUsed: number;
  readonly errorCount: number;
}

export interface AttemptRecord {
  readonly childProfileId: ChildProfileId;
  readonly lessonId: LessonId;
  readonly stepId: string;
  readonly exerciseType: string;
  readonly isCorrect: boolean;
  readonly usedHint: boolean;
  readonly attemptIndex: number;
}

export interface LessonRecommendation {
  readonly lessonId: LessonId;
  readonly worldId: string;
  readonly title: string;
  readonly reason: 'resume' | 'next_in_world' | 'first_lesson';
}

export interface ProgressRepository {
  findLessonProgress(
    childProfileId: ChildProfileId,
    lessonId: LessonId,
  ): Promise<LessonProgress | null>;
  findAllProgress(childProfileId: ChildProfileId): Promise<LessonProgress[]>;
  saveStepReached(
    childProfileId: ChildProfileId,
    lessonId: LessonId,
    stepIndex: number,
  ): Promise<void>;
  recordAttempt(attempt: AttemptRecord): Promise<void>;
  saveLessonResult(result: CompletedLessonResult): Promise<void>;
  findNextRecommendedLesson(childProfileId: ChildProfileId): Promise<LessonRecommendation | null>;
  countCompletedLessons(childProfileId: ChildProfileId): Promise<number>;
}

interface ProgressRow {
  child_profile_id: string;
  lesson_id: string;
  status: string;
  stars: number;
  current_step_index: number;
  hints_used: number;
  error_count: number;
  completed_at: string | null;
}

function toDomain(row: ProgressRow): LessonProgress {
  return {
    childProfileId: asId<'ChildProfileId'>(row.child_profile_id),
    lessonId: asId<'LessonId'>(row.lesson_id),
    status: row.status as LessonStatus,
    stars: row.stars,
    currentStepIndex: row.current_step_index,
    hintsUsed: row.hints_used,
    errorCount: row.error_count,
    completedAt: row.completed_at,
  };
}

export function createProgressRepository(db: SQLiteDatabase): ProgressRepository {
  return {
    async findLessonProgress(childProfileId, lessonId) {
      const row = await db.getFirstAsync<ProgressRow>(
        'SELECT * FROM lesson_progress WHERE child_profile_id = ? AND lesson_id = ?',
        childProfileId,
        lessonId,
      );
      return row ? toDomain(row) : null;
    },

    async findAllProgress(childProfileId) {
      const rows = await db.getAllAsync<ProgressRow>(
        'SELECT * FROM lesson_progress WHERE child_profile_id = ?',
        childProfileId,
      );
      return rows.map(toDomain);
    },

    async saveStepReached(childProfileId, lessonId, stepIndex) {
      await db.runAsync(
        `INSERT INTO lesson_progress
           (child_profile_id, lesson_id, status, current_step_index, updated_at)
         VALUES (?, ?, 'in_progress', ?, ?)
         ON CONFLICT(child_profile_id, lesson_id) DO UPDATE SET
           status = CASE WHEN lesson_progress.status = 'completed'
                         THEN 'completed' ELSE 'in_progress' END,
           current_step_index = excluded.current_step_index,
           updated_at = excluded.updated_at`,
        childProfileId,
        lessonId,
        stepIndex,
        new Date().toISOString(),
      );
    },

    async recordAttempt(attempt) {
      await db.runAsync(
        `INSERT INTO exercise_attempts
           (child_profile_id, lesson_id, step_id, exercise_type,
            is_correct, used_hint, attempt_index, answered_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        attempt.childProfileId,
        attempt.lessonId,
        attempt.stepId,
        attempt.exerciseType,
        attempt.isCorrect ? 1 : 0,
        attempt.usedHint ? 1 : 0,
        attempt.attemptIndex,
        new Date().toISOString(),
      );
    },

    async saveLessonResult(result) {
      const now = new Date().toISOString();
      await db.runAsync(
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
        result.childProfileId,
        result.lessonId,
        result.stars,
        result.hintsUsed,
        result.errorCount,
        now,
        now,
      );
    },

    async findNextRecommendedLesson(childProfileId) {
      // 1) Resume an in-progress lesson if any.
      const inProgress = await db.getFirstAsync<{
        lesson_id: string;
        world_id: string;
        title: string;
      }>(
        `SELECT lp.lesson_id, l.world_id, l.title
         FROM lesson_progress lp
         JOIN lessons l ON l.id = lp.lesson_id
         WHERE lp.child_profile_id = ? AND lp.status = 'in_progress'
         ORDER BY lp.updated_at DESC LIMIT 1`,
        childProfileId,
      );
      if (inProgress) {
        return {
          lessonId: asId<'LessonId'>(inProgress.lesson_id),
          worldId: inProgress.world_id,
          title: inProgress.title,
          reason: 'resume',
        };
      }

      // 2) First not-completed lesson in curriculum order for the child's level.
      const next = await db.getFirstAsync<{ lesson_id: string; world_id: string; title: string }>(
        `SELECT l.id AS lesson_id, l.world_id, l.title
         FROM lessons l
         JOIN curriculum_worlds w ON w.id = l.world_id
         JOIN child_profiles c ON c.id = ?
         WHERE w.level_id = c.level
           AND NOT EXISTS (
             SELECT 1 FROM lesson_progress lp
             WHERE lp.child_profile_id = c.id
               AND lp.lesson_id = l.id AND lp.status = 'completed'
           )
         ORDER BY w.sort_order, l.sort_order LIMIT 1`,
        childProfileId,
      );
      if (!next) {
        return null;
      }
      const hasAnyProgress = await db.getFirstAsync<{ n: number }>(
        'SELECT COUNT(*) AS n FROM lesson_progress WHERE child_profile_id = ?',
        childProfileId,
      );
      return {
        lessonId: asId<'LessonId'>(next.lesson_id),
        worldId: next.world_id,
        title: next.title,
        reason: (hasAnyProgress?.n ?? 0) > 0 ? 'next_in_world' : 'first_lesson',
      };
    },

    async countCompletedLessons(childProfileId) {
      const row = await db.getFirstAsync<{ n: number }>(
        `SELECT COUNT(*) AS n FROM lesson_progress
         WHERE child_profile_id = ? AND status = 'completed'`,
        childProfileId,
      );
      return row?.n ?? 0;
    },
  };
}
