import type { ComponentType } from 'react';

import type { ExerciseStep, ExerciseType } from '@/content/schemas/exercise-schema';

import type { ExerciseRendererProps } from './exercise-props';
import { ChoiceExercise } from './renderers/choice-exercise';
import { ComposeExercise } from './renderers/compose-exercise';
import { CountObjectsExercise } from './renderers/count-objects-exercise';
import { ImageChoiceExercise } from './renderers/image-choice-exercise';
import { ListenExercise } from './renderers/listen-exercise';
import { ListenRepeatExercise } from './renderers/listen-repeat-exercise';
import { MatchPairsExercise } from './renderers/match-pairs-exercise';
import { MathExercise } from './renderers/math-exercise';
import { MiniStoryExercise } from './renderers/mini-story-exercise';
import { OrderWordsExercise } from './renderers/order-words-exercise';
import { TapValueExercise } from './renderers/tap-value-exercise';
import { TraceLetterExercise } from './renderers/trace-letter-exercise';

/**
 * Typed registry: one renderer per exercise type. An unknown type is a
 * content bug surfaced explicitly by the session screen — never a blank view.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<ExerciseType, ComponentType<ExerciseRendererProps<any>>> = {
  listen: ListenExercise,
  audio_multiple_choice: ChoiceExercise,
  text_multiple_choice: ChoiceExercise,
  image_multiple_choice: ImageChoiceExercise,
  match_pairs: MatchPairsExercise,
  tap_letter: TapValueExercise,
  tap_syllable: TapValueExercise,
  compose_syllable: ComposeExercise,
  compose_word: ComposeExercise,
  fill_missing_letter: TapValueExercise,
  order_words: OrderWordsExercise,
  trace_letter: TraceLetterExercise,
  count_objects: CountObjectsExercise,
  number_sequence: MathExercise,
  compare_numbers: MathExercise,
  simple_addition: MathExercise,
  simple_subtraction: MathExercise,
  visual_word_problem: MathExercise,
  listen_and_repeat: ListenRepeatExercise,
  mini_story_question: MiniStoryExercise,
};

export function rendererFor(step: ExerciseStep): ComponentType<ExerciseRendererProps> | null {
  return registry[step.type] ?? null;
}
