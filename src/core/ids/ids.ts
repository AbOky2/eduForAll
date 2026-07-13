import * as Crypto from 'expo-crypto';

/**
 * Branded identifier types. The brand is erased at runtime but prevents
 * mixing identifier kinds at compile time (e.g. passing a LessonId where a
 * ChildProfileId is expected).
 */
declare const brand: unique symbol;

export type Branded<T, B extends string> = T & { readonly [brand]: B };

export type ChildProfileId = Branded<string, 'ChildProfileId'>;
export type LessonId = Branded<string, 'LessonId'>;
export type LessonStepId = Branded<string, 'LessonStepId'>;
export type WorldId = Branded<string, 'WorldId'>;
export type SkillId = Branded<string, 'SkillId'>;
export type AudioAssetId = Branded<string, 'AudioAssetId'>;
export type LearningSessionId = Branded<string, 'LearningSessionId'>;

export function newChildProfileId(): ChildProfileId {
  return Crypto.randomUUID() as ChildProfileId;
}

export function newLearningSessionId(): LearningSessionId {
  return Crypto.randomUUID() as LearningSessionId;
}

/** Casts a trusted, already-validated string (from DB or validated content). */
export function asId<B extends string>(value: string): Branded<string, B> {
  return value as Branded<string, B>;
}
