/** @jsxRuntime automatic */
// Planche de contact des médailles (brief § 9, § 14.8, § 17.1).
//
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/medailles.sheet.tsx .cache/design-renders/medailles.png --dpr 2
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/medailles.sheet.tsx .cache/design-renders/medailles-1x.png --dpr 1
//
// MEDAILLES_ZOOM=first-lesson,writer rend seulement ces médailles en très grand
// (travail de détail : géométrie, reflets, évidements).
import { BADGE_ART_IDS, BadgeArt, type BadgeArtId } from '../../src/design-system/illustrations/badge-art';
import { colors, illustration } from '../../src/design-system/tokens';
import { fr } from '../../src/localization/fr/strings';

const LABELS = fr.achievements.labels;
const IDS: readonly BadgeArtId[] = BADGE_ART_IDS;

/** Le profil de démonstration : cinq badges gagnés sur quatorze (capture 08-badges). */
const EARNED_DEMO = new Set<BadgeArtId>(['first-lesson', 'five-lessons', 'first-perfect', 'reader', 'streak-three']);

const cells = (size: number, earned: boolean) =>
  IDS.map((id) => ({ label: LABELS[id], node: <BadgeArt id={id} earned={earned} size={size} /> }));

/** Maquette de « Tes badges » : en-tête, compteur, grille de trois colonnes, libellés sous chaque médaille. */
function Shelf({ medal, tile, width }: { medal: number; tile: number; width: number }) {
  const earnedCount = IDS.filter((id) => EARNED_DEMO.has(id)).length;
  return (
    <div style={{ width, padding: 24, background: colors.background, fontFamily: 'Quicksand', alignSelf: 'stretch' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary }}>{fr.achievements.title}</span>
        <span style={{ fontSize: 15, fontWeight: 600, color: colors.textSecondary }}>
          {fr.achievements.countEarned(earnedCount, IDS.length)}
        </span>
      </div>
      <div style={{ fontSize: 15, color: colors.textSecondary, margin: '10px 0 18px' }}>{fr.achievements.subtitle}</div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(3, ${tile}px)`, justifyContent: 'center', rowGap: 18, columnGap: 16 }}>
        {IDS.map((id) => {
          const earned = EARNED_DEMO.has(id);
          return (
            <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <BadgeArt id={id} earned={earned} size={medal} />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  textAlign: 'center',
                  lineHeight: '16px',
                  color: earned ? colors.textPrimary : colors.textSecondary,
                }}
              >
                {LABELS[id]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const zoom = (process.env.MEDAILLES_ZOOM ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter((id): id is BadgeArtId => (IDS as readonly string[]).includes(id));

const zoomSheet = {
  title: 'Médailles — zoom',
  width: 1440,
  sections: [
    {
      title: 'Gagnées et verrouillées, 300 px',
      cellWidth: 320,
      cellHeight: 320,
      cells: zoom.flatMap((id) => [
        { label: `${id} — gagné`, node: <BadgeArt id={id} earned size={300} /> },
        { label: `${id} — verrouillé`, node: <BadgeArt id={id} earned={false} size={300} /> },
      ]),
    },
    {
      title: 'Taille réelle 48 / 64 px',
      cellWidth: 100,
      cellHeight: 100,
      cells: zoom.flatMap((id) => [
        { label: '48', node: <BadgeArt id={id} earned size={48} /> },
        { label: '64', node: <BadgeArt id={id} earned size={64} /> },
        { label: '48 gris', grayscale: true, node: <BadgeArt id={id} earned size={48} /> },
        { label: '48 verrouillé', node: <BadgeArt id={id} earned={false} size={48} /> },
      ]),
    },
  ],
};

const fullSheet = {
  title: 'ECOLNA — Tes badges : quatorze médailles',
  subtitle:
    'Une seule famille (rosette, face, biseau, reflet, pastille-ombre), quatorze objets. Verrouillé = silhouette + cadenas, jamais caché.',
  width: 1440,
  sections: [
    { title: 'Gagnées — 96 px, fond #ffffff', cellWidth: 124, cellHeight: 112, background: colors.card, cells: cells(96, true) },
    { title: 'Verrouillées — 96 px, fond #ffffff', cellWidth: 124, cellHeight: 112, background: colors.card, cells: cells(96, false) },
    { title: 'Gagnées — 64 px, fond #fbf8ff (surface)', cellWidth: 124, cellHeight: 80, background: colors.surface, cells: cells(64, true) },
    { title: 'Verrouillées — 64 px, fond #fbf8ff', cellWidth: 124, cellHeight: 80, background: colors.surface, cells: cells(64, false) },
    { title: 'Gagnées — 48 px (à lire en 1x)', cellWidth: 124, cellHeight: 64, background: colors.card, cells: cells(48, true) },
    { title: 'Verrouillées — 48 px', cellWidth: 124, cellHeight: 64, background: colors.card, cells: cells(48, false) },
    { title: 'Seuil de lecture — 40 px', cellWidth: 124, cellHeight: 56, background: colors.surface, cells: cells(40, true) },
    {
      title: 'Niveaux de gris — 64 px (soleil, daltonisme)',
      cellWidth: 124,
      cellHeight: 80,
      background: colors.card,
      grayscale: true,
      cells: cells(64, true),
    },
    {
      title: 'Niveaux de gris — verrouillées 64 px',
      cellWidth: 124,
      cellHeight: 80,
      background: colors.card,
      grayscale: true,
      cells: cells(64, false),
    },
    {
      title: 'Autres fonds — #F4F1DE (exercice) et #d4a373 (sable), ombre accordée au fond (shadowColor)',
      cellWidth: 124,
      cellHeight: 80,
      cells: IDS.slice(0, 7).flatMap((id) => [
        {
          label: LABELS[id],
          background: colors.exerciseBackground,
          node: <BadgeArt id={id} earned size={64} shadowColor={illustration.fabric.cream.shade} />,
        },
        {
          label: LABELS[id],
          background: colors.primaryContainer,
          node: <BadgeArt id={id} earned={id.length % 2 === 0} size={64} shadowColor={illustration.nature.duneDeep} />,
        },
      ]),
    },
    {
      title: '« Tes badges » — téléphone (64 dp) et tablette paysage (83 dp)',
      note: 'Cinq badges gagnés sur quatorze, comme le profil de démonstration.',
      cellWidth: 640,
      cellHeight: 800,
      background: colors.background,
      cells: [
        { label: 'compact — médaille 64 dp, tuile 96 dp', node: <Shelf medal={64} tile={104} width={420} /> },
        { label: 'expanded — médaille 83 dp (scale 1,3)', node: <Shelf medal={83} tile={124} width={500} /> },
      ],
    },
  ],
};

export default zoom.length > 0 ? zoomSheet : fullSheet;
