/* eslint-disable no-console */
/**
 * Générateur de contenu ALIFA — une année scolaire complète, CP1 et CP2,
 * calquée sur les « Programmes Réactualisés de l'Enseignement Primaire »
 * (République du Tchad, MEN / Centre National des Curricula, sept. 2004).
 *
 * Produit :
 *   - src/content/manifests/curriculum-v1.json   (validé par les schémas Zod)
 *   - src/content/audio-registry.generated.ts    (require() statiques, offline)
 *   - assets/audio/manifest.json                 (inventaire des sons)
 *   - assets/audio/tts-map.json                  (audioId → texte à enregistrer)
 *   - docs/couverture-programme.md               (traçabilité programme → leçons)
 *
 * Déterministe : mêmes entrées, sortie octet pour octet identique.
 * Toute modification du contenu se fait ici ou dans scripts/content/data/,
 * jamais dans le manifeste.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { curriculumManifestSchema } from '../src/content/schemas/curriculum-schema';
import {
  LANGUAGE_THEMES,
  MATH_CONTENTS,
  MENTAL_MATH_CONTENTS,
  OFFICIAL_SOURCE,
  READING_INVENTORY,
  WEEKLY_TIMETABLE_CP,
  WRITING_PROGRESSION,
} from '../src/content/curriculum/official-program';
import { audioEntries } from './content/audio';
import { usedIllustrations } from './content/assets';
import { buildCp1 } from './content/cp1';
import { buildCp2 } from './content/cp2';
import type { LessonSpec, WorldSpec } from './content/lesson';

const ROOT = join(__dirname, '..');
const CONTENT_VERSION = '2.1.0';
const GENERATED_AT = '2026-08-26T00:00:00.000Z';

const cp1 = buildCp1();
const cp2 = buildCp2();

// ---------------------------------------------------------------------------
// Assemblage
// ---------------------------------------------------------------------------

const manifest = {
  schemaVersion: 1,
  contentVersion: CONTENT_VERSION,
  generatedAt: GENERATED_AT,
  levels: [
    { id: 'CP1', title: 'CP1', worlds: cp1 },
    { id: 'CP2', title: 'CP2', worlds: cp2 },
  ],
  assets: [
    ...audioEntries().map(([id]) => ({
      id,
      kind: 'audio' as const,
      file: `audio/fr/${id}.m4a`,
      placeholder: true,
    })),
    ...usedIllustrations().map((id) => ({
      id,
      kind: 'illustration' as const,
      file: `illustrations/${id}.svg`,
      placeholder: false,
    })),
  ],
};

// ---------------------------------------------------------------------------
// Contrôles d'intégrité avant validation de schéma
// ---------------------------------------------------------------------------

const allLessons: LessonSpec[] = [...cp1, ...cp2].flatMap((world) => world.lessons);
const lessonIds = new Set<string>();
const problems: string[] = [];

for (const lesson of allLessons) {
  if (lessonIds.has(lesson.id)) {
    problems.push(`identifiant de leçon en double : ${lesson.id}`);
  }
  lessonIds.add(lesson.id);
  // lesson_skills a pour clé primaire (lesson_id, skill_id) : un doublon ici
  // fait échouer l'import du manifeste au premier lancement, donc le bootstrap.
  if (new Set(lesson.skills).size !== lesson.skills.length) {
    problems.push(`${lesson.id} : compétence en double`);
  }
}
for (const [audioId, entry] of audioEntries()) {
  // « o = au = eau » est une notation d'écran ; dite telle quelle, une voix
  // lit « égale ». say.sound / say.instruction doivent l'avoir énumérée.
  if (entry.text.includes('=')) {
    problems.push(`${audioId} : texte à dire contenant « = » (« ${entry.text} »)`);
  }
}
for (const lesson of allLessons) {
  for (const prerequisite of lesson.prerequisiteLessonIds) {
    if (!lessonIds.has(prerequisite)) {
      problems.push(`${lesson.id} : prérequis introuvable « ${prerequisite} »`);
    }
  }
}
const worldIds = new Set<string>();
for (const world of [...cp1, ...cp2] as WorldSpec[]) {
  if (worldIds.has(world.id)) {
    problems.push(`identifiant de monde en double : ${world.id}`);
  }
  worldIds.add(world.id);
}
if (problems.length > 0) {
  console.error('CONTENU INCOHÉRENT :');
  for (const problem of problems.slice(0, 20)) {
    console.error(` - ${problem}`);
  }
  throw new Error(`${problems.length} problème(s) d'intégrité`);
}

const parsed = curriculumManifestSchema.safeParse(manifest);
if (!parsed.success) {
  console.error('MANIFESTE INVALIDE :');
  for (const issue of parsed.error.issues.slice(0, 25)) {
    console.error(` - ${issue.path.join('.')}: ${issue.message}`);
  }
  throw new Error('le manifeste ne passe pas la validation');
}

// ---------------------------------------------------------------------------
// Écriture des artefacts
// ---------------------------------------------------------------------------

function writeJson(relativePath: string, data: unknown): void {
  const fullPath = join(ROOT, relativePath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, `${JSON.stringify(data, null, 1)}\n`);
  console.log(`écrit ${relativePath}`);
}

writeJson('src/content/manifests/curriculum-v1.json', parsed.data);

const audioIds = audioEntries().map(([id]) => id);

const audioRegistry = [
  '/* AUTO-GENERATED by scripts/generate-content.ts — do not edit by hand. */',
  '',
  'export const audioSources: Record<string, number> = {',
  ...audioIds.map((id) => `  '${id}': require('../../assets/audio/fr/${id}.m4a'),`),
  '};',
  '',
  'export function resolveAudioSource(audioId: string): number | null {',
  '  return audioSources[audioId] ?? null;',
  '}',
  '',
].join('\n');
writeFileSync(join(ROOT, 'src/content/audio-registry.generated.ts'), audioRegistry);
console.log('écrit src/content/audio-registry.generated.ts');

