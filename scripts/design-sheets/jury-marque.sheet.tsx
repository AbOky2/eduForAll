/** @jsxRuntime automatic */
/**
 * Planche du jury de marque (brief § 11.1) : A « L'ardoise à la boucle » et
 * B « L'éléphanteau-livre » côte à côte, dans les MÊMES conditions.
 *
 *   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/jury-marque.sheet.tsx \
 *     .cache/design-renders/jury-marque.png --dpr 1   (puis --dpr 2)
 *
 * On juge d'abord en situation : un écran d'accueil de tablette tchadienne
 * (messagerie verte, vidéo rouge, réseau bleu, langues vert citron, appli
 * jaune, opérateur orange…) à 60, 40 et 29 px, en couleur, en niveaux de
 * gris, en mode teinté iOS, en icônes à thème Android, et flouté (test du
 * plissement d'yeux). Puis seulement les grandes tailles.
 *
 * Les voisines sont des maquettes génériques (aucun logo réel), aux couleurs
 * des plateformes : elles n'entrent jamais dans l'app, d'où leurs couleurs
 * ici et non dans les jetons. Rien n'est redessiné : A et B viennent de leurs
 * `concept.tsx`.
 */
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import * as A from './logo-ardoise/concept';
import * as B from './logo-elephanteau/concept';

type Pick = 'A' | 'B';

/** Couleurs de maquette (voisines, fonds d'écran) — hors jetons, jamais dans l'app. */
const MOCK = {
  dusk: 'linear-gradient(160deg,#1f2a44 0%,#3b2d5a 55%,#16324a 100%)',
  day: 'linear-gradient(170deg,#dfe9f5 0%,#f6efe4 100%)',
  laterite: 'linear-gradient(160deg,#b45a26 0%,#e8a95b 55%,#7a4a2a 100%)',
  tintBackdrop: '#1c1c1e',
  tint: '#e8a23a',
  themeLight: { bg: '#d7e3f2', fg: '#173451', wall: 'linear-gradient(170deg,#eef3fa,#dbe6f3)' },
  themeDark: { bg: '#22313f', fg: '#cfe5ff', wall: 'linear-gradient(170deg,#0f1720,#1b2836)' },
} as const;

// ------------------------------------------------------------- voisines

type Glyph = 'bubble' | 'play' | 'f' | 'note' | 'owl' | 'ghost' | 'plane' | 'ring' | 'wave' | 'camera' | 'store';
type Neighbour = { name: string; bg: string; fg: string; glyph: Glyph };

const N: Record<string, Neighbour> = {
  messages: { name: 'Messages', bg: '#25d366', fg: '#ffffff', glyph: 'bubble' },
  videos: { name: 'Vidéos', bg: '#ffffff', fg: '#ff0033', glyph: 'play' },
  reseau: { name: 'Réseau', bg: '#1877f2', fg: '#ffffff', glyph: 'f' },
  courtes: { name: 'Courtes', bg: '#000000', fg: '#ffffff', glyph: 'note' },
  langues: { name: 'Langues', bg: '#58cc02', fg: '#ffffff', glyph: 'owl' },
  snap: { name: 'Snap', bg: '#fffc00', fg: '#ffffff', glyph: 'ghost' },
  appels: { name: 'Appels', bg: '#2aabee', fg: '#ffffff', glyph: 'plane' },
  argent: { name: 'Argent', bg: '#e40000', fg: '#ffffff', glyph: 'ring' },
  operateur: { name: 'Opérateur', bg: '#f28c00', fg: '#ffffff', glyph: 'wave' },
  photo: { name: 'Photo', bg: '#3a3a3c', fg: '#ffffff', glyph: 'camera' },
  boutique: { name: 'Boutique', bg: '#ffffff', fg: '#1a73e8', glyph: 'store' },
};

/** L'ECOLNA est au centre, entre le vert citron, le jaune et, dessous, l'orange. */
const GRID: (Neighbour | 'ecolna')[] = [
  N.messages!, N.videos!, N.reseau!, N.courtes!,
  N.langues!, 'ecolna', N.snap!, N.appels!,
  N.argent!, N.operateur!, N.photo!, N.boutique!,
];

