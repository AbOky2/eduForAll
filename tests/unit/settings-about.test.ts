import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { OFFICIAL_SOURCE } from '@/content/curriculum/official-program';
import { fr } from '@/localization/fr/strings';

/** Un fichier de store/shared, source des mentions publiées sur les fiches. */
function storeShared(name: string): string {
  return readFileSync(join(__dirname, '../../store/shared', name), 'utf8');
}

describe('la carte « À propos » des paramètres', () => {
  it('cite le titre exact du programme officiel, sans le recopier de mémoire', () => {
    expect(fr.settings.aboutCompliance).toContain(OFFICIAL_SOURCE.title);
  });

  it('nomme l’autorité, le lieu et l’année du document', () => {
    expect(fr.settings.aboutSource).toContain('Centre national des curricula');
    expect(fr.settings.aboutSource).toContain(OFFICIAL_SOURCE.place);
    expect(fr.settings.aboutSource).toContain(OFFICIAL_SOURCE.date.split(' ').pop() ?? '');
  });

  it('dit « construit d’après », jamais « conforme » : rien qui se lise comme une caution', () => {
    // store/shared/mentions-programme-officiel.md : « Ne pas écrire … conforme ».
    expect(fr.settings.aboutCompliance.startsWith('Construit d’après')).toBe(true);
    expect(fr.settings.aboutCompliance).not.toMatch(/conforme|agréé|approuvé|officiel/i);
  });

  it('porte la phrase d’indépendance, mot pour mot celle des fiches', () => {
    // Tout champ qui nomme le ministère porte la phrase ; la carte nomme le
    // MEN (aboutSource). La phrase de référence est le bloc de code du fichier.
    const reference = /```\n(ECOLNA est une publication indépendante\..*?)\n```/s.exec(
      storeShared('mentions-programme-officiel.md'),
    )?.[1];
    expect(reference).toBeDefined();
    expect(fr.settings.aboutIndependence).toBe(reference);
  });

  it('donne l’adresse des licences en texte simple, celle de la page de support', () => {
    const support = /URL de support \| `https:\/\/([^`]+)`/.exec(storeShared('coordonnees-fiches.md'))?.[1];
    expect(support).toBeDefined();
    expect(fr.settings.aboutLicencesAddress).toBe(support);
  });
});

describe('l’écran Confidentialité', () => {
  it('donne l’adresse de la politique complète et le contact publiés sur les fiches', () => {
    const coordonnees = storeShared('coordonnees-fiches.md');
    const policy = /URL de la politique de confidentialité \| `https:\/\/([^`]+?)\/?`/.exec(coordonnees)?.[1];
    const email = /E-mail de support \/ de contact \| `([^`]+)`/.exec(coordonnees)?.[1];
    expect(policy).toBeDefined();
    expect(email).toBeDefined();
    expect(fr.settings.privacyPolicyAddress).toBe(policy);
    expect(fr.settings.privacyContact).toBe(email);
  });
});

describe('rien d’inachevé dans les paramètres (Apple 2.1)', () => {
  it('ne garde aucune chaîne de langue « bientôt disponible »', () => {
    expect(fr.settings).not.toHaveProperty('comingSoon');
    expect(fr.settings).not.toHaveProperty('chadianArabic');
    expect(fr.settings).not.toHaveProperty('language');
  });

  it('nomme les deux classes du programme', () => {
    expect(Object.keys(fr.settings.levelChoice)).toEqual(['CP1', 'CP2']);
  });
});

describe('l’espace parent', () => {
  it('garde un sous-titre court, qui tient sur une ligne en portrait', () => {
    expect(fr.parent.dashboardSubtitle.length).toBeLessThanOrEqual(40);
  });
});
