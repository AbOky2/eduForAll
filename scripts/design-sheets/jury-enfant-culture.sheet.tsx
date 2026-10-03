/** @jsxRuntime automatic */
/**
 * Jury « enfant / culture » — pistes A (ardoise à la boucle) et B
 * (éléphanteau-livre) côte à côte, aux mêmes places, dans les mêmes contextes.
 *
 *   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/jury-enfant-culture.sheet.tsx \
 *     .cache/design-renders/jury-enfant-culture.png --dpr 1   (puis --dpr 2)
 *
 * Ordre de lecture voulu : d'abord les petites tailles sur un écran d'accueil de
 * tablette Android (le parc réel au Tchad), au soleil, en gris, en clignant des
 * yeux ; ensuite seulement la grande taille. Rien n'est redessiné : tout vient
 * des deux `concept.tsx`.
 */
import type { ReactElement, ReactNode } from 'react';

import { colors } from '../../src/design-system/tokens';
import * as A from './logo-ardoise/concept';
import * as B from './logo-elephanteau/concept';

type Concept = 'A' | 'B';

/**
 * Icônes VOISINES simulées (planche seulement, jamais dans l'app) : les teintes
 * des apps qu'une famille tchadienne a sur sa tablette — messagerie verte,
 * réseau bleu, vidéo rouge, clips noirs, deux opérateurs d'argent mobile
 * (rouge ; bleu à glyphe orange), jaune vif. Glyphes neutres, aucun logo copié.
 */
const VOISINES = {
  green: '#25c45a',
  blue: '#1877f2',
  red: '#ff2a2a',
  black: '#111111',
  sky: '#2aabee',
  operatorRed: '#e40014',
  operatorBlue: '#0b4ea2',
  orange: '#ff8a00',
  purple: '#7b2ff7',
  lime: '#58cc02',
  yellow: '#fffc00',
  white: '#ffffff',
  grey: '#3a3a3c',
} as const;

/** Fonds d'écran simulés : sombre, clair, et chaud (photo de sable : le pire cas pour un fond or). */
const WALLPAPERS = {
  sombre: 'linear-gradient(160deg,#1d2b44 0%,#24395c 55%,#141a2a 100%)',
  clair: 'linear-gradient(170deg,#dfe9f5 0%,#eef2f8 60%,#e7e2f1 100%)',
  chaud: 'linear-gradient(165deg,#e3b27a 0%,#c98a52 55%,#9a6038 100%)',
} as const;

// ------------------------------------------------------------- les icônes

/** Lanceur Android : calques de 108 dp, 72 dp visibles sous un masque rond. */
function AndroidIcon({ concept, size }: { concept: Concept; size: number }) {
  const layer = (size * 108) / 72;
  const inset = (layer - size) / 2;
  const abs = { position: 'absolute', left: 0, top: 0, lineHeight: 0 } as const;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        background: concept === 'B' ? B.ADAPTIVE_BACKGROUND : undefined,
        boxShadow: '0 1px 2px rgba(0,0,0,.25)',
      }}
    >
      <div style={{ position: 'absolute', left: -inset, top: -inset, width: layer, height: layer }}>
        {concept === 'A' ? (
          <>
            <div style={abs}>
              <A.EcolnaAdaptiveBackground size={layer} />
            </div>
            <div style={abs}>
              <A.EcolnaAdaptiveForeground size={layer} />
            </div>
          </>
        ) : (
          <div style={abs}>
            <B.EcolnaAdaptiveForeground size={layer} />
          </div>
        )}
      </div>
    </div>
  );
}

/** Écusson iOS (coins ≈ 22,37 %), source plein cadre. */
function IosIcon({ concept, size }: { concept: Concept; size: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '22.37%',
        overflow: 'hidden',
        lineHeight: 0,
        flexShrink: 0,
        boxShadow: '0 1px 2px rgba(0,0,0,.18)',
      }}
    >
      {concept === 'A' ? <A.EcolnaAppIcon size={size} /> : <B.EcolnaAppIcon size={size} />}
    </div>
  );
}

