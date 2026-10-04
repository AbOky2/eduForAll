/**
 * Compose les captures des deux stores à partir des captures BRUTES de l'app.
 *
 * Ce script n'invente aucun pixel d'application. Il pose une capture brute
 * (store/screenshots/raw/, rendu du vrai code de l'app) dans un cadre d'appareil
 * sobre et sans marque, sous une légende. La capture n'est ni retouchée, ni
 * recadrée, ni recouverte (App Review 2.3.3, règles de métadonnées Play) : elle
 * est seulement mise à l'échelle, et seuls ses quatre coins sont arrondis — le
 * script vérifie que ces coins ne portent que le fond de l'écran.
 *
 * Direction artistique (design/direction-v4-epure.md) :
 * - une légende en grand, Ecolna Sans ExtraBold, deux lignes au plus,
 *   équilibrées, à la même taille dans toute la série d'un format ; un groupe
 *   de mots peut être accentué (« accent » dans plan.json) ;
 * - un cadre d'appareil générique : rectangle aux coins arrondis, fin liseré
 *   nuit, ombre douce et froide — jamais un iPhone ni un iPad reconnaissable
 *   (Google interdit les cadres de marque, Apple ceux d'autres plateformes) ;
 * - un fond par écran, pris dans la palette v4 (« fond » dans plan.json) :
 *   toile, teinte pâle de la discipline, bleu ou soleil pâles, nuit pour les
 *   grands moments. Aucune couleur n'est écrite ici : tout vient des jetons
 *   (src/design-system/tokens/colors.ts).
 *
 * Entrée  : store/screenshots/plan.json
 *           store/screenshots/raw/<id>.png           capture téléphone
 *           store/screenshots/raw/<id>@tablette.png  capture tablette (paysage)
 * Sortie  : store/screenshots/out/<format>/<id>.png  dimensions exactes du format,
 *           PNG 24 bits sans transparence (exigé par Play, sûr pour Apple)
 *
 * Usage :
 *   node scripts/tools/compose-store-screenshots.mjs
 *        [--format app-store-iphone[,play-telephone…]]
 *        [--only 01-accueil[,07-reussite…]]
 *        [--planche <fichier.png>]   planche de contrôle : toutes les sorties en
 *                                    vignettes de 300 px de haut, la taille d'une
 *                                    fiche de store (la légende doit s'y lire)
 *        [--plan <plan.json>] [--sortie <dossier>]   essais hors de la série livrée
 *
 * Moteur : Playwright, hors du dépôt (aucune dépendance npm ajoutée).
 *   PLAYWRIGHT_MODULE=<chemin du paquet playwright>  (défaut : « playwright »)
 *   CHROME_PATH=<exécutable Chromium>                (défaut : celui de Playwright)
 *   En conteneur root, --no-sandbox est passé d'office.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const RAW = join(ROOT, 'store/screenshots/raw');

/** Limites des consoles : nombre de captures par type d'appareil, poids. */
const MAX_APPLE = 10;
const MAX_PLAY = 8;
const POIDS_MAX = 8 * 1024 * 1024;

/**
 * Le gabarit, en unités relatives : u = 1 % de la largeur (téléphone, portrait)
 * ou de la hauteur (tablette, paysage). Un seul gabarit par famille de format :
 * l'App Store et Play montrent la même composition, à leurs dimensions.
 */
const GABARITS = {
  telephone: {
    haut: 8.5, // air au-dessus de la légende
    mesure: 90, // largeur offerte à la légende
    corpsMax: 8.6, // taille de légende maximale
    interligne: 1.1,
    ecart: 6.5, // légende → appareil
    bas: 7.5, // appareil → bord bas
    coteMin: 10, // marge latérale minimale de l'appareil
    lisere: 1.05, // épaisseur du liseré
    rayon: 0.07, // rayon de l'écran, en part de sa largeur
  },
  tablette: {
    haut: 5.5,
    mesure: 80, // en u de HAUTEUR : iPad et Play coupent les légendes au même endroit
    corpsMax: 6.3,
    interligne: 1.1,
    ecart: 4,
    bas: 5.5,
    coteMin: 8,
    lisere: 0.85,
    rayon: 0.022,
  },
};

