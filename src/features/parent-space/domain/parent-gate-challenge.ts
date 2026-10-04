/**
 * La question de la porte parentale : une multiplication de deux facteurs de
 * 6 à 9, qu'un enfant de six à huit ans ne sait pas encore poser.
 *
 * Elle est tirée au hasard à chaque ouverture de la porte, puis de nouveau
 * après chaque réponse fausse. Une liste fixe parcourue dans l'ordre posait
 * toujours « 7 × 6 » en premier : un enfant qui avait vu un parent taper 42
 * une seule fois entrait à chaque fois. Dix résultats possibles (36 à 81),
 * saisis et non choisis : retenir une réponse ne suffit plus.
 */
export interface GateChallenge {
  readonly left: number;
  readonly right: number;
}

export const GATE_FACTOR_MIN = 6;
export const GATE_FACTOR_MAX = 9;

/** Un tirage qui retombe sur le même résultat recommence ; au-delà, on décale. */
const MAX_DRAWS = 20;

export function gateAnswer(challenge: GateChallenge): number {
  return challenge.left * challenge.right;
}

function drawFactor(random: () => number): number {
  const span = GATE_FACTOR_MAX - GATE_FACTOR_MIN + 1;
  // `random()` vaut au plus presque 1 ; le min protège d'un générateur qui rendrait 1.
  return GATE_FACTOR_MIN + Math.min(span - 1, Math.floor(random() * span));
}

/**
 * Tire une multiplication. `previous` est celle à laquelle on vient de mal
 * répondre : la nouvelle a un AUTRE résultat (passer de 7 × 8 à 8 × 7 ne
 * changerait rien à ce qu'il faut savoir). `random` est injectable pour les
 * tests ; l'écran l'appelle hors du rendu (initialiseur d'état, gestionnaire).
 */
export function drawGateChallenge(
  previous: GateChallenge | null = null,
  random: () => number = Math.random,
): GateChallenge {
  for (let draw = 0; draw < MAX_DRAWS; draw += 1) {
    const candidate = { left: drawFactor(random), right: drawFactor(random) };
    if (previous === null || gateAnswer(candidate) !== gateAnswer(previous)) {
      return candidate;
    }
  }
  // Générateur dégénéré (constant) : changer un facteur change le produit.
  const previousLeft = previous?.left ?? GATE_FACTOR_MIN;
  const left = previousLeft >= GATE_FACTOR_MAX ? GATE_FACTOR_MIN : previousLeft + 1;
  return { left, right: previous?.right ?? GATE_FACTOR_MIN };
}
