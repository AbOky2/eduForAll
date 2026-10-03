/** @jsxRuntime automatic */
// Planche de contact de l'équipe décors (brief § 10, § 14.4, § 14.8).
//
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/decors.sheet.tsx .cache/design-renders/decors.png --dpr 2
//
// Chaque cellule est rendue par un appel séparé à renderToStaticMarkup : les
// identifiants `useId()` repartiraient de zéro à chaque cellule et les
// dégradés de deux scènes se mélangeraient dans la page. `slot()` place chaque
// dessin à une position d'arbre différente, donc à un identifiant différent.
import { Fragment, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import {
  ClassLevelArt,
  EmptyQuantityScene,
  OfflineReadyScene,
  ProfileStageScene,
  SunCloudScene,
} from '../../src/design-system/illustrations/scenes';
import { illustration } from '../../src/design-system/tokens';

let counter = 0;
function slot(node: ReactNode): ReactElement {
  counter += 1;
  const index = counter;
  return (
    <>
      {Array.from({ length: index + 1 }, (_, k) =>
        k === index ? <Fragment key={k}>{node}</Fragment> : null,
      )}
    </>
  );
}

/** Éléments SVG dessinés, racine exclue (dégradé et arrêts compris) : budget § 15. */
function countElements(node: ReactElement): number {
  return (renderToStaticMarkup(node).match(/<(?!\/)[a-zA-Z]+/g) ?? []).length - 1;
}

const budget = [
  `SunCloud ${countElements(<SunCloudScene width={640} height={360} />)}`,
  `OfflineReady ${countElements(<OfflineReadyScene width={640} height={360} />)}`,
  `ProfileStage ${countElements(<ProfileStageScene width={1100} height={400} />)}`,
  `EmptyQuantity ${countElements(<EmptyQuantityScene size={120} />)}`,
  `CP1 ${countElements(<ClassLevelArt level="CP1" size={64} selected />)}`,
  `CP2 ${countElements(<ClassLevelArt level="CP2" size={64} selected />)}`,
].join(' · ');

const CARD = '#ffffff';
const IVORY = '#F4F1DE';
const SAND = '#d4a373';
const COUNTING = '#f9ecd8';

/**
 * Ce qui se pose sur la scène du profil : le personnage (disque + tête +
 * épaules, en gris neutres) et son ardoise (cadre bois, face ardoise).
 */
function StageOverlay({
  width,
  height,
  avatar,
  slate,
}: {
  width: number;
  height: number;
  avatar: { cx: number; cy: number; r: number };
  slate: { x: number; y: number; w: number; h: number };
}) {
  const { cx, cy, r } = avatar;
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Circle cx={cx} cy={cy} r={r} fill={illustration.backdrop.sun} />
      <Circle cx={cx} cy={cy - r * 0.12} r={r * 0.36} fill={illustration.skin.cacao.base} />
      <Path
        d={`M${cx - r * 0.62} ${cy + r * 0.8}C${cx - r * 0.55} ${cy + r * 0.34} ${cx + r * 0.55} ${cy + r * 0.34} ${cx + r * 0.62} ${cy + r * 0.8}Z`}
        fill={illustration.fabric.indigo.base}
      />
      <Rect
        x={slate.x}
        y={slate.y}
        width={slate.w}
        height={slate.h}
        rx={18}
        fill={illustration.school.wood.base}
      />
      <Rect
        x={slate.x + 14}
        y={slate.y + 14}
        width={slate.w - 28}
        height={slate.h - 28}
        rx={8}
        fill={illustration.school.slate.base}
      />
      <Rect
        x={slate.x + 40}
        y={slate.y + slate.h / 2 - 4}
        width={slate.w - 80}
        height={8}
        rx={4}
        fill={illustration.school.chalk}
      />
    </Svg>
  );
}

function Layered({ width, height, children }: { width: number; height: number; children: ReactNode[] }) {
  return (
    <div style={{ position: 'relative', width, height }}>
      {children.map((child, i) => (
        <div key={i} style={{ position: 'absolute', left: 0, top: 0, width, height }}>
          {child}
        </div>
      ))}
    </div>
  );
}

const portraitPane = { width: 520, height: 720 };
const band = { width: 1100, height: 400 };

const classCells = (background: string, groundShade?: string) =>
  (['CP1', 'CP2'] as const).flatMap((level) =>
    [false, true].flatMap((selected) =>
      [48, 64, 96, 128].map((size) => ({
        label: `${level} ${selected ? 'sélectionné' : 'normal'} · ${size}`,
        node: slot(
          groundShade ? (
            <ClassLevelArt level={level} size={size} selected={selected} groundShade={groundShade} />
          ) : (
            <ClassLevelArt level={level} size={size} selected={selected} />
          ),
        ),
        background,
      })),
    ),
  );