/** Icône à thème Android 13+ : le système teinte le calque monochrome. */
function ThemedIcon({ concept, size, bg, fg }: { concept: Concept; size: number; bg: string; fg: string }) {
  const layer = (size * 108) / 72;
  const inset = (layer - size) / 2;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', position: 'relative', background: bg, flexShrink: 0 }}>
      <div style={{ position: 'absolute', left: -inset, top: -inset, lineHeight: 0 }}>
        {concept === 'A' ? (
          <A.EcolnaAdaptiveMonochrome size={layer} color={fg} />
        ) : (
          <B.EcolnaAdaptiveMonochrome size={layer} color={fg} />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------- écran d'accueil

type Glyph = 'bubble' | 'play' | 'square' | 'note' | 'phone' | 'coin' | 'wave' | 'grid' | 'ring' | 'star' | 'camera' | 'sun' | 'dots' | 'bolt';
type Slot = { name: string; bg: string; fg: string; glyph: Glyph } | 'ecolna';

const HOME: Slot[] = [
  { name: 'Messages', bg: VOISINES.green, fg: VOISINES.white, glyph: 'bubble' },
  { name: 'Vidéos', bg: VOISINES.red, fg: VOISINES.white, glyph: 'play' },
  { name: 'Réseau', bg: VOISINES.blue, fg: VOISINES.white, glyph: 'square' },
  { name: 'Clips', bg: VOISINES.black, fg: VOISINES.white, glyph: 'note' },
  { name: 'Appels', bg: VOISINES.sky, fg: VOISINES.white, glyph: 'phone' },
  { name: 'Argent', bg: VOISINES.operatorRed, fg: VOISINES.white, glyph: 'coin' },
  { name: 'Mobile', bg: VOISINES.operatorBlue, fg: VOISINES.orange, glyph: 'wave' },
  'ecolna',
  { name: 'Jeux', bg: VOISINES.purple, fg: VOISINES.white, glyph: 'grid' },
  { name: 'Snaps', bg: VOISINES.yellow, fg: VOISINES.black, glyph: 'ring' },
  { name: 'Langues', bg: VOISINES.lime, fg: VOISINES.white, glyph: 'star' },
  { name: 'Caméra', bg: VOISINES.grey, fg: VOISINES.white, glyph: 'camera' },
  { name: 'Météo', bg: VOISINES.orange, fg: VOISINES.white, glyph: 'sun' },
  { name: 'Photos', bg: VOISINES.white, fg: VOISINES.blue, glyph: 'dots' },
  { name: 'Énergie', bg: VOISINES.white, fg: VOISINES.red, glyph: 'bolt' },
];

function PlaceholderGlyph({ glyph, fg }: { glyph: Glyph; fg: string }) {
  const s = { fill: fg } as const;
  const t = { fill: 'none', stroke: fg, strokeWidth: 7, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
  switch (glyph) {
    case 'bubble':
      return <path d="M30 24h40a10 10 0 0 1 10 10v22a10 10 0 0 1-10 10H48l-14 12v-12h-4a10 10 0 0 1-10-10V34a10 10 0 0 1 10-10z" {...s} />;
    case 'play':
      return <path d="M40 30l30 20-30 20z" {...s} stroke={fg} strokeWidth={8} strokeLinejoin="round" />;
    case 'square':
      return <rect x={30} y={30} width={40} height={40} rx={8} {...s} />;
    case 'note':
      return (
        <>
          <path d="M44 66V30l26-6v36" {...t} />
          <circle cx={38} cy={66} r={8} {...s} />
          <circle cx={64} cy={60} r={8} {...s} />
        </>
      );
    case 'phone':
      return <path d="M34 26l10 0 5 13-7 5a30 30 0 0 0 14 14l5-7 13 5 0 10a6 6 0 0 1-6 6A44 44 0 0 1 28 32a6 6 0 0 1 6-6z" {...s} />;
    case 'coin':
      return (
        <>
          <circle cx={50} cy={50} r={22} {...t} />
          <path d="M50 38v24M43 44h11a5 5 0 0 1 0 10H45" {...t} strokeWidth={5} />
        </>
      );
    case 'wave':
      return <path d="M24 56c8-14 16-14 26 0s18 14 26 0" {...t} strokeWidth={9} />;
    case 'grid':
      return (
        <>
          <rect x={28} y={28} width={18} height={18} rx={5} {...s} />
          <rect x={54} y={28} width={18} height={18} rx={5} {...s} />
          <rect x={28} y={54} width={18} height={18} rx={5} {...s} />
          <rect x={54} y={54} width={18} height={18} rx={9} {...s} />
        </>
      );
    case 'ring':
      return <circle cx={50} cy={50} r={20} {...t} />;
    case 'star':
      return <path d="M50 24l7.6 16.4 17.9 2.1-13.2 12.2 3.5 17.7L50 63.5l-15.8 8.9 3.5-17.7-13.2-12.2 17.9-2.1z" {...s} />;
    case 'camera':
      return (
        <>
          <rect x={22} y={34} width={56} height={38} rx={9} {...s} />
          <rect x={38} y={26} width={24} height={12} rx={4} {...s} />
        </>
      );
    case 'sun':
      return (
        <>
          <circle cx={50} cy={50} r={14} {...s} />
          <path d="M50 22v6M50 72v6M22 50h6M72 50h6M30 30l4 4M66 66l4 4M30 70l4-4M66 34l4-4" {...t} strokeWidth={5} />
        </>
      );
    case 'dots':
      return (
        <>
          <circle cx={38} cy={38} r={8} {...s} />
          <circle cx={62} cy={38} r={8} {...s} />
          <circle cx={38} cy={62} r={8} {...s} />
          <circle cx={62} cy={62} r={8} {...s} />
        </>
      );
    case 'bolt':
      return <path d="M54 22L32 54h16l-4 24 24-34H52z" {...s} stroke={fg} strokeWidth={3} strokeLinejoin="round" />;
  }
}

function Placeholder({ size, bg, fg, glyph, round }: { size: number; bg: string; fg: string; glyph: Glyph; round: boolean }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: round ? '50%' : '22.37%',
        overflow: 'hidden',
        lineHeight: 0,
        flexShrink: 0,
        boxShadow: '0 1px 2px rgba(0,0,0,.25)',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ background: bg }}>
        <PlaceholderGlyph glyph={glyph} fg={fg} />
      </svg>
    </div>
  );
}

function HomeScreen({
  concept,
  size,
  wallpaper,
  round = true,
  glare = false,
  dark = true,
}: {
  concept: Concept;
  size: number;
  wallpaper: keyof typeof WALLPAPERS;
  round?: boolean;
  glare?: boolean;
  dark?: boolean;
}) {
  const gap = Math.round(size * 0.62);
  const label = Math.max(9, Math.round(size * 0.19));
  return (
    <div
      style={{
        position: 'relative',
        padding: `${Math.round(size * 0.4)}px ${Math.round(size * 0.5)}px ${Math.round(size * 0.3)}px`,
        borderRadius: 22,
        background: WALLPAPERS[wallpaper],
        display: 'grid',
        gridTemplateColumns: `repeat(5, ${size}px)`,
        columnGap: gap,
        rowGap: Math.round(size * 0.28),
        overflow: 'hidden',
      }}
    >
      {HOME.map((slot, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          {slot === 'ecolna' ? (
            round ? (
              <AndroidIcon concept={concept} size={size} />
            ) : (
              <IosIcon concept={concept} size={size} />
            )
          ) : (
            <Placeholder size={size} bg={slot.bg} fg={slot.fg} glyph={slot.glyph} round={round} />
          )}
          <span
            style={{
              color: dark ? '#ffffff' : '#161a32',
              fontSize: label,
              lineHeight: `${label + 2}px`,
              fontFamily: 'system-ui, sans-serif',
              textShadow: dark ? '0 1px 2px rgba(0,0,0,.5)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {slot === 'ecolna' ? 'ECOLNA' : slot.name}
          </span>
        </div>
      ))}
      {glare ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(120deg,rgba(255,255,255,.62) 0%,rgba(255,255,255,.42) 45%,rgba(255,255,255,.5) 100%)',
          }}
        />
      ) : null}
    </div>
  );
}

