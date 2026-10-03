/* eslint-disable */
// Rend une planche de contact PNG à partir d'un module « planche ».
//
// Les illustrations de l'app sont des composants react-native-svg. Pour les
// REGARDER sans appareil, on remplace react-native-svg par les balises SVG du
// DOM (même shim que render-pictograms), on rend en HTML statique, et Chrome
// headless en fait une capture. Ce qu'on regarde est donc exactement ce que
// l'app dessine — pas une copie redessinée.
//
// Usage :
//   npx tsx scripts/tools/render-sheet.tsx <planche.sheet.tsx> <sortie.png> [--dpr 2]
//
// Une planche exporte par défaut :
//   { title, subtitle?, width?, sections: [{ title, note?, cellWidth, cellHeight,
//     background?, grayscale?, cells: [{ label, node, background?, grayscale? }] }] }
//
// ⚠️ Première ligne d'une planche : `/** @jsxRuntime automatic */`. tsx ne
// reprend pas le mode JSX d'Expo pour les fichiers hors de `include`.
import Module from 'node:module';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

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

const ROOT = join(__dirname, '../..');
// Le moteur de rendu : Chrome sur le Mac du propriétaire, le Chromium de
// Playwright en intégration continue ou en conteneur. CHROME_PATH l'emporte.
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/opt/pw-browsers/chromium/chrome-linux/chrome',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  '/usr/bin/chromium',
  '/usr/bin/google-chrome',
].filter((candidate): candidate is string => Boolean(candidate));
const CHROME = CHROME_CANDIDATES.find((candidate) => existsSync(candidate)) ?? CHROME_CANDIDATES[0];

interface SheetCell {
  label: string;
  node: React.ReactElement;
  background?: string;
  /** Rendu en niveaux de gris : lisibilité au soleil, daltonisme. */
  grayscale?: boolean;
}
interface SheetSection {
  title: string;
  note?: string;
  cellWidth: number;
  cellHeight: number;
  background?: string;
  grayscale?: boolean;
  cells: SheetCell[];
}
interface Sheet {
  title: string;
  subtitle?: string;
  width?: number;
  sections: SheetSection[];
}

const flag = (name: string) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const [entry, out] = process.argv.slice(2).filter((arg, i, all) => !arg.startsWith('--') && !(all[i - 1] ?? '').startsWith('--'));
if (!entry || !out) {
  console.error('usage : npx tsx scripts/tools/render-sheet.tsx <planche.sheet.tsx> <sortie.png> [--dpr 2]');
  process.exit(1);
}
const dpr = Number(flag('dpr') ?? '1');

const loaded = require(resolve(entry));
const sheet: Sheet = loaded.default ?? loaded.sheet;
if (!sheet || !Array.isArray(sheet.sections)) {
  console.error(`❌ ${entry} n'exporte pas de planche par défaut`);
  process.exit(1);
}

// Géométrie fixe : la hauteur de page se calcule sans exécuter de JS dans Chrome.
const PAGE_WIDTH = sheet.width ?? 1440;
const PAD = 40;
const GAP = 16;
const LABEL = 34;
const HEADER = sheet.subtitle ? 104 : 76;
const SECTION_TITLE = 44;
const SECTION_NOTE = 26;
const SECTION_BOTTOM = 28;

function columnsFor(section: SheetSection): number {
  return Math.max(1, Math.floor((PAGE_WIDTH - PAD * 2 + GAP) / (section.cellWidth + GAP)));
}

function sectionHeight(section: SheetSection): number {
  const rows = Math.ceil(section.cells.length / columnsFor(section));
  return (
    SECTION_TITLE +
    (section.note ? SECTION_NOTE : 0) +
    rows * (section.cellHeight + LABEL) +
    Math.max(0, rows - 1) * GAP +
    SECTION_BOTTOM
  );
}

const pageHeight = HEADER + sheet.sections.reduce((sum, s) => sum + sectionHeight(s), 0) + PAD;

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const FONTS: [string, number, string][] = [
  ['Quicksand', 400, 'assets/fonts/Quicksand-Regular.ttf'],
  ['Quicksand', 500, 'assets/fonts/Quicksand-Medium.ttf'],
  ['Quicksand', 600, 'assets/fonts/Quicksand-SemiBold.ttf'],
  ['Quicksand', 700, 'assets/fonts/Quicksand-Bold.ttf'],
  ['Plus Jakarta Sans', 600, 'assets/fonts/PlusJakartaSans-SemiBold.ttf'],
];
const fontCss = FONTS.filter(([, , file]) => existsSync(join(ROOT, file)))
  .map(([family, weight, file]) => {
    const data = readFileSync(join(ROOT, file)).toString('base64');
    return `@font-face{font-family:"${family}";font-weight:${weight};src:url(data:font/ttf;base64,${data}) format("truetype")}`;
  })
  .join('\n');
