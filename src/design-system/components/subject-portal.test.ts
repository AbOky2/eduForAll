import { portalWorldStates } from './subject-portal';

describe('portalWorldStates — un point par monde sur la porte d’une discipline', () => {
  it('discipline commencée : les mondes finis, puis le monde du jour, puis ceux à venir', () => {
    expect(
      portalWorldStates([{ done: true }, { done: false }, { done: false }, { done: false }], true),
    ).toEqual(['done', 'current', 'upcoming', 'upcoming']);
  });

  it('discipline pas commencée : la même rangée, tous les mondes à venir', () => {
    expect(portalWorldStates([{ done: false }, { done: false }, { done: false }], false)).toEqual([
      'upcoming',
      'upcoming',
      'upcoming',
    ]);
  });

  it('commencée sans monde fini : le premier monde est celui du jour', () => {
    expect(portalWorldStates([{ done: false }, { done: false }], true)).toEqual([
      'current',
      'upcoming',
    ]);
  });

  it('tout est fini : aucun monde du jour', () => {
    expect(portalWorldStates([{ done: true }, { done: true }], true)).toEqual(['done', 'done']);
  });
});
