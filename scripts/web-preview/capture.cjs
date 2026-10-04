/* eslint-disable */
// Banc de rendu web — captures d'écran de l'app RÉELLE (docs/visual-qa.md).
//
//   node scripts/web-preview/capture.cjs <route> <nom> [ipad-l ipad-p ipad13-l iphone69 phone phone-l tab7-l tab7-p tab10-l]
//
//   SEED=1        sème le profil de démonstration « Amina », CP1, 12 leçons ;
//                 ses badges sont CALCULÉS par les règles de l'app (voir seed)
//   FRESH=1       repart d'un navigateur vierge (premier lancement)
//   STEP=leçon:n  ouvre une leçon à l'étape n (reprise de leçon)
//   CLICK="a|b"   touche ces textes dans l'ordre ; préfixes : label:, fill:place=texte, wait:ms ;
//                 « gate » : lit l'opération de la porte parentale, calcule et entre la réponse
//   SCROLL=…      fait défiler le contenu avant la photo :
//                   n                  de n px (CSS) le plus grand conteneur défilant
//                   haut:texte[@m]     le haut de ce texte à m px (défaut 16) du haut de son conteneur
//                   bas:texte[@m]      le bas de ce texte à m px (défaut 16) du bas de son conteneur
//                   fin                jusqu'au bout du plus grand conteneur défilant
//   OUT=dossier   dossier des captures (défaut .cache/screens)
//   REDUCED=1     préférence « mouvement réduit » du système
//   WAIT=ms       attente avant chaque capture (défaut 1500)
//   DPR=n         densité de pixels (défaut 1) : 3 pour l'iPhone, 2 pour l'iPad et la tablette Android
//
// Avec SEED=1, une route d'écran de réussite (…/lesson/result?stars=…&lessonId=…&badges=…)
// est VÉRIFIÉE contre le profil semé : la leçon doit y être terminée avec ce
// nombre d'étoiles, et les badges doivent être exactement ceux que cette leçon
// a débloqués. Un état impossible fait échouer la capture.
//
// Playwright : `require('playwright')`, sinon PLAYWRIGHT_MODULE (chemin du
// paquet). Chromium : celui de Playwright, ou CHROME_PATH. Node ≥ 22.18 pour
// SEED=1 (les règles des badges sont lues dans leur source TypeScript).
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

function loadPlaywright() {
  try {
    return require('playwright');
  } catch {
    if (process.env.PLAYWRIGHT_MODULE) return require(process.env.PLAYWRIGHT_MODULE);
    throw new Error('Playwright introuvable : `npx playwright --version`, ou PLAYWRIGHT_MODULE=<chemin>.');
  }
}

const DEVICES = {
  'ipad-l': { width: 1180, height: 820 },
  'ipad-p': { width: 820, height: 1180 },
  'ipad13-l': { width: 1376, height: 1032 },
  phone: { width: 390, height: 844 },
  // Les formats exacts des stores : iPhone 6,9" (×3 → 1320 × 2868).
  iphone69: { width: 440, height: 956 },
  'phone-l': { width: 844, height: 390 },
  // Les tablettes Android du pilote : 7" et 10" en paysage, 7" en portrait.
  // tab10-l ×2 → 2560 × 1600 : la tablette des captures Play.
  'tab7-l': { width: 1024, height: 600 },
  'tab7-p': { width: 600, height: 1024 },
  'tab10-l': { width: 1280, height: 800 },
};
const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081';
const ROOT = path.join(__dirname, '../..');
const OUT = path.resolve(process.env.OUT ?? path.join(ROOT, '.cache/screens'));
const PROFILE_DIR = path.join(ROOT, '.cache/web-preview-profile');

