import type { Migration } from './types';

/**
 * Initial schema.
 *
 * Curriculum tables (`curriculum_*`, `lessons`, `lesson_steps`) are an index
 * of the bundled content manifests — they are re-importable and carry no
 * child data. Progression tables (`lesson_progress`, `exercise_attempts`,
 * `skill_mastery`, `revision_queue`, `learning_sessions`, `achievements`)
 * belong to child profiles and must never be dropped by content updates.
 */
export const initialSchema: Migration = {
  version: 1,
  name: 'initial-schema',
  up: async (db) => {
    await db.execAsync(`
      CREATE TABLE child_profiles (
        id TEXT PRIMARY KEY,
        first_name TEXT NOT NULL CHECK (length(first_name) BETWEEN 1 AND 40),
        avatar_id TEXT NOT NULL,
        level TEXT NOT NULL CHECK (level IN ('CP1', 'CP2')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE curriculum_levels (
        id TEXT PRIMARY KEY CHECK (id IN ('CP1', 'CP2')),
        title TEXT NOT NULL,
        sort_order INTEGER NOT NULL
      );

      CREATE TABLE curriculum_worlds (
        id TEXT PRIMARY KEY,
        level_id TEXT NOT NULL REFERENCES curriculum_levels(id),
        title TEXT NOT NULL,
        subtitle TEXT NOT NULL DEFAULT '',
        subject TEXT NOT NULL CHECK (subject IN ('reading', 'writing', 'dictation', 'math')),
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
        UNIQUE (world_id, sort_order)
      );

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

      CREATE TABLE lesson_progress (
        child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
        lesson_id TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
        stars INTEGER NOT NULL DEFAULT 0 CHECK (stars BETWEEN 0 AND 3),
        current_step_index INTEGER NOT NULL DEFAULT 0,
        hints_used INTEGER NOT NULL DEFAULT 0,
        error_count INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (child_profile_id, lesson_id)
      );

      CREATE TABLE exercise_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
        lesson_id TEXT NOT NULL,
        step_id TEXT NOT NULL,
        exercise_type TEXT NOT NULL,
        is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
        used_hint INTEGER NOT NULL DEFAULT 0 CHECK (used_hint IN (0, 1)),
        attempt_index INTEGER NOT NULL DEFAULT 1,
        answered_at TEXT NOT NULL
      );
      CREATE INDEX idx_attempts_child_lesson
        ON exercise_attempts (child_profile_id, lesson_id);

      CREATE TABLE skill_mastery (
        child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
        skill_id TEXT NOT NULL,
        correct_count INTEGER NOT NULL DEFAULT 0,
        error_count INTEGER NOT NULL DEFAULT 0,
        hint_count INTEGER NOT NULL DEFAULT 0,
        last_practiced_at TEXT,
        mastery TEXT NOT NULL DEFAULT 'discovering'
          CHECK (mastery IN ('discovering', 'practicing', 'mastered', 'needs_review')),
        PRIMARY KEY (child_profile_id, skill_id)
      );

      CREATE TABLE revision_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
        skill_id TEXT NOT NULL,
        reason TEXT NOT NULL,
        due_at TEXT NOT NULL,
        resolved_at TEXT,
        created_at TEXT NOT NULL,
        UNIQUE (child_profile_id, skill_id, resolved_at)
      );
      CREATE INDEX idx_revision_due ON revision_queue (child_profile_id, due_at)
        WHERE resolved_at IS NULL;

      CREATE TABLE learning_sessions (
        id TEXT PRIMARY KEY,
        child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        lessons_completed INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX idx_sessions_child ON learning_sessions (child_profile_id, started_at);

      CREATE TABLE achievements (
        child_profile_id TEXT NOT NULL REFERENCES child_profiles(id) ON DELETE CASCADE,
        achievement_id TEXT NOT NULL,
        earned_at TEXT NOT NULL,
        PRIMARY KEY (child_profile_id, achievement_id)
      );

      CREATE TABLE app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE content_versions (
        content_version TEXT PRIMARY KEY,
        schema_version INTEGER NOT NULL,
        imported_at TEXT NOT NULL,
        lesson_count INTEGER NOT NULL
      );
    `);
  },
};
