import { useWindowDimensions } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { AnswerVerdictContext } from '@/design-system/primitives';
import { fr } from '@/localization/fr/strings';

import { ChoiceExercise, choiceColumns } from './choice-exercise';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions');
const mockedDimensions = useWindowDimensions as unknown as jest.Mock;

type ChoiceStep = Extract<ExerciseStep, { type: 'audio_multiple_choice' }>;

/** L'étape livrée cp1-lecture-l-2:1 : trois syllabes à reconnaître à l'oreille. */
const step: ChoiceStep = {
  id: 'cp1-lecture-l-2-s1',
  skills: ['skill-son-l'],
  instruction: { text: 'Touche la syllabe que tu entends.', audioId: 'instr-touche-la-syllabe' },
  type: 'audio_multiple_choice',
  audioId: 'syl-la',
  layout: 'grid',
  choices: [
    { id: 'la', label: 'la' },
    { id: 'ba', label: 'ba' },
    { id: 'ma', label: 'ma' },
  ],
  correctChoiceId: 'la',
};

describe('ChoiceExercise', () => {
  it('puts the answers in explicit rows that span the column', () => {
    // À côté du pavé d'une tablette couchée : une grille tient sur une rangée…
    expect(choiceColumns(4, { beside: true, grid: true })).toBe(4);
    // … et une liste de phrases garde une phrase par rangée.
    expect(choiceColumns(3, { beside: true, grid: false })).toBe(1);
    // Ailleurs : une grille de deux ou trois, une liste d'une par rangée.
    expect(choiceColumns(3, { beside: false, grid: true })).toBe(3);
    expect(choiceColumns(4, { beside: false, grid: true })).toBe(2);
    expect(choiceColumns(3, { beside: false, grid: false })).toBe(1);
  });

  it('replays the sound from the listen pad and submits the touched card', () => {
    mockedDimensions.mockReturnValue({ width: 1180, height: 820, scale: 2, fontScale: 1 });
    const playAudio = jest.fn();
    const onSubmit = jest.fn();
    render(
      <ChoiceExercise
        step={step}
        interactive
        onSubmit={onSubmit}
        playAudio={playAudio}
        playingAudioId={null}
      />,
    );
    expect(playAudio).toHaveBeenCalledWith('syl-la');
    expect(screen.getAllByLabelText(fr.common.listen)).toHaveLength(1);
    fireEvent.press(screen.getByLabelText(fr.common.listen));
    expect(playAudio).toHaveBeenCalledTimes(2);
    fireEvent.press(screen.getByLabelText('ba'));
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'choice', choiceId: 'ba' });
  });

  it('lets the chosen syllable say itself during the retry, in the voice of the stimulus', () => {
    mockedDimensions.mockReturnValue({ width: 1180, height: 820, scale: 2, fontScale: 1 });
    const playAudio = jest.fn();
    const onSubmit = jest.fn();
    const board = (verdict: 'incorrect' | null) => (
      <AnswerVerdictContext.Provider value={verdict}>
        <ChoiceExercise
          step={{ ...step, audioId: 'syllabe-la' }}
          interactive
          onSubmit={onSubmit}
          playAudio={playAudio}
          playingAudioId={null}
        />
      </AnswerVerdictContext.Provider>
    );
    render(board(null));
    fireEvent.press(screen.getByLabelText('ma'));
    screen.rerender(board('incorrect'));
    playAudio.mockClear();
    fireEvent.press(screen.getByLabelText('ma'));
    expect(playAudio).toHaveBeenCalledWith('syllabe-ma');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
