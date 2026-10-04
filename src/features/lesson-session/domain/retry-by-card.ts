import type { ExerciseAnswer } from '@/features/exercises/domain/answer';
import type { ExerciseType } from '@/content/schemas/exercise-schema';

import {
  currentStep,
  lessonReducer,
  type LessonEvent,
  type LessonMachineState,
} from './lesson-machine';

/**
 * Réessayer en touchant une carte. Pendant la feuille « à revoir » du premier
 * essai manqué, l'enfant qui touche une autre réponse ne doit pas tomber sur
 * un appui mort : toucher une carte vaut « Réessayer », puis cette réponse.
 *
 * Seuls les exercices à choix unique s'y prêtent — une carte, une réponse.
 * Relier, composer, ranger (une réponse en plusieurs gestes), tracer,
 * écouter et répéter (rien à juger) gardent le bouton « Réessayer » seul.
 * Un nouveau type d'exercice doit trancher ici (le `Record` l'impose).
 */
const ANSWERED_BY_ONE_CARD: Record<ExerciseType, boolean> = {
  audio_multiple_choice: true,
  text_multiple_choice: true,
  image_multiple_choice: true,
  tap_letter: true,
  tap_syllable: true,
  fill_missing_letter: true,
  count_objects: true,
  number_sequence: true,
  compare_numbers: true,
  simple_addition: true,
  simple_subtraction: true,
  simple_multiplication: true,
  simple_division: true,
  visual_word_problem: true,
  mini_story_question: true,
  attribute_choice: true,
  spatial_position: true,
  count_money: true,
  sound_position: true,
  match_pairs: false,
  compose_syllable: false,
  compose_word: false,
  order_words: false,
  trace_letter: false,
  trace_graphism: false,
  listen: false,
  listen_and_repeat: false,
};

export function isAnsweredByOneCard(type: ExerciseType): boolean {
  return ANSWERED_BY_ONE_CARD[type];
}

/**
 * La feuille de retour affichée accepte-t-elle une nouvelle réponse touchée
 * sur une carte ? Seulement au premier essai manqué, et seulement si
 * « Réessayer » ramène bien à la question : au deuxième, « Réessayer » ouvre
 * l'indice ; au troisième, on avance — ces feuilles-là se lisent jusqu'au bout.
 */
export function canAnswerAgainByCard(state: LessonMachineState): boolean {
  return (
    state.phase === 'showing_feedback' &&
    state.lastFeedback === 'incorrect' &&
    state.attemptsOnCurrentStep === 1 &&
    isAnsweredByOneCard(currentStep(state).type) &&
    lessonReducer(state, { type: 'FEEDBACK_DISMISSED' }).phase === 'awaiting_answer'
  );
}

/**
 * Ce que fait l'écran quand la carte est touchée : exactement « Réessayer »
 * puis la réponse, deux événements ordinaires de la machine. L'essai compte
 * donc comme n'importe quel deuxième essai — le décompte reste honnête.
 */
export function answerAgainEvents(answer: ExerciseAnswer): readonly LessonEvent[] {
  return [{ type: 'FEEDBACK_DISMISSED' }, { type: 'ANSWER_SUBMITTED', answer }];
}
