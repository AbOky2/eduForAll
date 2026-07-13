import { fireEvent, render, screen } from '@testing-library/react-native';

import { AlifaAnswerCard } from './alifa-answer-card';

describe('AlifaAnswerCard', () => {
  it('renders its label and submits on press', () => {
    const onPress = jest.fn();
    render(<AlifaAnswerCard label="ba" onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('ba'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('cannot be pressed while showing correctness feedback', () => {
    const onPress = jest.fn();
    render(<AlifaAnswerCard label="ma" state="correct" onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('ma'));
    expect(onPress).not.toHaveBeenCalled();
    expect(screen.getByLabelText('ma')).toHaveProp('accessibilityState', expect.objectContaining({ disabled: true }));
  });

  it('exposes the selected state to assistive technologies', () => {
    render(<AlifaAnswerCard label="ta" state="selected" onPress={jest.fn()} />);
    expect(screen.getByLabelText('ta')).toHaveProp(
      'accessibilityState',
      expect.objectContaining({ selected: true }),
    );
  });

  it('is dimmed and inert when disabled', () => {
    const onPress = jest.fn();
    render(<AlifaAnswerCard label="la" state="disabled" onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('la'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
