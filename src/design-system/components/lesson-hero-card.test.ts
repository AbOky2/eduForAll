import { heroArtSize } from './lesson-hero-card';

describe('heroArtSize — l’image de la carte du jour', () => {
  it('grandit de 1,4 à 1,5 fois sur une grande tablette, sans orbite autour', () => {
    // Avant : 92 couché, 112 debout (avec deux anneaux autour).
    const landscape = heroArtSize({ isTablet: true, isLandscape: true, height: 820 });
    const portrait = heroArtSize({ isTablet: true, isLandscape: false, height: 1180 });
    expect(landscape / 92).toBeGreaterThanOrEqual(1.4);
    expect(landscape / 92).toBeLessThanOrEqual(1.5);
    expect(portrait / 112).toBeGreaterThanOrEqual(1.4);
    expect(portrait / 112).toBeLessThanOrEqual(1.5);
  });

  it('tient sur une tablette 7" couchée (600 dp de haut)', () => {
    expect(heroArtSize({ isTablet: true, isLandscape: true, height: 600 })).toBe(76);
  });

  it('reste raisonnable au téléphone, où le titre a besoin de la largeur', () => {
    expect(heroArtSize({ isTablet: false, isLandscape: false, height: 844 })).toBeLessThanOrEqual(100);
  });
});
