import { MIN_MEDAL, medalRowLayout } from './medal-row-layout';

describe('la rangée des médailles de la réussite', () => {
  it('donne toute la place à deux médailles sur un iPad couché : grandes, nom en grand', () => {
    const layout = medalRowLayout({ count: 2, width: 480, base: 109, scale: 1.3 });
    expect(layout.perRow).toBe(2);
    expect(layout.medal).toBe(109);
    expect(layout.labelVariant).toBe('labelLg');
    expect(2 * layout.cell + layout.gap).toBeLessThanOrEqual(480);
  });

  it('rapetisse quatre médailles sur une rangée, sans jamais tronquer leur nom', () => {
    const layout = medalRowLayout({ count: 4, width: 480, base: 109, scale: 1.3 });
    expect(layout.perRow).toBe(4);
    expect(layout.medal).toBeLessThan(109);
    expect(layout.medal).toBeGreaterThanOrEqual(MIN_MEDAL);
    expect(layout.labelVariant).toBe('labelSm');
    expect(4 * layout.cell + 3 * layout.gap).toBeLessThanOrEqual(480);
  });

  it('passe sur deux rangées égales au téléphone quand quatre ne tiennent plus', () => {
    const layout = medalRowLayout({ count: 4, width: 350, base: 64, scale: 1 });
    expect(layout.perRow).toBe(2);
    expect(layout.medal).toBe(64);
    expect(layout.labelVariant).toBe('labelLg');
  });

  it('ne déborde jamais de la colonne, quel que soit le nombre de médailles', () => {
    for (const [width, base, scale] of [
      [480, 109, 1.3],
      [480, 83, 1.15],
      [350, 64, 1],
      [552, 97, 1.15],
    ] as const) {
      for (let count = 1; count <= 6; count += 1) {
        const layout = medalRowLayout({ count, width, base, scale });
        const rowWidth = layout.perRow * layout.cell + (layout.perRow - 1) * layout.gap;
        expect(rowWidth).toBeLessThanOrEqual(width);
        expect(layout.medal).toBeLessThanOrEqual(base);
      }
    }
  });
});
