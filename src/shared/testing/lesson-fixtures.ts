import type { Lesson } from '@/content/schemas/curriculum-schema';
import { lessonSchema } from '@/content/schemas/curriculum-schema';
import type { ExerciseStep } from '@/content/schemas/exercise-schema';

/** Deterministic, schema-valid lesson used across domain tests. */
export function buildLesson(overrides: Partial<Lesson> = {}): Lesson {
  const steps: unknown[] = [
    {
      id: 'step-listen',
      type: 'listen',
      skills: ['skill-son-ba'],
      instruction: { text: 'Écoute le son.', audioId: 'instr-ecoute-le-son' },
      glyph: 'ba',
      audioId: 'syllabe-ba',
    },
    {
      id: 'step-choice',
      type: 'audio_multiple_choice',
      skills: ['skill-son-ba'],
      instruction: { text: 'Que viens-tu d’entendre ?', audioId: 'instr-quentends-tu' },
      audioId: 'syllabe-ba',
      choices: [
        { id: 'ba', label: 'ba' },
        { id: 'ma', label: 'ma' },
        { id: 'ta', label: 'ta' },
      ],
      correctChoiceId: 'ba',
      layout: 'list',
    },
    {
      id: 'step-compose',
      type: 'compose_syllable',
      skills: ['skill-son-ba'],
      instruction: { text: 'Forme la syllabe.', audioId: 'instr-forme-la-syllabe' },
      target: 'ba',
      tiles: ['b', 'm', 'a'],
      hint: { text: 'Regarde bien la première lettre.', audioId: 'hint-premiere-lettre' },
    },
  ];

  const parsed = lessonSchema.parse({
    id: 'lesson-test-ba',
    title: 'La syllabe ba',
    shortDescription: 'Découvrir et former la syllabe ba.',
    learningObjectives: ['Reconnaître le son ba', 'Former la syllabe ba'],
    skills: ['skill-son-ba'],
    estimatedDurationMinutes: 5,
    term: 1,
    week: 8,
    officialReference: 'Lecture CP — « maîtriser la combinatoire » (p. 23)',
    prerequisiteLessonIds: [],
    steps,
    ...overrides,
  });
  return parsed;
}

export function stepOfType(lesson: Lesson, type: ExerciseStep['type']): ExerciseStep {
  const step = lesson.steps.find((candidate) => candidate.type === type);
  if (!step) {
    throw new Error(`fixture lesson has no step of type ${type}`);
  }
  return step;
}
