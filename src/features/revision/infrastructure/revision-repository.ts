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

const REASONS: readonly RevisionReason[] = [
  'repeated_errors',
  'needed_hints',
  'not_practiced_recently',
  'confusion_pair',
];

/** La colonne est du texte libre : une valeur inconnue ne doit pas finir à l'écran. */
function toReason(value: string): RevisionReason {
  return REASONS.includes(value as RevisionReason)
    ? (value as RevisionReason)
    : 'repeated_errors';
}

/** Une notion programmée par le moteur, prête à être écrite dans la file. */
export interface ScheduledRevision {
  readonly skillId: string;
  readonly reason: RevisionReason;
  /** Plus haut d'abord : c'est l'ordre dans lequel l'enfant les verra. */
  readonly priority: number;
  /** Séances à laisser passer avant de la reproposer. */
  readonly deferSessions: number;
}

/**
 * La file de révision : une notion y entre quand l'enfant bute dessus, en
 * sort quand il la réussit sans aide. « Ouverte » veut dire `resolved_at IS
 * NULL` — cette règle vit ici et nulle part ailleurs.
 */
export interface RevisionRepository {
  findOpen(childProfileId: ChildProfileId, limit: number, now: string): Promise<OpenRevision[]>;
  /** État accumulé de chaque notion pratiquée, pour le moteur de révision. */
  findSkillSnapshots(childProfileId: ChildProfileId): Promise<SkillSnapshot[]>;
  /** Notions ouvertes, échéance comprise : ce qui est réellement dans la file. */
  findAllOpenSkillIds(childProfileId: ChildProfileId): Promise<string[]>;
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
    async findOpen(childProfileId, limit, now) {
      const rows = await db.getAllAsync<{ skill_id: string; reason: string }>(
        // La priorité du moteur d'abord : une confusion b/d passe avant une
        // notion simplement ancienne. Sans cela toutes les entrées dues le
        // même jour partagent leur `due_at` et l'enfant voyait les plus
        // anciennes, jamais les plus importantes.
        `SELECT skill_id, reason FROM revision_queue
         WHERE child_profile_id = ? AND resolved_at IS NULL AND due_at <= ?
         ORDER BY priority DESC, due_at, skill_id LIMIT ?`,
        childProfileId,
        now,
        limit,
      );
      return rows.map((row) => ({ skillId: row.skill_id, reason: toReason(row.reason) }));
    },

    async findAllOpenSkillIds(childProfileId) {
      const rows = await db.getAllAsync<{ skill_id: string }>(
        `SELECT skill_id FROM revision_queue
         WHERE child_profile_id = ? AND resolved_at IS NULL`,
        childProfileId,
      );
      return rows.map((row) => row.skill_id);
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
      for (const { skillId, reason, priority, deferSessions } of revisions) {
        const dueAt = new Date(scheduledAt + deferSessions * DEFER_DAY_MS).toISOString();
        await db.runAsync(
          // `MIN` sur l'échéance : une révision en attente ne s'éloigne
          // jamais — sans quoi une notion différée d'une séance verrait son
          // échéance repoussée à chaque fin de leçon — mais elle peut se
          // rapprocher si elle devient urgente. `created_at` n'est pas touché :
          // il répond à « depuis quand cette notion attend-elle ? ».
          `INSERT INTO revision_queue
             (child_profile_id, skill_id, reason, priority, due_at, resolved_at, created_at)
           VALUES (?, ?, ?, ?, ?, NULL, ?)
           ON CONFLICT (child_profile_id, skill_id) WHERE resolved_at IS NULL DO UPDATE SET
             reason = excluded.reason,
             priority = excluded.priority,
             due_at = MIN(revision_queue.due_at, excluded.due_at)`,
          childProfileId,
          skillId,
          reason,
          priority,
          dueAt,
          at,
        );
      }
    },
  };
}
