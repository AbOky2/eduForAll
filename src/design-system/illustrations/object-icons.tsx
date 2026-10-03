import type React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';

import { CURRICULUM_ICONS, PictoEye as Eye, Person } from './curriculum-icons';
import { O, crescent, disc, ellipseCrescent, oval, pill } from './illustration-palette';

/**
 * Pictogrammes des exercices (comptage, association image-mot), v4 « Épure ».
 *
 * Même main que `curriculum-icons.tsx` : grille 48 × 48, l'objet remplit
 * 80 à 85 % de la case, vue de face (ou de profil pour les animaux, sans
 * fausse perspective), aplats en deux ou trois tons d'une même rampe, lumière
 * en haut à gauche, aucun contour, aucun reflet. Toutes les couleurs viennent
 * des jetons (`tokens/illustration.ts`, section `objects`).
 * Les ids sont ceux du manifeste de contenu.
 */

interface ObjectIconProps {
  id: string;
  size?: number;
}

const BOX = '0 0 48 48';
const round = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

function Goat({ size }: { size: number }) {
  // La chèvre rousse du Sahel, de profil : longues pattes, oreille tombante,
  // cornes rejetées en arrière, barbiche, queue dressée.
  const c = O.fawn;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(13.4, 30, 13.4, 43.2, 1.5)}${pill(30.6, 30, 30.6, 43.2, 1.5)}`} fill={c.shade} />
      <Path d="M6.4 21.6C5 19.8 5 17.4 6.6 15.8C7.4 17.6 8.6 19 10 19.8Z" fill={c.base} />
      <Path d="M8 25C8 19.6 12 18 18 18H28.4L32.6 11.2L38.2 14.6L35.2 25.4C34.6 30 31.4 32 27 32H14.6C10.4 32 8 29.6 8 25Z" fill={c.base} />
      <Path d={ellipseCrescent(21, 25, 13, 7, -1.2, -3.6)} fill={c.shade} />
      <Path d={`${pill(10.4, 30, 10.4, 43.4, 1.6)}${pill(27.4, 30, 27.4, 43.4, 1.6)}`} fill={c.base} />
      <Path d="M36.4 9.6C34.8 5.6 31.4 4 28.4 4.8" stroke={O.bark.base} strokeWidth={2.4} {...round} />
      <Path d="M33.4 9.6C34.6 7.2 37.6 6.4 39.8 8.4L44 13.4C45 14.8 44.2 16.8 42.4 16.6C40.4 16.4 38 15.4 35.8 13.8C33.6 12.4 32.6 11 33.4 9.6Z" fill={c.base} />
      <Path d="M34.6 10.6C32.2 11 30.2 13 29.8 15.8C32 15.8 34 14.4 35.6 12.2Z" fill={c.shade} />
      <Path d="M41.4 16.2L40.8 21.6L38 15.6Z" fill={c.shade} />
      <Eye cx={38.6} cy={10.8} r={1.15} />
    </Svg>
  );
}

function Mango({ size }: { size: number }) {
  // Un haricot allongé vert-jaune, penché, avec sa queue et une feuille.
  const c = O.mango;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(23 27.4) rotate(-32)">
        <Path d="M-19 4C-20 -6 -10 -13 1 -13C12 -13 20 -7 20 1C20 9 13 13 5 12.5C-1 12 -3 8 -9 9C-14 10 -18 9 -19 4Z" fill={c.base} />
        <Path d="M20 1C20 9 13 13 5 12.5C-1 12 -3 8 -9 9C-3 4.6 9 7.2 20 1Z" fill={c.shade} />
        <Path d="M-19 4C-20 -6 -10 -13 1 -13C-7 -10 -14 -5 -19 4Z" fill={c.light} />
      </G>
      <Path d="M34.6 12.2C35 9.6 36 7.6 37.6 6.2" stroke={O.bark.base} strokeWidth={1.8} {...round} />
      <Path d="M36.4 8C38.6 4.6 42.4 3.6 45 4.6C43.8 8 40.2 9.6 36.4 8Z" fill={O.leaf.base} />
      <Path d="M36.4 8C39 6.6 41.6 5.6 45 4.6C43.8 8 40.2 9.6 36.4 8Z" fill={O.leaf.shade} />
    </Svg>
  );
}

function Hut({ size }: { size: number }) {
  // La case ronde : mur de banco, toit de paille conique.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={8} y={21} width={32} height={23} rx={2} fill={O.banco.base} />
      <Path d="M30 21H40V42C40 43.1 39.1 44 38 44H30Z" fill={O.banco.shade} />
      <Path d="M19.4 44V36A4.6 4.6 0 0 1 28.6 36V44Z" fill={O.bark.base} />
      <Path d="M24 3.6C29.4 9 37.6 17.4 44.6 23.4C38 26.2 31 27.2 24 27.2C17 27.2 10 26.2 3.4 23.4C10.4 17.4 18.6 9 24 3.6Z" fill={O.straw.base} />
      <Path d="M24 3.6C29.4 9 37.6 17.4 44.6 23.4C38 26.2 31 27.2 24 27.2C26.4 19 26.6 10 24 3.6Z" fill={O.straw.shade} />
      <Path d="M24 3.6C21 10 16.6 16.6 11.6 21.6M24 3.6C22.4 11 21 18 19.6 25" stroke={O.straw.light} strokeWidth={1.4} {...round} />
    </Svg>
  );
}

function Star({ size }: { size: number }) {
  // L'étoile plate de la récompense v4, coins adoucis, d'un seul ton.
  const c = O.sun;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path
        d="M24 5.4L29.1 16.2L40.9 17.7L32.2 25.8L34.4 37.5L24 31.8L13.6 37.5L15.8 25.8L7.1 17.7L18.9 16.2Z"
        fill={c.base}
        stroke={c.base}
        strokeWidth={4.4}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Calabash({ size }: { size: number }) {
  // La calebasse coupée, ouverte : intérieur clair, bande pyrogravée.
  const c = O.straw;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M4 19C4 32 12.6 41.6 24 41.6C35.4 41.6 44 32 44 19Z" fill={c.base} />
      <Path d="M44 19C44 32 35.4 41.6 24 41.6C33 38.4 39.6 30.4 40.6 19Z" fill={c.shade} />
      <Path d="M4 19A20 5 0 0 1 44 19A20 5 0 0 1 4 19Z" fill={c.base} />
      <Path d="M7 19.4A17 3.4 0 0 1 41 19.4A17 3.4 0 0 1 7 19.4Z" fill={c.light} />
      <Path d="M6.4 27.2L10.6 31L14.8 27.6L19 31.6L23.2 28L27.4 31.6L31.6 27.6L35.8 31L40.2 27.4" stroke={c.shade} strokeWidth={1.6} {...round} />
    </Svg>
  );
}

function Moto({ size }: { size: number }) {
  // La moto du quotidien, de profil.
  const tyre = O.rubber;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${disc(11.6, 35, 7.8)}${disc(36.4, 35, 7.8)}`} fill={tyre.base} />
      <Path d={`${disc(11.5, 35, 3.6)}${disc(36.5, 35, 3.6)}`} fill={O.metal.base} />
      <Path d={pill(36.5, 35, 33.2, 17.6, 1.4)} fill={O.metal.shade} />
      <Rect x={18} y={27} width={10} height={7.6} rx={2} fill={O.metal.shade} />
      <Path d={pill(9.4, 31.6, 21, 31.6, 1.3)} fill={O.metal.base} />
      <Path d="M6.4 27.2C6.8 24.8 9 24 11.6 24H27.2L31.4 18H35.6L33.6 25.6C32 28.6 29.6 29.6 26.4 29.6H10C7.8 29.6 6.2 29 6.4 27.2Z" fill={O.red.base} />
      <Path d="M33.6 25.6C32 28.6 29.6 29.6 26.4 29.6H10C7.8 29.6 6.2 29 6.4 27.6C14 28 27 27.4 33.6 25.6Z" fill={O.red.shade} />
      <Path d={pill(12.6, 22.2, 24, 22.2, 2.3)} fill={tyre.base} />
      <Path d={pill(30.4, 14.6, 35.6, 14.6, 1.4)} fill={tyre.base} />
      <Path d={disc(38.4, 20.2, 2.2)} fill={O.sun.base} />
    </Svg>
  );
}

