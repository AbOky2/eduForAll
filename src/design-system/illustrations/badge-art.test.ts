import { colors } from '../tokens';
import { BADGE_ART_IDS, badgeTone, pipRadius } from './badge-art';

/** Luminance relative WCAG d'un `#rrggbb`. */
function luminance(hex: string): number {
  const channel = (index: number) => {
    const value = parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

describe('médailles à gagner', () => {
  const greys: string[] = [colors.fill, colors.fillStrong, colors.inkDisabled];

  it.each([...BADGE_ART_IDS])('%s garde sa famille, en pâle — jamais le gris', (id) => {
    const locked = badgeTone(id, false);
    expect(greys).not.toContain(locked.ring);
    expect(greys).not.toContain(locked.core);
    expect(greys).not.toContain(locked.glyph);
    expect(locked.core).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it.each([...BADGE_ART_IDS])(
    '%s : le « pas encore » se lit à côté de la médaille gagnée',
    (id) => {
      const earned = badgeTone(id, true);
      const locked = badgeTone(id, false);
      // Le cœur pâle est nettement plus clair que le cœur plein…
      expect(luminance(locked.core)).toBeGreaterThan(luminance(earned.core) + 0.1);
      // … et le pictogramme est atténué, quand celui de la médaille gagnée est franc.
      expect(earned.glyphOpacity).toBe(1);
      expect(locked.glyphOpacity).toBeLessThan(1);
    },
  );
});

describe('points de palier', () => {
  it('gardent leur taille de dessin sur une grande médaille', () => {
    expect(pipRadius(96)).toBeCloseTo(3.6);
    expect(pipRadius(120)).toBeCloseTo(3.6);
  });

  it('ne tombent jamais sous 2,6 dp à l’écran sur une petite médaille', () => {
    for (const size of [52, 60, 72, 88]) {
      expect((pipRadius(size) * size) / 96).toBeGreaterThanOrEqual(2.6 - 1e-9);
    }
  });

  it('ne débordent jamais de la couronne', () => {
    expect(pipRadius(24)).toBeLessThanOrEqual(5);
  });
});
