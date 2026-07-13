import { z } from 'zod';

import { exerciseStepSchema } from './exercise-schema';

const idSchema = z.string().min(1).max(80);

export const subjectSchema = z.enum(['reading', 'writing', 'dictation', 'math']);
export const levelIdSchema = z.enum(['CP1', 'CP2']);

export const lessonSchema = z
  .object({
    id: idSchema,
    title: z.string().min(1).max(80),
    shortDescription: z.string().min(1).max(160),
    learningObjectives: z.array(z.string().min(1).max(200)).min(1),
    skills: z.array(idSchema).min(1),
    estimatedDurationMinutes: z.number().int().min(2).max(20),
    prerequisiteLessonIds: z.array(idSchema).default([]),
    steps: z.array(exerciseStepSchema).min(3).max(10),
    completionRule: z
      .object({
        /** Minimum ratio of first-try correct answers for 3 stars. */
        threeStarsMinFirstTryRatio: z.number().min(0).max(1).default(0.85),
        /** Minimum ratio of eventually-correct answers for 2 stars. */
        twoStarsMinCorrectRatio: z.number().min(0).max(1).default(0.6),
      })
      .prefault({}),
    revisionStrategy: z
      .object({
        /** Sessions to wait before resurfacing skills the child struggled with. */
        reviewAfterSessions: z.number().int().min(1).max(10).default(2),
      })
      .prefault({}),
  })
  .superRefine((lesson, ctx) => {
    const stepIds = new Set<string>();
    for (const step of lesson.steps) {
      if (stepIds.has(step.id)) {
        ctx.addIssue({ code: 'custom', message: `duplicate step id: ${step.id}` });
      }
      stepIds.add(step.id);
    }
  });

export const worldSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(60),
  subtitle: z.string().min(1).max(120),
  subject: subjectSchema,
  lessons: z.array(lessonSchema).min(1),
});

export const levelManifestSchema = z.object({
  id: levelIdSchema,
  title: z.string().min(1).max(40),
  worlds: z.array(worldSchema).min(1).max(8),
});

export const assetManifestEntrySchema = z.object({
  id: idSchema,
  kind: z.enum(['audio', 'illustration']),
  /** Path relative to assets/, e.g. "audio/fr/syllable-ba.m4a". */
  file: z.string().min(1),
  /** Placeholder assets block production release (see docs/audio-pipeline.md). */
  placeholder: z.boolean().default(false),
});

export const curriculumManifestSchema = z.object({
  schemaVersion: z.literal(1),
  contentVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  generatedAt: z.string().datetime(),
  levels: z.array(levelManifestSchema).min(1).max(2),
  assets: z.array(assetManifestEntrySchema),
});

export type Subject = z.infer<typeof subjectSchema>;
export type LevelId = z.infer<typeof levelIdSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type World = z.infer<typeof worldSchema>;
export type LevelManifest = z.infer<typeof levelManifestSchema>;
export type CurriculumManifest = z.infer<typeof curriculumManifestSchema>;
export type AssetManifestEntry = z.infer<typeof assetManifestEntrySchema>;
