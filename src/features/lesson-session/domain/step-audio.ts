import type { ExerciseStep } from '@/content/schemas/exercise-schema';

import { currentStep, lessonReducer, type LessonMachineState } from './lesson-machine';

/**
 * Le son que l'étape fait entendre — le mot, la syllabe, la phrase,
 * l'histoire ou l'énoncé —, s'il y en a un. C'est lui que l'enfant qui s'est
 * trompé doit pouvoir réentendre : un non-lecteur qui a mal entendu le mot ne
 * le retrouve pas tout seul sur la bande d'écoute.
 */
export function stimulusAudioId(step: ExerciseStep): string | null {
  if ('audioId' in step && step.audioId) {
    return step.audioId;
  }
  if ('storyAudioId' in step) {
    return step.storyAudioId;
  }
  if ('statementAudioId' in step && step.statementAudioId) {
    return step.statementAudioId;
  }
  return null;
}

/**
 * L'étape fait-elle entendre quelque chose ? « Écoute encore une fois » n'a de
 * sens que là ; ailleurs on dit « regarde ».
 */
export function makesSound(step: ExerciseStep): boolean {
  return stimulusAudioId(step) !== null;
}

/**
 * Ce que dit l'indice quand il s'ouvre (demandé, ou de lui-même au deuxième
 * essai manqué) : sa phrase, puis le son de l'étape. « Écoute encore le mot. »
 * est suivi du mot — l'aide aide vraiment. Une étape muette (compter, relier)
 * ne dit que sa phrase.
 */
export function hintAudioSequence(step: ExerciseStep): readonly string[] {
  const sequence: string[] = [];
  const hintAudio = step.hint?.audioId;
  if (hintAudio) {
    sequence.push(hintAudio);
  }
  const stimulus = stimulusAudioId(step);
  if (stimulus && stimulus !== hintAudio) {
    sequence.push(stimulus);
  }
  return sequence;
}

/**
 * Ce que rejoue « Réessayer » sur la feuille « à revoir » : le son de l'étape,
 * quand le bouton ramène bien à la même question. Au deuxième essai manqué il
 * ouvre l'indice (qui dit lui-même phrase puis son) ; au troisième, on passe
 * à l'étape suivante (qui dit sa consigne) : rien à rejouer ici.
 */
export function retryAudioSequence(state: LessonMachineState): readonly string[] {
  if (state.phase !== 'showing_feedback' || state.lastFeedback !== 'incorrect') {
    return [];
  }
  const next = lessonReducer(state, { type: 'FEEDBACK_DISMISSED' });
  if (next.phase !== 'awaiting_answer' || next.stepIndex !== state.stepIndex) {
    return [];
  }
  const stimulus = stimulusAudioId(currentStep(state));
  return stimulus ? [stimulus] : [];
}
