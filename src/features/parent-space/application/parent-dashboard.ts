import { getDatabase } from '@/database/connection/database';
import type { ChildProfileId } from '@/core/ids/ids';
import type { LevelId } from '@/content/schemas/curriculum-schema';
import { createRevisionRepository } from '@/features/revision/infrastructure/revision-repository';
import { fr } from '@/localization/fr/strings';

export interface ParentDashboardData {
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly minutesToday: number;
  /** Notions que l'enfant réussit désormais sans peine. */
  readonly masteredSkills: number;
  /** Human sentences, already in French — never raw metrics. */
  readonly analysis: string[];
  readonly recommendations: string[];
}

/** Les thèmes dont l'identifiant ne se lit pas tel quel. */
const TOPIC_LABELS: Record<string, string> = {
  subtraction: 'soustraction',
  'table-5': 'table de 5',
  'table-addition': 'table d’addition',
  'table-soustraction': 'table de soustraction',
  'double-moitie': 'double et moitié',
  'double-decimetre': 'double décimètre',
  reperes: 'repères dans l’espace',
  verbes: 'problèmes (ajouter, enlever)',
  problemes: 'problèmes',
  comparaisons: 'comparer les nombres',
  quantites: 'quantités',
  signes: 'signes + − =',
  retenue: 'retenue',
  'boucle-haut': 'boucles vers le haut',
  'ligne-horizontale': 'lignes horizontales',
  pont: 'ponts',
  rond: 'ronds',
  points: 'points',
  dictee: 'dictée',
  copie: 'copie',
  structures: 'structure des phrases',
  comprehension: 'compréhension',
  'corps-humain': 'le corps humain',
  ecole: 'l’école',
  fetes: 'les fêtes',
  marche: 'le marché',
  metiers: 'les métiers',
  'phenomenes-naturels': 'les phénomènes naturels',
  combinatoire: 'assembler les syllabes',
  phrase: 'lire une phrase',
  'en-lettres': 'écrits en lettres',
  ecriture: 'écrire les nombres',
};

const topicLabel = (topic: string) => TOPIC_LABELS[topic] ?? topic.replace(/-/g, ' ');

/** Les accents encodés des identifiants (« e1 » → « é », scripts/content/audio.ts). */
const ACCENTS: Record<string, string> = {
  a1: 'à',
  a2: 'â',
  a3: 'ä',
  e1: 'é',
  e2: 'è',
  e3: 'ê',
  e4: 'ë',
  i1: 'î',
  i2: 'ï',
  o1: 'ô',
  o2: 'ö',
  oe1: 'œ',
  u1: 'ù',
  u2: 'û',
  u3: 'ü',
  c1: 'ç',
};
const decode = (token: string) => ACCENTS[token] ?? token;

/** « ac-ec-oc-ic » → « ac », « ec », « oc », « ic ». */
function soundsLabel(topic: string): string {
  if (topic === 'semi-voyelles') {
    return 'les semi-voyelles';
  }
  if (topic.startsWith('equiv-')) {
    return `les façons d’écrire le son « ${decode(topic.slice(6))} »`;
  }
  const parts = topic.split('-').map(decode);
  return parts.length === 1
    ? `le son « ${parts[0]} »`
    : `les sons ${parts.map((part) => `« ${part} »`).join(', ')}`;
}

/**
 * Une compétence en français lisible par un parent (« skill-son-ba » → « le
 * son « ba » »). Jamais un fragment d'identifiant nu : chaque famille porte
 * son nom (le calcul, l'écriture, le langage…).
 */
export function describeSkill(skillId: string): string {
  const withoutPrefix = skillId.replace(/^skill-/, '');
  const [kind = '', ...rest] = withoutPrefix.split('-');
  const topic = rest.join('-');
  switch (kind) {
    case 'son':
      return soundsLabel(topic);
    case 'lettre':
      return `la lettre « ${decode(topic)} »`;
    case 'nombre':
      return /^\d/.test(topic)
        ? `les nombres de ${topic.replace('-', ' à ')}`
        : `les nombres (${topicLabel(topic)})`;
    case 'lecture':
      return `la lecture (${topicLabel(topic)})`;
    case 'calcul':
      return `le calcul (${topicLabel(topic)})`;
    case 'ecriture':
      return `l’écriture (${topicLabel(topic)})`;
    case 'langage':
      return `le langage (${topicLabel(topic)})`;
    default:
      return `la notion « ${topicLabel(withoutPrefix)} »`;
  }
}

export async function loadParentDashboard(
  childProfileId: ChildProfileId,
  level: LevelId,
  firstName: string,
): Promise<ParentDashboardData> {
  const db = await getDatabase();

  const totals = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM lessons l
     JOIN curriculum_worlds w ON w.id = l.world_id
     WHERE w.level_id = ?`,
    level,
  );
  const completed = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM lesson_progress
     WHERE child_profile_id = ? AND status = 'completed'`,
    childProfileId,
  );

  const sessions = await db.getAllAsync<{ started_at: string; ended_at: string | null }>(
    `SELECT started_at, ended_at FROM learning_sessions
     WHERE child_profile_id = ?
       AND date(started_at, 'localtime') = date('now', 'localtime')`,
    childProfileId,
  );
  const minutesToday = Math.round(
    sessions.reduce((sum, session) => {
      const end = session.ended_at ? Date.parse(session.ended_at) : Date.parse(session.started_at);
      return sum + Math.max(0, end - Date.parse(session.started_at));
    }, 0) / 60000,
  );

  // Strong subjects: subjects where recent attempts are mostly correct.
  const subjectStats = await db.getAllAsync<{ subject: string; correct: number; total: number }>(
    `SELECT w.subject AS subject,
            SUM(a.is_correct) AS correct,
            COUNT(*) AS total
     FROM exercise_attempts a
     JOIN lessons l ON l.id = a.lesson_id
     JOIN curriculum_worlds w ON w.id = l.world_id
     WHERE a.child_profile_id = ?
     GROUP BY w.subject HAVING total >= 4`,
    childProfileId,
  );

  const subjectNames: Record<string, string> = {
    language: 'langage',
    reading: 'lecture',
    writing: 'écriture',
    math: 'calcul',
  };

  const analysis: string[] = [];
  for (const stat of subjectStats) {
    const ratio = stat.correct / stat.total;
    const name = subjectNames[stat.subject] ?? stat.subject;
    if (ratio >= 0.8) {
      analysis.push(`${firstName} progresse bien en ${name}.`);
    } else if (ratio < 0.55) {
      analysis.push(`${firstName} a besoin d’encouragements en ${name}.`);
    }
  }
  if (analysis.length === 0 && (completed?.n ?? 0) > 0) {
    analysis.push(`${firstName} avance à son rythme. Continuez à l’encourager !`);
  }

  const mastered = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM skill_mastery
     WHERE child_profile_id = ? AND mastery = 'mastered'`,
    childProfileId,
  );

  const open = await createRevisionRepository(db).findOpen(
    childProfileId,
    3,
    new Date().toISOString(),
  );
  const recommendations = open.map(
    (entry) =>
      `Revoyez ensemble ${describeSkill(entry.skillId)}. ${fr.revision.reasons[entry.reason]}`,
  );

  return {
    completedLessons: completed?.n ?? 0,
    totalLessons: totals?.total ?? 0,
    minutesToday,
    masteredSkills: mastered?.n ?? 0,
    analysis,
    recommendations,
  };
}
