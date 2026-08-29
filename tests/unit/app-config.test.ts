/**
 * La configuration native porte des promesses faites aux familles et aux
 * stores : aucun accès réseau, rien qui parte en sauvegarde, une app qui se
 * tient dans les deux sens sur tablette. Ces garanties ne sont visibles que
 * dans le manifeste généré — donc invisibles en relecture de code. Ce test
 * les rend impossibles à casser en silence.
 */
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

  it('retire l’accès réseau et l’overlay système des builds livrés', () => {
    const blocked = loadConfig({ ALIFA_RELEASE: '1' }).android?.blockedPermissions ?? [];
    expect(blocked).toContain('android.permission.INTERNET');
    expect(blocked).toContain('android.permission.SYSTEM_ALERT_WINDOW');
    expect(blocked).toContain('android.permission.READ_EXTERNAL_STORAGE');
    expect(blocked).toContain('android.permission.WRITE_EXTERNAL_STORAGE');
    // Le retour haptique de fin d'exercice s'en sert : elle reste.
    expect(blocked).not.toContain('android.permission.VIBRATE');
  });

  it('garde l’accès réseau en développement, sinon Metro est injoignable', () => {
    expect(loadConfig({ ALIFA_RELEASE: undefined }).android?.blockedPermissions).toBeUndefined();
  });

  it('n’ajoute la clé EAS que lorsque l’identifiant de projet est renseigné', () => {
    // Une chaîne vide ferait échouer le build de façon obscure.
    expect((loadConfig({ EAS_PROJECT_ID: undefined }).extra as Record<string, unknown>).eas)
      .toBeUndefined();
    expect((loadConfig({ EAS_PROJECT_ID: 'abc-123' }).extra as Record<string, unknown>).eas)
      .toEqual({ projectId: 'abc-123' });
  });
});
