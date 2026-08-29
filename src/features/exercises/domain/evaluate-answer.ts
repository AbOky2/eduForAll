import type { ExerciseStep } from '@/content/schemas/exercise-schema';

import type { ExerciseAnswer } from './answer';

export type Evaluation =
  | { readonly outcome: 'correct' }
  | { readonly outcome: 'incorrect' }
  | { readonly outcome: 'invalid'; readonly reason: string };

const correct: Evaluation = { outcome: 'correct' };
const incorrect: Evaluation = { outcome: 'incorrect' };

function invalid(reason: string): Evaluation {
  return { outcome: 'invalid', reason };
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Pure, exhaustive answer evaluation. UI components never decide
 * correctness themselves — they build an ExerciseAnswer and ask here.
 */
export function evaluateAnswer(step: ExerciseStep, answer: ExerciseAnswer): Evaluation {
  switch (step.type) {
    case 'listen':
    case 'listen_and_repeat':
      return answer.kind === 'acknowledge'
        ? correct
        : invalid(`expected acknowledge, got ${answer.kind}`);

    case 'audio_multiple_choice':
    case 'text_multiple_choice':
    case 'image_multiple_choice':
    case 'mini_story_question':
    case 'attribute_choice':
    case 'spatial_position':
      if (answer.kind !== 'choice') {
        return invalid(`expected choice, got ${answer.kind}`);
      }
      return answer.choiceId === step.correctChoiceId ? correct : incorrect;

    case 'tap_letter':
    case 'tap_syllable':
      if (answer.kind !== 'value') {
        return invalid(`expected value, got ${answer.kind}`);
      }
      return normalize(answer.value) === normalize(step.target) ? correct : incorrect;

    case 'compose_syllable':
    case 'compose_word':
      if (answer.kind !== 'sequence') {
        return invalid(`expected sequence, got ${answer.kind}`);
      }
      return normalize(answer.values.join('')) === normalize(step.target) ? correct : incorrect;

    case 'fill_missing_letter':
      if (answer.kind !== 'value') {
        return invalid(`expected value, got ${answer.kind}`);
      }
      return normalize(answer.value) === normalize(step.answer) ? correct : incorrect;

    case 'order_words':
      if (answer.kind !== 'sequence') {
        return invalid(`expected sequence, got ${answer.kind}`);
      }
      if (answer.values.length !== step.sentence.length) {
        return incorrect;
      }
      return answer.values.every(
        (word, index) => normalize(word) === normalize(step.sentence[index] ?? ''),
      )
        ? correct
        : incorrect;

    case 'match_pairs': {
      if (answer.kind !== 'pairs') {
        return invalid(`expected pairs, got ${answer.kind}`);
      }
      if (answer.matches.length !== step.pairs.length) {
        return incorrect;
      }
      return answer.matches.every((match) => match.pairId === match.matchedPairId)
        ? correct
        : incorrect;
    }

    case 'trace_letter':
    case 'trace_graphism':
      if (answer.kind !== 'trace') {
        return invalid(`expected trace, got ${answer.kind}`);
      }
      // Tolerant by design: reaching the guided checkpoints is enough.
      return answer.reachedAllCheckpoints ? correct : incorrect;

    case 'count_objects':
      if (answer.kind !== 'number') {
        return invalid(`expected number, got ${answer.kind}`);
      }
      return answer.value === step.count ? correct : incorrect;

    case 'number_sequence':
      if (answer.kind !== 'number') {
        return invalid(`expected number, got ${answer.kind}`);
      }
      return answer.value === step.answer ? correct : incorrect;

    case 'compare_numbers': {
      if (answer.kind !== 'number') {
        return invalid(`expected number, got ${answer.kind}`);
      }
      const expected =
        step.mode === 'greater' ? Math.max(step.left, step.right) : Math.min(step.left, step.right);
      return answer.value === expected ? correct : incorrect;
    }

    case 'simple_addition':
      if (answer.kind !== 'number') {
        return invalid(`expected number, got ${answer.kind}`);
      }
      return answer.value === step.a + step.b ? correct : incorrect;

    case 'simple_subtraction':
      if (answer.kind !== 'number') {
        return invalid(`expected number, got ${answer.kind}`);
      }
      return answer.value === step.a - step.b ? correct : incorrect;

    case 'visual_word_problem':
      if (answer.kind !== 'number') {
        return invalid(`expected number, got ${answer.kind}`);
      }
      return answer.value === step.answer ? correct : incorrect;

    case 'simple_multiplication':
      if (answer.kind !== 'number') {
        return invalid(`expected number, got ${answer.kind}`);
      }
      return answer.value === step.a * step.b ? correct : incorrect;

    case 'simple_division':
      if (answer.kind !== 'number') {
        return invalid(`expected number, got ${answer.kind}`);
      }
      // Content schema guarantees an exact division at CP level.
      return answer.value === step.a / step.b ? correct : incorrect;

    case 'count_money':
      if (answer.kind !== 'number') {
        return invalid(`expected number, got ${answer.kind}`);
      }
      return answer.value === step.answer ? correct : incorrect;

    case 'sound_position':
      if (answer.kind !== 'value') {
        return invalid(`expected value, got ${answer.kind}`);
      }
      return normalize(answer.value) === step.answer ? correct : incorrect;

    default: {
      // Compile-time exhaustiveness: adding a type without handling it breaks the build.
      const unhandled: never = step;
      return invalid(`unhandled exercise type: ${JSON.stringify(unhandled)}`);
    }
  }
}
