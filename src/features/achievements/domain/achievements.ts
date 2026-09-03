import type { Subject } from '@/content/schemas/curriculum-schema';

/**
 * Badges ALIFA.
 *
 * Chaque badge récompense un progrès réel dans le programme officiel — des
 * leçons terminées, des mondes bouclés, de la régularité — jamais un temps
 * d'écran ni une action décorative. Une classe de CP valorise l'effort
 * régulier : c'est ce que ces badges rendent visible à l'enfant.
 */
export const ACHIEVEMENT_IDS = [
  'first-lesson',
  'five-lessons',
  'twenty-lessons',
  'fifty-lessons',
  'first-perfect',
  'five-perfect',
  'first-world',
  'reader',
  'speaker',
  'writer',
  'counter',
  'streak-three',
  'streak-seven',
  'star-collector',
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

/** Everything the badge rules need, read once from SQLite. */
export interface AchievementStats {
  readonly completedLessons: number;
  /** Leçons terminées avec 3 étoiles. */
  readonly perfectLessons: number;
  readonly totalStars: number;
  readonly completedBySubject: Readonly<Record<Subject, number>>;
  /** Mondes dont toutes les leçons sont terminées. */
  readonly completedWorlds: number;
  /** Plus longue série de jours consécutifs avec au moins une leçon. */
  readonly bestStreakDays: number;
}

interface AchievementRule {
  readonly id: AchievementId;
  readonly isEarned: (stats: AchievementStats) => boolean;
}

const RULES: readonly AchievementRule[] = [
  { id: 'first-lesson', isEarned: (s) => s.completedLessons >= 1 },
  { id: 'five-lessons', isEarned: (s) => s.completedLessons >= 5 },
  { id: 'twenty-lessons', isEarned: (s) => s.completedLessons >= 20 },
  { id: 'fifty-lessons', isEarned: (s) => s.completedLessons >= 50 },
  { id: 'first-perfect', isEarned: (s) => s.perfectLessons >= 1 },
  { id: 'five-perfect', isEarned: (s) => s.perfectLessons >= 5 },
  { id: 'first-world', isEarned: (s) => s.completedWorlds >= 1 },
  { id: 'reader', isEarned: (s) => s.completedBySubject.reading >= 10 },
  { id: 'speaker', isEarned: (s) => s.completedBySubject.language >= 10 },
  { id: 'writer', isEarned: (s) => s.completedBySubject.writing >= 10 },
  { id: 'counter', isEarned: (s) => s.completedBySubject.math >= 10 },
  { id: 'streak-three', isEarned: (s) => s.bestStreakDays >= 3 },
  { id: 'streak-seven', isEarned: (s) => s.bestStreakDays >= 7 },
  { id: 'star-collector', isEarned: (s) => s.totalStars >= 50 },
];

/** Badges earned given these stats — order is the display order. */
export function earnedAchievements(stats: AchievementStats): AchievementId[] {
  return RULES.filter((rule) => rule.isEarned(stats)).map((rule) => rule.id);
}

