/** @jsxRuntime automatic */
// Planche de critique n° 1 de la direction artistique (avatars). Ne fait que
// REGARDER les fichiers de l'équipe : aucune pièce n'est modifiée ici.
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/critique-avatars.sheet.tsx .cache/design-renders/avatars-critique1-da.png --dpr 1
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { AVATAR_ART_IDS, AvatarHeadArt, EcolnaAvatar } from '../../src/design-system/avatars';
import { colors, skinTones } from '../../src/design-system/tokens';

// Copies des chaînes de l'équipe (non exportées) pour isoler le défaut.
const TEAM_LOWER_LIDS_CALM_D =
  'M42.5 58.5A5.5 6.5 0 0 0 53.5 58.5A5.5 6.5 0 0 1 42.5 58.5ZM66.5 58.5A5.5 6.5 0 0 0 77.5 58.5A5.5 6.5 0 0 1 66.5 58.5Z';
const EYES_CALM_D =
  'M42.5 58A5.5 6.5 0 1 1 53.5 58A5.5 6.5 0 1 1 42.5 58ZM66.5 58A5.5 6.5 0 1 1 77.5 58A5.5 6.5 0 1 1 66.5 58Z';
// Proposition DA : ellipse plus basse et plus grande, posée SOUS l'œil.
const DA_LOWER_LIDS_CALM_D =
  'M42 59A6 7 0 1 0 54 59A6 7 0 1 0 42 59ZM66 59A6 7 0 1 0 78 59A6 7 0 1 0 66 59Z';

const crop = (id: string, viewBox: string, w: number, h: number, expression: 'calm' | 'joy' = 'calm') => (
  <Svg width={w} height={h} viewBox={viewBox}>
    <Rect x={0} y={0} width={120} height={120} fill="#ffffff" />
    <AvatarHeadArt avatarId={id} expression={expression} lod="full" />
  </Svg>
);

const black = (id: string, size: number, backdrop = false) => (
  <div style={{ filter: 'brightness(0)', width: size, height: size, lineHeight: 0 }}>
    <EcolnaAvatar avatarId={id} size={size} backdrop={backdrop} />
  </div>
);

const swatchRow = (name: keyof typeof skinTones) => {
  const s = skinTones[name];
  const order: [string, string][] = [
    ['light', s.light],
    ['base', s.base],
    ['bounce', s.bounce],
    ['shade', s.shade],
    ['blush', s.blush],
    ['lip', s.lip],
  ];
  return (
    <Svg width={300} height={50} viewBox="0 0 300 50">
      {order.map(([key, fill], i) => (
        <Rect key={key} x={i * 50} y={0} width={50} height={50} fill={fill} />
      ))}
    </Svg>
  );
};

const mode = process.env.CRIT ?? 'all';

