import { scaled } from '../responsive';
import { spacing } from '../tokens';
import { typography } from '../tokens/typography';
import { fitSubjectTile, subjectTileHeight, subjectTileRoom } from './subject-tile';

/** L'anneau de la tuile compacte en ligne (emblème 40 + 12, couché). */
const COMPACT_RING = (scale: number) => scaled(40 + 12, scale);

/** Ce que la grande tuile occupe vraiment, marges comprises. */
function footprint(
  fit: NonNullable<ReturnType<typeof fitSubjectTile>>,
  scale: number,
): { width: number; height: number } {
  const pad = scaled(spacing.md, scale);
  const gap = scaled(spacing.xs, scale);
  const words =
    scaled(typography.headlineMd.lineHeight, scale) + scaled(typography.labelMd.lineHeight, scale) + 2;
  return fit.layout === 'tall'
    ? { width: 2 * pad + fit.emblem, height: 2 * pad + fit.emblem + gap + words }
    : { width: 2 * pad + fit.emblem + gap + scaled(116, scale), height: 2 * pad + fit.emblem };
}

describe('fitSubjectTile — les tuiles des matières remplissent la hauteur sans jamais déborder', () => {
  it('iPad 11" couché : quatre grandes tuiles, l’emblème en haut, plus grand qu’en tuile compacte', () => {
    const fit = fitSubjectTile({ width: 230, height: 195 }, 1.3);
    expect(fit?.layout).toBe('tall');
    expect(fit?.emblem).toBeGreaterThan(COMPACT_RING(1.3));
  });

  it('iPad 11" debout : deux par deux, l’emblème à côté du nom, au moins 110 dp', () => {
    const fit = fitSubjectTile({ width: 347, height: 241 }, 1.15);
    expect(fit?.layout).toBe('wide');
    expect(fit?.emblem).toBeGreaterThanOrEqual(110);
  });

  it.each([
    ['tablette 7" couchée', { width: 226, height: 124 }, 1.15],
    ['tablette 10" couchée', { width: 230, height: 172 }, 1.3],
  ])('%s : pas la place, la tuile compacte reste', (_, box, scale) => {
    expect(fitSubjectTile(box, scale)).toBeNull();
  });

  it.each([
    [{ width: 230, height: 195 }, 1.3],
    [{ width: 347, height: 241 }, 1.15],
    [{ width: 480, height: 400 }, 1.3],
    [{ width: 160, height: 600 }, 1.15],
    [{ width: 300, height: 180 }, 1],
  ])('ne déborde jamais de sa cellule (%o, échelle %d)', (box, scale) => {
    const fit = fitSubjectTile(box, scale);
    if (fit) {
      const used = footprint(fit, scale);
      expect(used.width).toBeLessThanOrEqual(box.width);
      expect(used.height).toBeLessThanOrEqual(box.height);
    }
  });

  it('plafonne l’emblème : il n’écrase jamais le nom', () => {
    expect(fitSubjectTile({ width: 900, height: 900 }, 1.3)?.emblem).toBe(scaled(104, 1.3));
  });
});

describe('subjectTileRoom — une tuile ne s’étire plus en hauteur vide', () => {
  it('la juste hauteur d’une grande tuile est celle qu’elle occupe vraiment', () => {
    for (const [box, scale] of [
      [{ width: 230, height: 195 }, 1.3],
      [{ width: 347, height: 241 }, 1.15],
      [{ width: 480, height: 400 }, 1.3],
    ] as const) {
      const fit = fitSubjectTile(box, scale);
      expect(fit).not.toBeNull();
      if (fit) {
        expect(subjectTileHeight(fit, scale)).toBe(footprint(fit, scale).height);
      }
    }
  });

  it('iPad 11" debout : l’emblème plafonne avant la hauteur — la tuile s’arrête, le surplus est rendu', () => {
    // La cellule mesurée sur l'accueil d'avant (347 × 217) : 61 dp de vide par tuile.
    const room = subjectTileRoom({ width: 346, height: 217 }, 1.15);
    expect(room.fit).toEqual({ layout: 'wide', emblem: scaled(104, 1.15) });
    expect(room.height).toBe(scaled(104, 1.15) + 2 * scaled(spacing.md, 1.15));
    expect(room.surplus).toBe(217 - (room.height ?? 0));
    expect(room.surplus).toBeGreaterThanOrEqual(scaled(spacing.md, 1.15));
  });

  it('iPad 11" couché : c’est la hauteur qui limite l’emblème — la tuile garde toute sa cellule', () => {
    const room = subjectTileRoom({ width: 226, height: 195 }, 1.3);
    expect(room.fit?.layout).toBe('tall');
    expect(room.height).toBeNull();
    expect(room.surplus).toBe(0);
  });

  it('pas la place d’une grande tuile : rien à rendre', () => {
    expect(subjectTileRoom({ width: 226, height: 124 }, 1.15)).toEqual({
      fit: null,
      height: null,
      surplus: 0,
    });
  });

  it('un surplus de quelques dp ne recompose pas l’écran', () => {
    const fit = fitSubjectTile({ width: 346, height: 600 }, 1.15);
    const natural = fit ? subjectTileHeight(fit, 1.15) : 0;
    const room = subjectTileRoom({ width: 346, height: natural + 6 }, 1.15);
    expect(room.height).toBeNull();
    expect(room.surplus).toBe(0);
  });
});
