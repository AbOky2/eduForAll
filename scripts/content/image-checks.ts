/**
 * Contrôles des questions « Touche l'image » — partagés par le générateur
 * (scripts/generate-content.ts), la validation du manifeste
 * (scripts/validate-content.ts) et les tests.
 *
 * Deux règles, de gravité différente :
 *
 * 1. Dans une même question, deux cartes ne montrent jamais le même dessin.
 *    Sinon l'enfant qui a bien entendu le mot peut toucher la « mauvaise »
 *    carte identique : la question n'a pas de réponse. C'est une ERREUR.
 *
 * 2. Un dessin ne devrait servir de bonne réponse qu'à un seul mot. Quand le
 *    même pantalon vaut « pantalon », « jupe » et « poche », l'app enseigne
 *    une fausse association mot-image. Corriger demande une décision
 *    pédagogique (dessiner un pictogramme dédié, ou passer l'étape en choix
 *    audio) : c'est un AVERTISSEMENT, plafonné pour ne pouvoir que diminuer
 *    (docs/pedagogical-validation.md, point 9).
 */

/** Une carte d'une question d'image, telle qu'elle est écrite au manifeste. */
export interface ImageCard {
  id: string;
  label?: string | undefined;
  illustrationId: string;
}

/** Une question d'image, réduite à ce que les contrôles regardent. */
export interface ImageQuestion {
  id: string;
  correctChoiceId: string;
  choices: readonly ImageCard[];
}

/**
 * Plafonds des dessins partagés, constatés à la ronde 5 de la critique
 * (contenu 2.1.0) : 41 pictogrammes servent de bonne réponse à plusieurs mots,
 * soit 55 mots « en trop » (96 mots cibles pour 41 dessins). Deux compteurs :
 * le second attrape aussi un mot de plus posé sur un dessin déjà partagé.
 * Ils ne peuvent que baisser — quand un pictogramme dédié est dessiné ou
 * qu'une étape passe en choix audio, abaisser ces nombres d'autant.
 */
export const SHARED_TARGET_CEILING = { illustrations: 41, extraWords: 55 } as const;

/**
 * Les dessins montrés deux fois dans une même question, en clair
 * (« fête » et « tambour » : icon-drum). Vide si la question est saine.
 */
export function duplicateIllustrations(choices: readonly ImageCard[]): string[] {
  const firstWord = new Map<string, string>();
  const problems: string[] = [];
  for (const choice of choices) {
    const word = choice.label ?? choice.id;
    const seen = firstWord.get(choice.illustrationId);
    if (seen === undefined) {
      firstWord.set(choice.illustrationId, word);
    } else {
      problems.push(`« ${seen} » et « ${word} » ont le même dessin (${choice.illustrationId})`);
    }
  }
  return problems;
}

/** Un pictogramme qui sert de bonne réponse à plusieurs mots différents. */
export interface SharedTargetIllustration {
  illustrationId: string;
  /** Chaque mot cible, avec les étapes où il est la bonne réponse. */
  targets: { word: string; stepIds: string[] }[];
}

/**
 * Les pictogrammes qui servent de bonne réponse à plus d'un mot, triés par
 * identifiant pour une sortie stable. Les mots gardent l'ordre de première
 * apparition dans le parcours.
 */
export function sharedTargetIllustrations(
  questions: Iterable<ImageQuestion>,
): SharedTargetIllustration[] {
  const byIllustration = new Map<string, Map<string, string[]>>();
  for (const question of questions) {
    const correct = question.choices.find((choice) => choice.id === question.correctChoiceId);
    if (!correct) {
      continue;
    }
    const word = correct.label ?? correct.id;
    const targets = byIllustration.get(correct.illustrationId) ?? new Map<string, string[]>();
    byIllustration.set(correct.illustrationId, targets);
    targets.set(word, [...(targets.get(word) ?? []), question.id]);
  }
  return [...byIllustration]
    .filter(([, targets]) => targets.size > 1)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([illustrationId, targets]) => ({
      illustrationId,
      targets: [...targets].map(([word, stepIds]) => ({ word, stepIds })),
    }));
}

/** Toutes les questions d'image d'un manifeste (brut ou validé). */
export function imageQuestions(manifest: {
  levels: readonly { worlds: readonly { lessons: readonly { steps: readonly unknown[] }[] }[] }[];
}): ImageQuestion[] {
  const questions: ImageQuestion[] = [];
  for (const level of manifest.levels) {
    for (const world of level.worlds) {
      for (const lesson of world.lessons) {
        for (const step of lesson.steps) {
          const candidate = step as { type?: unknown } & Partial<ImageQuestion>;
          if (
            candidate.type === 'image_multiple_choice' &&
            typeof candidate.id === 'string' &&
            typeof candidate.correctChoiceId === 'string' &&
            Array.isArray(candidate.choices)
          ) {
            questions.push({
              id: candidate.id,
              correctChoiceId: candidate.correctChoiceId,
              choices: candidate.choices,
            });
          }
        }
      }
    }
  }
  return questions;
}

/** Combien de dessins partagés, et combien de mots cibles de trop. */
export function countSharedTargets(shared: readonly SharedTargetIllustration[]): {
  illustrations: number;
  extraWords: number;
} {
  return {
    illustrations: shared.length,
    extraWords: shared.reduce((sum, entry) => sum + entry.targets.length - 1, 0),
  };
}

/** Ce qui dépasse les plafonds, en clair ; vide si les compteurs tiennent. */
export function sharedTargetRegressions(shared: readonly SharedTargetIllustration[]): string[] {
  const count = countSharedTargets(shared);
  const problems: string[] = [];
  if (count.illustrations > SHARED_TARGET_CEILING.illustrations) {
    problems.push(
      `${count.illustrations} pictogrammes servent de bonne réponse à plusieurs mots ` +
        `(plafond ${SHARED_TARGET_CEILING.illustrations})`,
    );
  }
  if (count.extraWords > SHARED_TARGET_CEILING.extraWords) {
    problems.push(
      `${count.extraWords} mots cibles partagent le dessin d’un autre mot ` +
        `(plafond ${SHARED_TARGET_CEILING.extraWords})`,
    );
  }
  return problems.map(
    (problem) => `${problem} — ce nombre ne peut que baisser (scripts/content/image-checks.ts)`,
  );
}
