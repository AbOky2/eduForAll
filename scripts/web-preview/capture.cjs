/* eslint-disable */
// Banc de rendu web — captures d'écran de l'app RÉELLE (docs/visual-qa.md).
//
//   node scripts/web-preview/capture.cjs <route> <nom> [ipad-l ipad-p ipad13-l phone phone-l tab7-l tab7-p tab10-l]
//
//   SEED=1        sème le profil de démonstration « Amina », CP1, 12 leçons
//   FRESH=1       repart d'un navigateur vierge (premier lancement)
//   STEP=leçon:n  ouvre une leçon à l'étape n (reprise de leçon)
//   CLICK="a|b"   touche ces textes dans l'ordre ; préfixes : label:, fill:place=texte, wait:ms
//   OUT=dossier   dossier des captures (défaut .cache/screens)
//   REDUCED=1     préférence « mouvement réduit » du système
//   WAIT=ms       attente avant chaque capture (défaut 1500)
//
// Playwright : `require('playwright')`, sinon PLAYWRIGHT_MODULE (chemin du
// paquet). Chromium : celui de Playwright, ou CHROME_PATH.
const path = require('path');
const fs = require('fs');

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
  'phone-l': { width: 844, height: 390 },
  // Les tablettes Android du pilote : 7" et 10" en paysage, 7" en portrait.
  'tab7-l': { width: 1024, height: 600 },
  'tab7-p': { width: 600, height: 1024 },
  'tab10-l': { width: 1280, height: 800 },
};
const BASE = process.env.PREVIEW_URL ?? 'http://localhost:8081';
const ROOT = path.join(__dirname, '../..');
const OUT = path.resolve(process.env.OUT ?? path.join(ROOT, '.cache/screens'));
const PROFILE_DIR = path.join(ROOT, '.cache/web-preview-profile');

/** Profil de démonstration — le même que scripts/tools/seed-demo-profile.mjs. */
async function seed(page) {
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
  return page.evaluate(async () => {
    const db = globalThis.__ecolnaDb;
    const P = 'demo-amina';
    const jour = (r) => new Date(Date.now() - r * 86400000).toISOString();
    await db.execAsync("DELETE FROM child_profiles WHERE id = 'demo-amina';");
    await db.runAsync(
      'INSERT INTO child_profiles (id, first_name, avatar_id, level, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      P, 'Amina', 'avatar-2', 'CP1', jour(21), jour(0),
    );
    const lecons = await db.getAllAsync(
      `SELECT l.id FROM lessons l JOIN curriculum_worlds w ON w.id = l.world_id
       WHERE w.level_id = 'CP1' ORDER BY w.sort_order, l.sort_order LIMIT 12`,
    );
    const etoiles = [3, 3, 2, 3, 3, 2, 3, 3, 3, 2, 3, 3];
    for (let i = 0; i < lecons.length; i++) {
      const recul = i < 7 ? 20 - i * 2 : Math.max(0, 11 - i);
      await db.runAsync(
        `INSERT OR REPLACE INTO lesson_progress (child_profile_id, lesson_id, status, stars, current_step_index,
         hints_used, error_count, completed_at, updated_at) VALUES (?, ?, 'completed', ?, 0, ?, ?, ?, ?)`,
        P, lecons[i].id, etoiles[i], i % 3 === 0 ? 1 : 0, i % 4, jour(recul), jour(recul),
      );
      await db.runAsync(
        'INSERT OR REPLACE INTO learning_sessions (id, child_profile_id, started_at, ended_at, lessons_completed) VALUES (?, ?, ?, ?, 1)',
        // Une vraie séance dure : 12 minutes, pas zéro (le tableau parent les compte).
        `demo-s-${i}`, P, jour(recul), new Date(Date.parse(jour(recul)) + 12 * 60000).toISOString(),
      );
    }
    const notions = await db.getAllAsync(
      `SELECT DISTINCT skill_id FROM lesson_skills WHERE lesson_id IN (${lecons.map(() => '?').join(',')})`,
      ...lecons.map((l) => l.id),
    );
    for (let i = 0; i < notions.length; i++) {
      const d = i === 1;
      await db.runAsync(
        `INSERT OR REPLACE INTO skill_mastery (child_profile_id, skill_id, correct_count, error_count, hint_count,
         last_practiced_at, mastery) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        P, notions[i].skill_id, d ? 2 : 5, d ? 4 : 0, d ? 2 : 0, jour(i % 6), d ? 'needs_review' : 'mastered',
      );
    }
    if (notions[1]) {
      await db.runAsync(
        `INSERT OR REPLACE INTO revision_queue (child_profile_id, skill_id, reason, priority, due_at, resolved_at, created_at)
         VALUES (?, ?, 'repeated_errors', 84, ?, NULL, ?)`,
        P, notions[1].skill_id, jour(1), jour(1),
      );
    }
    for (const b of ['first-lesson', 'five-lessons', 'first-perfect', 'streak-three', 'reader']) {
      await db.runAsync('INSERT OR REPLACE INTO achievements (child_profile_id, achievement_id, earned_at) VALUES (?, ?, ?)', P, b, jour(3));
    }
    await db.runAsync("INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('active_profile_id', ?, ?)", P, jour(0));
    await db.runAsync("INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('onboarding_done', 'true', ?)", jour(0));
    return lecons.length;
  });
}

(async () => {
  const { chromium } = loadPlaywright();
  const [route = '/', name = 'ecran', ...devs] = process.argv.slice(2);
  const list = devs.length ? devs : ['ipad-l'];
  fs.mkdirSync(OUT, { recursive: true });
  if (process.env.FRESH) fs.rmSync(PROFILE_DIR, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(PROFILE_DIR, {
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
    args: process.getuid?.() === 0 ? ['--no-sandbox'] : [],
    viewport: DEVICES[list[0]],
    // REDUCED=1 : mouvement réduit (les anneaux d'aide restent fixes 2 s).
    reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference',
  });
  await ctx.addInitScript(() => {
    const fonts = ['EcolnaSans-Regular', 'EcolnaSans-Medium', 'EcolnaSans-SemiBold', 'EcolnaSans-Bold', 'EcolnaSans-ExtraBold', 'Andika-Regular', 'Andika-Bold'];
    const css = fonts.map((f) => `@font-face{font-family:"${f}";src:url(/__fonts/${f}.ttf) format("truetype");}`).join('') + '*{scrollbar-width:none}';
    const add = () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
    if (document.head) add(); else document.addEventListener('DOMContentLoaded', add);
  });
  const page = ctx.pages()[0] ?? (await ctx.newPage());
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle', timeout: 180000 });
  if (process.env.SEED) {
    console.log('profil semé :', await seed(page), 'leçons');
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
    else if (step.startsWith('label:')) await page.getByLabel(step.slice(6)).first().click({ timeout: 15000 });
    else if (step.startsWith('fill:')) {
      const [placeholder, text] = step.slice(5).split('=');
      await page.getByPlaceholder(placeholder).fill(text);
    } else await page.getByText(step, { exact: true }).first().click({ timeout: 15000 });
    await page.waitForTimeout(700);
  }
  for (const device of list) {
    await page.setViewportSize(DEVICES[device]);
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
