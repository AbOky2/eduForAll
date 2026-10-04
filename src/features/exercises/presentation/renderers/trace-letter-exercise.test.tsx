import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { StyleSheet } from 'react-native';
import { State, type PanGesture } from 'react-native-gesture-handler';
import { fireGestureHandler, getByGestureTestId } from 'react-native-gesture-handler/jest-utils';

import type { ExerciseStep } from '@/content/schemas/exercise-schema';
import { colors } from '@/design-system/tokens';
import { fr } from '@/localization/fr/strings';

import { TraceLetterExercise } from './trace-letter-exercise';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
}));

type TraceStep = Extract<ExerciseStep, { type: 'trace_letter' }>;

const step = (letter: string, audioId?: string): TraceStep => ({
  id: `trace-${letter}`,
  type: 'trace_letter',
  letter,
  skills: ['skill-ecriture-lettres'],
  instruction: {
    text: 'Trace la lettre avec ton doigt.',
    audioId: 'instr-trace-la-lettre-avec-ton-doigt',
  },
  ...(audioId ? { audioId } : {}),
});

async function renderSlate(letter: string) {
  const onSubmit = jest.fn();
  const playAudio = jest.fn();
  render(
    <TraceLetterExercise
      step={step(letter, `lettre-${letter}`)}
      interactive
      onSubmit={onSubmit}
      playAudio={playAudio}
      playingAudioId={null}
    />,
  );
  // The slate only draws once it knows its size (a landscape iPad).
  fireEvent(screen.getByLabelText(fr.lesson.traceLetterLabel(letter)), 'layout', {
    nativeEvent: { layout: { x: 0, y: 0, width: 760, height: 482 } },
  });
  // Let the reduced-motion query settle.
  await act(async () => {});
  return { onSubmit, playAudio };
}

describe('TraceLetterExercise — the slate', () => {
  it('shows the letter to write, in its model chip (decorative for screen readers)', async () => {
    await renderSlate('a');
    expect(screen.queryByText('a')).toBeNull();
    expect(screen.getByText('a', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText(fr.lesson.traceLetterHint)).toBeTruthy();
  });

  it('numbers the strokes of a letter written in several strokes', async () => {
    await renderSlate('i');
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('sets each stroke number in white, on a glass pill readable on the night slate', async () => {
    await renderSlate('i');
    const number = screen.getByText('1');
    expect(StyleSheet.flatten(number.props.style)).toMatchObject({ color: colors.white });
    // La pastille : le premier ancêtre qui porte un fond.
    let node = number.parent;
    while (node && !StyleSheet.flatten(node.props.style)?.backgroundColor) {
      node = node.parent;
    }
    const pill = StyleSheet.flatten(node?.props.style) ?? {};
    expect(pill).toMatchObject({ backgroundColor: colors.onColorGlass });
    expect(pill.width).toBe(pill.height);
    expect(pill.borderRadius).toBe(Number(pill.width) / 2);
  });

  it('does not number a letter written in one stroke', async () => {
    await renderSlate('c');
    expect(screen.queryByText('1')).toBeNull();
  });

  it('traces the two-digit numbers of CP2 instead of declaring them unavailable', async () => {
    await renderSlate('10');
    expect(screen.getByText('10', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText(fr.errors.contentUnavailable)).toBeNull();
  });

  it('names the letter when it opens, and validates nothing before the letter is traced', async () => {
    const { onSubmit, playAudio } = await renderSlate('i');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(playAudio).toHaveBeenCalledTimes(1);
    expect(playAudio).toHaveBeenCalledWith('lettre-i');
  });

  it('celebrates a finished letter: a haptic, the letter said, then the step validated after 1.4 s', async () => {
    // Gesture Handler refreshes its callbacks in a microtask: only the clocks are faked.
    jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] });
    try {
      const { onSubmit, playAudio } = await renderSlate('i');
      // The board of renderSlate: side 426, left 167, top 28. The stem, then the dot.
      const touch = async (x: number, y: number) => {
        await act(async () => {
          fireGestureHandler<PanGesture>(getByGestureTestId('ardoise'), [
            { state: State.BEGAN, x, y },
            { state: State.END, x, y },
          ]);
        });
      };
      await touch(380, 28 + 0.34 * 426);
      await touch(380, 28 + 0.6 * 426);
      await touch(380, 28 + 0.85 * 426);
      expect(Haptics.notificationAsync).not.toHaveBeenCalled();
      await touch(380, 28 + 0.17 * 426);

      expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
      // Dite à l'ouverture, puis une seconde fois quand la lettre passe au soleil.
      expect(playAudio).toHaveBeenCalledTimes(2);
      expect(playAudio).toHaveBeenLastCalledWith('lettre-i');
      // No more hint, no more stroke numbers: the letter is done.
      expect(screen.queryByText(fr.lesson.traceLetterHint)).toBeNull();
      expect(screen.queryByText('2')).toBeNull();

      act(() => jest.advanceTimersByTime(1300));
      expect(onSubmit).not.toHaveBeenCalled();
      act(() => jest.advanceTimersByTime(200));
      expect(onSubmit).toHaveBeenCalledWith({ kind: 'trace', reachedAllCheckpoints: true });
    } finally {
      jest.useRealTimers();
    }
  });

  it('keeps an explicit way forward for a character it cannot trace', async () => {
    const onSubmit = jest.fn();
    render(
      <TraceLetterExercise
        step={step('?')}
        interactive
        onSubmit={onSubmit}
        playAudio={jest.fn()}
        playingAudioId={null}
      />,
    );
    await act(async () => {});
    expect(screen.getByText(fr.errors.contentUnavailable)).toBeTruthy();
    fireEvent.press(screen.getByText(fr.common.next));
    expect(onSubmit).toHaveBeenCalledWith({ kind: 'trace', reachedAllCheckpoints: true });
  });
});
