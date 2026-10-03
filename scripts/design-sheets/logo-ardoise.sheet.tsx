/** @jsxRuntime automatic */
/**
 * Planche de la piste A — « L'ardoise à la boucle » (brief § 11.1, § 14.8).
 *
 *   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/logo-ardoise.sheet.tsx \
 *     .cache/design-renders/logo-ardoise.png --dpr 2     (et --dpr 1 : taille réelle)
 *
 * Tout ce qui est dessiné ici vient de `./logo-ardoise/concept` : la planche
 * ne redessine rien, elle pose les masques des plateformes et le contexte.
 */
import { Fragment, useId, type ReactElement } from 'react';
import Svg, { Circle, ClipPath, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text } from 'react-native-svg';

import { colors, illustration } from '../../src/design-system/tokens';
import {
  CANVAS,
  CHALK_LOOP_D,
  EcolnaAdaptiveBackground,
  EcolnaAdaptiveForeground,
  EcolnaAdaptiveMonochrome,
  EcolnaAppIcon,
  EcolnaLogo,
  EcolnaMark,
  EcolnaWordmark,
  SLATE_FACE,
  SLATE_TILT,
} from './logo-ardoise/concept';

const brand = illustration.brand;

/**
 * Icônes VOISINES de l'écran d'accueil simulé — pas des couleurs ECOLNA.
 * Elles imitent la saturation des apps qu'un parent tchadien a sur sa
 * tablette (messagerie verte, réseau bleu, vidéo rouge, appareil photo jaune,
 * fonds blancs…) pour juger si l'or ressort. Elles n'entrent jamais dans
 * l'app, d'où leur place ici et non dans les jetons.
 */
const NEIGHBOUR = {
  green: '#1fb85a',
  teal: '#0f9d76',
  blue: '#1a73e8',
  sky: '#2aa4f4',
  red: '#e8261c',
  coral: '#ff5a36',
  purple: '#7b3fe4',
  black: '#111111',
  yellow: '#ffd400',
  white: '#ffffff',
} as const;

// -------------------------------------------------------------- utilitaires

function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

/** Masque iOS continu : superellipse n = 5 (au rayon 22,37 % près sur la diagonale). */
function squircle(size: number, n = 5, steps = 128): string {
  const h = size / 2;
  const pts: string[] = [];
  for (let i = 0; i < steps; i += 1) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = h + h * Math.sign(c) * Math.abs(c) ** (2 / n);
    const y = h + h * Math.sign(s) * Math.abs(s) ** (2 / n);
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${pts.join('L')}Z`;
}
const SQUIRCLE_1024 = squircle(CANVAS);
const SQUIRCLE_60 = squircle(60);

/** Une rangée d'éléments, séparés par des blancs (la case est en flex). */
function Row({ gap, children }: { gap: number; children: ReactElement[] }) {
  const out: ReactElement[] = [];
  children.forEach((child, i) => {
    if (i > 0) {
      out.push(<Svg key={`g${i}`} width={gap} height={1} />);
    }
    out.push(<Fragment key={`c${i}`}>{child}</Fragment>);
  });
  return <>{out}</>;
}

// ------------------------------------------------------ icônes plateformes

function IosIcon({ size }: { size: number }) {
  const clip = useSvgId('ios');
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
      <Defs>
        <ClipPath id={clip}>
          <Path d={SQUIRCLE_1024} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${clip})`}>
        <EcolnaAppIcon size={CANVAS} />
      </G>
    </Svg>
  );
}

/** Lanceur Android : fond + premier plan, zone visible = les 72 dp centraux, masque rond. */
const VISIBLE = (CANVAS * 72) / 108;
const VISIBLE_O = (CANVAS - VISIBLE) / 2;
const ANDROID_VIEWBOX = `${VISIBLE_O.toFixed(1)} ${VISIBLE_O.toFixed(1)} ${VISIBLE.toFixed(1)} ${VISIBLE.toFixed(1)}`;

