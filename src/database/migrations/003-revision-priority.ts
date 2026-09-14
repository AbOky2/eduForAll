import type { Migration } from './types';

/**
 * La file de révision garde la priorité du moteur, et refuse les doublons.
 *
 * Deux défauts corrigés ici, l'un visible, l'autre latent.
 *
 * 1. Le moteur classait ses recommandations par priorité — une confusion b/d
 *    passe avant une notion simplement ancienne — et l'écriture jetait ce
 *    classement. Toutes les entrées dues le même jour portaient le même
 *    `due_at`, et l'écran les triait par ordre d'insertion : l'enfant voyait
 *    les plus anciennes, jamais les plus importantes.
 *
 * 2. `UNIQUE (child_profile_id, skill_id, resolved_at)` n'interdit rien tant
 *    que `resolved_at` vaut NULL : SQLite considère les NULL comme distincts.
 *    Deux entrées ouvertes pour une même notion étaient donc possibles, et
 *    les résoudre ensemble aurait violé cette même contrainte — abandonnant
 *    la transaction de fin de leçon, donc la leçon, ses étoiles et ses
 *    compteurs. Un index partiel rend le doublon impossible.
 */
export const revisionPriority: Migration = {
  version: 3,
  name: 'revision-priority',
  up: async (db) => {
    await db.execAsync(`
      ALTER TABLE revision_queue ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;

      -- Par sécurité : ne garder que l'entrée ouverte la plus récente par
      -- notion avant de poser l'index, au cas où d'anciennes données en
      -- porteraient plusieurs.
      DELETE FROM revision_queue
      WHERE resolved_at IS NULL
        AND id NOT IN (
          SELECT MAX(id) FROM revision_queue
          WHERE resolved_at IS NULL
          GROUP BY child_profile_id, skill_id
        );

      CREATE UNIQUE INDEX idx_revision_open_unique
        ON revision_queue (child_profile_id, skill_id)
        WHERE resolved_at IS NULL;
    `);
  },
};
