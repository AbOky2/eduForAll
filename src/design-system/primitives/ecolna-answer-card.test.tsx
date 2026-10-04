import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { colors, shadows } from '../tokens';
import {
  AnswerVerdictContext,
  EcolnaAnswerCard,
  useAnswerCardState,
  useAnswerEcho,
} from './ecolna-answer-card';

/** Le filet de la face d'une carte (la vue qui porte l'ombre posée ou le verdict). */
function faceBorders(): string[] {
  return screen.UNSAFE_root.findAll(
    (node) =>
      typeof node.type === 'string' &&
      typeof StyleSheet.flatten(node.props.style)?.borderColor === 'string',
  ).map((node) => StyleSheet.flatten(node.props.style).borderColor as string);
}

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

  it('keeps the resting border while inert, after « juste » as after « à revoir »', () => {
    render(<EcolnaAnswerCard label="la" state="disabled" onPress={jest.fn()} />);
    expect(faceBorders()).toEqual([colors.borderStrong]);
    screen.unmount();
    render(<EcolnaAnswerCard label="la" onPress={jest.fn()} />);
    expect(faceBorders()).toEqual([colors.borderStrong]);
  });
});

describe('EcolnaAnswerCard — la carte marquée « à revoir »', () => {
  const marked = (onPress: () => void, onEcho?: () => void) =>
    render(
      <AnswerVerdictContext.Provider value="incorrect">
        <EcolnaAnswerCard label="maître" state="selected" onPress={onPress} onEcho={onEcho} />
      </AnswerVerdictContext.Provider>,
    );

  it('stays inert without an echo (the verdict sheet is being read)', () => {
    const onPress = jest.fn();
    marked(onPress);
    fireEvent.press(screen.getByLabelText('maître'));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByLabelText('maître')).toBeDisabled();
  });

  it('says itself again when touched during the retry, without answering', () => {
    const onPress = jest.fn();
    const onEcho = jest.fn();
    marked(onPress, onEcho);
    const card = screen.getByLabelText('maître');
    expect(card).not.toBeDisabled();
    fireEvent.press(card);
    expect(onEcho).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
    // Le visuel « à revoir » reste : la flèche de reprise, le bleu.
    expect(faceBorders()).toEqual([colors.brand]);
  });

  it('ignores an echo on any other state', () => {
    const onPress = jest.fn();
    const onEcho = jest.fn();
    render(<EcolnaAnswerCard label="ma" onPress={onPress} onEcho={onEcho} />);
    fireEvent.press(screen.getByLabelText('ma'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onEcho).not.toHaveBeenCalled();
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
    // La carte choisie garde sa marque et ne répond plus ; l'autre se touche.
    expect(screen.getByLabelText('choisie')).toBeDisabled();
    expect(screen.getByLabelText('autre')).not.toBeDisabled();
  });

  it('does not keep the previous choice « selected » under the hint sheet', () => {
    board(false, null);
    // Sous la feuille d'indice : aucune carte ne se dit choisie.
    expect(screen.getByLabelText('choisie')).not.toBeSelected();
    expect(screen.getByLabelText('choisie')).toBeDisabled();
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

describe('useAnswerEcho', () => {
  function Probe({ interactive, picked }: { interactive: boolean; picked: boolean }) {
    const echo = useAnswerEcho(interactive);
    return <>{echo(picked) ? <EcolnaAnswerCard label="écho" onPress={jest.fn()} /> : null}</>;
  }
  const echoes = (interactive: boolean, verdict: 'correct' | 'incorrect' | null, picked = true) => {
    render(
      <AnswerVerdictContext.Provider value={verdict}>
        <Probe interactive={interactive} picked={picked} />
      </AnswerVerdictContext.Provider>,
    );
    const found = screen.queryByLabelText('écho') !== null;
    screen.unmount();
    return found;
  };

  it('opens only for the chosen card, only while the cards reopen after « à revoir »', () => {
    expect(echoes(true, 'incorrect')).toBe(true);
    expect(echoes(true, 'incorrect', false)).toBe(false);
    // La feuille se lit (cartes figées), le verdict est « juste », ou l'on répond.
    expect(echoes(false, 'incorrect')).toBe(false);
    expect(echoes(false, 'correct')).toBe(false);
    expect(echoes(true, null)).toBe(false);
  });
});
