/**
 * Met l'app en scène pour les captures d'écran des stores.
 *
 * Les captures doivent montrer l'app réelle, pas une maquette — mais un écran
 * vide ne montre rien. On sème donc la base locale du simulateur avec le profil
 * de démonstration prévu par docs/deploiement-v1.md § 4 : « Amina », CP1, une
 * douzaine de leçons terminées. L'app affiche ensuite ces données elle-même,
 * avec son vrai rendu. Aucune donnée d'enfant réel.
 *
 * À lancer APRÈS un premier démarrage de l'app, qui crée la base et importe
 * le contenu.
 *
 * Usage : node scripts/tools/seed-demo-profile.mjs [--bundle td.ecolna.app.dev] [--udid <simulateur>]
 * (`--udid` est nécessaire quand plusieurs simulateurs sont démarrés.)
 */
import { DatabaseSync } from 'node:sqlite';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const flag = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
const BUNDLE = flag('bundle') ?? 'td.ecolna.app.dev';
const APPAREIL = flag('udid') ?? 'booted';

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

// Leçons de CP1 dans l'ordre du programme : on en termine douze.
const lecons = db.prepare(
  `SELECT l.id, l.world_id FROM lessons l
   JOIN curriculum_worlds w ON w.id = l.world_id
   WHERE w.level_id = 'CP1' ORDER BY w.sort_order, l.sort_order LIMIT 12`,
).all();

const PROFIL = 'demo-amina';
const jour = (recul) => {
  const base = Date.parse('2026-10-01T09:30:00.000Z');
  return new Date(base - recul * 86400000).toISOString();
};

db.exec('PRAGMA foreign_keys = ON;');
db.exec("DELETE FROM child_profiles WHERE id = '" + PROFIL + "';");
db.prepare(
  `INSERT INTO child_profiles (id, first_name, avatar_id, level, created_at, updated_at)
   VALUES (?, 'Amina', 'avatar-2', 'CP1', ?, ?)`,
).run(PROFIL, jour(21), jour(0));

// Étoiles variées : un parcours crédible, pas un sans-faute irréaliste.
const etoiles = [3, 3, 2, 3, 3, 2, 3, 3, 3, 2, 3, 3];
lecons.forEach((lecon, index) => {
  // Cinq jours consécutifs en fin de parcours : la série du jour est visible.
  const recul = index < 7 ? 20 - index * 2 : 11 - index;
  db.prepare(
    `INSERT OR REPLACE INTO lesson_progress
       (child_profile_id, lesson_id, status, stars, current_step_index, hints_used,
        error_count, completed_at, updated_at)
     VALUES (?, ?, 'completed', ?, 0, ?, ?, ?, ?)`,
  ).run(PROFIL, lecon.id, etoiles[index] ?? 3, index % 3 === 0 ? 1 : 0, index % 4, jour(recul), jour(recul));
  db.prepare(
    `INSERT INTO learning_sessions (id, child_profile_id, started_at, ended_at, lessons_completed)
     VALUES (?, ?, ?, ?, 1)`,
  // Une vraie séance dure : 12 minutes, pas zéro (le tableau parent les compte).
  ).run(`demo-s-${index}`, PROFIL, jour(recul), new Date(Date.parse(jour(recul)) + 12 * 60000).toISOString());
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

for (const badge of ['first-lesson', 'five-lessons', 'first-perfect', 'streak-three', 'reader']) {
  db.prepare(
    `INSERT OR REPLACE INTO achievements (child_profile_id, achievement_id, earned_at) VALUES (?, ?, ?)`,
  ).run(PROFIL, badge, jour(3));
}

db.prepare(
  `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('active_profile_id', ?, ?)`,
).run(PROFIL, jour(0));

console.log(`✅ profil de démonstration semé : Amina, CP1, ${lecons.length} leçons, ` +
            `${notions.length} notions, 5 badges, 1 notion à revoir.`);
console.log('   Relancer l’app pour la voir.');
