/** @jsxRuntime automatic */
// Planche de contact des portraits v4 « Épure ».
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/avatars-v4.sheet.tsx .cache/design-renders/avatars-v4.png --dpr 2
//   AVATAR_ZOOM=2,7,12 … : la loupe sur quelques enfants, à 320 px.
import { useId } from 'react';
import Svg, { Circle, ClipPath, Defs, G, Path } from 'react-native-svg';

import { AVATAR_CAST, type AvatarArt } from '../../src/design-system/avatars/avatar-cast';
import {
  PORTRAIT_BACKDROPS,
  PORTRAIT_HEADS,
  PortraitArt,
  type PortraitBackdrop,
  type PortraitExpression,
  type PortraitHeadShape,
  type PortraitSpec,
} from '../../src/design-system/avatars/portrait';
import { fr } from '../../src/localization/fr/strings';

const descriptions = fr.avatars.descriptions as Record<string, string>;

function Portrait({
  spec,
  backdrop,
  size,
  expression = 'calm',
}: {
  spec: PortraitSpec;
  backdrop: PortraitBackdrop;
  size: number;
  expression?: PortraitExpression;
}) {
  const id = `c${useId().replace(/[^A-Za-z0-9_-]/g, '')}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <ClipPath id={id}>
          <Circle cx={60} cy={60} r={60} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${id})`}>
        <Circle cx={60} cy={60} r={60} fill={PORTRAIT_BACKDROPS[backdrop]} />
        <PortraitArt spec={spec} expression={expression} lod={size < 64 ? 'small' : 'full'} />
      </G>
    </Svg>
  );
}

const specOf = (art: AvatarArt): PortraitSpec => ({
  skin: art.skin,
  head: art.head,
  eyes: art.eyes,
  mouth: art.mouth,
  hair: art.hair,
  garment: art.garment,
  accessories: art.accessories,
  brow: art.brows,
  nose: art.nose,
});

const cast = AVATAR_CAST.map((art) => ({ id: art.id, art, backdrop: art.backdrop as PortraitBackdrop, spec: specOf(art) }));

const HEAD_NAMES: Record<PortraitHeadShape, string> = {
  oval: 'ovale',
  round: 'ronde',
  long: 'longue',
  cheeky: 'joufflue',
};
const EYE_NAMES = { round: 'yeux ronds', almond: 'en amande', wide: 'grands yeux' } as const;
const MOUTH_NAMES = { smile: 'sourire', small: 'petit sourire', crescent: 'croissant' } as const;
const faceOf = (art: AvatarArt) => `${HEAD_NAMES[art.head]} · ${EYE_NAMES[art.eyes]} · ${MOUTH_NAMES[art.mouth]}`;

const row = (size: number, expression: PortraitExpression = 'calm', label: 'number' | 'face' | 'full' = 'number') =>
  cast.map((entry) => ({
    label:
      label === 'full'
        ? `${entry.id.replace('avatar-', '')}. ${descriptions[entry.id] ?? ''}`
        : label === 'face'
          ? `${entry.id.replace('avatar-', '')}. ${faceOf(entry.art)}`
          : entry.id.replace('avatar-', ''),
    node: <Portrait spec={entry.spec} backdrop={entry.backdrop} size={size} expression={expression} />,
  }));

/** Les quatre têtes nues, puis superposées : la forme seule, sans coiffure ni traits. */
const HEAD_TINT: Record<PortraitHeadShape, string> = {
  oval: '#3b63f0',
  round: '#f2643f',
  long: '#148a5c',
  cheeky: '#7c5cf2',
};
const shapes = Object.keys(PORTRAIT_HEADS) as PortraitHeadShape[];
const headCells = [
  ...shapes.map((shape) => ({
    label: HEAD_NAMES[shape],
    node: (
      <Svg width={180} height={180} viewBox="20 18 80 80">
        <Path d={PORTRAIT_HEADS[shape].ears} fill={HEAD_TINT[shape]} opacity={0.55} />
        <Path d={PORTRAIT_HEADS[shape].d} fill={HEAD_TINT[shape]} />
      </Svg>
    ),
  })),
  {
    label: 'superposées',
    node: (
      <Svg width={180} height={180} viewBox="20 18 80 80">
        {shapes.map((shape) => (
          <Path key={shape} d={PORTRAIT_HEADS[shape].d} stroke={HEAD_TINT[shape]} strokeWidth={0.7} fill="none" />
        ))}
      </Svg>
    ),
  },
];

const zoom = (process.env.AVATAR_ZOOM ?? '').split(',').filter(Boolean);

export default zoom.length
  ? {
      title: `Loupe v4 — ${zoom.join(', ')}`,
      width: 1500,
      sections: (['calm', 'joy'] as const).map((expression) => ({
        title: expression === 'calm' ? 'calme' : 'joie',
        cellWidth: 336,
        cellHeight: 330,
        cells: cast
          .filter((entry) => zoom.includes(entry.id.replace('avatar-', '')))
          .map((entry) => ({
            label: `${entry.id} — ${faceOf(entry.art)}`,
            node: <Portrait spec={entry.spec} backdrop={entry.backdrop} size={320} expression={expression} />,
          })),
      })),
    }
  : {
      title: 'ECOLNA — portraits v4 « Épure »',
      subtitle: 'Quatre têtes, trois regards, trois bouches : deux voisins de la grille n’ont jamais la même tête.',
      width: 1500,
      sections: [
        { title: 'Les quatre têtes (repère 120)', cellWidth: 196, cellHeight: 196, background: '#ffffff', cells: headCells },
        {
          title: 'Grille de création, 4 colonnes — 120 dp, calme',
          cellWidth: 300,
          cellHeight: 150,
          background: '#f6f7fb',
          cells: row(120, 'calm', 'face'),
        },
        {
          title: 'Grille de création, 4 colonnes — 120 dp, joie (sélection)',
          cellWidth: 300,
          cellHeight: 150,
          background: '#f6f7fb',
          cells: row(120, 'joy'),
        },
        { title: '200 px — calme', cellWidth: 232, cellHeight: 216, background: '#ffffff', cells: row(200, 'calm', 'full') },
        { title: '200 px — joie', cellWidth: 232, cellHeight: 216, background: '#ffffff', cells: row(200, 'joy') },
        { title: '96 px (taille réelle)', cellWidth: 112, cellHeight: 112, background: '#ffffff', cells: row(96) },
        { title: '64 px', cellWidth: 80, cellHeight: 80, background: '#ffffff', cells: row(64) },
        { title: '48 dp — calme (détail réduit)', cellWidth: 100, cellHeight: 64, background: '#ffffff', cells: row(48) },
        { title: '48 dp — joie', cellWidth: 100, cellHeight: 64, background: '#ffffff', cells: row(48, 'joy') },
        { title: '40 px (en-tête, détail réduit)', cellWidth: 56, cellHeight: 56, background: '#ffffff', cells: row(40) },
        { title: 'Niveaux de gris, 96 px', cellWidth: 112, cellHeight: 112, grayscale: true, background: '#ffffff', cells: row(96) },
      ],
    };
