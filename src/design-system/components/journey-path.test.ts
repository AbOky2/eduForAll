import { journeySegments, type JourneyPoint } from './journey-path';

const points: JourneyPoint[] = [
  { x: 100, y: 50 },
  { x: 160, y: 200 },
  { x: 100, y: 350 },
  { x: 160, y: 500 },
];

/** Le point de départ (« M x y ») d'un tracé. */
const start = (d: string) => d.match(/^M([\d.]+) ([\d.]+)/)?.slice(1).map(Number);

describe('journeySegments — le fil plein jusqu’au monde du jour, pointillé ensuite', () => {
  it('le parcouru va du premier monde au monde du jour ; ce qui reste part du monde du jour', () => {
    const { done, rest } = journeySegments(points, 2);
    expect(start(done)).toEqual([100, 50]);
    expect(start(rest)).toEqual([160, 200]);
    // Après le monde du jour : deux courbes (vers le 3e puis le 4e monde).
    expect(rest.match(/C/g)).toHaveLength(2);
    expect(done.match(/C/g)).toHaveLength(1);
  });

  it('au premier monde, rien n’est parcouru : tout le fil est en pointillé', () => {
    const { done, rest } = journeySegments(points, 1);
    expect(done).toBe('');
    expect(start(rest)).toEqual([100, 50]);
    expect(rest.match(/C/g)).toHaveLength(3);
  });

  it('tout est fini : le fil est plein de bout en bout, sans pointillé', () => {
    const { done, rest } = journeySegments(points, points.length);
    expect(done.match(/C/g)).toHaveLength(3);
    expect(rest).toBe('');
  });

  it('tolère un compte hors bornes et un chemin vide', () => {
    expect(journeySegments(points, 99).rest).toBe('');
    expect(journeySegments(points, -3).done).toBe('');
    expect(journeySegments([], 0)).toEqual({ done: '', rest: '' });
  });
});
