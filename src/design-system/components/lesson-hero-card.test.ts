import { scaled } from '../responsive';
import { HERO_ART_MAX, heroArtSize, heroFillArt } from './lesson-hero-card';

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

  it('tablette 7" couchée (600 dp de haut) : une vraie image, pas une vignette', () => {
    // 124 dp à l'échelle 1,15 : sous la colonne du texte (≈ 159 dp intérieurs),
    // qui fixe la hauteur de la carte — l'image grandit sans agrandir la carte.
    const art = heroArtSize({ isTablet: true, isLandscape: true, height: 600 });
    expect(art).toBe(108);
    expect(scaled(art, 1.15)).toBeLessThan(159);
  });

  it('reste raisonnable au téléphone, où le titre a besoin de la largeur', () => {
    expect(heroArtSize({ isTablet: false, isLandscape: false, height: 844 })).toBeLessThanOrEqual(100);
  });
});

describe('heroFillArt — la carte du jour qui reçoit le surplus de l’accueil', () => {
  const pad = scaled(24, 1.15);
  const base = scaled(heroArtSize({ isTablet: true, isLandscape: false, height: 1180 }), 1.15);

  it('iPad 11" debout : l’image prend la hauteur reçue, jusqu’à son plafond', () => {
    const art = heroFillArt({ base, face: { width: 720, height: 387 }, pad, scale: 1.15 });
    expect(art).toBe(scaled(HERO_ART_MAX, 1.15));
    expect(art).toBeGreaterThan(base);
  });

  it('ne dépasse jamais la hauteur intérieure de la carte', () => {
    const art = heroFillArt({ base, face: { width: 720, height: 300 }, pad, scale: 1.15 });
    expect(art).toBe(300 - 2 * pad);
  });

  it('laisse toujours au titre et au bouton leur largeur', () => {
    const art = heroFillArt({ base: 120, face: { width: 600, height: 500 }, pad, scale: 1.15 });
    expect(600 - 3 * pad - art).toBeGreaterThanOrEqual(scaled(300, 1.15));
  });

  it('ne rapetisse jamais l’image ordinaire', () => {
    expect(heroFillArt({ base, face: { width: 720, height: 120 }, pad, scale: 1.15 })).toBe(base);
  });
});
