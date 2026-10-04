import { resolveAudioSource } from '@/content/audio-registry.generated';

/**
 * Les accents portent du sens : « le son é » et « le son e » sont deux sons
 * distincts. Même encodage que le générateur (scripts/content/audio.ts,
 * `slug`) — un test vérifie qu'ils ne divergent pas.
 */
const ACCENT_CODES: Record<string, string> = {
  à: 'a1',
  â: 'a2',
  ä: 'a3',
  é: 'e1',
  è: 'e2',
  ê: 'e3',
  ë: 'e4',
  î: 'i1',
  ï: 'i2',
  ô: 'o1',
  ö: 'o2',
  œ: 'oe1',
  ù: 'u1',
  û: 'u2',
  ü: 'u3',
  ç: 'c1',
};

/** Le fragment d'identifiant audio d'un texte : « bébé » → « be1be1 ». */
export function audioSlug(text: string): string {
  return [...text.toLowerCase()]
    .map((character) => ACCENT_CODES[character] ?? character)
    .join('')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/** Les familles de sons embarqués qu'une carte peut porter. */
export type CardSoundKind = 'son' | 'mot' | 'syllabe' | 'lettre' | 'phrase' | 'nombre';

/**
 * Le son embarqué qui dit une carte (`son-o`, `mot-moto`), s'il existe —
 * sinon rien : une carte muette vaut mieux qu'un son inventé. Plusieurs
 * familles : la première qui a ce son (`['syllabe', 'son']` : « syllabe-ou »
 * avant « son-ou »).
 */
export function cardSound(
  kind: CardSoundKind | readonly CardSoundKind[],
  text: string,
  exists: (audioId: string) => boolean = (audioId) => resolveAudioSource(audioId) !== null,
): string | null {
  const slug = audioSlug(text);
  if (!slug) {
    return null;
  }
  const kinds: readonly CardSoundKind[] = typeof kind === 'string' ? [kind] : kind;
  for (const family of kinds) {
    const audioId = `${family}-${slug}`;
    if (exists(audioId)) {
      return audioId;
    }
  }
  return null;
}

/** Ce qu'une carte-nombre redit : son nombre (« lettre-2 » se dit « deux »). */
export const NUMBER_SOUNDS: readonly CardSoundKind[] = ['nombre', 'lettre'];

/** Ordre de repli pour une carte écrite quelconque : le mot d'abord. */
const ANY_TEXT: readonly CardSoundKind[] = ['mot', 'syllabe', 'lettre', 'son', 'phrase', 'nombre'];

/**
 * Les familles à essayer pour dire une réponse, dans le registre du stimulus
 * quand il en a un (« syllabe-li » à trouver : « ra » se dit « syllabe-ra »),
 * puis les autres.
 */
export function echoKinds(stimulusAudioId?: string | null): readonly CardSoundKind[] {
  const family = stimulusAudioId?.split('-')[0];
  const own = ANY_TEXT.find((kind) => kind === family);
  return own ? [own, ...ANY_TEXT.filter((kind) => kind !== own)] : ANY_TEXT;
}
