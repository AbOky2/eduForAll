import { colors } from './colors';

/** Luminance relative WCAG 2.x d'une couleur `#rrggbb`. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16) / 255);
  const [r = 0, g = 0, b = 0] = channels.map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe('jetons de couleur — contrastes', () => {
  it('mesure comme WCAG (blanc sur noir 21:1, blanc sur blanc 1:1)', () => {
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 5);
    expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });

  it("l'ardoise : le modèle à la craie se voit sur la nuit, même au soleil (≥ 3:1)", () => {
    expect(contrast(colors.slateChalk, colors.night)).toBeGreaterThanOrEqual(3);
  });

  it("l'ardoise : la craie blanche de l'enfant reste distincte du modèle (≥ 3:1)", () => {
    expect(contrast(colors.white, colors.slateChalk)).toBeGreaterThanOrEqual(3);
  });
});
