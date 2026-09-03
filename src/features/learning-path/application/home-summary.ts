import { getDatabase } from '@/database/connection/database';
import {
  createProgressRepository,
  type LessonRecommendation,
} from '@/features/progress/infrastructure/progress-repository';
import type { ChildProfileId } from '@/core/ids/ids';
import { currentStreak } from '@/features/progress/domain/streaks';
import { createRevisionRepository } from '@/features/revision/infrastructure/revision-repository';
import type { LevelId, Subject } from '@/content/schemas/curriculum-schema';

export interface SubjectProgress {
  readonly subject: Subject;
  readonly completed: number;
  readonly total: number;
  /** True when no lesson of this subject is startable yet (all prerequisites unmet). */
  readonly locked: boolean;
}

export interface HomeSummary {
  readonly recommendation: LessonRecommendation | null;
  readonly subjects: SubjectProgress[];
  readonly completedLessons: number;
  /** Leçons terminées aujourd'hui — le rythme du jour, pas un score. */
  readonly lessonsToday: number;
  /** Jours d'affilée avec au moins une leçon, série en cours. */
  readonly streakDays: number;
  /** Notions en attente de révision — ouvre l'atelier de révision. */
  readonly revisionCount: number;
}

/**
 * Order of the official CP programme (MEN Tchad, sept. 2004): A. Langage,
 * B. Lecture, C. Écriture, then Mathématiques. A real CP class teaches all
 * four every day, so nothing is gated at subject level — progression gating
 * lives in lesson prerequisites, which this read model reflects.
 */
const SUBJECT_ORDER: Subject[] = ['language', 'reading', 'writing', 'math'];

/** Read model for the child home screen (mockup S06). */
export async function loadHomeSummary(
  childProfileId: ChildProfileId,
  level: LevelId,
): Promise<HomeSummary> {
  const db = await getDatabase();
  const progress = createProgressRepository(db);

  const rows = await db.getAllAsync<{
    subject: Subject;
    total: number;
    completed: number;
    available: number;
  }>(
    `SELECT w.subject AS subject,
            COUNT(l.id) AS total,
            SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN NOT EXISTS (
                  SELECT 1
                  FROM lesson_prerequisites pre
                  LEFT JOIN lesson_progress plp
                    ON plp.lesson_id = pre.prerequisite_lesson_id
                   AND plp.child_profile_id = ?
                  WHERE pre.lesson_id = l.id
                    AND (plp.status IS NULL OR plp.status <> 'completed')
                ) THEN 1 ELSE 0 END) AS available
     FROM lessons l
     JOIN curriculum_worlds w ON w.id = l.world_id
     LEFT JOIN lesson_progress lp
       ON lp.lesson_id = l.id AND lp.child_profile_id = ?
     WHERE w.level_id = ?
     GROUP BY w.subject`,
    childProfileId,
    childProfileId,
    level,
  );

  const bySubject = new Map(rows.map((row) => [row.subject, row]));

  const subjects: SubjectProgress[] = SUBJECT_ORDER.filter((subject) => bySubject.has(subject)).map(
    (subject) => {
      const row = bySubject.get(subject);
      return {
        subject,
        completed: row?.completed ?? 0,
        total: row?.total ?? 0,
        locked: (row?.available ?? 0) === 0,
      };
    },
  );

  const today = new Date().toISOString().slice(0, 10);
  const [recommendation, completedLessons, lessonsToday, days, revisionCount] = await Promise.all([
    progress.findNextRecommendedLesson(childProfileId),
    progress.countCompletedLessons(childProfileId),
    progress.countCompletedSince(childProfileId, `${today}T00:00:00`),
    progress.findCompletedDays(childProfileId),
    createRevisionRepository(db).countOpen(childProfileId),
  ]);

  return {
    recommendation,
    subjects,
    completedLessons,
    lessonsToday,
    streakDays: currentStreak(days, today),
    revisionCount,
  };
}
