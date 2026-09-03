/**
 * Séries de jours d'apprentissage.
 *
 * Le programme officiel est un rythme quotidien : « les quatre disciplines
 * chaque jour » (grille horaire, p. 128). Compter les jours de suite rend ce
 * rythme visible à l'enfant sans jamais le punir — une série cassée n'enlève
 * rien, elle recommence.
 */

function toDayNumbers(days: readonly string[]): number[] {
  return [...new Set(days)]
    .map((day) => Date.parse(`${day}T00:00:00Z`))
    .filter((time) => !Number.isNaN(time))
    .sort((a, b) => a - b);
}

const DAY = 86_400_000;

/** Longest run of consecutive calendar days in a set of ISO dates (YYYY-MM-DD). */
export function longestStreak(days: readonly string[]): number {
  let best = 0;
  let run = 0;
  let previous: number | null = null;
  for (const time of toDayNumbers(days)) {
    run = previous !== null && time - previous === DAY ? run + 1 : 1;
    previous = time;
    best = Math.max(best, run);
  }
  return best;
}

/**
 * Run of consecutive days ending today — or yesterday, so a child who has not
 * opened the app *yet today* still sees the series they are keeping alive.
 */
export function currentStreak(days: readonly string[], today: string): number {
  const times = toDayNumbers(days);
  const todayTime = Date.parse(`${today}T00:00:00Z`);
  if (times.length === 0 || Number.isNaN(todayTime)) {
    return 0;
  }
  const last = times[times.length - 1] as number;
  if (last < todayTime - DAY) {
    return 0;
  }
  let run = 1;
  for (let index = times.length - 1; index > 0; index -= 1) {
    if ((times[index] as number) - (times[index - 1] as number) !== DAY) {
      break;
    }
    run += 1;
  }
  return run;
}
