import { localDay } from '@/core/time/day';

import { currentWeek, mondayOf } from './week';

describe('semaine du tableau parent', () => {
  it('commence le lundi, comme la semaine de l’école', () => {
    // Samedi 3 octobre 2026 → lundi 28 septembre.
    expect(localDay(mondayOf(new Date(2026, 9, 3, 15, 30)))).toBe('2026-09-28');
    // Un dimanche appartient à la semaine qui s'achève, pas à la suivante.
    expect(localDay(mondayOf(new Date(2026, 9, 4, 9)))).toBe('2026-09-28');
    // Un lundi est son propre lundi.
    expect(localDay(mondayOf(new Date(2026, 8, 28, 0, 5)))).toBe('2026-09-28');
  });

  it('donne sept jours, du lundi au dimanche, avec leurs minutes', () => {
    const week = currentWeek(
      [
        { day: '2026-09-29', minutes: 12 },
        { day: '2026-10-03', minutes: 24 },
        // Hors de la semaine : ignoré.
        { day: '2026-09-27', minutes: 40 },
      ],
      new Date(2026, 9, 3, 18),
    );
    expect(week.map((entry) => entry.day)).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
    expect(week.map((entry) => entry.minutes)).toEqual([0, 12, 0, 0, 0, 24, 0]);
  });

  it('marque le jour même et les jours à venir', () => {
    const week = currentWeek([], new Date(2026, 9, 3, 18));
    expect(week.map((entry) => entry.today)).toEqual([
      false,
      false,
      false,
      false,
      false,
      true,
      false,
    ]);
    expect(week.map((entry) => entry.future)).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  it('traverse un changement de mois sans sauter de jour', () => {
    const week = currentWeek([], new Date(2026, 2, 1, 12));
    expect(week[0]?.day).toBe('2026-02-23');
    expect(week[6]?.day).toBe('2026-03-01');
  });
});
