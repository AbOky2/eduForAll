/* eslint-disable no-console */
/**
 * Vérifie que les assets pédagogiques arrivent réellement dans le bundle.
 *
 * `validate:audio` regarde les fichiers sur le disque ; ce script regarde ce
 * que Metro embarque. La différence n'est pas théorique : si
 * `audio-registry.generated.ts` prend du retard sur le contenu — un
 * identifiant renommé, un `generate-content.ts` oublié — les fichiers sont
 * toujours là, la validation audio passe, et l'app se retrouve muette sur les
 * exercices concernés. Une app dont la voix EST la maîtresse ne peut pas
 * livrer ça.
 *
 * On compare par empreinte du contenu, pas par nom : Metro renomme chaque
 * asset avec une empreinte qui lui est propre.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

import { flag } from './tools/args';

const ROOT = join(__dirname, '..');
const AUDIO_DIR = join(ROOT, 'assets/audio/fr');

function md5(path: string): string {
  return createHash('md5').update(readFileSync(path)).digest('hex');
}

const provided = flag('dir');
const exportDir = provided ?? mkdtempSync(join(tmpdir(), 'alifa-bundle-'));

try {
  if (!provided) {
    console.log('export du bundle iOS…');
    execFileSync(
      'npx',
      ['expo', 'export', '--platform', 'ios', '--output-dir', exportDir],
      { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] },
    );
  }

  const assetsDir = join(exportDir, 'assets');
  const bundled = new Set<string>();
  for (const file of readdirSync(assetsDir)) {
    const path = join(assetsDir, file);
    if (statSync(path).isFile()) {
      bundled.add(md5(path));
    }
  }

  const expected = readdirSync(AUDIO_DIR).filter((file) => file.endsWith('.m4a'));
  const missing = expected.filter((file) => !bundled.has(md5(join(AUDIO_DIR, file))));

  if (missing.length > 0) {
    console.error(
      `❌ ${missing.length} son(s) absent(s) du bundle — le registre audio est désynchronisé.`,
    );
    for (const file of missing.slice(0, 15)) {
      console.error(`  - ${basename(file, '.m4a')}`);
    }
    console.error('  Relancer : npx tsx scripts/generate-content.ts');
    process.exit(1);
  }

  console.log(`✅ Bundle OK — ${expected.length} sons embarqués, aucun manquant.`);
} finally {
  if (!provided) {
    rmSync(exportDir, { recursive: true, force: true });
  }
}
