/** Lesson and world assembly, shared by both levels. */
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

export const skillSound = (sound: string) => `skill-son-${slugId(sound)}`;
export const skillLetter = (letter: string) => `skill-lettre-${slugId(letter)}`;
export const skillWriting = (topic: string) => `skill-ecriture-${slugId(topic)}`;
export const skillNumber = (topic: string) => `skill-nombre-${slugId(topic)}`;
export const skillMath = (topic: string) => `skill-calcul-${slugId(topic)}`;
export const skillLanguage = (topic: string) => `skill-langage-${slugId(topic)}`;
export const skillReading = (topic: string) => `skill-lecture-${slugId(topic)}`;

function slugId(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
