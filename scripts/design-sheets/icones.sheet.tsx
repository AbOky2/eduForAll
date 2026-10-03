/** @jsxRuntime automatic */
// Planche de contact des icônes v2 (design/brief-identite-v2.md § 6, § 14.8).
//
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/icones.sheet.tsx \
//     .cache/design-renders/icones.png --dpr 2
//
// Ce qu'on regarde est exactement ce que l'app dessine : les composants sont
// rendus tels quels (react-native-svg remplacé par les balises SVG du DOM).
import type { ReactElement } from 'react';
import Svg, { Line } from 'react-native-svg';

import {
  EcolnaIcon,
  type IconMode,
  type IconName,
} from '../../src/design-system/icons/ecolna-icon';
import { M_GLYPHS, renderMGlyph } from '../../src/design-system/icons/glyphs-m';
import { S_GLYPHS, renderSGlyph } from '../../src/design-system/icons/glyphs-s';
import { colors } from '../../src/design-system/tokens';

const S_NAMES = Object.keys(S_GLYPHS) as IconName[];
const M_NAMES = S_NAMES.filter((name) => M_GLYPHS[name] !== undefined);
const MODES: IconMode[] = ['mono', 'duo', 'color'];
const M_SIZES = [32, 40, 48, 64, 96];
const S_SIZES = [20, 24, 32];
const BACKGROUNDS = [
  { label: 'blanc #ffffff', value: '#ffffff' },
  { label: 'ivoire #F4F1DE', value: colors.exerciseBackground },
  { label: 'sable #d4a373', value: colors.primaryContainer },
];
const INK = colors.onSurfaceVariant;

/** Le dessin S exact, quelle que soit la taille (pour le montrer à 32 et en grand). */
function SView({ name, size, filled = false }: { name: IconName; size: number; filled?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {renderSGlyph(S_GLYPHS[name], INK, filled)}
    </Svg>
  );
}

/** Le dessin M exact, quelle que soit la taille. */
function MView({ name, size, mode }: { name: IconName; size: number; mode: IconMode }) {
  const glyph = M_GLYPHS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {glyph ? renderMGlyph(glyph, mode, INK) : null}
    </Svg>
  );
}

/** Grille d'unités sous un dessin agrandi : on y lit l'alignement des traits. */
function Gridded({
  units,
  size,
  children,
}: {
  units: number;
  size: number;
  children: ReactElement;
}) {
  const lines: ReactElement[] = [];
  for (let i = 0; i <= units; i += 1) {
    const stroke = i % 4 === 0 ? '#cfc8e4' : '#ece9f6';
    const w = units / size;
    lines.push(
      <Line key={`v${i}`} x1={i} y1={0} x2={i} y2={units} stroke={stroke} strokeWidth={w} />,
    );
    lines.push(
      <Line key={`h${i}`} x1={0} y1={i} x2={units} y2={i} stroke={stroke} strokeWidth={w} />,
    );
  }
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <Svg width={size} height={size} viewBox={`0 0 ${units} ${units}`}>
          {lines}
        </Svg>
      </div>
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
  );
}

const row = (gap: number) => ({ display: 'flex', alignItems: 'center', gap });

/** Maquette de barre d'onglets § 6.6 : pilule claire, galet sable sous l'onglet actif. */
function TabBarMock({ active, compact = false }: { active: 'home' | 'learn'; compact?: boolean }) {
  const icon = compact ? 40 : 48;
  const pebble = compact ? 56 : 64;
  const slot = compact ? 96 : 120;
  const tab = (name: IconName, label: string, on: boolean, parents = false) => (
    <div
      key={name}
      style={{
        width: slot,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        marginLeft: parents ? 8 : 0,
      }}
    >
      <div
        style={{
          width: pebble,
          height: pebble,
          borderRadius: pebble / 2,
          background: on ? colors.primaryFixedDim : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {parents ? (
          <EcolnaIcon name={name} size={icon} mode="mono" modifier="lock" />
        ) : (
          <EcolnaIcon name={name} size={icon} mode={on ? 'color' : 'mono'} />
        )}
      </div>
      <span
        style={{
          fontFamily: 'Quicksand',
          fontSize: compact ? 13 : 14,
          fontWeight: on ? 700 : 500,
          color: on ? colors.onPrimaryContainer : colors.onSurfaceVariant,
        }}
      >
        {label}
      </span>
    </div>
  );
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.card,
        borderRadius: 999,
        height: compact ? 76 : 88,
        padding: '0 16px',
        boxShadow: '0 6px 18px rgba(22,26,50,.14)',
      }}
    >
      {tab('home', 'Accueil', active === 'home')}
      {tab('learn', 'Apprendre', active === 'learn')}
      {tab('parents', 'Parents', false, true)}
    </div>
  );
}

