/**
 * Motion tokens. All animations must be interruptible, purposeful, and
 * disabled when the OS requests reduced motion (see useReducedMotion).
 */
export const motion = {
  duration: {
    fast: 120,
    base: 220,
    gentle: 350,
    celebration: 600,
  },
  /** Standard easing for entrances; use spring APIs for playful feedback. */
  easing: {
    standard: [0.2, 0, 0, 1] as const,
    decelerate: [0, 0, 0, 1] as const,
  },
} as const;
