/** @jsxRuntime automatic */
// Planche de critique (direction artistique) — équipe décors, critique n° 1.
// Ne modifie rien : regarde les composants de l'équipe en contexte, en zoom,
// en silhouette.
//   npx tsx scripts/tools/render-sheet.tsx scripts/design-sheets/critique-decors.sheet.tsx .cache/design-renders/decors-critique1-da.png --dpr 2
import { Fragment, type ReactElement, type ReactNode } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import { EcolnaAvatar } from '../../src/design-system/avatars';
import { ObjectIcon } from '../../src/design-system/illustrations/object-icons';
import {
  ClassLevelArt,
  EmptyQuantityScene,
  OfflineReadyScene,
  ProfileStageScene,
  ReadingChildScene,
  SunCloudScene,
} from '../../src/design-system/illustrations/scenes';
import { illustration } from '../../src/design-system/tokens';

let counter = 0;
/** Position d'arbre unique par cellule : identifiants useId distincts. */
function slot(node: ReactNode): ReactElement {
  counter += 1;
  const index = counter;
  return (
    <>
      {Array.from({ length: index + 1 }, (_, k) => (k === index ? <Fragment key={k}>{node}</Fragment> : null))}
    </>
  );
}

/** Fenêtre (w × h) sur un dessin plus grand, décalée de (x, y). */
function Crop({ w, h, x, y, children }: { w: number; h: number; x: number; y: number; children: ReactNode }) {
  return (
    <div style={{ width: w, height: h, overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', left: -x, top: -y, lineHeight: 0 }}>{children}</div>
    </div>
  );
}

const black = (node: ReactNode) => <div style={{ filter: 'brightness(0)', lineHeight: 0 }}>{node}</div>;

/** La carte de comptage telle que l'exercice la dessine (fond #f9ecd8, rayon lg, min 190). */
function CountCard({ width, children }: { width: number; children: ReactNode }) {
  return (
    <div
      style={{
        width,
        minHeight: 190,
        background: '#f9ecd8',
        borderRadius: 24,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
}

/** L'ardoise sous le personnage (§ 12.2), en gros traits : cadre bois, face ardoise, prénom craie. */
function SlateMock({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, lineHeight: 0 }}>
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Rect x={0} y={0} width={w} height={h} rx={18} fill={illustration.school.wood.base} />
        <Rect x={12} y={12} width={w - 24} height={h - 24} rx={8} fill={illustration.school.slate.base} />
      </Svg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: w,
          height: h,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Quicksand',
          fontWeight: 700,
          fontSize: Math.round(h * 0.34),
          color: illustration.school.chalk,
          lineHeight: 1,
        }}
      >
        <span style={{ color: illustration.metal.gold.light }}>A</span>mina
      </div>
    </div>
  );
}

function Stage({
  w,
  h,
  avatar,
  slate,
}: {
  w: number;
  h: number;
  avatar: { x: number; y: number; size: number };
  slate: { x: number; y: number; w: number; h: number };
}) {
  return (
    <div style={{ position: 'relative', width: w, height: h, lineHeight: 0 }}>
      <ProfileStageScene width={w} height={h} />
      <div style={{ position: 'absolute', left: avatar.x, top: avatar.y }}>
        <EcolnaAvatar avatarId="avatar-2" size={avatar.size} expression="joy" />
      </div>
      <SlateMock {...slate} />
    </div>
  );
}


// ── Prototype DA : enclos vu de face, rien de dénombrable dedans (à reprendre par l'équipe) ──
const W8 = illustration.school.wood;
const pillD = (x: number, y1: number, y2: number, r: number) =>
  `M${x - r} ${y1}A${r} ${r} 0 0 1 ${x + r} ${y1}V${y2}A${r} ${r} 0 0 1 ${x - r} ${y2}Z`;
const halfD = (x: number, y1: number, y2: number, r: number) =>
  `M${x} ${y1 - r}A${r} ${r} 0 0 1 ${x + r} ${y1}V${y2}A${r} ${r} 0 0 1 ${x} ${y2 + r}Z`;
const BACK_X = [16, 31, 46, 60, 74, 89, 104];
const FRONT: [number, number, number][] = [
  [12, 74, 96],
  [30, 77, 99],
  [48, 79, 101],
  [72, 79, 101],
  [90, 77, 99],
  [108, 74, 96],
];
const PROTO = {
  floor: 'M20 56H100A12 12 0 0 1 112 68V88A12 12 0 0 1 100 100H20A12 12 0 0 1 8 88V68A12 12 0 0 1 20 56Z',
  backRails: 'M14 44H106M14 53H106',
  backPosts: BACK_X.map((x) => pillD(x, 40, 58, 3)).join(''),
  frontRails: 'M10 80Q60 90 110 80M10 92Q60 102 110 92',
  frontPosts: FRONT.map(([x, a, b]) => pillD(x, a, b, 4)).join(''),
  frontShades: FRONT.map(([x, a, b]) => halfD(x, a, b, 4)).join(''),
  shadow: 'M21 102H111A3 3 0 0 1 111 108H21A3 3 0 0 1 21 102Z',
};
function PenProto({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Path d={PROTO.shadow} fill={illustration.school.paper.shade} />
      <Path d={PROTO.floor} fill={illustration.nature.grass} />
      <Path d={PROTO.backRails} stroke={W8.shade} strokeWidth={4} strokeLinecap="round" fill="none" />
      <Path d={PROTO.backPosts} fill={W8.shade} />
      <Path d={PROTO.frontRails} stroke={W8.base} strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d={PROTO.frontPosts} fill={W8.light} />
      <Path d={PROTO.frontShades} fill={W8.base} />
    </Svg>
  );
}

export default {
  title: 'Critique n° 1 — décors (direction artistique)',
  subtitle: 'Vues de contrôle : taille réelle 1x, zooms de construction, silhouettes, contexte d’écran.',
  sections: [
    {
      title: 'A. Taille réelle — onboarding 3 et hors connexion (téléphone)',
      cellWidth: 380,
      cellHeight: 240,
      background: '#ffffff',
      cells: [
        { label: 'OfflineReady 360 × 210', node: slot(<OfflineReadyScene width={360} height={210} />) },
        { label: 'OfflineReady 300 × 175', node: slot(<OfflineReadyScene width={300} height={175} />) },
        { label: 'OfflineReady 200 × 117 (vignette)', node: slot(<OfflineReadyScene width={200} height={117} />) },
        { label: 'SunCloud 320 × 230', node: slot(<SunCloudScene width={320} height={230} />) },
        { label: 'SunCloud 200 × 144 (vignette)', node: slot(<SunCloudScene width={200} height={144} />) },
        {
          label: 'OfflineReady 200 × 117 niveaux de gris',
          node: slot(
            <div style={{ filter: 'grayscale(1)', lineHeight: 0 }}>
              <OfflineReadyScene width={200} height={117} />
            </div>,
          ),
        },
      ],
    },
    {
      title: 'B. Zoom — couture entre le croissant de lumière et la dune du fond',
      cellWidth: 660,
      cellHeight: 330,
      background: '#ffffff',
      cells: [
        {
          label: 'ProfileStage 2200 × 800, fenêtre sur la dune proche (×2)',
          node: slot(
            <Crop w={660} h={330} x={300} y={420}>
              <ProfileStageScene width={2200} height={800} />
            </Crop>,
          ),
        },
        {
          label: 'SunCloud 1280 × 720, fenêtre sur la dune de devant (×4,6)',
          node: slot(
            <Crop w={660} h={330} x={60} y={420}>
              <SunCloudScene width={1280} height={720} />
            </Crop>,
          ),
        },
      ],
    },
    {
      title: 'C. Zoom — acacia (ProfileStage) et tablette sur chevalet (OfflineReady)',
      cellWidth: 660,
      cellHeight: 420,
      background: '#ffffff',
      cells: [
        {
          label: 'Acacia ×3',
          node: slot(
            <Crop w={660} h={420} x={40} y={1000}>
              <ProfileStageScene width={2400} height={2600} />
            </Crop>,
          ),
        },
        {
          label: 'Panneau solaire, soleil, bord de la tablette ×6,75',
          node: slot(
            <Crop w={660} h={420} x={1480} y={760}>
              <OfflineReadyScene width={2400} height={1350} />
            </Crop>,
          ),
        },
      ],
    },
    {
      title: 'D. Contexte — carte de comptage (tablette 80 dp / téléphone 62 dp)',
      cellWidth: 430,
      cellHeight: 250,
      background: '#ffffff',
      cells: [
        {
          label: '3 chèvres (tablette)',
          node: slot(
            <CountCard width={400}>
              {[0, 1, 2].map((k) => (
                <ObjectIcon key={k} id="icon-goat" size={80} />
              ))}
            </CountCard>,
          ),
        },
        {
          label: '0 chèvre : EmptyQuantityScene 160',
          node: slot(
            <CountCard width={400}>
              <EmptyQuantityScene size={160} />
            </CountCard>,
          ),
        },
        {
          label: '0 chèvre : EmptyQuantityScene 120 (téléphone)',
          node: slot(
            <CountCard width={300}>
              <EmptyQuantityScene size={120} />
            </CountCard>,
          ),
        },
      ],
    },
    {
      title: 'E. Silhouettes noires — l’objet se lit-il sans couleur ?',
      cellWidth: 200,
      cellHeight: 150,
      background: '#ffffff',
      cells: [
        { label: 'Enclos 120', node: slot(black(<EmptyQuantityScene size={120} />)) },
        { label: 'Enclos 64', node: slot(black(<EmptyQuantityScene size={64} />)) },
        {
          label: 'CP1 · CP2 à 48',
          node: slot(
            <div style={{ display: 'flex', gap: 16 }}>
              {black(<ClassLevelArt level="CP1" size={48} />)}
              {black(<ClassLevelArt level="CP2" size={48} />)}
            </div>,
          ),
        },
        {
          label: 'CP1 · CP2 à 40',
          node: slot(
            <div style={{ display: 'flex', gap: 16 }}>
              {black(<ClassLevelArt level="CP1" size={40} />)}
              {black(<ClassLevelArt level="CP2" size={40} />)}
            </div>,
          ),
        },
        {
          label: 'CP1 · CP2 à 40, gris',
          node: slot(
            <div style={{ display: 'flex', gap: 16, filter: 'grayscale(1)' }}>
              <ClassLevelArt level="CP1" size={40} />
              <ClassLevelArt level="CP2" size={40} />
              <ClassLevelArt level="CP1" size={40} selected />
              <ClassLevelArt level="CP2" size={40} selected />
            </div>,
          ),
        },
      ],
    },
    {
      title: 'F. ProfileStage habitée par un vrai personnage (EcolnaAvatar joy) et l’ardoise',
      cellWidth: 620,
      cellHeight: 980,
      background: '#ffffff',
      cells: [
        {
          label: 'Volet gauche iPad 13" paysage ≈ 600 × 960, personnage 310',
          node: slot(
            <Stage
              w={600}
              h={960}
              avatar={{ x: 145, y: 170, size: 310 }}
              slate={{ x: 110, y: 520, w: 380, h: 150 }}
            />,
          ),
        },
      ],
    },
    {
      title: 'G. ProfileStage — bandeau iPad portrait (1024 × 520) et téléphone (390 × 180)',
      cellWidth: 1060,
      cellHeight: 540,
      background: '#ffffff',
      cells: [
        {
          label: 'iPad portrait, personnage 250',
          node: slot(
            <Stage
              w={1024}
              h={520}
              avatar={{ x: 260, y: 90, size: 250 }}
              slate={{ x: 540, y: 200, w: 360, h: 140 }}
            />,
          ),
        },
        {
          label: 'téléphone, personnage 150',
          node: slot(
            <Stage w={390} h={180} avatar={{ x: 40, y: 15, size: 150 }} slate={{ x: 205, y: 55, w: 160, h: 70 }} />,
          ),
        },
      ],
    },
    {
      title: 'H. ReadingChildScene — onboarding 1 (non redessinée)',
      cellWidth: 660,
      cellHeight: 230,
      background: '#ffffff',
      cells: [
        { label: '640 × 210', node: slot(<ReadingChildScene width={640} height={210} />) },
        { label: '360 × 210', node: slot(<ReadingChildScene width={360} height={210} />) },
      ],
    },
    {
      title: 'I. Prototype DA — enclos de face, vide, sans objet dénombrable (comparé à la v1 de l’équipe)',
      cellWidth: 300,
      cellHeight: 250,
      background: '#ffffff',
      cells: [
        { label: 'prototype dans la carte (160)', node: slot(<CountCard width={280}><PenProto size={160} /></CountCard>) },
        { label: 'équipe dans la carte (160)', node: slot(<CountCard width={280}><EmptyQuantityScene size={160} /></CountCard>) },
        { label: 'prototype 64 · silhouette · gris', node: slot(<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}><PenProto size={64} />{black(<PenProto size={64} />)}<div style={{ filter: 'grayscale(1)', lineHeight: 0 }}><PenProto size={64} /></div></div>) },
        { label: 'prototype ×3', node: slot(<PenProto size={240} />) },
      ],
    },
  ],
};