function NeighbourGlyph({ glyph, fg, themed }: { glyph: Glyph; fg: string; themed: boolean }) {
  const fill = { fill: fg } as const;
  const line = { fill: 'none', stroke: fg, strokeWidth: 8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (glyph) {
    case 'bubble':
      return <path d="M50 22a28 26 0 1 1-14 48.5L22 76l5-13A26 26 0 0 1 50 22z" {...fill} />;
    case 'play':
      return (
        <>
          <rect x={16} y={28} width={68} height={46} rx={14} fill={fg} />
          <path d="M44 40l17 11-17 11z" fill={themed ? MOCK.themeLight.bg : '#ffffff'} />
        </>
      );
    case 'f':
      return <path d="M62 24h-6a10 10 0 0 0-10 10v52M36 52h26" {...line} strokeWidth={11} />;
    case 'note':
      return (
        <>
          <path d="M50 26v36" {...line} strokeWidth={9} />
          <path d="M50 26q6 12 20 14" {...line} strokeWidth={9} />
          <circle cx={40} cy={64} r={11} {...fill} />
        </>
      );
    case 'owl':
      return (
        <>
          <path d="M28 40q0-18 22-18t22 18v18q0 18-22 18T28 58z" {...fill} />
          {themed ? null : (
            <>
              <circle cx={41} cy={46} r={7} fill="#4b4b4b" />
              <circle cx={59} cy={46} r={7} fill="#4b4b4b" />
              <path d="M45 58l5 6 5-6z" fill="#ff9600" />
            </>
          )}
        </>
      );
    case 'ghost':
      return (
        <path
          d="M50 24c13 0 19 10 19 22v6l7 4-7 3c2 6 6 9 12 10-5 4-12 2-15 5-4 4-9 6-16 6s-12-2-16-6c-3-3-10-1-15-5 6-1 10-4 12-10l-7-3 7-4v-6c0-12 6-22 19-22z"
          fill={fg}
          stroke={themed ? 'none' : '#111111'}
          strokeWidth={3}
          strokeLinejoin="round"
        />
      );
    case 'plane':
      return <path d="M22 50l54-24-12 50-14-14-10 10v-14z" {...fill} stroke={fg} strokeWidth={4} strokeLinejoin="round" />;
    case 'ring':
      return (
        <>
          <circle cx={50} cy={50} r={20} {...line} strokeWidth={10} />
          <circle cx={50} cy={50} r={6} {...fill} />
        </>
      );
    case 'wave':
      return <path d="M22 60q14-26 28 0t28 0" {...line} strokeWidth={10} />;
    case 'camera':
      return (
        <>
          <rect x={20} y={34} width={60} height={40} rx={10} {...fill} />
          <rect x={38} y={26} width={24} height={12} rx={4} {...fill} />
          <circle cx={50} cy={54} r={11} fill={themed ? MOCK.themeLight.bg : '#3a3a3c'} />
        </>
      );
    case 'store':
      return themed ? (
        <path d="M32 24l44 26-44 26z" {...fill} stroke={fg} strokeWidth={6} strokeLinejoin="round" />
      ) : (
        <>
          <path d="M32 24l26 26-26 26z" fill="#00c4ff" />
          <path d="M32 24l44 26-18 0z" fill="#00e676" />
          <path d="M32 76l44-26-18 0z" fill="#ff3d3d" />
          <path d="M58 50l18 0-9 5z" fill="#ffd400" />
        </>
      );
  }
}

// ------------------------------------------------------------- masques

/** Écusson iOS (coins 22,37 %) — à 29–60 px indiscernable de la courbe continue. */
function IosMask({ size, children, shadow = true }: { size: number; children: ReactNode; shadow?: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '22.37%',
        overflow: 'hidden',
        lineHeight: 0,
        flexShrink: 0,
        boxShadow: shadow ? '0 1px 2px rgba(0,0,0,.25)' : undefined,
      }}
    >
      {children}
    </div>
  );
}