export default {
  title: 'Décors — scènes et petites illustrations',
  subtitle: `Brief § 10 et § 14.4 — éléments SVG (budget scène ≤ 60) : ${budget}`,
  sections: [
    {
      title: 'SunCloudScene — écran « hors connexion » (320 × 230) et cartes 360 × 210 / 640 × 360',
      cellWidth: 660,
      cellHeight: 380,
      background: CARD,
      cells: [
        { label: '320 × 230 (écran actuel)', node: slot(<SunCloudScene width={320} height={230} />) },
        { label: '640 × 360 (tablette)', node: slot(<SunCloudScene width={640} height={360} />) },
        { label: '360 × 210 (téléphone)', node: slot(<SunCloudScene width={360} height={210} />) },
      ],
    },
    {
      title: 'OfflineReadyScene — onboarding 3, cartes 360 × 210 / 640 × 360',
      cellWidth: 660,
      cellHeight: 380,
      background: CARD,
      cells: [
        { label: '640 × 360 (tablette)', node: slot(<OfflineReadyScene width={640} height={360} />) },
        { label: '360 × 210 (téléphone)', node: slot(<OfflineReadyScene width={360} height={210} />) },
      ],
    },
    {
      title: 'Bandeaux très larges (largeur d’écran − marges × 210, code actuel de l’onboarding)',
      note: 'Le cœur reste entier et centré ; ciel et dunes s’étendent.',
      cellWidth: 1300,
      cellHeight: 230,
      background: CARD,
      cells: [
        { label: 'OfflineReadyScene 1270 × 210', node: slot(<OfflineReadyScene width={1270} height={210} />) },
        { label: 'SunCloudScene 976 × 210', node: slot(<SunCloudScene width={976} height={210} />) },
      ],
    },
    {
      title: 'ProfileStageScene — volet portrait 520 × 720 (paysage tablette), nu et avec personnage + ardoise',
      cellWidth: 540,
      cellHeight: 740,
      background: CARD,
      cells: [
        { label: 'nu', node: slot(<ProfileStageScene {...portraitPane} />) },
        {
          label: 'avec personnage 300 dp + ardoise',
          node: slot(
            <Layered {...portraitPane}>
              {[
                <ProfileStageScene key="scene" {...portraitPane} />,
                <StageOverlay
                  key="overlay"
                  {...portraitPane}
                  avatar={{ cx: 260, cy: 250, r: 150 }}
                  slate={{ x: 80, y: 430, w: 360, h: 170 }}
                />,
              ]}
            </Layered>,
          ),
        },
      ],
    },
    {
      title: 'ProfileStageScene — bandeau 1100 × 400 (tablette portrait), nu et habité',
      cellWidth: 1120,
      cellHeight: 420,
      background: CARD,
      cells: [
        { label: 'nu', node: slot(<ProfileStageScene {...band} />) },
        {
          label: 'avec personnage 250 dp + ardoise',
          node: slot(
            <Layered {...band}>
              {[
                <ProfileStageScene key="scene" {...band} />,
                <StageOverlay
                  key="overlay"
                  {...band}
                  avatar={{ cx: 430, cy: 175, r: 125 }}
                  slate={{ x: 600, y: 150, w: 360, h: 160 }}
                />,
              ]}
            </Layered>,
          ),
        },
      ],
    },
    {
      title: 'ProfileStageScene — téléphone 390 × 180',
      cellWidth: 410,
      cellHeight: 200,
      background: CARD,
      cells: [{ label: '390 × 180', node: slot(<ProfileStageScene width={390} height={180} />) }],
    },
    {
      title: 'ClassLevelArt — 48 / 64 / 96 / 128, normal et sélectionné, sur carte blanche',
      cellWidth: 150,
      cellHeight: 150,
      cells: classCells(CARD),
    },
    {
      title: 'ClassLevelArt — sur ivoire #F4F1DE',
      cellWidth: 150,
      cellHeight: 150,
      cells: classCells(IVORY),
    },
    {
      title: 'ClassLevelArt — sur sable #d4a373 (groundShade = nature.duneDeep)',
      cellWidth: 150,
      cellHeight: 150,
      cells: classCells(SAND, illustration.nature.duneDeep),
    },
    {
      title: 'EmptyQuantityScene — 120 / 200 dans la carte de comptage (#f9ecd8)',
      cellWidth: 240,
      cellHeight: 240,
      background: COUNTING,
      cells: [
        { label: '120', node: slot(<EmptyQuantityScene size={120} />) },
        { label: '200', node: slot(<EmptyQuantityScene size={200} />) },
        { label: '120 sur blanc', node: slot(<EmptyQuantityScene size={120} />), background: CARD },
        { label: '120 sur ivoire', node: slot(<EmptyQuantityScene size={120} />), background: IVORY },
      ],
    },
    {
      title: 'Niveaux de gris — lisibilité au soleil',
      cellWidth: 380,
      cellHeight: 240,
      grayscale: true,
      background: CARD,
      cells: [
        { label: 'SunCloudScene 320 × 230', node: slot(<SunCloudScene width={320} height={230} />) },
        { label: 'OfflineReadyScene 360 × 210', node: slot(<OfflineReadyScene width={360} height={210} />) },
        { label: 'ProfileStageScene 360 × 220', node: slot(<ProfileStageScene width={360} height={220} />) },
        {
          label: 'EmptyQuantityScene 200',
          node: slot(<EmptyQuantityScene size={200} />),
          background: COUNTING,
        },
        {
          label: 'CP1 · CP2 · 64, normal puis sélectionné',
          node: slot(
            <div style={{ display: 'flex', gap: 12 }}>
              <ClassLevelArt level="CP1" size={64} />
              <ClassLevelArt level="CP2" size={64} />
              <ClassLevelArt level="CP1" size={64} selected />
              <ClassLevelArt level="CP2" size={64} selected />
            </div>,
          ),
        },
      ],
    },
    {
      title: 'Zoom — construction',
      cellWidth: 420,
      cellHeight: 420,
      background: CARD,
      cells: [
        { label: 'CP1 sélectionné ×4', node: slot(<ClassLevelArt level="CP1" size={384} selected />) },
        { label: 'CP2 sélectionné ×4', node: slot(<ClassLevelArt level="CP2" size={384} selected />) },
        {
          label: 'Enclos vide ×3,3',
          node: slot(<EmptyQuantityScene size={400} />),
          background: COUNTING,
        },
      ],
    },
  ],
};
