import type { SQLiteDatabase } from 'expo-sqlite';

import type { ChildProfileId } from '@/core/ids/ids';

import type { RevisionReason, SkillSnapshot } from '../domain/revision-engine';

/** Ce qu'une transaction expose ; le dépôt fonctionne dedans comme dehors. */
type Queryable = Pick<SQLiteDatabase, 'runAsync' | 'getAllAsync' | 'getFirstAsync'>;

export interface OpenRevision {
  readonly skillId: string;
  /** Pourquoi elle revient — le moteur le sait, l'adulte a droit à l'explication. */
  readonly reason: RevisionReason;
}

/** Une notion programmée par le moteur, prête à être écrite dans la file. */
export interface ScheduledRevision {
  readonly skillId: string;
  readonly reason: RevisionReason;
  /** Séances à laisser passer avant de la reproposer. */
  readonly deferSessions: number;
}

/**
 * La file de révision : une notion y entre quand l'enfant bute dessus, en
 * sort quand il la réussit sans aide. « Ouverte » veut dire `resolved_at IS
 * NULL` — cette règle vit ici et nulle part ailleurs.
 */
export interface RevisionRepository {
  /** Notions dues maintenant. Une notion différée ne compte pas encore. */
  countOpen(childProfileId: ChildProfileId, now: string): Promise<number>;
  findOpen(childProfileId: ChildProfileId, limit: number, now: string): Promise<OpenRevision[]>;
  /** État accumulé de chaque notion pratiquée, pour le moteur de révision. */
  findSkillSnapshots(childProfileId: ChildProfileId): Promise<SkillSnapshot[]>;
  /** Une notion réussie sans peine sort de la file. */
  resolve(childProfileId: ChildProfileId, skillIds: readonly string[], at: string): Promise<void>;
  /** Une seule entrée ouverte par notion ; la reprogrammer rafraîchit l'échéance. */
  schedule(
    childProfileId: ChildProfileId,
    revisions: readonly ScheduledRevision[],
    at: string,
  ): Promise<void>;
}

/**
 * Une séance vaut un jour. L'enfant ouvre l'app une fois par jour en moyenne,
 * et la file n'a pas besoin d'être plus fine que cela.
 */
const DEFER_DAY_MS = 86_400_000;

export function createRevisionRepository(db: Queryable): RevisionRepository {
  return {
    async countOpen(childProfileId, now) {
      const row = await db.getFirstAsync<{ n: number }>(
        `SELECT COUNT(*) AS n FROM revision_queue
         WHERE child_profile_id = ? AND resolved_at IS NULL AND due_at <= ?`,
        childProfileId,
        now,
      );
      return row?.n ?? 0;
    },

    async findOpen(childProfileId, limit, now) {
      const rows = await db.getAllAsync<{ skill_id: string; reason: string }>(
        `SELECT skill_id, reason FROM revision_queue
         WHERE child_profile_id = ? AND resolved_at IS NULL AND due_at <= ?
         ORDER BY due_at LIMIT ?`,
        childProfileId,
        now,
        limit,
      );
      return rows.map((row) => ({
        skillId: row.skill_id,
        reason: row.reason as RevisionReason,
      }));
    },

    async findSkillSnapshots(childProfileId) {
      const rows = await db.getAllAsync<{
        skill_id: string;
        correct_count: number;
        error_count: number;
        hint_count: number;
        last_practiced_at: string | null;
      }>(
        `SELECT skill_id, correct_count, error_count, hint_count, last_practiced_at
         FROM skill_mastery WHERE child_profile_id = ?`,
        childProfileId,
      );
      return rows.map((row) => ({
        skillId: row.skill_id,
        correctCount: row.correct_count,
        errorCount: row.error_count,
        hintCount: row.hint_count,
        lastPracticedAt: row.last_practiced_at,
      }));
    },

    async resolve(childProfileId, skillIds, at) {
      if (skillIds.length === 0) {
        return;
      }
      await db.runAsync(
        `UPDATE revision_queue SET resolved_at = ?
         WHERE child_profile_id = ? AND resolved_at IS NULL
           AND skill_id IN (${skillIds.map(() => '?').join(', ')})`,
        at,
        childProfileId,
        ...skillIds,
      );
    },

    async schedule(childProfileId, revisions, at) {
      const scheduledAt = Date.parse(at);
      for (const { skillId, reason, deferSessions } of revisions) {
        const dueAt = new Date(scheduledAt + deferSessions * DEFER_DAY_MS).toISOString();
        await db.runAsync(
          `INSERT OR REPLACE INTO revision_queue
             (id, child_profile_id, skill_id, reason, due_at, resolved_at, created_at)
           VALUES (
             (SELECT id FROM revision_queue
               WHERE child_profile_id = ? AND skill_id = ? AND resolved_at IS NULL),
             ?, ?, ?, ?, NULL, ?)`,
          childProfileId,
          skillId,
          childProfileId,
          skillId,
          reason,
          dueAt,
          at,
        );
      }
    },
  };
}
