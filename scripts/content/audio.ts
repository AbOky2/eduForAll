/**
 * Audio identity for generated content.
 *
 * Every spoken thing in ALIFA gets a stable id and the exact French text a
 * narrator must read. The pair (id → text) is written to assets/audio/tts-map.json
 * and drives both the placeholder TTS pipeline and the definitive recording
 * script handed to the voice talent (docs/audio-pipeline.md).
 *
 * Ids are content-addressed by their text, so the same instruction reused in
 * two hundred steps costs exactly one recording.
 */

const ttsMap = new Map<string, string>();

/**
 * Accents carry meaning here: « le son é » and « le son e » are two different
 * lessons and must never share an audio id. Each accented letter therefore
 * gets its own ASCII encoding before the string is stripped down.
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

export function slug(text: string): string {
  const encoded = [...text.toLowerCase()]
    .map((character) => ACCENT_CODES[character] ?? character)
    .join('');
  return encoded
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

/** Registers an audio asset and returns its stable id. */
export function audio(kind: string, text: string, spokenOverride?: string): string {
  const id = `${kind}-${slug(text)}`;
  const spoken = spokenOverride ?? text;
  const existing = ttsMap.get(id);
  if (existing !== undefined && existing !== spoken) {
    throw new Error(`audio id collision: ${id} ("${existing}" vs "${spoken}")`);
  }
  ttsMap.set(id, spoken);
  return id;
}

export function audioEntries(): [string, string][] {
  return [...ttsMap.entries()].sort(([a], [b]) => a.localeCompare(b));
}

// ---------------------------------------------------------------------------
// French number names, 0–100 (« lecture et écriture en chiffres et en lettres
// de ces nombres » — programme p. 59).
// ---------------------------------------------------------------------------

const UNITS = [
  'zéro',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'dix-sept',
  'dix-huit',
  'dix-neuf',
];

const TENS: Record<number, string> = {
  2: 'vingt',
  3: 'trente',
  4: 'quarante',
  5: 'cinquante',
  6: 'soixante',
  8: 'quatre-vingt',
};

/** Standard (non-rectified) French spelling, as taught in Chadian classrooms. */
export function numberToWords(value: number): string {
  if (value < 0 || value > 100 || !Number.isInteger(value)) {
    throw new Error(`numberToWords out of CP range: ${value}`);
  }
  if (value === 100) {
    return 'cent';
  }
  if (value < 20) {
    return UNITS[value] as string;
  }
  const tens = Math.floor(value / 10);
  const unit = value % 10;

  // 70–79 and 90–99 build on soixante / quatre-vingt.
  if (tens === 7 || tens === 9) {
    const base = tens === 7 ? 'soixante' : 'quatre-vingt';
    const rest = UNITS[10 + unit] as string;
    return `${base}-${rest}`;
  }
  const base = TENS[tens] as string;
  if (unit === 0) {
    // « quatre-vingts » takes an s only when it ends the number.
    return tens === 8 ? 'quatre-vingts' : base;
  }
  if (unit === 1 && tens !== 8) {
    return `${base} et un`;
  }
  return `${base}-${UNITS[unit] as string}`;
}

/**
 * Spoken helpers. Isolated letters and syllables get a trailing period so the
 * narrator (and the TTS placeholder) articulates them instead of running them
 * into the next token.
 */
export const say = {
  instruction: (text: string) => ({ text, audioId: audio('instr', text) }),
  hint: (text: string) => ({ text, audioId: audio('hint', text) }),
  letter: (letter: string) => audio('lettre', letter, `${letter}.`),
  sound: (sound: string) => audio('son', sound, `${sound}.`),
  syllable: (syllable: string) => audio('syllabe', syllable, `${syllable}.`),
  word: (word: string) => audio('mot', word, `${word}.`),
  sentence: (sentence: string) => audio('phrase', sentence),
  number: (value: number) => audio('nombre', String(value), numberToWords(value)),
  money: (value: number) => audio('monnaie', String(value), `${numberToWords(value)} francs`),
  story: (story: string) => audio('histoire', slug(story).slice(0, 40), story),
};