// ── Arguments ──────────────────────────────────────────────────────────────

function option(nom) {
  const i = process.argv.indexOf(`--${nom}`);
  if (i < 0) return undefined;
  const valeur = process.argv[i + 1];
  if (!valeur || valeur.startsWith('--')) {
    console.error(`❌ --${nom} attend une valeur.`);
    process.exit(2);
  }
  return valeur;
}
const liste = (v) =>
  v
    ? v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;
const seulsFormats = liste(option('format'));
const seulsPlans = liste(option('only'));
const planche = option('planche');
// Essais de mise en page sans toucher à la série livrée : un autre plan, un
// autre dossier de sortie.
const PLAN_JSON = resolve(option('plan') ?? join(ROOT, 'store/screenshots/plan.json'));
const OUT = resolve(option('sortie') ?? join(ROOT, 'store/screenshots/out'));

// ── Jetons ─────────────────────────────────────────────────────────────────

/**
 * Lit les jetons de couleur de l'app. Node ≥ 22.18 importe le TypeScript
 * directement ; sinon, on relit les littéraux du fichier (même source).
 */
async function chargerJetons() {
  const fichier = join(ROOT, 'src/design-system/tokens/colors.ts');
  try {
    process.removeAllListeners('warning'); // « module type » : bruit sans objet ici
    const m = await import(pathToFileURL(fichier).href);
    if (m.palette && m.subjectColors && m.colors) {
      return { palette: m.palette, colors: m.colors, subjectColors: m.subjectColors };
    }
  } catch {
    /* repli ci-dessous */
  }
  const source = readFileSync(fichier, 'utf8');
  const bloc = (nom) => {
    const debut = source.indexOf(`export const ${nom} = {`);
    if (debut < 0) throw new Error(`jeton « ${nom} » introuvable dans ${relative(ROOT, fichier)}`);
    return source.slice(debut, source.indexOf('} as const;', debut));
  };
  const litteraux = (texte) =>
    Object.fromEntries([...texte.matchAll(/^\s+(\w+):\s*'([^']+)'/gm)].map((m) => [m[1], m[2]]));
  const palette = litteraux(bloc('palette'));
  const colors = { ...palette, ...litteraux(bloc('colors')) };
  const subjectColors = {};
  for (const m of bloc('subjectColors').matchAll(/(\w+):\s*subject\(([^)]*)\)/g)) {
    const [solid, deep, tint, tintStrong, ink] = [...m[2].matchAll(/'([^']+)'/g)].map((x) => x[1]);
    subjectColors[m[1]] = { solid, deep, tint, tintStrong, ink };
  }
  return { palette, colors, subjectColors };
}

/** « palette.night », « subjectColors.language.ink » → valeur du jeton. */
function jeton(jetons, chemin) {
  const valeur = chemin.split('.').reduce((o, k) => (o == null ? undefined : o[k]), jetons);
  if (typeof valeur !== 'string') throw new Error(`jeton inconnu : ${chemin}`);
  return valeur;
}

/**
 * Les fonds de la série. Chaque fond fixe ses couleurs de texte, d'accent et
 * de cadre ; plan.json ne nomme que le fond.
 */
function construireFonds(J) {
  const p = J.palette;
  const s = J.subjectColors;
  const clair = (fond, accent) => ({ fond, texte: p.ink, accent, lisere: p.night, sombre: false });
  return {
    nuit: {
      fond: p.night,
      halo: p.nightSoft,
      texte: p.white,
      accent: p.reward,
      lisere: p.nightSoft,
      sombre: true,
    },
    toile: clair(p.canvas, p.brand),
    bleu: clair(p.brandTint, p.brandInk),
    soleil: clair(p.rewardTint, p.rewardInk),
    langage: clair(s.language.tint, s.language.ink),
    lecture: clair(s.reading.tint, s.reading.ink),
    ecriture: clair(s.writing.tint, s.writing.ink),
    calcul: clair(s.math.tint, s.math.ink),
  };
}

// ── Contraste (WCAG 2.x) ───────────────────────────────────────────────────

function luminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contraste(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

// ── Typographie française ──────────────────────────────────────────────────

const NBSP = '\u00A0'; // espace insécable : avant « : », dans « »
const NNBSP = '\u202F'; // espace fine insécable : avant ! ? ;

/**
 * Typographie française appliquée au rendu (le texte de plan.json reste tel
 * quel) : apostrophe typographique, guillemets français, espaces insécables
 * avant la ponctuation haute, et mots d'une ou deux lettres liés au suivant
 * (jamais « le », « du » ou « à » en fin de ligne).
 */
function typographier(texte) {
  return texte
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/'/g, '’')
    .replace(/"([^"]*)"/g, '«$1»')
    .replace(/«\s*/g, `«${NBSP}`)
    .replace(/\s*»/g, `${NBSP}»`)
    .replace(/\s*([!?;])/g, `${NNBSP}$1`)
    .replace(/\s*:(?=\s|$)/g, `${NBSP}:`)
    .replace(/(?<=^|[\s\u00A0])([\p{L}’]{1,2}) (?=[\p{L}\d])/gu, `$1${NBSP}`);
}

const echapper = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** La légende en HTML : accents colorés, un groupe accentué ne se coupe pas. */
function legendeHtml(plan, theme, J, alertes) {
  const texte = typographier(plan.legende);
  const accents = [plan.accent ?? []].flat().map(typographier);
  const couleurs = [plan.accentCouleurs ?? []].flat();
  const morceaux = [];
  let curseur = 0;
  const trouves = accents
    .map((a, i) => ({ a, i, pos: texte.indexOf(a) }))
    .filter(({ a, pos }) => {
      if (pos < 0)
        alertes.push(`${plan.id} : accent « ${a} » absent de la légende — rendu sans accent`);
      return pos >= 0;
    })
    .sort((x, y) => x.pos - y.pos);
  for (const { a, i, pos } of trouves) {
    if (pos < curseur) continue;
    morceaux.push(echapper(texte.slice(curseur, pos)));
    const couleur = couleurs[i] ? jeton(J, couleurs[i]) : theme.accent;
    morceaux.push(`<span class="accent" style="color:${couleur}">${echapper(a)}</span>`);
    curseur = pos + a.length;
  }
  morceaux.push(echapper(texte.slice(curseur)));
  return {
    html: morceaux.join(''),
    couleursAccent: trouves.map(({ i }) => (couleurs[i] ? jeton(J, couleurs[i]) : theme.accent)),
  };
}

// ── Fichiers ───────────────────────────────────────────────────────────────

function polices() {
  return [
    [800, 'assets/fonts/EcolnaSans-ExtraBold.ttf'],
    [700, 'assets/fonts/EcolnaSans-Bold.ttf'],
  ]
    .map(([graisse, f]) => {
      const chemin = join(ROOT, f);
      if (!existsSync(chemin)) throw new Error(`police introuvable : ${f}`);
      const b64 = readFileSync(chemin).toString('base64');
      return `@font-face{font-family:"Ecolna Sans";font-weight:${graisse};src:url(data:font/ttf;base64,${b64}) format("truetype")}`;
    })
    .join('\n');
}

/** En-tête PNG : dimensions et type de couleur (2 = RVB 8 bits, sans alpha). */
function entetePng(fichier) {
  const b = readFileSync(fichier);
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error(`${fichier} n'est pas un PNG`);
  return {
    w: b.readUInt32BE(16),
    h: b.readUInt32BE(20),
    profondeur: b[24],
    type: b[25],
    poids: b.length,
  };
}

const dataUri = (fichier) => `data:image/png;base64,${readFileSync(fichier).toString('base64')}`;

// ── Gabarit ────────────────────────────────────────────────────────────────

