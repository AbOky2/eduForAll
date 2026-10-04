import { currentStep, type LessonMachineState } from './lesson-machine';

/**
 * L'ampoule d'indice est-elle offerte ? Seulement quand l'enfant peut s'en
 * servir et après un premier essai manqué. Offerte avant la question, elle
 * attirait le premier appui (le disque le plus vif de l'écran) : la leçon
 * perdait ses trois étoiles et `hint_count` nourrissait la révision et la
 * recommandation parent d'une simple curiosité. Jamais pendant une feuille
 * (retour ou indice) : la machine y ignorerait l'appui. Au deuxième essai
 * manqué, l'indice s'ouvre de lui-même (`lesson-machine`).
 */
export function isHintOffered(state: LessonMachineState): boolean {
  return (
    state.phase === 'awaiting_answer' &&
    state.attemptsOnCurrentStep >= 1 &&
    currentStep(state).hint !== undefined
  );
}
