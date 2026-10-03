/**
 * Prend les captures d'écran de l'app sur simulateur iOS.
 *
 * Ce sont de VRAIES captures : l'app tourne, affiche ses propres données, et
 * `xcrun simctl io booted screenshot` enregistre ce que l'écran montre. Rien
 * n'est dessiné ni composé ici. La mise en scène vient de
 * `seed-demo-profile.mjs` ; la navigation passe par les liens profonds
 * d'expo-router plutôt que par des clics, ce qui la rend reproductible.
 *
 * Prérequis : l'app installée et lancée au moins une fois sur le simulateur
 * amorcé, puis la base semée.
 *
 * Usage : node scripts/tools/capture-ios-screenshots.mjs [--suffixe @tablette]
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SORTIE = join(ROOT, 'store/screenshots/raw');
const flag = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const SUFFIXE = flag('suffixe') ?? '';
const BUNDLE = flag('bundle') ?? 'td.ecolna.app.dev';

/** Les neuf plans de store/screenshots/plan.json, chacun atteint par son lien. */
const PLANS = [
  { id: '01-accueil', url: 'ecolna:///(child)/(tabs)' },
  { id: '02-modules', url: 'ecolna:///(child)/(tabs)/learn' },
  { id: '03-progression', url: 'ecolna:///(child)/level-map?subject=reading' },
  { id: '04-ecoute', url: 'ecolna:///(child)/lesson/cp1-langage-ecole-2', attente: 2600 },
  { id: '05-langage', url: 'ecolna:///(child)/lesson/cp1-langage-ecole-1', attente: 2600 },
  { id: '06-calcul', url: 'ecolna:///(child)/lesson/cp1-calcul-nombres-0-5', attente: 2600 },
  { id: '07-reussite', url: 'ecolna:///(child)/lesson/result?stars=3&lessonId=cp1-langage-ecole-1' },
  { id: '08-badges', url: 'ecolna:///(child)/profile' },
  { id: '09-parent', url: 'ecolna:///(parent)/dashboard' },
];

const sh = (...args) => execFileSync('xcrun', args, { encoding: 'utf8' });
const patiente = (ms) => new Promise((r) => setTimeout(r, ms));

mkdirSync(SORTIE, { recursive: true });
sh('simctl', 'launch', 'booted', BUNDLE);
await patiente(4000);

for (const plan of PLANS) {
  // Repasser par l'accueil évite qu'un écran empilé reste visible dessous.
  sh('simctl', 'openurl', 'booted', 'ecolna:///(child)/(tabs)');
  await patiente(900);
  sh('simctl', 'openurl', 'booted', plan.url);
  await patiente(plan.attente ?? 1600);
  const fichier = join(SORTIE, `${plan.id}${SUFFIXE}.png`);
  sh('simctl', 'io', 'booted', 'screenshot', fichier);
  console.log(`capturé ${plan.id}${SUFFIXE}`);
}
console.log(`\n${PLANS.length} captures dans store/screenshots/raw/`);
console.log('Les relire une par une avant de composer : une capture ratée se voit sur la fiche.');
