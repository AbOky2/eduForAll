/** @jsxRuntime automatic */
// Planche de contact des pictogrammes de discipline (`SubjectArt`, brief § 7).
// Rendu :
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/disciplines.sheet.tsx .cache/design-renders/disciplines.png --dpr 2
// (et --dpr 1 pour la lisibilité à taille réelle sur une dalle 1x).
import type { ReactNode } from 'react';

import { SubjectArt, type SubjectArtId } from '../../src/design-system/icons/subject-art';
import { colors, radius, spacing } from '../../src/design-system/tokens';
import { fr } from '../../src/localization/fr/strings';

const SUBJECTS: SubjectArtId[] = ['language', 'reading', 'writing', 'math'];
const SIZES = [32, 40, 48, 64, 96, 160];
const SMALL = [32, 40, 48, 64];

// Les fonds imposés par le brief (§ 14.8) et ceux de l'app.
const BACKGROUNDS = [
  { label: '#ffffff (carte)', value: colors.card },
  { label: '#fbf8ff (fond de l’app)', value: colors.background },
  { label: '#F4F1DE (fond d’exercice)', value: colors.exerciseBackground },
  { label: '#d4a373 (sable)', value: colors.primaryContainer },
];

// Mêmes barres que l'accueil (`SUBJECT_META` de app/(child)/(tabs)/index.tsx).
const BAR: Record<SubjectArtId, { fill: string; progress: number }> = {
  language: { fill: colors.secondary, progress: 0.6 },
  reading: { fill: colors.primary, progress: 0.35 },
  writing: { fill: colors.primaryContainer, progress: 0.2 },
  math: { fill: colors.secondary, progress: 0.8 },
};

function Row({
  subject,
  muted = false,
  sizes,
}: {
  subject: SubjectArtId;
  muted?: boolean;
  sizes: number[];
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
      {sizes.map((size) => (
        <SubjectArt key={size} subject={subject} size={size} muted={muted} />
      ))}
    </div>
  );
}

function Pair({ subject }: { subject: SubjectArtId }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Row subject={subject} sizes={SMALL} />
      <Row subject={subject} sizes={SMALL} muted />
    </div>
  );
}

/** Grille 48 u : traits fins tous les 1 u, appuyés tous les 4 u ; zone 40 × 40 en rouge. */
function Grid({ size }: { size: number }) {
  const lines: ReactNode[] = [];
  for (let i = 0; i <= 48; i += 1) {
    const major = i % 4 === 0;
    const stroke = major ? 'rgba(22,26,50,.30)' : 'rgba(22,26,50,.10)';
    const width = major ? 0.08 : 0.04;
    lines.push(
      <line key={`v${i}`} x1={i} y1={0} x2={i} y2={48} stroke={stroke} strokeWidth={width} />,
    );
    lines.push(
      <line key={`h${i}`} x1={0} y1={i} x2={48} y2={i} stroke={stroke} strokeWidth={width} />,
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      style={{ position: 'absolute', left: 0, top: 0 }}
    >
      {lines}
      <rect
        x={4}
        y={4}
        width={40}
        height={40}
        fill="none"
        stroke="rgba(186,26,26,.55)"
        strokeWidth={0.1}
      />
    </svg>
  );
}

function Zoom({
  subject,
  muted = false,
  size,
}: {
  subject: SubjectArtId;
  muted?: boolean;
  size: number;
}) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <SubjectArt subject={subject} size={size} muted={muted} />
      <Grid size={size} />
    </div>
  );
}

/** Petit cadenas de la maquette (le vrai glyphe appartient à l'équipe icônes). */
function MockLock() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24">
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        fill="none"
        stroke={colors.locked}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <rect x={5} y={11} width={14} height={10} rx={3} fill={colors.locked} />
    </svg>
  );
}

