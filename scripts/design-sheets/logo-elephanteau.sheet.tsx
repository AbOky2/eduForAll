/** @jsxRuntime automatic */
// Planche de la piste de marque B, « L'éléphanteau-livre » (brief § 11).
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/logo-elephanteau.sheet.tsx .cache/design-renders/logo-elephanteau.png --dpr 2
// Les masques (écusson iOS 22,37 %, cercle Android) et l'écran d'accueil sont
// des maquettes de planche : seules les icônes viennent de concept.tsx.
import type { ReactElement, ReactNode } from 'react';

import { colors, illustration } from '../../src/design-system/tokens';
import {
  ADAPTIVE_BACKGROUND,
  CONSTRUCTION,
  EcolnaAdaptiveForeground,
  EcolnaAdaptiveMonochrome,
  EcolnaAppIcon,
  EcolnaLogo,
  EcolnaMark,
  EcolnaSplashIcon,
  EcolnaWordmark,
} from './logo-elephanteau/concept';

const IVORY = colors.exerciseBackground;
const SAND = colors.primaryContainer;

/** Écusson iOS : coins à 22,37 % du côté. */
function Squircle({ size, children, shadow = false }: { size: number; children: ReactNode; shadow?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '22.37%',
        overflow: 'hidden',
        lineHeight: 0,
        flexShrink: 0,
        boxShadow: shadow ? '0 1px 2px rgba(0,0,0,.18)' : undefined,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Lanceur Android : calques de 108 dp, 72 dp visibles sous le masque. On
 * agrandit donc le calque 1024 de 108/72 et on le recentre dans le cercle.
 */
function AndroidCircle({ size, children, background }: { size: number; children: ReactNode; background: string }) {
  const layer = (size * 108) / 72;
  const inset = (layer - size) / 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        background,
        flexShrink: 0,
      }}
    >
      <div style={{ position: 'absolute', left: -inset, top: -inset, width: layer, height: layer, lineHeight: 0 }}>
        {children}
      </div>
    </div>
  );
}

const androidIcon = (size: number) => (
  <AndroidCircle size={size} background={ADAPTIVE_BACKGROUND}>
    <EcolnaAdaptiveForeground size={(size * 108) / 72} />
  </AndroidCircle>
);

/** Thèmes Material You (Android 13+) : le système teinte le glyphe et le fond. */
const THEMES = [
  { name: 'thème sombre', bg: '#22313f', fg: '#cfe5ff' },
  { name: 'thème clair', bg: '#d7e3f2', fg: '#173451' },
  { name: 'thème sable', bg: '#f1e0c7', fg: '#5b3d18' },
] as const;
const themed = (size: number, t: (typeof THEMES)[number]) => (
  <AndroidCircle size={size} background={t.bg}>
    <EcolnaAdaptiveMonochrome size={(size * 108) / 72} color={t.fg} />
  </AndroidCircle>
);

