import { ACHIEVEMENT_IDS } from '../domain/achievements';
import { shelfOrder } from './achievement-badge';

describe('l’étagère des médailles', () => {
  it('range les médailles gagnées en tête, puis les autres, chacune dans l’ordre du catalogue', () => {
    const earned = new Set<string>(['reader', 'first-lesson', 'streak-three']);
    const shelf = shelfOrder(ACHIEVEMENT_IDS, earned);
    expect(shelf.slice(0, 3)).toEqual(['first-lesson', 'reader', 'streak-three']);
    expect(shelf.slice(3)).toEqual(ACHIEVEMENT_IDS.filter((id) => !earned.has(id)));
  });

  it('ne perd ni ne double aucune médaille', () => {
    const shelf = shelfOrder(ACHIEVEMENT_IDS, new Set(['counter']));
    expect([...shelf].sort()).toEqual([...ACHIEVEMENT_IDS].sort());
  });
});
