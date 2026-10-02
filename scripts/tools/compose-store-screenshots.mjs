/**
 * Encadre des captures d'écran RÉELLES aux dimensions exactes des deux stores.
 *
 * Ce script n'invente aucun pixel d'application : il met en page des captures
 * prises sur un vrai appareil. Fabriquer une capture — la dessiner, la simuler,
 * la retoucher — est un motif de rejet déclaré chez Apple (App Review 2.3.3)
 * comme chez Google. Les pixels de l'app viennent de l'appareil, le cadre et la
 * légende viennent d'ici.
 *
 * Entrée  : store/screenshots/raw/<id>.png        (ex. 01-accueil.png)
 *           store/screenshots/raw/<id>@tablette.png pour la variante tablette
 * Sortie  : store/screenshots/out/<format>/<id>.png
 *
 * Usage : node scripts/tools/compose-store-screenshots.mjs [--format play-telephone]
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PLAN = JSON.parse(readFileSync(join(ROOT, 'store/screenshots/plan.json'), 'utf8'));
const RAW = join(ROOT, 'store/screenshots/raw');

const flag = (nom) => {
  const i = process.argv.indexOf(`--${nom}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

function police() {
  const fichiers = [
    ['Quicksand', 700, 'assets/fonts/Quicksand-Bold.ttf'],
    ['Quicksand', 600, 'assets/fonts/Quicksand-SemiBold.ttf'],
  ];
  return fichiers
    .filter(([, , f]) => existsSync(join(ROOT, f)))
    .map(([fam, gr, f]) =>
      `@font-face{font-family:"${fam}";font-weight:${gr};src:url(data:font/ttf;base64,${readFileSync(join(ROOT, f)).toString('base64')}) format("truetype")}`)
    .join('\n');
}

if (!existsSync(CHROME)) {
  console.error(`❌ Chrome introuvable (${CHROME}).`);
  process.exit(1);
}

const css = police();
const travail = join(tmpdir(), 'ecolna-captures');
mkdirSync(travail, { recursive: true });
const seulement = flag('format');
let produites = 0;
const manquantes = [];

for (const [format, spec] of Object.entries(PLAN.formats)) {
  if (seulement && format !== seulement) continue;
  const tablette = format.includes('tablette') || format.includes('ipad');
  const dossier = join(ROOT, 'store/screenshots/out', format);
  mkdirSync(dossier, { recursive: true });

  for (const plan of PLAN.plans) {
    const brute = join(RAW, tablette ? `${plan.id}@tablette.png` : `${plan.id}.png`);
    if (!existsSync(brute)) {
      manquantes.push(`${format}/${plan.id}`);
      continue;
    }
    // La légende occupe le haut ; la capture garde ses proportions dessous.
    const hauteurLegende = Math.round(spec.h * (tablette ? 0.17 : 0.14));
    const page = join(travail, 'page.html');
    writeFileSync(page, `<meta charset="utf-8"><style>${css}
      html,body{margin:0;padding:0;width:${spec.w}px;height:${spec.h}px;overflow:hidden;background:#1f5473}
      .legende{height:${hauteurLegende}px;display:flex;align-items:center;justify-content:center;
        padding:0 ${Math.round(spec.w * 0.08)}px;box-sizing:border-box}
      .legende p{margin:0;font-family:Quicksand,system-ui,sans-serif;font-weight:700;
        font-size:${Math.round(spec.w * (tablette ? 0.032 : 0.052))}px;line-height:1.25;
        color:#fbf3e4;text-align:center;text-wrap:balance}
      .cadre{height:${spec.h - hauteurLegende}px;display:flex;align-items:flex-start;justify-content:center;
        padding:0 ${Math.round(spec.w * 0.06)}px}
      img{max-width:100%;max-height:100%;object-fit:contain;
        border-radius:${Math.round(spec.w * 0.03)}px;box-shadow:0 ${Math.round(spec.w*0.012)}px ${Math.round(spec.w*0.04)}px rgba(0,0,0,.35)}
      </style>
      <div class="legende"><p>${plan.legende}</p></div>
      <div class="cadre"><img src="file://${brute}"></div>`);
    execFileSync(CHROME, [
      '--headless', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
      `--screenshot=${join(dossier, `${plan.id}.png`)}`,
      `--window-size=${spec.w},${spec.h}`, `file://${page}`,
    ], { stdio: ['ignore', 'ignore', 'ignore'] });
    produites += 1;
  }
}
rmSync(travail, { recursive: true, force: true });

console.log(`${produites} capture(s) encadrée(s) dans store/screenshots/out/`);
if (manquantes.length > 0) {
  const brutes = existsSync(RAW) ? readdirSync(RAW).filter((f) => f.endsWith('.png')).length : 0;
  console.log(`\n${manquantes.length} manquante(s) — ${brutes} capture(s) brute(s) présente(s).`);
  console.log('Déposer les captures prises sur un vrai appareil dans store/screenshots/raw/ :');
  console.log('  <id>.png pour le téléphone, <id>@tablette.png pour la tablette.');
  console.log('Identifiants attendus : ' + PLAN.plans.map((p) => p.id).join(', '));
}