/** Liste « Réglages > Applications » : la vraie taille 29 px, entre deux voisines. */
function SettingsList({ concept }: { concept: Concept }) {
  const rows: { name: string; node: ReactElement }[] = [
    { name: 'Messages', node: <Placeholder size={29} bg={VOISINES.green} fg={VOISINES.white} glyph="bubble" round={false} /> },
    { name: 'ECOLNA', node: <IosIcon concept={concept} size={29} /> },
    { name: 'Argent', node: <Placeholder size={29} bg={VOISINES.operatorRed} fg={VOISINES.white} glyph="coin" round={false} /> },
    { name: 'ECOLNA (rond, Android)', node: <AndroidIcon concept={concept} size={29} /> },
    { name: 'Snaps', node: <Placeholder size={29} bg={VOISINES.yellow} fg={VOISINES.black} glyph="ring" round={false} /> },
  ];
  return (
    <div style={{ width: 300, background: '#ffffff', borderRadius: 12, padding: '4px 0' }}>
      {rows.map((r) => (
        <div
          key={r.name}
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 14px', borderBottom: '1px solid #ececf1' }}
        >
          {r.node}
          <span style={{ fontSize: 15, fontFamily: 'system-ui, sans-serif', color: '#161a32' }}>{r.name}</span>
        </div>
      ))}
    </div>
  );
}

