import { Text, useWindowDimensions } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { fr } from '@/localization/fr/strings';

import {
  EcolnaExerciseLayout,
  PANE_CARD_RATIO,
  answersRoom,
  feedbackSheetBite,
  fitAnswerHeight,
  listenAnswerHeight,
  listenCellWidth,
  useExerciseMetrics,
  type ExerciseMetrics,
} from './ecolna-exercise-layout';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions');
const mockedDimensions = useWindowDimensions as unknown as jest.Mock;

function setWindow(width: number, height: number): void {
  mockedDimensions.mockReturnValue({ width, height, scale: 2, fontScale: 1 });
}

type SeenMetrics = Omit<ExerciseMetrics, 'onBodyLayout' | 'answerGlyph'>;

/** Un exercice d'écoute seule, comme les renderers l'écrivent ; ses mesures en clair. */
function ListenProbe({ onListen }: { onListen: () => void }) {
  const { onBodyLayout: _measure, answerGlyph: _glyph, ...metrics } = useExerciseMetrics();
  return (
    <>
      <Text testID="metrics">{JSON.stringify(metrics)}</Text>
      <EcolnaExerciseLayout
        metrics={{ ...metrics, answerGlyph: _glyph, onBodyLayout: _measure }}
        answers={<Text>réponses</Text>}
        listen={{ playing: false, onPress: onListen }}
      />
    </>
  );
}

/** Le corps mesuré par la mise en page : l'ancre (la colonne de l'exercice). */
function measureBody(height: number, width = 1000): void {
  fireEvent(screen.getByTestId('exercise-anchor'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  });
}

/** Le corps réel sous la consigne, mesuré sur le banc : iPad 11" et 7" couchés. */
const IPAD_BODY = { width: 1000, height: 575 };
const TAB7_BODY = { width: 928, height: 376 };

function metricsNow(): SeenMetrics {
  return JSON.parse(screen.getByTestId('metrics').props.children as string) as SeenMetrics;
}

describe('EcolnaExerciseLayout — écoute seule', () => {
  it('makes the whole listen pad one button, not a button inside a button', () => {
    setWindow(1180, 820);
    const onListen = jest.fn();
    render(<ListenProbe onListen={onListen} />);
    // Un seul « Écouter » : le disque n'est qu'une image dans le pavé.
    const buttons = screen.getAllByLabelText(fr.common.listen);
    expect(buttons).toHaveLength(1);
    fireEvent.press(buttons[0]!);
    expect(onListen).toHaveBeenCalledTimes(1);
  });

  it.each([
    // Couché, quelle que soit la tablette : le pavé à côté des réponses.
    [1180, 820, 'pane', true],
    [1024, 600, 'pane', true],
    // Debout et au téléphone : on empile, la bande a la même forme.
    [820, 1180, 'band', false],
    [390, 844, 'band', false],
  ])('%i × %i : %s', (width, height, layout, wide) => {
    setWindow(width, height);
    render(<ListenProbe onListen={jest.fn()} />);
    expect(metricsNow().listenLayout).toBe(layout);
    expect(metricsNow().wide).toBe(wide);
  });

  it('keeps one pad shape from one exercise to the next', () => {
    for (const [width, height] of [
      [1024, 600],
      [1180, 820],
    ] as const) {
      setWindow(width, height);
      render(<ListenProbe onListen={jest.fn()} />);
      const { listenBand, listenDisc, listenSize } = metricsNow();
      // Le volet a une largeur fixe, réglée sur son disque — pas un poids.
      expect(listenBand).toBe(Math.round(listenDisc * 1.42));
      expect(listenDisc).toBeLessThanOrEqual(listenSize);
      screen.unmount();
    }
  });

  it('shows bigger answers on the 11" iPad than on the 7" tablet, nearly square', () => {
    setWindow(1024, 600);
    render(<ListenProbe onListen={jest.fn()} />);
    measureBody(TAB7_BODY.height, TAB7_BODY.width);
    const small = metricsNow();
    screen.unmount();
    setWindow(1180, 820);
    render(<ListenProbe onListen={jest.fn()} />);
    measureBody(IPAD_BODY.height, IPAD_BODY.width);
    const large = metricsNow();

    expect(large.paneHeight).toBeGreaterThanOrEqual(small.paneHeight);
    expect(large.paneHeight).toBeGreaterThanOrEqual(230);
    // Trois cartes à côté du pavé : presque carrées, jamais des bandeaux.
    for (const metrics of [small, large]) {
      const cell = listenCellWidth(metrics, 3, true);
      expect(cell).toBeGreaterThanOrEqual(220);
      expect(metrics.paneHeight / cell).toBeGreaterThanOrEqual(1);
      expect(metrics.paneHeight / cell).toBeLessThanOrEqual(PANE_CARD_RATIO + 0.01);
      // Le pavé, plus étroit qu'une carte : les réponses restent la vedette.
      expect(metrics.listenBand).toBeLessThan(cell);
      // Jamais sous la feuille de retour.
      expect(metrics.paneHeight).toBeLessThanOrEqual(metrics.blockMax);
    }
  });
});

