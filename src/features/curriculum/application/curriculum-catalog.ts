import { ContentValidationError } from '@/core/errors/app-errors';
import {
  curriculumManifestSchema,
  type CurriculumManifest,
  type Lesson,
  type LevelId,
  type World,
} from '@/content/schemas/curriculum-schema';

/**
 * Read-side of the bundled curriculum. SQLite indexes lessons for queries and
 * progression joins; the full step content is read here, straight from the
 * validated bundled manifest (single load, then cached lookups).
 */

 
const rawManifest: unknown = require('../../../content/manifests/curriculum-v1.json');

let cached: CurriculumManifest | null = null;
const lessonIndex = new Map<string, Lesson>();
const worldIndex = new Map<string, World>();

export function loadCurriculum(): CurriculumManifest {
  if (cached) {
    return cached;
  }
  const parsed = curriculumManifestSchema.safeParse(rawManifest);
  if (!parsed.success) {
    throw new ContentValidationError(
      `Bundled curriculum invalid: ${parsed.error.issues[0]?.message ?? 'unknown issue'}`,
    );
  }
  cached = parsed.data;
  for (const level of cached.levels) {
    for (const world of level.worlds) {
      worldIndex.set(world.id, world);
      for (const lesson of world.lessons) {
        lessonIndex.set(lesson.id, lesson);
      }
    }
  }
  return cached;
}

export function findLesson(lessonId: string): Lesson | null {
  loadCurriculum();
  return lessonIndex.get(lessonId) ?? null;
}

export function findWorld(worldId: string): World | null {
  loadCurriculum();
  return worldIndex.get(worldId) ?? null;
}

export function worldsForLevel(level: LevelId): World[] {
  const manifest = loadCurriculum();
  return manifest.levels.find((candidate) => candidate.id === level)?.worlds ?? [];
}

export function lessonsOfWorld(worldId: string): Lesson[] {
  return findWorld(worldId)?.lessons ?? [];
}
