import type { SQLiteDatabase } from 'expo-sqlite';

import { ContentValidationError } from '@/core/errors/app-errors';
import { createLogger } from '@/core/logging/logger';
import { curriculumManifestSchema, type CurriculumManifest } from '@/content/schemas/curriculum-schema';

const log = createLogger('curriculum-import');

/**
 * Validates and indexes the bundled curriculum manifest into SQLite.
 *
 * Idempotent: a manifest whose contentVersion is already recorded is skipped.
 * Transactional: a failure leaves the previous index untouched.
 * Non-destructive: progression tables are never touched here; curriculum
 * rows are upserted so children keep progress across content updates.
 */
export async function importCurriculum(
  db: SQLiteDatabase,
  rawManifest: unknown,
): Promise<{ imported: boolean; lessonCount: number }> {
  const parsed = curriculumManifestSchema.safeParse(rawManifest);
  if (!parsed.success) {
    throw new ContentValidationError(
      `Curriculum manifest invalid: ${parsed.error.issues
        .slice(0, 5)
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(' | ')}`,
    );
  }
  const manifest = parsed.data;

  const existing = await db.getFirstAsync<{ content_version: string }>(
    'SELECT content_version FROM content_versions WHERE content_version = ?',
    manifest.contentVersion,
  );
  if (existing) {
    log.info(`content ${manifest.contentVersion} already imported`);
    return { imported: false, lessonCount: 0 };
  }

  let lessonCount = 0;
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const [levelIndex, level] of manifest.levels.entries()) {
      await txn.runAsync(
        `INSERT INTO curriculum_levels (id, title, sort_order) VALUES (?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET title = excluded.title, sort_order = excluded.sort_order`,
        level.id,
        level.title,
        levelIndex,
      );
      for (const [worldIndex, world] of level.worlds.entries()) {
        await txn.runAsync(
          `INSERT INTO curriculum_worlds (id, level_id, title, subtitle, subject, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             level_id = excluded.level_id, title = excluded.title,
             subtitle = excluded.subtitle, subject = excluded.subject,
             sort_order = excluded.sort_order`,
          world.id,
          level.id,
          world.title,
          world.subtitle,
          world.subject,
          worldIndex,
        );
        for (const [lessonIndex, lesson] of world.lessons.entries()) {
          await txn.runAsync(
            `INSERT INTO lessons
               (id, world_id, title, short_description, estimated_duration_minutes, sort_order, step_count)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               world_id = excluded.world_id, title = excluded.title,
               short_description = excluded.short_description,
               estimated_duration_minutes = excluded.estimated_duration_minutes,
               sort_order = excluded.sort_order, step_count = excluded.step_count`,
            lesson.id,
            world.id,
            lesson.title,
            lesson.shortDescription,
            lesson.estimatedDurationMinutes,
            lessonIndex,
            lesson.steps.length,
          );
          await txn.runAsync('DELETE FROM lesson_prerequisites WHERE lesson_id = ?', lesson.id);
          for (const prerequisiteId of lesson.prerequisiteLessonIds) {
            await txn.runAsync(
              'INSERT INTO lesson_prerequisites (lesson_id, prerequisite_lesson_id) VALUES (?, ?)',
              lesson.id,
              prerequisiteId,
            );
          }
          await txn.runAsync('DELETE FROM lesson_skills WHERE lesson_id = ?', lesson.id);
          for (const skillId of lesson.skills) {
            await txn.runAsync(
              'INSERT INTO lesson_skills (lesson_id, skill_id) VALUES (?, ?)',
              lesson.id,
              skillId,
            );
          }
          lessonCount += 1;
        }
      }
    }
    await txn.runAsync(
      `INSERT INTO content_versions (content_version, schema_version, imported_at, lesson_count)
       VALUES (?, ?, ?, ?)`,
      manifest.contentVersion,
      manifest.schemaVersion,
      new Date().toISOString(),
      lessonCount,
    );
  });

  log.info(`imported content ${manifest.contentVersion} (${lessonCount} lessons)`);
  return { imported: true, lessonCount };
}

export type { CurriculumManifest };
