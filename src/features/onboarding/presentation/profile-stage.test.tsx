import { render, screen } from '@testing-library/react-native';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import { ProfileStage, frameWidthOf, inviteDashes } from './profile-stage';

const base = {
  width: 520,
  height: 820,
  firstName: '',
  level: null,
  characterSize: 312,
  joy: false,
} as const;

describe('ProfileStage', () => {
  it('avant tout choix, montre une invitation — jamais un personnage gris', () => {
    render(<ProfileStage {...base} avatarId={null} />);
    expect(screen.getByTestId('profile-invitation')).toBeTruthy();
    expect(screen.queryByTestId('profile-character')).toBeNull();
  });

  it('montre le personnage choisi dans son médaillon, à la place de l’invitation', () => {
    render(<ProfileStage {...base} avatarId="avatar-8" joy />);
    expect(screen.getByTestId('profile-character')).toBeTruthy();
    expect(screen.queryByTestId('profile-invitation')).toBeNull();
  });

  it('se lit comme une carte : « Ta carte : Amina, CP1 »', () => {
    render(<ProfileStage {...base} avatarId="avatar-2" firstName=" Amina " level="CP1" />);
    expect(screen.getByLabelText('Ta carte : Amina, CP1')).toBeTruthy();
  });
});

describe('le pointillé de l’invitation', () => {
  it.each([
    [312, 4, 1.3],
    [238, 3, 1.15],
    [92, 3, 1],
  ])('se referme sur un tiret entier (Ø %i dp, trait %i dp, échelle %f)', (diameter, stroke, scale) => {
    const { count, dash, gap } = inviteDashes(diameter, stroke, scale);
    expect(Number.isInteger(count)).toBe(true);
    expect(count * (dash + gap)).toBeCloseTo(Math.PI * (diameter - stroke), 6);
    // Vu à l'écran (bouts arrondis compris) : des tirets de ≈ 10 dp pour ≈ 8 dp d'air.
    const seenDash = dash + stroke;
    const seenGap = gap - stroke;
    expect(seenDash / scale).toBeGreaterThan(8);
    expect(seenDash / scale).toBeLessThan(12);
    expect(seenGap / scale).toBeGreaterThan(6);
    expect(seenGap / scale).toBeLessThan(10);
  });
});

it('le cadre du médaillon reste fin : 4 dp au moins, ≈ 2 % du diamètre', () => {
  expect(frameWidthOf(92)).toBe(4);
  expect(frameWidthOf(312)).toBe(7);
});

/** Les fichiers d'un dossier, récursivement. */
function sourcesOf(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      return sourcesOf(path);
    }
    return /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [path] : [];
  });
}

it('la silhouette grise « utilisateur par défaut » n’apparaît sur aucun écran', () => {
  const root = join(__dirname, '../../../..');
  const screens = [...sourcesOf(join(root, 'app')), ...sourcesOf(join(root, 'src/features'))];
  const users = screens.filter((file) => readFileSync(file, 'utf8').includes('AvatarSilhouette'));
  expect(users).toEqual([]);
});
