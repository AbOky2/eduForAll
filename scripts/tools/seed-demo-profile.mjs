/**
 * Met l'app en scène pour les captures d'écran des stores.
 *
 * Les captures doivent montrer l'app réelle, pas une maquette — mais un écran
 * vide ne montre rien. On sème donc la base locale du simulateur avec le profil
 * de démonstration prévu par docs/deploiement-v1.md § 4 : « Amina », CP1, une
 * douzaine de leçons terminées. L'app affiche ensuite ces données elle-même,
 * avec son vrai rendu. Aucune donnée d'enfant réel.
 *
 * Les badges ne sont PAS choisis à la main : après chaque leçon semée, le
 * script rejoue le calcul de l'app (mêmes requêtes que
 * achievements-repository.ts, mêmes règles, lues dans achievements.ts) et
 * date chaque badge du jour de la leçon qui l'a débloqué. Le profil est donc
 * cohérent d'un écran à l'autre, et le script dit quels badges chaque leçon a
 * célébrés — c'est ce que montre l'écran de réussite (plan 07).
 *
 * Profil identique à celui du banc web (scripts/web-preview/capture.cjs,
 * SEED=1) : toute modification se fait dans les deux.
 *
 * À lancer APRÈS un premier démarrage de l'app, qui crée la base et importe
 * le contenu. Node ≥ 22.18 (node:sqlite, et les règles lues en TypeScript).
 *
 * Usage : node scripts/tools/seed-demo-profile.mjs [--bundle td.ecolna.app.dev] [--udid <simulateur>]
 * (`--udid` est nécessaire quand plusieurs simulateurs sont démarrés.)
 */
import { DatabaseSync } from 'node:sqlite';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const flag = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const BUNDLE = flag('bundle') ?? 'td.ecolna.app.dev';
const APPAREIL = flag('udid') ?? 'booted';

// Les règles des badges de l'app, depuis leur source (Node retire les types).
process.removeAllListeners('warning'); // « Reparsing as ES module » : sans objet ici
let earnedAchievements;
let longestStreak;
try {
  ({ earnedAchievements } = await import(
    pathToFileURL(join(ROOT, 'src/features/achievements/domain/achievements.ts')).href
  ));
  ({ longestStreak } = await import(
    pathToFileURL(join(ROOT, 'src/features/progress/domain/streaks.ts')).href
  ));
} catch (error) {
  console.error(`❌ règles des badges illisibles (Node ≥ 22.18 requis, actuel ${process.version}) : ${error.message}`);
  process.exit(1);
}

const conteneur = execFileSync('xcrun', ['simctl', 'get_app_container', APPAREIL, BUNDLE, 'data'], {
  encoding: 'utf8',
}).trim();
const base = join(conteneur, 'Documents/SQLite/ecolna.db');
if (!existsSync(base)) {
  console.error(`❌ base introuvable : ${base}\n   Lancer l'app une fois d'abord — elle la crée au démarrage.`);
  process.exit(1);
}

const db = new DatabaseSync(base);
const ligne = db.prepare('SELECT COUNT(*) n FROM lessons').get();
if (!ligne || ligne.n === 0) {
  console.error('❌ aucune leçon en base : le contenu n’a pas fini de s’importer. Relancer l’app et attendre l’accueil.');
  process.exit(1);
}

// Leçons de CP1 dans l'ordre du programme : on en termine douze, soit le
// monde « Moi et mon école » (10 leçons de langage) et deux leçons du suivant.
const lecons = db.prepare(
  `SELECT l.id, l.world_id FROM lessons l
   JOIN curriculum_worlds w ON w.id = l.world_id
   WHERE w.level_id = 'CP1' ORDER BY w.sort_order, l.sort_order LIMIT 12`,
).all();

const PROFIL = 'demo-amina';
// Relatif à maintenant, comme le banc web : la série du jour, le temps
// d'aujourd'hui et la semaine du tableau parent se lisent à la date de la
// capture. La dernière séance (12 min) vient de se terminer.
const MAINTENANT = Date.now() - 15 * 60000;
const jour = (recul) => new Date(MAINTENANT - recul * 86400000).toISOString();
// Étoiles variées : un parcours crédible, pas un sans-faute irréaliste.
const ETOILES = [3, 3, 2, 3, 3, 2, 3, 3, 3, 3, 2, 3];
// Un jour sur deux pendant deux semaines, puis quatre jours de suite. La 10ᵉ
// leçon (cp1-langage-famille-2) ferme le premier monde ; la série de trois
// jours n'arrive qu'à la 11ᵉ.
const RECUL = (i) => (i < 8 ? 20 - i * 2 : 11 - i);

