/**
 * Injectable clock so that domain rules depending on time (revision
 * scheduling, session durations) stay deterministic under test.
 */
export interface Clock {
  now(): Date;
  epochMillis(): number;
}

export const systemClock: Clock = {
  now: () => new Date(),
  epochMillis: () => Date.now(),
};

export function fixedClock(at: Date): Clock {
  return {
    now: () => at,
    epochMillis: () => at.getTime(),
  };
}
