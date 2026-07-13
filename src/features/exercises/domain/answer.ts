/**
 * What the child produced for a given step. Discriminated by `kind` so the
 * evaluator can reject structurally impossible answers explicitly instead of
 * silently coercing them.
 */
export type ExerciseAnswer =
  | { kind: 'acknowledge' }
  | { kind: 'choice'; choiceId: string }
  | { kind: 'value'; value: string }
  | { kind: 'sequence'; values: string[] }
  | { kind: 'number'; value: number }
  | { kind: 'pairs'; matches: Array<{ pairId: string; matchedPairId: string }> }
  | { kind: 'trace'; reachedAllCheckpoints: boolean };
