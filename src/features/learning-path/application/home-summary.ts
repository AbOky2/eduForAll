import { getDatabase } from '@/database/connection/database';
import { createProgressRepository, type LessonRecommendation } from '@/features/progress/infrastructure/progress-repository';
import type { ChildProfileId } from '@/core/ids/ids';
import type { LevelId, Subject } from '@/content/schemas/curriculum-schema';

export interface SubjectProgress {
  readonly subject: Subject;
  readonly completed: number;
  readonly total: number;
  /** Locked until the child completes at least one lesson of the previous subject group. */
  readonly locked: boolean;
}

export interface HomeSummary {
  readonly recommendation: LessonRecommendation | null;
  readonly subjects: SubjectProgress[];
  readonly completedLessons: number;
}

const SUBJECT_ORDER: Subject[] = ['reading', 'writing', 'dictation', 'math'];

/** Read model for the child home screen (mockup S06). */
export async function loadHomeSummary(
  childProfileId: ChildProfileId,
  level: LevelId,
): Promise<HomeSummary> {
  const db = await getDatabase();
  const progress = createProgressRepository(db);

  const rows = await db.getAllAsync<{ subject: Subject; total: number; completed: number }>(
    `SELECT w.subject AS subject,
            COUNT(l.id) AS total,
            SUM(CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END) AS completed
     FROM lessons l
     JOIN curriculum_worlds w ON w.id = l.world_id
     LEFT JOIN lesson_progress lp
       ON lp.lesson_id = l.id AND lp.child_profile_id = ?
     WHERE w.level_id = ?
     GROUP BY w.subject`,
    childProfileId,
    level,
  );

  const bySubject = new Map(rows.map((row) => [row.subject, row]));
  const readingDone = bySubject.get('reading')?.completed ?? 0;

  const subjects: SubjectProgress[] = SUBJECT_ORDER.filter((subject) => bySubject.has(subject)).map(
    (subject) => {
      const row = bySubject.get(subject);
      return {
        subject,
        completed: row?.completed ?? 0,
        total: row?.total ?? 0,
        // Math unlocks independently; dictation asks for a few reading lessons first.
        locked: subject === 'dictation' && readingDone < 3,
      };
    },
  );

  const [recommendation, completedLessons] = await Promise.all([
    progress.findNextRecommendedLesson(childProfileId),
    progress.countCompletedLessons(childProfileId),
  ]);

  return { recommendation, subjects, completedLessons };
}
