#!/usr/bin/env node
// Génère src/design-system/icons/phosphor.generated.ts à partir du paquet
// @phosphor-icons/core (licence MIT), sans en faire une dépendance de l'app :
// les tracés sont embarqués comme données (offline, aucune police d'icônes).
//
//   npm pack @phosphor-icons/core && tar -xzf phosphor-icons-core-*.tgz
//   node scripts/icons/build-icons.mjs ./package
//
// Trois graisses par icône : `bold` (trait, l'état normal), `fill` (plein,
// l'état actif) et `duotone` (un aplat à 20 % sous le trait, pour l'objet
// d'une illustration). Ajouter une icône = l'ajouter à ICONS, relancer.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/** Nom ECOLNA → nom Phosphor. */
const ICONS = {
  home: 'house',
  learn: 'backpack',
  parents: 'users-three',
  speaker: 'speaker-high',
  replay: 'arrow-counter-clockwise',
  play: 'play',
  pause: 'pause',
  star: 'star',
  'star-outline': 'star',
  sun: 'sun',
  sprout: 'plant',
  lightbulb: 'lightbulb',
  check: 'check',
  close: 'x',
  lock: 'lock-simple',
  'arrow-back': 'arrow-left',
  'chevron-right': 'caret-right',
  book: 'book-open',
  pencil: 'pencil-simple',
  gear: 'gear-six',
  trash: 'trash',
  share: 'export',
  shield: 'shield-check',
  clock: 'clock',
  level: 'graduation-cap',
  target: 'target',
  insight: 'chart-line-up',
  refresh: 'arrow-clockwise',
  compass: 'compass',
  'offline-ok': 'cloud-check',
  plus: 'plus',
  ear: 'ear',
  speech: 'chat-circle-dots',
  calculator: 'calculator',
  'cloud-off': 'cloud-slash',
  leaf: 'leaf',
  sparkle: 'sparkle',
  trophy: 'trophy',
  flame: 'fire',
  medal: 'medal',
  smiley: 'smiley',
  crown: 'crown',
  flag: 'flag',
  hand: 'hand-waving',
};

const root = resolve(process.argv[2] ?? './package');
const assets = join(root, 'assets');

/** Les tracés d'un SVG Phosphor : [d, opacité] dans l'ordre du dessin. */
function paths(file) {
  const svg = readFileSync(file, 'utf8');
  return [...svg.matchAll(/<path d="([^"]+)"( opacity="([0-9.]+)")?\/>/g)].map((m) => ({
    d: m[1],
    opacity: m[3] ? Number(m[3]) : 1,
  }));
}

const entries = Object.entries(ICONS).map(([name, phosphor]) => {
  const bold = paths(join(assets, 'bold', `${phosphor}-bold.svg`)).map((p) => p.d);
  const fill = paths(join(assets, 'fill', `${phosphor}-fill.svg`)).map((p) => p.d);
  const duo = paths(join(assets, 'duotone', `${phosphor}-duotone.svg`));
  const back = duo.filter((p) => p.opacity < 1).map((p) => p.d);
  const front = duo.filter((p) => p.opacity === 1).map((p) => p.d);
  if (!bold.length || !fill.length || !front.length) {
    throw new Error(`Icône incomplète : ${name} (${phosphor})`);
  }
  return `  ${JSON.stringify(name)}: {\n    bold: ${JSON.stringify(bold)},\n    fill: ${JSON.stringify(fill)},\n    duoBack: ${JSON.stringify(back)},\n    duoFront: ${JSON.stringify(front)},\n  },`;
});

const header = `// Généré par scripts/icons/build-icons.mjs — ne pas éditer à la main.
// Tracés : Phosphor Icons (https://phosphoricons.com), licence MIT,
// Copyright (c) 2023 Phosphor Icons. Repère 256 × 256.
`;

const body = `${header}
export interface PhosphorGlyph {
  readonly bold: readonly string[];
  readonly fill: readonly string[];
  readonly duoBack: readonly string[];
  readonly duoFront: readonly string[];
}

export const PHOSPHOR = {
${entries.join('\n')}
} as const satisfies Record<string, PhosphorGlyph>;

export type IconName = keyof typeof PHOSPHOR;
`;

const out = resolve('src/design-system/icons/phosphor.generated.ts');
writeFileSync(out, body);
console.log(`${Object.keys(ICONS).length} icônes → ${out}`);
