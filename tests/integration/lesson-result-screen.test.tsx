import { StyleSheet, useWindowDimensions } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import LessonResultScreen from '../../app/(child)/lesson/result';

const mockReplace = jest.fn();
let mockNextLesson: string | null = 'cp1-langage-ecole-3';

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => ({
    stars: '2',
    lessonId: 'cp1-langage-ecole-2',
    badges: '',
  }),
}));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));
jest.mock('@/shared/hooks/use-focused-data', () => ({
  useFocusedData: () => mockNextLesson,
}));
jest.mock('@/database/connection/database', () => ({ getDatabase: jest.fn() }));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
jest.mock('react-native/Libraries/Utilities/useWindowDimensions');
const mockedDimensions = useWindowDimensions as unknown as jest.Mock;

/** Le style aplati du bouton nommé `label`. */
function buttonStyle(label: string) {
  return StyleSheet.flatten(screen.getByLabelText(label).props.style);
}

/** Le sens de la rangée pictogramme + libellé du bouton nommé `label`. */
function rowDirection(label: string): string | undefined {
  const rows = screen
    .getByLabelText(label)
    .findAll(
      (node) =>
        typeof node.type === 'string' &&
        typeof StyleSheet.flatten(node.props.style)?.flexDirection === 'string' &&
        node.findAll((child) => child.props.children === label).length > 0,
    );
  const innermost = rows[rows.length - 1];
  return innermost ? StyleSheet.flatten(innermost.props.style).flexDirection : undefined;
}

describe('la réussite', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockNextLesson = 'cp1-langage-ecole-3';
    // Un iPad 11" couché, l'appareil de démonstration.
    mockedDimensions.mockReturnValue({ width: 1180, height: 820, scale: 2, fontScale: 1 });
  });

  it('« Leçon suivante → » : la flèche suit le mot, et mène à la leçon suivante', () => {
    render(<LessonResultScreen />);
    expect(rowDirection('Leçon suivante')).toBe('row-reverse');
    fireEvent.press(screen.getByLabelText('Leçon suivante'));
    expect(mockReplace).toHaveBeenCalledWith('/(child)/lesson/cp1-langage-ecole-3');
  });

  it('« Continuer → » quand il n’y a plus de leçon à proposer', () => {
    mockNextLesson = null;
    render(<LessonResultScreen />);
    expect(rowDirection('Continuer')).toBe('row-reverse');
  });

  it('une seule action domine : « Rejouer » est un lien discret, centré, à sa largeur', () => {
    render(<LessonResultScreen />);
    const replay = buttonStyle('Rejouer');
    // Pas de surface (ni face soleil, ni verre) : un lien blanc sur la nuit.
    expect(replay.backgroundColor).toBeUndefined();
    expect(replay.alignSelf).toBe('center');
    // Toujours une cible d'enfant.
    expect(replay.minHeight).toBeGreaterThanOrEqual(64);
    // Reprise avant le mot ; il relance la même leçon.
    expect(rowDirection('Rejouer')).toBe('row');
    fireEvent.press(screen.getByLabelText('Rejouer'));
    expect(mockReplace).toHaveBeenCalledWith('/(child)/lesson/cp1-langage-ecole-2');
  });
});
