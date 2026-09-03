import { ACHIEVEMENT_IDS, earnedAchievements } from './achievements';
import type { AchievementStats } from './achievements';

const empty: AchievementStats = {
  completedLessons: 0,
  perfectLessons: 0,
  totalStars: 0,
  completedBySubject: { language: 0, reading: 0, writing: 0, math: 0 },
  completedWorlds: 0,
  bestStreakDays: 0,
};

describe('achievements', () => {
  it('awards nothing before the first lesson', () => {
    expect(earnedAchievements(empty)).toEqual([]);
  });

  it('awards the first badge on the first finished lesson', () => {
    expect(earnedAchievements({ ...empty, completedLessons: 1 })).toEqual(['first-lesson']);
  });

  it('keeps earlier badges when a threshold is passed', () => {
    const earned = earnedAchievements({ ...empty, completedLessons: 20 });
    expect(earned).toEqual(['first-lesson', 'five-lessons', 'twenty-lessons']);
  });

  it('rewards each subject at ten lessons', () => {
    const earned = earnedAchievements({
      ...empty,
      completedBySubject: { language: 10, reading: 10, writing: 10, math: 10 },
    });
    expect(earned).toEqual(expect.arrayContaining(['reader', 'speaker', 'writer', 'counter']));
  });

  it('has a label and a description for every badge', () => {
    // Guards the French strings against a badge added without its wording.
    const { fr } = jest.requireActual<typeof import('@/localization/fr/strings')>(
      '@/localization/fr/strings',
    );
    for (const id of ACHIEVEMENT_IDS) {
      expect(fr.achievements.labels[id]).toBeTruthy();
      expect(fr.achievements.descriptions[id]).toBeTruthy();
    }
  });
});
