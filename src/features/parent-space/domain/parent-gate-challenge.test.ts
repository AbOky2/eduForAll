import {
  drawGateChallenge,
  gateAnswer,
  GATE_FACTOR_MAX,
  GATE_FACTOR_MIN,
  type GateChallenge,
} from './parent-gate-challenge';

/** Un générateur qui rend ces valeurs dans l'ordre, puis recommence. */
function sequence(...values: number[]): () => number {
  let index = 0;
  return () => {
    const value = values[index % values.length] ?? 0;
    index += 1;
    return value;
  };
}

describe('la question de la porte parentale', () => {
  it('multiplie deux facteurs de 6 à 9, bornes comprises', () => {
    expect(drawGateChallenge(null, sequence(0, 0))).toEqual({ left: 6, right: 6 });
    expect(drawGateChallenge(null, sequence(0.999, 0.999))).toEqual({ left: 9, right: 9 });
    // Un générateur qui rendrait 1 ne sort pas des bornes.
    expect(drawGateChallenge(null, sequence(1, 1))).toEqual({ left: 9, right: 9 });
    for (let draw = 0; draw < 500; draw += 1) {
      const { left, right } = drawGateChallenge();
      expect(left).toBeGreaterThanOrEqual(GATE_FACTOR_MIN);
      expect(left).toBeLessThanOrEqual(GATE_FACTOR_MAX);
      expect(right).toBeGreaterThanOrEqual(GATE_FACTOR_MIN);
      expect(right).toBeLessThanOrEqual(GATE_FACTOR_MAX);
    }
  });

  it('ne commence pas toujours par la même opération', () => {
    // L'ancienne liste fixe posait toujours « 7 × 6 » en premier.
    const answers = new Set(Array.from({ length: 200 }, () => gateAnswer(drawGateChallenge())));
    expect(answers.size).toBeGreaterThan(5);
  });

  it('après une erreur, tire une opération d’un autre résultat', () => {
    const previous: GateChallenge = { left: 7, right: 8 };
    // 8 × 7 d'abord (même résultat, 56), puis 6 × 9 : c'est 6 × 9 qui sort.
    expect(drawGateChallenge(previous, sequence(0.5, 0.25, 0, 0.75))).toEqual({ left: 6, right: 9 });
    for (let draw = 0; draw < 500; draw += 1) {
      const next = drawGateChallenge(previous);
      expect(gateAnswer(next)).not.toBe(56);
    }
  });

  it('change de résultat même avec un générateur dégénéré', () => {
    const constant = () => 0;
    const previous: GateChallenge = { left: 6, right: 6 };
    expect(gateAnswer(drawGateChallenge(previous, constant))).not.toBe(36);
    const top: GateChallenge = { left: 9, right: 9 };
    expect(gateAnswer(drawGateChallenge(top, () => 0.99))).not.toBe(gateAnswer(top));
  });
});
