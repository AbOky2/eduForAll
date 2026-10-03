import { useWindowDimensions } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { EcolnaAnswerCard } from '@/design-system/primitives';

import { CountObjectsExercise } from './count-objects-exercise';
import { ILLUSTRATION_FILL } from './illustration-fit';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions');
const mockedDimensions = useWindowDimensions as unknown as jest.Mock;

type CountStep = Extract<ExerciseStep, { type: 'count_objects' }>;

function stepWith(count: number, options: number[]): CountStep {
  return {
    id: `count-${count}`,
    skills: ['skill-nombres'],
    instruction: { text: 'Compte les mangues.', audioId: 'instr-compte-les-mangues' },
    type: 'count_objects',
    illustrationId: 'icon-mango',
    objectName: 'mangues',
    count,
    options,
  };
}

/** Le premier ancêtre qui écoute sa mise en page. */
function measured(node: ReactTestInstance): ReactTestInstance {
  let current: ReactTestInstance | null = node;
  while (current && typeof current.props.onLayout !== 'function') {
    current = current.parent;
  }
  if (!current) {
    throw new Error('nothing measured around this node');
  }
  return current;
}

function layout(node: ReactTestInstance, width: number) {
  fireEvent(node, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height: 0 } } });
}

function renderCount(step: CountStep) {
  render(
    <CountObjectsExercise
      step={step}
      interactive
      onSubmit={jest.fn()}
      playAudio={jest.fn()}
      playingAudioId={null}
    />,
  );
}

describe('CountObjectsExercise', () => {
  beforeEach(() => {
    mockedDimensions.mockReturnValue({ width: 1180, height: 820, scale: 2, fontScale: 1 });
  });

  it('gives the numbers the proportions of a real card, not a slat', () => {
    renderCount(stepWith(1, [0, 1, 2]));
    // Le volet des réponses d'un iPad couché.
    layout(measured(screen.getByLabelText('0')), 479);
    for (const card of screen.UNSAFE_getAllByType(EcolnaAnswerCard)) {
      const width = (card.props.style as { width: number }).width;
      const height = (card.props.contentStyle as { height: number }).height;
      expect(height / width).toBeGreaterThanOrEqual(1.15);
      expect(height / width).toBeLessThanOrEqual(1.3);
    }
  });

  it('keeps a boosted object inside 76 % of the scene', () => {
    renderCount(stepWith(1, [0, 1, 2]));
    layout(measured(screen.getByLabelText('0')), 479);
    layout(measured(screen.getByLabelText('1 mangues')), 427);
    const [mango] = screen.UNSAFE_getAllByType(ObjectIcon);
    expect(mango?.props.size).toBeLessThanOrEqual(427 * ILLUSTRATION_FILL);
  });

  it('sets many objects in balanced rows that fit the scene', () => {
    renderCount(stepWith(12, [11, 12, 13]));
    layout(measured(screen.getByLabelText('12 mangues')), 427);
    const sizes = screen.UNSAFE_getAllByType(ObjectIcon).map((icon) => icon.props.size as number);
    expect(sizes).toHaveLength(12);
    const size = sizes[0] ?? 0;
    // Quatre par rangée, écarts compris, dans la largeur de la scène.
    expect(size * 4 + 3 * 16).toBeLessThanOrEqual(427);
  });
});