/** Carte d'activité de l'accueil (180 × 150), telle que l'écran la compose. */
function HomeCard({ subject, locked = false }: { subject: SubjectArtId; locked?: boolean }) {
  const bar = BAR[subject];
  return (
    <div
      style={{
        width: 180,
        height: 150,
        boxSizing: 'border-box',
        padding: spacing.lg,
        borderRadius: radius.lg,
        background: colors.card,
        boxShadow: '0 2px 8px rgba(125,86,45,.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: spacing.sm,
        // l'accueil atténue la carte verrouillée (styles.lockedCard)
        opacity: locked ? 0.75 : 1,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <SubjectArt subject={subject} size={56} muted={locked} />
        {locked ? <MockLock /> : null}
      </div>
      <div
        style={{
          fontFamily: 'PlusJakartaSans-SemiBold',
          fontSize: 16,
          lineHeight: '22px',
          letterSpacing: 0.2,
          color: locked ? colors.locked : colors.textPrimary,
        }}
      >
        {fr.subjects[subject]}
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 4,
          background: colors.surfaceContainerHigh,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${(locked ? 0 : bar.progress) * 100}%`,
            height: 8,
            borderRadius: 4,
            background: bar.fill,
          }}
        />
      </div>
    </div>
  );
}

/** Onboarding page 2 : grille 2 × 2 de cartes centrées. */
function OnboardingGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 168px)', gap: spacing.md }}>
      {SUBJECTS.map((subject) => (
        <div
          key={subject}
          style={{
            height: 150,
            borderRadius: radius.lg,
            background: colors.card,
            boxShadow: '0 2px 8px rgba(125,86,45,.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
          }}
        >
          <SubjectArt subject={subject} size={72} />
          <div
            style={{
              fontFamily: 'PlusJakartaSans-SemiBold',
              fontSize: 16,
              color: colors.textPrimary,
            }}
          >
            {fr.subjects[subject]}
          </div>
        </div>
      ))}
    </div>
  );
}

const sheet = {
  title: 'Pictogrammes de discipline — SubjectArt',
  subtitle:
    'Brief identité v2 § 7 · palier M (grille 48) · Langage, Lecture, Écriture, Calcul · couleur et verrouillé (muted)',
  width: 1440,
  sections: [
    {
      title: 'Construction — grille 48 u (traits tous les 4 u, zone 40 × 40 en rouge)',
      cellWidth: 320,
      cellHeight: 320,
      background: colors.card,
      cells: SUBJECTS.map((subject) => ({
        label: fr.subjects[subject],
        node: <Zoom subject={subject} size={304} />,
      })),
    },
    {
      title: 'Verrouillé (muted) — même dessin, tons locked / lockedContainer, sans reflet',
      cellWidth: 320,
      cellHeight: 216,
      background: colors.card,
      cells: SUBJECTS.map((subject) => ({
        label: `${fr.subjects[subject]} verrouillé`,
        node: <Zoom subject={subject} size={200} muted />,
      })),
    },
    {
      title: 'Tailles réelles — 32 / 40 / 48 / 64 / 96 / 160 px',
      note: 'À regarder aussi dans la planche --dpr 1 : c’est la dalle d’une tablette d’entrée de gamme.',
      cellWidth: 640,
      cellHeight: 176,
      background: colors.card,
      cells: SUBJECTS.flatMap((subject) => [
        { label: fr.subjects[subject], node: <Row subject={subject} sizes={SIZES} /> },
        {
          label: `${fr.subjects[subject]} verrouillé`,
          node: <Row subject={subject} sizes={SIZES} muted />,
        },
      ]),
    },
    ...BACKGROUNDS.slice(1).map((bg) => ({
      title: `Sur ${bg.label} — 32 / 40 / 48 / 64, couleur puis verrouillé`,
      cellWidth: 320,
      cellHeight: 150,
      background: bg.value,
      cells: SUBJECTS.map((subject) => ({
        label: fr.subjects[subject],
        node: <Pair subject={subject} />,
      })),
    })),
    {
      title: 'Niveaux de gris — lisibilité au soleil (32 / 40 / 48 / 64, couleur puis verrouillé)',
      cellWidth: 320,
      cellHeight: 150,
      background: colors.card,
      grayscale: true,
      cells: SUBJECTS.map((subject) => ({
        label: fr.subjects[subject],
        node: <Pair subject={subject} />,
      })),
    },
    {
      title: 'En contexte — carte d’activité de l’accueil (180 × 150, pictogramme 56 px)',
      note: 'La carte verrouillée garde l’opacité 0,75 de l’accueil actuel.',
      cellWidth: 200,
      cellHeight: 170,
      background: colors.background,
      cells: [
        ...SUBJECTS.map((subject) => ({
          label: fr.subjects[subject],
          node: <HomeCard subject={subject} />,
        })),
        ...SUBJECTS.map((subject) => ({
          label: `${fr.subjects[subject]} verrouillé`,
          node: <HomeCard subject={subject} locked />,
        })),
      ],
    },
    {
      title: 'En contexte — accueil en niveaux de gris',
      cellWidth: 200,
      cellHeight: 170,
      background: colors.background,
      grayscale: true,
      cells: SUBJECTS.map((subject) => ({
        label: fr.subjects[subject],
        node: <HomeCard subject={subject} />,
      })),
    },
    {
      title: 'En contexte — onboarding page 2 (pictogramme 72 px)',
      cellWidth: 384,
      cellHeight: 340,
      background: colors.background,
      cells: [{ label: 'Les quatre disciplines', node: <OnboardingGrid /> }],
    },
  ],
};

export default sheet;
