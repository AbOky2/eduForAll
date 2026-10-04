import { buildLesson } from '@/shared/testing/lesson-fixtures';

import {
  createLessonMachine,
  lessonReducer,
  type LessonEvent,
  type LessonMachineState,
} from './lesson-machine';
import { answerAgainEvents, canAnswerAgainByCard, isAnsweredByOneCard } from './retry-by-card';

/** Un choix (avec indice), une syllabe à composer, un son à écouter. */
function lesson() {
  return buildLesson({
    steps: [
      {
        id: 'step-choice',
        type: 'audio_multiple_choice',
        skills: ['skill-son-ba'],
        instruction: { text: 'Que viens-tu d’entendre ?', audioId: 'instr-quentends-tu' },
        audioId: 'syllabe-ba',
        choices: [
          { id: 'ba', label: 'ba' },
          { id: 'ma', label: 'ma' },
          { id: 'ta', label: 'ta' },
        ],
        correctChoiceId: 'ba',
        layout: 'list',
        hint: { text: 'Écoute bien le début.', audioId: 'hint-premiere-lettre' },
      },
      {
        id: 'step-compose',
        type: 'compose_syllable',
        skills: ['skill-son-ba'],
        instruction: { text: 'Forme la syllabe.', audioId: 'instr-forme-la-syllabe' },
        target: 'ba',
        tiles: ['b', 'm', 'a'],
      },
      {
        id: 'step-listen',
        type: 'listen',
        skills: ['skill-son-ba'],
        instruction: { text: 'Écoute le son.', audioId: 'instr-ecoute-le-son' },
        glyph: 'ba',
        audioId: 'syllabe-ba',
      },
    ],
  });
}

const run = (state: LessonMachineState, events: readonly LessonEvent[]) =>
  events.reduce(lessonReducer, state);

const choose = (choiceId: string): LessonEvent => ({
  type: 'ANSWER_SUBMITTED',
  answer: { kind: 'choice', choiceId },
});

function awaitingChoice(): LessonMachineState {
  return lessonReducer(createLessonMachine(lesson()), { type: 'STEP_PRESENTED' });
}

describe('réessayer en touchant une carte', () => {
  it("n'existe que pendant la feuille « à revoir » du premier essai manqué", () => {
    const awaiting = awaitingChoice();
    expect(canAnswerAgainByCard(awaiting)).toBe(false);
    expect(canAnswerAgainByCard(lessonReducer(awaiting, choose('ba')))).toBe(false);

    const firstMiss = lessonReducer(awaiting, choose('ma'));
    expect(canAnswerAgainByCard(firstMiss)).toBe(true);

    const secondMiss = run(firstMiss, answerAgainEvents({ kind: 'choice', choiceId: 'ta' }));
    expect(secondMiss.phase).toBe('showing_feedback');
    expect(secondMiss.attemptsOnCurrentStep).toBe(2);
    // Au deuxième essai manqué, la feuille se lit jusqu'au bout : elle ouvre l'indice.
    expect(canAnswerAgainByCard(secondMiss)).toBe(false);
  });

  it('compte la carte touchée comme un deuxième essai, ni plus ni moins', () => {
    const firstMiss = lessonReducer(awaitingChoice(), choose('ma'));
    const byCard = run(firstMiss, answerAgainEvents({ kind: 'choice', choiceId: 'ba' }));
    const byButton = run(firstMiss, [{ type: 'FEEDBACK_DISMISSED' }, choose('ba')]);

    expect(byCard).toEqual(byButton);
    expect(byCard.lastFeedback).toBe('correct');
    expect(byCard.attemptsOnCurrentStep).toBe(2);
    expect(byCard.hintShownOnCurrentStep).toBe(false);

    const next = lessonReducer(byCard, { type: 'FEEDBACK_DISMISSED' });
    expect(next.outcomes[0]).toMatchObject({
      stepId: 'step-choice',
      firstTryCorrect: false,
      attempts: 2,
      usedHint: false,
    });
  });

  it("garde l'indice qui s'ouvre de lui-même après deux essais manqués", () => {
    const firstMiss = lessonReducer(awaitingChoice(), choose('ma'));
    const secondMiss = run(firstMiss, answerAgainEvents({ kind: 'choice', choiceId: 'ma' }));
    const dismissed = lessonReducer(secondMiss, { type: 'FEEDBACK_DISMISSED' });
    expect(dismissed.phase).toBe('showing_hint');
    expect(dismissed.hintShownOnCurrentStep).toBe(true);
  });

  it("ne s'applique pas à une réponse en plusieurs gestes (composer)", () => {
    const afterChoice = run(awaitingChoice(), [
      choose('ba'),
      { type: 'FEEDBACK_DISMISSED' },
      { type: 'STEP_PRESENTED' },
    ]);
    const miss = lessonReducer(afterChoice, {
      type: 'ANSWER_SUBMITTED',
      answer: { kind: 'sequence', values: ['m', 'a'] },
    });
    expect(miss.lastFeedback).toBe('incorrect');
    expect(canAnswerAgainByCard(miss)).toBe(false);
  });

  it('tranche pour chaque type : une carte, une réponse', () => {
    expect(isAnsweredByOneCard('image_multiple_choice')).toBe(true);
    expect(isAnsweredByOneCard('count_objects')).toBe(true);
    expect(isAnsweredByOneCard('match_pairs')).toBe(false);
    expect(isAnsweredByOneCard('trace_letter')).toBe(false);
    expect(isAnsweredByOneCard('trace_graphism')).toBe(false);
    expect(isAnsweredByOneCard('listen_and_repeat')).toBe(false);
  });
});
