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

/**
 * Le son embarqué qui dit une carte (`son-o`, `mot-moto`), s'il existe —
 * sinon rien : une carte muette vaut mieux qu'un son inventé.
 */
export function cardSound(
  kind: 'son' | 'mot',
  text: string,
  exists: (audioId: string) => boolean = (audioId) => resolveAudioSource(audioId) !== null,
): string | null {
  const audioId = `${kind}-${audioSlug(text)}`;
  return exists(audioId) ? audioId : null;
}
