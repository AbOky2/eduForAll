import { fixedClock } from '@/core/time/clock';

import { MAX_OPEN_REVISIONS, recommendRevisions, type SkillSnapshot } from './revision-engine';

const clock = fixedClock(new Date('2026-07-13T10:00:00Z'));

function snapshot(overrides: Partial<SkillSnapshot> & { skillId: string }): SkillSnapshot {
  return {
    correctCount: 0,
    errorCount: 0,
    hintCount: 0,
    lastPracticedAt: '2026-07-12T10:00:00Z',
    ...overrides,
  };
}

describe('recommendRevisions', () => {
  it('is deterministic for identical input', () => {
    const skills = [
      snapshot({ skillId: 'skill-son-ba', errorCount: 3, correctCount: 2 }),
      snapshot({ skillId: 'skill-son-ma', errorCount: 3, correctCount: 1 }),
    ];
    expect(recommendRevisions(skills, clock)).toEqual(recommendRevisions(skills, clock));
  });

  it('surfaces confusable pairs together with top priority', () => {
    const recommendations = recommendRevisions(
      [
        snapshot({ skillId: 'skill-son-ba', errorCount: 2, correctCount: 4 }),
        snapshot({ skillId: 'skill-son-ma', errorCount: 2, correctCount: 5 }),
        snapshot({ skillId: 'skill-son-lu', errorCount: 5, correctCount: 1 }),
      ],
      clock,
    );
    const pair = recommendations.filter((r) => r.reason === 'confusion_pair');
    expect(pair.map((r) => r.skillId).sort()).toEqual(['skill-son-ba', 'skill-son-ma']);
    expect(recommendations[0]?.reason).toBe('confusion_pair');
  });

  it('flags repeated errors before hint-hungry skills', () => {
    const recommendations = recommendRevisions(
      [
        snapshot({ skillId: 'skill-nombre-13', errorCount: 4, correctCount: 2 }),
        snapshot({ skillId: 'skill-nombre-17', hintCount: 3, errorCount: 1, correctCount: 3 }),
      ],
      clock,
    );
    expect(recommendations.map((r) => r.reason)).toEqual(['repeated_errors', 'needed_hints']);
  });

  it('resurfaces stale but learned skills', () => {
    const recommendations = recommendRevisions(
      [
        snapshot({
          skillId: 'skill-lettre-a',
          correctCount: 6,
          lastPracticedAt: '2026-06-20T10:00:00Z',
        }),
      ],
      clock,
    );
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]?.reason).toBe('not_practiced_recently');
  });

  it('recommends nothing for a fresh profile', () => {
    expect(recommendRevisions([], clock)).toEqual([]);
    expect(
      recommendRevisions([snapshot({ skillId: 'skill-son-ba', lastPracticedAt: null })], clock),
    ).toEqual([]);
  });

  it('ne met jamais plus de notions devant l’enfant que le plafond', () => {
    // Après une semaine sans ouvrir l'app, la règle d'ancienneté vise TOUTES
    // les notions déjà réussies. Sans plafond, l'app annoncerait « 135 notions
    // à revoir » à un enfant de six ans.
    const stale: SkillSnapshot[] = Array.from({ length: 135 }, (_, index) => ({
      skillId: `skill-son-${index}`,
      correctCount: 3,
      errorCount: 0,
      hintCount: 0,
      lastPracticedAt: '2026-03-01T08:00:00.000Z',
    }));
    const recommendations = recommendRevisions(stale, fixedClock(new Date('2026-04-01T08:00:00.000Z')));
    expect(recommendations).toHaveLength(MAX_OPEN_REVISIONS);
  });

  it('garde les notions les plus prioritaires quand il plafonne', () => {
    const skills: SkillSnapshot[] = [
      // Ancienneté seule : priorité basse.
      ...Array.from({ length: 20 }, (_, index) => ({
        skillId: `skill-vieux-${index}`,
        correctCount: 2,
        errorCount: 0,
        hintCount: 0,
        lastPracticedAt: '2026-03-01T08:00:00.000Z',
      })),
      // Erreurs répétées : priorité haute, doit survivre au plafond.
      {
        skillId: 'skill-son-difficile',
        correctCount: 1,
        errorCount: 6,
        hintCount: 0,
        lastPracticedAt: '2026-03-01T08:00:00.000Z',
      },
    ];
    const recommendations = recommendRevisions(
      skills,
      fixedClock(new Date('2026-04-01T08:00:00.000Z')),
    );
    expect(recommendations[0]?.skillId).toBe('skill-son-difficile');
    expect(recommendations[0]?.reason).toBe('repeated_errors');
  });
});
