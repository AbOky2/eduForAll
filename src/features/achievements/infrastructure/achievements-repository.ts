import type { SQLiteDatabase } from 'expo-sqlite';

import type { ChildProfileId } from '@/core/ids/ids';
import type { Subject } from '@/content/schemas/curriculum-schema';
import { longestStreak } from '@/features/progress/domain/streaks';
import { createProgressRepository } from '@/features/progress/infrastructure/progress-repository';

import type { AchievementId, AchievementStats } from '../domain/achievements';

const EMPTY_BY_SUBJECT: Record<Subject, number> = {
  language: 0,
  reading: 0,
  writing: 0,
  math: 0,
};

export interface AchievementsRepository {
  loadStats(childProfileId: ChildProfileId): Promise<AchievementStats>;
  findEarned(childProfileId: ChildProfileId): Promise<AchievementId[]>;
  /** Inserts the missing badges and returns only those actually new. */
  award(childProfileId: ChildProfileId, ids: readonly AchievementId[]): Promise<AchievementId[]>;
}

export function createAchievementsRepository(db: SQLiteDatabase): AchievementsRepository {
  return {
    async loadStats(childProfileId) {
      const progress = createProgressRepository(db);
      const [totals, bySubject, worlds, days] = await Promise.all([
        db.getFirstAsync<{ completed: number; perfect: number; stars: number }>(
          `SELECT COUNT(*) AS completed,
                  SUM(CASE WHEN stars >= 3 THEN 1 ELSE 0 END) AS perfect,
                  COALESCE(SUM(stars), 0) AS stars
           FROM lesson_progress
           WHERE child_profile_id = ? AND status = 'completed'`,
          childProfileId,
        ),
        db.getAllAsync<{ subject: Subject; n: number }>(
          `SELECT w.subject AS subject, COUNT(*) AS n
           FROM lesson_progress lp
           JOIN lessons l ON l.id = lp.lesson_id
           JOIN curriculum_worlds w ON w.id = l.world_id
           WHERE lp.child_profile_id = ? AND lp.status = 'completed'
           GROUP BY w.subject`,
          childProfileId,
        ),
        db.getFirstAsync<{ n: number }>(
          `SELECT COUNT(*) AS n FROM (
             SELECT w.id
             FROM curriculum_worlds w
             JOIN lessons l ON l.world_id = w.id
             LEFT JOIN lesson_progress lp
               ON lp.lesson_id = l.id
              AND lp.child_profile_id = ?
              AND lp.status = 'completed'
             GROUP BY w.id
             HAVING COUNT(l.id) > 0 AND COUNT(l.id) = COUNT(lp.lesson_id)
           )`,
          childProfileId,
        ),
        progress.findCompletedDays(childProfileId),
      ]);

      return {
        completedLessons: totals?.completed ?? 0,
        perfectLessons: totals?.perfect ?? 0,
        totalStars: totals?.stars ?? 0,
        completedBySubject: bySubject.reduce(
          (accumulator, row) => ({ ...accumulator, [row.subject]: row.n }),
          EMPTY_BY_SUBJECT,
        ),
        completedWorlds: worlds?.n ?? 0,
        bestStreakDays: longestStreak(days),
      };
    },

    async findEarned(childProfileId) {
      const rows = await db.getAllAsync<{ achievement_id: string }>(
        'SELECT achievement_id FROM achievements WHERE child_profile_id = ? ORDER BY earned_at',
        childProfileId,
      );
      return rows.map((row) => row.achievement_id as AchievementId);
    },

    async award(childProfileId, ids) {
      // Presque toujours, tout est déjà là : on n'écrit que la différence,
      // en une seule instruction.
      const earned = new Set(await this.findEarned(childProfileId));
      const fresh = ids.filter((id) => !earned.has(id));
      if (fresh.length === 0) {
        return [];
      }
      const now = new Date().toISOString();
      await db.runAsync(
        `INSERT INTO achievements (child_profile_id, achievement_id, earned_at)
         VALUES ${fresh.map(() => '(?, ?, ?)').join(', ')}
         ON CONFLICT(child_profile_id, achievement_id) DO NOTHING`,
        ...fresh.flatMap((id) => [childProfileId, id, now]),
      );
      return fresh;
    },
  };
}