/** Tous les pictogrammes M à 48, dans les trois modes, sur un fond. */
function MBoard({ grayscale = false }: { grayscale?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 18,
        width: 1500,
        filter: grayscale ? 'grayscale(1)' : 'none',
      }}
    >
      {M_NAMES.map((name) => (
        <div key={name} style={row(4)}>
          {MODES.map((mode) => (
            <EcolnaIcon key={mode} name={name} size={48} mode={mode} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Tous les glyphes S à 24, contour puis plein, sur un fond. */
function SBoard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {[false, true].map((filled) => (
        <div
          key={String(filled)}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 11, width: 1500 }}
        >
          {S_NAMES.map((name) => (
            <SView key={name} name={name} size={24} filled={filled} />
          ))}
        </div>
      ))}
    </div>
  );
}

const sheet = {
  title: 'ECOLNA — icônes v2 « Galets & craie »',
  subtitle: `Palier S : ${S_NAMES.length} glyphes (grille 24, trait 2, contour + jumeau plein) · palier M : ${M_NAMES.length} pictogrammes (grille 48, trait 4, mono · duo · couleur avec reflet)`,
  width: 1600,
  sections: [
    {
      title:
        'Barre d’onglets (§ 6.6) — tablette : icônes 48, galet 64 · compact : icônes 40, galet 56',
      note: 'Inactif : mono 4 u onSurfaceVariant, libellé normal · actif : galet primaryFixedDim + mode couleur + libellé gras · Parents : toujours mono, cadenas en modificateur, à 8 dp',
      cellWidth: 500,
      cellHeight: 130,
      background: colors.background,
      cells: [
        { label: 'tablette — Accueil actif', node: <TabBarMock active="home" /> },
        { label: 'tablette — Apprendre actif', node: <TabBarMock active="learn" /> },
        { label: 'compact — Apprendre actif', node: <TabBarMock active="learn" compact /> },
      ],
    },
    {
      title: 'Palier M — tailles réelles 32 / 40 / 48 / 64 / 96',
      note: 'Une ligne par mode : mono (inactif, parent) · duo (contenu par défaut) · couleur (actif, gagné, avec le reflet)',
      cellWidth: 360,
      cellHeight: 104,
      cells: M_NAMES.flatMap((name) =>
        MODES.map((mode) => ({
          label: `${name} · ${mode}`,
          node: (
            <div style={row(10)}>
              {M_SIZES.map((s) => (
                <EcolnaIcon key={s} name={name} size={s} mode={mode} />
              ))}
            </div>
          ),
        })),
      ),
    },
    ...BACKGROUNDS.map((bg) => ({
      title: `Palier M à 48 sur ${bg.label} — mono · duo · couleur`,
      cellWidth: 1520,
      cellHeight: 150,
      background: bg.value,
      cells: [{ label: M_NAMES.join(' · '), node: <MBoard /> }],
    })),
    {
      title: 'Niveaux de gris — lisibilité au soleil (palier M à 48, puis palier S à 24)',
      cellWidth: 1520,
      cellHeight: 150,
      grayscale: true,
      cells: [
        { label: 'palier M', node: <MBoard /> },
        { label: 'palier S, contour puis plein', node: <SBoard /> },
      ],
    },
    {
      title: 'Palier S — tailles réelles 20 / 24 / 32, contour | jumeau plein',
      note: 'Le dessin S exact, même à 32 (dans l’app, EcolnaIcon passe au palier M à 32 quand le pictogramme existe)',
      cellWidth: 290,
      cellHeight: 56,
      cells: S_NAMES.map((name) => ({
        label: name,
        node: (
          <div style={row(10)}>
            {S_SIZES.map((s) => (
              <SView key={`m${s}`} name={name} size={s} />
            ))}
            <div style={{ width: 1, height: 28, background: '#dddbe6' }} />
            {S_SIZES.map((s) => (
              <SView key={`f${s}`} name={name} size={s} filled />
            ))}
          </div>
        ),
      })),
    },
    ...BACKGROUNDS.map((bg) => ({
      title: `Palier S à 24 sur ${bg.label} — contour puis plein`,
      cellWidth: 1520,
      cellHeight: 96,
      background: bg.value,
      cells: [{ label: S_NAMES.join(' · '), node: <SBoard /> }],
    })),
    {
      title:
        'Bascule optique d’EcolnaIcon — 24 · 28 · 31 (palier S) puis 32 · 40 (palier M), mode mono',
      cellWidth: 290,
      cellHeight: 60,
      cells: M_NAMES.map((name) => ({
        label: name,
        node: (
          <div style={row(10)}>
            {[24, 28, 31, 32, 40].map((s) => (
              <EcolnaIcon key={s} name={name} size={s} />
            ))}
          </div>
        ),
      })),
    },
    {
      title: 'Palier M — zoom 192 sur la grille 48 (mono · duo · couleur)',
      cellWidth: 200,
      cellHeight: 200,
      cells: M_NAMES.flatMap((name) =>
        MODES.map((mode) => ({
          label: `${name} · ${mode}`,
          node: (
            <Gridded units={48} size={192}>
              <MView name={name} size={192} mode={mode} />
            </Gridded>
          ),
        })),
      ),
    },
    {
      title: 'Palier S — zoom 144 sur la grille 24 (contour · plein)',
      cellWidth: 150,
      cellHeight: 150,
      cells: S_NAMES.flatMap((name) =>
        [false, true].map((filled) => ({
          label: `${name}${filled ? ' · plein' : ''}`,
          node: (
            <Gridded units={24} size={144}>
              <SView name={name} size={144} filled={filled} />
            </Gridded>
          ),
        })),
      ),
    },
  ],
};

export default sheet;
