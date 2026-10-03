import { localDay } from '@/core/time/day';

/** Un jour de la semaine en cours, vu par le tableau parent. */
export interface WeekDay {
  /** Jour calendaire LOCAL (YYYY-MM-DD). */
  readonly day: string;
  /** Minutes passées à apprendre ce jour-là (0 sans séance). */
  readonly minutes: number;
  readonly today: boolean;
  /** Pas encore vécu : la colonne reste une piste vide. */
  readonly future: boolean;
}

/**
 * Le lundi de la semaine de `date` — la semaine française, celle de l'école,
 * va du lundi au dimanche. Minuit local.
 */
export function mondayOf(date: Date): Date {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // getDay() : 0 = dimanche … 6 = samedi ; un dimanche est le 7e jour.
  const offset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - offset);
  return monday;
}

/**
 * Les sept jours de la semaine en cours, du lundi au dimanche, avec les
 * minutes de chacun (`entries` : celles qu'a renvoyées le dépôt de progression,
 * par jour local).
 */
export function currentWeek(
  entries: readonly { day: string; minutes: number }[],
  now: Date = new Date(),
): WeekDay[] {
  const minutes = new Map(entries.map((entry) => [entry.day, entry.minutes]));
  const today = localDay(now);
  const monday = mondayOf(now);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + index);
    const day = localDay(date);
    return { day, minutes: minutes.get(day) ?? 0, today: day === today, future: day > today };
  });
}
