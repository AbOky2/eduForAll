import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { FeedbackBanner } from './feedback-banner';

jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);

/** Le sens de la rangée pictogramme + libellé du bouton nommé `label`. */
function buttonRowDirection(label: string): string | undefined {
  const button = screen.getByLabelText(label);
  const row = button.findAll(
    (node) =>
      typeof node.type === 'string' &&
      typeof StyleSheet.flatten(node.props.style)?.flexDirection === 'string' &&
      node.findAll((child) => child.props.children === label).length > 0,
  );
  const innermost = row[row.length - 1];
  return innermost ? StyleSheet.flatten(innermost.props.style).flexDirection : undefined;
}

describe('la feuille de retour', () => {
  it('« Continuer → » : la flèche suit le mot, dans le sens de la marche', () => {
    const onAction = jest.fn();
    render(
      <FeedbackBanner
        kind="correct"
        message="Oui, c’est ça !"
        actionLabel="Continuer"
        onAction={onAction}
      />,
    );
    expect(buttonRowDirection('Continuer')).toBe('row-reverse');
    fireEvent.press(screen.getByLabelText('Continuer'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('après trop d’essais, on avance aussi : flèche après le mot', () => {
    render(
      <FeedbackBanner
        kind="incorrect"
        moveOn
        message="On continue."
        actionLabel="Continuer"
        onAction={jest.fn()}
      />,
    );
    expect(buttonRowDirection('Continuer')).toBe('row-reverse');
  });

  it('« ↻ Réessayer » : la reprise précède le mot', () => {
    render(
      <FeedbackBanner
        kind="incorrect"
        message="On réessaie, tout doucement."
        actionLabel="Réessayer"
        onAction={jest.fn()}
      />,
    );
    expect(buttonRowDirection('Réessayer')).toBe('row');
  });
});
