/* eslint-disable no-console */
/**
 * Release gate runner (docs/release-process.md). Runs every automatable gate
 * and prints a clear PASS/FAIL board. Production submission is forbidden
 * while any gate fails — including the placeholder-voice gate.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');

interface Gate {
  name: string;
  run: () => void;
}

const results: Array<{ name: string; ok: boolean; detail?: string }> = [];

function sh(command: string): void {
  execSync(command, { cwd: ROOT, stdio: 'pipe' });
}

const gates: Gate[] = [
  { name: 'TypeScript compile sans erreur', run: () => sh('npx tsc --noEmit') },
  { name: 'ESLint sans erreur', run: () => sh('npx expo lint -- --max-warnings=0') },
  { name: 'Tests unitaires et composants', run: () => sh('npx jest --silent') },
  { name: 'Contenu pédagogique validé', run: () => sh('npx tsx scripts/validate-content.ts') },
  { name: 'Assets (polices, icônes, illustrations)', run: () => sh('npx tsx scripts/validate-assets.ts') },
  { name: 'Audio complet et sain', run: () => sh('npx tsx scripts/validate-audio-assets.ts') },
  { name: 'Expo Doctor', run: () => sh('npx expo-doctor@latest') },
  {
    name: 'Aucune voix placeholder en production',
    run: () => {
      const manifest = JSON.parse(
        readFileSync(join(ROOT, 'assets/audio/manifest.json'), 'utf8'),
      ) as { entries: Array<{ placeholder: boolean }> };
      const placeholders = manifest.entries.filter((entry) => entry.placeholder).length;
      if (placeholders > 0) {
        throw new Error(
          `${placeholders} fichiers audio sont des placeholders TTS — enregistrer les vraies voix avant release (docs/audio-pipeline.md)`,
        );
      }
    },
  },
  {
    name: 'Aucun SDK publicitaire / analytics tiers',
    run: () => {
      const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
        dependencies: Record<string, string>;
      };
      const forbidden = ['firebase', 'react-native-google-mobile-ads', '@segment', 'mixpanel', '@sentry', 'amplitude'];
      const hits = Object.keys(pkg.dependencies).filter((dependency) =>
        forbidden.some((pattern) => dependency.includes(pattern)),
      );
      if (hits.length > 0) {
        throw new Error(`dépendances interdites : ${hits.join(', ')}`);
      }
    },
  },
];

for (const gate of gates) {
  try {
    gate.run();
    results.push({ name: gate.name, ok: true });
    console.log(`✅ ${gate.name}`);
  } catch (cause) {
    const detail =
      cause instanceof Error
        ? cause.message.split('\n').slice(0, 3).join(' | ').slice(0, 300)
        : String(cause);
    results.push({ name: gate.name, ok: false, detail });
    console.log(`❌ ${gate.name}\n     ${detail}`);
  }
}

const failed = results.filter((result) => !result.ok);
console.log('\n——————————————');
if (failed.length > 0) {
  console.log(`RELEASE BLOQUÉE : ${failed.length} gate(s) en échec.`);
  process.exit(1);
}
console.log('Toutes les gates automatisables sont vertes. Voir docs/release-process.md pour les gates manuelles (audits device, stores).');