function AndroidIcon({ size }: { size: number }) {
  const clip = useSvgId('android');
  return (
    <Svg width={size} height={size} viewBox={ANDROID_VIEWBOX}>
      <Defs>
        <ClipPath id={clip}>
          <Circle cx={512} cy={512} r={VISIBLE / 2} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${clip})`}>
        <EcolnaAdaptiveBackground size={CANVAS} />
        <EcolnaAdaptiveForeground size={CANVAS} />
      </G>
    </Svg>
  );
}

/** Icône à thème Android 13+ : le calque monochrome teinté par le système. */
function ThemedIcon({ size, background, glyph }: { size: number; background: string; glyph: string }) {
  return (
    <Svg width={size} height={size} viewBox={ANDROID_VIEWBOX}>
      <Circle cx={512} cy={512} r={VISIBLE / 2} fill={background} />
      <EcolnaAdaptiveMonochrome size={CANVAS} color={glyph} />
    </Svg>
  );
}

// ---------------------------------------------------------- gabarit (héros)

function ConstructionDrawing({ size }: { size: number }) {
  const ink = illustration.ink;
  const chalk = brand.chalk;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
      <EcolnaAppIcon size={CANVAS} />
      {/* masque iOS, pour mémoire */}
      <Path d={SQUIRCLE_1024} fill="none" stroke={ink} strokeWidth={3} strokeDasharray="10 12" />
      {/* l'axe vertical du canevas et celui de l'ardoise : −6° */}
      <Line x1={512} y1={150} x2={512} y2={900} stroke={ink} strokeWidth={3} strokeDasharray="6 10" />
      <G transform={SLATE_TILT}>
        <Line x1={512} y1={150} x2={512} y2={874} stroke={chalk} strokeWidth={3} />
        <Line x1={96} y1={512} x2={928} y2={512} stroke={chalk} strokeWidth={3} strokeDasharray="6 10" />
        {/* épaisseur de craie de référence : 92 */}
        <Rect x={SLATE_FACE.x + 18} y={SLATE_FACE.y + SLATE_FACE.height - 110} width={92} height={92} rx={46} fill="none" stroke={chalk} strokeWidth={3} />
      </G>
      <Text x={548} y={196} fontSize={30} fontFamily="Plus Jakarta Sans" fontWeight="600" fill={ink}>
        −6°
      </Text>
      <Text x={84} y={96} fontSize={28} fontFamily="Plus Jakarta Sans" fontWeight="600" fill={ink}>
        cadre 752 × 564 · r 120 · face rentrée de 68 · r 60
      </Text>
      <Text x={84} y={950} fontSize={28} fontFamily="Plus Jakarta Sans" fontWeight="600" fill={ink}>
        craie 92 (9 %) · 80 → 102 · fond or, ΔL* 11,6 · 3 formes
      </Text>
    </Svg>
  );
}

/** Calque de premier plan seul, avec la zone sûre 66/108 et la zone visible 72/108. */
function AdaptiveSafeZone({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${CANVAS} ${CANVAS}`}>
      <Rect x={0} y={0} width={CANVAS} height={CANVAS} fill={colors.surfaceContainerLow} />
      <Circle cx={512} cy={512} r={VISIBLE / 2} fill={colors.surfaceContainerHigh} />
      <EcolnaAdaptiveForeground size={CANVAS} />
      <Circle cx={512} cy={512} r={(CANVAS * 66) / 108 / 2} fill="none" stroke={colors.secondary} strokeWidth={4} strokeDasharray="12 10" />
      <Text x={512} y={1000} fontSize={30} textAnchor="middle" fontFamily="Plus Jakarta Sans" fontWeight="600" fill={colors.onSurfaceVariant}>
        108 dp · visible 72 (gris) · sûr 66 (tirets)
      </Text>
    </Svg>
  );
}

// ------------------------------------------------- atelier : nœuds de la craie

