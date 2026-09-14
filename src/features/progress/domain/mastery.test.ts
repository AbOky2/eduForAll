import { masteryFor } from './mastery';

describe('masteryFor', () => {
  it('découvre une notion jamais pratiquée', () => {
    expect(masteryFor({ correctCount: 0, errorCount: 0, needsReview: false })).toBe('discovering');
  });

  it('déclare maîtrisée une notion réussie trois fois presque sans erreur', () => {
    expect(masteryFor({ correctCount: 5, errorCount: 0, needsReview: false })).toBe('mastered');
  });

  it('laisse le droit de rater une fois', () => {
    // 9 réussites pour 1 erreur : 10 % d'erreurs, sous le seuil.
    expect(masteryFor({ correctCount: 9, errorCount: 1, needsReview: false })).toBe('mastered');
  });

  it('reste en pratique tant que les erreurs pèsent', () => {
    expect(masteryFor({ correctCount: 3, errorCount: 2, needsReview: false })).toBe('practicing');
  });

  it('reste en pratique avant le seuil, même sans erreur', () => {
    expect(masteryFor({ correctCount: 2, errorCount: 0, needsReview: false })).toBe('practicing');
  });

  it('passe à revoir dès que le moteur reprogramme la notion', () => {
    // Même un sans-faute : le moteur peut la reprogrammer pour ancienneté.
    expect(masteryFor({ correctCount: 9, errorCount: 0, needsReview: true })).toBe('needs_review');
  });
});
