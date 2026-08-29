import { z } from 'zod';

/**
 * Exercise content schemas — the single source of truth for what a lesson
 * step may contain. Every bundled manifest is validated against these before
 * import; the app refuses silently-invalid content (ContentValidationError).
 */

const idSchema = z.string().min(1).max(80);
const audioIdSchema = z.string().min(1).max(120);
const illustrationIdSchema = z.string().min(1).max(120);

/** A spoken instruction: short child-friendly French + its audio asset. */
export const spokenTextSchema = z.object({
  text: z.string().min(1).max(200),
  audioId: audioIdSchema,
});

const hintSchema = z.object({
  text: z.string().min(1).max(200),
  audioId: audioIdSchema.optional(),
});

const choiceSchema = z.object({
  id: idSchema,
  label: z.string().min(1).max(60),
  audioId: audioIdSchema.optional(),
});

const imageChoiceSchema = z.object({
  id: idSchema,
  illustrationId: illustrationIdSchema,
  label: z.string().min(1).max(60).optional(),
});

const baseStep = {
  id: idSchema,
  skills: z.array(idSchema).min(1),
  instruction: spokenTextSchema,
  hint: hintSchema.optional(),
};

export const exerciseStepSchema = z.discriminatedUnion('type', [
  // 1 — passive presentation of a sound/letter/syllable
  z.object({
    ...baseStep,
    type: z.literal('listen'),
    glyph: z.string().min(1).max(20),
    audioId: audioIdSchema,
  }),
  // 2 — hear a sound, pick the matching text
  z.object({
    ...baseStep,
    type: z.literal('audio_multiple_choice'),
    audioId: audioIdSchema,
    choices: z.array(choiceSchema).min(2).max(6),
    correctChoiceId: idSchema,
    layout: z.enum(['list', 'grid']).default('list'),
  }),
  // 3 — read a question, pick the matching text
  z.object({
    ...baseStep,
    type: z.literal('text_multiple_choice'),
    question: z.string().min(1).max(200),
    choices: z.array(choiceSchema).min(2).max(6),
    correctChoiceId: idSchema,
  }),
  // 4 — pick the matching image
  z.object({
    ...baseStep,
    type: z.literal('image_multiple_choice'),
    audioId: audioIdSchema.optional(),
    choices: z.array(imageChoiceSchema).min(2).max(6),
    correctChoiceId: idSchema,
  }),
  // 5 — match pairs (word↔image, letter↔sound…)
  z.object({
    ...baseStep,
    type: z.literal('match_pairs'),
    pairs: z
      .array(
        z.object({
          id: idSchema,
          left: z.string().min(1).max(40),
          right: z.string().min(1).max(40),
          rightIllustrationId: illustrationIdSchema.optional(),
        }),
      )
      .min(2)
      .max(5),
  }),
  // 6 — tap the requested letter among options
  z.object({
    ...baseStep,
    type: z.literal('tap_letter'),
    target: z.string().length(1),
    options: z.array(z.string().length(1)).min(2).max(8),
    audioId: audioIdSchema.optional(),
  }),
  // 7 — tap the requested syllable
  z.object({
    ...baseStep,
    type: z.literal('tap_syllable'),
    target: z.string().min(2).max(4),
    options: z.array(z.string().min(1).max(4)).min(2).max(8),
    audioId: audioIdSchema.optional(),
  }),
  // 8 — drag letters to build a syllable (mockup S13)
  z.object({
    ...baseStep,
    type: z.literal('compose_syllable'),
    target: z.string().min(2).max(4),
    tiles: z.array(z.string().length(1)).min(2).max(8),
    audioId: audioIdSchema.optional(),
  }),
  // 9 — drag syllables to build a word
  z.object({
    ...baseStep,
    type: z.literal('compose_word'),
    target: z.string().min(2).max(16),
    tiles: z.array(z.string().min(1).max(4)).min(2).max(8),
    audioId: audioIdSchema.optional(),
  }),
  // 10 — complete the word with the missing letter
  z.object({
    ...baseStep,
    type: z.literal('fill_missing_letter'),
    /** Word with a single underscore, e.g. "ma_son". */
    maskedWord: z.string().regex(/^[^_]*_[^_]*$/),
    answer: z.string().length(1),
    options: z.array(z.string().length(1)).min(2).max(6),
    audioId: audioIdSchema.optional(),
  }),
  // 11 — put the words of a sentence in order
  z.object({
    ...baseStep,
    type: z.literal('order_words'),
    sentence: z.array(z.string().min(1).max(20)).min(2).max(8),
    distractors: z.array(z.string().min(1).max(20)).max(3).default([]),
    audioId: audioIdSchema.optional(),
  }),
  // 12 — finger-trace a letter along a guided path
  z.object({
    ...baseStep,
    type: z.literal('trace_letter'),
    letter: z.string().min(1).max(2),
    audioId: audioIdSchema.optional(),
  }),
  // 13 — count the illustrated objects (mockup S14)
  z.object({
    ...baseStep,
    type: z.literal('count_objects'),
    illustrationId: illustrationIdSchema,
    objectName: z.string().min(1).max(40),
    count: z.number().int().min(0).max(20),
    options: z.array(z.number().int().min(0).max(100)).min(2).max(4),
  }),
  // 14 — complete a number sequence
  z.object({
    ...baseStep,
    type: z.literal('number_sequence'),
    /** null marks the gap, e.g. [2, 4, null, 8]. */
    sequence: z.array(z.number().int().min(0).max(100).nullable()).min(3).max(6),
    answer: z.number().int().min(0).max(100),
    options: z.array(z.number().int().min(0).max(100)).min(2).max(4),
  }),
  // 15 — compare two numbers
  z.object({
    ...baseStep,
    type: z.literal('compare_numbers'),
    left: z.number().int().min(0).max(100),
    right: z.number().int().min(0).max(100),
    mode: z.enum(['greater', 'smaller']),
  }),
  // 16 — simple addition (mockup S15)
  z.object({
    ...baseStep,
    type: z.literal('simple_addition'),
    a: z.number().int().min(0).max(100),
    b: z.number().int().min(0).max(100),
    options: z.array(z.number().int().min(0).max(200)).min(2).max(4),
    showQuantities: z.boolean().default(true),
  }),
  // 17 — simple subtraction
  z.object({
    ...baseStep,
    type: z.literal('simple_subtraction'),
    a: z.number().int().min(0).max(100),
    b: z.number().int().min(0).max(100),
    options: z.array(z.number().int().min(0).max(100)).min(2).max(4),
    showQuantities: z.boolean().default(true),
  }),
  // 18 — small illustrated word problem
  z.object({
    ...baseStep,
    type: z.literal('visual_word_problem'),
    statement: z.string().min(1).max(300),
    statementAudioId: audioIdSchema.optional(),
    illustrationId: illustrationIdSchema.optional(),
    answer: z.number().int().min(0).max(100),
    options: z.array(z.number().int().min(0).max(100)).min(2).max(4),
  }),
  // 19 — listen then repeat aloud (local-only, optional replay of own voice)
  z.object({
    ...baseStep,
    type: z.literal('listen_and_repeat'),
    text: z.string().min(1).max(120),
    audioId: audioIdSchema,
  }),
  // 20 — short story followed by a comprehension question
  z.object({
    ...baseStep,
    type: z.literal('mini_story_question'),
    story: z.string().min(1).max(600),
    storyAudioId: audioIdSchema,
    question: z.string().min(1).max(200),
    questionAudioId: audioIdSchema.optional(),
    choices: z.array(choiceSchema).min(2).max(4),
    correctChoiceId: idSchema,
  }),
  // ---------------------------------------------------------------------
  // Types couvrant les contenus officiels du programme tchadien qui
  // n'étaient traités par aucun exercice (voir official-program.ts).
  // ---------------------------------------------------------------------
  // 21 — tailles / couleurs / formes / quantités (programme p. 58)
  z.object({
    ...baseStep,
    type: z.literal('attribute_choice'),
    /** Famille de contenu officiel visée. */
    attribute: z.enum(['size', 'color', 'shape', 'quantity']),
    audioId: audioIdSchema.optional(),
    /** Figures dessinées par le renderer — aucune illustration à produire. */
    choices: z
      .array(
        z.object({
          id: idSchema,
          shape: z.enum(['rond', 'carre', 'rectangle', 'triangle', 'ligne']),
          /** Couleurs de la liste officielle uniquement. */
          color: z.enum(['rouge', 'bleu', 'jaune', 'vert', 'blanc', 'noir']).default('bleu'),
          /** Échelle relative — famille « grand / petit / long / court ». */
          scale: z.number().min(0.3).max(1).default(1),
          /** Répétition — famille « peu / beaucoup / rien / nul ». */
          count: z.number().int().min(0).max(12).default(1),
          label: z.string().max(30).optional(),
        }),
      )
      .min(2)
      .max(4),
    correctChoiceId: idSchema,
  }),
  // 22 — les repères : sur, sous, devant, derrière, entre… (programme p. 58)
  z.object({
    ...baseStep,
    type: z.literal('spatial_position'),
    audioId: audioIdSchema.optional(),
    objectIllustrationId: illustrationIdSchema,
    referenceIllustrationId: illustrationIdSchema,
    choices: z
      .array(
        z.object({
          id: idSchema,
          relation: z.enum([
            'sur',
            'sous',
            'dans',
            'devant',
            'derriere',
            'a-gauche',
            'a-droite',
            'au-dessus',
            'en-dessous',
            'entre',
            'a-cote',
          ]),
        }),
      )
      .min(2)
      .max(4),
    correctChoiceId: idSchema,
  }),
  // 23 — « la multiplication […] par 2 et par 5 » (programme p. 59)
  z.object({
    ...baseStep,
    type: z.literal('simple_multiplication'),
    a: z.number().int().min(0).max(20),
    b: z.number().int().min(2).max(5),
    options: z.array(z.number().int().min(0).max(100)).min(2).max(4),
    showQuantities: z.boolean().default(true),
  }),
  // 24 — « […] et la division par 2 et par 5 » (programme p. 59)
  z
    .object({
      ...baseStep,
      type: z.literal('simple_division'),
      a: z.number().int().min(0).max(100),
      b: z.number().int().min(2).max(5),
      options: z.array(z.number().int().min(0).max(50)).min(2).max(4),
      showQuantities: z.boolean().default(true),
    })
    .refine((step) => step.a % step.b === 0, {
      message: 'division must be exact at CP level',
      path: ['a'],
    }),
  // 25 — « les pièces de monnaie » (programme p. 59), en francs CFA
  z.object({
    ...baseStep,
    type: z.literal('count_money'),
    /** Pièces réellement en circulation au Tchad (XAF). */
    coins: z
      .array(
        z.union([
          z.literal(5),
          z.literal(10),
          z.literal(25),
          z.literal(50),
          z.literal(100),
          z.literal(500),
        ]),
      )
      .min(1)
      .max(8),
    answer: z.number().int().min(0).max(2000),
    options: z.array(z.number().int().min(0).max(2000)).min(2).max(4),
  }),
  // 26 — graphisme préparatoire, avant toute lettre (programme p. 26)
  z.object({
    ...baseStep,
    type: z.literal('trace_graphism'),
    /** Tracés listés nommément par le programme. */
    pattern: z.enum([
      'points',
      'ligne-verticale',
      'ligne-horizontale',
      'oblique',
      'rond',
      'courbe',
      'boucle-haut',
      'boucle-bas',
      'pont',
      'enchainement',
    ]),
    audioId: audioIdSchema.optional(),
  }),
  // 27 — situer un son dans un mot : « connaître les éléments composant un
  //      mot (sons, syllabes) », « maîtriser la combinatoire » (p. 18, 23)
  z.object({
    ...baseStep,
    type: z.literal('sound_position'),
    word: z.string().min(2).max(20),
    sound: z.string().min(1).max(4),
    audioId: audioIdSchema,
    answer: z.enum(['debut', 'milieu', 'fin']),
  }),
]);

export type ExerciseStep = z.infer<typeof exerciseStepSchema>;
export type ExerciseType = ExerciseStep['type'];
export type SpokenText = z.infer<typeof spokenTextSchema>;

export const EXERCISE_TYPES = [
  'listen',
  'audio_multiple_choice',
  'text_multiple_choice',
  'image_multiple_choice',
  'match_pairs',
  'tap_letter',
  'tap_syllable',
  'compose_syllable',
  'compose_word',
  'fill_missing_letter',
  'order_words',
  'trace_letter',
  'count_objects',
  'number_sequence',
  'compare_numbers',
  'simple_addition',
  'simple_subtraction',
  'visual_word_problem',
  'listen_and_repeat',
  'mini_story_question',
  'attribute_choice',
  'spatial_position',
  'simple_multiplication',
  'simple_division',
  'count_money',
  'trace_graphism',
  'sound_position',
] as const satisfies readonly ExerciseType[];
