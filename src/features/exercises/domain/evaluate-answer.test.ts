import { exerciseStepSchema, type ExerciseStep } from '@/content/schemas/exercise-schema';

import { evaluateAnswer } from './evaluate-answer';

const instruction = { text: 'Consigne.', audioId: 'instr-test' };

function step(raw: Record<string, unknown>): ExerciseStep {
  return exerciseStepSchema.parse({ id: 'step-1', skills: ['skill-1'], instruction, ...raw });
}

describe('evaluateAnswer', () => {
  it('accepts acknowledge for listen steps and rejects other kinds', () => {
    const listen = step({ type: 'listen', glyph: 'ba', audioId: 'syllabe-ba' });
    expect(evaluateAnswer(listen, { kind: 'acknowledge' }).outcome).toBe('correct');
    expect(evaluateAnswer(listen, { kind: 'number', value: 3 }).outcome).toBe('invalid');
  });

  it('checks multiple choice answers by id', () => {
    const mc = step({
      type: 'audio_multiple_choice',
      audioId: 'syllabe-ba',
      choices: [
        { id: 'ba', label: 'ba' },
        { id: 'ma', label: 'ma' },
      ],
      correctChoiceId: 'ba',
    });
    expect(evaluateAnswer(mc, { kind: 'choice', choiceId: 'ba' }).outcome).toBe('correct');
    expect(evaluateAnswer(mc, { kind: 'choice', choiceId: 'ma' }).outcome).toBe('incorrect');
  });

  it('normalizes case and whitespace for tapped values', () => {
    const tap = step({ type: 'tap_letter', target: 'a', options: ['a', 'b', 'm'] });
    expect(evaluateAnswer(tap, { kind: 'value', value: ' A ' }).outcome).toBe('correct');
    expect(evaluateAnswer(tap, { kind: 'value', value: 'b' }).outcome).toBe('incorrect');
  });

  it('joins composed tiles before comparing', () => {
    const compose = step({
      type: 'compose_syllable',
      target: 'ba',
      tiles: ['b', 'm', 'a'],
    });
    expect(evaluateAnswer(compose, { kind: 'sequence', values: ['b', 'a'] }).outcome).toBe(
      'correct',
    );
    expect(evaluateAnswer(compose, { kind: 'sequence', values: ['m', 'a'] }).outcome).toBe(
      'incorrect',
    );
  });

  it('requires exact word order for order_words', () => {
    const order = step({
      type: 'order_words',
      sentence: ['Ali', 'lit', 'un', 'livre'],
    });
    expect(
      evaluateAnswer(order, { kind: 'sequence', values: ['Ali', 'lit', 'un', 'livre'] }).outcome,
    ).toBe('correct');
    expect(
      evaluateAnswer(order, { kind: 'sequence', values: ['lit', 'Ali', 'un', 'livre'] }).outcome,
    ).toBe('incorrect');
  });

  it('evaluates arithmetic from the step definition, not stored answers', () => {
    const addition = step({ type: 'simple_addition', a: 12, b: 5, options: [15, 17, 18] });
    expect(evaluateAnswer(addition, { kind: 'number', value: 17 }).outcome).toBe('correct');
    expect(evaluateAnswer(addition, { kind: 'number', value: 15 }).outcome).toBe('incorrect');

    const subtraction = step({ type: 'simple_subtraction', a: 9, b: 4, options: [5, 6] });
    expect(evaluateAnswer(subtraction, { kind: 'number', value: 5 }).outcome).toBe('correct');
  });

  it('compares numbers according to the requested mode', () => {
    const compare = step({ type: 'compare_numbers', left: 8, right: 13, mode: 'greater' });
    expect(evaluateAnswer(compare, { kind: 'number', value: 13 }).outcome).toBe('correct');
    expect(evaluateAnswer(compare, { kind: 'number', value: 8 }).outcome).toBe('incorrect');
  });

  it('is tolerant for letter tracing: checkpoints decide', () => {
    const trace = step({ type: 'trace_letter', letter: 'a' });
    expect(evaluateAnswer(trace, { kind: 'trace', reachedAllCheckpoints: true }).outcome).toBe(
      'correct',
    );
    expect(evaluateAnswer(trace, { kind: 'trace', reachedAllCheckpoints: false }).outcome).toBe(
      'incorrect',
    );
  });

  it('validates match_pairs by pair identity', () => {
    const pairs = step({
      type: 'match_pairs',
      pairs: [
        { id: 'p1', left: 'papa', right: 'papa' },
        { id: 'p2', left: 'mama', right: 'mama' },
      ],
    });
    expect(
      evaluateAnswer(pairs, {
        kind: 'pairs',
        matches: [
          { pairId: 'p1', matchedPairId: 'p1' },
          { pairId: 'p2', matchedPairId: 'p2' },
        ],
      }).outcome,
    ).toBe('correct');
    expect(
      evaluateAnswer(pairs, {
        kind: 'pairs',
        matches: [
          { pairId: 'p1', matchedPairId: 'p2' },
          { pairId: 'p2', matchedPairId: 'p1' },
        ],
      }).outcome,
    ).toBe('incorrect');
  });
});