function gabarit(spec, brute, famille, corps) {
  const G = GABARITS[famille];
  const { w: W, h: H } = spec;
  const u = famille === 'tablette' ? H / 100 : W / 100;
  const haut = G.haut * u;
  const bloc = 2 * G.interligne * corps;
  const ecart = G.ecart * u;
  const bas = G.bas * u;
  const lisere = Math.max(2, Math.round(G.lisere * u));
  let ecranH = H - haut - bloc - ecart - bas - 2 * lisere;
  let ecranW = (ecranH * brute.w) / brute.h;
  const ecranWMax = W - 2 * G.coteMin * u - 2 * lisere;
  let decalage = 0;
  if (ecranW > ecranWMax) {
    ecranW = ecranWMax;
    const h = (ecranW * brute.h) / brute.w;
    decalage = (ecranH - h) / 2; // l'air gagné se partage au-dessus et au-dessous
    ecranH = h;
  }
  ecranW = Math.round(ecranW);
  ecranH = (ecranW * brute.h) / brute.w; // proportions exactes de la capture
  const rayon = Math.round(ecranW * G.rayon);
  return {
    W,
    H,
    u,
    legende: {
      x: (W - G.mesure * u) / 2,
      y: haut + decalage * 0.4,
      w: G.mesure * u,
      h: bloc,
      corps,
      interligne: G.interligne,
    },
    appareil: {
      x: (W - ecranW - 2 * lisere) / 2,
      y: haut + bloc + ecart + decalage * 1.2,
      ecranW,
      ecranH,
      lisere,
      rayon,
    },
  };
}

// ── Pages ──────────────────────────────────────────────────────────────────

const CSS_COMMUN = (css) => `${css}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{overflow:hidden}
  .legende{position:absolute;display:flex;align-items:center;justify-content:center;text-align:center}
  .legende h1{font-family:"Ecolna Sans",sans-serif;font-weight:800;letter-spacing:-0.022em;
    text-wrap:balance;font-kerning:normal;hyphens:manual;overflow-wrap:normal}
  .accent{white-space:nowrap}`;

function pageComposition(css, g, theme, legende, image, J) {
  const { appareil: a, legende: l } = g;
  const ombre = J.colors.shadow;
  const rvba = (hex, alpha) => {
    const n = hex.replace('#', '');
    return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${alpha})`;
  };
  const u = g.u;
  // Clair : deux ombres froides en couches (tokens/shadows.ts, « floating », à
  // l'échelle de l'affiche). Nuit : pas d'ombre visible — un filet de verre
  // détache le cadre, un halo nuit douce l'éclaire par-derrière.
  const ombreCadre = theme.sombre
    ? `0 0 0 ${Math.max(1, Math.round(u * 0.12))}px ${J.colors.onColorGlass}, 0 ${u * 1.6}px ${u * 6}px ${rvba(ombre, 0.45)}`
    : `0 ${u * 0.35}px ${u * 1.1}px ${rvba(ombre, 0.1)}, 0 ${u * 2.2}px ${u * 6.5}px ${rvba(ombre, 0.17)}`;
  const fond = theme.sombre
    ? `radial-gradient(ellipse ${g.W * 0.75}px ${g.H * 0.55}px at 50% ${((a.y + a.ecranH * 0.5) / g.H) * 100}%, ${theme.halo} 0%, ${theme.fond} 100%)`
    : theme.fond;
  return `<!doctype html><meta charset="utf-8"><style>${CSS_COMMUN(css)}
  html,body{width:${g.W}px;height:${g.H}px;background:${theme.fond}}
  body{background:${fond}}
  .legende{left:${l.x}px;top:${l.y}px;width:${l.w}px;height:${l.h}px}
  .legende h1{font-size:${l.corps}px;line-height:${l.interligne};color:${theme.texte}}
  .cadre{position:absolute;left:${a.x}px;top:${a.y}px;padding:${a.lisere}px;background:${theme.lisere};
    border-radius:${a.rayon + a.lisere}px;box-shadow:${ombreCadre}}
  .cadre img{display:block;width:${a.ecranW}px;height:${a.ecranH}px;border-radius:${a.rayon}px}
  </style>
  <div class="legende"><h1>${legende}</h1></div>
  <div class="cadre"><img src="${image}" alt=""></div>`;
}

/** Plus grand corps (px entiers) où toutes les légendes tiennent en deux lignes. */
async function corpsDeSerie(page, css, legendes, largeur, corpsMax, interligne) {
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>${CSS_COMMUN(css)}
    .m{position:absolute;left:0;top:0;width:${largeur}px;display:block}
    .m h1{line-height:${interligne}}</style>
    ${legendes.map((h) => `<div class="legende m"><h1>${h}</h1></div>`).join('')}`);
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(
    ({ max, interligne: lh }) => {
      const titres = [...document.querySelectorAll('.m h1')];
      const lignes = (h, c) => {
        h.style.fontSize = `${c}px`;
        return Math.round(h.getBoundingClientRect().height / (c * lh));
      };
      for (let c = Math.floor(max); c > 20; c -= 1) {
        if (titres.every((h) => lignes(h, c) <= 2)) return c;
      }
      return 20;
    },
    { max: corpsMax, interligne },
  );
}