function Bed({ size }: { size: number }) {
  // Le lit, de côté : tête de lit, oreiller, pagne-couverture.
  const w = O.wood;
  const p = O.porcelain;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M4 42V13C4 11.3 5.3 10 7 10C8.7 10 10 11.3 10 13V42Z" fill={w.base} />
      <Path d="M38 42V23.4C38 21.7 39.3 20.4 41 20.4C42.7 20.4 44 21.7 44 23.4V42Z" fill={w.base} />
      <Path d="M7.6 10.2C9 10.8 10 11.8 10 13V42H7.6Z" fill={w.shade} />
      <Path d="M41.6 20.5C43 21 44 22.1 44 23.4V42H41.6Z" fill={w.shade} />
      <Rect x={9} y={30.4} width={30} height={5} fill={w.shade} />
      <Rect x={10} y={25} width={28} height={6} rx={1.2} fill={p.base} />
      <Path d={oval(16, 22.4, 5.4, 3.4)} fill={p.base} />
      <Path d={ellipseCrescent(16, 22.4, 5.4, 3.4, -1, -1.4)} fill={p.shade} />
      <Path d="M20.4 34.6V25C20.4 22.6 22.2 21 24.6 21H35.6C37 21 38 22 38 23.4V34.6C32.4 35.6 26 35.6 20.4 34.6Z" fill={O.orange.base} />
      <Path d="M20.4 27H38V30H20.4Z" fill={O.sun.base} />
      <Path d="M33 21H35.6C37 21 38 22 38 23.4V34.6C36.4 34.9 34.7 35.1 33 35.2Z" fill={O.orange.shade} />
      <Path d="M33 27H38V30H33Z" fill={O.sun.shade} />
    </Svg>
  );
}

