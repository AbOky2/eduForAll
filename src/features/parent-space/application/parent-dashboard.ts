import { getDatabase } from '@/database/connection/database';
import type { ChildProfileId } from '@/core/ids/ids';
import type { LevelId } from '@/content/schemas/curriculum-schema';

export interface ParentDashboardData {
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly minutesToday: number;
  /** Human sentences, already in French — never raw metrics. */
  readonly analysis: string[];
  readonly recommendations: string[];
}

/** Turns a skill id into parent-readable French ("skill-son-ba" → "le son « ba »"). */
export function describeSkill(skillId: string): string {
  const withoutPrefix = skillId.replace(/^skill-/, '');
  const [kind = '', ...rest] = withoutPrefix.split('-');
  const topic = rest.join('-');
  switch (kind) {
    case 'son':
      return `le son « ${topic} »`;
    case 'lettre':
      return `la lettre « ${topic} »`;
    case 'nombre':
      return `les nombres (${topic.replace(/-/g, ' ')})`;
    case 'lecture':
      return `la lecture (${topic.replace(/-/g, ' ')})`;
    default:
      return topic.replace(/-/g, ' ');
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

  const today = new Date().toISOString().slice(0, 10);
  const sessions = await db.getAllAsync<{ started_at: string; ended_at: string | null }>(
    `SELECT started_at, ended_at FROM learning_sessions
     WHERE child_profile_id = ? AND started_at >= ?`,
    childProfileId,
    `${today}T00:00:00`,
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
    reading: 'lecture',
    writing: 'écriture',
    dictation: 'dictée',
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

  const revisionRows = await db.getAllAsync<{ skill_id: string }>(
    `SELECT skill_id FROM revision_queue
     WHERE child_profile_id = ? AND resolved_at IS NULL
     ORDER BY due_at LIMIT 3`,
    childProfileId,
  );
  const recommendations = revisionRows.map(
    (row) => `Revoyez ensemble ${describeSkill(row.skill_id)}.`,
  );

  return {
    completedLessons: completed?.n ?? 0,
    totalLessons: totals?.total ?? 0,
    minutesToday,
    analysis,
    recommendations,
  };
}
