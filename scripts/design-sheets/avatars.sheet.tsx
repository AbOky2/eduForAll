/** @jsxRuntime automatic */
// Planche de contact des douze avatars (brief § 8, § 14.8).
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/avatars.sheet.tsx .cache/design-renders/avatars.png --dpr 2
import { renderToStaticMarkup } from 'react-dom/server';

import Svg, { G } from 'react-native-svg';

import {
  AVATAR_ART_IDS,
  AVATAR_CAST,
  AvatarHeadArt,
  AvatarSilhouette,
  EcolnaAvatar,
} from '../../src/design-system/avatars';
import { fr } from '../../src/localization/fr/strings';

const descriptions = (fr as unknown as { avatars?: { descriptions?: Record<string, string> } }).avatars?.descriptions ?? {};

/** Nombre d'éléments SVG dessinés (sans la racine) : budget § 15 ≤ 40. */
function countElements(node: React.ReactElement): number {
  const markup = renderToStaticMarkup(node);
  return (markup.match(/<(?!\/)[a-zA-Z]+/g) ?? []).length - 1;
}

const label = (id: string) => `${id.replace('avatar-', '')}. ${descriptions[id] ?? AVATAR_CAST.find((a) => a.id === id)?.hair}`;

const twelve = (size: number, extra: { expression?: 'calm' | 'joy'; backdrop?: boolean } = {}) =>
  AVATAR_ART_IDS.map((id) => ({
    label: size >= 160 ? label(id) : `n° ${id.replace('avatar-', '')}`,
    node: <EcolnaAvatar avatarId={id} size={size} {...extra} />,
  }));

/** Silhouette noire : tout ce qui est dessiné passe au noir (sans disque de fond). */
const black = (id: string, size: number) => (
  <div style={{ filter: 'brightness(0)', width: size, height: size, lineHeight: 0 }}>
    <EcolnaAvatar avatarId={id} size={size} backdrop={false} />
  </div>
);

const budget = AVATAR_ART_IDS.map((id) => {
  const full = countElements(<EcolnaAvatar avatarId={id} size={160} expression="joy" />);
  const calm = countElements(<EcolnaAvatar avatarId={id} size={160} />);
  const small = countElements(<EcolnaAvatar avatarId={id} size={40} />);
  return `${id.replace('avatar-', '')}: ${Math.max(full, calm)}/${small}`;
}).join('  ·  ');

/** Mode loupe : AVATAR_ZOOM=1,5,9 [AVATAR_ZOOM_SIZE=300] pour regarder quelques enfants en grand. */
const zoomIds = (process.env.AVATAR_ZOOM ?? '').split(',').filter(Boolean).map((n) => `avatar-${n}`);
const zoomSize = Number(process.env.AVATAR_ZOOM_SIZE ?? '300');
const zoomSheet = {
  title: `Loupe — ${zoomIds.join(', ')}`,
  width: 1500,
  sections: (['calm', 'joy'] as const).map((expression) => ({
    title: expression === 'calm' ? 'calme' : 'joie',
    cellWidth: zoomSize + 16,
    cellHeight: zoomSize + 8,
    cells: zoomIds.map((id) => ({ label: id, node: <EcolnaAvatar avatarId={id} size={zoomSize} expression={expression} /> })),
  })),
};

const fullSheet = {
  title: 'ECOLNA — les douze enfants (avatars v2)',
  subtitle: `Éléments SVG par avatar (complet/petit, budget ≤ 40) — ${budget}`,
  width: 1500,
  sections: [
    {
      title: '160 px — calme (défaut)',
      cellWidth: 220,
      cellHeight: 176,
      cells: twelve(160),
    },
    {
      title: '160 px — joie (réussite, sélection)',
      cellWidth: 220,
      cellHeight: 176,
      cells: twelve(160, { expression: 'joy' }),
    },
    {
      title: '96 px, taille réelle (1x)',
      cellWidth: 112,
      cellHeight: 112,
      cells: twelve(96),
    },
    {
      title: '56 px (tuile téléphone, détail réduit)',
      cellWidth: 72,
      cellHeight: 72,
      cells: twelve(56),
    },
    {
      title: '40 px (en-tête) — lisibilité à taille réelle',
      cellWidth: 56,
      cellHeight: 56,
      cells: twelve(40),
    },
    {
      title: 'Silhouettes noires à 40 px — toutes distinctes',
      cellWidth: 56,
      cellHeight: 56,
      cells: AVATAR_ART_IDS.map((id) => ({ label: id.replace('avatar-', ''), node: black(id, 40) })),
    },
    {
      title: 'Silhouettes noires à 96 px',
      cellWidth: 112,
      cellHeight: 112,
      cells: AVATAR_ART_IDS.map((id) => ({ label: id.replace('avatar-', ''), node: black(id, 96) })),
    },
    {
      title: 'Niveaux de gris, 96 px — six peaux distinctes',
      cellWidth: 112,
      cellHeight: 112,
      grayscale: true,
      cells: twelve(96),
    },
    {
      title: 'Niveaux de gris, 40 px',
      cellWidth: 56,
      cellHeight: 56,
      grayscale: true,
      cells: twelve(40),
    },
    {
      title: 'Sur ivoire #F4F1DE (écrans d’exercice), 96 px',
      cellWidth: 112,
      cellHeight: 112,
      background: '#F4F1DE',
      cells: twelve(96),
    },
    {
      title: 'Sur sable #d4a373, 96 px',
      cellWidth: 112,
      cellHeight: 112,
      background: '#d4a373',
      cells: twelve(96),
    },
    {
      title: 'Sans disque de fond (backdrop={false}), 96 px, sur ivoire',
      cellWidth: 112,
      cellHeight: 112,
      background: '#F4F1DE',
      cells: twelve(96, { backdrop: false }),
    },
    {
      title: 'AvatarSilhouette — la place vide du profil (blanc, ivoire, sable)',
      cellWidth: 176,
      cellHeight: 176,
      cells: [
        { label: '160 px sur blanc', node: <AvatarSilhouette size={160} /> },
        { label: '160 px sur ivoire', node: <AvatarSilhouette size={160} />, background: '#F4F1DE' },
        { label: '160 px sur sable', node: <AvatarSilhouette size={160} />, background: '#d4a373' },
        { label: '56 px', node: <AvatarSilhouette size={56} /> },
      ],
    },
    {
      title: 'AvatarHeadArt — la même tête, sans disque ni buste, pour les scènes (tête de 53 px)',
      cellWidth: 700,
      cellHeight: 120,
      cells: [
        {
          label: 'six têtes posées côte à côte (transform="translate(…) scale(0.8)"), calme et joie',
          node: (
            <Svg width={680} height={110} viewBox="0 0 680 110">
              {['avatar-2', 'avatar-6', 'avatar-5', 'avatar-8', 'avatar-9', 'avatar-12'].map((id, index) => (
                <G key={id} transform={`translate(${20 + index * 110} 6) scale(0.8)`}>
                  <AvatarHeadArt avatarId={id} expression={index % 2 ? 'joy' : 'calm'} />
                </G>
              ))}
            </Svg>
          ),
        },
      ],
    },
    {
      title: 'Construction — 480 px',
      cellWidth: 700,
      cellHeight: 500,
      cells: [
        { label: 'avatar-7 calme', node: <EcolnaAvatar avatarId="avatar-7" size={480} /> },
        { label: 'avatar-7 joie', node: <EcolnaAvatar avatarId="avatar-7" size={480} expression="joy" /> },
      ],
    },
  ],
};

export default zoomIds.length > 0 ? zoomSheet : fullSheet;