type Seg = { kind: 'M' | 'C' | 'Z'; pts: [number, number][] };
function parseCubicPath(d: string): Seg[] {
  const tokens = d.match(/[MCZ]|-?\d+(?:\.\d+)?/g) ?? [];
  const segs: Seg[] = [];
  let i = 0;
  let kind: Seg['kind'] = 'M';
  while (i < tokens.length) {
    const t = tokens[i] ?? '';
    if (t === 'M' || t === 'C' || t === 'Z') {
      kind = t;
      i += 1;
      if (kind === 'Z') {
        segs.push({ kind, pts: [] });
      }
      continue;
    }
    const n = kind === 'C' ? 6 : 2;
    const v = tokens.slice(i, i + n).map(Number);
    i += n;
    const pts: [number, number][] = [];
    for (let k = 0; k + 1 < v.length; k += 2) {
      pts.push([v[k] ?? 0, v[k + 1] ?? 0]);
    }
    segs.push({ kind, pts });
  }
  return segs;
}

function ChalkWorkshop({ width }: { width: number }) {
  const segs = parseCubicPath(CHALK_LOOP_D);
  const marks: ReactElement[] = [];
  let last: [number, number] = [0, 0];
  segs.forEach((s, i) => {
    if (s.kind === 'M') {
      last = s.pts[0] ?? last;
    }
    if (s.kind === 'C' && s.pts.length === 3) {
      const [c1, c2, p] = s.pts as [[number, number], [number, number], [number, number]];
      marks.push(
        <G key={`s${i}`}>
          <Line x1={last[0]} y1={last[1]} x2={c1[0]} y2={c1[1]} stroke={colors.secondaryFixedDim} strokeWidth={1.2} />
          <Line x1={p[0]} y1={p[1]} x2={c2[0]} y2={c2[1]} stroke={colors.secondaryFixedDim} strokeWidth={1.2} />
          <Circle cx={c1[0]} cy={c1[1]} r={2.6} fill={colors.secondaryFixedDim} />
          <Circle cx={c2[0]} cy={c2[1]} r={2.6} fill={colors.secondaryFixedDim} />
          <Circle cx={p[0]} cy={p[1]} r={4.2} fill={brand.goldTop} stroke={brand.slate} strokeWidth={1.5} />
        </G>,
      );
      last = p;
    }
  });
  const vb = { x: 290, y: 325, w: 470, h: 375 };
  return (
    <Svg width={width} height={(width * vb.h) / vb.w} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}>
      <Rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill={brand.slate} />
      <Path d={CHALK_LOOP_D} fill={brand.chalk} />
      <Path d={CHALK_LOOP_D} fill="none" stroke={brand.goldBottom} strokeWidth={1.2} />
      {marks}
    </Svg>
  );
}

// ---------------------------------------------------------- écran d'accueil

type Glyph = 'ring' | 'disc' | 'square' | 'plus' | 'bars' | 'diamond' | 'triangle' | 'half' | 'dots';
type Slot = { color: string; glyph: Glyph; glyphColor: string; label: string } | 'ecolna';

const HOME: Slot[] = [
  { color: NEIGHBOUR.green, glyph: 'ring', glyphColor: NEIGHBOUR.white, label: 'Messages' },
  { color: NEIGHBOUR.blue, glyph: 'disc', glyphColor: NEIGHBOUR.white, label: 'Réseau' },
  { color: NEIGHBOUR.red, glyph: 'square', glyphColor: NEIGHBOUR.white, label: 'Vidéos' },
  { color: NEIGHBOUR.purple, glyph: 'plus', glyphColor: NEIGHBOUR.white, label: 'Musique' },
  { color: NEIGHBOUR.black, glyph: 'bars', glyphColor: NEIGHBOUR.white, label: 'Notes' },
  { color: NEIGHBOUR.white, glyph: 'dots', glyphColor: NEIGHBOUR.blue, label: 'Photos' },
  'ecolna',
  { color: NEIGHBOUR.yellow, glyph: 'diamond', glyphColor: NEIGHBOUR.white, label: 'Caméra' },
  { color: NEIGHBOUR.teal, glyph: 'half', glyphColor: NEIGHBOUR.white, label: 'Météo' },
  { color: NEIGHBOUR.sky, glyph: 'triangle', glyphColor: NEIGHBOUR.white, label: 'Cartes' },
  { color: NEIGHBOUR.coral, glyph: 'ring', glyphColor: NEIGHBOUR.white, label: 'Agenda' },
  { color: NEIGHBOUR.white, glyph: 'square', glyphColor: NEIGHBOUR.red, label: 'Banque' },
];