// ── Profil de démonstration ────────────────────────────────────────────────
//
// Le même que scripts/tools/seed-demo-profile.mjs (les deux doivent rester
// identiques) : les 12 premières leçons de CP1 dans l'ordre du programme,
// c'est-à-dire le monde « Moi et mon école » (10 leçons de langage) puis deux
// leçons de « Ma maison, mon village ».
//
// Étoiles variées : un parcours crédible, pas un sans-faute irréaliste.
const ETOILES = [3, 3, 2, 3, 3, 2, 3, 3, 3, 3, 2, 3];
// Jours de recul de chaque leçon : un jour sur deux pendant deux semaines,
// puis quatre jours de suite jusqu'à aujourd'hui (la série est visible).
// La 10ᵉ leçon (cp1-langage-famille-2) ferme le premier monde ; la série de
// trois jours n'arrive qu'à la 11ᵉ — l'écran de réussite 07 montre donc
// exactement « Monde terminé » et « Belle parole ».
const RECUL = (i) => (i < 8 ? 20 - i * 2 : 11 - i);

/**
 * Les règles des badges de l'app, lues dans leur source TypeScript (Node ≥
 * 22.18 retire les types) : jamais une liste recopiée à la main.
 */
async function reglesDesBadges() {
  // « Module type … is not specified » : sans objet ici ; les autres avertissements restent.
  process.removeAllListeners('warning');
  process.on('warning', (w) => {
    if (w.code !== 'MODULE_TYPELESS_PACKAGE_JSON') console.warn(String(w));
  });
  try {
    const achievements = await import(pathToFileURL(path.join(ROOT, 'src/features/achievements/domain/achievements.ts')).href);
    const streaks = await import(pathToFileURL(path.join(ROOT, 'src/features/progress/domain/streaks.ts')).href);
    return { earnedAchievements: achievements.earnedAchievements, longestStreak: streaks.longestStreak };
  } catch (error) {
    throw new Error(`règles des badges illisibles (Node ≥ 22.18 requis, actuel ${process.version}) : ${error.message}`);
  }
}

/**
 * Les chiffres que lisent les règles, par les MÊMES requêtes que
 * src/features/achievements/infrastructure/achievements-repository.ts
 * (loadStats) et progress-repository.ts (findCompletedDays).
 */
async function lireStats(page, profil) {
  return page.evaluate(async (P) => {
    const db = globalThis.__ecolnaDb;
    const totals = await db.getFirstAsync(
      `SELECT COUNT(*) AS completed,
              SUM(CASE WHEN stars >= 3 THEN 1 ELSE 0 END) AS perfect,
              COALESCE(SUM(stars), 0) AS stars
       FROM lesson_progress
       WHERE child_profile_id = ? AND status = 'completed'`,
      P,
    );
    const bySubject = await db.getAllAsync(
      `SELECT w.subject AS subject, COUNT(*) AS n
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       JOIN curriculum_worlds w ON w.id = l.world_id
       WHERE lp.child_profile_id = ? AND lp.status = 'completed'
       GROUP BY w.subject`,
      P,
    );
    const worlds = await db.getFirstAsync(
      `SELECT COUNT(*) AS n FROM (
         SELECT w.id
         FROM curriculum_worlds w
         JOIN lessons l ON l.world_id = w.id
         LEFT JOIN lesson_progress lp
           ON lp.lesson_id = l.id
          AND lp.child_profile_id = ?
          AND lp.status = 'completed'
         GROUP BY w.id
         HAVING COUNT(l.id) > 0 AND COUNT(l.id) = COUNT(lp.lesson_id)
       )`,
      P,
    );
    const days = await db.getAllAsync(
      `SELECT DISTINCT date(completed_at, 'localtime') AS day
       FROM lesson_progress
       WHERE child_profile_id = ? AND status = 'completed' AND completed_at IS NOT NULL
       ORDER BY day`,
      P,
    );
    const parMatiere = { language: 0, reading: 0, writing: 0, math: 0 };
    for (const r of bySubject) parMatiere[r.subject] = r.n;
    return {
      completedLessons: totals?.completed ?? 0,
      perfectLessons: totals?.perfect ?? 0,
      totalStars: totals?.stars ?? 0,
      completedBySubject: parMatiere,
      completedWorlds: worlds?.n ?? 0,
      days: days.map((d) => d.day),
    };
  }, profil);
}

