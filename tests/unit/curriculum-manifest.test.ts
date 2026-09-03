import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { curriculumManifestSchema, type Subject } from '@/content/schemas/curriculum-schema';
import { EXERCISE_TYPES } from '@/content/schemas/exercise-schema';
import { ALIFA_SUBJECTS, SCHOOL_YEAR } from '@/content/curriculum/official-program';

const manifest = curriculumManifestSchema.parse(
  JSON.parse(
    readFileSync(join(__dirname, '../../src/content/manifests/curriculum-v1.json'), 'utf8'),
  ),
);

const allLessons = manifest.levels.flatMap((level) =>
  level.worlds.flatMap((world) => world.lessons.map((lesson) => ({ ...lesson, world, level }))),
);

describe('bundled curriculum manifest', () => {
  it('carries a full school year for each level', () => {
    for (const level of manifest.levels) {
      const lessons = level.worlds.flatMap((world) => world.lessons);
      // 30 semaines de classe (1er octobre – 30 juin) à raison de plusieurs
      // séances quotidiennes : moins de 140 leçons ne fait pas une année.
      expect(lessons.length).toBeGreaterThanOrEqual(140);
      const weeks = new Set(lessons.map((lesson) => lesson.week));
      expect(Math.max(...weeks)).toBeLessThanOrEqual(SCHOOL_YEAR.effectiveWeeks);
      expect(new Set(lessons.map((lesson) => lesson.term))).toEqual(new Set([1, 2, 3]));
    }
  });

  it('teaches the four instrumental subjects of the official timetable at both levels', () => {
    const official = new Set<Subject>(ALIFA_SUBJECTS.map((subject) => subject.id));
    for (const level of manifest.levels) {
      const subjects = new Set(level.worlds.map((world) => world.subject));
      expect(subjects).toEqual(official);
    }
  });

  it('weights each subject like the official weekly timetable', () => {
    for (const subject of ALIFA_SUBJECTS) {
      const count = allLessons.filter((lesson) => lesson.world.subject === subject.id).length;
      const produced = count / allLessons.length;
      // ±6 points d'écart avec la part horaire officielle (grille p. 128).
      expect(Math.abs(produced - subject.share)).toBeLessThan(0.06);
    }
  });

  it('cites the official programme for every lesson', () => {
    for (const lesson of allLessons) {
      expect(lesson.officialReference.length).toBeGreaterThan(10);
      // Chaque référence porte la page du document dont elle est tirée.
      expect(lesson.officialReference).toMatch(/p\. \d+/);
    }
  });

  it('keeps every session within the official CP length (10–20 mn, p. 126)', () => {
    for (const lesson of allLessons) {
      expect(lesson.estimatedDurationMinutes).toBeLessThanOrEqual(SCHOOL_YEAR.sessionMinutes.max);
      expect(lesson.steps.length).toBeGreaterThanOrEqual(3);
      expect(lesson.steps.length).toBeLessThanOrEqual(10);
    }
  });

  it('has unique lesson and world ids', () => {
    const lessonIds = new Set<string>();
    for (const lesson of allLessons) {
      expect(lessonIds.has(lesson.id)).toBe(false);
      lessonIds.add(lesson.id);
    }
    const worldIds = new Set<string>();
    for (const level of manifest.levels) {
      for (const world of level.worlds) {
        expect(worldIds.has(world.id)).toBe(false);
        worldIds.add(world.id);
      }
    }
  });

  it('lists each skill at most once per lesson', () => {
    // lesson_skills a pour clé primaire (lesson_id, skill_id) : un doublon fait
    // échouer l'import au premier lancement, et avec lui tout le bootstrap.
    for (const lesson of allLessons) {
      expect(new Set(lesson.skills).size).toBe(lesson.skills.length);
    }
  });

  it('resolves every prerequisite to an existing lesson', () => {
    const all = new Set(allLessons.map((lesson) => lesson.id));
    for (const lesson of allLessons) {
      for (const prerequisite of lesson.prerequisiteLessonIds) {
        expect(all.has(prerequisite)).toBe(true);
      }
    }
  });

  it('opens each subject from the first week without a prerequisite', () => {
    // Une classe de CP fait de la lecture, du langage, de l'écriture et du
    // calcul dès le premier jour : chaque discipline doit avoir une porte
    // d'entrée, sinon l'enfant reste bloqué devant un cadenas.
    for (const level of manifest.levels) {
      for (const subject of ALIFA_SUBJECTS) {
        const entryPoints = level.worlds
          .filter((world) => world.subject === subject.id)
          .flatMap((world) => world.lessons)
          .filter((lesson) => lesson.prerequisiteLessonIds.length === 0);
        expect(entryPoints.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('references only declared assets', () => {
    const assetIds = new Set(manifest.assets.map((asset) => asset.id));
    for (const lesson of allLessons) {
      for (const step of lesson.steps) {
        expect(assetIds.has(step.instruction.audioId)).toBe(true);
        if ('audioId' in step && step.audioId) {
          expect(assetIds.has(step.audioId)).toBe(true);
        }
        if ('storyAudioId' in step && step.storyAudioId) {
          expect(assetIds.has(step.storyAudioId)).toBe(true);
        }
        if ('statementAudioId' in step && step.statementAudioId) {
          expect(assetIds.has(step.statementAudioId)).toBe(true);
        }
      }
    }
  });

  it('uses every exercise type the app can render', () => {
    const used = new Set<string>();
    for (const lesson of allLessons) {
      for (const step of lesson.steps) {
        used.add(step.type);
      }
    }
    const unused = EXERCISE_TYPES.filter((type) => !used.has(type));
    expect(unused).toEqual([]);
  });
});
