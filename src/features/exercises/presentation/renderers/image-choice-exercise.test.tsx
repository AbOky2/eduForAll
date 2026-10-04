import { StyleSheet, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactTestInstance } from 'react-test-renderer';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { ObjectIcon } from '@/design-system/illustrations/object-icons';
import { AnswerVerdictContext } from '@/design-system/primitives';

import {
  ImageChoiceExercise,
  imageCardHeight,
  imageCardRatio,
  imageColumns,
} from './image-choice-exercise';

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

/** La hauteur demandée à une carte (sa face). */
function cardHeightOf(label: string): number {
  let node: ReactTestInstance | null = screen.getByLabelText(label);
  while (node) {
    const flat = StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>);
    if (flat && typeof flat.minHeight === 'number' && flat.minHeight > 100) {
      return flat.minHeight;
    }
    node =
      node.children.find((child): child is ReactTestInstance => typeof child !== 'string') ?? null;
  }
  throw new Error(`no card face under ${label}`);
}

/** Le corps mesuré sous la consigne (l'ancre de l'exercice). */
function measureBody(width: number, height: number): void {
  fireEvent(screen.getByTestId('exercise-anchor'), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width, height } },
  });
}

describe('ImageChoiceExercise — l’image reste dans sa carte', () => {
  // Largeur extérieure réelle d'une case, filets compris, sur l'appareil de
  // démonstration : couchée, une rangée à côté du pavé d'écoute ; debout,
  // sous la bande ; au téléphone, deux plus une.
  it.each([
    ['1180×820', 2, 1180, 820, 381],
    ['1180×820', 3, 1180, 820, 245],
    ['1180×820', 4, 1180, 820, 177],
    ['820×1180', 2, 820, 1180, 349],
    ['820×1180', 3, 820, 1180, 225],
    ['820×1180', 4, 820, 1180, 349],
    ['390×844', 3, 390, 844, 167],
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
    const beside = width > height;
    const rows = Math.ceil(count / imageColumns(count, { beside, compact: width < 600 }));
    const cardHeight = Math.round(cell * imageCardRatio(rows, beside));
    for (const size of imageSizes()) {
      expect(size).toBeLessThanOrEqual(inner * 0.8);
      expect(size).toBeLessThan(cardHeight * 0.8);
      // Elle reste la vedette de la carte.
      expect(size).toBeGreaterThanOrEqual(inner * 0.45);
    }
    expect(before[0]).toBeLessThanOrEqual(inner * 0.8 + 1);
  });
});

describe('ImageChoiceExercise — une seule grammaire pour l’écoute', () => {
  it('lays the answers on one row beside the pad of a landscape tablet', () => {
    expect(imageColumns(3, { beside: true })).toBe(3);
    expect(imageColumns(4, { beside: true })).toBe(4);
    expect(imageColumns(4)).toBe(2);
    expect(imageColumns(6, { beside: true })).toBe(3);
    // Debout : une rangée de trois ; au téléphone, deux plus une.
    expect(imageColumns(3)).toBe(3);
    expect(imageColumns(3, { compact: true })).toBe(2);
  });

  it('never shows smaller pictures on the 11" iPad than on the 7" tablet', () => {
    const heightAt = (width: number, height: number, body: { width: number; height: number }) => {
      mockedDimensions.mockReturnValue({ width, height, scale: 2, fontScale: 1 });
      render(
        <ImageChoiceExercise
          step={stepWith(3)}
          interactive
          onSubmit={jest.fn()}
          playAudio={jest.fn()}
          playingAudioId={null}
        />,
      );
      measureBody(body.width, body.height);
      const cardHeight = cardHeightOf('école');
      screen.unmount();
      return cardHeight;
    };
    const tablet7 = heightAt(1024, 600, { width: 928, height: 376 });
    const ipad = heightAt(1180, 820, { width: 1000, height: 575 });
    expect(ipad).toBeGreaterThanOrEqual(tablet7);
    // Presque carrées sur l'iPad couché : au moins 230 dp de haut.
    expect(ipad).toBeGreaterThanOrEqual(230);
  });

  it('bounds the card by the measured room, never under the touch target', () => {
    const common = { rows: 1, gap: 26, fallback: 245, min: 94 };
    // Sans place mesurée : la silhouette de la carte.
    expect(imageCardHeight({ ...common, cellWidth: 316, room: 0 })).toBe(
      Math.round(316 * imageCardRatio(1)),
    );
    // Sous la bande d'écoute : la place restante.
    expect(imageCardHeight({ ...common, cellWidth: 316, room: 179 })).toBe(179);
    expect(imageCardHeight({ ...common, cellWidth: 316, room: 40 })).toBe(94);
  });

  it('lets the chosen card say its word during the retry, without answering again', () => {
    mockedDimensions.mockReturnValue({ width: 1180, height: 820, scale: 2, fontScale: 1 });
    const playAudio = jest.fn();
    const onSubmit = jest.fn();
    const board = (verdict: 'incorrect' | null, interactive: boolean) => (
      <AnswerVerdictContext.Provider value={verdict}>
        <ImageChoiceExercise
          step={stepWith(3)}
          interactive={interactive}
          onSubmit={onSubmit}
          playAudio={playAudio}
          playingAudioId={null}
        />
      </AnswerVerdictContext.Provider>
    );
    render(board(null, true));
    fireEvent.press(screen.getByLabelText('maître'));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    // La feuille « à revoir » se lit : la carte choisie est inerte.
    screen.rerender(board('incorrect', false));
    playAudio.mockClear();
    fireEvent.press(screen.getByLabelText('maître'));
    expect(playAudio).not.toHaveBeenCalled();

    // Les cartes se rouvrent : la carte marquée dit son mot, sans répondre.
    screen.rerender(board('incorrect', true));
    fireEvent.press(screen.getByLabelText('maître'));
    expect(playAudio).toHaveBeenCalledWith('mot-mai1tre');
    expect(onSubmit).toHaveBeenCalledTimes(1);
    // Une autre carte, elle, répond.
    fireEvent.press(screen.getByLabelText('ardoise'));
    expect(onSubmit).toHaveBeenLastCalledWith({ kind: 'choice', choiceId: 'ardoise' });
  });

  it('plays the word from anywhere on the listen pad', () => {
    mockedDimensions.mockReturnValue({ width: 1180, height: 820, scale: 2, fontScale: 1 });
    const playAudio = jest.fn();
    render(
      <ImageChoiceExercise
        step={stepWith(3)}
        interactive
        onSubmit={jest.fn()}
        playAudio={playAudio}
        playingAudioId={null}
      />,
    );
    playAudio.mockClear();
    fireEvent.press(screen.getByTestId('exercise-listen-pad'));
    expect(playAudio).toHaveBeenCalledWith('mot-e1cole');
  });
});
