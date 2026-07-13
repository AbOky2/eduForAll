/* eslint-disable no-console */
/**
 * Validates the bundled curriculum manifest:
 *  - Zod schema compliance
 *  - unique lesson/step ids
 *  - prerequisite references resolve
 *  - every referenced audio/illustration id exists in the asset list
 *  - answer keys are coherent (correctChoiceId exists, options contain answers)
 * Exits non-zero on any failure (used by validate:release and CI).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { curriculumManifestSchema } from '../src/content/schemas/curriculum-schema';

const ROOT = join(__dirname, '..');
const raw = JSON.parse(
  readFileSync(join(ROOT, 'src/content/manifests/curriculum-v1.json'), 'utf8'),
) as unknown;

const parsed = curriculumManifestSchema.safeParse(raw);
if (!parsed.success) {
  console.error('❌ Manifest schema invalid:');
  for (const issue of parsed.error.issues.slice(0, 20)) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}
const manifest = parsed.data;

const problems: string[] = [];
const assetIds = new Set(manifest.assets.map((asset) => asset.id));
const lessonIds = new Set<string>();
const allStepIds = new Set<string>();
let stepCount = 0;

function requireAsset(id: string | undefined, where: string): void {
  if (id && !assetIds.has(id)) {
    problems.push(`${where}: missing asset "${id}"`);
  }
}

for (const level of manifest.levels) {
  for (const world of level.worlds) {
    for (const lesson of world.lessons) {
      if (lessonIds.has(lesson.id)) {
        problems.push(`duplicate lesson id ${lesson.id}`);
      }
      lessonIds.add(lesson.id);
      for (const step of lesson.steps) {
        stepCount += 1;
        if (allStepIds.has(step.id)) {
          problems.push(`duplicate step id ${step.id}`);
        }
        allStepIds.add(step.id);
        const where = `${lesson.id}/${step.id}`;
        requireAsset(step.instruction.audioId, where);
        requireAsset(step.hint?.audioId, where);
        if ('audioId' in step) {
          requireAsset(step.audioId, where);
        }
        switch (step.type) {
          case 'audio_multiple_choice':
          case 'text_multiple_choice':
          case 'mini_story_question':
            if (!step.choices.some((choice) => choice.id === step.correctChoiceId)) {
              problems.push(`${where}: correctChoiceId not among choices`);
            }
            break;
          case 'image_multiple_choice':
            if (!step.choices.some((choice) => choice.id === step.correctChoiceId)) {
              problems.push(`${where}: correctChoiceId not among choices`);
            }
            for (const choice of step.choices) {
              requireAsset(choice.illustrationId, where);
            }
            break;
          case 'tap_letter':
          case 'tap_syllable':
            if (!step.options.includes(step.target)) {
              problems.push(`${where}: target not among options`);
            }
            break;
          case 'fill_missing_letter':
            if (!step.options.includes(step.answer)) {
              problems.push(`${where}: answer not among options`);
            }
            break;
          case 'count_objects':
            requireAsset(step.illustrationId, where);
            if (!step.options.includes(step.count)) {
              problems.push(`${where}: count not among options`);
            }
            break;
          case 'number_sequence':
            if (!step.options.includes(step.answer)) {
              problems.push(`${where}: answer not among options`);
            }
            break;
          case 'simple_addition':
            if (!step.options.includes(step.a + step.b)) {
              problems.push(`${where}: sum not among options`);
            }
            break;
          case 'simple_subtraction':
            if (step.a - step.b < 0) {
              problems.push(`${where}: negative result`);
            }
            if (!step.options.includes(step.a - step.b)) {
              problems.push(`${where}: difference not among options`);
            }
            break;
          case 'visual_word_problem':
            requireAsset(step.statementAudioId, where);
            if (!step.options.includes(step.answer)) {
              problems.push(`${where}: answer not among options`);
            }
            break;
          case 'mini_story_question':
            break;
          default:
            break;
        }
      }
      for (const prerequisite of lesson.prerequisiteLessonIds) {
        if (!lessonIds.has(prerequisite) && ![...manifest.levels].some((l) => l.worlds.some((w) => w.lessons.some((candidate) => candidate.id === prerequisite)))) {
          problems.push(`${lesson.id}: unknown prerequisite ${prerequisite}`);
        }
      }
    }
  }
}

if (problems.length > 0) {
  console.error(`❌ ${problems.length} content problem(s):`);
  for (const problem of problems.slice(0, 30)) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}

console.log(
  `✅ Content OK — ${lessonIds.size} lessons, ${stepCount} steps, ${assetIds.size} assets referenced.`,
);
