/**
 * Niveau de maîtrise d'une notion, déduit de ce que l'enfant a réellement fait.
 *
 * L'ancienne règle jugeait sur la dernière leçon seulement : deux erreurs dans
 * une séance suffisaient à marquer « à revoir », et « maîtrisé » n'était jamais
 * atteint. Le jugement porte désormais sur les compteurs accumulés, ce qui
 * laisse à l'enfant le droit de rater une fois sans être étiqueté.
 */
export type MasteryLevel = 'discovering' | 'practicing' | 'mastered' | 'needs_review';

/** Réussites nécessaires avant de parler de maîtrise. */
const MASTERY_THRESHOLD = 3;
/** Au-delà de cette part d'erreurs, la notion n'est pas acquise. */
const MASTERY_MAX_ERROR_RATIO = 0.2;

export function masteryFor(input: {
  correctCount: number;
  errorCount: number;
  /** Le moteur de révision a reprogrammé cette notion. */
  needsReview: boolean;
}): MasteryLevel {
  if (input.needsReview) {
    return 'needs_review';
  }
  const total = input.correctCount + input.errorCount;
  if (total === 0) {
    return 'discovering';
  }
  const errorRatio = input.errorCount / total;
  if (input.correctCount >= MASTERY_THRESHOLD && errorRatio < MASTERY_MAX_ERROR_RATIO) {
    return 'mastered';
  }
  return 'practicing';
}
