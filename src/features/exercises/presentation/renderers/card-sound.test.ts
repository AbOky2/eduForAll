import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { slug } from '../../../../../scripts/content/audio';
import { audioSlug, cardSound } from './card-sound';

/** Tous les textes de cartes « relier » du programme livré. */
function shippedPairTexts(): string[] {
  const manifest: unknown = JSON.parse(
    readFileSync(join(__dirname, '../../../../content/manifests/curriculum-v1.json'), 'utf8'),
  );
  const texts = new Set<string>();
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk);
    } else if (node && typeof node === 'object') {
      const record = node as Record<string, unknown>;
      if (record.type === 'match_pairs' && Array.isArray(record.pairs)) {
        for (const pair of record.pairs as { left: string; right: string }[]) {
          texts.add(pair.left);
          texts.add(pair.right);
        }
      }
      Object.values(record).forEach(walk);
    }
  };
  walk(manifest);
  return [...texts];
}

describe('audioSlug', () => {
  it('encodes exactly like the content generator', () => {
    const texts = [...shippedPairTexts(), 'é', 'è', 'bébé', 'hôpital', 'sœur', 'leçon', '5 × 2'];
    expect(texts.length).toBeGreaterThan(50);
    for (const text of texts) {
      expect(audioSlug(text)).toBe(slug(text));
    }
  });

  it('keeps « é » and « e » apart', () => {
    expect(audioSlug('é')).toBe('e1');
    expect(audioSlug('e')).toBe('e');
  });
});

describe('cardSound', () => {
  it('names the shipped sound of a card when it exists', () => {
    expect(cardSound('son', 'o')).toBe('son-o');
    expect(cardSound('son', 'é')).toBe('son-e1');
    expect(cardSound('mot', 'moto')).toBe('mot-moto');
  });

  it('stays silent rather than inventing a sound', () => {
    expect(cardSound('son', 'kilo')).toBeNull();
    expect(cardSound('mot', 'ki')).toBeNull();
  });

  it('checks the identifier against the given registry', () => {
    const exists = jest.fn((audioId: string) => audioId === 'mot-lune');
    expect(cardSound('mot', 'lune', exists)).toBe('mot-lune');
    expect(cardSound('mot', 'melon', exists)).toBeNull();
    expect(exists).toHaveBeenCalledWith('mot-melon');
  });
});