function Tomato({ size }: { size: number }) {
  const c = O.red;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={oval(24, 27.4, 19, 16.4)} fill={c.base} />
      <Path d={ellipseCrescent(24, 27.4, 19, 16.4, -4.6, -5)} fill={c.shade} />
      <Path d={ellipseCrescent(24, 27.4, 19, 16.4, 3.4, 3.6)} fill={c.light} />
      <Path d="M24 13.6C21.8 10.6 18.4 9.6 14.6 10.6C16.6 13 19.8 14.6 24 14.6C28.2 14.6 31.4 13 33.4 10.6C29.6 9.6 26.2 10.6 24 13.6Z" fill={O.leaf.base} />
      <Path d="M24 14.6C23.4 17.6 21.8 19.4 19.4 20.2C21.8 20.8 24 20 25.6 17.8C27 19.8 29.4 20.6 31.6 19.6C28.8 18.6 26.4 16.8 24 14.6Z" fill={O.leaf.shade} />
      <Path d={pill(24, 13.4, 25.6, 6.8, 1.3)} fill={O.leaf.shade} />
    </Svg>
  );
}

function Salad({ size }: { size: number }) {
  // Le bol de salade : feuilles, tomate, oignon.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${disc(14.4, 21.4, 7.4)}${disc(24, 16.8, 8.6)}${disc(33.6, 21, 7.6)}`} fill={O.leaf.base} />
      <Path d={`${crescent(24, 16.8, 8.6, -2, -2.6)}${crescent(33.6, 21, 7.6, -2, -2.4)}`} fill={O.leaf.shade} />
      <Path d={disc(19.6, 21, 4)} fill={O.red.base} />
      <Path d={disc(29.4, 22.6, 3.6)} fill={O.red.base} />
      <Path d={`${disc(19.6, 21, 1.8)}${disc(29.4, 22.6, 1.6)}`} fill={O.red.light} />
      <Path d="M4 25H44C44 35.6 35 42.4 24 42.4C13 42.4 4 35.6 4 25Z" fill={O.teal.base} />
      <Path d={ellipseCrescent(24, 25, 20, 17.4, -4.6, -4.2)} fill={O.teal.shade} />
      <Path d="M4 25H44V25.2H4Z" fill={O.teal.base} />
    </Svg>
  );
}

function Father({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Person
        skin="acajou"
        cloth={O.blue}
        mood="smile"
        hair="short"
        beard="short"
        collar="shirt"
      />
    </Svg>
  );
}

function Friends({ size }: { size: number }) {
  // Deux enfants côte à côte : un garçon, une fille aux couettes.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(12.76 4.4) scale(0.86)">
        <Person skin="cacao" cloth={O.green} mood="joy" hair="short" child shoulders={11.5} />
      </G>
      <G transform="translate(-6 4.4) scale(0.86)">
        <Person skin="miel" cloth={O.orange} mood="joy" hair="puffs" child shoulders={11.5} />
      </G>
    </Svg>
  );
}