/**
 * Les coins arrondis de l'écran masquent un quart de disque à chaque coin de
 * la capture. On vérifie, sur les pixels bruts, que ces zones ne portent que
 * le fond uni de l'écran : rien de l'app n'est caché.
 */
async function verifierCoins(page, image, rayonBrut) {
  return page.evaluate(
    async ({ src, r }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const R = Math.ceil(r);
      let pire = 0;
      for (const [cx, cy] of [
        [0, 0],
        [c.width - R, 0],
        [0, c.height - R],
        [c.width - R, c.height - R],
      ]) {
        const d = ctx.getImageData(cx, cy, R, R).data;
        // Le pixel du coin même (hors de tout contenu) sert de référence.
        const ix = cx === 0 ? 0 : R - 1;
        const iy = cy === 0 ? 0 : R - 1;
        const ref = (iy * R + ix) * 4;
        const centreX = cx === 0 ? r : R - r;
        const centreY = cy === 0 ? r : R - r;
        for (let y = 0; y < R; y += 1) {
          for (let x = 0; x < R; x += 1) {
            const dx = x + 0.5 - centreX;
            const dy = y + 0.5 - centreY;
            const horsDisque = Math.hypot(dx, dy) > r - 1;
            const dansCoin =
              (cx === 0 ? x + 0.5 < r : x + 0.5 > R - r) &&
              (cy === 0 ? y + 0.5 < r : y + 0.5 > R - r);
            if (!horsDisque || !dansCoin) continue;
            const k = (y * R + x) * 4;
            pire = Math.max(
              pire,
              Math.abs(d[k] - d[ref]),
              Math.abs(d[k + 1] - d[ref + 1]),
              Math.abs(d[k + 2] - d[ref + 2]),
            );
          }
        }
      }
      return pire;
    },
    { src: image, r: rayonBrut },
  );
}

// ── Planche de contrôle ────────────────────────────────────────────────────