function GlyphShape({ glyph, color }: { glyph: Glyph; color: string }) {
  switch (glyph) {
    case 'ring':
      return <Circle cx={30} cy={30} r={13} fill="none" stroke={color} strokeWidth={6} />;
    case 'disc':
      return <Circle cx={30} cy={30} r={14} fill={color} />;
    case 'square':
      return <Rect x={17} y={17} width={26} height={26} rx={6} fill={color} />;
    case 'plus':
      return <Path d="M30 16V44M16 30H44" stroke={color} strokeWidth={7} strokeLinecap="round" />;
    case 'bars':
      return <Path d="M17 24H43M17 36H43" stroke={color} strokeWidth={6} strokeLinecap="round" />;
    case 'diamond':
      return <Path d="M30 17L43 30L30 43L17 30Z" fill={color} stroke={color} strokeWidth={4} strokeLinejoin="round" />;
    case 'triangle':
      return <Path d="M30 18L43 41H17Z" fill={color} stroke={color} strokeWidth={4} strokeLinejoin="round" />;
    case 'half':
      return <Path d="M15 36A15 15 0 0 1 45 36Z" fill={color} />;
    case 'dots':
      return (
        <G fill={color}>
          <Circle cx={22} cy={22} r={5} />
          <Circle cx={38} cy={22} r={5} />
          <Circle cx={22} cy={38} r={5} />
          <Circle cx={38} cy={38} r={5} />
        </G>
      );
  }
}

function HomeScreen({ dark }: { dark: boolean }) {
  // La planche rend chaque case à part : useId y repart de zéro, d'où un
  // préfixe propre à chaque variante pour que les deux dégradés ne se confondent pas.
  const wall = useSvgId(dark ? 'fond-ecran-sombre' : 'fond-ecran-clair');
  const W = 640;
  const H = 540;
  const pitchX = 140;
  const pitchY = 150;
  const x0 = (W - pitchX * 4) / 2 + (pitchX - 60) / 2;
  const y0 = 56;
  const label = dark ? illustration.white : illustration.ink;
  return (
    <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <Defs>
        <LinearGradient id={wall} x1="0" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor={dark ? illustration.fabric.indigo.shade : illustration.nature.skyCool} />
          <Stop offset="1" stopColor={dark ? illustration.fabric.night.shade : colors.surfaceContainer} />
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width={W} height={H} fill={`url(#${wall})`} />
      {HOME.map((slot, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = x0 + col * pitchX;
        const y = y0 + row * pitchY;
        const name = slot === 'ecolna' ? 'ECOLNA' : slot.label;
        return (
          <G key={i}>
            <G transform={`translate(${x} ${y})`}>
              {slot === 'ecolna' ? (
                <IosIcon size={60} />
              ) : (
                <>
                  <Path d={SQUIRCLE_60} fill={slot.color} />
                  <GlyphShape glyph={slot.glyph} color={slot.glyphColor} />
                </>
              )}
            </G>
            <Text x={x + 30} y={y + 82} fontSize={13} textAnchor="middle" fontFamily="Plus Jakarta Sans" fontWeight="600" fill={label}>
              {name}
            </Text>
          </G>
        );
      })}
    </Svg>
  );
}

// ----------------------------------------------------------------- planche

const BG = {
  white: colors.card,
  ivory: colors.exerciseBackground,
  sand: colors.primaryContainer,
  dark: colors.inverseSurface,
} as const;

