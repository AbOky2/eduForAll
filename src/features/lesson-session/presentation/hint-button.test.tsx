import { StyleSheet, useWindowDimensions } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { HintButton } from './hint-button';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions');
const mockedDimensions = useWindowDimensions as unknown as jest.Mock;

/** Les largeurs des vues dessinées (la face du disque porte la sienne). */
function drawnWidths(): number[] {
  return screen.UNSAFE_root.findAll(
    (node) =>
      typeof node.type === 'string' &&
      typeof StyleSheet.flatten(node.props.style)?.width === 'number',
  ).map((node) => StyleSheet.flatten(node.props.style).width as number);
}

describe("l'ampoule d'indice", () => {
  beforeEach(() => {
    // Un iPad 11" couché : l'échelle de la tablette.
    mockedDimensions.mockReturnValue({ width: 1180, height: 820, scale: 2, fontScale: 1 });
  });

  it("cachée, elle n'est rien : la barre de progression va jusqu'à la gouttière", () => {
    render(<HintButton visible={false} diameter={78} onPress={jest.fn()} />);
    expect(screen.toJSON()).toBeNull();
  });

  it('offerte, elle prend le diamètre de la bouée de consigne', () => {
    render(<HintButton visible diameter={78} onPress={jest.fn()} />);
    expect(drawnWidths()).toContain(78);
  });

  it('se touche : elle ouvre l’indice', () => {
    const onPress = jest.fn();
    render(<HintButton visible diameter={64} onPress={onPress} />);
    fireEvent.press(screen.getByLabelText('Un indice'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