/**
 * Quelle voix a effectivement enregistré chaque son.
 *
 * Écrit par `scripts/generate-voice-audio.ts` (voix IA) ou à la main pour des
 * enregistrements en studio. Un son absent de ce fichier reste un placeholder,
 * et `npm run validate:release` bloque la production tant qu'il en reste un.
 */
const PROVENANCE_PATH = join(ROOT, 'assets/audio/voice-provenance.json');
const provenance: Record<string, string> = existsSync(PROVENANCE_PATH)
  ? (JSON.parse(readFileSync(PROVENANCE_PATH, 'utf8')) as { voices: Record<string, string> }).voices
  : {};
const distinctVoices = [...new Set(Object.values(provenance))].sort();

writeJson('assets/audio/manifest.json', {
  generatedAt: GENERATED_AT,
  voice: distinctVoices.length > 0 ? distinctVoices.join(' + ') : 'placeholder-tts',
  entries: audioIds.map((id) => ({
    id,
    file: `fr/${id}.m4a`,
    placeholder: provenance[id] === undefined,
    ...(provenance[id] ? { voice: provenance[id] } : {}),
  })),
});
// audioId → { texte à dire, nature, phonèmes imposés } : lu par la chaîne de
// synthèse et par les outils de contrôle, jamais par l'app.
writeJson('assets/audio/tts-map.json', Object.fromEntries(audioEntries()));

// ---------------------------------------------------------------------------
// Rapport de couverture du programme officiel
// ---------------------------------------------------------------------------

function lessonsCovering(fragment: string): LessonSpec[] {
  return allLessons.filter((lesson) => lesson.officialReference.includes(fragment));
}

function coverageRow(label: string, fragment: string): string {
  const covering = lessonsCovering(fragment);
  const mark = covering.length > 0 ? '✅' : '❌';
  const sample = covering
    .slice(0, 2)
    .map((lesson) => lesson.title)
    .join(' · ');
  return `| ${label} | ${mark} | ${covering.length} | ${sample} |`;
}

const bySubject = (subject: string): number =>
  [...cp1, ...cp2]
    .filter((world) => world.subject === subject)
    .reduce((sum, world) => sum + world.lessons.length, 0);

const cp1Count = cp1.reduce((sum, world) => sum + world.lessons.length, 0);
const cp2Count = cp2.reduce((sum, world) => sum + world.lessons.length, 0);
const stepCount = allLessons.reduce((sum, lesson) => sum + lesson.steps.length, 0);

