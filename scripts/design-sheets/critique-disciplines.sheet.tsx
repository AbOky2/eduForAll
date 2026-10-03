/** @jsxRuntime automatic */
// Planche de CRITIQUE (direction artistique) — SubjectArt, critique n° 1.
// Ne modifie rien de l'équipe : regarde autrement (silhouettes, zooms,
// contexte carte) et essaie les corrections demandées avant de les prescrire.
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/critique-disciplines.sheet.tsx .cache/design-renders/disciplines-critique1-da.png --dpr 2
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { SubjectArt, type SubjectArtId } from '../../src/design-system/icons/subject-art';
import { colors, illustration } from '../../src/design-system/tokens';
import { fr } from '../../src/localization/fr/strings';

const SUBJECTS: SubjectArtId[] = ['language', 'reading', 'writing', 'math'];
const INK = illustration.ink;
const W = illustration.white;

// ---------------------------------------------------------------------------
// Outils
// ---------------------------------------------------------------------------
type Pt = [number, number];
const f = (n: number) => {
  const v = Math.round(n * 10) / 10;
  return (Object.is(v, -0) ? 0 : v).toString();
};
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const len = (a: Pt) => Math.hypot(a[0], a[1]);
const unit = (a: Pt): Pt => mul(a, 1 / len(a));

/** Polygone aux coins arrondis (congé de rayon r par sommet). */
function rounded(pts: Pt[], radii: number[]): string {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i += 1) {
    const P = pts[i];
    const A = pts[(i - 1 + n) % n];
    const B = pts[(i + 1) % n];
    const r = radii[i] ?? 0;
    const ua = unit(sub(A, P));
    const ub = unit(sub(B, P));
    const cmd = i === 0 ? 'M' : 'L';
    if (r <= 0) {
      d += `${cmd}${f(P[0])} ${f(P[1])}`;
      continue;
    }
    const ang = Math.acos(Math.max(-1, Math.min(1, ua[0] * ub[0] + ua[1] * ub[1])));
    const t = r / Math.tan(ang / 2);
    const T1 = add(P, mul(ua, t));
    const T2 = add(P, mul(ub, t));
    const sweep = ua[0] * ub[1] - ua[1] * ub[0] < 0 ? 1 : 0;
    d += `${cmd}${f(T1[0])} ${f(T1[1])}A${r} ${r} 0 0 ${sweep} ${f(T2[0])} ${f(T2[1])}`;
  }
  return `${d}Z`;
}

/** Galet : dôme dessus (hTop), dessous plus plat (hBot), incliné de rot°. */
function pebble(cx: number, cy: number, w: number, hTop: number, hBot: number, rot: number) {
  const a = (rot * Math.PI) / 180;
  const ex = (w / 2) * Math.cos(a);
  const ey = (w / 2) * Math.sin(a);
  return `M${f(cx - ex)} ${f(cy - ey)}A${f(w / 2)} ${f(hTop)} ${rot} 0 1 ${f(cx + ex)} ${f(cy + ey)}A${f(w / 2)} ${f(hBot)} ${rot} 0 1 ${f(cx - ex)} ${f(cy - ey)}Z`;
}
/** Arc d'ellipse (centre, rayons, angles paramétriques en degrés, sens horaire). */
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number) {
  const p = (deg: number): Pt => {
    const t = (deg * Math.PI) / 180;
    return [cx + rx * Math.cos(t), cy + ry * Math.sin(t)];
  };
  const s = p(a0);
  const e = p(a1);
  return `M${f(s[0])} ${f(s[1])}A${f(rx)} ${f(ry)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${f(e[0])} ${f(e[1])}`;
}

const log: string[] = [];
const note = (k: string, v: string) => log.push(`${k}: ${v}`);

// ---------------------------------------------------------------------------
// Silhouettes : disque retiré ; tout ce qui a la couleur du disque (réserves)
// reste blanc, tout le reste passe à l'encre.
// ---------------------------------------------------------------------------
const GROUND = new Set(
  [
    ...Object.values(illustration.backdrop),
    ...Object.values(illustration.backdropMotif),
    colors.lockedContainer,
  ].map((c) => c.toLowerCase()),
);
function Silhouette({ subject, size }: { subject: SubjectArtId; size: number }) {
  let svg = renderToStaticMarkup(<SubjectArt subject={subject} size={size} />);
  svg = svg.replace(/<circle[^>]*>(<\/circle>)?/, '');
  svg = svg.replace(/(fill|stroke)="([^"]+)"/g, (m, attr: string, val: string) =>
    val === 'none' ? m : `${attr}="${GROUND.has(val.toLowerCase()) ? '#ffffff' : INK}"`,
  );
  return <div style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: svg }} />;
}