// Les composants nomment les polices comme dans l'app (« Quicksand-Bold »).
const aliasCss = FONTS.filter(([, , file]) => existsSync(join(ROOT, file)))
  .map(([family, weight, file]) => {
    const alias = file.split('/').pop()!.replace('.ttf', '');
    const data = readFileSync(join(ROOT, file)).toString('base64');
    return `@font-face{font-family:"${alias}";font-weight:${weight};src:url(data:font/ttf;base64,${data}) format("truetype")}`;
  })
  .join('\n');

const sectionsHtml = sheet.sections
  .map((section) => {
    const cells = section.cells
      .map((cell) => {
        const markup = renderToStaticMarkup(cell.node);
        const bg = cell.background ?? section.background ?? '#ffffff';
        const grey = cell.grayscale ?? section.grayscale ? 'filter:grayscale(1);' : '';
        return `<figure style="width:${section.cellWidth}px">
          <div class="art" style="height:${section.cellHeight}px;background:${bg};${grey}">${markup}</div>
          <figcaption>${escape(cell.label)}</figcaption></figure>`;
      })
      .join('');
    return `<section style="height:${sectionHeight(section)}px">
      <h2>${escape(section.title)}</h2>
      ${section.note ? `<p class="note">${escape(section.note)}</p>` : ''}
      <div class="grid" style="grid-template-columns:repeat(${columnsFor(section)},${section.cellWidth}px)">${cells}</div>
    </section>`;
  })
  .join('');

const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>
${fontCss}
${aliasCss}
*{box-sizing:border-box}
html,body{margin:0;padding:0;width:${PAGE_WIDTH}px;height:${pageHeight}px;overflow:hidden;background:#f3f1f8;
  font-family:"Quicksand",system-ui,sans-serif;color:#161a32}
header{height:${HEADER}px;padding:${PAD - 12}px ${PAD}px 0}
h1{margin:0;font-size:26px;font-weight:700}
.sub{margin:6px 0 0;font-size:15px;color:#50453b}
section{padding:0 ${PAD}px;overflow:hidden}
h2{margin:0;height:${SECTION_TITLE}px;line-height:${SECTION_TITLE}px;font-size:18px;font-weight:700}
.note{margin:-6px 0 0;height:${SECTION_NOTE}px;font-size:13px;color:#50453b}
.grid{display:grid;gap:${GAP}px}
figure{margin:0}
.art{display:flex;align-items:center;justify-content:center;border-radius:14px;overflow:hidden;
  box-shadow:0 1px 3px rgba(22,26,50,.10)}
figcaption{height:${LABEL}px;line-height:16px;padding-top:6px;font-size:12px;color:#50453b;text-align:center;
  overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif}
</style></head><body>
<header><h1>${escape(sheet.title)}</h1>${sheet.subtitle ? `<p class="sub">${escape(sheet.subtitle)}</p>` : ''}</header>
${sectionsHtml}
</body></html>`;

if (!existsSync(CHROME)) {
  console.error(`❌ Chrome introuvable (${CHROME}) — il sert de moteur de rendu.`);
  process.exit(1);
}
const work = join(tmpdir(), `ecolna-sheet-${process.pid}`);
mkdirSync(work, { recursive: true });
const page = join(work, 'sheet.html');
writeFileSync(page, html);
const target = resolve(out);
mkdirSync(dirname(target), { recursive: true });
if (flag('html')) {
  writeFileSync(resolve(flag('html')!), html);
}
execFileSync(
  CHROME,
  [
    '--headless',
    '--disable-gpu',
    // Root en conteneur : Chromium refuse de démarrer avec son bac à sable.
    ...(process.getuid?.() === 0 ? ['--no-sandbox'] : []),
    '--hide-scrollbars',
    `--force-device-scale-factor=${dpr}`,
    `--screenshot=${target}`,
    `--window-size=${PAGE_WIDTH},${pageHeight}`,
    `file://${page}`,
  ],
  { stdio: ['ignore', 'ignore', 'ignore'] },
);
rmSync(work, { recursive: true, force: true });
console.log(`planche écrite : ${out} (${PAGE_WIDTH}×${pageHeight} @${dpr}x)`);
