import { ACHIEVEMENT_IDS } from '../domain/achievements';
import { shelfGroups } from './achievement-badge';

describe('l’étagère des médailles', () => {
  it('range les médailles gagnées dans le premier rayon, chacune dans l’ordre du catalogue', () => {
    const earned = new Set<string>(['reader', 'first-lesson', 'streak-three']);
    const shelf = shelfGroups(ACHIEVEMENT_IDS, earned);
    expect(shelf.earned).toEqual(['first-lesson', 'reader', 'streak-three']);
    expect(shelf.toEarn).toEqual(ACHIEVEMENT_IDS.filter((id) => !earned.has(id)));
  });

  it('ne perd ni ne double aucune médaille', () => {
    const shelf = shelfGroups(ACHIEVEMENT_IDS, new Set(['counter']));
    expect([...shelf.earned, ...shelf.toEarn].sort()).toEqual([...ACHIEVEMENT_IDS].sort());
  });

  it('laisse un rayon vide quand rien n’est gagné, ou quand tout l’est', () => {
    expect(shelfGroups(ACHIEVEMENT_IDS, new Set()).earned).toEqual([]);
    expect(shelfGroups(ACHIEVEMENT_IDS, new Set(ACHIEVEMENT_IDS)).toEarn).toEqual([]);
  });
});
