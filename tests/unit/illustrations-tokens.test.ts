import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render } from '@testing-library/react-native';
import { createElement } from 'react';

import { CURRICULUM_ICONS } from '@/design-system/illustrations/curriculum-icons';
import { ObjectIcon, hasObjectIcon } from '@/design-system/illustrations/object-icons';
import { illustration } from '@/design-system/tokens/illustration';

/**
 * Les dessins de l'app ne connaissent aucune couleur en dur : tout passe par
 * les jetons (`src/design-system/tokens/illustration.ts`). Un littéral
 * hexadécimal dans `src/design-system/illustrations/` est une couleur qui
 * échappe à la palette — elle ne suivra jamais une retouche de la direction
 * artistique (c'est ainsi que les pictogrammes de contenu étaient restés en
 * v2 : encre #161a32 autour de chaque aplat, couleurs codées dans le fichier).
 */
const ILLUSTRATIONS_DIR = join(__dirname, '../../src/design-system/illustrations');

/** #rgb, #rgba, #rrggbb, #rrggbbaa — pas un identifiant (`url(#clip)`), pas une ancre. */
const HEX_COLOR = /#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![0-9a-z_-])/gi;

function sourceFiles(): string[] {
  return readdirSync(ILLUSTRATIONS_DIR).filter((file) => /\.(ts|tsx)$/.test(file));
}

describe('illustrations — aucune couleur en dur', () => {
  it('trouve bien les fichiers de dessin', () => {
    expect(sourceFiles()).toEqual(expect.arrayContaining(['object-icons.tsx', 'curriculum-icons.tsx']));
  });

  it.each(sourceFiles())('%s ne contient aucun littéral #rrggbb ni #rgb', (file) => {
    const source = readFileSync(join(ILLUSTRATIONS_DIR, file), 'utf8');
    const found = source
      .split('\n')
      .flatMap((line, index) => (line.match(HEX_COLOR) ?? []).map((hex) => `${file}:${index + 1} ${hex}`));
    expect(found).toEqual([]);
  });

  it('le motif reconnaît bien les formes courtes et longues', () => {
    // Garde-fou du garde-fou : un motif trop strict laisserait tout passer.
    const sample = "fill='#161a32' stroke=\"#fff\" a='#ffffff80' url(#clip-1) id=\"#c1\"";
    expect(sample.match(HEX_COLOR)).toEqual(['#161a32', '#fff', '#ffffff80']);
  });

  it('les pictogrammes de contenu ont des rampes complètes (lumière, ton, ombre)', () => {
    for (const [name, ramp] of Object.entries(illustration.objects)) {
      expect({ name, keys: Object.keys(ramp).sort() }).toEqual({ name, keys: ['base', 'light', 'shade'] });
    }
  });
});

describe('pictogrammes de contenu — chaque id se dessine', () => {
  const ids = [
    'icon-goat',
    'icon-mango',
    'icon-hut',
    'icon-star',
    'icon-calabash',
    'icon-moto',
    'icon-bed',
    'icon-tomato',
    'icon-salad',
    'icon-father',
    'icon-friends',
    'icon-cat',
    'icon-sheep',
    'icon-soap',
    'icon-king',
    'icon-wolf',
    'icon-wood',
    ...Object.keys(CURRICULUM_ICONS),
  ];

  it.each(ids)('%s', (id) => {
    expect(hasObjectIcon(id)).toBe(true);
    const { toJSON } = render(createElement(ObjectIcon, { id, size: 40 }));
    const markup = JSON.stringify(toJSON());
    // Un calcul de géométrie raté laisse un « NaN » ou un « undefined » dans un tracé.
    expect(markup).not.toMatch(/NaN|undefined|Infinity/);
  });

  it('une illustration inconnue garde son repli neutre', () => {
    expect(hasObjectIcon('icon-inconnu')).toBe(false);
    expect(render(createElement(ObjectIcon, { id: 'icon-inconnu', size: 40 })).toJSON()).toBeTruthy();
  });
});
