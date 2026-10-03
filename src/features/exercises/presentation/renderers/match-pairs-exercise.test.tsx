import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AnswerVerdictContext } from '@/design-system/primitives';

import {
  MatchPairsExercise,
  boardAfterVerdict,
  isRightLink,
  nextSlot,
  type PairLink,
} from './match-pairs-exercise';

type MatchStep = Extract<ExerciseStep, { type: 'match_pairs' }>;

/** L'étape livrée (cp1-lecture-revision-1) : o/moto, u/lune, e/melon. */
const step: MatchStep = {
  id: 'cp1-lecture-revision-1-s278',
  skills: ['skill-son-o'],
  instruction: {
    text: 'Associe chaque son à un mot.',
    audioId: 'instr-associe-chaque-son-a1-un-mot',
  },
  type: 'match_pairs',
  pairs: [
    { id: 'p1', left: 'o', right: 'moto' },
    { id: 'p2', left: 'u', right: 'lune' },
    { id: 'p3', left: 'e', right: 'melon' },
  ],
};

function setup() {
  const onSubmit = jest.fn();
  const playAudio = jest.fn();
  const ui = (verdict: 'correct' | 'incorrect' | null, interactive: boolean) => (
    <AnswerVerdictContext.Provider value={verdict}>
      <MatchPairsExercise
        step={step}
        interactive={interactive}
        onSubmit={onSubmit}
        playAudio={playAudio}
        playingAudioId={null}
      />
    </AnswerVerdictContext.Provider>
  );
  const view = render(ui(null, true));
  const tap = (...labels: string[]) => {
    for (const label of labels) {
      fireEvent.press(screen.getByLabelText(label));
    }
  };
  return { onSubmit, playAudio, view, ui, tap };
}

describe('MatchPairsExercise', () => {
  it('links from either side: a first tap on the right selects too', () => {
    const { tap } = setup();
    tap('lune', 'u');
    expect(screen.getByLabelText('u, paire 1')).toBeTruthy();
    expect(screen.getByLabelText('lune, paire 1')).toBeTruthy();
    tap('o', 'moto');
    expect(screen.getByLabelText('moto, paire 2')).toBeTruthy();
  });

  it('says each card with its shipped sound', () => {
    const { tap, playAudio } = setup();
    tap('o', 'moto');
    expect(playAudio).toHaveBeenNthCalledWith(1, 'son-o');
    expect(playAudio).toHaveBeenNthCalledWith(2, 'mot-moto');
  });

  it('submits once, when every pair is drawn', () => {
    const { tap, onSubmit } = setup();
    tap('o', 'moto', 'u');
    expect(onSubmit).not.toHaveBeenCalled();
    tap('lune', 'e', 'melon');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      kind: 'pairs',
      matches: [
        { pairId: 'p1', matchedPairId: 'p1' },
        { pairId: 'p2', matchedPairId: 'p2' },
        { pairId: 'p3', matchedPairId: 'p3' },
      ],
    });
  });

  it('shows « à revoir » on the wrong pairs only, then clears only them', () => {
    const { tap, onSubmit, view, ui } = setup();
    // u–lune est juste ; o–melon et e–moto sont fausses.
    tap('u', 'lune', 'o', 'melon', 'e', 'moto');
    expect(onSubmit).toHaveBeenCalledTimes(1);

    // La feuille « à revoir » est ouverte : seules les paires fausses le disent.
    view.rerender(ui('incorrect', false));
    for (const label of ['o', 'melon', 'e', 'moto']) {
      expect(screen.getByLabelText(`${label}, à revoir`)).toBeTruthy();
    }
    expect(screen.getByLabelText('u, paire 1')).toBeTruthy();
    expect(screen.getByLabelText('lune, paire 1')).toBeTruthy();

    // Nouvel essai : la paire juste reste, avec son numéro ; les fausses s'effacent.
    view.rerender(ui(null, true));
    expect(screen.getByLabelText('u, paire 1')).toBeTruthy();
    for (const label of ['o', 'melon', 'e', 'moto']) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }

    // L'enfant ne refait que le faux ; l'essai est soumis en entier, et compté.
    tap('moto', 'o', 'e', 'melon');
    expect(screen.getByLabelText('o, paire 2')).toBeTruthy();
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(onSubmit).toHaveBeenLastCalledWith({
      kind: 'pairs',
      matches: [
        { pairId: 'p2', matchedPairId: 'p2' },
        { pairId: 'p1', matchedPairId: 'p1' },
        { pairId: 'p3', matchedPairId: 'p3' },
      ],
    });
  });

  it('ignores taps while it is not answering time', () => {
    const { onSubmit, playAudio, view, ui } = setup();
    view.rerender(ui(null, false));
    fireEvent.press(screen.getByLabelText('o'));
    expect(playAudio).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('match pairs board rules', () => {
  const links: PairLink[] = [
    { pairId: 'p1', matchedPairId: 'p1', slot: 1 },
    { pairId: 'p2', matchedPairId: 'p3', slot: 2 },
    { pairId: 'p3', matchedPairId: 'p2', slot: 3 },
  ];

  it('judges a link with the evaluator criterion', () => {
    expect(links.map(isRightLink)).toEqual([true, false, false]);
  });

  it('keeps the whole board while the verdict shows, the right pairs after', () => {
    expect(boardAfterVerdict(links, 3, 'incorrect')).toBe(links);
    expect(boardAfterVerdict(links, 3, null)).toEqual([links[0]]);
    // Plateau incomplet : rien n'a été jugé.
    expect(boardAfterVerdict(links.slice(0, 2), 3, null)).toHaveLength(2);
  });

  it('gives a new pair the smallest free number', () => {
    expect(nextSlot([])).toBe(1);
    expect(nextSlot([{ pairId: 'p2', matchedPairId: 'p2', slot: 2 }])).toBe(1);
    expect(nextSlot(links.slice(0, 1))).toBe(2);
  });
});
