import { STAR_CELEBRATION, starPopDelay, starsPeakAt } from './star-row';

describe('l’éclosion des étoiles (réussite)', () => {
  it('fait éclore les étoiles l’une après l’autre, à 180 ms d’écart', () => {
    expect(starPopDelay(1) - starPopDelay(0)).toBe(180);
    expect(starPopDelay(2) - starPopDelay(1)).toBe(180);
    expect(starPopDelay(0)).toBe(STAR_CELEBRATION.start);
  });

  it('pose la dernière étoile à son sommet avant que le texte n’entre, en moins d’une seconde', () => {
    expect(starsPeakAt(3)).toBe(starPopDelay(2) + STAR_CELEBRATION.rise);
    expect(starsPeakAt(3)).toBeLessThan(1000);
    expect(starsPeakAt(1)).toBeLessThan(starsPeakAt(3));
  });
});
