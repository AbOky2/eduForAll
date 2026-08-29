import { ContentValidationError } from '@/core/errors/app-errors';
import {
  lessonSchema,
  type CurriculumManifest,
  type Lesson,
  type LevelId,
  type Subject,
} from '@/content/schemas/curriculum-schema';

/**
 * Read-side of the bundled curriculum.
 *
 * The manifest carries a full school year for both levels — 300+ lessons and
 * 1 600+ exercises, about 1.5 MB of JSON. Validating all of it on every launch
 * would cost seconds on the low-end tablets this app targets, for a file that
 * is generated, schema-checked at build time (`npm run validate:content`) and
 * shipped read-only inside the bundle.
 *
 * So the split is:
 *  - **navigation** reads a light index (titles, ids, counts) built once,
 *    without touching exercise content;
 *  - **a lesson** is validated against the schema the moment it is opened,
 *    and cached. A corrupted lesson still fails loudly, in front of the error
 *    boundary, instead of silently rendering nonsense.
 *
 * Full-manifest validation still happens twice: at build time, and on import
 * into SQLite when a new content version ships.
 */

const rawManifest = require('../../../content/manifests/curriculum-v1.json') as CurriculumManifest;

export interface LessonSummary {
  readonly id: string;
  readonly title: string;
  readonly shortDescription: string;
  readonly estimatedDurationMinutes: number;
  readonly term: 1 | 2 | 3;
  readonly week: number;
  readonly officialReference: string;
  readonly skills: readonly string[];
  readonly prerequisiteLessonIds: readonly string[];
  readonly stepCount: number;
}

export interface WorldSummary {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly subject: Subject;
  readonly lessons: readonly LessonSummary[];
}

interface Index {
  readonly worldsByLevel: Map<LevelId, WorldSummary[]>;
  readonly worldById: Map<string, WorldSummary>;
  readonly rawLessonById: Map<string, unknown>;
  readonly lessonIdBySkill: Map<string, string>;
}

let index: Index | null = null;
const validatedLessons = new Map<string, Lesson>();

function buildIndex(): Index {
  if (rawManifest.schemaVersion !== 1 || !Array.isArray(rawManifest.levels)) {
    throw new ContentValidationError('Bundled curriculum has an unexpected shape');
  }

  const worldsByLevel = new Map<LevelId, WorldSummary[]>();
  const worldById = new Map<string, WorldSummary>();
  const rawLessonById = new Map<string, unknown>();
  const lessonIdBySkill = new Map<string, string>();

  for (const level of rawManifest.levels) {
    const worlds: WorldSummary[] = level.worlds.map((world) => ({
      id: world.id,
      title: world.title,
      subtitle: world.subtitle,
      subject: world.subject,
      lessons: world.lessons.map((lesson) => {
        rawLessonById.set(lesson.id, lesson);
        for (const skill of lesson.skills) {
          if (!lessonIdBySkill.has(skill)) {
            lessonIdBySkill.set(skill, lesson.id);
          }
        }
        return {
          id: lesson.id,
          title: lesson.title,
          shortDescription: lesson.shortDescription,
          estimatedDurationMinutes: lesson.estimatedDurationMinutes,
          term: lesson.term,
          week: lesson.week,
          officialReference: lesson.officialReference,
          skills: lesson.skills,
          prerequisiteLessonIds: lesson.prerequisiteLessonIds,
          stepCount: lesson.steps.length,
        };
      }),
    }));
    for (const world of worlds) {
      worldById.set(world.id, world);
    }
    worldsByLevel.set(level.id, worlds);
  }

  return { worldsByLevel, worldById, rawLessonById, lessonIdBySkill };
}

function getIndex(): Index {
  index ??= buildIndex();
  return index;
}

/** Content version and asset list — used by the import and the diagnostics screen. */
export function curriculumMetadata(): {
  schemaVersion: number;
  contentVersion: string;
  generatedAt: string;
  assetCount: number;
} {
  return {
    schemaVersion: rawManifest.schemaVersion,
    contentVersion: rawManifest.contentVersion,
    generatedAt: rawManifest.generatedAt,
    assetCount: rawManifest.assets.length,
  };
}

/** The raw manifest, for the one-time validated import into SQLite. */
export function rawCurriculumManifest(): unknown {
  return rawManifest;
}

/**
 * Validates and returns a single lesson. Throws ContentValidationError if the
 * bundled content is corrupt — the lesson screen turns that into a readable
 * message rather than a blank view.
 */
export function findLesson(lessonId: string): Lesson | null {
  const cached = validatedLessons.get(lessonId);
  if (cached) {
    return cached;
  }
  const raw = getIndex().rawLessonById.get(lessonId);
  if (!raw) {
    return null;
  }
  const parsed = lessonSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ContentValidationError(
      `Lesson "${lessonId}" is invalid: ${parsed.error.issues[0]?.message ?? 'unknown issue'}`,
    );
  }
  validatedLessons.set(lessonId, parsed.data);
  return parsed.data;
}

export function findWorld(worldId: string): WorldSummary | null {
  return getIndex().worldById.get(worldId) ?? null;
}

export function worldsForLevel(level: LevelId): WorldSummary[] {
  return getIndex().worldsByLevel.get(level) ?? [];
}

export function lessonsOfWorld(worldId: string): readonly LessonSummary[] {
  return findWorld(worldId)?.lessons ?? [];
}

/** First lesson that trains a given skill — drives the revision screen. */
export function lessonForSkill(skillId: string): string | null {
  return getIndex().lessonIdBySkill.get(skillId) ?? null;
}

export type { CurriculumManifest };