const SIZES = [180, 60, 40, 29] as const;

function sizedCells(render: (size: number) => ReactElement, prefix: string, background?: string) {
  return SIZES.map((s) => ({
    label: `${prefix} ${s} px`,
    node: render(s),
    ...(background ? { background } : {}),
  }));
}

const sheet = {
  width: 1800,
  title: 'Marque — piste A « L’ardoise à la boucle »',
  subtitle:
    'Une ardoise d’écolier inclinée, cadre de bois, et une seule boucle de craie qui est aussi le « e » d’ecolna. « C’est l’ardoise de notre école. »',
  sections: [
    {
      title: 'Icône d’app 1024 — héros et gabarit',
      note: 'Plein cadre, opaque, sans coin arrondi. 3 formes sur un fond, 1 dégradé (le fond), rien de cuit : iOS pose son verre, Android son ombre.',
      cellWidth: 850,
      cellHeight: 850,
      cells: [
        { label: 'EcolnaAppIcon — source de app-icon.png et icon-512.png', node: <EcolnaAppIcon size={820} /> },
        { label: 'Gabarit : axe −6°, cadre 4:3, craie 92 (9 %), masque iOS en tirets', node: <ConstructionDrawing size={820} /> },
      ],
    },
    {
      title: 'Taille réelle — iOS, masque continu (superellipse, ≈ r 22,37 %)',
      note: 'À lire en --dpr 1 : 180 / 60 / 40 / 29 px, sur fond clair puis sur fond sombre.',
      cellWidth: 200,
      cellHeight: 200,
      cells: [...sizedCells((s) => <IosIcon size={s} />, 'iOS'), ...sizedCells((s) => <IosIcon size={s} />, 'iOS, fond sombre', BG.dark)],
    },
    {
      title: 'Taille réelle — Android, calques adaptatifs sous masque rond',
      note: 'Fond or + premier plan à l’échelle 0,70 (l’ardoise entière dans le cercle sûr de 66 dp) ; on voit les 72 dp centraux du calque de 108 dp.',
      cellWidth: 200,
      cellHeight: 200,
      cells: [
        ...sizedCells((s) => <AndroidIcon size={s} />, 'Android'),
        ...sizedCells((s) => <AndroidIcon size={s} />, 'Android, fond sombre', BG.dark),
      ],
    },
    {
      title: 'Monochrome — icônes à thème Android 13+ (calque dessiné à la main)',
      note: 'Anneau plein + boucle pleine, face vide ; séparation craie / cadre 35 px sur le calque (≥ 32). Jamais par la couleur seule.',
      cellWidth: 200,
      cellHeight: 200,
      cells: [
        ...sizedCells(
          (s) => <ThemedIcon size={s} background={colors.secondaryFixed} glyph={colors.onSecondaryContainer} />,
          'thème clair',
        ),
        ...sizedCells(
          (s) => <ThemedIcon size={s} background={colors.inverseSurface} glyph={colors.secondaryFixedDim} />,
          'thème sombre',
          BG.dark,
        ),
      ],
    },
    {
      title: 'Niveaux de gris — lisibilité au soleil',
      note: 'Quatre paliers de luminance : or (L* 77–88), bois (45), ardoise (23), craie (96).',
      cellWidth: 200,
      cellHeight: 200,
      grayscale: true,
      cells: [...sizedCells((s) => <IosIcon size={s} />, 'iOS'), ...sizedCells((s) => <AndroidIcon size={s} />, 'Android')],
    },
    {
      title: 'Symbole seul — EcolnaMark, couleur et mono (160 / 96 / 64 / 40 / 32 / 24 dp)',
      note: 'Sur blanc, ivoire d’exercice et sable : le cadre de bois détache l’ardoise du fond, sans contour ajouté.',
      cellWidth: 560,
      cellHeight: 200,
      cells: (['white', 'ivory', 'sand'] as const).flatMap((bg) => [
        {
          label: `couleur — fond ${bg === 'white' ? 'blanc' : bg === 'ivory' ? 'ivoire' : 'sable'}`,
          background: BG[bg],
          node: (
            <Row gap={10}>
              {[160, 96, 64, 40, 32, 24].map((s) => (
                <EcolnaMark key={s} size={s} />
              ))}
            </Row>
          ),
        },
      ]).concat(
        (['white', 'ivory', 'sand'] as const).map((bg) => ({
          label: `mono — fond ${bg === 'white' ? 'blanc' : bg === 'ivory' ? 'ivoire' : 'sable'}`,
          background: BG[bg],
          node: (
            <Row gap={10}>
              {[160, 96, 64, 40, 32, 24].map((s) => (
                <EcolnaMark key={s} size={s} tone="mono" />
              ))}
            </Row>
          ),
        })),
      ),
    },
    {
      title: 'Mot-symbole — « ecolna », Quicksand Bold épaissi (fût / hauteur d’x 0,30), le « e » est la boucle de craie',
      note: 'Chemins, jamais du texte vivant. Encre brune. Sous ≈ 96 dp de large, on passe au symbole seul.',
      cellWidth: 850,
      cellHeight: 220,
      cells: [
        { label: 'fond blanc — 140 dp', background: BG.white, node: <EcolnaWordmark height={140} /> },
        { label: 'fond ivoire — 140 dp', background: BG.ivory, node: <EcolnaWordmark height={140} /> },
        { label: 'fond sable — 140 dp', background: BG.sand, node: <EcolnaWordmark height={140} /> },
        {
          label: '48 / 32 / 24 / 18 dp',
          background: BG.white,
          node: (
            <Row gap={18}>
              {[48, 32, 24, 18].map((h) => (
                <EcolnaWordmark key={h} height={h} />
              ))}
            </Row>
          ),
        },
      ],
    },
    {
      title: 'Logotypes — horizontal et empilé',
      cellWidth: 850,
      cellHeight: 340,
      cells: [
        { label: 'horizontal — fond blanc', background: BG.white, node: <EcolnaLogo height={140} /> },
        { label: 'empilé — fond blanc', background: BG.white, node: <EcolnaLogo height={290} layout="stacked" /> },
        { label: 'horizontal — fond ivoire', background: BG.ivory, node: <EcolnaLogo height={140} /> },
        { label: 'empilé — fond sable', background: BG.sand, node: <EcolnaLogo height={290} layout="stacked" /> },
      ],
    },
    {
      title: 'Écran d’accueil — l’icône à 60 px parmi 11 icônes voisines',
      note: 'Voisines neutres (formes géométriques, aucun logo copié) aux couleurs saturées des plateformes, dont un jaune à côté de l’or.',
      cellWidth: 850,
      cellHeight: 560,
      cells: [
        { label: 'fond d’écran sombre', node: <HomeScreen dark /> },
        { label: 'fond d’écran clair', node: <HomeScreen dark={false} /> },
      ],
    },
    {
      title: 'Atelier — calques adaptatifs et contour de la craie',
      note: 'Contour plein : 2 contours, 18 cubiques, nœuds aux seuls extrema, une décimale au plus. Épaisseur 80 → 102.',
      cellWidth: 850,
      cellHeight: 640,
      cells: [
        { label: 'premier plan adaptatif (échelle 0,70) dans la zone sûre', node: <AdaptiveSafeZone size={620} /> },
        { label: 'la boucle de craie, nœuds (or) et poignées (bleu)', node: <ChalkWorkshop width={790} /> },
        {
          label: 'calque monochrome seul (alpha), échelle 0,70',
          background: BG.dark,
          node: <EcolnaAdaptiveMonochrome size={620} />,
        },
        {
          label: 'symbole mono, encre brune',
          background: BG.white,
          node: <EcolnaMark size={560} tone="mono" />,
        },
      ],
    },
  ],
};

export default sheet;
