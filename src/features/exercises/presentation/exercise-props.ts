import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import type { ExerciseAnswer } from '@/features/exercises/domain/answer';

/**
 * Contract between the lesson session screen and every exercise renderer.
 * Renderers are presentation-only: they collect an ExerciseAnswer and submit
 * it; correctness is decided by the domain evaluator in the state machine.
 */
export interface ExerciseRendererProps<Step extends ExerciseStep = ExerciseStep> {
  step: Step;
  /** Disabled while feedback or hint is showing. */
  interactive: boolean;
  onSubmit: (answer: ExerciseAnswer) => void;
  playAudio: (audioId: string) => void;
  playingAudioId: string | null;
}
