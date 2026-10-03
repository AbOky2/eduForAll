import { scaled } from '../responsive';
import { spacing } from '../tokens';
import { avatarGridLayout } from './avatar-grid';

/** Largeur réelle d'une rangée pleine : tuiles (avatar + anneau) et gouttières. */
function rowWidth(columns: number, avatarSize: number, scale: number): number {
  const ring = scaled(4, scale);
  const tile = avatarSize + 2 * (2 * ring + 2);
  return columns * tile + (columns - 1) * scaled(spacing.md, scale);
}

describe('avatarGridLayout', () => {
  it.each([
    // largeur offerte, échelle — téléphone, tablettes portrait et paysage, volet du profil
    [372, 1],
    [536, 1.15],
    [621, 1.3],
    [736, 1.15],
    [416, 1],
    [480, 1.3],
  ])('ne déborde jamais d’une largeur de %i dp (échelle %d)', (width, scale) => {
    for (const [min, max] of [
      [80, 104],
      [56, 72],
    ] as const) {
      const { columns, avatarSize } = avatarGridLayout(width, 12, scale, min, max);
      expect(12 % columns).toBe(0);
      expect(avatarSize).toBeLessThanOrEqual(scaled(max, scale));
      expect(rowWidth(columns, avatarSize, scale)).toBeLessThanOrEqual(width);
    }
  });

  it('préfère des personnages lisibles à six colonnes minuscules', () => {
    // Une tablette de 600 dp en portrait : six colonnes donneraient 50 dp.
    const { columns, avatarSize } = avatarGridLayout(536, 12, 1.15, 80, 104);
    expect(columns).toBe(4);
    expect(avatarSize).toBeGreaterThanOrEqual(scaled(80, 1.15));
  });

  it('garde six colonnes quand la place le permet', () => {
    const { columns } = avatarGridLayout(1000, 12, 1.3, 56, 72);
    expect(columns).toBe(6);
  });
});