/**
 * Sème le profil, leçon après leçon, et rejoue après chacune le calcul des
 * badges de l'app (syncAchievements : statistiques → règles → badges
 * nouveaux). Chaque badge reçoit la date de la leçon qui l'a débloqué ; on
 * sait ainsi ce que l'écran de réussite de chaque leçon a célébré.
 */
async function seed(page) {
  const regles = await reglesDesBadges();
  await page.waitForFunction(() => globalThis.__ecolnaDb, null, { timeout: 120000 });
  await page.waitForFunction(
    async () => {
      try {
        // L'import du programme se termine en écrivant sa version : semer avant
        // reviendrait à écrire dans sa transaction, annulée au rechargement.
        const r = await globalThis.__ecolnaDb.getFirstAsync('SELECT COUNT(*) n FROM content_versions');
        return r && r.n > 0;
      } catch {
        return false;
      }
    },
    null,
    { timeout: 180000, polling: 1000 },
  );
  const P = 'demo-amina';
  // La dernière séance (12 min) vient de se terminer.
  const maintenant = Date.now() - 15 * 60000;
  const jour = (r) => new Date(maintenant - r * 86400000).toISOString();
  const lecons = await page.evaluate(
    async ({ P, cree, maj }) => {
      const db = globalThis.__ecolnaDb;
      await db.execAsync("DELETE FROM child_profiles WHERE id = 'demo-amina';");
      // Le profil supprimé emporte ses lignes (clés étrangères) ; on purge quand
      // même, au cas où la base du navigateur ne les appliquerait pas.
      for (const t of ['lesson_progress', 'learning_sessions', 'skill_mastery', 'revision_queue', 'achievements']) {
        await db.runAsync(`DELETE FROM ${t} WHERE child_profile_id = ?`, P);
      }
      await db.runAsync(
        'INSERT INTO child_profiles (id, first_name, avatar_id, level, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
        P, 'Amina', 'avatar-2', 'CP1', cree, maj,
      );
      return db.getAllAsync(
        `SELECT l.id FROM lessons l JOIN curriculum_worlds w ON w.id = l.world_id
         WHERE w.level_id = 'CP1' ORDER BY w.sort_order, l.sort_order LIMIT 12`,
      );
    },
    { P, cree: jour(21), maj: jour(0) },
  );

  const gagnes = new Map(); // badge → date de la leçon qui l'a débloqué
  const parLecon = {}; // leçon → badges célébrés à sa réussite, dans l'ordre de l'app
  const etoiles = {};
  for (let i = 0; i < lecons.length; i++) {
    const quand = jour(RECUL(i));
    etoiles[lecons[i].id] = ETOILES[i];
    await page.evaluate(
      async ({ P, id, i, stars, quand, fin }) => {
        const db = globalThis.__ecolnaDb;
        await db.runAsync(
          `INSERT OR REPLACE INTO lesson_progress (child_profile_id, lesson_id, status, stars, current_step_index,
           hints_used, error_count, completed_at, updated_at) VALUES (?, ?, 'completed', ?, 0, ?, ?, ?, ?)`,
          P, id, stars, i % 3 === 0 ? 1 : 0, i % 4, quand, quand,
        );
        await db.runAsync(
          'INSERT OR REPLACE INTO learning_sessions (id, child_profile_id, started_at, ended_at, lessons_completed) VALUES (?, ?, ?, ?, 1)',
          // Une vraie séance dure : 12 minutes, pas zéro (le tableau parent les compte).
          `demo-s-${i}`, P, quand, fin,
        );
      },
      { P, id: lecons[i].id, i, stars: ETOILES[i], quand, fin: new Date(Date.parse(quand) + 12 * 60000).toISOString() },
    );
    const { days, ...stats } = await lireStats(page, P);
    const nouveaux = regles
      .earnedAchievements({ ...stats, bestStreakDays: regles.longestStreak(days) })
      .filter((b) => !gagnes.has(b));
    for (const b of nouveaux) gagnes.set(b, quand);
    parLecon[lecons[i].id] = nouveaux;
  }

  await page.evaluate(
    async ({ P, lecons, badges, auj, hier }) => {
      const db = globalThis.__ecolnaDb;
      const jourDe = (k) => new Date(Date.now() - (k % 6) * 86400000).toISOString();
      const notions = await db.getAllAsync(
        `SELECT DISTINCT skill_id FROM lesson_skills WHERE lesson_id IN (${lecons.map(() => '?').join(',')})`,
        ...lecons,
      );
      // Maîtrise par notion, et une notion laissée en difficulté pour que
      // l'atelier de révision ait quelque chose à montrer.
      for (let i = 0; i < notions.length; i++) {
        const d = i === 1;
        await db.runAsync(
          `INSERT OR REPLACE INTO skill_mastery (child_profile_id, skill_id, correct_count, error_count, hint_count,
           last_practiced_at, mastery) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          P, notions[i].skill_id, d ? 2 : 5, d ? 4 : 0, d ? 2 : 0, jourDe(i), d ? 'needs_review' : 'mastered',
        );
      }
      if (notions[1]) {
        await db.runAsync(
          `INSERT OR REPLACE INTO revision_queue (child_profile_id, skill_id, reason, priority, due_at, resolved_at, created_at)
           VALUES (?, ?, 'repeated_errors', 84, ?, NULL, ?)`,
          P, notions[1].skill_id, hier, hier,
        );
      }
      for (const [b, quand] of badges) {
        await db.runAsync('INSERT OR REPLACE INTO achievements (child_profile_id, achievement_id, earned_at) VALUES (?, ?, ?)', P, b, quand);
      }
      await db.runAsync("INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('active_profile_id', ?, ?)", P, auj);
      await db.runAsync("INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('onboarding_done', 'true', ?)", auj);
    },
    { P, lecons: lecons.map((l) => l.id), badges: [...gagnes], auj: jour(0), hier: jour(1) },
  );
  return { lecons: lecons.length, badges: [...gagnes.keys()], parLecon, etoiles };
}

/**
 * Un écran de réussite doit montrer un moment que ce profil a réellement
 * vécu : la leçon terminée, avec ces étoiles, et les badges qu'elle a
 * débloqués — ni plus, ni moins, dans l'ordre où l'app les célèbre.
 */
function verifierReussite(route, profil) {
  if (!/\/lesson\/result(\?|$)/.test(route)) return;
  const q = new URLSearchParams(route.split('?')[1] ?? '');
  const lecon = q.get('lessonId');
  const etat = `écran de réussite impossible pour le profil semé (${route})`;
  if (!lecon) throw new Error(`${etat} : lessonId manquant`);
  if (!(lecon in profil.parLecon)) {
    throw new Error(`${etat} : « ${lecon} » n'est pas une leçon terminée du profil (${Object.keys(profil.parLecon).join(', ')})`);
  }
  const etoiles = Number(q.get('stars') ?? '1');
  if (etoiles !== profil.etoiles[lecon]) {
    throw new Error(`${etat} : ${etoiles} étoile(s) affichée(s), la leçon en a ${profil.etoiles[lecon]} dans le profil`);
  }
  const affiches = (q.get('badges') ?? '').split(',').filter(Boolean).join(',');
  const debloques = profil.parLecon[lecon].join(',');
  if (affiches !== debloques) {
    throw new Error(`${etat} : badges « ${affiches || '—'} », or cette leçon a débloqué « ${debloques || 'aucun'} »`);
  }
  console.log(`réussite vérifiée : ${lecon}, ${etoiles} étoile(s), badges ${debloques || 'aucun'}`);
}

// ── Gestes ─────────────────────────────────────────────────────────────────

/** Un libellé de src/localization/fr/strings.ts (repli de la porte parentale). */
function libelle(cle) {
  const source = fs.readFileSync(path.join(ROOT, 'src/localization/fr/strings.ts'), 'utf8');
  const m = source.match(new RegExp(`\\b${cle}:\\s*'([^']+)'`));
  return m ? m[1].replace(/\\'/g, "'") : null;
}

/**
 * La porte parentale : lit l'opération affichée (« a × b = ? »), écrit le
 * produit et valide. Fonctionne quelle que soit la question tirée.
 */
async function franchirPorte(page) {
  const texte = await page.locator('body').innerText();
  const m = texte.match(/(\d+)\s*[×xX*]\s*(\d+)\s*=/);
  if (!m) throw new Error('porte parentale : aucune opération « a × b = ? » à l\'écran');
  const reponse = String(Number(m[1]) * Number(m[2]));
  const champ = page.locator('input:visible').first();
  await champ.click({ timeout: 15000 });
  await champ.fill(reponse);
  await champ.press('Enter');
  const ouverte = () =>
    page
      .waitForFunction(() => document.querySelectorAll('input').length === 0 ||
        [...document.querySelectorAll('input')].every((i) => !i.offsetParent), null, { timeout: 8000 })
      .then(() => true, () => false);
  if (!(await ouverte())) {
    // Repli : le bouton « Entrer » (si la validation au clavier change).
    const entrer = libelle('gateEnter');
    if (entrer) await page.getByText(entrer, { exact: true }).first().click({ timeout: 5000 }).catch(() => {});
    if (!(await ouverte())) throw new Error(`porte parentale non franchie (${m[1]} × ${m[2]} = ${reponse})`);
  }
  console.log(`porte parentale : ${m[1]} × ${m[2]} = ${reponse}`);
}

/** SCROLL : voir l'en-tête. Retourne le défilement appliqué (px CSS). */
async function defiler(page, consigne) {
  const r = await page.evaluate((c) => {
    const defilant = (el) => {
      const s = getComputedStyle(el);
      return /(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 1;
    };
    const visibles = [...document.querySelectorAll('*')].filter((el) => defilant(el) && el.offsetParent !== null);
    const principal = () =>
      visibles.sort((a, b) => b.clientWidth * b.clientHeight - a.clientWidth * a.clientHeight)[0];
    const m = c.match(/^(haut|bas):(.+?)(?:@(-?\d+))?$/);
    if (/^-?\d+$/.test(c) || c === 'fin') {
      const el = principal();
      if (!el) return { erreur: 'aucun conteneur défilant' };
      el.scrollTop = c === 'fin' ? el.scrollHeight : el.scrollTop + Number(c);
      return { y: el.scrollTop, max: el.scrollHeight - el.clientHeight };
    }
    if (!m) return { erreur: `consigne inconnue « ${c} »` };
    const [, bord, texte, marge = '16'] = m;
    // L'élément le plus profond dont le texte est exactement celui-ci.
    const cible = [...document.querySelectorAll('body *')]
      .filter((el) => el.offsetParent !== null && el.textContent.trim() === texte)
      .filter((el, _, tous) => !tous.some((autre) => autre !== el && el.contains(autre)))[0];
    if (!cible) return { erreur: `texte « ${texte} » introuvable` };
    let el = cible.parentElement;
    while (el && !defilant(el)) el = el.parentElement;
    if (!el) return { erreur: `« ${texte} » n'est dans aucun conteneur défilant` };
    const boite = el.getBoundingClientRect();
    const t = cible.getBoundingClientRect();
    const delta = bord === 'haut' ? t.top - boite.top - Number(marge) : t.bottom - boite.bottom + Number(marge);
    el.scrollTop += delta;
    return { y: el.scrollTop, max: el.scrollHeight - el.clientHeight, voulu: delta };
  }, consigne);
  if (r.erreur) throw new Error(`SCROLL=${consigne} : ${r.erreur}`);
  console.log(`défilement « ${consigne} » : ${Math.round(r.y)} px (max ${Math.round(r.max)})`);
  return r;
}

(async () => {
  const { chromium } = loadPlaywright();
  const [route = '/', name = 'ecran', ...devs] = process.argv.slice(2);
  const list = devs.length ? devs : ['ipad-l'];
  for (const d of list) if (!DEVICES[d]) throw new Error(`appareil inconnu : ${d} (${Object.keys(DEVICES).join(', ')})`);
  fs.mkdirSync(OUT, { recursive: true });
  if (process.env.FRESH) fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
    args: process.getuid?.() === 0 ? ['--no-sandbox'] : [],
    viewport: DEVICES[list[0]],
    deviceScaleFactor: Number(process.env.DPR ?? 1),
    // REDUCED=1 : mouvement réduit (les anneaux d'aide restent fixes 2 s).
    reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference',
  });
  await ctx.addInitScript(() => {
    const fonts = ['EcolnaSans-Regular', 'EcolnaSans-Medium', 'EcolnaSans-SemiBold', 'EcolnaSans-Bold', 'EcolnaSans-ExtraBold', 'Andika-Regular', 'Andika-Bold'];
    // Le témoin « Fast Refresh » d'Expo (un éclair en bas à gauche, quand un
    // fichier change pendant le tournage) n'est pas de l'app : jamais sur une capture.
    const css = fonts.map((f) => `@font-face{font-family:"${f}";src:url(/__fonts/${f}.ttf) format("truetype");}`).join('') +
      '*{scrollbar-width:none}.__expo_fast_refresh{display:none!important}';
    const add = () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
    if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
  });
  const page = ctx.pages()[0] ?? (await ctx.newPage());
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 180000 });
  if (process.env.SEED) {
    const profil = await seed(page);
    console.log(`profil semé : ${profil.lecons} leçons, ${profil.badges.length} badges (${profil.badges.join(', ')})`);
    verifierReussite(route, profil);
    // Laisser SQLite (WebAssembly) vider ses écritures sur le stockage du
    // navigateur avant de recharger.
    await page.waitForTimeout(2500);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 180000 });
  }
  await page.waitForTimeout(3000);
  if (process.env.STEP) {
    const [lessonId, index] = process.env.STEP.split(':');
    await page.evaluate(async ({ lessonId, index }) => {
      await globalThis.__ecolnaDb.runAsync(
        `INSERT OR REPLACE INTO lesson_progress (child_profile_id, lesson_id, status, stars, current_step_index,
         hints_used, error_count, completed_at, updated_at)
         SELECT value, ?, 'in_progress', 0, ?, 0, 0, NULL, ? FROM app_settings WHERE key = 'active_profile_id'`,
        lessonId, Number(index), new Date().toISOString(),
      );
    }, { lessonId, index });
  }
  if (route !== '/') {
    await page.waitForFunction(() => globalThis.__ecolnaRouter, null, { timeout: 60000 });
    await page.evaluate((r) => globalThis.__ecolnaRouter.push(r), route);
    await page.waitForTimeout(1500);
  }
  for (const step of (process.env.CLICK ?? '').split('|').filter(Boolean)) {
    if (step.startsWith('wait:')) await page.waitForTimeout(Number(step.slice(5)));
    else if (step === 'gate') await franchirPorte(page);
    else if (step.startsWith('label:')) await page.getByLabel(step.slice(6)).first().click({ timeout: 15000 });
    else if (step.startsWith('fill:')) {
      const [placeholder, text] = step.slice(5).split('=');
      await page.getByPlaceholder(placeholder).fill(text);
    } else await page.getByText(step, { exact: true }).first().click({ timeout: 15000 });
    await page.waitForTimeout(700);
  }
  for (const device of list) {
    await page.setViewportSize(DEVICES[device]);
    if (process.env.SCROLL) {
      await page.waitForTimeout(600); // la mise en page de ce format d'abord
      await defiler(page, process.env.SCROLL);
    }
    await page.waitForTimeout(Number(process.env.WAIT ?? 1500));
    const file = path.join(OUT, `${name}-${device}.png`);
    await page.screenshot({ path: file });
    console.log(file);
  }
  await ctx.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