/** Cercle Android : calques de 108 dp dont 72 visibles. */
function AndroidMask({ size, background, children }: { size: number; background: string; children: ReactNode }) {
  const layer = (size * 108) / 72;
  const inset = (layer - size) / 2;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', position: 'relative', background, flexShrink: 0 }}>
      <div style={{ position: 'absolute', left: -inset, top: -inset, width: layer, height: layer, lineHeight: 0 }}>{children}</div>
    </div>
  );
}

function appIcon(pick: Pick, size: number): ReactElement {
  return <IosMask size={size}>{pick === 'A' ? <A.EcolnaAppIcon size={size} /> : <B.EcolnaAppIcon size={size} />}</IosMask>;
}

function androidIcon(pick: Pick, size: number): ReactElement {
  const layer = (size * 108) / 72;
  if (pick === 'A') {
    return (
      <AndroidMask size={size} background="transparent">
        <div style={{ position: 'absolute', inset: 0 }}>
          <A.EcolnaAdaptiveBackground size={layer} />
        </div>
        <div style={{ position: 'absolute', inset: 0 }}>
          <A.EcolnaAdaptiveForeground size={layer} />
        </div>
      </AndroidMask>
    );
  }
  return (
    <AndroidMask size={size} background={B.ADAPTIVE_BACKGROUND}>
      <B.EcolnaAdaptiveForeground size={layer} />
    </AndroidMask>
  );
}

function themedIcon(pick: Pick, size: number, theme: { bg: string; fg: string }): ReactElement {
  const layer = (size * 108) / 72;
  return (
    <AndroidMask size={size} background={theme.bg}>
      {pick === 'A' ? (
        <A.EcolnaAdaptiveMonochrome size={layer} color={theme.fg} />
      ) : (
        <B.EcolnaAdaptiveMonochrome size={layer} color={theme.fg} />
      )}
    </AndroidMask>
  );
}

function neighbourIcon(n: Neighbour, size: number, mode: 'ios' | 'android' | 'themed', theme?: { bg: string; fg: string }) {
  const art = (bg: string, fg: string, themed: boolean) => (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ background: bg, display: 'block' }}>
      <NeighbourGlyph glyph={n.glyph} fg={fg} themed={themed} />
    </svg>
  );
  if (mode === 'themed' && theme) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>{art(theme.bg, theme.fg, true)}</div>
    );
  }
  if (mode === 'android') {
    return <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>{art(n.bg, n.fg, false)}</div>;
  }
  return <IosMask size={size}>{art(n.bg, n.fg, false)}</IosMask>;
}

// -------------------------------------------------------- écran d'accueil

type Mode = 'ios' | 'android' | 'themed';