/** Mêmes requêtes que achievements-repository.ts (loadStats). */
const requetes = {
  totals: db.prepare(
    `SELECT COUNT(*) AS completed,
            SUM(CASE WHEN stars >= 3 THEN 1 ELSE 0 END) AS perfect,
            COALESCE(SUM(stars), 0) AS stars
     FROM lesson_progress
     WHERE child_profile_id = ? AND status = 'completed'`,
  ),
  bySubject: db.prepare(
    `SELECT w.subject AS subject, COUNT(*) AS n
     FROM lesson_progress lp
     JOIN lessons l ON l.id = lp.lesson_id
     JOIN curriculum_worlds w ON w.id = l.world_id
     WHERE lp.child_profile_id = ? AND lp.status = 'completed'
     GROUP BY w.subject`,
  ),
  worlds: db.prepare(
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
  ),
  // progress-repository.ts (findCompletedDays)
  days: db.prepare(
    `SELECT DISTINCT date(completed_at, 'localtime') AS day
     FROM lesson_progress
     WHERE child_profile_id = ? AND status = 'completed' AND completed_at IS NOT NULL
     ORDER BY day`,
  ),
};
function stats() {
  const totals = requetes.totals.get(PROFIL);
  const parMatiere = { language: 0, reading: 0, writing: 0, math: 0 };
  for (const r of requetes.bySubject.all(PROFIL)) parMatiere[r.subject] = r.n;
  return {
    completedLessons: totals?.completed ?? 0,
    perfectLessons: totals?.perfect ?? 0,
    totalStars: totals?.stars ?? 0,
    completedBySubject: parMatiere,
    completedWorlds: requetes.worlds.get(PROFIL)?.n ?? 0,
    bestStreakDays: longestStreak(requetes.days.all(PROFIL).map((r) => r.day)),
  };
}

db.exec('PRAGMA foreign_keys = ON;');
db.exec("DELETE FROM child_profiles WHERE id = '" + PROFIL + "';");
db.prepare(
  `INSERT INTO child_profiles (id, first_name, avatar_id, level, created_at, updated_at)
   VALUES (?, 'Amina', 'avatar-2', 'CP1', ?, ?)`,
).run(PROFIL, jour(21), jour(0));

const gagnes = new Map(); // badge → date de la leçon qui l'a débloqué
const parLecon = [];
lecons.forEach((lecon, index) => {
  const quand = jour(RECUL(index));
  db.prepare(
    `INSERT OR REPLACE INTO lesson_progress
       (child_profile_id, lesson_id, status, stars, current_step_index, hints_used,
        error_count, completed_at, updated_at)
     VALUES (?, ?, 'completed', ?, 0, ?, ?, ?, ?)`,
  ).run(PROFIL, lecon.id, ETOILES[index] ?? 3, index % 3 === 0 ? 1 : 0, index % 4, quand, quand);
  db.prepare(
    `INSERT INTO learning_sessions (id, child_profile_id, started_at, ended_at, lessons_completed)
     VALUES (?, ?, ?, ?, 1)`,
  // Une vraie séance dure : 12 minutes, pas zéro (le tableau parent les compte).
  ).run(`demo-s-${index}`, PROFIL, quand, new Date(Date.parse(quand) + 12 * 60000).toISOString());
  // Ce que syncAchievements aurait débloqué à la fin de cette leçon.
  const nouveaux = earnedAchievements(stats()).filter((b) => !gagnes.has(b));
  for (const b of nouveaux) gagnes.set(b, quand);
  parLecon.push([lecon.id, ETOILES[index] ?? 3, nouveaux]);
});

// Maîtrise par notion, et une notion laissée en difficulté pour que l'atelier
// de révision ait quelque chose à montrer.
const notions = db.prepare(
  `SELECT DISTINCT skill_id FROM lesson_skills WHERE lesson_id IN (${lecons.map(() => '?').join(',')})`,
).all(...lecons.map((l) => l.id));
notions.forEach((notion, index) => {
  const difficile = index === 1;
  db.prepare(
    `INSERT OR REPLACE INTO skill_mastery
       (child_profile_id, skill_id, correct_count, error_count, hint_count, last_practiced_at, mastery)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(PROFIL, notion.skill_id, difficile ? 2 : 5, difficile ? 4 : 0, difficile ? 2 : 0,
        jour(index % 6), difficile ? 'needs_review' : 'mastered');
});
if (notions[1]) {
  db.prepare(
    `INSERT OR REPLACE INTO revision_queue
       (child_profile_id, skill_id, reason, priority, due_at, resolved_at, created_at)
     VALUES (?, ?, 'repeated_errors', 84, ?, NULL, ?)`,
  ).run(PROFIL, notions[1].skill_id, jour(1), jour(1));
}

for (const [badge, quand] of gagnes) {
  db.prepare(
    `INSERT OR REPLACE INTO achievements (child_profile_id, achievement_id, earned_at) VALUES (?, ?, ?)`,
  ).run(PROFIL, badge, quand);
}

for (const [cle, valeur] of [['active_profile_id', PROFIL], ['onboarding_done', 'true']]) {
  db.prepare(
    `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)`,
  ).run(cle, valeur, jour(0));
}

console.log(`✅ profil de démonstration semé : Amina, CP1, ${lecons.length} leçons, ` +
            `${notions.length} notions, ${gagnes.size} badges, 1 notion à revoir.`);
console.log(`   badges : ${[...gagnes.keys()].join(', ')}`);
console.log('   écran de réussite de chaque leçon (lien de capture) :');
for (const [id, etoiles, nouveaux] of parLecon) {
  console.log(`     ${id.padEnd(30)} ${etoiles}★  ${nouveaux.length ? nouveaux.join(',') : '—'}`);
}
console.log('   Relancer l’app pour la voir.');
