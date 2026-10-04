import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { curriculumManifestSchema } from '@/content/schemas/curriculum-schema';

import { vocabularyLesson } from '../../scripts/content/builders';
import { THEMES, type Theme } from '../../scripts/content/data/vocabulary';
import {
  countSharedTargets,
  duplicateIllustrations,
  imageQuestions,
  sharedTargetIllustrations,
  sharedTargetRegressions,
  type ImageQuestion,
} from '../../scripts/content/image-checks';
import { imageMcqStep } from '../../scripts/content/steps';

const manifest = curriculumManifestSchema.parse(
  JSON.parse(
    readFileSync(join(__dirname, '../../src/content/manifests/curriculum-v1.json'), 'utf8'),
  ),
);
const questions = imageQuestions(manifest);

const ctx = { lessonId: 'test-lesson', skills: ['language.test'] };

function choicesOf(step: Record<string, unknown>): { label: string; illustrationId: string }[] {
  return step.choices as { label: string; illustrationId: string }[];
}

describe('« Touche l’image » : un dessin par carte', () => {
  it('finds every image question of the bundled manifest', () => {
    expect(questions.length).toBeGreaterThan(200);
  });

  it('never shows the same drawing on two cards of one question', () => {
    const clashes = questions.flatMap((question) =>
      duplicateIllustrations(question.choices).map((clash) => `${question.id} : ${clash}`),
    );
    expect(clashes).toEqual([]);
  });

  it('names the two words that share a drawing', () => {
    expect(
      duplicateIllustrations([
        { id: 'fête', label: 'fête', illustrationId: 'icon-drum' },
        { id: 'tambour', label: 'tambour', illustrationId: 'icon-drum' },
        { id: 'boubou', label: 'boubou', illustrationId: 'icon-boubou' },
      ]),
    ).toEqual(['« fête » et « tambour » ont le même dessin (icon-drum)']);
    expect(
      duplicateIllustrations([
        { id: 'chèvre', illustrationId: 'icon-goat' },
        { id: 'mouton', illustrationId: 'icon-sheep' },
      ]),
    ).toEqual([]);
  });

  it('makes the generator refuse a question with two identical drawings', () => {
    expect(() =>
      imageMcqStep(ctx, { word: 'ami', icon: 'icon-friends' }, [
        { word: 'frère', icon: 'icon-friends' },
        { word: 'papa', icon: 'icon-father' },
      ]),
    ).toThrow(/« ami » et « frère » ont le même dessin \(icon-friends\)/);
  });

  it('swaps a clashing distractor for the theme’s reserve word, and nothing else', () => {
    const famille = THEMES.find((theme) => theme.id === 'famille') as Theme;
    const lesson = vocabularyLesson(famille, 'cp1', 1, null);
    const imageSteps = lesson.steps.filter((step) => step.type === 'image_multiple_choice');
    const labels = imageSteps.map((step) => choicesOf(step).map((choice) => choice.label));
    expect(labels).toEqual([
      ['papa', 'maman', 'bébé'],
      ['maman', 'bébé', 'ami'],
      // « frère » partage le dessin d'« ami » : la réserve (« papa ») le remplace.
      ['bébé', 'ami', 'papa'],
      ['ami', 'papa', 'sœur'],
    ]);
  });

  it('fails loudly when a theme has no reserve word with a free drawing', () => {
    const famille = THEMES.find((theme) => theme.id === 'famille') as Theme;
    const withoutReserve: Theme = { ...famille, cp1Reserve: [] };
    expect(() => vocabularyLesson(withoutReserve, 'cp1', 1, null)).toThrow(/réserve du thème/);
  });
});

describe('« Touche l’image » : un dessin, un seul mot cible', () => {
  const question = (id: string, word: string, illustrationId: string): ImageQuestion => ({
    id,
    correctChoiceId: word,
    choices: [
      { id: word, label: word, illustrationId },
      { id: 'autre', label: 'autre', illustrationId: 'icon-other' },
    ],
  });

  it('lists the drawings that are the answer for several words', () => {
    expect(
      sharedTargetIllustrations([
        question('s1', 'pantalon', 'icon-trousers'),
        question('s2', 'jupe', 'icon-trousers'),
        question('s3', 'pantalon', 'icon-trousers'),
        question('s4', 'chèvre', 'icon-goat'),
      ]),
    ).toEqual([
      {
        illustrationId: 'icon-trousers',
        targets: [
          { word: 'pantalon', stepIds: ['s1', 's3'] },
          { word: 'jupe', stepIds: ['s2'] },
        ],
      },
    ]);
  });

  it('counts the extra words, not only the drawings', () => {
    const shared = sharedTargetIllustrations([
      question('s1', 'maman', 'icon-mother'),
      question('s2', 'tante', 'icon-mother'),
      question('s3', 'mariage', 'icon-mother'),
    ]);
    expect(countSharedTargets(shared)).toEqual({ illustrations: 1, extraWords: 2 });
  });

  it('can only go down: the bundled manifest stays under both ceilings', () => {
    expect(sharedTargetRegressions(sharedTargetIllustrations(questions))).toEqual([]);
  });
});