/** Zoom vectoriel sur une région (x0, y0, côté en u), avec grille 1 u / 4 u. */
function Region({
  subject,
  x0,
  y0,
  span,
  px = 256,
  muted = false,
  children,
}: {
  subject?: SubjectArtId;
  x0: number;
  y0: number;
  span: number;
  px?: number;
  muted?: boolean;
  children?: ReactNode;
}) {
  const k = px / span;
  const lines: ReactNode[] = [];
  for (let i = Math.ceil(x0); i <= x0 + span; i += 1) {
    lines.push(
      <line key={`v${i}`} x1={i} y1={y0} x2={i} y2={y0 + span} stroke={i % 4 === 0 ? 'rgba(186,26,26,.45)' : 'rgba(22,26,50,.16)'} strokeWidth={i % 4 === 0 ? 0.06 : 0.03} />,
    );
  }
  for (let j = Math.ceil(y0); j <= y0 + span; j += 1) {
    lines.push(
      <line key={`h${j}`} x1={x0} y1={j} x2={x0 + span} y2={j} stroke={j % 4 === 0 ? 'rgba(186,26,26,.45)' : 'rgba(22,26,50,.16)'} strokeWidth={j % 4 === 0 ? 0.06 : 0.03} />,
    );
  }
  return (
    <div style={{ position: 'relative', width: px, height: px, overflow: 'hidden', background: '#fff' }}>
      <div style={{ position: 'absolute', left: -x0 * k, top: -y0 * k }}>
        {subject ? <SubjectArt subject={subject} size={48 * k} muted={muted} /> : null}
        {children ? (
          <svg width={48 * k} height={48 * k} viewBox="0 0 48 48">
            {children}
          </svg>
        ) : null}
      </div>
      <svg width={px} height={px} viewBox={`${x0} ${y0} ${span} ${span}`} style={{ position: 'absolute', left: 0, top: 0 }}>
        {lines}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Contexte : nœud « en cours » de la carte de niveau (84 dp, anneau 3 dp).
// ---------------------------------------------------------------------------
function MapNode({ subject, art }: { subject: SubjectArtId; art: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 42,
          boxSizing: 'border-box',
          border: `3px solid ${colors.tertiaryContainer}`,
          background: colors.card,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <SubjectArt subject={subject} size={art} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Propositions de la DA (dessinées ici pour vérifier les cotes prescrites)
// ---------------------------------------------------------------------------

// Lecture — aile de mouette franche, pages pleine largeur, couverture en
// bande sous les pages, signet posé sur la page de droite qui dépasse en haut.
const P_READ = {
  cover: rounded(
    [
      [4, 26],
      [44, 26],
      [44, 34],
      [24, 40],
      [4, 34],
    ],
    [0, 0, 4, 3, 4],
  ),
  pageLeft: rounded(
    [
      [4, 8],
      [24, 12],
      [24, 37],
      [4, 32],
    ],
    [6, 2, 0, 2],
  ),
  pageRight: rounded(
    [
      [24, 12],
      [44, 8],
      [44, 32],
      [24, 37],
    ],
    [2, 6, 2, 0],
  ),
  glyph: 'M8.5 22A5.5 6 0 1 1 19.5 22A5.5 6 0 1 1 8.5 22ZM19.5 16V28',
  ribbon: rounded(
    [
      [31, 4],
      [36, 4],
      [36, 22],
      [33.5, 19.5],
      [31, 22],
    ],
    [2, 2, 1, 1, 1],
  ),
};
note('P_READ.cover', P_READ.cover);
note('P_READ.pageLeft', P_READ.pageLeft);
note('P_READ.pageRight', P_READ.pageRight);
note('P_READ.ribbon', P_READ.ribbon);

function ProposedReading({ size, mono = false }: { size: number; mono?: boolean }) {
  const c = (v: string) => (mono ? INK : v);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      {mono ? null : <circle cx={24} cy={24} r={24} fill={illustration.backdrop.sand} />}
      <path d={P_READ.cover} fill={c(illustration.nature.bark.base)} />
      <path d={P_READ.pageLeft} fill={c(illustration.school.paper.light)} />
      <path d={P_READ.pageRight} fill={c(illustration.school.paper.shade)} />
      <path d={P_READ.glyph} fill="none" stroke={c(illustration.nature.bark.shade)} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={P_READ.ribbon} fill={c(illustration.school.clay.base)} />
    </svg>
  );
}

// Écriture — crayon 6 u (y 32 → 38) rentré dans le cadre ; mine de 3 u.
const P_WRITE = {
  pencil: 'M15 32H40A2 2 0 0 1 42 34V36A2 2 0 0 1 40 38H15Z',
  pencilShade: 'M15 35H42V36A2 2 0 0 1 40 38H15Z',
  wood: rounded(
    [
      [15.5, 32],
      [15.5, 38],
      [8.5, 35],
    ],
    [0, 0, 1.5],
  ),
  lead: rounded(
    [
      [11.5, 33.5],
      [11.5, 36.5],
      [8.5, 35],
    ],
    [0, 0, 1.5],
  ),
  sheen: 'M19 33.5H26',
  silhouette: 'M15 32H40A2 2 0 0 1 42 34V36A2 2 0 0 1 40 38H15L9.4 35.6A1 1 0 0 1 9.4 34.4Z',
};
note('P_WRITE.wood', P_WRITE.wood);
note('P_WRITE.lead', P_WRITE.lead);
const T_FRAME_SHADE =
  'M10 6L38 6A6 6 0 0 1 44 12L44 32A6 6 0 0 1 38 38L10 38A6 6 0 0 1 4 32L4 12A6 6 0 0 1 10 6Z';
const T_FRAME =
  'M10 6L36 6A6 6 0 0 1 42 12L42 32A4 4 0 0 1 38 36L10 36A6 6 0 0 1 4 30L4 12A6 6 0 0 1 10 6Z';
const T_SLATE = 'M10 10L38 10A2 2 0 0 1 40 12L40 32A2 2 0 0 1 38 34L10 34A2 2 0 0 1 8 32L8 12A2 2 0 0 1 10 10Z';
const T_A =
  'M14.8 20.4A7.2 8 5 1 1 29.2 21.6A7.2 8 5 1 1 14.8 20.4ZM19.2 20.4A3.4 4.2 5 1 0 26 21A3.4 4.2 5 1 0 19.2 20.4ZM29.7 15.7L29.4 23.9C29.1 25.8 29.5 25.9 31.3 24.7A1.5 1.5 0 0 1 33.1 27.1C29.9 29.9 24.9 28.4 25 23.5L26.1 15.3A1.8 1.8 0 0 1 29.7 15.7Z';

function ProposedWriting({ size, muted = false }: { size: number; muted?: boolean }) {
  if (muted) {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48">
        <circle cx={24} cy={24} r={24} fill={colors.lockedContainer} />
        <path d={T_FRAME_SHADE} fill={colors.locked} />
        <path d={T_A} fill={W} />
        <path d={P_WRITE.silhouette} fill={W} />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx={24} cy={24} r={24} fill={illustration.backdrop.sun} />
      <path d={T_FRAME_SHADE} fill={illustration.school.wood.shade} />
      <path d={T_FRAME} fill={illustration.school.wood.base} />
      <path d={T_SLATE} fill={illustration.school.slate.base} />
      <path d={T_A} fill={illustration.school.chalk} />
      <path d={P_WRITE.wood} fill={illustration.school.chalk} />
      <path d={P_WRITE.lead} fill={illustration.school.slate.base} />
      <path d={P_WRITE.pencil} fill={illustration.metal.gold.base} />
      <path d={P_WRITE.pencilShade} fill={illustration.metal.gold.shade} />
      <path d={P_WRITE.sheen} stroke={W} strokeWidth={2} strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Calcul — trois galets de latérite (rampe terre cuite), en léger arc qui suit
// le disque : écarts 4 u, ≥ 2,5 u du bord ; reflet 2 u entier, un par galet.
const PEBBLES: [number, number, number, number, number, number][] = [
  // cx, cy, w, hTop, hBot, rot
  [10, 33.5, 10, 4.2, 2.6, -8],
  [25, 35.5, 12, 5, 3, 0],
  [39, 33.5, 8, 3.6, 2.3, 9],
];
const P_MATH = {
  glyph: 'M19.5 8H28L21.9 14.8A4.7 4.7 0 1 1 20.2 22.5',
  shade: PEBBLES.map(([x, y, w, t, b, r]) => pebble(x, y, w, t, b, r)).join(''),
  lit: PEBBLES.map(([x, y, w, t, b, r]) => {
    const ax = x - w * 0.36;
    const ay = y - t * 0.72;
    const k = 0.84;
    return pebble(ax + (x - ax) * k, ay + (y - ay) * k, w * k, t * k, b * k, r);
  }).join(''),
  sheen: PEBBLES.map(([x, y, w, t]) => arc(x - 0.6, y + 0.4, w * 0.3, t * 0.55, 200, 250)).join(''),
};
note('P_MATH.shade', P_MATH.shade);
note('P_MATH.lit', P_MATH.lit);
note('P_MATH.sheen', P_MATH.sheen);

function ProposedMath({ size, ramp = 'clay' }: { size: number; ramp?: 'clay' | 'acacia' }) {
  const r = ramp === 'clay' ? illustration.school.clay : illustration.nature.acacia;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx={24} cy={24} r={24} fill={illustration.backdrop.mint} />
      <path d={P_MATH.glyph} fill="none" stroke={colors.feedbackCorrect} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={P_MATH.shade} fill={r.shade} />
      <path d={P_MATH.lit} fill={r.base} />
      <path d={P_MATH.sheen} fill="none" stroke={W} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

// Langage — reflet allongé (rive, 65°) et croissant d'ombre réel (≈ 3 u).
function crescent(dx: number, dy: number) {
  // Bulle E1 : centre (20, 20), 16 × 12 ; E2 = E1 décalée de (−dx, −dy).
  const a = dx / 16;
  const b = dy / 12;
  const m: Pt = [-a / 2, -b / 2];
  const dist = Math.hypot(a, b);
  const h = Math.sqrt(1 - (dist * dist) / 4);
  const nrm: Pt = [-b / dist, a / dist];
  const toXY = (u: Pt): Pt => [20 + u[0] * 16, 20 + u[1] * 12];
  const p1 = toXY(add(m, mul(nrm, h)));
  const p2 = toXY(sub(m, mul(nrm, h)));
  // p1 (en haut à droite) → p2 (en bas à gauche) le long de E1, retour le long de E2.
  const [s, e] = p1[1] < p2[1] ? [p1, p2] : [p2, p1];
  return `M${f(s[0])} ${f(s[1])}A16 12 0 0 1 ${f(e[0])} ${f(e[1])}A16 12 0 0 0 ${f(s[0])} ${f(s[1])}Z`;
}
const P_LANG = {
  bubble: 'M4 20A16 12 0 1 1 36 20A16 12 0 1 1 4 20ZM12 28L17.5 31L12.8 34A2 2 0 0 1 10 31.2Z',
  shade: crescent(3, 2.5),
  mouth:
    'M19 19H27A2 2 0 0 1 29 21A6 6 0 0 1 26.8 25.6C25.3 24.6 20.7 24.6 19.2 25.6A6 6 0 0 1 17 21A2 2 0 0 1 19 19Z',
  tongue: 'M19.2 25.6C20.7 24 25.3 24 26.8 25.6A6 6 0 0 1 19.2 25.6Z',
  sheen: arc(20, 20, 10, 6, 183, 250),
  replyGap: 'M27 32A7 5.5 0 1 1 41 32A7 5.5 0 1 1 27 32Z',
  reply: 'M27 32A7 5.5 0 1 1 41 32A7 5.5 0 1 1 27 32ZM35.5 36L39.5 33.5L40.1 36.5A1.5 1.5 0 0 1 37.6 37.9Z',
};
note('P_LANG.shade', P_LANG.shade);
note('P_LANG.sheen', P_LANG.sheen);

// Points de rebroussement : bulle E1 ∩ bord extérieur de la réserve (≈ ellipse 10 × 8,5 en (34, 32)).
{
  const hits: string[] = [];
  let prev = 0;
  for (let i = 0; i <= 3600; i += 1) {
    const t = (i / 10) * (Math.PI / 180);
    const x = 20 + 16 * Math.cos(t);
    const y = 20 + 12 * Math.sin(t);
    const g = ((x - 34) / 10) ** 2 + ((y - 32) / 8.5) ** 2 - 1;
    if (i > 0 && Math.sign(g) !== Math.sign(prev)) hits.push(`(${f(x)}, ${f(y)})`);
    prev = g;
  }
  note('cusps bulle/réserve', hits.join(' '));
}

function ProposedLanguage({ size }: { size: number }) {
  const disc = illustration.backdrop.sky;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx={24} cy={24} r={24} fill={disc} />
      <path d={P_LANG.bubble} fill={illustration.fabric.indigo.base} />
      <path d={P_LANG.shade} fill={illustration.fabric.indigo.shade} />
      <path d={P_LANG.mouth} fill={W} />
      <path d={P_LANG.tongue} fill={illustration.face.tongue} />
      <path d={P_LANG.sheen} fill="none" stroke={W} strokeWidth={4} strokeLinecap="round" />
      <path d={P_LANG.replyGap} fill={disc} stroke={disc} strokeWidth={6} />
      <path d={P_LANG.reply} fill={illustration.fabric.indigo.light} />
    </svg>
  );
}

// Distances au bord du disque (r 24) — en négatif : dépasse.
{
  const d = (x: number, y: number) => f(24 - Math.hypot(x - 24, y - 24));
  note('marge disque — galet gauche équipe (5.1, 37.2)', d(5.1, 37.2));
  note('marge disque — galet droit équipe (42.7, 37.5)', d(42.7, 37.5));
  note('marge disque — coin cadre ardoise (5.45, 8.09)', d(5.45, 8.09));
  note('marge disque — galet gauche DA (5, 33.5)', d(5, 34.2));
  note('marge disque — galet droit DA (43, 33.5)', d(43, 34.1));
}

// Essai n° 2 — Lecture : couverture de l'équipe, aile de mouette creusée
// (pli 3,5 u en haut, V de 4 u en bas), signet décentré à droite qui sort sous
// la couverture en queue d'aronde, pastille supprimée (elle faisait « poteau
// sur socle »).
const P2_READ = {
  ribbon: rounded(
    [
      [30, 30],
      [34, 30],
      [34, 44],
      [32, 41.5],
      [30, 44],
    ],
    [0, 0, 1, 1, 1],
  ),
  cover: rounded(
    [
      [4, 12],
      [24, 15],
      [44, 12],
      [44, 35],
      [24, 41],
      [4, 35],
    ],
    [4, 0, 4, 5, 3, 5],
  ),
  pageLeft: rounded(
    [
      [6, 8],
      [24, 11.5],
      [24, 38],
      [6, 34],
    ],
    [6, 2, 0, 2],
  ),
  pageRight: rounded(
    [
      [24, 11.5],
      [42, 8],
      [42, 34],
      [24, 38],
    ],
    [2, 6, 2, 0],
  ),
};
note('P2_READ.ribbon', P2_READ.ribbon);
note('P2_READ.cover', P2_READ.cover);
note('P2_READ.pageLeft', P2_READ.pageLeft);
note('P2_READ.pageRight', P2_READ.pageRight);

function Proposed2Reading({ size, mono = false, muted = false }: { size: number; mono?: boolean; muted?: boolean }) {
  const t = mono
    ? { disc: 'none', ribbon: INK, cover: INK, l: INK, r: INK, a: INK }
    : muted
      ? { disc: colors.lockedContainer, ribbon: colors.locked, cover: colors.locked, l: W, r: W, a: colors.locked }
      : {
          disc: illustration.backdrop.sand,
          ribbon: illustration.school.clay.base,
          cover: illustration.nature.bark.base,
          l: illustration.school.paper.light,
          r: illustration.school.paper.shade,
          a: illustration.nature.bark.shade,
        };
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      {mono ? null : <circle cx={24} cy={24} r={24} fill={t.disc} />}
      <path d={P2_READ.ribbon} fill={t.ribbon} />
      <path d={P2_READ.cover} fill={t.cover} />
      <path d={P2_READ.pageLeft} fill={t.l} />
      <path d={P2_READ.pageRight} fill={t.r} />
      <path d={P_READ.glyph.replace('M8.5 22A5.5 6 0 1 1 19.5 22A5.5 6 0 1 1 8.5 22ZM19.5 16V28', 'M9.5 22A5.5 6 0 1 1 20.5 22A5.5 6 0 1 1 9.5 22ZM20.5 16V28')} fill="none" stroke={t.a} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Essai n° 2 — Écriture : ardoise 30 × 26 en haut à gauche (x 6 → 36,
// y 7 → 33), « a » à 75 %, crayon incliné de 40° dont la pointe touche la
// sortie du « a » et dont le corps SORT du cadre en bas à droite : la
// silhouette dit « ardoise + crayon », plus « écran », et ne double pas le
// logo A (ardoise inclinée sans crayon).
const E2 = {
  frameShade: rounded(
    [
      [6, 7],
      [36, 7],
      [36, 33],
      [6, 33],
    ],
    [6, 6, 6, 6],
  ),
  frame: rounded(
    [
      [6, 7],
      [34, 7],
      [34, 31],
      [6, 31],
    ],
    [6, 6, 4, 6],
  ),
  slate: rounded(
    [
      [10, 11],
      [32, 11],
      [32, 29],
      [10, 29],
    ],
    [2, 2, 2, 2],
  ),
  // crayon dessiné à l'horizontale, pointe en (27, 26), puis tourné de 40°.
  body: 'M32 23H42A2 2 0 0 1 44 25V27A2 2 0 0 1 42 29H32Z',
  bodyShade: 'M32 26H44V27A2 2 0 0 1 42 29H32Z',
  wood: rounded(
    [
      [32.5, 23],
      [32.5, 29],
      [27, 26],
    ],
    [0, 0, 1.5],
  ),
  lead: rounded(
    [
      [29.5, 24.6],
      [29.5, 27.4],
      [27, 26],
    ],
    [0, 0, 1.5],
  ),
  sheen: 'M35 24.5H40',
};
note('E2.frameShade', E2.frameShade);
note('E2.frame', E2.frame);
note('E2.slate', E2.slate);
note('E2.wood', E2.wood);
{
  const a = (40 * Math.PI) / 180;
  const end: Pt = [27 + 17 * Math.cos(a), 26 + 17 * Math.sin(a)];
  const n: Pt = [-Math.sin(a) * 3, Math.cos(a) * 3];
  const c1 = add(end, n);
  const c2 = sub(end, n);
  note('E2 bout du crayon (centre, coins)', `${f(end[0])},${f(end[1])} | ${f(c1[0])},${f(c1[1])} | ${f(c2[0])},${f(c2[1])}`);
  note('E2 marge disque coins', `${f(24 - Math.hypot(c1[0] - 24, c1[1] - 24))} / ${f(24 - Math.hypot(c2[0] - 24, c2[1] - 24))}`);
}

function Proposed2Writing({ size, mono = false, muted = false }: { size: number; mono?: boolean; muted?: boolean }) {
  const ink = (v: string) => (mono ? INK : v);
  const disc = muted ? colors.lockedContainer : illustration.backdrop.sun;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      {mono ? null : <circle cx={24} cy={24} r={24} fill={disc} />}
      {muted ? (
        <>
          <path d={E2.frameShade} fill={colors.locked} />
          <path d={T_A} transform="translate(21 20) scale(0.75) translate(-24 -21)" fill={W} />
          <g transform="rotate(40 27 26)">
            <path d={E2.body} fill={W} />
            <path d={E2.wood} fill={W} />
          </g>
        </>
      ) : (
        <>
          <path d={E2.frameShade} fill={ink(illustration.school.wood.shade)} />
          <path d={E2.frame} fill={ink(illustration.school.wood.base)} />
          <path d={E2.slate} fill={ink(illustration.school.slate.base)} />
          <path d={T_A} transform="translate(21 20) scale(0.75) translate(-24 -21)" fill={ink(illustration.school.chalk)} />
          <g transform="rotate(40 27 26)">
            <path d={E2.wood} fill={ink(illustration.school.chalk)} />
            <path d={E2.lead} fill={ink(illustration.school.slate.shade)} />
            <path d={E2.body} fill={ink(illustration.metal.gold.base)} />
            <path d={E2.bodyShade} fill={ink(illustration.metal.gold.shade)} />
            {mono ? null : <path d={E2.sheen} stroke={W} strokeWidth={2} strokeLinecap="round" fill="none" />}
          </g>
        </>
      )}
    </svg>
  );
}

console.log(log.join('\n'));

// ---------------------------------------------------------------------------
const row = (nodes: ReactNode[], gap = 14) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', gap }}>{nodes}</div>
);
const label = (text: string) => (
  <div style={{ fontSize: 11, color: '#50453b', textAlign: 'center', marginTop: 4 }}>{text}</div>
);

const sheet = {
  title: 'Critique DA n° 1 — SubjectArt',
  subtitle: 'Silhouettes, zooms de défauts, contexte carte de niveau, essais de corrections (DA)',
  width: 1440,
  sections: [
    {
      title: 'Silhouettes à l’encre — 40 px puis 96 px (disque retiré)',
      cellWidth: 320,
      cellHeight: 150,
      background: '#ffffff',
      cells: SUBJECTS.map((s) => ({
        label: fr.subjects[s],
        node: row([<Silhouette key="a" subject={s} size={40} />, <Silhouette key="b" subject={s} size={96} />]),
      })),
    },
    {
      title: 'Lecture ↔ Écriture à 40 px — couleur / gris / verrouillé / silhouette',
      cellWidth: 640,
      cellHeight: 110,
      background: '#ffffff',
      cells: [
        {
          label: 'couleur et verrouillé',
          node: row([
            <SubjectArt key="1" subject="reading" size={40} />,
            <SubjectArt key="2" subject="writing" size={40} />,
            <div key="s" style={{ width: 24 }} />,
            <SubjectArt key="3" subject="reading" size={40} muted />,
            <SubjectArt key="4" subject="writing" size={40} muted />,
            <div key="t" style={{ width: 24 }} />,
            <Silhouette key="5" subject="reading" size={40} />,
            <Silhouette key="6" subject="writing" size={40} />,
          ]),
        },
        {
          label: 'niveaux de gris',
          grayscale: true,
          node: row([
            <SubjectArt key="1" subject="reading" size={40} />,
            <SubjectArt key="2" subject="writing" size={40} />,
            <div key="s" style={{ width: 24 }} />,
            <SubjectArt key="3" subject="reading" size={40} muted />,
            <SubjectArt key="4" subject="writing" size={40} muted />,
          ]),
        },
      ],
    },
    {
      title: 'Zooms (16 u de côté, grille 1 u, rouge tous les 4 u)',
      cellWidth: 256,
      cellHeight: 256,
      background: '#ffffff',
      cells: [
        { label: 'Langage — rebroussements de la réserve', node: <Region subject="language" x0={22} y0={18} span={16} /> },
        { label: 'Langage — reflet court + bouche = « œil »', node: <Region subject="language" x0={4} y0={8} span={16} /> },
        { label: 'Lecture — signet (encoche 0,1 u) et pastille', node: <Region subject="reading" x0={18} y0={32} span={16} /> },
        { label: 'Lecture — « a » à 1,5 u des bords de page', node: <Region subject="reading" x0={4} y0={8} span={22} /> },
        { label: 'Écriture — mine 1 u, crayon dépasse de 1 u', node: <Region subject="writing" x0={6} y0={28} span={16} /> },
        { label: 'Écriture — coin du cadre hors du disque', node: <Region subject="writing" x0={0} y0={2} span={14} /> },
        { label: 'Calcul — galet à 1 u du bord du disque', node: <Region subject="math" x0={0} y0={28} span={18} /> },
        { label: 'Calcul — reflets 1,6 u, écarts 2,5 u', node: <Region subject="math" x0={14} y0={28} span={18} /> },
        { label: 'Écriture verrouillé — filet 1,5 u', node: <Region subject="writing" x0={4} y0={4} span={40} muted /> },
      ],
    },
    {
      title: 'Contexte manquant — nœud « en cours » de la carte (84 dp, anneau 3 dp) : art 72 puis 64',
      cellWidth: 320,
      cellHeight: 120,
      background: colors.background,
      cells: SUBJECTS.map((s) => ({
        label: fr.subjects[s],
        node: row([<MapNode key="a" subject={s} art={72} />, <MapNode key="b" subject={s} art={64} />]),
      })),
    },
    {
      title: 'Essais DA — avant (équipe) / après (DA) à 160, 64, 40 px + silhouette 40',
      cellWidth: 640,
      cellHeight: 200,
      background: '#ffffff',
      cells: [
        {
          label: 'Lecture : aile de mouette franche, pages pleine largeur, signet sur la page',
          node: row([
            <SubjectArt key="a" subject="reading" size={160} />,
            <SubjectArt key="b" subject="reading" size={40} />,
            <div key="s" style={{ width: 20 }} />,
            <ProposedReading key="c" size={160} />,
            <ProposedReading key="d" size={64} />,
            <ProposedReading key="e" size={40} />,
            <ProposedReading key="f" size={40} mono />,
          ]),
        },
        {
          label: 'Écriture : crayon 6 u rentré, mine 3 u ; verrouillé sans filet',
          node: row([
            <SubjectArt key="a" subject="writing" size={160} />,
            <SubjectArt key="b" subject="writing" size={40} muted />,
            <div key="s" style={{ width: 20 }} />,
            <ProposedWriting key="c" size={160} />,
            <ProposedWriting key="d" size={64} muted />,
            <ProposedWriting key="e" size={40} muted />,
            <ProposedWriting key="f" size={40} />,
          ]),
        },
        {
          label: 'Calcul : galets de latérite en arc, écarts 4 u, reflet 2 u (puis variante acacia)',
          node: row([
            <SubjectArt key="a" subject="math" size={160} />,
            <div key="s" style={{ width: 20 }} />,
            <ProposedMath key="c" size={160} />,
            <ProposedMath key="d" size={64} />,
            <ProposedMath key="e" size={40} />,
            <ProposedMath key="g" size={64} ramp="acacia" />,
          ]),
        },
        {
          label: 'Langage : reflet de rive 67°, croissant d’ombre ≈ 3 u',
          node: row([
            <SubjectArt key="a" subject="language" size={160} />,
            <SubjectArt key="b" subject="language" size={40} />,
            <div key="s" style={{ width: 20 }} />,
            <ProposedLanguage key="c" size={160} />,
            <ProposedLanguage key="d" size={64} />,
            <ProposedLanguage key="e" size={40} />,
          ]),
        },
      ],
    },
    {
      title: 'Essais DA n° 2 — Lecture (pli creusé, signet décentré) / Écriture (crayon qui sort du cadre)',
      cellWidth: 1360,
      cellHeight: 200,
      background: '#ffffff',
      cells: [
        {
          label: 'Lecture équipe 160 · DA 160 / 64 / 40 / silhouette 40 / verrouillé 40 — Écriture équipe 160 · DA 160 / 64 / 40 / silhouette 40 / verrouillé 40',
          node: row([
            <SubjectArt key="a" subject="reading" size={160} />,
            <Proposed2Reading key="b" size={160} />,
            <Proposed2Reading key="c" size={64} />,
            <Proposed2Reading key="d" size={40} />,
            <Proposed2Reading key="e" size={40} mono />,
            <Proposed2Reading key="f" size={40} muted />,
            <div key="s" style={{ width: 16 }} />,
            <SubjectArt key="g" subject="writing" size={160} />,
            <Proposed2Writing key="h" size={160} />,
            <Proposed2Writing key="i" size={64} />,
            <Proposed2Writing key="j" size={40} />,
            <Proposed2Writing key="k" size={40} mono />,
            <Proposed2Writing key="l" size={40} muted />,
          ], 10),
        },
      ],
    },
    {
      title: 'Essai n° 2 — les quatre ensemble à 56 px (carte d’accueil), couleur puis gris',
      cellWidth: 640,
      cellHeight: 100,
      background: colors.background,
      cells: [
        {
          label: 'couleur',
          node: row([
            <SubjectArt key="a" subject="language" size={56} />,
            <Proposed2Reading key="b" size={56} />,
            <Proposed2Writing key="c" size={56} />,
            <ProposedMath key="d" size={56} />,
          ], 24),
        },
        {
          label: 'niveaux de gris',
          grayscale: true,
          node: row([
            <SubjectArt key="a" subject="language" size={56} />,
            <Proposed2Reading key="b" size={56} />,
            <Proposed2Writing key="c" size={56} />,
            <ProposedMath key="d" size={56} />,
          ], 24),
        },
      ],
    },
    {
      title: 'Essais DA en niveaux de gris, 40 px — Lecture / Écriture côte à côte',
      cellWidth: 640,
      cellHeight: 90,
      background: '#ffffff',
      grayscale: true,
      cells: [
        {
          label: 'équipe',
          node: row([
            <SubjectArt key="a" subject="reading" size={40} />,
            <SubjectArt key="b" subject="writing" size={40} />,
            <SubjectArt key="c" subject="reading" size={40} muted />,
            <SubjectArt key="d" subject="writing" size={40} muted />,
          ]),
        },
        {
          label: 'DA',
          node: row([
            <ProposedReading key="a" size={40} />,
            <ProposedWriting key="b" size={40} />,
            <SubjectArt key="c" subject="reading" size={40} muted />,
            <ProposedWriting key="d" size={40} muted />,
          ]),
        },
      ],
    },
  ],
};

export default sheet;
void label;
