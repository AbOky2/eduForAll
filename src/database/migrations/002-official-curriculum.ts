import type { Migration } from './types';

/**
 * Aligns the curriculum index on the Chad national programme.
 *
 * Two changes:
 *  1. `curriculum_worlds.subject` now carries the four instrumental subjects
 *     of the official CP timetable — language, reading, writing, math
 *     (« Programmes Réactualisés de l'Enseignement Primaire », MEN Tchad,
 *     sept. 2004, p. 128). `dictation` is gone: at CP level dictation is a
 *     family of writing exercises, not a subject of the timetable.
 *  2. `lessons` gains the annual-progression columns (term, week) and the
 *     official content reference each lesson answers to.
 *
 * SQLite cannot alter a CHECK constraint, so the content index tables are
 * rebuilt. That is safe by design: `curriculum_*`, `lessons`, `lesson_steps`
 * are a re-importable index of the bundled manifest and hold no child data
 * (see 001-initial-schema). Progression tables are never touched here — they
 * reference lessons by loose id, with no foreign key.
 *
 * Clearing `content_versions` forces `importCurriculum` to repopulate the
 * index on the next bootstrap, which happens immediately after migrations.
 */
export const officialCurriculum: Migration = {
  version: 2,
  name: 'official-curriculum',
  up: async (db) => {
    await db.execAsync(`
      DROP TABLE IF EXISTS lesson_skills;
      DROP TABLE IF EXISTS lesson_prerequisites;
      DROP TABLE IF EXISTS lessons;
      DROP TABLE IF EXISTS curriculum_worlds;

      CREATE TABLE curriculum_worlds (
        id TEXT PRIMARY KEY,
        level_id TEXT NOT NULL REFERENCES curriculum_levels(id),
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL DEFAULT '',
        subject TEXT NOT NULL
          CHECK (subject IN ('language', 'reading', 'writing', 'math')),
        sort_order INTEGER NOT NULL,
        UNIQUE (level_id, sort_order)
      );

      CREATE TABLE lessons (
        id TEXT PRIMARY KEY,
        world_id TEXT NOT NULL REFERENCES curriculum_worlds(id),
        title TEXT NOT NULL,
        short_description TEXT NOT NULL DEFAULT '',
        estimated_duration_minutes INTEGER NOT NULL DEFAULT 5,
        sort_order INTEGER NOT NULL,
        step_count INTEGER NOT NULL,
        term INTEGER NOT NULL DEFAULT 1 CHECK (term BETWEEN 1 AND 3),
        week INTEGER NOT NULL DEFAULT 1 CHECK (week BETWEEN 1 AND 30),
        official_reference TEXT NOT NULL DEFAULT '',
        UNIQUE (world_id, sort_order)
      );
      CREATE INDEX idx_lessons_week ON lessons (term, week);

      CREATE TABLE lesson_prerequisites (
        lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        prerequisite_lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        PRIMARY KEY (lesson_id, prerequisite_lesson_id)
      );

      CREATE TABLE lesson_skills (
        lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        skill_id TEXT NOT NULL,
        PRIMARY KEY (lesson_id, skill_id)
      );

      DELETE FROM content_versions;
    `);
  },
};
