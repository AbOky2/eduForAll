/**
 * Rend les assets de marque depuis leurs sources vectorielles.
 *
 * Les PNG livrés aux stores ne sont pas dessinés à part : ils sortent d'ici.
 * Changer une couleur ou une forme se fait dans le SVG, puis on relance.
 *
 * - Les polices de l'app sont fournies au moteur par une feuille @font-face :
 *   la bannière s'écrit en Ecolna Sans, comme l'app, jamais dans une police
 *   système approchante.
 * - Chaque couleur d'un SVG source doit être un jeton de
 *   src/design-system/tokens/colors.ts : une couleur hors palette arrête le
 *   rendu (une marque ne dérive pas d'un fichier à l'autre).
 * - Chaque sortie est contrôlée : dimensions exactes, et pour les cibles
 *   opaques un PNG RVB 8 bits sans canal alpha (Apple refuse toute
 *   transparence sur l'icône d'app ; Play exige un PNG 24 bits pour l'image
 *   de mise en avant).
 *
 * Usage :
 *   node scripts/tools/render-brand-assets.mjs [--only <motif>]
 *     --only google-play   ne rend que les cibles dont le chemin de sortie
 *                          contient le motif (ici : icône 512 et bannière Play)
 *
 * Moteur : Playwright, hors du dépôt (aucune dépendance npm ajoutée).
 *   PLAYWRIGHT_MODULE=<chemin du paquet playwright>  (défaut : « playwright »)
 *   CHROME_PATH=<exécutable Chromium>                (défaut : celui de Playwright)
 *   En conteneur root, --no-sandbox est passé d'office.
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** Opaque, plein cadre : Apple refuse toute transparence sur l'icône d'app. */
const CIBLES = [
  {
    src: 'assets/icons/ecolna-logo-source.svg',
    out: 'assets/icons/app-icon.png',
    w: 1024,
    h: 1024,
    alpha: false,
  },
  {
    src: 'assets/icons/adaptive-foreground.svg',
    out: 'assets/icons/adaptive-icon-foreground.png',
    w: 1024,
    h: 1024,
    alpha: true,
  },
  {
    src: 'assets/icons/adaptive-monochrome.svg',
    out: 'assets/icons/adaptive-icon-monochrome.png',
    w: 1024,
    h: 1024,
    alpha: true,
  },
  {
    src: 'assets/icons/splash-icon-src.svg',
    out: 'assets/icons/splash-icon.png',
    w: 1024,
    h: 1024,
    alpha: true,
  },
  // Exigés par la console Play.
  {
    src: 'assets/icons/ecolna-logo-source.svg',
    out: 'store/google-play/graphics/icon-512.png',
    w: 512,
    h: 512,
    alpha: false,
  },
  {
    src: 'store/google-play/graphics/feature-graphic-src.svg',
    out: 'store/google-play/graphics/feature-graphic-1024x500.png',
    w: 1024,
    h: 500,
    alpha: false,
  },
];

const POLICES = [
  [800, 'assets/fonts/EcolnaSans-ExtraBold.ttf'],
  [700, 'assets/fonts/EcolnaSans-Bold.ttf'],
  [600, 'assets/fonts/EcolnaSans-SemiBold.ttf'],
];

function option(nom) {
  const i = process.argv.indexOf(`--${nom}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const motif = option('only');
const cibles = CIBLES.filter((c) => !motif || c.out.includes(motif));
if (cibles.length === 0) {
  console.error(`❌ Aucune cible ne correspond à « ${motif} ».`);
  process.exit(2);
}

/** Toutes les valeurs hexadécimales des jetons de couleur de l'app. */
async function couleursDesJetons() {
  const fichier = join(ROOT, 'src/design-system/tokens/colors.ts');
  let source;
  try {
    process.removeAllListeners('warning'); // « module type » : bruit sans objet ici
    const m = await import(pathToFileURL(fichier).href);
    source = JSON.stringify([m.palette, m.colors, m.subjectColors]);
  } catch {
    source = readFileSync(fichier, 'utf8'); // Node sans TypeScript : on relit les littéraux
  }
  return new Set([...source.matchAll(/#[0-9a-f]{6}\b/gi)].map((m) => m[0].toLowerCase()));
}

function faceCss() {
  return POLICES.map(([graisse, fichier]) => {
    const chemin = join(ROOT, fichier);
    if (!existsSync(chemin)) throw new Error(`police introuvable : ${fichier}`);
    const donnees = readFileSync(chemin).toString('base64');
    return `@font-face{font-family:"Ecolna Sans";font-weight:${graisse};src:url(data:font/ttf;base64,${donnees}) format("truetype")}`;
  }).join('\n');
}

const jetons = await couleursDesJetons();
const erreurs = [];
for (const { src } of cibles) {
  const svg = readFileSync(join(ROOT, src), 'utf8').replace(/<!--[\s\S]*?-->/g, '');
  // Les couleurs portées par un attribut ou une propriété de peinture (un
  // identifiant comme url(#face) n'en est pas une).
  const peintures = svg.matchAll(
    /(?:fill|stroke|stop-color|flood-color|color)\s*[:=]\s*["']?\s*(#[0-9a-f]{3,8})\b/gi,
  );
  const horsPalette = [...new Set([...peintures].map((m) => m[1].toLowerCase()))].filter(
    (c) => !jetons.has(c),
  );
  if (horsPalette.length > 0)
    erreurs.push(`${src} : couleur(s) hors jetons ${horsPalette.join(', ')}`);
}
if (erreurs.length > 0) {
  for (const e of erreurs) console.error(`❌ ${e}`);
  process.exit(1);
}

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE ?? 'playwright'));
} catch {
  console.error(
    '❌ Playwright introuvable. Indiquer le paquet : PLAYWRIGHT_MODULE=<chemin>/node_modules/playwright',
  );
  process.exit(1);
}
const browser = await chromium.launch({
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  // Aucun trafic réseau : le rendu est local de bout en bout.
  args: [
    '--disable-background-networking',
    '--disable-component-update',
    ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []),
  ],
});

const css = faceCss();
for (const { src, out, w, h, alpha } of cibles) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>${css}
     html,body{margin:0;padding:0;width:${w}px;height:${h}px;overflow:hidden;background:transparent}
     svg{display:block;width:${w}px;height:${h}px}</style>${readFileSync(join(ROOT, src), 'utf8')}`);
  await page.evaluate(() => document.fonts.ready);
  const fichier = join(ROOT, out);
  mkdirSync(dirname(fichier), { recursive: true });
  await page.screenshot({ path: fichier, omitBackground: alpha });
  await page.close();

  const b = readFileSync(fichier);
  const [pw, ph, profondeur, type] = [b.readUInt32BE(16), b.readUInt32BE(20), b[24], b[25]];
  if (pw !== w || ph !== h) erreurs.push(`${out} : ${pw}×${ph}, attendu ${w}×${h}`);
  if (!alpha && (type !== 2 || profondeur !== 8))
    erreurs.push(`${out} : PNG de type ${type}/${profondeur} bits, attendu RVB 8 bits sans alpha`);
  console.log(
    `écrit ${out}  (${w}×${h}${alpha ? '' : ', opaque'}, ${(b.length / 1024).toFixed(0)} Ko)`,
  );
}
await browser.close();

for (const e of erreurs) console.error(`❌ ${e}`);
if (erreurs.length > 0) process.exit(1);
