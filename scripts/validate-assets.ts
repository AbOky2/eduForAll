/* eslint-disable no-console */
/**
 * Validates non-audio assets: fonts, icons, and that every illustration id
 * referenced by the manifest has a renderer in the object-icons registry.
 */
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');
const problems: string[] = [];

const REQUIRED_FILES = [
  'assets/fonts/Quicksand-Regular.ttf',
  'assets/fonts/Quicksand-Medium.ttf',
  'assets/fonts/Quicksand-SemiBold.ttf',
  'assets/fonts/Quicksand-Bold.ttf',
  'assets/fonts/PlusJakartaSans-SemiBold.ttf',
  'assets/icons/app-icon.png',
  'assets/icons/adaptive-icon-foreground.png',
  'assets/icons/adaptive-icon-monochrome.png',
  'assets/icons/splash-icon.png',
];

for (const file of REQUIRED_FILES) {
  try {
    const stats = statSync(join(ROOT, file));
    if (stats.size === 0) {
      problems.push(`${file}: empty file`);
    }
  } catch {
    problems.push(`${file}: missing`);
  }
}

// Illustration ids referenced by content must exist in the SVG registry.
const manifest = JSON.parse(
  readFileSync(join(ROOT, 'src/content/manifests/curriculum-v1.json'), 'utf8'),
) as { assets: Array<{ id: string; kind: string }> };
const registrySource = readFileSync(
  join(ROOT, 'src/design-system/illustrations/object-icons.tsx'),
  'utf8',
);
for (const asset of manifest.assets) {
  if (asset.kind === 'illustration' && !registrySource.includes(`'${asset.id}'`)) {
    problems.push(`illustration "${asset.id}" has no renderer in object-icons.tsx`);
  }
}

if (problems.length > 0) {
  console.error(`❌ ${problems.length} asset problem(s):`);
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}
console.log('✅ Assets OK — fonts, icons and illustration registry are complete.');
