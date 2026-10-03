import { ILLUSTRATION_FILL, fitIllustration, packObjects } from './illustration-fit';

describe('fitIllustration', () => {
  it('keeps the preferred size when the card has room for it', () => {
    expect(fitIllustration({ preferred: 120, innerWidth: 400, fallback: 90 })).toBe(120);
  });

  it('never lets an illustration take more than 76 % of the card inside', () => {
    // iPad 11" couché, trois images : 118 × 1,3 × 1,6 ≈ 245 dp voulus pour ≈ 199 dp d'intérieur.
    const size = fitIllustration({ preferred: 245, innerWidth: 199, fallback: 153 });
    expect(size).toBe(Math.floor(199 * ILLUSTRATION_FILL));
    expect(size / 199).toBeLessThanOrEqual(0.8);
  });

  it('is bounded by the inside height too, when the card height is fixed', () => {
    expect(fitIllustration({ preferred: 245, innerWidth: 300, innerHeight: 150, fallback: 1 })).toBe(
      Math.floor(150 * ILLUSTRATION_FILL),
    );
  });

  it('falls back to a safe size before the card is measured', () => {
    expect(fitIllustration({ preferred: 245, innerWidth: 0, fallback: 153 })).toBe(153);
    // Le repli ne grossit jamais l'image au-delà de sa taille voulue.
    expect(fitIllustration({ preferred: 100, innerWidth: 0, fallback: 153 })).toBe(100);
  });

  it('shares the room between illustrations standing on one line', () => {
    const size = fitIllustration({ preferred: 257, innerWidth: 427, fallback: 99, perRow: 2, gap: 16 });
    expect(size * 2 + 16).toBeLessThanOrEqual(427 * ILLUSTRATION_FILL);
  });

  // Les cases réelles des cartes-images (largeur extérieure, filets de 2 dp
  // compris) pour 2, 3 et 4 choix, en 1180 × 820 et 820 × 1180.
  it.each([
    ['1180×820, 2 choix', 317, 245],
    ['1180×820, 3 choix', 203, 245],
    ['1180×820, 4 choix', 317, 245],
    ['820×1180, 2 choix', 349, 217],
    ['820×1180, 3 choix', 225, 217],
    ['820×1180, 4 choix', 349, 217],
    ['1024×600, 3 choix', 190, 176],
    ['390×844, 3 choix', 106, 115],
  ])('fits inside its card (%s)', (_, cell, preferred) => {
    const inner = cell - 4;
    const size = fitIllustration({ preferred, innerWidth: inner, fallback: preferred });
    expect(size).toBeLessThanOrEqual(preferred);
    expect(size).toBeLessThanOrEqual(inner * 0.8);
    // Assez grande pour se lire : au moins la moitié de la carte, ou sa taille voulue.
    expect(size).toBeGreaterThanOrEqual(Math.min(preferred, cell * 0.5));
  });
});

describe('packObjects', () => {
  it('lines up few objects on a single row, shrunk to fit', () => {
    const packing = packObjects({ count: 2, width: 324, gap: 16, preferred: 257, shrink: 0 });
    expect(packing.perRow).toBe(2);
    expect(packing.size * 2 + 16).toBeLessThanOrEqual(324);
  });

  it('balances the rows so a child counts row by row', () => {
    // Douze arbres dans la scène d'un iPad couché : 4 × 3, pas 5 + 5 + 2.
    expect(packObjects({ count: 12, width: 427, gap: 16, preferred: 99 })).toEqual({
      size: 94,
      perRow: 4,
    });
    // En portrait, la scène est large : 6 × 2.
    expect(packObjects({ count: 12, width: 674, gap: 14, preferred: 87 }).perRow).toBe(6);
    // Sept : 4 + 3, jamais une dernière rangée plus longue.
    expect(packObjects({ count: 7, width: 427, gap: 16, preferred: 99 }).perRow).toBe(4);
  });

  it('respects a height budget when one is given', () => {
    const packing = packObjects({ count: 1, width: 324, gap: 16, preferred: 257, height: 170 });
    expect(packing.size).toBe(170);
  });

  it('keeps the preferred size before the scene is measured', () => {
    expect(packObjects({ count: 3, width: 0, gap: 16, preferred: 99 })).toEqual({
      size: 99,
      perRow: 3,
    });
  });
});