const sections = [
  {
    title: '1 · Croissant de paupière inférieure (peaux foncées, calme) — défaut isolé',
    cellWidth: 340,
    cellHeight: 170,
    cells: [
      { label: 'avatar-6 calme, yeux ×7 (équipe)', node: crop('avatar-6', '36 46 48 24', 336, 168) },
      { label: 'avatar-6 joie, yeux ×7 (équipe)', node: crop('avatar-6', '36 46 48 24', 336, 168, 'joy') },
      {
        label: 'LOWER_LIDS_CALM_D seul (rouge) : surface nulle',
        node: (
          <Svg width={336} height={168} viewBox="36 46 48 24">
            <Rect x={36} y={46} width={48} height={24} fill="#ffffff" />
            <Path d={EYES_CALM_D} fill="none" stroke="#999999" strokeWidth={0.3} />
            <Path d={TEAM_LOWER_LIDS_CALM_D} fill="#ff0000" />
          </Svg>
        ),
      },
      {
        label: 'proposition DA (light sous l’œil), ebene',
        node: (
          <Svg width={336} height={168} viewBox="36 46 48 24">
            <Rect x={36} y={46} width={48} height={24} fill={skinTones.ebene.base} />
            <Path d={DA_LOWER_LIDS_CALM_D} fill={skinTones.ebene.light} />
            <Path d={EYES_CALM_D} fill="#140d0d" />
            <Path d="M44.3 55.8A1.9 1.9 0 1 1 48.1 55.8A1.9 1.9 0 1 1 44.3 55.8ZM68.3 55.8A1.9 1.9 0 1 1 72.1 55.8A1.9 1.9 0 1 1 68.3 55.8Z" fill="#ffffff" />
          </Svg>
        ),
      },
    ],
  },
  {
    title: '2 · 40 px réels sur surface UI (à agrandir ×6 au plus proche voisin)',
    cellWidth: 48,
    cellHeight: 48,
    background: colors.surface,
    cells: AVATAR_ART_IDS.map((id) => ({ label: id.replace('avatar-', ''), node: <EcolnaAvatar avatarId={id} size={40} /> })),
  },
  {
    title: '3 · Silhouettes 40 px des garçons à cheveux courts (1, 3, 10, 12) + 6, 7',
    cellWidth: 48,
    cellHeight: 48,
    cells: ['avatar-1', 'avatar-3', 'avatar-10', 'avatar-12', 'avatar-6', 'avatar-7'].map((id) => ({
      label: id.replace('avatar-', ''),
      node: black(id, 40),
    })),
  },
  {
    title: '4 · Jumeaux ? 3 et 12 en couleur (40 / 56 / 96)',
    cellWidth: 104,
    cellHeight: 104,
    cells: [
      { label: '3 · 40', node: <EcolnaAvatar avatarId="avatar-3" size={40} /> },
      { label: '12 · 40', node: <EcolnaAvatar avatarId="avatar-12" size={40} /> },
      { label: '3 · 56', node: <EcolnaAvatar avatarId="avatar-3" size={56} /> },
      { label: '12 · 56', node: <EcolnaAvatar avatarId="avatar-12" size={56} /> },
      { label: '3 · 96', node: <EcolnaAvatar avatarId="avatar-3" size={96} /> },
      { label: '12 · 96', node: <EcolnaAvatar avatarId="avatar-12" size={96} /> },
    ],
  },
  {
    title: '5 · backdrop={false} à 200 px : le buste rogné par le disque',
    cellWidth: 216,
    cellHeight: 216,
    background: colors.surface,
    cells: ['avatar-1', 'avatar-8', 'avatar-11'].map((id) => ({
      label: id,
      node: <EcolnaAvatar avatarId={id} size={200} backdrop={false} />,
    })),
  },
  {
    title: '6 · Bob (8) : sourcils et ombre du bord — calme / joie ×6',
    cellWidth: 360,
    cellHeight: 180,
    cells: [
      { label: 'avatar-8 calme', node: crop('avatar-8', '30 28 60 30', 360, 180) },
      { label: 'avatar-8 joie', node: crop('avatar-8', '30 28 60 30', 360, 180, 'joy') },
    ],
  },
  {
    title: '7 · Tresses (4) : attache au crâne — côté gauche ×4',
    cellWidth: 260,
    cellHeight: 340,
    cells: [
      {
        label: 'avatar-4, x 14–64, y 30–110',
        node: (
          <div style={{ width: 250, height: 330, overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', left: -14 * 5, top: -30 * 4.1 }}>
              <EcolnaAvatar avatarId="avatar-4" size={500} />
            </div>
          </div>
        ),
      },
      {
        label: 'avatar-9 anses, silhouette 40',
        node: black('avatar-9', 40),
      },
      {
        label: 'avatar-2 boules, silhouette 40',
        node: black('avatar-2', 40),
      },
    ],
  },
  {
    title: '8 · Rampes de peau : light / base / bounce / shade / blush / lip',
    cellWidth: 300,
    cellHeight: 50,
    cells: (Object.keys(skinTones) as (keyof typeof skinTones)[]).map((name) => ({ label: name, node: swatchRow(name) })),
  },
  {
    title: '9 · Contexte : grille de choix du profil, tuiles 120 dp sur surface',
    cellWidth: 136,
    cellHeight: 136,
    background: colors.surface,
    cells: AVATAR_ART_IDS.map((id) => ({ label: id.replace('avatar-', ''), node: <EcolnaAvatar avatarId={id} size={120} /> })),
  },
  {
    title: '10 · Visages seuls (face, sans cheveux ni disque) — le même visage ?',
    cellWidth: 150,
    cellHeight: 150,
    cells: AVATAR_ART_IDS.map((id) => ({ label: id.replace('avatar-', ''), node: crop(id, '30 36 60 52', 144, 125) })),
  },
];

const pick: Record<string, number[]> = {
  all: sections.map((_, i) => i),
  eyes: [0],
  small: [1, 2, 3],
  shapes: [4, 5, 6],
  ramps: [7],
  context: [8, 9],
};

const sheet = {
  title: `Critique DA n° 1 — avatars (${mode})`,
  width: 1500,
  sections: (pick[mode] ?? pick.all).map((i) => sections[i]).filter(Boolean) as (typeof sections)[number][],
};

// Évite l'import inutilisé si une section est retirée.
void Circle;
void Ellipse;
void G;

export default sheet;
