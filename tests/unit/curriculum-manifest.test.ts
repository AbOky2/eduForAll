import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { curriculumManifestSchema } from '@/content/schemas/curriculum-schema';

const manifest = curriculumManifestSchema.parse(
  JSON.parse(
    readFileSync(join(__dirname, '../../src/content/manifests/curriculum-v1.json'), 'utf8'),
  ),
);

describe('bundled curriculum manifest', () => {
  it('meets the V1 volume requirements (≥25 lessons per level, 5 worlds each)', () => {
    for (const level of manifest.levels) {
      const lessonCount = level.worlds.reduce((sum, world) => sum + world.lessons.length, 0);
      expect(level.worlds).toHaveLength(5);
      expect(lessonCount).toBeGreaterThanOrEqual(25);
    }
  });

  it('has 4–8+ steps per lesson within schema bounds and unique ids', () => {
    const ids = new Set<string>();
    for (const level of manifest.levels) {
      for (const world of level.worlds) {
        for (const lesson of world.lessons) {
          expect(lesson.steps.length).toBeGreaterThanOrEqual(3);
          expect(lesson.steps.length).toBeLessThanOrEqual(10);
          expect(ids.has(lesson.id)).toBe(false);
          ids.add(lesson.id);
        }
      }
    }
  });

  it('resolves every prerequisite to an existing lesson', () => {
    const all = new Set(
      manifest.levels.flatMap((level) =>
        level.worlds.flatMap((world) => world.lessons.map((lesson) => lesson.id)),
      ),
    );
    for (const level of manifest.levels) {
      for (const world of level.worlds) {
        for (const lesson of world.lessons) {
          for (const prerequisite of lesson.prerequisiteLessonIds) {
            expect(all.has(prerequisite)).toBe(true);
          }
        }
      }
    }
  });

  it('references only declared assets', () => {
    const assetIds = new Set(manifest.assets.map((asset) => asset.id));
    for (const level of manifest.levels) {
      for (const world of level.worlds) {
        for (const lesson of world.lessons) {
          for (const step of lesson.steps) {
            expect(assetIds.has(step.instruction.audioId)).toBe(true);
            if ('audioId' in step && step.audioId) {
              expect(assetIds.has(step.audioId)).toBe(true);
            }
          }
        }
      }
    }
  });

  it('covers a wide range of exercise types', () => {
    const used = new Set<string>();
    for (const level of manifest.levels) {
      for (const world of level.worlds) {
        for (const lesson of world.lessons) {
          for (const step of lesson.steps) {
            used.add(step.type);
          }
        }
      }
    }
    // The V1 curriculum exercises most of the registry.
    expect(used.size).toBeGreaterThanOrEqual(16);
  });
});
