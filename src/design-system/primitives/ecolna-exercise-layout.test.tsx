import { Text, useWindowDimensions } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { fr } from '@/localization/fr/strings';

import {
  EcolnaExerciseLayout,
  answersRoom,
  feedbackSheetBite,
  fitAnswerHeight,
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

/** Le corps mesuré par la mise en page : la hauteur de l'ancre. */
function measureBody(height: number): void {
  fireEvent(screen.getByTestId('exercise-anchor'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 1000, height } },
  });
}

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
    // Grande tablette couchée : bande au-dessus de réponses sur une rangée.
    [1180, 820, 'band', true],
    // Tablette 7" couchée, trop basse pour empiler : un volet étroit.
    [1024, 600, 'pane', true],
    // Portrait et téléphone : on empile, la bande a la même forme.
    [820, 1180, 'band', false],
    [390, 844, 'band', false],
  ])('%i × %i : %s', (width, height, layout, wide) => {
    setWindow(width, height);
    render(<ListenProbe onListen={jest.fn()} />);
    expect(metricsNow().listenLayout).toBe(layout);
    expect(metricsNow().wide).toBe(wide);
  });

  it('keeps one pad shape from one exercise to the next', () => {
    setWindow(1024, 600);
    render(<ListenProbe onListen={jest.fn()} />);
    const pane = metricsNow().listenBand;
    // Le volet a une largeur fixe, celle du pavé d'écoute — pas un poids.
    expect(pane).toBe(Math.round(metricsNow().listenSize * 1.8));
  });
});

describe('useExerciseMetrics — taille sur la hauteur réelle', () => {
  it('knows nothing before the body is measured: the tiers apply', () => {
    setWindow(1180, 820);
    render(<ListenProbe onListen={jest.fn()} />);
    expect(metricsNow().block).toBe(0);
    expect(metricsNow().blockMax).toBe(0);
  });

  it('aims at about 60 % of the body on a large landscape tablet, above the feedback sheet', () => {
    setWindow(1180, 820);
    render(<ListenProbe onListen={jest.fn()} />);
    measureBody(575);
    const { block, blockMax, listenBand } = metricsNow();
    expect(block).toBeGreaterThanOrEqual(Math.round(575 * 0.5));
    expect(block).toBeLessThanOrEqual(Math.round(575 * 0.6));
    expect(block).toBeLessThanOrEqual(blockMax);
    // Air 1:1,25 : le bas du bloc reste au-dessus de la feuille de retour.
    const bite = feedbackSheetBite(true, 1.3);
    const bottom = (575 - block) / 2.25 + block;
    expect(bottom).toBeLessThanOrEqual(575 - bite);
    // La bande laisse aux réponses plus de la moitié du bloc.
    expect(answersRoom(metricsNow(), true)).toBeGreaterThan(block / 2);
    expect(listenBand).toBeLessThan(block / 2);
  });

  it('keeps the tiers on a 7" tablet but still caps the block above the sheet', () => {
    setWindow(1024, 600);
    render(<ListenProbe onListen={jest.fn()} />);
    measureBody(376);
    expect(metricsNow().block).toBe(0);
    expect(metricsNow().blockMax).toBeGreaterThan(0);
    expect(metricsNow().blockMax).toBeLessThanOrEqual(376 - feedbackSheetBite(true, 1.15));
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