function HomeScreen({
  pick,
  size,
  wallpaper,
  light = false,
  mode = 'ios',
  theme,
  both = false,
}: {
  pick: Pick;
  size: number;
  wallpaper: string;
  light?: boolean;
  mode?: Mode;
  theme?: { bg: string; fg: string };
  /** A ET B sur le même écran (B prend la place de « Photo »). */
  both?: boolean;
}) {
  const gap = Math.round(size * 0.56);
  const pad = Math.round(size * 0.5);
  const font = Math.max(8, Math.round(size * 0.18));
  const labels = size >= 40;
  const cells = GRID.map((c) => (both && c !== 'ecolna' && c.name === 'Photo' ? ('ecolnaB' as const) : c));
  return (
    <div
      style={{
        padding: `${pad}px ${pad}px ${Math.round(pad * 0.6)}px`,
        borderRadius: Math.round(size * 0.4),
        background: wallpaper,
        display: 'grid',
        gridTemplateColumns: `repeat(4, ${size}px)`,
        columnGap: gap,
        rowGap: Math.round(size * (labels ? 0.22 : 0.5)),
      }}
    >
      {cells.map((c, i) => {
        let icon: ReactElement;
        let name: string;
        if (c === 'ecolna' || c === 'ecolnaB') {
          const p: Pick = c === 'ecolnaB' ? 'B' : both ? 'A' : pick;
          icon = mode === 'themed' && theme ? themedIcon(p, size, theme) : mode === 'android' ? androidIcon(p, size) : appIcon(p, size);
          name = both ? `ECOLNA ${p}` : 'ECOLNA';
        } else {
          icon = neighbourIcon(c, size, mode, theme);
          name = c.name;
        }
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Math.round(size * 0.1) }}>
            {icon}
            {labels ? (
              <span
                style={{
                  color: light ? '#1d1d1f' : '#ffffff',
                  fontSize: font,
                  lineHeight: `${font + 2}px`,
                  whiteSpace: 'nowrap',
                  fontFamily: 'system-ui, sans-serif',
                  textShadow: light ? 'none' : '0 1px 2px rgba(0,0,0,.5)',
                }}
              >
                {name}
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** A et B côte à côte, titrés. */
function Pair({ render, gap = 28, style }: { render: (pick: Pick) => ReactElement; gap?: number; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-start', ...style }}>
      {(['A', 'B'] as const).map((p) => (
        <div key={p} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: 'Quicksand', fontWeight: 700, fontSize: 15, color: '#161a32' }}>{p === 'A' ? 'A — ardoise' : 'B — éléphanteau'}</span>
          {render(p)}
        </div>
      ))}
    </div>
  );
}

/** Mode teinté iOS 18+ : la luminance de l'icône, dans la teinte choisie, sur fond sombre. */
function Tinted({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: MOCK.tint, isolation: 'isolate', lineHeight: 0 }}>
      <div style={{ mixBlendMode: 'luminosity', filter: 'grayscale(1)' }}>{children}</div>
    </div>
  );
}

/** Liste « Réglages » à 29 px : le contexte réel de cette taille. */
function SettingsList({ pick }: { pick: Pick }) {
  const rows: (Neighbour | 'ecolna')[] = [N.messages!, N.langues!, 'ecolna', N.snap!, N.operateur!];
  return (
    <div style={{ background: '#ffffff', borderRadius: 12, padding: '6px 0', width: 230, boxShadow: '0 1px 3px rgba(0,0,0,.12)' }}>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 14px', borderTop: i ? '1px solid #ececf0' : 'none' }}>
          {r === 'ecolna' ? appIcon(pick, 29) : neighbourIcon(r, 29, 'ios')}
          <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 15, color: '#1d1d1f' }}>{r === 'ecolna' ? 'ECOLNA' : r.name}</span>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------ grand format

const SURFACES = [
  { name: 'blanc', bg: '#ffffff' },
  { name: 'ivoire', bg: '#f4f1de' },
  { name: 'sable', bg: '#d4a373' },
] as const;

function MarkRow({ pick, bg }: { pick: Pick; bg: string }) {
  const sizes = [96, 64, 48, 32, 24];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, background: bg, padding: '10px 16px', borderRadius: 10 }}>
      {sizes.map((s) => (pick === 'A' ? <A.EcolnaMark key={s} size={s} /> : <B.EcolnaMark key={s} size={s} />))}
    </div>
  );
}

function Wordmarks({ pick, height }: { pick: Pick; height: number }) {
  return pick === 'A' ? <A.EcolnaWordmark height={height} /> : <B.EcolnaWordmark height={height} />;
}

/** Silhouette : tout ce qui est dessiné passe au noir (forme reconnaissable sans couleur ni détail). */
function Silhouette({ pick, size }: { pick: Pick; size: number }) {
  return (
    <div style={{ filter: 'brightness(0)', lineHeight: 0 }}>
      {pick === 'A' ? <A.EcolnaMark size={size} /> : <B.EcolnaMark size={size} />}
    </div>
  );
}

// ------------------------------------------------------------------ planche

const blur = (px: number, node: ReactElement) => <div style={{ filter: `blur(${px}px)` }}>{node}</div>;
const grey = (node: ReactElement) => <div style={{ filter: 'grayscale(1)' }}>{node}</div>;

