import { fireEvent, render, screen } from '@testing-library/react-native';

import ParentGateScreen from '../../app/(parent)/gate';
import { useParentSession } from '@/features/parent-space/application/parent-session-store';
import { fr } from '@/localization/fr/strings';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, back: jest.fn(), canGoBack: () => true }),
}));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);

/** L'opération affichée, telle qu'un parent (ou Maestro) la lit. */
function question(): string {
  return String(screen.getByTestId('parent-gate-question').props.children);
}

/** Le produit de l'opération affichée : ce qu'un adulte écrit. */
function answer(): number {
  const [left, right] = (question().match(/\d+/g) ?? []).map(Number);
  return (left ?? 0) * (right ?? 0);
}

function submit(value: string) {
  fireEvent.changeText(screen.getByLabelText(fr.parent.gateQuestion), value);
  fireEvent.press(screen.getByText(fr.parent.gateEnter));
}

describe('la porte parentale', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    useParentSession.getState().lock();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('tire sa question au hasard : deux ouvertures ne posent pas forcément la même', () => {
    const random = jest.spyOn(Math, 'random');
    // Première ouverture : 7 × 6 ; seconde : 8 × 9.
    random.mockReturnValueOnce(0.25).mockReturnValueOnce(0);
    const first = render(<ParentGateScreen />);
    expect(question()).toBe(fr.parent.gateOperation(7, 6));
    first.unmount();

    random.mockReturnValueOnce(0.5).mockReturnValueOnce(0.75);
    render(<ParentGateScreen />);
    expect(question()).toBe(fr.parent.gateOperation(8, 9));
  });

  it('pose une multiplication de deux facteurs de 6 à 9, insécable', () => {
    render(<ParentGateScreen />);
    expect(question()).toMatch(/^[6-9] × [6-9] = \?$/);
  });

  it('une erreur change la question, vide le champ et le dit', () => {
    render(<ParentGateScreen />);
    const before = question();
    const expected = answer();
    submit(String(expected + 1));

    expect(screen.getByText(fr.parent.gateWrong)).toBeTruthy();
    expect(screen.getByLabelText(fr.parent.gateQuestion).props.value).toBe('');
    // Une AUTRE opération, d'un autre résultat.
    expect(question()).not.toBe(before);
    expect(answer()).not.toBe(expected);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(useParentSession.getState().unlocked).toBe(false);
  });

  it('la bonne réponse ouvre la session et le tableau de bord', () => {
    render(<ParentGateScreen />);
    // D'abord une erreur : la réponse attendue est celle de la NOUVELLE question.
    const first = answer();
    submit(String(first + 1));
    submit(String(answer()));

    expect(useParentSession.getState().unlocked).toBe(true);
    expect(mockReplace).toHaveBeenCalledWith('/(parent)/dashboard');
  });

  it('un champ vide ne compte pas comme une erreur', () => {
    render(<ParentGateScreen />);
    const before = question();
    fireEvent.press(screen.getByText(fr.parent.gateEnter));
    expect(screen.queryByText(fr.parent.gateWrong)).toBeNull();
    expect(question()).toBe(before);
  });

  it('garde le clavier numérique et n’accepte que des chiffres', () => {
    render(<ParentGateScreen />);
    const input = screen.getByLabelText(fr.parent.gateQuestion);
    expect(input.props.keyboardType).toBe('number-pad');
    fireEvent.changeText(input, '4a2.');
    expect(screen.getByLabelText(fr.parent.gateQuestion).props.value).toBe('42');
  });
});