describe('useExerciseMetrics — taille sur la hauteur réelle', () => {
  it('knows nothing before the body is measured: the tiers apply', () => {
    setWindow(1180, 820);
    render(<ListenProbe onListen={jest.fn()} />);
    expect(metricsNow().block).toBe(0);
    expect(metricsNow().blockMax).toBe(0);
  });

  it('aims at about 70 % of the body, never under the feedback sheet', () => {
    setWindow(1180, 820);
    render(<ListenProbe onListen={jest.fn()} />);
    measureBody(IPAD_BODY.height);
    const { block, blockMax } = metricsNow();
    expect(block).toBe(Math.round(575 * 0.7));
    expect(block).toBeLessThanOrEqual(blockMax);
    // L'ancre garde la morsure de la feuille sous le bloc : il y tient.
    expect(block).toBeLessThanOrEqual(575 - feedbackSheetBite(true, 1.3));
  });

  it('leaves the answers most of the block under the band when stacked', () => {
    setWindow(820, 1180);
    render(<ListenProbe onListen={jest.fn()} />);
    measureBody(930, 720);
    const { block, listenBand, listenDisc, listenSize } = metricsNow();
    expect(block).toBe(Math.round(930 * 0.7));
    expect(listenDisc).toBeLessThanOrEqual(listenSize);
    expect(listenBand).toBeLessThan(block / 3);
    expect(answersRoom(metricsNow(), true)).toBeGreaterThan(block / 2);
  });

  it('caps the block above the sheet on a short 7" tablet', () => {
    setWindow(1024, 600);
    render(<ListenProbe onListen={jest.fn()} />);
    measureBody(TAB7_BODY.height, TAB7_BODY.width);
    const { block, blockMax } = metricsNow();
    expect(blockMax).toBeGreaterThan(0);
    expect(blockMax).toBeLessThanOrEqual(376 - feedbackSheetBite(true, 1.15));
    // 70 % du corps passerait sous la feuille : le plafond l'emporte, moins
    // le filet d'air que la mise en page garde au-dessus de la feuille.
    expect(block).toBeLessThan(Math.round(376 * 0.7));
    expect(block).toBeLessThan(blockMax);
    expect(block).toBeGreaterThan(blockMax - 20);
  });

  it('settles after one measurement: a stable body does not re-render the sizes', () => {
    setWindow(1180, 820);
    render(<ListenProbe onListen={jest.fn()} />);
    measureBody(575);
    const first = metricsNow();
    measureBody(575.4);
    expect(metricsNow().block).toBe(first.block);
  });
});

describe('listenAnswerHeight — une silhouette de carte, pas un bandeau', () => {
  const stacked = {
    listenLayout: 'band' as const,
    listenBand: 161,
    gap: 23,
    splitGap: 28,
    columnWidth: 720,
    block: 651,
    blockMax: 808,
    paneHeight: 0,
  };

  it('takes the common pad height beside the pad, on one row', () => {
    const beside = { ...stacked, listenLayout: 'pane' as const, listenBand: 170, paneHeight: 264 };
    expect(listenAnswerHeight(beside, { columns: 4, rows: 1, preferred: 161, min: 94 })).toBe(264);
    // Une liste de phrases à côté du pavé garde sa hauteur de phrase.
    expect(
      listenAnswerHeight(beside, { columns: 1, rows: 3, preferred: 161, min: 94, ratio: 0 }),
    ).toBe(161);
  });

  it('makes stacked grid cards nearly square, within the measured room', () => {
    // 2 × 2 sous la bande d'un iPad debout : plus des bandeaux de 2,4:1.
    const height = listenAnswerHeight(stacked, { columns: 2, rows: 2, preferred: 143, min: 83 });
    const cell = listenCellWidth(stacked, 2, false);
    expect(height).toBeGreaterThan(200);
    expect(cell / height).toBeLessThan(1.7);
    // Jamais au-delà de la place sous la bande.
    expect(2 * height + stacked.gap).toBeLessThanOrEqual(answersRoom(stacked, true));
  });

  it('keeps the preferred size before the column is measured', () => {
    const unmeasured = { ...stacked, columnWidth: 0, block: 0, blockMax: 0 };
    expect(listenAnswerHeight(unmeasured, { columns: 3, rows: 1, preferred: 143, min: 83 })).toBe(
      143,
    );
  });
});

describe('answersRoom and fitAnswerHeight', () => {
  const base = { listenLayout: 'band' as const, listenBand: 140, gap: 26 };

  it('takes the band out of the room only for a listen-only exercise', () => {
    const metrics = { ...base, block: 345, blockMax: 430 };
    expect(answersRoom(metrics, true)).toBe(345 - 140 - 26);
    expect(answersRoom(metrics, false)).toBe(345);
    expect(answersRoom(metrics, false, 'max')).toBe(430);
    expect(answersRoom({ ...base, block: 0, blockMax: 0 }, true)).toBe(0);
    // Côte à côte (7"), le volet n'enlève rien à la hauteur.
    expect(answersRoom({ ...base, listenLayout: 'pane', block: 0, blockMax: 254 }, true)).toBe(254);
  });

  it('fills one row under the band, shrinks rows elsewhere, never under the touch target', () => {
    const common = { preferred: 161, gap: 26, min: 94 };
    expect(fitAnswerHeight({ ...common, room: 0, rows: 2 })).toBe(161);
    expect(fitAnswerHeight({ ...common, room: 179, rows: 1, grow: true })).toBe(179);
    expect(fitAnswerHeight({ ...common, room: 300, rows: 2 })).toBe(137);
    expect(fitAnswerHeight({ ...common, room: 120, rows: 3 })).toBe(94);
  });
});
