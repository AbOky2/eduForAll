import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { State, type PanGesture } from 'react-native-gesture-handler';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';
import type { ReactTestInstance } from 'react-test-renderer';
import { Circle, Line } from 'react-native-svg';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AnswerVerdictContext, ExerciseSubjectContext } from '@/design-system/primitives';
import { colors, subjectColors } from '@/design-system/tokens';

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

async function setup() {
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
  // La préférence « mouvement réduit » se lit de façon asynchrone : on la laisse arriver.
  await act(async () => {});
  const tap = (...labels: string[]) => {
    for (const label of labels) {
      fireEvent.press(screen.getByLabelText(label));
    }
  };
  return { onSubmit, playAudio, view, ui, tap };
}

describe('MatchPairsExercise', () => {
  it('links from either side: a first tap on the right selects too', async () => {
    const { tap } = await setup();
    tap('lune', 'u');
    expect(screen.getByLabelText('u, paire 1')).toBeTruthy();
    expect(screen.getByLabelText('lune, paire 1')).toBeTruthy();
    tap('o', 'moto');
    expect(screen.getByLabelText('moto, paire 2')).toBeTruthy();
  });

  it('says each card with its shipped sound', async () => {
    const { tap, playAudio } = await setup();
    tap('o', 'moto');
    expect(playAudio).toHaveBeenNthCalledWith(1, 'son-o');
    expect(playAudio).toHaveBeenNthCalledWith(2, 'mot-moto');
  });

  it('submits once, when every pair is drawn', async () => {
    const { tap, onSubmit } = await setup();
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

  it('shows « à revoir » on the wrong pairs only, then clears only them', async () => {
    const { tap, onSubmit, view, ui } = await setup();
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

  it('ignores taps while it is not answering time', async () => {
    const { onSubmit, playAudio, view, ui } = await setup();
    view.rerender(ui(null, false));
    fireEvent.press(screen.getByLabelText('o'));
    expect(playAudio).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

/** Les ancêtres d'une carte qui écoutent leur mise en page : case, colonne, rangée, ancre. */
function measuredAncestors(card: ReactTestInstance): ReactTestInstance[] {
  const found: ReactTestInstance[] = [];
  for (let node = card.parent; node; node = node.parent) {
    if (typeof node.type === 'string' && typeof node.props.onLayout === 'function') {
      found.push(node);
    }
  }
  return found;
}

function layout(node: ReactTestInstance, y: number, width: number, height: number): void {
  fireEvent(node, 'layout', { nativeEvent: { layout: { x: 0, y, width, height } } });
}

/**
 * Pose le plateau d'une tablette couchée : une rangée de 1000, des colonnes de
 * 364 (la droite commence à 636), des cartes de 124 tous les 150. Dans chaque
 * colonne, de haut en bas : o, u, e à gauche ; moto, lune, melon à droite.
 */
function layBoard(): void {
  const [, column, row] = measuredAncestors(screen.getByLabelText('o'));
  layout(row!, 0, 1000, 420);
  layout(column!, 0, 364, 420);
  ['o', 'u', 'e', 'moto', 'lune', 'melon'].forEach((label, index) => {
    const [cell] = measuredAncestors(screen.getByLabelText(label));
    layout(cell!, (index % 3) * 150, 364, 124);
  });
}

/** Le milieu vertical de la rangée n (0, 1, 2). */
const rowY = (index: number) => index * 150 + 62;

async function renderBoard({ interactive = true }: { interactive?: boolean } = {}) {
  const onSubmit = jest.fn();
  const playAudio = jest.fn();
  render(
    <ExerciseSubjectContext.Provider value="reading">
      <MatchPairsExercise
        step={step}
        interactive={interactive}
        onSubmit={onSubmit}
        playAudio={playAudio}
        playingAudioId={null}
      />
    </ExerciseSubjectContext.Provider>,
  );
  layBoard();
  // Gesture Handler reprend ses rappels (et le plateau mesuré) dans une microtâche.
  await act(async () => {});
  return { onSubmit, playAudio };
}

/** Un trait tiré de (x0, y0) à (x1, y1), en passant par le milieu du couloir. */
async function drag(x0: number, y0: number, x1: number, y1: number) {
  // Un nouveau geste vient après le rendu du précédent : les rappels sont à jour.
  await act(async () => {});
  await act(async () => {
    fireGestureHandler<PanGesture>(getByGestureTestId('relier'), [
      { state: State.BEGAN, x: x0, y: y0, translationX: 0, translationY: 0 },
      { state: State.ACTIVE, x: x0 + 20, y: y0, translationX: 20, translationY: 0 },
      {
        x: (x0 + x1) / 2,
        y: (y0 + y1) / 2,
        translationX: (x1 - x0) / 2,
        translationY: (y1 - y0) / 2,
      },
      { state: State.END, x: x1, y: y1, translationX: x1 - x0, translationY: y1 - y0 },
    ]);
  });
}

const dots = () => screen.UNSAFE_getAllByType(Circle).map((circle) => circle.props);

describe('MatchPairsExercise — points d’accroche', () => {
  it('rests as a white eyelet ringed with the subject’s solid tint (≥ 3:1), ≈ 30 dp; blue when chosen', async () => {
    await renderBoard();
    expect(dots()).toHaveLength(6);
    for (const dot of dots()) {
      expect(dot.fill).toBe(colors.white);
      expect(dot.stroke).toBe(subjectColors.reading.solid);
      expect(dot.strokeWidth).toBeGreaterThanOrEqual(3);
      // Bien visible au repos : environ 30 dp de diamètre sur tablette.
      expect(2 * (dot.r as number) + (dot.strokeWidth as number)).toBeGreaterThanOrEqual(24);
    }

    fireEvent.press(screen.getByLabelText('o'));
    expect(dots().filter((dot) => dot.fill === colors.brand)).toHaveLength(1);
  });

  it('sits astride the card edge, and steps into the corridor when a low card brings its corner badge close', async () => {
    await renderBoard();
    const xs = () => [...new Set(dots().map((dot) => dot.cx as number))].sort((a, b) => a - b);
    // Cartes hautes (124) : au milieu du filet de 2 dp, de chaque côté.
    expect(xs()).toEqual([363, 637]);
    // Cartes basses (7" couchée) : le point s'écarte des pastilles d'angle.
    ['o', 'u', 'e', 'moto', 'lune', 'melon'].forEach((label, index) => {
      const [cell] = measuredAncestors(screen.getByLabelText(label));
      layout(cell!, (index % 3) * 90, 364, 80);
    });
    const [left, right] = xs();
    expect(left).toBeGreaterThan(363);
    expect(right).toBeLessThan(637);
  });
});

describe('MatchPairsExercise — tirer un trait', () => {
  it('links a card to its partner by dragging, with the same effect as two taps', async () => {
    const { playAudio } = await renderBoard();
    // De « o » (gauche, rangée 0) jusqu'à « moto » (droite, rangée 0).
    await drag(200, rowY(0), 800, rowY(0));
    expect(screen.getByLabelText('o, paire 1')).toBeTruthy();
    expect(screen.getByLabelText('moto, paire 1')).toBeTruthy();
    expect(playAudio).toHaveBeenNthCalledWith(1, 'son-o');
    expect(playAudio).toHaveBeenNthCalledWith(2, 'mot-moto');
    // Le trait élastique a laissé place au trait de la paire.
    expect(screen.queryByTestId('relier-trait')).toBeNull();
    expect(screen.UNSAFE_getAllByType(Line)).toHaveLength(1);
  });

  it('starts from either side, and catches the eyelet in the corridor', async () => {
    await renderBoard();
    // De « lune » (droite, rangée 1) vers le point d'accroche de « u » (x ≈ 363).
    await drag(800, rowY(1), 380, rowY(1));
    expect(screen.getByLabelText('u, paire 1')).toBeTruthy();
    expect(screen.getByLabelText('lune, paire 1')).toBeTruthy();
  });

  it('retracts a line let go between the columns: nothing linked, the first card stays chosen', async () => {
    const { onSubmit } = await renderBoard();
    await drag(200, rowY(2), 500, rowY(1));
    expect(screen.getByLabelText('e')).toBeTruthy();
    expect(screen.queryByLabelText('e, paire 1')).toBeNull();
    expect(dots().filter((dot) => dot.fill === colors.brand)).toHaveLength(1);
    // La carte choisie attend sa partenaire : un toucher suffit.
    fireEvent.press(screen.getByLabelText('melon'));
    expect(screen.getByLabelText('e, paire 1')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('never links two cards of the same column, nor a card already linked', async () => {
    await renderBoard();
    await drag(200, rowY(0), 200, rowY(2));
    expect(screen.queryByLabelText('o, paire 1')).toBeNull();
    await drag(200, rowY(0), 800, rowY(0));
    expect(screen.getByLabelText('o, paire 1')).toBeTruthy();
    // « moto » est prise : « u » ne s'y accroche pas.
    await drag(200, rowY(1), 800, rowY(0));
    expect(screen.queryByLabelText('u, paire 2')).toBeNull();
  });

  it('submits once the last pair is drawn, by dragging or by tapping', async () => {
    const { onSubmit } = await renderBoard();
    await drag(200, rowY(0), 800, rowY(0));
    fireEvent.press(screen.getByLabelText('u'));
    fireEvent.press(screen.getByLabelText('lune'));
    expect(onSubmit).not.toHaveBeenCalled();
    await drag(800, rowY(2), 200, rowY(2));
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

  it('does not answer to a drag while it is not answering time', async () => {
    const { playAudio } = await renderBoard({ interactive: false });
    await drag(200, rowY(0), 800, rowY(0));
    expect(screen.queryByLabelText('o, paire 1')).toBeNull();
    expect(playAudio).not.toHaveBeenCalled();
  });
});

describe('MatchPairsExercise — la main qui montre le geste', () => {
  afterEach(() => jest.restoreAllMocks());

  it('shows the gesture once the board is measured, and goes at the first touch', async () => {
    await renderBoard();
    expect(screen.getByTestId('relier-demo', { includeHiddenElements: true })).toBeTruthy();
    fireEvent.press(screen.getByLabelText('u'));
    expect(screen.queryByTestId('relier-demo', { includeHiddenElements: true })).toBeNull();
    // Elle ne revient pas.
    fireEvent.press(screen.getByLabelText('lune'));
    expect(screen.queryByTestId('relier-demo', { includeHiddenElements: true })).toBeNull();
  });

  it('goes as soon as a finger lands on the board, before any card is pressed', async () => {
    await renderBoard();
    await act(async () => {
      fireGestureHandler<PanGesture>(getByGestureTestId('relier'), [
        { state: State.BEGAN, x: 500, y: rowY(1), translationX: 0, translationY: 0 },
        { state: State.FAILED, x: 500, y: rowY(1), translationX: 0, translationY: 0 },
      ]);
    });
    expect(screen.queryByTestId('relier-demo', { includeHiddenElements: true })).toBeNull();
  });

  it('becomes a still arrow, hand at rest, under reduced motion', async () => {
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(true);
    await renderBoard();
    expect(screen.getByTestId('relier-demo', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('relier-fleche')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('o'));
    expect(screen.queryByTestId('relier-fleche')).toBeNull();
  });

  it('is not shown while it is not answering time', async () => {
    await renderBoard({ interactive: false });
    expect(screen.queryByTestId('relier-demo', { includeHiddenElements: true })).toBeNull();
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