function Cat({ size }: { size: number }) {
  // Le chat assis, de face.
  const c = O.ginger;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(24 24) scale(1.06) translate(-24 -24)">
        <Path d="M33.4 40.6C39.4 40.6 43.6 37.2 43.6 31.4C43.6 28.4 42 26.6 40.2 26.8" stroke={c.shade} strokeWidth={3.4} {...round} />
        <Path d="M24 18C31 18 34.4 26 34.4 33.6C34.4 38.6 31 42.6 24 42.6C17 42.6 13.6 38.6 13.6 33.6C13.6 26 17 18 24 18Z" fill={c.base} />
        <Path d="M20 30.4C21 33.6 22.4 36 24 36C25.6 36 27 33.6 28 30.4C28.6 34 29 38 28.4 42.4H19.6C19 38 19.4 34 20 30.4Z" fill={c.light} />
        <Path d="M11 5.4L19.4 10.4H28.6L37 5.4L37.4 17.6C37.4 23.8 31.6 27.8 24 27.8C16.4 27.8 10.6 23.8 10.6 17.6Z" fill={c.base} />
        <Path d="M13 8.8L17.6 11.6L13.4 14.2Z" fill={c.shade} />
        <Path d="M35 8.8L30.4 11.6L34.6 14.2Z" fill={c.shade} />
        <Path d="M21.6 11.2L22.4 14.6M24 10.8V14.8M26.4 11.2L25.6 14.6" stroke={c.shade} strokeWidth={1.4} {...round} />
        <Eye cx={19.2} cy={18.4} r={1.6} />
        <Eye cx={28.8} cy={18.4} r={1.6} />
        <Path d="M22.4 21.6H25.6L24 23.2Z" fill={O.pink.shade} stroke={O.pink.shade} strokeWidth={0.8} strokeLinejoin="round" />
        <Path d="M21.6 25.2C22.8 25.6 23.6 25 24 23.6C24.4 25 25.2 25.6 26.4 25.2" stroke={c.shade} strokeWidth={1.1} {...round} />
        <Path d="M17 22.4L11 21.4M17 24.4L11.4 25.6M31 22.4L37 21.4M31 24.4L36.6 25.6" stroke={c.shade} strokeWidth={1} {...round} />
      </G>
    </Svg>
  );
}

