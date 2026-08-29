import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render } from '@testing-library/react-native';

import { curriculumManifestSchema, type Lesson } from '@/content/schemas/curriculum-schema';
import { EXERCISE_TYPES, type ExerciseStep } from '@/content/schemas/exercise-schema';
import type { ExerciseAnswer } from '@/features/exercises/domain/answer';
import { evaluateAnswer } from '@/features/exercises/domain/evaluate-answer';
import { rendererFor } from '@/features/exercises/presentation/exercise-registry';

/**
 * The closest thing to launching the app that a test can do: every exercise
 * type is rendered with a real step taken from the shipped curriculum, not a
 * hand-written fixture. A renderer that crashes on real content — a missing
 * pictogram, a prop that changed shape, an unbalanced layout — fails here
 * instead of in front of a child.
 */
const manifest = curriculumManifestSchema.parse(
  JSON.parse(
    readFileSync(join(__dirname, '../../src/content/manifests/curriculum-v1.json'), 'utf8'),
  ),
);

const lessons: Lesson[] = manifest.levels.flatMap((level) =>
  level.worlds.flatMap((world) => world.lessons),
);

/** First real step of each type, plus the lesson it came from for diagnostics. */
const samples = new Map<string, { step: ExerciseStep; lessonId: string }>();
for (const lesson of lessons) {
  for (const step of lesson.steps) {
    if (!samples.has(step.type)) {
      samples.set(step.type, { step, lessonId: lesson.id });
    }
  }
}

describe('exercise renderers, on real curriculum content', () => {
  it('has a sample of every exercise type in the shipped content', () => {
    const missing = EXERCISE_TYPES.filter((type) => !samples.has(type));
    expect(missing).toEqual([]);
  });

  it.each(EXERCISE_TYPES)('renders %s without crashing', (type) => {
    const sample = samples.get(type);
    expect(sample).toBeDefined();
    const step = sample!.step;
    const Renderer = rendererFor(step);
    expect(Renderer).not.toBeNull();
    if (!Renderer) {
      return;
    }

    const view = render(
      <Renderer
        step={step}
        interactive
        onSubmit={jest.fn()}
        playAudio={jest.fn()}
        playingAudioId={null}
      />,
    );
    expect(view.toJSON()).toBeTruthy();
    view.unmount();
  });

  it.each(EXERCISE_TYPES)('renders %s again in its non-interactive state', (type) => {
    const sample = samples.get(type);
    const step = sample!.step;
    const Renderer = rendererFor(step);
    if (!Renderer) {
      throw new Error(`no renderer for ${type}`);
    }
    const view = render(
      <Renderer
        step={step}
        interactive={false}
        onSubmit={jest.fn()}
        playAudio={jest.fn()}
        playingAudioId={step.instruction.audioId}
      />,
    );
    expect(view.toJSON()).toBeTruthy();
    view.unmount();
  });
});

describe('every shipped step is solvable', () => {
  it('accepts the intended answer for every step of the curriculum', () => {
    const unsolvable: string[] = [];

    for (const lesson of lessons) {
      for (const step of lesson.steps) {
        const answer = intendedAnswer(step);
        if (!answer) {
          continue;
        }
        if (evaluateAnswer(step, answer).outcome !== 'correct') {
          unsolvable.push(`${lesson.id}/${step.id} (${step.type})`);
        }
      }
    }

    expect(unsolvable).toEqual([]);
  });
});

/** The answer a child who knows the lesson would give. */
function intendedAnswer(step: ExerciseStep): ExerciseAnswer | null {
  switch (step.type) {
    case 'listen':
    case 'listen_and_repeat':
      return { kind: 'acknowledge' };
    case 'audio_multiple_choice':
    case 'text_multiple_choice':
    case 'image_multiple_choice':
    case 'mini_story_question':
    case 'attribute_choice':
    case 'spatial_position':
      return { kind: 'choice', choiceId: step.correctChoiceId };
    case 'tap_letter':
    case 'tap_syllable':
      return { kind: 'value', value: step.target };
    case 'fill_missing_letter':
      return { kind: 'value', value: step.answer };
    case 'sound_position':
      return { kind: 'value', value: step.answer };
    case 'compose_syllable':
    case 'compose_word':
      return { kind: 'sequence', values: splitIntoTiles(step.target, step.tiles) };
    case 'order_words':
      return { kind: 'sequence', values: [...step.sentence] };
    case 'match_pairs':
      return {
        kind: 'pairs',
        matches: step.pairs.map((pair) => ({ pairId: pair.id, matchedPairId: pair.id })),
      };
    case 'trace_letter':
    case 'trace_graphism':
      return { kind: 'trace', reachedAllCheckpoints: true };
    case 'count_objects':
      return { kind: 'number', value: step.count };
    case 'number_sequence':
    case 'visual_word_problem':
    case 'count_money':
      return { kind: 'number', value: step.answer };
    case 'compare_numbers':
      return {
        kind: 'number',
        value: step.mode === 'greater' ? Math.max(step.left, step.right) : Math.min(step.left, step.right),
      };
    case 'simple_addition':
      return { kind: 'number', value: step.a + step.b };
    case 'simple_subtraction':
      return { kind: 'number', value: step.a - step.b };
    case 'simple_multiplication':
      return { kind: 'number', value: step.a * step.b };
    case 'simple_division':
      return { kind: 'number', value: step.a / step.b };
    default:
      return null;
  }
}

/**
 * Rebuilds the target from the tiles offered, longest tile first — the child
 * has to be able to build the answer out of what is on screen.
 */
function splitIntoTiles(target: string, tiles: readonly string[]): string[] {
  const ordered = [...tiles].sort((a, b) => b.length - a.length);
  const out: string[] = [];
  let rest = target;
  while (rest.length > 0) {
    const tile = ordered.find((candidate) => rest.startsWith(candidate));
    if (!tile) {
      // No tile matches: the exercise cannot be solved from what is shown.
      return [`__unbuildable__${target}`];
    }
    out.push(tile);
    rest = rest.slice(tile.length);
  }
  return out;
}