const report = [
  '# Couverture du programme officiel tchadien',
  '',
  '> Document **généré** par `scripts/generate-content.ts`. Ne pas éditer à la main.',
  '',
  `Source : *${OFFICIAL_SOURCE.title}*, ${OFFICIAL_SOURCE.authority}, ${OFFICIAL_SOURCE.place}, ${OFFICIAL_SOURCE.date} (${OFFICIAL_SOURCE.pages} p.).`,
  '',
  '## 1. Volume produit',
  '',
  `- **${allLessons.length} leçons** — CP1 : ${cp1Count}, CP2 : ${cp2Count}`,
  `- **${stepCount} exercices**, **${audioIds.length} enregistrements**, **${usedIllustrations().length} illustrations**`,
  '',
  '## 2. Respect de la grille horaire (p. 128)',
  '',
  'Le nombre de leçons par discipline suit le poids horaire officiel.',
  '',
  '| Discipline | Horaire officiel | Part officielle | Leçons | Part produite |',
  '|---|---|---|---|---|',
  ...(() => {
    const core = WEEKLY_TIMETABLE_CP.filter((row) =>
      ['Lecture', 'Langage', 'Mathématiques', 'Écriture'].includes(row.subject),
    );
    const totalMinutes = core.reduce((sum, row) => sum + row.minutes, 0);
    const subjectKey: Record<string, string> = {
      Lecture: 'reading',
      Langage: 'language',
      Mathématiques: 'math',
      Écriture: 'writing',
    };
    return core.map((row) => {
      const lessons = bySubject(subjectKey[row.subject] as string);
      const officialShare = ((row.minutes / totalMinutes) * 100).toFixed(0);
      const producedShare = ((lessons / allLessons.length) * 100).toFixed(0);
      const hours = Math.floor(row.minutes / 60);
      const mins = row.minutes % 60;
      return `| ${row.subject} | ${hours} h${mins ? ` ${mins} mn` : ''} | ${officialShare} % | ${lessons} | ${producedShare} % |`;
    });
  })(),
  '',
  '## 3. Contenus de lecture (p. 23-24)',
  '',
  '| Contenu officiel | Couvert | Leçons |',
  '|---|---|---|',
  `| Voyelles simples : ${READING_INVENTORY.simpleVowels.join(', ')} | ${lessonsCovering('Voyelles simples').length > 0 ? '✅' : '❌'} | ${lessonsCovering('Voyelles simples').length} |`,
  `| Voyelles nasales : ${READING_INVENTORY.nasalVowels.join(', ')} | ${lessonsCovering('Voyelles nasales').length > 0 ? '✅' : '❌'} | ${lessonsCovering('Voyelles nasales').length} |`,
  `| Consonnes (22) | ${lessonsCovering('Consonnes').length > 0 ? '✅' : '❌'} | ${lessonsCovering('Consonnes').length} |`,
  `| Autres sons : ou, eu, an, oi… | ${lessonsCovering('Autres sons').length > 0 ? '✅' : '❌'} | ${lessonsCovering('Autres sons').length} |`,
  `| Groupes consonantiques (14) | ${lessonsCovering('bl, pl, cl').length > 0 ? '✅' : '❌'} | ${lessonsCovering('bl, pl, cl').length} |`,
  `| Syllabes inverses (18) | ${lessonsCovering('ac, or, ir').length > 0 ? '✅' : '❌'} | ${lessonsCovering('ac, or, ir').length} |`,
  `| Équivalences graphémiques | ${lessonsCovering('o = au = eau').length > 0 ? '✅' : '❌'} | ${lessonsCovering('o = au = eau').length} |`,
  `| Semi-voyelles | ${lessonsCovering('Semi voyelles').length > 0 ? '✅' : '❌'} | ${lessonsCovering('Semi voyelles').length} |`,
  '',
  '## 4. Thèmes de langage (p. 19)',
  '',
  '| Thème officiel | Couvert | Leçons | Exemples |',
  '|---|---|---|---|',
  ...LANGUAGE_THEMES.map((theme) =>
    coverageRow(theme.official.slice(0, 60), theme.official.slice(0, 40)),
  ),
  '',
  '## 5. Contenus mathématiques (p. 58-59)',
  '',
  '| Contenu officiel | Couvert | Leçons | Exemples |',
  '|---|---|---|---|',
  ...MATH_CONTENTS.map((content) =>
    coverageRow(content.official.slice(0, 70), content.official.slice(0, 40)),
  ),
  '',
  '## 6. Calcul mental (p. 65)',
  '',
  '| Contenu officiel | Couvert | Leçons | Exemples |',
  '|---|---|---|---|',
  ...MENTAL_MATH_CONTENTS.map((content) =>
    coverageRow(content.official, content.official.slice(0, 40)),
  ),
  '',
  '## 7. Écriture (p. 26)',
  '',
  '| Contenu officiel | Couvert | Leçons | Exemples |',
  '|---|---|---|---|',
  coverageRow('Graphisme préparatoire', 'précédée du graphisme'),
  coverageRow(WRITING_PROGRESSION.letters, 'lettres de l’alphabet'),
  coverageRow(WRITING_PROGRESSION.numbers, 'en chiffres et en lettres des nombres'),
  coverageRow(WRITING_PROGRESSION.uppercase, 'majuscules'),
  coverageRow(WRITING_PROGRESSION.copy, 'copie de mots'),
  '',
  '## 8. Ce qui reste hors périmètre',
  '',
  'Les disciplines suivantes de la grille officielle ne sont pas couvertes par',
  'l’application : morale et hygiène (1 h), dessin (1 h 40), chant (1 h),',
  'récitation (45 mn), exercices physiques (1 h 20). Elles relèvent d’une',
  'pratique collective encadrée, non d’un exercice sur tablette.',
  '',
].join('\n');

writeFileSync(join(ROOT, 'docs/couverture-programme.md'), `${report}\n`);
console.log('écrit docs/couverture-programme.md');

console.log(
  `\nOK — ${allLessons.length} leçons (CP1 : ${cp1Count}, CP2 : ${cp2Count}), ` +
    `${stepCount} exercices, ${audioIds.length} audios, ${usedIllustrations().length} illustrations`,
);
console.log(
  `Répartition : lecture ${bySubject('reading')} · langage ${bySubject('language')} · ` +
    `écriture ${bySubject('writing')} · calcul ${bySubject('math')}`,
);
