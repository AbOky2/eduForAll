import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SettingsScreen from '../../app/(settings)/index';
import PrivacyScreen from '../../app/(settings)/privacy';
import { asId } from '@/core/ids/ids';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import type { ChildProfile } from '@/features/child-profile/domain/child-profile';
import { fr } from '@/localization/fr/strings';

const mockUpdateLevel = jest.fn();
const mockFindById = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    dismissAll: jest.fn(),
    canGoBack: () => true,
  }),
}));
jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { version: '1.0.0' } } }));
jest.mock('@/database/connection/database', () => ({ getDatabase: () => Promise.resolve({}) }));
jest.mock('@/features/child-profile/infrastructure/child-profile-repository', () => ({
  createChildProfileRepository: () => ({ updateLevel: mockUpdateLevel, findById: mockFindById }),
}));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);

const AMINA: ChildProfile = {
  id: asId<'ChildProfileId'>('demo-amina'),
  firstName: 'Amina',
  avatarId: 'avatar-2',
  level: 'CP1',
  createdAt: '2026-09-01T08:00:00.000Z',
  updatedAt: '2026-09-01T08:00:00.000Z',
};

describe('les paramètres', () => {
  beforeEach(() => {
    mockUpdateLevel.mockReset().mockResolvedValue(undefined);
    mockFindById.mockReset().mockImplementation(() =>
      Promise.resolve({ ...AMINA, level: 'CP2', updatedAt: '2026-10-04T08:00:00.000Z' }),
    );
    useActiveProfile.getState().setProfile(AMINA);
  });

  it('n’affiche rien d’inachevé : ni rubrique « Langue », ni « Bientôt disponible »', () => {
    render(<SettingsScreen />);
    expect(screen.queryByText(/Langue/)).toBeNull();
    expect(screen.queryByText(/Arabe/)).toBeNull();
    expect(screen.queryByText(/Bientôt/)).toBeNull();
  });

  it('montre la classe de l’enfant actif', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Classe d’Amina')).toBeTruthy();
    expect(screen.getByLabelText(fr.settings.levelChoice.CP1).props.accessibilityState).toEqual({
      checked: true,
    });
    expect(screen.getByLabelText(fr.settings.levelChoice.CP2).props.accessibilityState).toEqual({
      checked: false,
    });
  });

  it('change la classe après confirmation, en gardant la progression', async () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByLabelText(fr.settings.levelChoice.CP2));

    // Rien ne change avant la confirmation, qui dit que rien n'est perdu.
    expect(mockUpdateLevel).not.toHaveBeenCalled();
    expect(screen.getByText(fr.settings.levelConfirmTitle('Amina', 'CP2'))).toBeTruthy();
    expect(screen.getByText(fr.settings.levelConfirmMessage('CP2'))).toBeTruthy();

    fireEvent.press(screen.getByText(fr.settings.levelConfirm('CP2')));
    await waitFor(() => expect(useActiveProfile.getState().profile?.level).toBe('CP2'));
    expect(mockUpdateLevel).toHaveBeenCalledWith(AMINA.id, 'CP2');
    // Le profil en mémoire est celui de la base (même enfant, nouvelle classe).
    expect(useActiveProfile.getState().profile).toMatchObject({ id: AMINA.id, firstName: 'Amina' });
    await waitFor(() =>
      expect(screen.queryByText(fr.settings.levelConfirmTitle('Amina', 'CP2'))).toBeNull(),
    );
    expect(screen.getByLabelText(fr.settings.levelChoice.CP2).props.accessibilityState).toEqual({
      checked: true,
    });
  });

  it('« Annuler » ne change rien', () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByLabelText(fr.settings.levelChoice.CP2));
    fireEvent.press(screen.getByText(fr.common.cancel));
    expect(mockUpdateLevel).not.toHaveBeenCalled();
    expect(useActiveProfile.getState().profile?.level).toBe('CP1');
    expect(screen.queryByText(fr.settings.levelConfirmTitle('Amina', 'CP2'))).toBeNull();
  });

  it('toucher la classe déjà choisie ne demande rien', () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByLabelText(fr.settings.levelChoice.CP1));
    expect(screen.queryByText(fr.settings.levelConfirmTitle('Amina', 'CP1'))).toBeNull();
  });

  it('« À propos » cite la source sans se dire conforme, et porte la mention d’indépendance', () => {
    render(<SettingsScreen />);
    expect(screen.getByText(fr.settings.aboutCompliance)).toBeTruthy();
    expect(screen.getByText(fr.settings.aboutSource)).toBeTruthy();
    expect(screen.getByText(fr.settings.aboutIndependence)).toBeTruthy();
    expect(screen.getByText(fr.settings.aboutLicences)).toBeTruthy();
    expect(screen.getByText(fr.settings.aboutLicencesAddress)).toBeTruthy();
    expect(screen.queryByText(/Conforme/i)).toBeNull();
  });
});

describe('l’écran Confidentialité', () => {
  it('donne l’adresse de la politique complète et le contact, en texte simple', () => {
    render(<PrivacyScreen />);
    for (const text of [
      fr.settings.privacyPolicyLabel,
      fr.settings.privacyPolicyAddress,
      fr.settings.privacyContactLabel,
      fr.settings.privacyContact,
    ]) {
      expect(screen.getByText(text)).toBeTruthy();
    }
    // Aucun lien : rien ne fait sortir de l'app (catégorie Enfants).
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(screen.getByText(fr.settings.privacyPolicyAddress).props.onPress).toBeUndefined();
  });
});
