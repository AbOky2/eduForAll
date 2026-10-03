import { ORBIT_CENTER_CLEARANCE, orbitRadii } from './orbit';

/** L'air entre le bord du sujet central et le bord d'un satellite de l'anneau intérieur. */
function innerClearance(size: number, center: number, chip: number, friend: number): number {
  const [inner] = orbitRadii({
    size,
    inner: 0.66,
    centerSize: center,
    satellites: [
      { size: chip, ring: 0 },
      { size: friend, ring: 1 },
    ],
  });
  return inner - center / 2 - chip / 2;
}

describe('orbitRadii', () => {
  it('écarte l’anneau intérieur : ses satellites ne mordent jamais le sujet (onboarding 1)', () => {
    // Les proportions de la page 1 de l'onboarding, du téléphone à la grande tablette.
    for (const size of [240, 300, 360, 420, 460, 520]) {
      const clearance = innerClearance(
        size,
        Math.round(size * 0.38),
        Math.round(size * 0.15),
        Math.round(size * 0.19),
      );
      expect(clearance).toBeGreaterThanOrEqual(ORBIT_CENTER_CLEARANCE - 1e-9);
    }
  });

  it('écarte aussi l’anneau d’un sujet très grand (ancienne mise en page : 0,4 × l’orbite)', () => {
    expect(innerClearance(420, 168, 67, 80)).toBeGreaterThanOrEqual(ORBIT_CENTER_CLEARANCE - 1e-9);
  });

  it('garde la proportion demandée quand le sujet laisse assez d’air', () => {
    const [inner, outer] = orbitRadii({
      size: 400,
      inner: 0.66,
      centerSize: 60,
      satellites: [{ size: 40, ring: 0 }],
    });
    expect(inner).toBeCloseTo(outer * 0.66, 5);
  });

  it('ne pousse jamais l’anneau intérieur au-delà de l’extérieur', () => {
    const [inner, outer] = orbitRadii({
      size: 200,
      inner: 0.66,
      centerSize: 190,
      satellites: [{ size: 40, ring: 0 }],
    });
    expect(inner).toBeLessThanOrEqual(outer);
  });

  it('ne contraint rien sans satellite sur l’anneau intérieur', () => {
    const [inner, outer] = orbitRadii({
      size: 400,
      inner: 0.66,
      centerSize: 300,
      satellites: [{ size: 50, ring: 1 }],
    });
    expect(inner).toBeCloseTo(outer * 0.66, 5);
  });

  it('garde chaque satellite dans le carré, quel que soit son angle', () => {
    const [, outer] = orbitRadii({
      size: 400,
      inner: 0.66,
      centerSize: 100,
      satellites: [
        { size: 60, ring: 0 },
        { size: 80, ring: 1 },
      ],
    });
    expect(outer + 40).toBeLessThanOrEqual(200);
  });
});
