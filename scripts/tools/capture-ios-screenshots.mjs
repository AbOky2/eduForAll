/**
 * Prend les captures d'écran de l'app sur simulateur iOS.
 *
 * Ce sont de VRAIES captures : l'app tourne, affiche ses propres données, et
 * `xcrun simctl io booted screenshot` enregistre ce que l'écran montre. Rien
 * n'est dessiné ni composé ici. La mise en scène vient de
 * `seed-demo-profile.mjs` (profil « Amina », badges calculés par les règles
 * de l'app) ; la navigation passe par les liens profonds d'expo-router plutôt
 * que par des clics, ce qui la rend reproductible.
 *
 * Les dix plans sont ceux de store/screenshots/plan.json, dans les mêmes
 * états que le banc web (scripts/tools/capture-store-screenshots.sh) : mêmes
 * routes, même étape de leçon, même écran de réussite. Deux gestes restent à
 * faire à la main, le script s'arrête et attend Entrée :
 *
 * - 10-parent : l'espace parent passe désormais par sa PORTE. Le lien profond
 *   ouvre la porte (une multiplication tirée au hasard) : y répondre sur le
 *   simulateur, et le tableau de bord s'ouvre. Un lien direct vers le tableau
 *   de bord y ramène de toute façon.
 * - iPhone, défilement : 01 jusqu'au bout (rangée Écriture · Calcul entière
 *   au-dessus de la barre d'onglets), 09 jusqu'à la rangée « Vingt leçons ·
 *   Cinquante leçons · Belle lecture » entière au-dessus du fondu, 10 jusqu'au
 *   bout (« Par discipline » et « Analyse de progression » visibles).
 *
 * Prérequis : l'app installée et lancée au moins une fois sur le simulateur
 * amorcé, puis la base semée (`node scripts/tools/seed-demo-profile.mjs`).
 * À lancer dans un terminal (les pauses lisent le clavier). Node ≥ 22.5.
 *
 * Usage : node scripts/tools/capture-ios-screenshots.mjs [--suffixe @tablette]
 *           [--bundle td.ecolna.app.dev] [--udid <simulateur>] [--only 07-reussite,10-parent]
 *   sans suffixe : iPhone 6,9" → raw/<id>.png (1320 × 2868)
 *   --suffixe @tablette : iPad 13" en paysage → raw/<id>@tablette.png (2752 × 2064)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SORTIE = join(ROOT, 'store/screenshots/raw');
const flag = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const SUFFIXE = flag('suffixe') ?? '';
const BUNDLE = flag('bundle') ?? 'td.ecolna.app.dev';
const APPAREIL = flag('udid') ?? 'booted';
const SEULS = flag('only')?.split(',').map((s) => s.trim()).filter(Boolean);
const IPHONE = SUFFIXE === '';
const DIMENSIONS = IPHONE ? '1320x2868' : '2752x2064';

const ACCUEIL = 'ecolna:///(child)/(tabs)';
const LECON = 'ecolna:///(child)/lesson';

/**
 * Les dix plans, chacun atteint par son lien. `etape` : la leçon s'ouvre à
 * cette étape (comme STEP= au banc web). `main` : le geste à faire avant la
 * photo ; `mainIphone` : seulement sur iPhone.
 */
const PLANS = [
  {
    id: '01-accueil',
    url: ACCUEIL,
    mainIphone: 'faire défiler jusqu’au bout : la rangée Écriture · Calcul entière au-dessus de la barre d’onglets',
  },
  { id: '02-image', url: `${LECON}/cp1-langage-fetes-1`, etape: ['cp1-langage-fetes-1', 0], attente: 2600 },
  { id: '03-ecriture', url: `${LECON}/cp1-ecriture-lettres-3`, etape: ['cp1-ecriture-lettres-3', 2], attente: 2300 },
  { id: '04-parcours', url: 'ecolna:///level-map', attente: 2200 },
  { id: '05-lecture', url: `${LECON}/cp1-lecture-l-2`, etape: ['cp1-lecture-l-2', 3], attente: 2600 },
  { id: '06-calcul', url: `${LECON}/cp1-calcul-nombres-11-15`, etape: ['cp1-calcul-nombres-11-15', 1], attente: 2600 },
  {
    // La 10ᵉ leçon du profil : elle ferme « Moi et mon école » et fait dix
    // leçons de langage. seed-demo-profile.mjs affiche ce que chaque leçon a
    // débloqué : ces deux badges-là, et eux seuls.
    id: '07-reussite',
    url: `${LECON}/result?stars=3&lessonId=cp1-langage-famille-2&badges=first-world,speaker`,
    attente: 3200,
  },
  { id: '08-matieres', url: 'ecolna:///learn' },
  {
    id: '09-badges',
    url: 'ecolna:///profile',
    mainIphone: 'faire défiler jusqu’à la rangée « Vingt leçons · Cinquante leçons · Belle lecture », entière au-dessus du fondu',
  },
  {
    id: '10-parent',
    url: 'ecolna:///gate',
    main: 'répondre à la porte parentale (multiplication tirée au hasard) : le tableau de bord s’ouvre',
    mainIphone: 'puis faire défiler jusqu’au bout : « Par discipline » et « Analyse de progression » visibles',
  },
];

