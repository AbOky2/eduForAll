/**
 * Rend les assets de marque depuis leurs sources vectorielles.
 *
 * Les PNG livrés aux stores ne sont pas dessinés à part : ils sortent d'ici.
 * Changer une couleur ou une forme se fait dans le SVG, puis on relance.
 *
 * Chrome sert de moteur de rendu, et les polices de l'app lui sont fournies
 * par une feuille @font-face : la bannière et le splash s'écrivent donc en
 * Ecolna Sans, comme l'app, et non dans une police système approchante.
 *
 * Usage : node scripts/tools/render-brand-assets.mjs
 *   (CHROME_PATH=<chrome> pour un autre moteur, CHROME_NO_SANDBOX=1 en conteneur,
 *    PLAYWRIGHT_MODULE=<paquet playwright> pour un rendu au pixel près)
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const CHROME = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

/** Opaque, plein cadre : Apple refuse toute transparence sur l'icône d'app. */
const CIBLES = [
  { src: 'assets/icons/ecolna-logo-source.svg', out: 'assets/icons/app-icon.png', w: 1024, h: 1024, alpha: false },
  { src: 'assets/icons/adaptive-foreground.svg', out: 'assets/icons/adaptive-icon-foreground.png', w: 1024, h: 1024, alpha: true },
  { src: 'assets/icons/adaptive-monochrome.svg', out: 'assets/icons/adaptive-icon-monochrome.png', w: 1024, h: 1024, alpha: true },
  { src: 'assets/icons/splash-icon-src.svg', out: 'assets/icons/splash-icon.png', w: 1024, h: 1024, alpha: true },
  // Exigés par la console Play.
  { src: 'assets/icons/ecolna-logo-source.svg', out: 'store/google-play/graphics/icon-512.png', w: 512, h: 512, alpha: false },
  { src: 'store/google-play/graphics/feature-graphic-src.svg', out: 'store/google-play/graphics/feature-graphic-1024x500.png', w: 1024, h: 500, alpha: false },
];

const POLICES = [
  ['Ecolna Sans', 700, 'assets/fonts/EcolnaSans-Bold.ttf'],
  ['Ecolna Sans', 600, 'assets/fonts/EcolnaSans-SemiBold.ttf'],
];

function faceCss() {
  return POLICES.filter(([, , f]) => existsSync(join(ROOT, f)))
    .map(([famille, graisse, fichier]) => {
      const donnees = readFileSync(join(ROOT, fichier)).toString('base64');
      return `@font-face{font-family:"${famille}";font-weight:${graisse};src:url(data:font/ttf;base64,${donnees}) format("truetype")}`;
    })
    .join('\n');
}

const css = faceCss();
const pageHtml = (src, w, h) =>
  `<meta charset="utf-8"><style>${css}
     html,body{margin:0;padding:0;width:${w}px;height:${h}px;overflow:hidden}
     svg{display:block;width:${w}px;height:${h}px}</style>${readFileSync(join(ROOT, src), 'utf8')}`;

// Playwright (PLAYWRIGHT_MODULE=<chemin du paquet>) rend au pixel près ; le
// mode --screenshot de Chrome laisse parfois une bande vide en bas.
if (process.env.PLAYWRIGHT_MODULE) {
  const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE);
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  for (const { src, out, w, h, alpha } of CIBLES) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.setContent(pageHtml(src, w, h));
    await page.evaluate(() => document.fonts.ready);
    mkdirSync(dirname(join(ROOT, out)), { recursive: true });
    await page.screenshot({ path: join(ROOT, out), omitBackground: alpha });
    await page.close();
    console.log(`écrit ${out}  (${w}×${h}${alpha ? '' : ', opaque'})`);
  }
  await browser.close();
  process.exit(0);
}

if (!existsSync(CHROME)) {
  console.error(`❌ Chrome introuvable (${CHROME}) — il sert de moteur de rendu.`);
  process.exit(1);
}

const travail = join(tmpdir(), 'ecolna-brand');
mkdirSync(travail, { recursive: true });

for (const { src, out, w, h, alpha } of CIBLES) {
  const page = join(travail, 'page.html');
  writeFileSync(
    page,
    pageHtml(src, w, h),
  );
  mkdirSync(dirname(join(ROOT, out)), { recursive: true });
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--hide-scrollbars',
    // Conteneur Linux en root : Chrome refuse de démarrer sans ce drapeau.
    ...(process.env.CHROME_NO_SANDBOX ? ['--no-sandbox'] : []),
    ...(alpha ? ['--default-background-color=00000000'] : []),
    `--screenshot=${join(ROOT, out)}`, `--window-size=${w},${h}`, `file://${page}`,
  ], { stdio: ['ignore', 'ignore', 'ignore'] });
  console.log(`écrit ${out}  (${w}×${h}${alpha ? '' : ', opaque'})`);
}
rmSync(travail, { recursive: true, force: true });
