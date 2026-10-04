import { OFFICIAL_SOURCE } from '@/content/curriculum/official-program';
import { fr } from '@/localization/fr/strings';

describe('la carte « À propos » des paramètres', () => {
  it('cite le titre exact du programme officiel, sans le recopier de mémoire', () => {
    expect(fr.settings.aboutCompliance).toContain(OFFICIAL_SOURCE.title);
  });

  it('nomme l’autorité, le lieu et l’année du document', () => {
    expect(fr.settings.aboutSource).toContain('Centre national des curricula');
    expect(fr.settings.aboutSource).toContain(OFFICIAL_SOURCE.place);
    expect(fr.settings.aboutSource).toContain(OFFICIAL_SOURCE.date.split(' ').pop() ?? '');
  });
});

describe('l’espace parent', () => {
  it('garde un sous-titre court, qui tient sur une ligne en portrait', () => {
    expect(fr.parent.dashboardSubtitle.length).toBeLessThanOrEqual(40);
  });
});
