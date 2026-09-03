import type { SQLiteDatabase } from 'expo-sqlite';

import type { ChildProfileId } from '@/core/ids/ids';

/** Ce qu'une transaction expose ; le dépôt fonctionne dedans comme dehors. */
type Queryable = Pick<SQLiteDatabase, 'runAsync' | 'getAllAsync' | 'getFirstAsync'>;

export interface OpenRevision {
  readonly skillId: string;
}

/**
 * La file de révision : une notion y entre quand l'enfant bute dessus, en
 * sort quand il la réussit sans aide. « Ouverte » veut dire `resolved_at IS
 * NULL` — cette règle vit ici et nulle part ailleurs.
 */
export interface RevisionRepository {
  countOpen(childProfileId: ChildProfileId): Promise<number>;
  findOpen(childProfileId: ChildProfileId, limit: number): Promise<OpenRevision[]>;
  /** Une notion réussie sans peine sort de la file. */
  resolve(childProfileId: ChildProfileId, skillIds: readonly string[], at: string): Promise<void>;
  /** Une seule entrée ouverte par notion ; rebuter dessus rafraîchit l'échéance. */
  reopen(childProfileId: ChildProfileId, skillId: string, at: string): Promise<void>;
}

export function createRevisionRepository(db: Queryable): RevisionRepository {
  return {
    async countOpen(childProfileId) {
      const row = await db.getFirstAsync<{ n: number }>(
        `SELECT COUNT(*) AS n FROM revision_queue
         WHERE child_profile_id = ? AND resolved_at IS NULL`,
        childProfileId,
      );
      return row?.n ?? 0;
    },

    async findOpen(childProfileId, limit) {
      const rows = await db.getAllAsync<{ skill_id: string }>(
        `SELECT skill_id FROM revision_queue
         WHERE child_profile_id = ? AND resolved_at IS NULL
         ORDER BY due_at LIMIT ?`,
        childProfileId,
        limit,
      );
      return rows.map((row) => ({ skillId: row.skill_id }));
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

    async reopen(childProfileId, skillId, at) {
      await db.runAsync(
        `INSERT OR REPLACE INTO revision_queue
           (id, child_profile_id, skill_id, reason, due_at, resolved_at, created_at)
         VALUES (
           (SELECT id FROM revision_queue
             WHERE child_profile_id = ? AND skill_id = ? AND resolved_at IS NULL),
           ?, ?, 'repeated_errors', ?, NULL, ?)`,
        childProfileId,
        skillId,
        childProfileId,
        skillId,
        at,
        at,
      );
    },
  };
}
