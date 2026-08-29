/* eslint-disable no-console */
/**
 * Release gate runner (docs/release-process.md). Runs every automatable gate
 * and prints a clear board.
 *
 * A failing gate blocks the release unless it is listed in
 * `release-acceptances.json` — an explicit, dated, signed decision with the
 * version by which it must disappear. That keeps a known and accepted problem
 * from being confused with a new one, without ever letting it go silent: an
 * accepted gate is printed as ACCEPTÉ, never as green, and an acceptance that
 * no longer matches any failure makes this script fail, so stale exceptions
 * cannot rot in the repo.
 */
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');

interface Gate {
  name: string;
  run: () => void;
}

interface Acceptance {
  gate: string;
  reason: string;
  decidedBy: string;
  decidedOn: string;
  clearBy: string;
  /** Substring that must appear in the failure for the acceptance to apply. */
  matches: string;
}

const { acceptances } = JSON.parse(
  readFileSync(join(ROOT, 'release-acceptances.json'), 'utf8'),
) as { acceptances: Acceptance[] };

const appVersion = (
  JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { version: string }
).version;

const usedAcceptances = new Set<string>();

function acceptanceFor(gate: string, detail: string): Acceptance | null {
  return (
    acceptances.find(
      (candidate) => candidate.gate === gate && detail.includes(candidate.matches),
    ) ?? null
  );
}

const results: Array<{ name: string; ok: boolean; accepted?: Acceptance; detail?: string }> = [];

/**
 * Runs a gate command, and on failure re-throws with the child's own output
 * attached. Without it a gate fails as a bare "Command failed", which tells
 * nobody what broke and hides the text the acceptances match on.
 */
function sh(command: string): void {
  try {
    execSync(command, { cwd: ROOT, stdio: 'pipe', encoding: 'utf8' });
  } catch (cause) {
    const failure = cause as { stdout?: string; stderr?: string; message?: string };
    const output = [failure.stdout, failure.stderr, failure.message]
      .filter(Boolean)
      .join('\n')
      .trim();
    throw new Error(output || `Command failed: ${command}`);
  }
}

const gates: Gate[] = [
  { name: 'TypeScript compile sans erreur', run: () => sh('npx tsc --noEmit') },
  { name: 'ESLint sans erreur', run: () => sh('npx expo lint -- --max-warnings=0') },
  { name: 'Tests unitaires et composants', run: () => sh('npx jest --silent') },
  { name: 'Contenu pédagogique validé', run: () => sh('npx tsx scripts/validate-content.ts') },
  {
    name: 'Assets (polices, icônes, illustrations)',
    run: () => sh('npx tsx scripts/validate-assets.ts'),
  },
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
      const forbidden = [
        'firebase',
        'react-native-google-mobile-ads',
        '@segment',
        'mixpanel',
        '@sentry',
        'amplitude',
      ];
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
    const raw = cause instanceof Error ? cause.message : String(cause);
    const detail = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 6)
      .join(' | ')
      .slice(0, 600);
    const accepted = acceptanceFor(gate.name, raw);
    if (accepted) {
      usedAcceptances.add(`${accepted.gate}::${accepted.matches}`);
      results.push({ name: gate.name, ok: false, accepted });
      console.log(`🟡 ${gate.name} — ACCEPTÉ jusqu'à la ${accepted.clearBy}`);
      console.log(`     ${accepted.reason}`);
    } else {
      results.push({ name: gate.name, ok: false, detail });
      console.log(`❌ ${gate.name}\n     ${detail}`);
    }
  }
}

// Une exception périmée est un problème en soi : soit elle ne correspond plus
// à rien, soit la version où elle devait disparaître est atteinte.
const stale = acceptances.filter(
  (candidate) => !usedAcceptances.has(`${candidate.gate}::${candidate.matches}`),
);
const overdue = acceptances.filter(
  (candidate) =>
    usedAcceptances.has(`${candidate.gate}::${candidate.matches}`) &&
    compareVersions(appVersion, candidate.clearBy) >= 0,
);

const blocked = results.filter((result) => !result.ok && !result.accepted);
const acceptedCount = results.filter((result) => result.accepted).length;

console.log('\n——————————————');
for (const candidate of stale) {
  console.log(
    `❌ Acceptation périmée : « ${candidate.gate} » ne correspond plus à aucun échec. La retirer de release-acceptances.json.`,
  );
}
for (const candidate of overdue) {
  console.log(
    `❌ Acceptation échue : « ${candidate.gate} » devait être levée en ${candidate.clearBy}, la version est ${appVersion}.`,
  );
}

if (blocked.length > 0 || stale.length > 0 || overdue.length > 0) {
  console.log(
    `RELEASE BLOQUÉE : ${blocked.length} gate(s) en échec, ${stale.length} acceptation(s) périmée(s), ${overdue.length} échue(s).`,
  );
  process.exit(1);
}

if (acceptedCount > 0) {
  console.log(
    `Gates automatisables : OK, avec ${acceptedCount} exception(s) explicitement acceptée(s) ci-dessus.`,
  );
  console.log(
    'Ces exceptions DOIVENT figurer dans les notes de version. Voir release-acceptances.json.',
  );
} else {
  console.log('Toutes les gates automatisables sont vertes.');
}
console.log(
  'Gates manuelles restantes : audits sur appareil réel et fiches stores — voir docs/release-process.md.',
);

/** Compare deux versions semver. Renvoie <0, 0 ou >0. */
function compareVersions(left: string, right: string): number {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    const diff = (a[index] ?? 0) - (b[index] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}
