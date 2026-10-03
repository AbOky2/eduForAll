/** @jsxRuntime automatic */
// Planche de contact des portraits v4 « Épure ».
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/avatars-v4.sheet.tsx .cache/design-renders/avatars-v4.png --dpr 2
import Svg, { Circle, ClipPath, Defs, G } from 'react-native-svg';

import { AVATAR_CAST } from '../../src/design-system/avatars/avatar-cast';
import {
  PORTRAIT_BACKDROPS,
  PortraitArt,
  type PortraitBackdrop,
  type PortraitExpression,
  type PortraitSpec,
} from '../../src/design-system/avatars/portrait';
import { fr } from '../../src/localization/fr/strings';

const descriptions = fr.avatars.descriptions as Record<string, string>;

/** Disques plus saturés (proposition de la veille « état de l'art »), pour comparer. */
const VIVID: Record<PortraitBackdrop, string> = {
  sky: '#9ad4ff',
  sun: '#ffd66b',
  sand: '#ffb59e',
  lavender: '#c8b8ff',
  mint: '#9ee3cb',
  rose: '#ffc9dd',
};

function Portrait({
  spec,
  backdrop,
  size,
  expression = 'calm',
  vivid = false,
}: {
  spec: PortraitSpec;
  backdrop: PortraitBackdrop;
  size: number;
  expression?: PortraitExpression;
  vivid?: boolean;
}) {
  const id = `c${Math.random().toString(36).slice(2)}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <ClipPath id={id}>
          <Circle cx={60} cy={60} r={60} />
        </ClipPath>
      </Defs>
      <G clipPath={`url(#${id})`}>
        <Circle cx={60} cy={60} r={60} fill={vivid ? VIVID[backdrop] : PORTRAIT_BACKDROPS[backdrop]} />
        <PortraitArt spec={spec} expression={expression} lod={size < 64 ? 'small' : 'full'} />
      </G>
    </Svg>
  );
}

const cast = AVATAR_CAST.map((art) => ({
  id: art.id,
  backdrop: art.backdrop as PortraitBackdrop,
  spec: {
    skin: art.skin,
    hair: art.hair,
    garment: art.garment,
    accessories: art.accessories,
    brow: art.brows,
    nose: art.nose,
  } as PortraitSpec,
}));

const row = (size: number, expression: PortraitExpression = 'calm', withLabel = false) =>
  cast.map((entry) => ({
    label: withLabel ? `${entry.id.replace('avatar-', '')}. ${descriptions[entry.id] ?? ''}` : entry.id.replace('avatar-', ''),
    node: <Portrait spec={entry.spec} backdrop={entry.backdrop} size={size} expression={expression} />,
  }));

const zoom = (process.env.AVATAR_ZOOM ?? '').split(',').filter(Boolean);

export default zoom.length
  ? {
      title: `Loupe v4 — ${zoom.join(', ')}`,
      width: 1500,
      sections: (['calm', 'joy'] as const).map((expression) => ({
        title: expression,
        cellWidth: 336,
        cellHeight: 330,
        cells: cast
          .filter((entry) => zoom.includes(entry.id.replace('avatar-', '')))
          .map((entry) => ({
            label: entry.id,
            node: <Portrait spec={entry.spec} backdrop={entry.backdrop} size={320} expression={expression} />,
          })),
      })),
    }
  : {
      title: 'ECOLNA — portraits v4 « Épure »',
      width: 1500,
      sections: [
        { title: '200 px — calme', cellWidth: 232, cellHeight: 216, background: '#ffffff', cells: row(200, 'calm', true) },
        { title: '200 px — joie', cellWidth: 232, cellHeight: 216, background: '#ffffff', cells: row(200, 'joy') },
        {
          title: '120 px — disques saturés (comparaison)',
          cellWidth: 136,
          cellHeight: 136,
          background: '#ffffff',
          cells: cast.map((entry) => ({
            label: entry.id.replace('avatar-', ''),
            node: <Portrait spec={entry.spec} backdrop={entry.backdrop} size={120} vivid />,
          })),
        },
        {
          title: '120 px — disques clairs',
          cellWidth: 136,
          cellHeight: 136,
          background: '#ffffff',
          cells: row(120),
        },
        { title: '96 px (taille réelle)', cellWidth: 112, cellHeight: 112, background: '#ffffff', cells: row(96) },
        { title: '64 px', cellWidth: 80, cellHeight: 80, background: '#ffffff', cells: row(64) },
        { title: '40 px (en-tête, détail réduit)', cellWidth: 56, cellHeight: 56, background: '#ffffff', cells: row(40) },
        { title: 'Niveaux de gris, 96 px', cellWidth: 112, cellHeight: 112, grayscale: true, background: '#ffffff', cells: row(96) },
      ],
    };
