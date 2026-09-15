/**
 * La configuration native porte des promesses faites aux familles et aux
 * stores : aucun accès réseau, rien qui parte en sauvegarde, une app qui se
 * tient dans les deux sens sur tablette. Ces garanties ne sont visibles que
 * dans le manifeste généré — donc invisibles en relecture de code. Ce test
 * les rend impossibles à casser en silence.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { ExpoConfig } from 'expo/config';

function loadConfig(env: Record<string, string | undefined>): ExpoConfig {
  jest.resetModules();
  const saved = { ...process.env };
  Object.assign(process.env, env);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const loaded = require('../../app.config') as { default: ExpoConfig };
    return loaded.default;
  } finally {
    process.env = saved;
  }
}

describe('configuration de l’application', () => {
  it('ne déclare que les plateformes réellement livrées', () => {
    // Sans cela, `expo export --platform all` part sur le web, absent du
    // projet, et échoue sans rien produire tout en sortant en code 0.
    expect(loadConfig({}).platforms).toEqual(['ios', 'android']);
  });

  it('laisse l’appareil tourner dans les deux sens', () => {
    // La cible est une tablette, tenue indifféremment en portrait ou en
    // paysage. Verrouiller le portrait n'aurait aucune justification.
    expect(loadConfig({}).orientation).toBe('default');
  });

  it('se déclare compatible tablette sur iOS', () => {
    expect(loadConfig({}).ios?.supportsTablet).toBe(true);
    // requireFullScreen empêcherait Split View sur iPad.
    expect(loadConfig({}).ios?.requireFullScreen).toBeUndefined();
  });

  it('n’envoie jamais la progression de l’enfant dans la sauvegarde système', () => {
    // La politique de confidentialité affirme que les données ne quittent
    // jamais l'appareil ; Auto Backup les enverrait sur Google Drive.
    expect(loadConfig({}).android?.allowBackup).toBe(false);
  });

  /** Ce que le profil `production` d'eas.json fournit réellement. */
  const RELEASE_ENV = {
    ECOLNA_RELEASE: '1',
    ECOLNA_ANDROID_PACKAGE: 'td.ecolna.app',
    ECOLNA_IOS_BUNDLE_ID: 'td.ecolna.app',
  };

  it('retire l’accès réseau et l’overlay système des builds livrés', () => {
    const blocked = loadConfig(RELEASE_ENV).android?.blockedPermissions ?? [];
    expect(blocked).toContain('android.permission.INTERNET');
    expect(blocked).toContain('android.permission.SYSTEM_ALERT_WINDOW');
    expect(blocked).toContain('android.permission.READ_EXTERNAL_STORAGE');
    expect(blocked).toContain('android.permission.WRITE_EXTERNAL_STORAGE');
    // Le retour haptique de fin d'exercice s'en sert : elle reste.
    expect(blocked).not.toContain('android.permission.VIBRATE');
  });

  it('garde l’accès réseau en développement, sinon Metro est injoignable', () => {
    expect(loadConfig({ ECOLNA_RELEASE: undefined }).android?.blockedPermissions).toBeUndefined();
  });

  it('refuse un build livré qui retomberait sur l’identifiant de développement', () => {
    // Sans identifiant explicite, l'app partirait en td.ecolna.app.dev : le
    // store refuse le paquet, et EAS crée les clés sous le mauvais nom.
    expect(() => loadConfig({ ECOLNA_RELEASE: '1' })).toThrow(/identifiant de développement/);
    expect(loadConfig(RELEASE_ENV).android?.package).toBe('td.ecolna.app');
    expect(loadConfig(RELEASE_ENV).ios?.bundleIdentifier).toBe('td.ecolna.app');
  });

  it('pointe le projet EAS, et laisse l’environnement en désigner un autre', () => {
    const byDefault = loadConfig({ EAS_PROJECT_ID: undefined });
    expect((byDefault.extra as Record<string, unknown>).eas).toEqual({
      projectId: 'aa1d821b-49a3-4a56-aad8-9cd2a0b0afa3',
    });
    expect(byDefault.owner).toBe('okimy');

    expect((loadConfig({ EAS_PROJECT_ID: 'abc-123' }).extra as Record<string, unknown>).eas)
      .toEqual({ projectId: 'abc-123' });
  });

  it('ne laisse aucune clé de locale partir vers les deux plateformes', () => {
    // Expo envoie toute clé laissée à la racine d'un fichier de locale vers
    // iOS ET Android. `CFBundleDisplayName` atterrissait ainsi dans les
    // ressources Android sans équivalent par défaut, et `lintVitalRelease`
    // faisait échouer chaque build de production — 23 minutes pour l'apprendre,
    // et seulement en release.
    const config = loadConfig({});
    for (const path of Object.values(config.locales ?? {})) {
      const contents = JSON.parse(readFileSync(join(__dirname, '../..', String(path)), 'utf8'));
      expect(Object.keys(contents).sort()).toEqual(
        Object.keys(contents)
          .filter((key) => key === 'ios' || key === 'android')
          .sort(),
      );
    }
  });
});