/** Calque avant sur damier, avec le cercle visible (72/108) et le cercle sûr (66/108). */
function SafeZone({ size }: { size: number }) {
  const r72 = (size * 72) / 108 / 2;
  const r66 = (size * 66) / 108 / 2;
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        lineHeight: 0,
        backgroundColor: '#ffffff',
        backgroundImage:
          'linear-gradient(45deg,#e9e6ef 25%,transparent 25%),linear-gradient(-45deg,#e9e6ef 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e9e6ef 75%),linear-gradient(-45deg,transparent 75%,#e9e6ef 75%)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0,0 12px,12px -12px,-12px 0',
      }}
    >
      <EcolnaAdaptiveForeground size={size} />
      <svg width={size} height={size} style={{ position: 'absolute', left: 0, top: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={r72} fill="none" stroke="#7a5cc4" strokeWidth={1.5} strokeDasharray="6 5" />
        <circle cx={size / 2} cy={size / 2} r={r66} fill="none" stroke="#d1335b" strokeWidth={2} />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Écran d'accueil : 11 icônes neutres aux couleurs typiques des plateformes
// (formes géométriques blanches, aucun logo réel), plus ECOLNA. Couleurs de
// maquette uniquement, hors jetons ECOLNA.
// ---------------------------------------------------------------------------
type Glyph = 'bubble' | 'play' | 'camera' | 'note' | 'square' | 'circle' | 'star' | 'chevron' | 'grid' | 'bolt' | 'ring';
const PLACEHOLDERS: { name: string; bg: string; fg: string; glyph: Glyph }[] = [
  { name: 'Messages', bg: '#25c45a', fg: '#ffffff', glyph: 'bubble' },
  { name: 'Vidéos', bg: '#ff2a2a', fg: '#ffffff', glyph: 'play' },
  { name: 'Photos', bg: '#ffffff', fg: '#ff9f0a', glyph: 'circle' },
  { name: 'Réseau', bg: '#1877f2', fg: '#ffffff', glyph: 'square' },
  { name: 'Musique', bg: '#111111', fg: '#ffffff', glyph: 'note' },
  { name: 'Langues', bg: '#58cc02', fg: '#ffffff', glyph: 'star' },
  { name: 'Appels', bg: '#2aabee', fg: '#ffffff', glyph: 'chevron' },
  { name: 'Jeux', bg: '#7b2ff7', fg: '#ffffff', glyph: 'grid' },
  { name: 'Snaps', bg: '#fffc00', fg: '#111111', glyph: 'ring' },
  { name: 'Caméra', bg: '#3a3a3c', fg: '#ffffff', glyph: 'camera' },
  { name: 'Énergie', bg: '#e1306c', fg: '#ffffff', glyph: 'bolt' },
];

function PlaceholderGlyph({ glyph, fg }: { glyph: Glyph; fg: string }) {
  const s = { fill: fg } as const;
  const t = { fill: 'none', stroke: fg, strokeWidth: 7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (glyph) {
    case 'bubble':
      return <path d="M30 22h40a10 10 0 0 1 10 10v24a10 10 0 0 1-10 10H48l-14 12v-12h-4a10 10 0 0 1-10-10V32a10 10 0 0 1 10-10z" {...s} />;
    case 'play':
      return <path d="M40 30l30 20-30 20z" {...s} {...{ stroke: fg, strokeWidth: 8, strokeLinejoin: 'round' }} />;
    case 'camera':
      return <><rect x={22} y={34} width={56} height={38} rx={9} {...s} /><rect x={38} y={26} width={24} height={12} rx={4} {...s} /></>;
    case 'note':
      return <><path d="M44 66V30l26-6v36" {...t} /><circle cx={38} cy={66} r={8} {...s} /><circle cx={64} cy={60} r={8} {...s} /></>;
    case 'square':
      return <rect x={30} y={30} width={40} height={40} rx={8} {...s} />;
    case 'circle':
      return <><circle cx={42} cy={44} r={14} fill="#ff9f0a" /><circle cx={58} cy={44} r={14} fill="#34c759" /><circle cx={50} cy={58} r={14} fill="#0a84ff" /></>;
    case 'star':
      return <path d="M50 24l7.6 16.4 17.9 2.1-13.2 12.2 3.5 17.7L50 63.5l-15.8 8.9 3.5-17.7-13.2-12.2 17.9-2.1z" {...s} />;
    case 'chevron':
      return <path d="M24 50l48-22-14 46-10-16z" {...s} {...{ stroke: fg, strokeWidth: 4, strokeLinejoin: 'round' }} />;
    case 'grid':
      return <><rect x={28} y={28} width={18} height={18} rx={5} {...s} /><rect x={54} y={28} width={18} height={18} rx={5} {...s} /><rect x={28} y={54} width={18} height={18} rx={5} {...s} /><rect x={54} y={54} width={18} height={18} rx={9} {...s} /></>;
    case 'ring':
      return <circle cx={50} cy={50} r={20} {...t} />;
    case 'bolt':
      return <path d="M54 22L32 54h16l-4 24 24-34H52z" {...s} {...{ stroke: fg, strokeWidth: 3, strokeLinejoin: 'round' }} />;
  }
}

function Placeholder({ size, bg, fg, glyph }: { size: number; bg: string; fg: string; glyph: Glyph }) {
  return (
    <Squircle size={size} shadow>
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ background: bg }}>
        <PlaceholderGlyph glyph={glyph} fg={fg} />
      </svg>
    </Squircle>
  );
}

function HomeScreen({ size = 60, wallpaper }: { size?: number; wallpaper: string }) {
  const cells = [...PLACEHOLDERS.slice(0, 5), { name: 'ECOLNA', bg: '', fg: '', glyph: 'square' as Glyph }, ...PLACEHOLDERS.slice(5)];
  return (
    <div
      style={{
        width: 4 * size + 3 * 34 + 64,
        padding: '28px 32px 18px',
        borderRadius: 28,
        background: wallpaper,
        display: 'grid',
        gridTemplateColumns: `repeat(4, ${size}px)`,
        columnGap: 34,
        rowGap: 14,
      }}
    >
      {cells.map((c) => (
        <div key={c.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {c.name === 'ECOLNA' ? (
            <Squircle size={size} shadow>
              <EcolnaAppIcon size={size} />
            </Squircle>
          ) : (
            <Placeholder size={size} bg={c.bg} fg={c.fg} glyph={c.glyph} />
          )}
          <span style={{ color: '#ffffff', fontSize: 11, lineHeight: '13px', fontFamily: 'system-ui, sans-serif', textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>
            {c.name}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Loupe : une région du canevas 1024, agrandie (vectoriel, donc net). */
function Zoom({ x, y, w, scale, children }: { x: number; y: number; w: number; scale: number; children: (size: number) => ReactNode }) {
  const view = w * scale;
  return (
    <div style={{ width: view, height: view, overflow: 'hidden', position: 'relative', lineHeight: 0 }}>
      <div style={{ position: 'absolute', left: -x * scale, top: -y * scale }}>{children(1024 * scale)}</div>
    </div>
  );
}

const WALL_DUSK = 'linear-gradient(160deg,#3b2d5a 0%,#8a4f7d 55%,#e08a6a 100%)';
const WALL_DAY = 'linear-gradient(170deg,#3f7fbf 0%,#6fa3cf 55%,#b88d63 100%)';

/** Épure : les repères qui fixent le dessin (canevas 1024). */
function Construction({ size }: { size: number }) {
  const C = CONSTRUCTION;
  const guide = '#1d6fd8';
  const note = { fontSize: 22, fill: guide, fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' } as const;
  const dash = { fill: 'none', stroke: guide, strokeWidth: 3, strokeDasharray: '10 8' } as const;
  const [x0, y0, x1, y1] = C.bounds;
  return (
    <div style={{ position: 'relative', width: size, height: size, lineHeight: 0 }}>
      <EcolnaAppIcon size={size} />
      <svg width={size} height={size} viewBox="0 0 1024 1024" style={{ position: 'absolute', left: 0, top: 0 }}>
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} {...dash} />
        <line x1={512} y1={60} x2={512} y2={964} {...dash} strokeDasharray="4 8" />
        <circle cx={C.head.cx} cy={C.head.cy} r={C.head.r} {...dash} />
        <line x1={C.head.cx - C.head.r} y1={C.head.cy + 4} x2={C.head.cx + C.head.r} y2={C.head.cy + 4} stroke={guide} strokeWidth={3} />
        <text x={C.head.cx + 24} y={C.head.cy - C.head.r - 14} {...note}>{`tête Ø ${C.head.r * 2} = ${Math.round((C.head.r * 200) / 1024)} %`}</text>
        <line x1={x0} y1={C.eye.y} x2={x1} y2={C.eye.y} {...dash} strokeDasharray="4 8" />
        <circle cx={512 - C.eye.dx} cy={C.eye.y} r={C.eye.r} {...dash} />
        <text x={512 - C.eye.dx - C.eye.r} y={C.eye.y + C.eye.r + 34} {...note}>{`œil Ø ${C.eye.r * 2} (${Math.round((C.eye.r * 200) / 1024)} %), pupille Ø ${C.eye.pupil * 2}`}</text>
        <path d={C.trunkAxis} {...dash} strokeWidth={4} />
        <text x={x0 + 4} y={y1 + 32} {...note}>{`trompe : ${C.trunk.root} → ${C.trunk.tip}, courbure croissante`}</text>
        <text x={590} y={690} {...note}>{`congé r ${C.fillet.r}`}</text>
        <text x={x0 + 4} y={y0 - 12} {...note}>{`symbole ${Math.round(x1 - x0)} × ${Math.round(y1 - y0)} — couverture ${C.rim}`}</text>
      </svg>
    </div>
  );
}

// react-dom n'a pas de types dans ce dépôt (pas de @types/react-dom) : on
// type à la main la seule fonction utilisée, pour compter les éléments.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- planche hors app, module non typé
const { renderToStaticMarkup } = require('react-dom/server') as { renderToStaticMarkup: (node: ReactElement) => string };

/** Nombre d'éléments SVG dessinés (budget § 15). */
function countElements(node: ReactElement): number {
  const markup = renderToStaticMarkup(node);
  return (markup.match(/<(?!\/)[a-zA-Z]+/g) ?? []).length - 1;
}
const budget = `icône ${countElements(<EcolnaAppIcon size={64} />)} éléments (fond + 1 dégradé) · symbole ${countElements(
  <EcolnaMark size={64} />,
)} · mono ${countElements(<EcolnaMark size={64} tone="mono" />)} · mot-symbole ${countElements(<EcolnaWordmark height={64} />)}`;

const ICON_SIZES = [180, 60, 40, 29] as const;
const MARK_SIZES = [24, 32, 40, 48, 64, 96, 160] as const;

const ZOOMS = [
  { label: 'racine de la trompe', x: 400, y: 560, w: 240 },
  { label: 'boucle de la trompe', x: 500, y: 680, w: 240 },
  { label: 'œil gauche', x: 330, y: 330, w: 200 },
  { label: 'coin bas de l’oreille', x: 70, y: 560, w: 240 },
] as const;

export default {
  title: 'Marque — piste B « L’éléphanteau-livre »',
  subtitle: `Les oreilles sont les pages, la trompe pend comme un signet. ${budget}`,
  width: 1440,
  sections: [
    {
      title: 'Icône d’app 1024 (source plein cadre, opaque) — affichée à 1:1 sous l’écusson iOS',
      cellWidth: 1040,
      cellHeight: 1040,
      cells: [
        {
          label: 'ecolna-logo-source — fond or (brand.goldTop → goldBottom), peau taupe chaud, pages crème / sable',
          node: (
            <Squircle size={1024}>
              <EcolnaAppIcon size={1024} />
            </Squircle>
          ),
        },
      ],
    },
    {
      title: 'Épure — tête-cercle, congés circulaires, trompe à courbure croissante, yeux 12 %',
      cellWidth: 660,
      cellHeight: 660,
      cells: [{ label: 'repères sur l’icône 1024 (affichée 640)', node: <Construction size={640} /> }],
    },
    {
      title: 'Loupes — détails du dessin (×1,6 à ×2)',
      cellWidth: 400,
      cellHeight: 400,
      cells: ZOOMS.map((z) => ({
        label: z.label,
        node: <Zoom x={z.x} y={z.y} w={z.w} scale={400 / z.w}>{(size) => <EcolnaAppIcon size={size} />}</Zoom>,
      })),
    },
    {
      title: 'iOS — écusson 22,37 %, taille réelle (1x)',
      cellWidth: 200,
      cellHeight: 200,
      cells: ICON_SIZES.map((s) => ({ label: `${s} px`, node: <Squircle size={s}><EcolnaAppIcon size={s} /></Squircle> })),
    },
    {
      title: 'Android — calques adaptatifs sous masque cercle (fond plat goldBottom), taille réelle (1x)',
      cellWidth: 200,
      cellHeight: 200,
      cells: ICON_SIZES.map((s) => ({ label: `${s} px`, node: androidIcon(s) })),
    },
    {
      title: 'Niveaux de gris — iOS et Android (lisibilité au soleil)',
      cellWidth: 200,
      cellHeight: 200,
      grayscale: true,
      cells: [
        ...ICON_SIZES.map((s) => ({ label: `iOS ${s}`, node: <Squircle size={s}><EcolnaAppIcon size={s} /></Squircle> })),
        ...ICON_SIZES.map((s) => ({ label: `Android ${s}`, node: androidIcon(s) })),
      ],
    },
    {
      title: 'Calques plateforme (1024) — avant adaptatif (cercle visible 72/108 en pointillé, sûr 66/108 en rouge), splash, monochrome',
      cellWidth: 420,
      cellHeight: 420,
      cells: [
        { label: 'adaptive-foreground (transparent, scale 0,64)', node: <SafeZone size={400} /> },
        {
          label: 'splash-icon : symbole seul dans les 2/3 centraux (cercle rouge)',
          node: (
            <div style={{ position: 'relative', width: 400, height: 400, background: IVORY, lineHeight: 0 }}>
              <EcolnaSplashIcon size={400} />
              <svg width={400} height={400} style={{ position: 'absolute', left: 0, top: 0 }}>
                <circle cx={200} cy={200} r={400 / 3} fill="none" stroke="#d1335b" strokeWidth={2} />
              </svg>
            </div>
          ),
        },
        {
          label: 'adaptive-monochrome (blanc sur transparent)',
          node: (
            <div style={{ background: '#2b2e48', lineHeight: 0 }}>
              <EcolnaAdaptiveMonochrome size={400} />
            </div>
          ),
        },
      ],
    },
    {
      title: 'Monochrome — icône thématique Android 13+ (une couleur, pages et yeux évidés)',
      cellWidth: 200,
      cellHeight: 200,
      cells: THEMES.flatMap((t) => ICON_SIZES.map((s) => ({ label: `${t.name} ${s}`, node: themed(s, t) }))),
    },
    {
      title: 'Symbole seul (EcolnaMark, couleur, avec reflet) — sur blanc',
      cellWidth: 176,
      cellHeight: 176,
      cells: MARK_SIZES.map((s) => ({ label: `${s} px`, node: <EcolnaMark size={s} /> })),
    },
    {
      title: 'Symbole seul — sur ivoire #F4F1DE et sable #d4a373',
      cellWidth: 176,
      cellHeight: 176,
      cells: [
        ...[40, 96, 160].map((s) => ({ label: `ivoire ${s}`, node: <EcolnaMark size={s} />, background: IVORY })),
        ...[40, 96, 160].map((s) => ({ label: `sable ${s}`, node: <EcolnaMark size={s} />, background: SAND })),
      ],
    },
    {
      title: 'Niveaux de gris — symbole et mot-symbole',
      cellWidth: 176,
      cellHeight: 176,
      grayscale: true,
      cells: [
        ...[40, 96, 160].map((s) => ({ label: `symbole ${s}`, node: <EcolnaMark size={s} /> })),
        ...[40, 96].map((s) => ({ label: `ivoire ${s}`, node: <EcolnaMark size={s} />, background: IVORY })),
        { label: 'mot-symbole 32', node: <EcolnaWordmark height={32} /> },
      ],
    },
    {
      title: 'Symbole mono (EcolnaMark tone="mono") — encre brune, blanc sur pétrole',
      cellWidth: 176,
      cellHeight: 176,
      cells: [
        ...[32, 64, 160].map((s) => ({ label: `encre ${s}`, node: <EcolnaMark size={s} tone="mono" /> })),
        ...[32, 64, 160].map((s) => ({
          label: `blanc ${s}`,
          node: <EcolnaMark size={s} tone="mono" monoColor={illustration.white} />,
          background: colors.secondary,
        })),
      ],
    },
    {
      title: 'Mot-symbole « ecolna » — Quicksand Bold épaissi (fût / hauteur d’x ≈ 0,30), « l » à trompe',
      cellWidth: 1360,
      cellHeight: 260,
      cells: [{ label: 'EcolnaWordmark height=200, encre brune brand.wordmark', node: <EcolnaWordmark height={200} /> }],
    },
    {
      title: 'Loupes — mot-symbole : le « e » rouvert (barre amincie, terminaison raccourcie) et le « l » à trompe',
      cellWidth: 660,
      cellHeight: 420,
      cells: [
        {
          label: '« eco », hauteur 400',
          node: (
            <div style={{ width: 640, height: 400, overflow: 'hidden', lineHeight: 0 }}>
              <EcolnaWordmark height={400} />
            </div>
          ),
        },
        {
          label: '« oln », hauteur 400',
          node: (
            <div style={{ width: 640, height: 400, overflow: 'hidden', lineHeight: 0, position: 'relative' }}>
              <div style={{ position: 'absolute', left: -600, top: 0 }}>
                <EcolnaWordmark height={400} />
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: 'Mot-symbole — petites tailles et fonds',
      cellWidth: 320,
      cellHeight: 110,
      cells: [
        { label: 'height 64 — blanc', node: <EcolnaWordmark height={64} /> },
        { label: 'height 40 — ivoire', node: <EcolnaWordmark height={40} />, background: IVORY },
        { label: 'height 28 — sable', node: <EcolnaWordmark height={28} />, background: SAND },
        { label: 'height 40 — onSurface', node: <EcolnaWordmark height={40} color={colors.onSurface} /> },
      ],
    },
    {
      title: 'Assemblages — horizontal et empilé',
      cellWidth: 660,
      cellHeight: 300,
      cells: [
        { label: 'EcolnaLogo horizontal, height 140', node: <EcolnaLogo height={140} /> },
        { label: 'EcolnaLogo empilé, height 260', node: <EcolnaLogo height={260} layout="stacked" /> },
        { label: 'horizontal 64 sur ivoire (en-tête d’accueil)', node: <EcolnaLogo height={64} />, background: IVORY },
        { label: 'empilé 160 sur sable', node: <EcolnaLogo height={160} layout="stacked" />, background: SAND },
      ],
    },
    {
      title: 'Écran d’accueil — ECOLNA à 60 px parmi 11 icônes neutres (couleurs typiques des plateformes)',
      cellWidth: 420,
      cellHeight: 420,
      cells: [
        { label: 'fond du soir', node: <HomeScreen wallpaper={WALL_DUSK} /> },
        { label: 'fond de jour', node: <HomeScreen wallpaper={WALL_DAY} /> },
        { label: 'fond du soir, niveaux de gris', node: <HomeScreen wallpaper={WALL_DUSK} />, grayscale: true },
      ],
    },
  ],
};