function Sheep({ size }: { size: number }) {
  // Le mouton du Sahel, de profil : toison festonnée, tête brune, oreille tombante.
  const w = O.wool;
  const face = O.bark;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(14.6, 32, 14.6, 43.2, 1.5)}${pill(31.6, 32, 31.6, 43.2, 1.5)}`} fill={face.shade} />
      <Path d={`${pill(11.4, 32, 11.4, 43.4, 1.6)}${pill(28.4, 32, 28.4, 43.4, 1.6)}`} fill={face.base} />
      <Path
        d={`${disc(10.6, 22, 5.2)}${disc(17, 17.6, 6)}${disc(25, 17, 6.2)}${disc(32, 21, 5.6)}${disc(9.6, 29, 5)}${disc(16.4, 32, 5.2)}${disc(24.4, 32.2, 5.2)}${disc(31.6, 29, 5.4)}${oval(21, 25, 12, 8)}`}
        fill={w.base}
      />
      <Path d={`${crescent(16.4, 32, 5.2, -1.4, -2.2)}${crescent(24.4, 32.2, 5.2, -1.4, -2.2)}${crescent(31.6, 29, 5.4, -1.6, -2.2)}${crescent(9.6, 29, 5, -1.4, -2.2)}`} fill={w.shade} />
      <Path d="M33.6 14.4C35.4 11.6 39.6 11.2 42 13.6C43.8 15.4 44.6 18.4 44.2 21.2C43.8 23.8 41.6 25.2 39.4 24.6C36.6 23.8 34.6 21.6 33.6 19C33 17.4 32.8 15.8 33.6 14.4Z" fill={face.base} />
      <Path d="M35 15.2C32.4 15.4 30 17.2 29.4 20C31.8 20.4 34.2 19.4 35.8 17.4Z" fill={face.shade} />
      <Path d={disc(36.6, 13.6, 3.4)} fill={w.base} />
      <Eye cx={39.4} cy={17} r={1.15} />
    </Svg>
  );
}

function Soap({ size }: { size: number }) {
  // Le savon et sa mousse.
  const c = O.sky;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={4} y={22} width={40} height={20} rx={7} fill={c.base} />
      <Path d="M44 29V35C44 38.9 40.9 42 37 42H11C7.1 42 4 38.9 4 35V34C12 37 30 37.4 44 29Z" fill={c.shade} />
      <Path d={`${disc(13, 22.6, 5)}${disc(20.4, 20.4, 5.6)}${disc(27.6, 22.4, 4.4)}`} fill={O.porcelain.base} />
      <Path d={`${crescent(20.4, 20.4, 5.6, -1.4, -1.8)}${crescent(27.6, 22.4, 4.4, -1.2, -1.6)}`} fill={O.porcelain.shade} />
      <Path d={`${disc(31.6, 12.6, 4.2)}${disc(39.4, 7.8, 2.8)}${disc(23.6, 8.6, 2.4)}`} fill={c.light} />
      <Path d={`${crescent(31.6, 12.6, 4.2, -1.2, -1.4)}${crescent(39.4, 7.8, 2.8, -0.8, -1)}${crescent(23.6, 8.6, 2.4, -0.7, -0.9)}`} fill={c.base} />
    </Svg>
  );
}

function King({ size }: { size: number }) {
  // Le roi des contes : couronne d'or, manteau violet.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Person skin="cannelle" cloth={O.violet} mood="smile" hair="short" beard="short" collar="cape" headY={17.4} />
      <Path d="M15.6 12.4L14.8 3.6L19.6 7.6L24 2.4L28.4 7.6L33.2 3.6L32.4 12.4Z" fill={O.sun.base} stroke={O.sun.base} strokeWidth={1.4} strokeLinejoin="round" />
      <Path d="M24 2.4L28.4 7.6L33.2 3.6L32.4 12.4H24Z" fill={O.sun.shade} stroke={O.sun.shade} strokeWidth={0.1} />
      <Path d={`${disc(19.4, 10, 1.1)}${disc(28.6, 10, 1.1)}`} fill={O.red.base} />
      <Path d={disc(24, 10, 1.3)} fill={O.blue.base} />
    </Svg>
  );
}

function Wolf({ size }: { size: number }) {
  // Le loup des fables, de face : oreilles pointues, museau clair.
  const c = O.wolf;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M8.4 4.6L19 12.6H29L39.6 4.6L40.6 18.8L44.4 27.4L37.2 30.6C34.6 37.4 30 42.4 24 42.4C18 42.4 13.4 37.4 10.8 30.6L3.6 27.4L7.4 18.8Z" fill={c.base} />
      <Path d="M11.6 9.8L16.6 13.4L12.4 16.6Z" fill={c.shade} />
      <Path d="M36.4 9.8L31.4 13.4L35.6 16.6Z" fill={c.shade} />
      <Path d="M24 21C28.4 21 31.6 25.6 32.6 31C31.4 37.8 28 42.4 24 42.4C20 42.4 16.6 37.8 15.4 31C16.4 25.6 19.6 21 24 21Z" fill={c.light} />
      <Path d="M21.4 30.6H26.6C26.6 32.4 25.4 33.8 24 33.8C22.6 33.8 21.4 32.4 21.4 30.6Z" fill={O.ink.base} />
      <Path d="M24 33.8V36.4M21 37.4C22.4 38.4 25.6 38.4 27 37.4" stroke={c.shade} strokeWidth={1.2} {...round} />
      <Eye cx={18.2} cy={22.6} r={1.6} />
      <Eye cx={29.8} cy={22.6} r={1.6} />
    </Svg>
  );
}

function Wood({ size }: { size: number }) {
  // Le fagot de bûches : trois rondins, la coupe en bout.
  const bark = O.bark;
  const cut = O.wood;
  const log = (x: number, y: number) => (
    <>
      <Path d={pill(x, y, x + 22, y, 6)} fill={bark.base} />
      <Path d={ellipseCrescent(x + 11, y, 17, 6, 0, -2.2)} fill={bark.shade} />
      <Path d={oval(x + 22, y, 5, 6)} fill={cut.light} />
      <Path d={oval(x + 22, y, 2.4, 3)} fill={cut.base} />
    </>
  );
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      {log(13, 16.6)}
      {log(10, 29.6)}
      {log(17, 36)}
    </Svg>
  );
}

const REGISTRY: Record<string, (props: { size: number }) => React.ReactElement> = {
  'icon-goat': Goat,
  'icon-mango': Mango,
  'icon-hut': Hut,
  'icon-star': Star,
  'icon-calabash': Calabash,
  'icon-moto': Moto,
  'icon-bed': Bed,
  'icon-tomato': Tomato,
  'icon-salad': Salad,
  'icon-father': Father,
  'icon-friends': Friends,
  'icon-cat': Cat,
  'icon-sheep': Sheep,
  'icon-soap': Soap,
  'icon-king': King,
  'icon-wolf': Wolf,
  'icon-wood': Wood,
  // The vocabulary set covering the 18 official « Langage » themes.
  ...CURRICULUM_ICONS,
};

/** Explicit fallback: a missing illustration renders a neutral shape, never a crash. */
export function ObjectIcon({ id, size = 48 }: ObjectIconProps) {
  const Component = REGISTRY[id];
  if (!Component) {
    return (
      <Svg width={size} height={size} viewBox={BOX}>
        <Rect x={8} y={8} width={32} height={32} rx={8} fill={O.porcelain.base} />
        <Path d="M18 30l6-12 6 12z" fill={O.porcelain.shade} />
      </Svg>
    );
  }
  return <Component size={size} />;
}

export function hasObjectIcon(id: string): boolean {
  return id in REGISTRY;
}