const plans = PLANS.filter((p) => !SEULS || SEULS.includes(p.id));
const inconnus = (SEULS ?? []).filter((id) => !PLANS.some((p) => p.id === id));
if (inconnus.length > 0) {
  console.error(`❌ plan(s) inconnu(s) : ${inconnus.join(', ')}`);
  process.exit(2);
}
// plan.json fait foi : ce script doit connaître chacun de ses plans.
const attendus = JSON.parse(readFileSync(join(ROOT, 'store/screenshots/plan.json'), 'utf8')).plans.map((p) => p.id);
const absents = attendus.filter((id) => !PLANS.some((p) => p.id === id));
if (absents.length > 0) {
  console.error(`❌ plan.json contient des plans que ce script ne sait pas atteindre : ${absents.join(', ')}`);
  process.exit(1);
}

const gestes = (plan) => [plan.main, IPHONE ? plan.mainIphone : undefined].filter(Boolean);
if (plans.some((p) => gestes(p).length > 0) && !process.stdin.isTTY) {
  console.error('❌ certains plans demandent un geste à la main (porte parentale, défilement) : lancer ce script dans un terminal.');
  process.exit(1);
}

const sh = (...args) => execFileSync('xcrun', args, { encoding: 'utf8' });
const patiente = (ms) => new Promise((r) => setTimeout(r, ms));

/** La base de l'app sur le simulateur (la même que seed-demo-profile.mjs). */
function base() {
  const conteneur = sh('simctl', 'get_app_container', APPAREIL, BUNDLE, 'data').trim();
  const fichier = join(conteneur, 'Documents/SQLite/ecolna.db');
  if (!existsSync(fichier)) {
    console.error(`❌ base introuvable : ${fichier}. Lancer l'app, puis seed-demo-profile.mjs.`);
    process.exit(1);
  }
  return new DatabaseSync(fichier);
}

/** Reprise de leçon : la leçon s'ouvrira à cette étape (STEP= au banc web). */
function ouvrirA(db, lecon, etape) {
  db.prepare(
    `INSERT OR REPLACE INTO lesson_progress (child_profile_id, lesson_id, status, stars, current_step_index,
     hints_used, error_count, completed_at, updated_at)
     SELECT value, ?, 'in_progress', 0, ?, 0, 0, NULL, ? FROM app_settings WHERE key = 'active_profile_id'`,
  ).run(lecon, etape, new Date().toISOString());
}

const db = base();
if (!db.prepare("SELECT 1 FROM achievements WHERE child_profile_id = 'demo-amina'").get()) {
  console.error('❌ profil de démonstration absent : lancer d’abord node scripts/tools/seed-demo-profile.mjs.');
  process.exit(1);
}

mkdirSync(SORTIE, { recursive: true });
const clavier = process.stdin.isTTY ? createInterface({ input: process.stdin, output: process.stdout }) : null;
sh('simctl', 'launch', APPAREIL, BUNDLE);
await patiente(4000);

for (const plan of plans) {
  if (plan.etape) ouvrirA(db, ...plan.etape);
  // Repasser par l'accueil évite qu'un écran empilé reste visible dessous.
  sh('simctl', 'openurl', APPAREIL, ACCUEIL);
  await patiente(900);
  sh('simctl', 'openurl', APPAREIL, plan.url);
  await patiente(plan.attente ?? 1600);
  const aFaire = gestes(plan);
  if (aFaire.length > 0 && clavier) {
    await clavier.question(`→ ${plan.id} : ${aFaire.join(', ')}.\n  Entrée pour photographier… `);
    await patiente(800);
  }
  const fichier = join(SORTIE, `${plan.id}${SUFFIXE}.png`);
  sh('simctl', 'io', APPAREIL, 'screenshot', fichier);
  const b = readFileSync(fichier);
  const dims = `${b.readUInt32BE(16)}x${b.readUInt32BE(20)}`;
  console.log(`capturé ${plan.id}${SUFFIXE} (${dims})${dims === DIMENSIONS ? '' : ` ⚠️ attendu ${DIMENSIONS} : mauvais simulateur ?`}`);
}
clavier?.close();
console.log(`\n${plans.length} captures dans store/screenshots/raw/`);
console.log('Les relire une par une avant de composer : une capture ratée se voit sur la fiche.');
console.log('La fiche Play tablette encadre raw/<id>@tablette-android.png (2560 × 1600) : à tourner au banc web');
console.log('ou sur une tablette Android 10" (capture-store-screenshots.sh --appareil android).');
