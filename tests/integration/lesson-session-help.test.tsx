import { useWindowDimensions } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { asId } from '@/core/ids/ids';
import { useActiveProfile } from '@/features/child-profile/application/active-profile-store';
import { useSettings } from '@/features/settings/application/settings-store';

import LessonSessionScreen from '../../app/(child)/lesson/[lessonId]';

/**
 * L'aide qui aide, sur le vrai écran de leçon et une vraie étape du programme
 * (cp1-lecture-l-2, « Touche la syllabe que tu entends », cible « li ») :
 * « Réessayer » rejoue la syllabe ; l'indice dit sa phrase, puis la syllabe.
 */
const mockLessonId = 'cp1-lecture-l-2';
const mockStepIndex = 3;
const SYLLABLE = 'syllabe-li';
const HINT = 'hint-e1coute-encore-quelle-est-la-premie2re-lettre';
const INSTRUCTION = 'instr-touche-la-syllabe-que-tu-entends';

const mockAudio = {
  preload: jest.fn(() => Promise.resolve()),
  play: jest.fn((_audioId: string) => Promise.resolve()),
  playSequence: jest.fn((_audioIds: readonly string[]) => Promise.resolve()),
  justStarted: jest.fn((_withinMs: number): string | null => null),
  replay: jest.fn(() => Promise.resolve()),
  pause: jest.fn(),
  stop: jest.fn(),
  setPlaybackRate: jest.fn(),
  dispose: jest.fn(),
};

jest.mock('@/features/audio/application/learning-audio-service', () => ({
  createLearningAudioService: () => mockAudio,
}));
jest.mock('@/database/connection/database', () => ({
  getDatabase: () => Promise.resolve({}),
}));
jest.mock('@/features/progress/infrastructure/progress-repository', () => ({
  createProgressRepository: () => ({
    findLessonProgress: () =>
      Promise.resolve({ status: 'in_progress', currentStepIndex: mockStepIndex }),
    saveStepReached: () => Promise.resolve(),
    recordAttempt: () => Promise.resolve(),
  }),
}));
jest.mock('@/features/progress/application/record-lesson-completion', () => ({
  recordLessonCompletion: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ lessonId: mockLessonId }),
}));
// Mouvement réduit : l'écran sans ressorts ni pulsations, que ce test ne regarde pas.
jest.mock('@/design-system/accessibility/use-reduced-motion', () => ({
  useReducedMotion: () => true,
}));
jest.mock(
  'react-native-safe-area-context',
  () => jest.requireActual('react-native-safe-area-context/jest/mock').default,
);
jest.mock('react-native/Libraries/Utilities/useWindowDimensions');
const mockedDimensions = useWindowDimensions as unknown as jest.Mock;

/** Les séquences jouées depuis le dernier effacement. */
function sequences(): (readonly string[])[] {
  return mockAudio.playSequence.mock.calls.map(([ids]) => ids);
}

async function openStep() {
  render(<LessonSessionScreen />);
  // La consigne est dite d'elle-même : l'étape est présentée (le premier
  // rendu indexe le programme entier, d'où la patience).
  await waitFor(() => expect(sequences()).toContainEqual([INSTRUCTION]), { timeout: 5000 });
  // C'est bien l'étape reprise : « Touche la syllabe que tu entends ».
  expect(screen.getByText('Touche la syllabe que tu entends.')).toBeTruthy();
  mockAudio.playSequence.mockClear();
  mockAudio.play.mockClear();
}

async function missWith(option: string) {
  fireEvent.press(screen.getByLabelText(option));
  await screen.findByLabelText('Réessayer');
}

describe('l’aide qui aide', () => {
  beforeEach(() => {
    // Horloge simulée : les délais de l'écran (réouverture des cartes, anneau
    // « en train de parler ») ne survivent pas au test.
    jest.useFakeTimers();
    jest.clearAllMocks();
    // Un iPad 11" couché, l'appareil de démonstration.
    mockedDimensions.mockReturnValue({ width: 1180, height: 820, scale: 2, fontScale: 1 });
    useSettings.setState({ soundEnabled: true });
    useActiveProfile.setState({
      profile: {
        id: asId<'ChildProfileId'>('profil-test'),
        firstName: 'Amina',
        avatarId: 'avatar-1',
        level: 'CP1',
        createdAt: '2026-10-01T08:00:00.000Z',
        updatedAt: '2026-10-01T08:00:00.000Z',
      },
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('l’ampoule n’est pas offerte avant un essai manqué', async () => {
    await openStep();
    expect(screen.queryByLabelText('Un indice')).toBeNull();
  });

  it('« Réessayer » rejoue la syllabe, et l’ampoule arrive au bout de la consigne', async () => {
    await openStep();
    await missWith('ra');
    expect(sequences()).toEqual([]);
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Réessayer'));
    });
    expect(sequences()).toEqual([[SYLLABLE]]);
    expect(screen.getByLabelText('Un indice')).toBeTruthy();
  });

  it('l’indice demandé dit sa phrase, puis la syllabe', async () => {
    await openStep();
    await missWith('ra');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Réessayer'));
    });
    mockAudio.playSequence.mockClear();
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Un indice'));
    });
    expect(sequences()).toEqual([[HINT, SYLLABLE]]);
  });

  it('au deuxième essai manqué, l’indice s’ouvre de lui-même et redit la syllabe', async () => {
    await openStep();
    await missWith('ra');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Réessayer'));
    });
    await missWith('pa');
    mockAudio.playSequence.mockClear();
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Réessayer'));
    });
    // Un seul départ : l'indice et la syllabe, pas la syllabe seule par-dessus.
    expect(sequences()).toEqual([[HINT, SYLLABLE]]);
    expect(screen.getByText('Écoute encore : quelle est la première lettre ?')).toBeTruthy();
  });

  it('se tait quand le son est coupé dans les réglages', async () => {
    useSettings.setState({ soundEnabled: false });
    render(<LessonSessionScreen />);
    await screen.findByLabelText('ra', {}, { timeout: 5000 });
    await missWith('ra');
    await act(async () => {
      fireEvent.press(screen.getByLabelText('Réessayer'));
    });
    expect(mockAudio.playSequence).not.toHaveBeenCalled();
  });
});
