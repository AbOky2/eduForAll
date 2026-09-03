import { currentStreak, longestStreak } from './streaks';

describe('longestStreak', () => {
  it('is zero without any day', () => {
    expect(longestStreak([])).toBe(0);
  });

  it('counts consecutive days only', () => {
    expect(longestStreak(['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-08'])).toBe(3);
  });

  it('ignores duplicates and unsorted input', () => {
    expect(longestStreak(['2026-03-02', '2026-03-01', '2026-03-02'])).toBe(2);
  });

  it('does not break across a month boundary', () => {
    expect(longestStreak(['2026-03-31', '2026-04-01', '2026-04-02'])).toBe(3);
  });
});

describe('currentStreak', () => {
  it('counts the run ending today', () => {
    expect(currentStreak(['2026-03-01', '2026-03-02', '2026-03-03'], '2026-03-03')).toBe(3);
  });

  it('still counts a run ending yesterday — the day is not over', () => {
    expect(currentStreak(['2026-03-01', '2026-03-02'], '2026-03-03')).toBe(2);
  });

  it('drops to zero once a day has been missed entirely', () => {
    expect(currentStreak(['2026-03-01', '2026-03-02'], '2026-03-05')).toBe(0);
  });

  it('is zero without any day', () => {
    expect(currentStreak([], '2026-03-05')).toBe(0);
  });
});
