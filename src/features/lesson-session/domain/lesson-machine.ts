import type { Lesson } from '@/content/schemas/curriculum-schema';
import type { ExerciseAnswer } from '@/features/exercises/domain/answer';
import { evaluateAnswer } from '@/features/exercises/domain/evaluate-answer';

/**
 * Explicit lesson state machine, implemented as a pure reducer.
 * Guards against double taps, answers during feedback, and resume after kill:
 * every transition is only legal from the phases listed in its case.
 */

export type LessonPhase =
  | 'presenting'
  | 'awaiting_answer'
  | 'showing_feedback'
  | 'showing_hint'
  | 'completed';

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
      // Wrong answer: stay on the step for a kind retry.
      if (state.lastFeedback === 'incorrect') {
        return { ...state, phase: 'awaiting_answer', lastFeedback: null };
      }
      // Correct: record the outcome and advance (or complete).
      const step = currentStep(state);
      const outcome: StepOutcome = {
        stepId: step.id,
        exerciseType: step.type,
        firstTryCorrect: state.attemptsOnCurrentStep === 1 && !state.hintShownOnCurrentStep,
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

    default: {
      const unhandled: never = event;
      throw new Error(`unhandled lesson event: ${JSON.stringify(unhandled)}`);
    }
  }
}
