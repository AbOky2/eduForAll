/* eslint-disable no-console */
/**
 * Validates bundled audio assets against assets/audio/manifest.json:
 *  - every entry has a real file, non-empty, plausible size
 *  - no orphan files
 *  - flags placeholders (they block production release, not development)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const AUDIO_DIR = join(ROOT, 'assets/audio');

interface AudioManifest {
  entries: Array<{ id: string; file: string; placeholder: boolean }>;
}

const manifest = JSON.parse(
  readFileSync(join(AUDIO_DIR, 'manifest.json'), 'utf8'),
) as AudioManifest;

const problems: string[] = [];
let placeholders = 0;
let totalBytes = 0;

for (const entry of manifest.entries) {
  const filePath = join(AUDIO_DIR, entry.file);
  try {
    const stats = statSync(filePath);
    totalBytes += stats.size;
    if (stats.size < 1000) {
      problems.push(`${entry.id}: file suspiciously small (${stats.size} B)`);
    }
    if (stats.size > 400_000) {
      problems.push(`${entry.id}: file too large (${Math.round(stats.size / 1024)} KB)`);
    }
  } catch {
    problems.push(`${entry.id}: missing file ${entry.file}`);
  }
  if (entry.placeholder) {
    placeholders += 1;
  }
}

const known = new Set(manifest.entries.map((entry) => entry.file.split('/').pop()));
for (const file of readdirSync(join(AUDIO_DIR, 'fr'))) {
  if (!known.has(file)) {
    problems.push(`orphan audio file: fr/${file}`);
  }
}

if (problems.length > 0) {
  console.error(`❌ ${problems.length} audio problem(s):`);
  for (const problem of problems.slice(0, 20)) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}

console.log(
  `✅ Audio OK — ${manifest.entries.length} files, ${(totalBytes / 1024 / 1024).toFixed(1)} MB total.`,
);
if (placeholders > 0) {
  console.log(
    `⚠️  ${placeholders} placeholder voice file(s) (TTS). Production release is BLOCKED until real recordings replace them (see docs/audio-pipeline.md).`,
  );
}
