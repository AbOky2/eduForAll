import { createLearningAudioService } from '@/features/audio/application/learning-audio-service';

const created: string[] = [];

jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
  createAudioPlayer: jest.fn((source: { id: string }) => {
    created.push(source.id);
    return {
      play: jest.fn(),
      pause: jest.fn(),
      release: jest.fn(),
      seekTo: jest.fn(() => Promise.resolve()),
      setPlaybackRate: jest.fn(),
      addListener: jest.fn(),
    };
  }),
}));

// Le registre renvoie normalement un require() ; ici, un objet qui porte l'identifiant.
const resolve = (audioId: string) => ({ id: audioId }) as unknown as number;

describe('learning audio service', () => {
  beforeEach(() => {
    created.length = 0;
  });

  it('sait, dans le même rendu, quel son vient d’être demandé', () => {
    const audio = createLearningAudioService(resolve);
    // L'exercice lance son mot au montage ; l'écran de leçon demande juste après,
    // sans attendre, ce qui vient de partir pour le rejouer après la consigne.
    void audio.play('mot-maison');
    expect(audio.justStarted(600)).toBe('mot-maison');
  });

  it('ne fait partir que le son le plus récent', async () => {
    const audio = createLearningAudioService(resolve);
    const first = audio.play('mot-maison');
    const second = audio.playSequence(['instr-touche-image', 'mot-maison']);
    await Promise.all([first, second]);
    // Le mot demandé en premier ne chevauche jamais la consigne.
    expect(created).toEqual(['instr-touche-image']);
  });

  it('signale un son absent du registre', async () => {
    const audio = createLearningAudioService(() => null);
    await expect(audio.play('mot-inconnu')).rejects.toThrow();
    expect(audio.justStarted(600)).toBeNull();
  });
});
