import { StyleSheet, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AnswerVerdictContext } from '@/design-system/primitives';

import { TapValueExercise, tapColumns } from './tap-value-exercise';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions');
const mockedDimensions = useWindowDimensions as unknown as jest.Mock;

type TapStep = Extract<ExerciseStep, { type: 'tap_syllable' }>;

/** L'étape livrée cp1-lecture-l-2:3 : quatre syllabes, une seule entendue. */
const step: TapStep = {
  id: 'cp1-lecture-l-2-s3',
  skills: ['skill-son-l'],
  instruction: { text: 'Touche la syllabe que tu entends.', audioId: 'instr-touche-la-syllabe' },
  type: 'tap_syllable',
  audioId: 'syllabe-li',
  options: ['li', 'ra', 'pa', 'da'],
  target: 'li',
};

/** La hauteur demandée à la face d'une tuile. */
function faceHeightOf(label: string): number {
  let node: ReactTestInstance | null = screen.getByLabelText(label);
  while (node) {
    const flat = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>);
    if (flat && typeof flat.minHeight === 'number' && flat.minHeight > 100) {
      return flat.minHeight;
    }
    node =
      node.children.find((child): child is ReactTestInstance => typeof child !== 'string') ?? null;
  }
  throw new Error(`no tile face under ${label}`);
}

function renderAt(width: number, height: number, verdict: 'incorrect' | null = null) {
  mockedDimensions.mockReturnValue({ width, height, scale: 2, fontScale: 1 });
  const playAudio = jest.fn();
  const onSubmit = jest.fn();
  const board = (value: 'incorrect' | null) => (
    <AnswerVerdictContext.Provider value={value}>
      <TapValueExercise
        step={step}
        interactive
        onSubmit={onSubmit}
        playAudio={playAudio}
        playingAudioId={null}
      />
    </AnswerVerdictContext.Provider>
  );
  render(board(verdict));
  return {
    playAudio,
    onSubmit,
    rerender: (value: 'incorrect' | null) => screen.rerender(board(value)),
  };
}

describe('TapValueExercise', () => {
  it('stands the tiles on one row beside the listen pad of a landscape tablet', () => {
    expect(tapColumns(4, true)).toBe(4);
    expect(tapColumns(4, false)).toBe(2);
    expect(tapColumns(3, false)).toBe(3);
  });

  it('gives the tiles the common pad height beside the pad: tall cards, not strips', () => {
    renderAt(1180, 820);
    fireEvent(screen.getByTestId('exercise-anchor'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 1000, height: 575 } },
    });
    expect(faceHeightOf('li')).toBeGreaterThanOrEqual(230);
  });

  it('lets the chosen tile say its syllable during the retry, without answering', () => {
    const { playAudio, onSubmit, rerender } = renderAt(1180, 820);
    fireEvent.press(screen.getByLabelText('ra'));
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'value', value: 'ra' });
    rerender('incorrect');
    playAudio.mockClear();
    fireEvent.press(screen.getByLabelText('ra'));
    expect(playAudio).toHaveBeenCalledWith('syllabe-ra');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
