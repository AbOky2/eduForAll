import { fr } from '@/localization/fr/strings';

describe('copie française', () => {
  it('élide « de » selon le prénom', () => {
    // L'UI est en français seulement : « d’Moussa » se verrait immédiatement.
    expect(fr.parent.dashboardTitle('Amina')).toBe('Tableau de bord d’Amina');
    expect(fr.parent.dashboardTitle('Moussa')).toBe('Tableau de bord de Moussa');
    expect(fr.parent.dashboardTitle('Élise')).toBe('Tableau de bord d’Élise');
    expect(fr.parent.dashboardTitle('Yasmine')).toBe('Tableau de bord d’Yasmine');
  });

  it('accorde le pluriel des compteurs', () => {
    expect(fr.home.lessonsDone(1)).toBe('1 leçon terminée');
    expect(fr.home.lessonsDone(4)).toBe('4 leçons terminées');
    expect(fr.home.reviseCount(1)).toBe('1 notion à revoir');
    expect(fr.home.reviseCount(3)).toBe('3 notions à revoir');
    expect(fr.achievements.countEarned(1, 14)).toBe('1 badge sur 14');
    expect(fr.achievements.countEarned(5, 14)).toBe('5 badges sur 14');
  });
});
