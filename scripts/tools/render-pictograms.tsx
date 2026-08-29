/* eslint-disable */
// Rend la bibliothèque de pictogrammes en une planche de contact HTML.
// react-native-svg est remplacé par les balises SVG du DOM : les composants
// sont rendus tels quels, sans être réécrits — ce qu'on regarde est donc
// exactement ce que l'app dessine.
import Module from 'node:module';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const shim = join(__dirname, 'dom-svg-shim.js');
const original = (Module as any)._resolveFilename;
(Module as any)._resolveFilename = function (request: string, ...args: any[]) {
  if (request === 'react-native-svg') {
    return shim;
  }
  return original.call(this, request, ...args);
};

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const { CURRICULUM_ICONS } = require('../../src/design-system/illustrations/curriculum-icons');
const objectIcons = require('../../src/design-system/illustrations/object-icons');

const legacyIds = [
  'icon-goat', 'icon-mango', 'icon-hut', 'icon-star', 'icon-calabash', 'icon-moto', 'icon-bed',
  'icon-tomato', 'icon-salad', 'icon-father', 'icon-friends', 'icon-cat', 'icon-sheep',
  'icon-soap', 'icon-king', 'icon-wolf', 'icon-wood',
];

const cells: string[] = [];
const all: [string, any][] = [
  ...legacyIds.map((id) => [id, null] as [string, any]),
  ...Object.entries(CURRICULUM_ICONS) as [string, any][],
];

for (const [id, Component] of all) {
  const markup = Component
    ? renderToStaticMarkup(React.createElement(Component, { size: 64 }))
    : renderToStaticMarkup(React.createElement(objectIcons.ObjectIcon, { id, size: 64 }));
  cells.push(
    `<figure><div class="art">${markup}</div><figcaption>${id.replace('icon-', '')}</figcaption></figure>`,
  );
}

const html = `<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<title>ALIFA — planche de contact des pictogrammes</title>
<style>
  body { margin:0; padding:32px; background:#fbf8ff; font-family:-apple-system,system-ui,sans-serif; color:#161a32; }
  h1 { font-size:22px; margin:0 0 4px; }
  p  { color:#50453b; margin:0 0 28px; font-size:14px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(104px,1fr)); gap:14px; }
  figure { margin:0; background:#fff; border-radius:16px; padding:12px 6px 8px; text-align:center;
           box-shadow:0 1px 3px rgba(22,26,50,.08); }
  .art { height:64px; display:flex; align-items:center; justify-content:center; }
  figcaption { font-size:11px; color:#50453b; margin-top:8px; word-break:break-word; }
</style></head>
<body>
<h1>ALIFA — planche de contact des pictogrammes</h1>
<p>${all.length} illustrations vectorielles, dessinées pour les 18 thèmes de vocabulaire du programme tchadien. Aucune image bitmap, aucun réseau.</p>
<div class="grid">${cells.join('')}</div>
</body></html>`;

writeFileSync(join(__dirname, '../../docs/pictogrammes.html'), html);
console.log(`planche écrite : ${all.length} pictogrammes`);
