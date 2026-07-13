import type { Clock } from '@/core/time/clock';

/**
 * Deterministic, explainable local revision engine (V1 — no ML, no network).
 * Every recommendation carries a human-readable reason so the parent space
 * can say *why* a notion resurfaces. The interface is the seam where a future
 * on-device model could plug in without touching callers.
 */

export interface SkillSnapshot {
  readonly skillId: string;
  readonly correctCount: number;
  readonly errorCount: number;
  readonly hintCount: number;
  readonly lastPracticedAt: string | null;
}

export type RevisionReason =
  | 'repeated_errors'
  | 'needed_hints'
  | 'not_practiced_recently'
  | 'confusion_pair';

export interface RevisionRecommendation {
  readonly skillId: string;
  readonly reason: RevisionReason;
  /** Higher first. Deterministic given identical input. */
  readonly priority: number;
  /** Sessions to wait before showing (0 = next session). */
  readonly deferSessions: number;
}

const STALE_AFTER_DAYS = 7;

/**
 * Known confusable pairs (visually or phonetically close). If both sides
 * accumulate errors, revise them together with an audio+visual contrast.
 */
const CONFUSION_PAIRS: readonly (readonly [string, string])[] = [
  ['skill-son-ba', 'skill-son-ma'],
  ['skill-son-ta', 'skill-son-da'],
  ['skill-lettre-b', 'skill-lettre-d'],
  ['skill-lettre-p', 'skill-lettre-q'],
  ['skill-son-ou', 'skill-son-on'],
  ['skill-son-ch', 'skill-son-j'],
];

export function recommendRevisions(
  skills: readonly SkillSnapshot[],
  clock: Clock,
): RevisionRecommendation[] {
  const recommendations = new Map<string, RevisionRecommendation>();
  const now = clock.epochMillis();
  const bySkillId = new Map(skills.map((snapshot) => [snapshot.skillId, snapshot]));

  const consider = (candidate: RevisionRecommendation) => {
    const existing = recommendations.get(candidate.skillId);
    if (!existing || candidate.priority > existing.priority) {
      recommendations.set(candidate.skillId, candidate);
    }
  };

  for (const [left, right] of CONFUSION_PAIRS) {
    const a = bySkillId.get(left);
    const b = bySkillId.get(right);
    if (a && b && a.errorCount >= 2 && b.errorCount >= 2) {
      for (const skillId of [left, right]) {
        consider({
          skillId,
          reason: 'confusion_pair',
          priority: 100 + a.errorCount + b.errorCount,
          deferSessions: 0,
        });
      }
    }
  }

  for (const snapshot of skills) {
    const total = snapshot.correctCount + snapshot.errorCount;
    if (total === 0) {
      continue;
    }
    const errorRatio = snapshot.errorCount / total;

    if (snapshot.errorCount >= 3 && errorRatio >= 0.4) {
      consider({
        skillId: snapshot.skillId,
        reason: 'repeated_errors',
        priority: 80 + snapshot.errorCount,
        deferSessions: 0,
      });
      continue;
    }

    if (snapshot.hintCount >= 2 && errorRatio >= 0.2) {
      consider({
        skillId: snapshot.skillId,
        reason: 'needed_hints',
        priority: 50 + snapshot.hintCount,
        deferSessions: 1,
      });
      continue;
    }

    if (snapshot.lastPracticedAt !== null) {
      const ageDays = (now - Date.parse(snapshot.lastPracticedAt)) / 86_400_000;
      if (ageDays >= STALE_AFTER_DAYS && snapshot.correctCount > 0) {
        consider({
          skillId: snapshot.skillId,
          reason: 'not_practiced_recently',
          priority: 20 + Math.min(Math.floor(ageDays), 30),
          deferSessions: 0,
        });
      }
    }
  }

  return [...recommendations.values()].sort(
    (a, b) => b.priority - a.priority || a.skillId.localeCompare(b.skillId),
  );
}

/** French copy for the parent dashboard — keep human, never technical. */
export function describeRevisionReason(reason: RevisionReason): string {
  switch (reason) {
    case 'repeated_errors':
      return 'Cette notion a posé plusieurs difficultés récemment.';
    case 'needed_hints':
      return 'Cette notion a souvent eu besoin d’un coup de pouce.';
    case 'not_practiced_recently':
      return 'Cette notion n’a pas été pratiquée depuis un moment.';
    case 'confusion_pair':
      return 'Deux sons proches sont parfois confondus : on les compare ensemble.';
    default: {
      const unhandled: never = reason;
      throw new Error(`unhandled reason: ${String(unhandled)}`);
    }
  }
}