/** Une rangée d'éléments espacés (la case est en flex centré). */
function Row({ gap, children }: { gap: number; children: ReactNode }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap }}>{children}</div>;
}

/** Une paire A | B avec une étiquette au-dessus de chacun. */
function Pair({ a, b, gap = 36 }: { a: ReactNode; b: ReactNode; gap?: number }) {
  const tag = (t: string) => (
    <div style={{ fontSize: 13, fontWeight: 700, color: '#50453b', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', marginBottom: 6 }}>
      {t}
    </div>
  );
  return (
    <Row gap={gap}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {tag('A — ardoise')}
        {a}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {tag('B — éléphanteau')}
        {b}
      </div>
    </Row>
  );
}

/** « Clignement » : le flou d'un regard rapide à bout de bras. Ce qui survit, c'est l'idée. */
function Squint({ children, px }: { children: ReactNode; px: number }) {
  return <div style={{ filter: `blur(${px}px)`, lineHeight: 0 }}>{children}</div>;
}

const SIZES = [60, 40, 29] as const;

const sheet = {
  width: 1440,
  title: 'Jury enfant / culture — A « ardoise à la boucle » contre B « éléphanteau-livre »',
  subtitle:
    'Mêmes écrans, mêmes places, mêmes voisines. Petites tailles d’abord (tablette Android, soleil, gris, coup d’œil), grande taille ensuite.',
  sections: [
    {
      title: '1. Écran d’accueil de tablette Android (masque rond) — 60 px, fond sombre',
      note: 'ECOLNA au centre, entre deux opérateurs d’argent mobile et un jeu. Est-ce qu’un enfant de 5 ans le trouve, et le nomme ?',
      cellWidth: 672,
      cellHeight: 420,
      cells: [
        { label: 'A — ardoise', node: <HomeScreen concept="A" size={60} wallpaper="sombre" /> },
        { label: 'B — éléphanteau', node: <HomeScreen concept="B" size={60} wallpaper="sombre" /> },
      ],
    },
    {
      title: '2. Même écran — fond d’écran chaud (photo de sable, de terre) : le pire cas pour un fond or',
      cellWidth: 672,
      cellHeight: 420,
      cells: [
        { label: 'A — ardoise', node: <HomeScreen concept="A" size={60} wallpaper="chaud" /> },
        { label: 'B — éléphanteau', node: <HomeScreen concept="B" size={60} wallpaper="chaud" /> },
      ],
    },
    {
      title: '3. Plein soleil (voile blanc 42–62 %) — tablette chargée et utilisée dehors',
      cellWidth: 672,
      cellHeight: 420,
      cells: [
        { label: 'A — ardoise, au soleil', node: <HomeScreen concept="A" size={60} wallpaper="sombre" glare /> },
        { label: 'B — éléphanteau, au soleil', node: <HomeScreen concept="B" size={60} wallpaper="sombre" glare /> },
      ],
    },
    {
      title: '4. Niveaux de gris — même écran',
      cellWidth: 672,
      cellHeight: 420,
      grayscale: true,
      cells: [
        { label: 'A — gris', node: <HomeScreen concept="A" size={60} wallpaper="sombre" /> },
        { label: 'B — gris', node: <HomeScreen concept="B" size={60} wallpaper="sombre" /> },
      ],
    },
    {
      title: '5. Grille dense de tablette — 40 px, fond clair (écusson iOS / iPad)',
      cellWidth: 672,
      cellHeight: 300,
      cells: [
        { label: 'A — 40 px', node: <HomeScreen concept="A" size={40} wallpaper="clair" round={false} dark={false} /> },
        { label: 'B — 40 px', node: <HomeScreen concept="B" size={40} wallpaper="clair" round={false} dark={false} /> },
      ],
    },
    {
      title: '6. 29 px — liste Réglages / Applications (iOS écusson, Android rond)',
      cellWidth: 672,
      cellHeight: 250,
      background: '#f2f2f7',
      cells: [
        { label: 'A — 29 px', node: <SettingsList concept="A" /> },
        { label: 'B — 29 px', node: <SettingsList concept="B" /> },
      ],
    },
    {
      title: '7. Coup d’œil (flou 1,2 px à 60 px, 0,8 px à 40 px) — ce qui reste quand on ne regarde pas vraiment',
      note: 'Un enfant de 5 ans balaie l’écran : il retient une masse, une couleur, un objet. Lequel ?',
      cellWidth: 672,
      cellHeight: 200,
      cells: [
        {
          label: '60 px puis 40 px, flous',
          node: (
            <Pair
              a={
                <Row gap={24}>
                  <Squint px={1.2}>
                    <AndroidIcon concept="A" size={60} />
                  </Squint>
                  <Squint px={0.8}>
                    <AndroidIcon concept="A" size={40} />
                  </Squint>
                </Row>
              }
              b={
                <Row gap={24}>
                  <Squint px={1.2}>
                    <AndroidIcon concept="B" size={60} />
                  </Squint>
                  <Squint px={0.8}>
                    <AndroidIcon concept="B" size={40} />
                  </Squint>
                </Row>
              }
            />
          ),
        },
        {
          label: 'les mêmes, nets',
          node: (
            <Pair
              a={
                <Row gap={24}>
                  <AndroidIcon concept="A" size={60} />
                  <AndroidIcon concept="A" size={40} />
                </Row>
              }
              b={
                <Row gap={24}>
                  <AndroidIcon concept="B" size={60} />
                  <AndroidIcon concept="B" size={40} />
                </Row>
              }
            />
          ),
        },
      ],
    },
    {
      title: '8. Côte à côte, taille réelle — 60 / 40 / 29 px (écusson iOS puis rond Android), fond sombre puis clair',
      cellWidth: 672,
      cellHeight: 170,
      cells: [
        ...(['iOS', 'Android'] as const).map((mask) => ({
          label: `${mask} — fond sombre`,
          background: colors.inverseSurface,
          node: (
            <Pair
              a={
                <Row gap={18}>
                  {SIZES.map((s) =>
                    mask === 'iOS' ? <IosIcon key={s} concept="A" size={s} /> : <AndroidIcon key={s} concept="A" size={s} />,
                  )}
                </Row>
              }
              b={
                <Row gap={18}>
                  {SIZES.map((s) =>
                    mask === 'iOS' ? <IosIcon key={s} concept="B" size={s} /> : <AndroidIcon key={s} concept="B" size={s} />,
                  )}
                </Row>
              }
            />
          ),
        })),
        ...(['iOS', 'Android'] as const).map((mask) => ({
          label: `${mask} — fond blanc`,
          background: '#ffffff',
          node: (
            <Pair
              a={
                <Row gap={18}>
                  {SIZES.map((s) =>
                    mask === 'iOS' ? <IosIcon key={s} concept="A" size={s} /> : <AndroidIcon key={s} concept="A" size={s} />,
                  )}
                </Row>
              }
              b={
                <Row gap={18}>
                  {SIZES.map((s) =>
                    mask === 'iOS' ? <IosIcon key={s} concept="B" size={s} /> : <AndroidIcon key={s} concept="B" size={s} />,
                  )}
                </Row>
              }
            />
          ),
        })),
      ],
    },
    {
      title: '9. Icônes à thème Android 13+ — 60 et 40 px (le système efface les couleurs)',
      cellWidth: 672,
      cellHeight: 170,
      background: colors.inverseSurface,
      cells: [
        {
          label: 'thème sombre',
          node: (
            <Pair
              a={
                <Row gap={18}>
                  <ThemedIcon concept="A" size={60} bg="#22313f" fg="#cfe5ff" />
                  <ThemedIcon concept="A" size={40} bg="#22313f" fg="#cfe5ff" />
                </Row>
              }
              b={
                <Row gap={18}>
                  <ThemedIcon concept="B" size={60} bg="#22313f" fg="#cfe5ff" />
                  <ThemedIcon concept="B" size={40} bg="#22313f" fg="#cfe5ff" />
                </Row>
              }
            />
          ),
        },
        {
          label: 'thème clair',
          node: (
            <Pair
              a={
                <Row gap={18}>
                  <ThemedIcon concept="A" size={60} bg="#d7e3f2" fg="#173451" />
                  <ThemedIcon concept="A" size={40} bg="#d7e3f2" fg="#173451" />
                </Row>
              }
              b={
                <Row gap={18}>
                  <ThemedIcon concept="B" size={60} bg="#d7e3f2" fg="#173451" />
                  <ThemedIcon concept="B" size={40} bg="#d7e3f2" fg="#173451" />
                </Row>
              }
            />
          ),
        },
      ],
    },
    {
      title: '10. Dans l’app — symbole seul sur ivoire et sable, 64 / 48 / 32 px (en-tête, à-propos)',
      cellWidth: 672,
      cellHeight: 150,
      cells: [
        {
          label: 'ivoire d’exercice',
          background: colors.exerciseBackground,
          node: (
            <Pair
              a={
                <Row gap={14}>
                  <A.EcolnaMark size={64} />
                  <A.EcolnaMark size={48} />
                  <A.EcolnaMark size={32} />
                </Row>
              }
              b={
                <Row gap={14}>
                  <B.EcolnaMark size={64} />
                  <B.EcolnaMark size={48} />
                  <B.EcolnaMark size={32} />
                </Row>
              }
            />
          ),
        },
        {
          label: 'sable',
          background: colors.primaryContainer,
          node: (
            <Pair
              a={
                <Row gap={14}>
                  <A.EcolnaMark size={64} />
                  <A.EcolnaMark size={48} />
                  <A.EcolnaMark size={32} />
                </Row>
              }
              b={
                <Row gap={14}>
                  <B.EcolnaMark size={64} />
                  <B.EcolnaMark size={48} />
                  <B.EcolnaMark size={32} />
                </Row>
              }
            />
          ),
        },
      ],
    },
    {
      title: '11. Grande taille — 400 px, écusson iOS (ce que voit le parent sur la fiche du store)',
      cellWidth: 672,
      cellHeight: 440,
      cells: [
        { label: 'A — ardoise à la boucle', node: <IosIcon concept="A" size={400} /> },
        { label: 'B — éléphanteau-livre', node: <IosIcon concept="B" size={400} /> },
      ],
    },
    {
      title: '12. Logotypes — horizontal (en-tête parent) et empilé (démarrage)',
      cellWidth: 672,
      cellHeight: 300,
      cells: [
        { label: 'A — horizontal', background: colors.exerciseBackground, node: <A.EcolnaLogo height={110} /> },
        { label: 'B — horizontal', background: colors.exerciseBackground, node: <B.EcolnaLogo height={110} /> },
        { label: 'A — empilé', background: '#ffffff', node: <A.EcolnaLogo height={260} layout="stacked" /> },
        { label: 'B — empilé', background: '#ffffff', node: <B.EcolnaLogo height={260} layout="stacked" /> },
      ],
    },
  ],
};

export default sheet;
