import type { Lesson } from '@/content/schemas/curriculum-schema';
import type { ExerciseAnswer } from '@/features/exercises/domain/answer';
import { evaluateAnswer } from '@/features/exercises/domain/evaluate-answer';

/**
 * Explicit lesson state machine, implemented as a pure reducer.
 * Guards against double taps, answers during feedback, and resume after kill:
 * every transition is only legal from the phases listed in its case.
 */

export type LessonPhase =
  'presenting' | 'awaiting_answer' | 'showing_feedback' | 'showing_hint' | 'completed';

export interface StepOutcome {
  readonly stepId: string;
  readonly exerciseType: string;
  readonly firstTryCorrect: boolean;
  readonly attempts: number;
  readonly usedHint: boolean;
  readonly skills: readonly string[];
}

export interface LessonMachineState {
  readonly lesson: Lesson;
  readonly phase: LessonPhase;
  readonly stepIndex: number;
  readonly attemptsOnCurrentStep: number;
  readonly hintShownOnCurrentStep: boolean;
  readonly lastFeedback: 'correct' | 'incorrect' | null;
  readonly outcomes: readonly StepOutcome[];
}

export type LessonEvent =
  | { type: 'STEP_PRESENTED' }
  | { type: 'ANSWER_SUBMITTED'; answer: ExerciseAnswer }
  | { type: 'HINT_REQUESTED' }
  | { type: 'HINT_DISMISSED' }
  | { type: 'FEEDBACK_DISMISSED' };

/** Au deuxième essai manqué, l'indice s'ouvre de lui-même. */
export const HINT_AFTER_ATTEMPTS = 2;
/**
 * Au troisième, on avance : un enfant ne tourne jamais en rond sur une étape.
 * L'étape n'est pas réussie du premier coup, la révision la reprendra.
 */
export const MOVE_ON_AFTER_ATTEMPTS = 3;

/** La feuille de retour annonce-t-elle qu'on passe à la suite malgré l'erreur ? */
export function willMoveOn(state: LessonMachineState): boolean {
  return (
    state.lastFeedback === 'incorrect' && state.attemptsOnCurrentStep >= MOVE_ON_AFTER_ATTEMPTS
  );
}

/** Enregistre l'issue de l'étape et passe à la suivante (ou termine). */
function advance(state: LessonMachineState): LessonMachineState {
  const step = currentStep(state);
  const outcome: StepOutcome = {
    stepId: step.id,
    exerciseType: step.type,
    firstTryCorrect:
      state.lastFeedback === 'correct' &&
      state.attemptsOnCurrentStep === 1 &&
      !state.hintShownOnCurrentStep,
    attempts: state.attemptsOnCurrentStep,
    usedHint: state.hintShownOnCurrentStep,
    skills: step.skills,
  };
  const outcomes = [...state.outcomes, outcome];
  const isLastStep = state.stepIndex >= state.lesson.steps.length - 1;
  if (isLastStep) {
    return { ...state, phase: 'completed', outcomes, lastFeedback: null };
  }
  return {
    ...state,
    phase: 'presenting',
    stepIndex: state.stepIndex + 1,
    attemptsOnCurrentStep: 0,
    hintShownOnCurrentStep: false,
    lastFeedback: null,
    outcomes,
  };
}

export function createLessonMachine(lesson: Lesson, resumeAtStepIndex = 0): LessonMachineState {
  const stepIndex = Math.min(Math.max(resumeAtStepIndex, 0), lesson.steps.length - 1);
  return {
    lesson,
    phase: 'presenting',
    stepIndex,
    attemptsOnCurrentStep: 0,
    hintShownOnCurrentStep: false,
    lastFeedback: null,
    outcomes: [],
  };
}

export function currentStep(state: LessonMachineState) {
  const step = state.lesson.steps[state.stepIndex];
  if (!step) {
    throw new Error(`step index ${state.stepIndex} out of bounds`);
  }
  return step;
}

export function lessonReducer(state: LessonMachineState, event: LessonEvent): LessonMachineState {
  switch (event.type) {
    case 'STEP_PRESENTED':
      return state.phase === 'presenting' ? { ...state, phase: 'awaiting_answer' } : state;

    case 'ANSWER_SUBMITTED': {
      // Ignore answers outside the answering phase (double tap, mid-animation).
      if (state.phase !== 'awaiting_answer') {
        return state;
      }
      const step = currentStep(state);
      const evaluation = evaluateAnswer(step, event.answer);
      if (evaluation.outcome === 'invalid') {
        return state;
      }
      return {
        ...state,
        phase: 'showing_feedback',
        attemptsOnCurrentStep: state.attemptsOnCurrentStep + 1,
        lastFeedback: evaluation.outcome,
      };
    }

    case 'HINT_REQUESTED':
      if (state.phase !== 'awaiting_answer') {
        return state;
      }
      return { ...state, phase: 'showing_hint', hintShownOnCurrentStep: true };

    case 'HINT_DISMISSED':
      return state.phase === 'showing_hint' ? { ...state, phase: 'awaiting_answer' } : state;

    case 'FEEDBACK_DISMISSED': {
      if (state.phase !== 'showing_feedback') {
        return state;
      }
      if (state.lastFeedback === 'incorrect') {
        // Trop d'essais : on avance, la révision reprendra l'étape.
        if (state.attemptsOnCurrentStep >= MOVE_ON_AFTER_ATTEMPTS) {
          return advance(state);
        }
        // Deuxième erreur : l'aide monte d'elle-même, si l'étape en a une.
        if (
          state.attemptsOnCurrentStep >= HINT_AFTER_ATTEMPTS &&
          currentStep(state).hint &&
          !state.hintShownOnCurrentStep
        ) {
          return {
            ...state,
            phase: 'showing_hint',
            hintShownOnCurrentStep: true,
            lastFeedback: null,
          };
        }
        // Sinon : on reste sur l'étape, pour un nouvel essai en douceur.
        return { ...state, phase: 'awaiting_answer', lastFeedback: null };
      }
      return advance(state);
    }

    default: {
      const unhandled: never = event;
      throw new Error(`unhandled lesson event: ${JSON.stringify(unhandled)}`);
    }
  }
}