async function rendrePlanche(browser, css, sorties, fichier) {
  const HAUT = 300; // hauteur d'une vignette de fiche de store
  // Chaque sortie est d'abord réduite à la taille d'une vignette (une à la
  // fois : décoder trente images de 2752 px dans une seule page épuise Chromium).
  const page = await browser.newPage({
    viewport: { width: 2400, height: 800 },
    deviceScaleFactor: 1,
  });
  await page.setContent('<!doctype html><meta charset="utf-8">');
  const vignettes = {};
  for (const [format, liste] of Object.entries(sorties)) {
    vignettes[format] = [];
    for (const f of liste) {
      const src = await page.evaluate(
        async ({ uri, h }) => {
          const img = new Image();
          img.src = uri;
          await img.decode();
          const w = Math.round((img.naturalWidth * h) / img.naturalHeight);
          const bmp = await createImageBitmap(img, {
            resizeWidth: w,
            resizeHeight: h,
            resizeQuality: 'high',
          });
          const c = document.createElement('canvas');
          c.width = w;
          c.height = h;
          c.getContext('2d').drawImage(bmp, 0, 0);
          return c.toDataURL('image/png');
        },
        { uri: dataUri(f), h: HAUT },
      );
      vignettes[format].push({ nom: relative(join(OUT, format), f), src });
    }
  }
  const groupes = Object.entries(vignettes).filter(([, l]) => l.length > 0);
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>${css}
    *{box-sizing:border-box;margin:0}
    body{background:${J.palette.white};color:${J.palette.ink};font-family:"Ecolna Sans",sans-serif;padding:32px;width:2400px}
    h2{font-size:22px;font-weight:800;margin:28px 0 12px}
    .r{display:flex;flex-wrap:wrap;gap:16px}
    figure{display:flex;flex-direction:column;gap:6px}
    img{height:${HAUT}px;display:block;outline:1px solid ${J.palette.border}}
    figcaption{font-size:14px;font-weight:700}</style>
    ${groupes
      .map(
        ([format, l]) =>
          `<h2>${format} — vignettes à ${HAUT} px de haut</h2><div class="r">${l
            .map(
              ({ nom, src }) =>
                `<figure><img src="${src}"><figcaption>${nom}</figcaption></figure>`,
            )
            .join('')}</div>`,
      )
      .join('')}`);
  await page.evaluate(() =>
    Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode())]),
  );
  mkdirSync(dirname(fichier), { recursive: true });
  await page.screenshot({ path: fichier, fullPage: true });
  await page.close();
  console.log(`planche de contrôle : ${fichier}`);
}

// ── Programme ──────────────────────────────────────────────────────────────

const PLAN = JSON.parse(readFileSync(PLAN_JSON, 'utf8'));
const J = await chargerJetons();
const FONDS = construireFonds(J);
const alertes = [];
const erreurs = [];

const formats = Object.entries(PLAN.formats).filter(
  ([f]) => !seulsFormats || seulsFormats.includes(f),
);
if (seulsFormats) {
  for (const f of seulsFormats) if (!PLAN.formats[f]) erreurs.push(`format inconnu : ${f}`);
}
if (seulsPlans) {
  for (const id of seulsPlans)
    if (!PLAN.plans.some((p) => p.id === id)) erreurs.push(`plan inconnu : ${id}`);
}
if (erreurs.length > 0) {
  for (const e of erreurs) console.error(`❌ ${e}`);
  process.exit(2);
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

const css = polices();
const sorties = {};
let produites = 0;

for (const [format, spec] of formats) {
  const famille = format.includes('tablette') || format.includes('ipad') ? 'tablette' : 'telephone';
  const play = format.startsWith('play-');
  const plans = PLAN.plans.filter((p) => !play || p.play !== false);
  const G = GABARITS[famille];
  const dossier = join(OUT, format);
  mkdirSync(dossier, { recursive: true });

  const max = play ? MAX_PLAY : MAX_APPLE;
  if (plans.length > max)
    erreurs.push(`${format} : ${plans.length} captures, la console en accepte ${max}`);
  if (plans.length < (spec.min ?? 1))
    erreurs.push(`${format} : ${plans.length} capture(s), il en faut ${spec.min}`);

  const brutes = Object.fromEntries(
    plans.map((p) => [
      p.id,
      join(RAW, famille === 'tablette' ? `${p.id}@tablette.png` : `${p.id}.png`),
    ]),
  );
  const manquantes = plans.filter((p) => !existsSync(brutes[p.id]));
  for (const p of manquantes)
    erreurs.push(`${format} : capture brute manquante ${relative(ROOT, brutes[p.id])}`);
  const presentes = plans.filter((p) => existsSync(brutes[p.id]));
  if (presentes.length === 0) continue;

  // Toutes les captures d'une famille ont les mêmes dimensions : le cadre est le même.
  const dims = presentes.map((p) => ({ id: p.id, ...entetePng(brutes[p.id]) }));
  const brute = dims[0];
  for (const d of dims) {
    if (d.w !== brute.w || d.h !== brute.h)
      erreurs.push(`${d.id} (${famille}) : ${d.w}×${d.h}, attendu ${brute.w}×${brute.h}`);
  }

  // Une taille de légende pour toute la série du format, calculée sur TOUS ses
  // plans (et non sur les seuls --only) : une recomposition partielle reste
  // identique à la série.
  const page = await browser.newPage({
    viewport: { width: spec.w, height: spec.h },
    deviceScaleFactor: 1,
  });
  const u = famille === 'tablette' ? spec.h / 100 : spec.w / 100;
  const legendes = Object.fromEntries(
    presentes.map((p) => {
      const theme = FONDS[p.fond ?? 'toile'];
      if (!theme) {
        erreurs.push(`${p.id} : fond « ${p.fond} » inconnu (${Object.keys(FONDS).join(', ')})`);
        return [p.id, { html: echapper(p.legende), couleursAccent: [] }];
      }
      return [p.id, legendeHtml(p, theme, J, format === formats[0][0] ? alertes : [])];
    }),
  );
  const corps = await corpsDeSerie(
    page,
    css,
    Object.values(legendes).map((l) => l.html),
    G.mesure * u,
    G.corpsMax * u,
    G.interligne,
  );

  sorties[format] = [];
  for (const p of presentes) {
    if (seulsPlans && !seulsPlans.includes(p.id)) {
      const existante = join(dossier, `${p.id}.png`);
      if (existsSync(existante)) sorties[format].push(existante);
      continue;
    }
    const theme = FONDS[p.fond ?? 'toile'];
    if (!theme) continue;
    for (const [role, couleur] of [
      ['texte', theme.texte],
      ...legendes[p.id].couleursAccent.map((c) => ['accent', c]),
    ]) {
      const ratio = contraste(couleur, theme.fond);
      if (ratio < 4.5)
        alertes.push(
          `${format}/${p.id} : ${role} ${couleur} sur ${theme.fond} = ${ratio.toFixed(1)}:1 (< 4,5:1)`,
        );
    }
    const g = gabarit(spec, brute, famille, corps);
    const image = dataUri(brutes[p.id]);
    await page.setContent(pageComposition(css, g, theme, legendes[p.id].html, image, J));
    await page.evaluate(() =>
      Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode())]),
    );

    const lignes = await page.evaluate(() => {
      const h = document.querySelector('.legende h1');
      return Math.round(
        h.getBoundingClientRect().height / parseFloat(getComputedStyle(h).lineHeight),
      );
    });
    if (lignes > 2) erreurs.push(`${format}/${p.id} : légende sur ${lignes} lignes`);

    const pire = await verifierCoins(page, image, (g.appareil.rayon * brute.w) / g.appareil.ecranW);
    if (pire > 10)
      alertes.push(
        `${format}/${p.id} : les coins arrondis masquent autre chose que le fond (écart ${pire}/255)`,
      );

    const sortie = join(dossier, `${p.id}.png`);
    await page.screenshot({
      path: sortie,
      type: 'png',
      clip: { x: 0, y: 0, width: spec.w, height: spec.h },
    });
    const e = entetePng(sortie);
    if (e.w !== spec.w || e.h !== spec.h)
      erreurs.push(`${relative(ROOT, sortie)} : ${e.w}×${e.h}, attendu ${spec.w}×${spec.h}`);
    if (e.type !== 2 || e.profondeur !== 8)
      erreurs.push(
        `${relative(ROOT, sortie)} : PNG de type ${e.type}/${e.profondeur} bits, attendu RVB 8 bits sans alpha`,
      );
    if (e.poids > POIDS_MAX)
      erreurs.push(`${relative(ROOT, sortie)} : ${(e.poids / 1048576).toFixed(1)} Mo (> 8 Mo)`);
    sorties[format].push(sortie);
    produites += 1;
    console.log(
      `  ${format}/${p.id}.png  ${spec.w}×${spec.h}  ${(e.poids / 1048576).toFixed(2)} Mo  « ${p.fond ?? 'toile'} »`,
    );
  }
  await page.close();
  console.log(`${format} : légende ${corps} px, ${sorties[format].length} capture(s)`);

  // Série complète : on retire ce qui n'appartient plus au plan (plan supprimé,
  // passé en « play » : false…) pour ne jamais téléverser une capture périmée.
  if (!seulsPlans) {
    const attendus = new Set(presentes.map((p) => `${p.id}.png`));
    for (const f of readdirSync(dossier)) {
      if (f.endsWith('.png') && !attendus.has(f) && statSync(join(dossier, f)).isFile()) {
        rmSync(join(dossier, f));
        console.log(`  retiré ${format}/${f} (absent du plan)`);
      }
    }
  }
}

if (planche) await rendrePlanche(browser, css, sorties, planche);
await browser.close();

console.log(`\n${produites} capture(s) composée(s) dans ${relative(ROOT, OUT)}/`);
for (const a of alertes) console.warn(`⚠️  ${a}`);
for (const e of erreurs) console.error(`❌ ${e}`);
if (erreurs.length > 0) process.exit(1);
