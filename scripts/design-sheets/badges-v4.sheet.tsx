/** @jsxRuntime automatic */
// Planche des médailles v4 « Épure ».
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/badges-v4.sheet.tsx .cache/design-renders/badges-v4.png
import { BADGE_ART_IDS, BadgeArt } from '../../src/design-system/illustrations/badge-art';
import { fr } from '../../src/localization/fr/strings';

const labels = fr.achievements.labels as Record<string, string>;

export default {
  title: 'ECOLNA — médailles v4',
  width: 1400,
  sections: [
    ...[96, 64].flatMap((size) => [
      {
        title: `${size} px — gagnées`,
        cellWidth: Math.max(size + 40, 110),
        cellHeight: size + 34,
        background: '#ffffff',
        cells: BADGE_ART_IDS.map((id) => ({ label: labels[id] ?? id, node: <BadgeArt id={id} earned size={size} /> })),
      },
      {
        title: `${size} px — à gagner`,
        cellWidth: Math.max(size + 40, 110),
        cellHeight: size + 34,
        background: '#ffffff',
        cells: BADGE_ART_IDS.map((id) => ({ label: labels[id] ?? id, node: <BadgeArt id={id} earned={false} size={size} /> })),
      },
    ]),
    {
      title: '40 px',
      cellWidth: 70,
      cellHeight: 60,
      background: '#ffffff',
      cells: BADGE_ART_IDS.map((id) => ({ label: '', node: <BadgeArt id={id} earned size={40} /> })),
    },
  ],
};
