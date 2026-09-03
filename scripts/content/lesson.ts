/** Lesson and world assembly, shared by both levels. */
import { slug as slugId } from './audio';
import type { AnyStep } from './steps';

export interface LessonSpec {
  id: string;
  title: string;
  shortDescription: string;
  learningObjectives: string[];
  skills: string[];
  estimatedDurationMinutes: number;
  /** Trimestre officiel (1, 2 ou 3). */
  term: 1 | 2 | 3;
  /** Semaine de classe sur les 30 semaines effectives. */
  week: number;
  /** Contenu officiel couvert — cité depuis official-program.ts. */
  officialReference: string;
  prerequisiteLessonIds: string[];
  steps: AnyStep[];
}

export interface WorldSpec {
  id: string;
  title: string;
  subtitle: string;
  subject: 'language' | 'reading' | 'writing' | 'math';
  lessons: LessonSpec[];
}

/** Which trimester a given week of the Chadian school year belongs to. */
export function termOfWeek(week: number): 1 | 2 | 3 {
  if (week <= 10) {
    return 1;
  }
  return week <= 20 ? 2 : 3;
}

/**
 * Les identifiants de compétence partagent le slug des audios : les accents y
 * sont encodés (« é » → « e1 »). Sans cela « le son é » et « le son e »
 * — deux leçons distinctes — se partageraient une compétence, et une leçon de
 * révision insérerait deux fois la même ligne dans lesson_skills.
 */
export const skillSound = (sound: string) => `skill-son-${slugId(sound)}`;
export const skillLetter = (letter: string) => `skill-lettre-${slugId(letter)}`;
export const skillWriting = (topic: string) => `skill-ecriture-${slugId(topic)}`;
export const skillNumber = (topic: string) => `skill-nombre-${slugId(topic)}`;
export const skillMath = (topic: string) => `skill-calcul-${slugId(topic)}`;
export const skillLanguage = (topic: string) => `skill-langage-${slugId(topic)}`;
export const skillReading = (topic: string) => `skill-lecture-${slugId(topic)}`;

