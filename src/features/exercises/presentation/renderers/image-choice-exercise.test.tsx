import { useWindowDimensions } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';

import { ImageChoiceExercise, imageCardRatio } from './image-choice-exercise';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions');
const mockedDimensions = useWindowDimensions as unknown as jest.Mock;

type ImageStep = Extract<ExerciseStep, { type: 'image_multiple_choice' }>;

const CHOICES = [
  { id: 'école', illustrationId: 'icon-school', label: 'école' },
  { id: 'maître', illustrationId: 'icon-teacher', label: 'maître' },
  { id: 'ardoise', illustrationId: 'icon-slate', label: 'ardoise' },
  { id: 'mangue', illustrationId: 'icon-mango', label: 'mangue' },
];

function stepWith(count: number): ImageStep {
  return {
    id: `image-${count}`,
    skills: ['skill-langage-ecole'],
    instruction: {
      text: 'Touche l’image du mot que tu entends.',
      audioId: 'instr-touche-l-image-du-mot-que-tu-entends',
    },
    type: 'image_multiple_choice',
    audioId: 'mot-e1cole',
    choices: CHOICES.slice(0, count),
    correctChoiceId: 'école',
  };
}

/** La case mesurée : le premier ancêtre de la carte qui écoute sa mise en page. */
function cellOf(card: ReactTestInstance): ReactTestInstance {
  let node: ReactTestInstance | null = card;
  while (node && typeof node.props.onLayout !== 'function') {
    node = node.parent;
  }
  if (!node) {
    throw new Error('no measured cell around the card');
  }
  return node;
}

/** Tailles demandées aux images (toutes égales). */
function imageSizes(): number[] {
  return screen.UNSAFE_getAllByType(ObjectIcon).map((icon) => icon.props.size as number);
}

describe('ImageChoiceExercise — l’image reste dans sa carte', () => {
  // Largeur extérieure réelle d'une case, filets compris, sur l'appareil de démonstration.
  it.each([
    ['1180×820', 2, 1180, 820, 317],
    ['1180×820', 3, 1180, 820, 203],
    ['1180×820', 4, 1180, 820, 317],
    ['820×1180', 2, 820, 1180, 349],
    ['820×1180', 3, 820, 1180, 225],
    ['820×1180', 4, 820, 1180, 349],
  ])('%s, %i choix', (_, count, width, height, cell) => {
    mockedDimensions.mockReturnValue({ width, height, scale: 2, fontScale: 1 });
    render(
      <ImageChoiceExercise
        step={stepWith(count)}
        interactive
        onSubmit={jest.fn()}
        playAudio={jest.fn()}
        playingAudioId={null}
      />,
    );

    // Avant la mesure, le repli ne déborde pas : la taille de base, jamais × 1,6.
    const before = imageSizes();
    expect(new Set(before).size).toBe(1);

    fireEvent(cellOf(screen.getByLabelText('école')), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: cell, height: 0 } },
    });

    const inner = cell - 4;
    const rows = count === 4 ? 2 : 1;
    const cardHeight = Math.round(cell * imageCardRatio(rows));
    for (const size of imageSizes()) {
      expect(size).toBeLessThanOrEqual(inner * 0.8);
      expect(size).toBeLessThan(cardHeight * 0.8);
      // Elle reste la vedette de la carte.
      expect(size).toBeGreaterThanOrEqual(inner * 0.45);
    }
    expect(before[0]).toBeLessThanOrEqual(inner * 0.8 + 1);
  });
});
