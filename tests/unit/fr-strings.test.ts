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

  it('met en couleur un mot qui figure bien dans le titre d’accueil', () => {
    expect(fr.onboarding.welcomeTitle).toContain(fr.onboarding.welcomeTitleHighlight);
  });

  it('ne laisse jamais une ponctuation haute partir seule à la ligne', () => {
    // Typographie française : espace insécable avant « ! ? : ; » et dans les
    // guillemets. Une espace ordinaire laisserait « ! » orphelin en début de
    // ligne sur un écran étroit.
    const texts: string[] = [];
    const collect = (value: unknown): void => {
      if (typeof value === 'string') {
        texts.push(value);
      } else if (typeof value === 'function') {
        try {
          const result: unknown = value('Amina', 2, 3);
          if (typeof result === 'string') {
            texts.push(result);
          }
        } catch {
          // Une fonction aux arguments d'un autre type : vérifiée ailleurs.
        }
      } else if (value && typeof value === 'object') {
        Object.values(value).forEach(collect);
      }
    };
    collect(fr);
    expect(texts.length).toBeGreaterThan(100);
    expect(texts.filter((text) => / [!?:;»]|« /.test(text))).toEqual([]);
  });
});
