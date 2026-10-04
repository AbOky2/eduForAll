import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { shadows } from '../tokens';
import { AnswerVerdictContext, EcolnaAnswerCard, useAnswerCardState } from './ecolna-answer-card';

/** Les vues qui portent l'ombre posée d'une carte. */
function restingShadows(): number {
  return screen.UNSAFE_root.findAll(
    (node) =>
      typeof node.type === 'string' &&
      StyleSheet.flatten(node.props.style)?.boxShadow === shadows.card.boxShadow,
  ).length;
}

describe('EcolnaAnswerCard', () => {
  it('renders its label and submits on press', () => {
    const onPress = jest.fn();
    render(<EcolnaAnswerCard label="ba" onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('ba'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('cannot be pressed while showing correctness feedback', () => {
    const onPress = jest.fn();
    render(<EcolnaAnswerCard label="ma" state="correct" onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('ma'));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByLabelText('ma')).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ disabled: true }),
    );
  });

  it('exposes the selected state to assistive technologies', () => {
    render(<EcolnaAnswerCard label="ta" state="selected" onPress={jest.fn()} />);
    expect(screen.getByLabelText('ta')).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ selected: true }),
    );
  });

  it('is inert when disabled', () => {
    const onPress = jest.fn();
    render(<EcolnaAnswerCard label="la" state="disabled" onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('la'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('keeps its resting shadow while inert: waiting, not switched off', () => {
    render(<EcolnaAnswerCard label="la" state="disabled" onPress={jest.fn()} />);
    expect(restingShadows()).toBe(1);
  });
});

describe('useAnswerCardState', () => {
  function Probe({ interactive, picked }: { interactive: boolean; picked: boolean }) {
    const cardState = useAnswerCardState(interactive);
    return (
      <EcolnaAnswerCard
        label={picked ? 'choisie' : 'autre'}
        state={cardState(picked)}
        onPress={jest.fn()}
      />
    );
  }
  const board = (interactive: boolean, verdict: 'correct' | 'incorrect' | null) =>
    render(
      <AnswerVerdictContext.Provider value={verdict}>
        <Probe interactive={interactive} picked />
        <Probe interactive={interactive} picked={false} />
      </AnswerVerdictContext.Provider>,
    );

  it('keeps the verdict on the chosen card when the cards reopen after « à revoir »', () => {
    board(true, 'incorrect');
    // La carte choisie garde sa marque et reste inerte ; l'autre se touche.
    expect(screen.getByLabelText('choisie')).toBeDisabled();
    expect(screen.getByLabelText('autre')).not.toBeDisabled();
  });

  it('opens every card while the child answers, and freezes them during the verdict', () => {
    board(true, null);
    expect(screen.getByLabelText('choisie')).not.toBeDisabled();
    expect(screen.getByLabelText('autre')).not.toBeDisabled();
    screen.unmount();
    board(false, 'correct');
    expect(screen.getByLabelText('choisie')).toBeDisabled();
    expect(screen.getByLabelText('autre')).toBeDisabled();
  });
});