const sheet = {
  title: 'Jury de marque — A « L’ardoise à la boucle » contre B « L’éléphanteau-livre »',
  subtitle:
    'Mêmes conditions pour les deux : écran d’accueil d’abord (60 / 40 / 29 px, couleur, gris, teinté iOS, thème Android, flou), grand format ensuite.',
  width: 1600,
  sections: [
    {
      title: '1 · Écran d’accueil à 60 px — fond sombre, fond clair, fond latérite',
      note: 'ECOLNA au centre, entre vert citron (langues), jaune (snap) et, dessous, l’orange d’un opérateur.',
      cellWidth: 900,
      cellHeight: 360,
      cells: [
        { label: 'fond sombre', node: <Pair render={(p) => <HomeScreen pick={p} size={60} wallpaper={MOCK.dusk} />} /> },
        { label: 'fond clair', node: <Pair render={(p) => <HomeScreen pick={p} size={60} wallpaper={MOCK.day} light />} /> },
        { label: 'fond latérite (photo chaude)', node: <Pair render={(p) => <HomeScreen pick={p} size={60} wallpaper={MOCK.laterite} />} /> },
        {
          label: 'A et B sur le même écran (B à la place de « Photo ») : lequel l’œil trouve-t-il d’abord ?',
          node: <HomeScreen pick="A" size={60} wallpaper={MOCK.dusk} both />,
        },
      ],
    },
    {
      title: '2 · Test du plissement d’yeux — 60 px flouté (2 px) et en niveaux de gris',
      note: 'Ce qui reste quand le détail disparaît : la masse, la valeur, la silhouette.',
      cellWidth: 900,
      cellHeight: 360,
      cells: [
        { label: 'flou 2 px, fond sombre', node: blur(2, <Pair render={(p) => <HomeScreen pick={p} size={60} wallpaper={MOCK.dusk} />} />) },
        { label: 'niveaux de gris, fond sombre', node: grey(<Pair render={(p) => <HomeScreen pick={p} size={60} wallpaper={MOCK.dusk} />} />) },
        { label: 'niveaux de gris, fond clair', node: grey(<Pair render={(p) => <HomeScreen pick={p} size={60} wallpaper={MOCK.day} light />} />) },
        { label: 'flou 2 px + gris, fond latérite', node: blur(2, grey(<Pair render={(p) => <HomeScreen pick={p} size={60} wallpaper={MOCK.laterite} />} />)) },
      ],
    },
    {
      title: '3 · Écran d’accueil à 40 px, Android (cercle, calques adaptatifs) et iOS',
      cellWidth: 640,
      cellHeight: 260,
      cells: [
        { label: 'iOS 40 px, fond sombre', node: <Pair render={(p) => <HomeScreen pick={p} size={40} wallpaper={MOCK.dusk} />} /> },
        { label: 'Android 40 px, fond sombre', node: <Pair render={(p) => <HomeScreen pick={p} size={40} wallpaper={MOCK.dusk} mode="android" />} /> },
        { label: 'iOS 40 px, gris', node: grey(<Pair render={(p) => <HomeScreen pick={p} size={40} wallpaper={MOCK.day} light />} />) },
        { label: 'Android 40 px, fond latérite', node: <Pair render={(p) => <HomeScreen pick={p} size={40} wallpaper={MOCK.laterite} mode="android" />} /> },
      ],
    },
    {
      title: '4 · 29 px — grille sans libellés et liste « Réglages » (le vrai contexte de cette taille)',
      cellWidth: 500,
      cellHeight: 230,
      cells: [
        { label: 'grille 29 px, fond sombre', node: <Pair render={(p) => <HomeScreen pick={p} size={29} wallpaper={MOCK.dusk} />} /> },
        { label: 'grille 29 px, gris', node: grey(<Pair render={(p) => <HomeScreen pick={p} size={29} wallpaper={MOCK.dusk} />} />) },
        { label: 'Réglages 29 px', node: <Pair gap={16} render={(p) => <SettingsList pick={p} />} /> },
      ],
    },
    {
      title: '5 · Monochrome — mode teinté iOS 18+ et icônes à thème Android 13+, 60 et 40 px',
      note: 'Teinté : seule la luminance survit. Thème Android : seul le calque monochrome dessiné à la main.',
      cellWidth: 900,
      cellHeight: 380,
      cells: [
        {
          label: 'iOS teinté (luminance → ambre, fond sombre), 60 px',
          node: <Pair render={(p) => <Tinted><HomeScreen pick={p} size={60} wallpaper={MOCK.tintBackdrop} /></Tinted>} />,
        },
        {
          label: 'Android thème clair, 60 px',
          node: <Pair render={(p) => <HomeScreen pick={p} size={60} wallpaper={MOCK.themeLight.wall} light mode="themed" theme={MOCK.themeLight} />} />,
        },
        {
          label: 'Android thème sombre, 40 px',
          node: <Pair render={(p) => <HomeScreen pick={p} size={40} wallpaper={MOCK.themeDark.wall} mode="themed" theme={MOCK.themeDark} />} />,
        },
        {
          label: 'Android thème clair, 29 px',
          node: <Pair render={(p) => <HomeScreen pick={p} size={29} wallpaper={MOCK.themeLight.wall} mode="themed" theme={MOCK.themeLight} />} />,
        },
      ],
    },
    {
      title: '6 · Grand format — icônes 1024 affichées à 300 px, puis 180 px',
      cellWidth: 740,
      cellHeight: 340,
      cells: [
        { label: 'iOS 300 px', node: <Pair gap={60} render={(p) => appIcon(p, 300)} /> },
        { label: '180 px, iOS puis Android', node: <Pair gap={40} render={(p) => <div style={{ display: 'flex', gap: 20 }}>{appIcon(p, 180)}{androidIcon(p, 180)}</div>} /> },
      ],
    },
    {
      title: '7 · Silhouettes et symbole dans l’app (96 / 64 / 48 / 32 / 24)',
      note: 'Silhouette : la forme seule, sans couleur ni détail. Symbole : sur les trois fonds de l’app.',
      cellWidth: 740,
      cellHeight: 200,
      cells: [
        { label: 'silhouettes 140 / 60 / 32', node: <Pair gap={60} render={(p) => <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}><Silhouette pick={p} size={140} /><Silhouette pick={p} size={60} /><Silhouette pick={p} size={32} /></div>} /> },
        ...SURFACES.map((s) => ({
          label: `symbole — ${s.name}`,
          node: <Pair gap={20} render={(p) => <MarkRow pick={p} bg={s.bg} />} />,
          background: '#f3f1f8',
        })),
      ],
    },
    {
      title: '8 · Mot-symbole et logotypes — même hauteur',
      cellWidth: 1520,
      cellHeight: 300,
      cells: [
        {
          label: 'mot-symbole 96 px puis 32 et 20 px (en-tête d’écran) — A en haut, B en bas',
          node: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'flex-start' }}>
              {(['A', 'B'] as const).map((p) => (
                <div key={p} style={{ display: 'flex', alignItems: 'flex-end', gap: 40 }}>
                  <span style={{ fontFamily: 'Quicksand', fontWeight: 700, fontSize: 22, width: 24 }}>{p}</span>
                  <Wordmarks pick={p} height={96} />
                  <Wordmarks pick={p} height={32} />
                  <Wordmarks pick={p} height={20} />
                </div>
              ))}
            </div>
          ),
        },
        {
          label: 'logotypes horizontaux, hauteur 110 — A à gauche, B à droite',
          node: (
            <div style={{ display: 'flex', gap: 80, alignItems: 'center' }}>
              <A.EcolnaLogo height={110} />
              <B.EcolnaLogo height={110} />
            </div>
          ),
        },
      ],
    },
    {
      title: '9 · Pixels réels (1x) — 29 / 40 / 60, iOS puis Android, A puis B',
      note: 'À agrandir au plus proche voisin pour voir ce qu’un écran 1x affiche vraiment.',
      cellWidth: 1520,
      cellHeight: 120,
      cells: [
        {
          label: 'A29 B29 · A40 B40 · A60 B60 (iOS) — puis les mêmes en Android',
          node: (
            <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
              {[29, 40, 60].flatMap((s) => (['A', 'B'] as const).map((p) => <div key={`i${p}${s}`}>{appIcon(p, s)}</div>))}
              {[29, 40, 60].flatMap((s) => (['A', 'B'] as const).map((p) => <div key={`a${p}${s}`}>{androidIcon(p, s)}</div>))}
            </div>
          ),
        },
      ],
    },
  ],
};

export default sheet;
