/** @jsxRuntime automatic */
/**
 * Planche de la scène d'onboarding n° 1 redessinée (direction v3) :
 * « deux enfants lisent sous un acacia, une chèvre dort à l'ombre ».
 *
 *   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/scenes-v3.sheet.tsx \
 *     .cache/design-renders/scenes-v3.png --dpr 2
 */
import { ReadingChildScene } from '../../src/design-system/illustrations/scenes';

const sheet = {
  title: 'Onboarding 1 — « Ton école t’accompagne partout »',
  subtitle: 'Deux enfants de la distribution (avatar 4, avatar 1) lisent sous un acacia ; une chèvre dort à l’ombre.',
  width: 1440,
  sections: [
    {
      title: 'Cadres réels — paysage tablette (volet 55 %), portrait tablette, téléphone',
      cellWidth: 660,
      cellHeight: 500,
      cells: [
        { label: '640 × 480 (volet paysage)', node: <ReadingChildScene width={640} height={480} /> },
        { label: '640 × 400 (portrait tablette)', node: <ReadingChildScene width={640} height={400} /> },
      ],
    },
    {
      title: 'Petits cadres et niveaux de gris',
      cellWidth: 420,
      cellHeight: 260,
      cells: [
        { label: '360 × 223 (téléphone)', node: <ReadingChildScene width={360} height={223} /> },
        { label: '280 × 200 (cœur)', node: <ReadingChildScene width={280} height={200} /> },
        { label: 'gris', grayscale: true, node: <ReadingChildScene width={360} height={223} /> },
      ],
    },
  ],
};

export default sheet;
