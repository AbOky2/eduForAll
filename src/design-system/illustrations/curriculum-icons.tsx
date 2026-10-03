import type React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import {
  CHALK,
  COINS,
  FACE,
  HAIR,
  KHAKI,
  O,
  SKIN,
  SLATE,
  type Ramp,
  crescent,
  disc,
  drop,
  egg,
  ellipseCrescent,
  oval,
  pill,
} from './illustration-palette';

/**
 * Pictograms for the 18 vocabulary themes of the « Langage/Élocution »
 * programme (MEN Tchad 2004, p. 19) and for the maths, reading and writing
 * lessons that need a concrete object.
 *
 * v4 « Épure » (design/direction-v4-epure.md), même main que
 * `object-icons.tsx` : grille 48 × 48, l'objet remplit 80 à 85 % de la case,
 * vue de face (les animaux de profil), aplats en deux ou trois tons d'une
 * même rampe, lumière en haut à gauche ; aucun contour, aucun reflet, aucune
 * couleur en dur (jetons `illustration.objects`). Les personnes sont
 * construites comme les portraits des enfants (`avatars/portrait.tsx`) :
 * tête ovale, yeux pleins avec un point de lumière, sourcils de la couleur
 * des cheveux, nez et bouche d'un trait. Tout est dessiné — aucune image,
 * aucun réseau.
 */

type IconProps = { size: number };
const BOX = '0 0 48 48';
const round = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

/** Le corps humain : une seule peau pour tout le thème. */
const BODY = SKIN.cannelle;

/** Les sentiments : la tête d'un enfant, en grand, le buste coupé par la case. */
const FEELING = 'translate(24 22) scale(1.3) translate(-24 -18)';

// ---------------------------------------------------------------------------
// Briques communes : l'œil, le visage, la personne.
// ---------------------------------------------------------------------------

/** Un œil plein avec son point de lumière, en haut à droite comme les portraits. */
export function PictoEye({ cx, cy, r, ry }: { cx: number; cy: number; r: number; ry?: number }) {
  const h = ry ?? r;
  return (
    <>
      <Ellipse cx={cx} cy={cy} rx={r} ry={h} fill={FACE.eye} />
      <Circle cx={cx + r * 0.32} cy={cy - h * 0.36} r={Math.max(0.42, r * 0.36)} fill={FACE.catchlight} />
    </>
  );
}

type SkinName = keyof typeof SKIN;
export type PersonMood = 'calm' | 'smile' | 'joy' | 'sad' | 'angry' | 'afraid';

/**
 * Le visage d'un portrait v4, posé dans l'ovale (`cx`, `cy`, `rx`, `ry`) :
 * joues prémélangées, sourcils, yeux, nez d'un trait, bouche.
 */
export function Face({
  cx,
  cy,
  rx,
  ry,
  skin,
  mood = 'calm',
  brows = true,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  skin: SkinName;
  mood?: PersonMood;
  brows?: boolean;
}) {
  const tone = SKIN[skin];
  const ex = 0.4 * rx;
  const ey = cy + 0.14 * ry;
  const er = Math.max(0.18 * rx, 1.2);
  const eh = Math.max(0.21 * ry, 1.5);
  // Les sentiments se lisent de loin : sourcils et bouche plus marqués.
  const strong = mood === 'sad' || mood === 'angry' || mood === 'afraid';
  const line = Math.max((strong ? 0.17 : 0.13) * rx, 1);
  const by = ey - eh - 0.16 * ry;
  const lift = mood === 'joy' ? -0.5 : 0;
  const browD = {
    calm: `M${cx - ex - 1.5} ${by + 0.4}Q${cx - ex} ${by - 0.8} ${cx - ex + 1.6} ${by}M${cx + ex - 1.6} ${by}Q${cx + ex} ${by - 0.8} ${cx + ex + 1.5} ${by + 0.4}`,
    sad: `M${cx - ex - 1.6} ${by + 0.6}Q${cx - ex} ${by - 0.2} ${cx - ex + 1.6} ${by - 1}M${cx + ex - 1.6} ${by - 1}Q${cx + ex} ${by - 0.2} ${cx + ex + 1.6} ${by + 0.6}`,
    angry: `M${cx - ex - 1.6} ${by - 0.8}L${cx - ex + 1.8} ${by + 1}M${cx + ex - 1.8} ${by + 1}L${cx + ex + 1.6} ${by - 0.8}`,
    afraid: `M${cx - ex - 1.6} ${by - 0.2}Q${cx - ex} ${by - 1.8} ${cx - ex + 1.6} ${by - 1.2}M${cx + ex - 1.6} ${by - 1.2}Q${cx + ex} ${by - 1.8} ${cx + ex + 1.6} ${by - 0.2}`,
  };
  const browPath =
    mood === 'sad' ? browD.sad : mood === 'angry' ? browD.angry : mood === 'afraid' ? browD.afraid : browD.calm;
  const my = cy + 0.64 * ry;
  const mw = (strong ? 0.3 : 0.22) * rx;
  return (
    <>
      <Path d={`${oval(cx - 0.62 * rx, cy + 0.46 * ry, 0.19 * rx, 0.12 * ry)}${oval(cx + 0.62 * rx, cy + 0.46 * ry, 0.19 * rx, 0.12 * ry)}`} fill={tone.blush} />
      {brows ? (
        <G transform={lift ? `translate(0 ${lift})` : undefined}>
          <Path d={browPath} stroke={HAIR.base} strokeWidth={line} {...round} />
        </G>
      ) : null}
      {mood === 'joy' ? (
        <Path
          d={`M${cx - ex - er} ${ey + 0.4}Q${cx - ex} ${ey - eh * 1.3} ${cx - ex + er} ${ey + 0.4}M${cx + ex - er} ${ey + 0.4}Q${cx + ex} ${ey - eh * 1.3} ${cx + ex + er} ${ey + 0.4}`}
          stroke={FACE.eye}
          strokeWidth={line * 1.15}
          {...round}
        />
      ) : (
        <>
          <PictoEye cx={cx - ex} cy={ey} r={mood === 'afraid' ? er * 1.15 : er} ry={mood === 'afraid' ? eh * 1.15 : eh} />
          <PictoEye cx={cx + ex} cy={ey} r={mood === 'afraid' ? er * 1.15 : er} ry={mood === 'afraid' ? eh * 1.15 : eh} />
        </>
      )}
      <Path d={`M${cx - 0.14 * rx} ${cy + 0.42 * ry}Q${cx} ${cy + 0.5 * ry} ${cx + 0.14 * rx} ${cy + 0.42 * ry}`} stroke={tone.shade} strokeWidth={Math.max(0.12 * rx, 0.9)} {...round} />
      {mood === 'joy' ? (
        <>
          <Path d={`M${cx - mw * 1.25} ${my - 0.4}H${cx + mw * 1.25}C${cx + mw * 1.25} ${my + 2.6} ${cx + 1.4} ${my + 3.6} ${cx} ${my + 3.6}C${cx - 1.4} ${my + 3.6} ${cx - mw * 1.25} ${my + 2.6} ${cx - mw * 1.25} ${my - 0.4}Z`} fill={FACE.mouth} />
          <Path d={`M${cx - 1.3} ${my + 2.9}C${cx - 0.6} ${my + 2.2} ${cx + 0.6} ${my + 2.2} ${cx + 1.3} ${my + 2.9}C${cx + 0.9} ${my + 3.4} ${cx + 0.4} ${my + 3.6} ${cx} ${my + 3.6}C${cx - 0.4} ${my + 3.6} ${cx - 0.9} ${my + 3.4} ${cx - 1.3} ${my + 2.9}Z`} fill={FACE.tongue} />
        </>
      ) : mood === 'smile' ? (
        <Path d={`M${cx - mw * 1.2} ${my - 0.2}Q${cx} ${my + 2.2} ${cx + mw * 1.2} ${my - 0.2}`} stroke={FACE.mouth} strokeWidth={line} {...round} />
      ) : mood === 'sad' || mood === 'angry' ? (
        <Path d={`M${cx - mw * 1.15} ${my + 1.2}Q${cx} ${my - 0.9} ${cx + mw * 1.15} ${my + 1.2}`} stroke={FACE.mouth} strokeWidth={line} {...round} />
      ) : mood === 'afraid' ? (
        <Path d={oval(cx, my + 0.8, mw * 0.8, 1.6)} fill={FACE.mouth} />
      ) : (
        <Path d={`M${cx - mw} ${my}Q${cx} ${my + 1.4} ${cx + mw} ${my}`} stroke={FACE.mouth} strokeWidth={line} {...round} />
      )}
    </>
  );
}

export type PersonHair = 'short' | 'puffs' | 'wrap' | 'white' | 'curl' | 'none';

/**
 * Une personne en buste, construite comme les portraits v4 (repère 48 :
 * tête centrée en x = 24, buste jusqu'au bas de la case). `child` donne les
 * proportions d'un enfant (tête plus grande, épaules plus étroites).
 */
export function Person({
  skin,
  cloth,
  mood = 'calm',
  hair = 'short',
  beard,
  collar = 'round',
  child = false,
  headY,
  wrap,
  shoulders,
  glasses = false,
}: {
  skin: SkinName;
  cloth: Ramp;
  mood?: PersonMood;
  hair?: PersonHair;
  beard?: 'short' | 'white';
  collar?: 'round' | 'v' | 'shirt' | 'cape';
  child?: boolean;
  headY?: number;
  /** Couleur du foulard (`hair = 'wrap'`). */
  wrap?: Ramp;
  /** Demi-largeur des épaules (par défaut : adulte 19,5, enfant 16,5). */
  shoulders?: number;
  glasses?: boolean;
}) {
  const tone = SKIN[skin];
  const cx = 24;
  const rx = child ? 8.8 : 7.4;
  const ry = child ? 9.4 : 8.6;
  const cy = headY ?? (child ? 16.4 : 16);
  const chin = cy + ry;
  const s = chin + (child ? 2.6 : 3.8);
  const w = shoulders ?? (child ? 16.5 : 19.5);
  const b = 44;
  const neck = child ? 2.8 : 3;
  const scarf = wrap ?? O.orange;
  return (
    <>
      {hair === 'puffs' ? <Path d={`${disc(cx - rx * 0.92, cy - ry * 0.78, rx * 0.5)}${disc(cx + rx * 0.92, cy - ry * 0.78, rx * 0.5)}`} fill={HAIR.base} /> : null}
      <Path d={`M${cx - neck} ${cy}H${cx + neck}V${s + 2}H${cx - neck}Z`} fill={tone.shade} />
      <Path
        d={`M${cx - w} ${b}C${cx - w} ${s + 6.6} ${cx - w + 5.4} ${s + 0.6} ${cx - 6} ${s}H${cx + 6}C${cx + w - 5.4} ${s + 0.6} ${cx + w} ${s + 6.6} ${cx + w} ${b}Z`}
        fill={cloth.base}
      />
      <Path
        d={`M${cx + 0.71 * w} ${b}C${cx + 0.71 * w} ${s + 9} ${cx + 0.61 * w} ${s + 3.4} ${cx + 0.46 * w} ${s + 0.6}C${cx + 0.77 * w} ${s + 1.6} ${cx + w} ${s + 6.6} ${cx + w} ${b}Z`}
        fill={cloth.shade}
      />
      {collar === 'v' || collar === 'shirt' || collar === 'cape' ? (
        <Path d={`M${cx - neck - 0.6} ${s}L${cx} ${s + 5}L${cx + neck + 0.6} ${s}Z`} fill={tone.shade} />
      ) : (
        <Path d={`M${cx - neck - 0.4} ${s}C${cx - neck} ${s + 2.4} ${cx + neck} ${s + 2.4} ${cx + neck + 0.4} ${s}Z`} fill={tone.shade} />
      )}
      {collar === 'shirt' ? (
        <Path d={`M${cx - neck - 0.8} ${s - 0.6}L${cx} ${s + 5}L${cx - 5.6} ${s + 4.4}L${cx - 7.2} ${s + 0.4}ZM${cx + neck + 0.8} ${s - 0.6}L${cx} ${s + 5}L${cx + 5.6} ${s + 4.4}L${cx + 7.2} ${s + 0.4}Z`} fill={cloth.light} />
      ) : null}
      {collar === 'cape' ? (
        <Path d={`M${cx - neck - 1} ${s - 0.2}L${cx} ${s + 5.4}L${cx + neck + 1} ${s - 0.2}`} stroke={O.sun.base} strokeWidth={1.8} {...round} />
      ) : null}
      <Path d={`${disc(cx - rx - 0.2, cy + 1.4, child ? 2 : 1.8)}${disc(cx + rx + 0.2, cy + 1.4, child ? 2 : 1.8)}`} fill={tone.base} />
      <Path d={egg(cx, cy, rx, ry)} fill={tone.base} />
      {beard === 'white' ? <Path d={ellipseCrescent(cx, cy + 0.2, rx * 1.02, ry * 1.04, 0, -ry * 0.5)} fill={O.wool.base} /> : null}
      {beard === 'short' ? <Path d={ellipseCrescent(cx, cy + 0.2, rx * 1.01, ry * 1.0, 0, -ry * 0.24)} fill={HAIR.base} /> : null}
      <Face cx={cx} cy={cy} rx={rx} ry={ry} skin={skin} mood={mood} brows={hair !== 'white'} />
      {beard === 'short' ? <Path d={`M${cx - 2.4} ${cy + 0.55 * ry}Q${cx} ${cy + 0.42 * ry} ${cx + 2.4} ${cy + 0.55 * ry}`} stroke={HAIR.base} strokeWidth={1.1} {...round} /> : null}
      {hair === 'short' || hair === 'puffs' ? <Path d={ellipseCrescent(cx, cy - 0.06 * ry, rx * 1.05, ry * 1.03, 0, ry * (child ? 0.42 : 0.36))} fill={HAIR.base} /> : null}
      {hair === 'white' ? (
        <Path d={`${oval(cx - rx * 0.9, cy - ry * 0.14, rx * 0.2, ry * 0.36)}${oval(cx + rx * 0.9, cy - ry * 0.14, rx * 0.2, ry * 0.36)}`} fill={O.wool.base} />
      ) : null}
      {glasses ? (
        <Path
          d={`${oval(cx - 0.4 * rx, cy + 0.14 * ry, 0.34 * rx, 0.32 * ry)}${oval(cx + 0.4 * rx, cy + 0.14 * ry, 0.34 * rx, 0.32 * ry)}M${cx - 0.06 * rx} ${cy + 0.1 * ry}H${cx + 0.06 * rx}`}
          stroke={O.ink.light}
          strokeWidth={0.9}
          fill="none"
        />
      ) : null}
      {hair === 'curl' ? (
        <Path d={`M${cx - 1.6} ${cy - ry + 0.6}C${cx - 1.6} ${cy - ry - 2.4} ${cx + 2.2} ${cy - ry - 2.6} ${cx + 2.2} ${cy - ry - 0.6}`} stroke={HAIR.base} strokeWidth={1.6} {...round} />
      ) : null}
      {hair === 'wrap' ? (
        <>
          <Path d={ellipseCrescent(cx, cy - ry * 0.34, rx * 1.16, ry * 1.0, 0, ry * 0.62)} fill={scarf.base} />
          <Path d={`${disc(cx - 2.6, cy - ry * 1.32, 2.6)}${disc(cx + 2.6, cy - ry * 1.32, 2.6)}`} fill={scarf.shade} />
          <Path d={ellipseCrescent(cx, cy - ry * 0.34, rx * 1.16, ry * 1.0, -rx * 0.34, ry * 0.5)} fill={scarf.shade} />
        </>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// Thème : l'école
// ---------------------------------------------------------------------------

function School({ size }: IconProps) {
  // L'école : murs de banco, toit de tôle, porte et volets bleus, et le
  // drapeau du Tchad (bleu, or, rouge) qui la distingue d'une maison.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={pill(30.4, 4.2, 30.4, 14, 0.8)} fill={O.rubber.light} />
      <Path d="M31 3.6H34.6V10.8H31Z" fill={O.blue.base} />
      <Path d="M34.6 3.6H38.2V10.8H34.6Z" fill={O.sun.base} />
      <Path d="M38.2 3.6H41.8V10.8H38.2Z" fill={O.red.base} />
      <Rect x={6} y={19} width={36} height={24.4} rx={1.2} fill={O.banco.base} />
      <Path d="M6 19H42V22.8H6Z" fill={O.banco.shade} />
      <Path d="M4 20.2L12.6 12.4H35.4L44 20.2Z" fill={O.metal.base} />
      <Path d="M4 20.2L12.6 12.4L16.2 20.2Z" fill={O.metal.light} />
      <Path d="M35.4 12.4L44 20.2H31.8Z" fill={O.metal.shade} />
      <Rect x={9.6} y={26.4} width={7} height={7.4} rx={1} fill={O.sky.base} />
      <Rect x={31.4} y={26.4} width={7} height={7.4} rx={1} fill={O.sky.base} />
      <Path d="M13.1 26.4H16.6V33.8H13.1ZM34.9 26.4H38.4V33.8H34.9Z" fill={O.sky.shade} />
      <Path d="M20.4 43.4V28.4C20.4 27.6 21 27 21.8 27H26.2C27 27 27.6 27.6 27.6 28.4V43.4Z" fill={O.blue.base} />
      <Path d="M24 27H26.2C27 27 27.6 27.6 27.6 28.4V43.4H24Z" fill={O.blue.shade} />
    </Svg>
  );
}

function Slate({ size }: IconProps) {
  // L'ardoise — the CP writing support named by the programme (p. 26) :
  // une plaque sombre aux coins doux, sans cadre, et la craie.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={4} y={7} width={40} height={33} rx={6} fill={SLATE.base} />
      <Path d="M44 15.4V34C44 37.3 41.3 40 38 40H10C6.7 40 4 37.3 4 34V33.4C20 34.6 35.4 28.6 44 15.4Z" fill={SLATE.shade} />
      <Path d="M17 17.6C15.4 15.6 11.4 16.2 11.4 20C11.4 23.6 15.4 24.4 17 21.4M17 16.6V22.6C17 23.6 17.8 24 18.8 23.4" stroke={CHALK} strokeWidth={1.9} {...round} />
      <Path d="M23.4 11.4V23.4M23.4 19.6C23.4 17.2 25.2 16 27 16C29 16 30.4 17.6 30.4 19.8C30.4 22 29 23.6 27 23.6C25.2 23.6 23.4 22.4 23.4 20" stroke={CHALK} strokeWidth={1.9} {...round} />
      <Path d="M11 29.4H36" stroke={SLATE.light} strokeWidth={1.4} {...round} />
      <Path d={pill(32.8, 35.4, 41.2, 35.4, 1.7)} fill={CHALK} />
    </Svg>
  );
}

function Teacher({ size }: IconProps) {
  // Le maître : un adulte, chemise à col, devant le tableau.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={20} y={3.6} width={24} height={20.4} rx={3.4} fill={SLATE.base} />
      <Path d="M28.6 9.4C27.6 8.2 25.2 8.6 25.2 10.8C25.2 13 27.6 13.4 28.6 11.6M28.6 8.8V12.4C28.6 13 29.1 13.2 29.7 12.8M33 9.4H39.4M33 13H38" stroke={CHALK} strokeWidth={1.3} {...round} />
      <G transform="translate(-6.6 1.4) scale(0.98)">
        <Person skin="acajou" cloth={O.sky} mood="smile" hair="short" collar="shirt" shoulders={15} />
      </G>
    </Svg>
  );
}

function Satchel({ size }: IconProps) {
  // Le cartable : rabat, fermoir doré, poignée.
  const c = O.blue;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M17 14.6C17 9 20 6.4 24 6.4C28 6.4 31 9 31 14.6" stroke={c.shade} strokeWidth={2.8} {...round} />
      <Rect x={5} y={13} width={38} height={31} rx={6.4} fill={c.shade} />
      <Path d="M5 19.4C5 15.9 7.9 13 11.4 13H36.6C40.1 13 43 15.9 43 19.4V27.4C43 29.4 41.4 31 39.4 31H8.6C6.6 31 5 29.4 5 27.4Z" fill={c.base} />
      <Rect x={20.6} y={26.4} width={6.8} height={7.6} rx={1.8} fill={O.sun.base} />
      <Path d="M24 29.2V31.4" stroke={O.sun.shade} strokeWidth={1.6} {...round} />
    </Svg>
  );
}

function Chalk({ size }: IconProps) {
  // La craie blanche, et son trait sur l'ardoise.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={4} y={15} width={33} height={29} rx={5.4} fill={SLATE.base} />
      <Path d="M9 34.6C11 28.6 14.4 28.4 15.8 32.6C17 36.4 20 36.6 22 31.2" stroke={CHALK} strokeWidth={2} {...round} />
      <G transform="rotate(-45 30 18)">
        <Path d={pill(17, 18, 43, 18, 4.8)} fill={O.porcelain.base} />
        <Path d="M17 18H43A4.8 4.8 0 0 1 43 22.8H17A4.8 4.8 0 0 1 17 18Z" fill={O.porcelain.shade} />
        <Path d={oval(43, 18, 2.4, 4.8)} fill={O.porcelain.light} />
      </G>
    </Svg>
  );
}

function Book({ size }: IconProps) {
  // Le livre ouvert : couverture rouge, deux pages, des lignes.
  const p = O.porcelain;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M4 13.4C10 10.6 18 10.6 24 13.6C30 10.6 38 10.6 44 13.4V40C38 37.4 30 37.4 24 40.2C18 37.4 10 37.4 4 40Z" fill={O.red.base} />
      <Path d="M24 40.2C30 37.4 38 37.4 44 40V13.4C42 37 34 35 24 40.2Z" fill={O.red.shade} />
      <Path d="M6.6 11.2C12 9 18.4 9.2 23.2 12V36.8C18.4 34.4 12 34.2 6.6 36.4Z" fill={p.light} />
      <Path d="M41.4 11.2C36 9 29.6 9.2 24.8 12V36.8C29.6 34.4 36 34.2 41.4 36.4Z" fill={p.base} />
      <Path d="M24.8 12V36.8C25.8 36.2 26.8 35.7 28 35.3V10.4C26.8 10.8 25.8 11.4 24.8 12Z" fill={p.shade} />
      <Path d="M10.4 16.6C13.4 15.6 16.8 15.8 19.6 17M10.4 22C13.4 21 16.8 21.2 19.6 22.4M10.4 27.4C13.4 26.4 16.8 26.6 19.6 27.8M31 17C33.4 15.8 35.6 15.6 37.8 16.2M31 22.4C33.4 21.2 35.6 21 37.8 21.6M31 27.8C33.4 26.6 35.6 26.4 37.8 27" stroke={p.shade} strokeWidth={1.6} {...round} />
    </Svg>
  );
}

function Pencil({ size }: IconProps) {
  // Le crayon : trois faces (lumière, ton, ombre), bois taillé, gomme.
  const c = O.sun;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(24 24) scale(1.12) translate(-24 -24)">
        <G transform="rotate(-45 24 24)">
          <Path d="M0.6 24L9.6 19.6V28.4Z" fill={O.wood.light} />
          <Path d="M0.6 24L9.6 24V28.4Z" fill={O.wood.base} />
          <Path d="M0.6 24L3.9 22.4V25.6Z" fill={O.rubber.base} />
          <Path d="M9.6 19.6H38V22.4H9.6Z" fill={c.light} />
          <Path d="M9.6 22.4H38V25.6H9.6Z" fill={c.base} />
          <Path d="M9.6 25.6H38V28.4H9.6Z" fill={c.shade} />
          <Path d="M38 19.6H42.4V28.4H38Z" fill={O.metal.base} />
          <Path d="M38 25.6H42.4V28.4H38Z" fill={O.metal.shade} />
          <Path d="M42.4 19.6H44.6C46.4 19.6 47.4 21 47.4 24C47.4 27 46.4 28.4 44.6 28.4H42.4Z" fill={O.pink.base} />
          <Path d="M42.4 25.6H47.1C46.8 27.5 45.9 28.4 44.6 28.4H42.4Z" fill={O.pink.shade} />
        </G>
      </G>
    </Svg>
  );
}

function Desk({ size }: IconProps) {
  // Le table-banc des classes tchadiennes, de profil : pupitre et banc d'un bloc.
  const w = O.wood;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(24.6, 18, 24.6, 43, 1.6)}${pill(8, 30, 8, 43, 1.6)}`} fill={w.shade} />
      <Path d={`${pill(40, 18, 40, 43, 1.7)}${pill(13.4, 30, 13.4, 43, 1.7)}`} fill={w.base} />
      <Path d="M8 37.6H40V40.4H8Z" fill={w.shade} />
      <Path d="M19 14.4C19 13.3 19.9 12.4 21 12.4H42C43.1 12.4 44 13.3 44 14.4V17.4C44 18.5 43.1 19.4 42 19.4H21C19.9 19.4 19 18.5 19 17.4Z" fill={w.base} />
      <Path d="M19 16.8H44V17.4C44 18.5 43.1 19.4 42 19.4H21C19.9 19.4 19 18.5 19 17.4Z" fill={w.shade} />
      <Path d="M4 28.6C4 27.5 4.9 26.6 6 26.6H26C27.1 26.6 28 27.5 28 28.6V30.6C28 31.7 27.1 32.6 26 32.6H6C4.9 32.6 4 31.7 4 30.6Z" fill={w.base} />
      <Path d="M4 30.4H28V30.6C28 31.7 27.1 32.6 26 32.6H6C4.9 32.6 4 31.7 4 30.6Z" fill={w.shade} />
      <Path d="M24 12.4L25.6 6.6H38.4L36.8 12.4Z" fill={O.red.base} />
      <Path d="M30.8 12.4L32.2 6.6H38.4L36.8 12.4Z" fill={O.red.shade} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : le corps humain
// ---------------------------------------------------------------------------

function Hand({ size }: IconProps) {
  // La main ouverte, paume vers l'enfant, doigts écartés.
  const c = BODY;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={pill(14.6, 30, 7.4, 21.4, 3.3)} fill={c.base} />
      <Path d={`${pill(17.6, 22, 15.6, 7.8, 2.8)}${pill(23, 21, 22.8, 4.6, 2.9)}${pill(28.4, 21.6, 29.6, 6.4, 2.8)}${pill(32.8, 24, 35.6, 12.4, 2.5)}`} fill={c.base} />
      <Path d="M12.8 24.4C12.8 21.4 14.6 19.4 17.4 19.4H31.6C34.2 19.4 36 21.6 36 24.4V31.4C36 38.6 31 44 24.4 44C17.8 44 12.8 38.6 12.8 31.4Z" fill={c.base} />
      <Path d="M36 24.4V31.4C36 38.6 31 44 24.4 44C29.4 41 32 36.4 32.2 30.6C32.4 26.6 33.6 23 36 22.2Z" fill={c.shade} />
      <Path d="M18 31.6C21.4 30.2 25 30 28.6 31.4M19.8 36.4C22.4 35.8 25.2 36 27.6 37" stroke={c.shade} strokeWidth={1.3} {...round} />
    </Svg>
  );
}

function Foot({ size }: IconProps) {
  // Le pied nu, vu de dessus : cinq orteils, le gros à gauche.
  const c = BODY;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${disc(19, 8.6, 4)}${disc(25.8, 6.6, 2.7)}${disc(30.6, 8, 2.4)}${disc(34.6, 10.8, 2.2)}${disc(37.4, 14.6, 1.9)}`} fill={c.base} />
      <Path d="M14.6 18.6C14.6 13.4 19.4 11.6 25.4 11.8C31.6 12 35.8 14.6 35.8 20C35.8 26.6 32.8 30.4 33.2 36C33.6 41.2 30.4 44.6 25.6 44.6C20.8 44.6 17.4 41.6 17.6 36.6C17.8 30.6 14.6 25.2 14.6 18.6Z" fill={c.base} />
      <Path d="M35.8 20C35.8 26.6 32.8 30.4 33.2 36C33.6 41.2 30.4 44.6 25.6 44.6C28.8 42 29.8 38.8 29.4 35C28.8 29.4 32 25.6 32.4 19.6C32.6 16.8 31.8 14.4 30.4 12.6C33.8 13.6 35.8 16.2 35.8 20Z" fill={c.shade} />
      <Path d={`${crescent(19, 8.6, 4, -1, -1.2)}`} fill={c.shade} />
    </Svg>
  );
}

function Head({ size }: IconProps) {
  // La tête : un enfant de face, comme les portraits.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(24 22) scale(1.3) translate(-24 -18)">
        <Person skin="cannelle" cloth={O.teal} mood="smile" hair="short" child shoulders={13} />
      </G>
    </Svg>
  );
}

function Eye({ size }: IconProps) {
  // L'œil : paupières, blanc, iris brun, pupille et son point de lumière ; le sourcil.
  const c = BODY;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M8 12.6C15 7.6 33 7.6 40 12.6" stroke={HAIR.base} strokeWidth={3.2} {...round} />
      <Path d="M3.6 27C10.6 14.6 37.4 14.6 44.4 27C37.4 38.4 10.6 38.4 3.6 27Z" fill={c.base} />
      <Path d="M44.4 27C37.4 38.4 10.6 38.4 3.6 27C14 34 34 34 44.4 27Z" fill={c.shade} />
      <Path d="M9.6 27C15.4 19.2 32.6 19.2 38.4 27C32.6 33.6 15.4 33.6 9.6 27Z" fill={O.porcelain.base} />
      <Path d={disc(24, 26.4, 6.6)} fill={O.bark.light} />
      <Path d={disc(24, 26.4, 3.2)} fill={FACE.eye} />
      <Path d={disc(26.2, 24, 1.4)} fill={FACE.catchlight} />
      <Path d="M9.6 27C15.4 19.2 32.6 19.2 38.4 27" stroke={HAIR.base} strokeWidth={1.8} {...round} />
    </Svg>
  );
}

function Mouth({ size }: IconProps) {
  // La bouche qui rit : lèvres (famille de la peau), dents, langue.
  const c = BODY;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M3.6 21.4C9.6 15.6 16 13.4 20.4 15.2C22.6 14.2 25.4 14.2 27.6 15.2C32 13.4 38.4 15.6 44.4 21.4C40.6 33.4 32.8 39.6 24 39.6C15.2 39.6 7.4 33.4 3.6 21.4Z" fill={c.lip} />
      <Path d="M9.4 22.2C16 21.4 32 21.4 38.6 22.2C35 30.8 29.6 34.4 24 34.4C18.4 34.4 13 30.8 9.4 22.2Z" fill={FACE.mouth} />
      <Path d="M10.8 22.4C17 21.8 31 21.8 37.2 22.4C36.6 24 35.8 25.2 34.8 26.2C28 27 20 27 13.2 26.2C12.2 25.2 11.4 24 10.8 22.4Z" fill={FACE.teeth} />
      <Path d="M16 31.2C19 28.2 29 28.2 32 31.2C29.6 33.4 27 34.4 24 34.4C21 34.4 18.4 33.4 16 31.2Z" fill={FACE.tongue} />
      <Path d="M3.6 21.4C7 22.6 9 22.6 9.4 22.2C13 30.8 18.4 34.4 24 34.4C29.6 34.4 35 30.8 38.6 22.2C39 22.6 41 22.6 44.4 21.4C40.6 33.4 32.8 39.6 24 39.6C15.2 39.6 7.4 33.4 3.6 21.4Z" fill={c.blush} />
    </Svg>
  );
}

function Nose({ size }: IconProps) {
  // Vu de face, avec des ailes et des narines franches : sans elles, un nez
  // se lit comme une goutte.
  const c = BODY;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(24 22.6) scale(1.07) translate(-24 -22.6)">
        <Path d="M20.2 4C20.2 13 18.6 19.6 13.8 25.6C9.6 30.8 9.8 37.6 14.8 40.2C17 41.4 19.4 40.8 21 39.8C22.6 41.4 25.4 41.4 27 39.8C28.6 40.8 31 41.4 33.2 40.2C38.2 37.6 38.4 30.8 34.2 25.6C29.4 19.6 27.8 13 27.8 4Z" fill={c.base} />
        <Path d="M27.8 4C27.8 13 29.4 19.6 34.2 25.6C38.4 30.8 38.2 37.6 33.2 40.2C31 41.4 28.6 40.8 27 39.8C30.6 37.6 32.4 33.6 30.4 28.8C28 23 25.6 15 25.6 4Z" fill={c.shade} />
        <Path d="M20.2 4C20.2 13 18.6 19.6 13.8 25.6C11.6 28.4 10.6 31.6 10.8 34.4C12.6 28.4 18 25 20.6 18.6C21.8 15.6 22.2 10 22.2 4Z" fill={c.light} />
        <Path d={`${oval(18, 36.4, 3, 2)}${oval(30, 36.4, 3, 2)}`} fill={c.lip} />
      </G>
    </Svg>
  );
}

function Ear({ size }: IconProps) {
  // L'oreille, de profil : pavillon, repli, lobe.
  const c = BODY;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M30.6 5.4C21.6 2.4 11.6 7.8 11.6 19C11.6 25.4 14.8 28.2 14.8 34C14.8 40.2 18.4 44.6 23.6 44.6C28.4 44.6 30.4 41.2 30.6 37.6C30.8 34 33.2 32.4 35.6 29.2C38.4 25.8 39.2 21.8 39 17.6C38.8 12 35.8 7 30.6 5.4Z" fill={c.base} />
      <Path d="M39 17.6C39.2 21.8 38.4 25.8 35.6 29.2C33.2 32.4 30.8 34 30.6 37.6C30.4 41.2 28.4 44.6 23.6 44.6C27 42 26.6 37.4 28.4 33.6C30.4 29.6 34.4 27.6 35.2 21.8C35.8 17 34.4 12 30.6 9.2C35.6 9.8 38.8 13 39 17.6Z" fill={c.shade} />
      <Path d="M19.6 20C19.6 14.2 24.8 11.6 29.2 13.8C33 15.8 33 21.2 30.4 24C28.2 26.4 26.2 27.6 26 31.2" stroke={c.shade} strokeWidth={2.8} {...round} />
      <Path d="M21.4 26.6C22.6 24.6 24.8 24.2 25.6 25.8" stroke={c.shade} strokeWidth={2.2} {...round} />
    </Svg>
  );
}

function Tooth({ size }: IconProps) {
  // La dent (molaire) : blanche, son ombre dessine sa forme sur la carte.
  const c = O.porcelain;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M8.4 14.6C8.4 7.6 14 4.4 19 5.6C21 6 22.4 6.8 24 6.8C25.6 6.8 27 6 29 5.6C34 4.4 39.6 7.6 39.6 14.6C39.6 22 36.6 25.6 35.6 32C34.8 37.6 34 43.4 30.2 43.4C26.8 43.4 26.6 38.6 26 34.6C25.6 32 25 30.4 24 30.4C23 30.4 22.4 32 22 34.6C21.4 38.6 21.2 43.4 17.8 43.4C14 43.4 13.2 37.6 12.4 32C11.4 25.6 8.4 22 8.4 14.6Z" fill={c.base} />
      <Path d="M39.6 14.6C39.6 22 36.6 25.6 35.6 32C34.8 37.6 34 43.4 30.2 43.4C32.6 39 32 33 32.8 28.4C33.8 22.6 36 19.2 35.6 13.6C35.4 10.4 34 8 31.8 6.6C36.4 6.6 39.6 9.8 39.6 14.6Z" fill={c.shade} />
      <Path d="M22 34.6C22.4 32 23 30.4 24 30.4C25 30.4 25.6 32 26 34.6C25.4 33.4 24.8 32.8 24 32.8C23.2 32.8 22.6 33.4 22 34.6Z" fill={c.shade} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les habits
// ---------------------------------------------------------------------------

function Boubou({ size }: IconProps) {
  // Le boubou — the everyday garment across Chad : manches larges, encolure brodée.
  const c = O.teal;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M18 5.6H30C32.2 6.2 36.4 8.4 40.4 11.4C43 13.4 44.4 15.8 44.4 18.8V30.2C44.4 31.3 43.5 32.2 42.4 32.2H35V42.4C35 43.3 34.3 44 33.4 44H14.6C13.7 44 13 43.3 13 42.4V32.2H5.6C4.5 32.2 3.6 31.3 3.6 30.2V18.8C3.6 15.8 5 13.4 7.6 11.4C11.6 8.4 15.8 6.2 18 5.6Z" fill={c.base} />
      <Path d="M35 32.2H42.4C43.5 32.2 44.4 31.3 44.4 30.2V18.8C44.4 15.8 43 13.4 40.4 11.4C37 14.4 35 19 35 25Z" fill={c.shade} />
      <Path d="M30.6 32.2H35V42.4C35 43.3 34.3 44 33.4 44H30.6Z" fill={c.shade} />
      <Path d="M18 5.6H30C29.4 9.2 26.8 10.6 24 10.6C21.2 10.6 18.6 9.2 18 5.6Z" fill={c.shade} />
      <Path d="M16.4 6.8C17.6 13.6 30.4 13.6 31.6 6.8M24 12.4V25" stroke={O.sun.base} strokeWidth={2} {...round} />
      <Path d={`${disc(21.2, 17.4, 1.1)}${disc(26.8, 17.4, 1.1)}${disc(24, 28.4, 1.2)}`} fill={O.sun.base} />
    </Svg>
  );
}

function Shirt({ size }: IconProps) {
  // La chemise kaki de l'école publique : col, boutons, poche.
  const c = KHAKI;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M17.4 5.6H30.6L42.6 12C43.6 12.6 44 13.8 43.4 14.8L39.8 22C39.4 22.8 38.4 23.2 37.6 22.8L34.6 21.4V42C34.6 43.1 33.7 44 32.6 44H15.4C14.3 44 13.4 43.1 13.4 42V21.4L10.4 22.8C9.6 23.2 8.6 22.8 8.2 22L4.6 14.8C4 13.8 4.4 12.6 5.4 12Z" fill={c.base} />
      <Path d="M34.6 21.4L37.6 22.8C38.4 23.2 39.4 22.8 39.8 22L43.4 14.8C44 13.8 43.6 12.6 42.6 12L34.6 7.8Z" fill={c.shade} />
      <Path d="M30.6 30H34.6V42C34.6 43.1 33.7 44 32.6 44H30.6Z" fill={c.shade} />
      <Path d="M17.4 5.6H30.6L24 12.6Z" fill={c.shade} />
      <Path d="M17.4 5.6L24 12.6L19.4 15.6L15.2 8Z" fill={c.light} />
      <Path d="M30.6 5.6L24 12.6L28.6 15.6L32.8 8Z" fill={c.light} />
      <Path d="M24 12.6V44" stroke={c.shade} strokeWidth={1.2} />
      <Path d={`${disc(25.8, 19, 0.95)}${disc(25.8, 25.4, 0.95)}${disc(25.8, 31.8, 0.95)}${disc(25.8, 38.2, 0.95)}`} fill={c.shade} />
      <Path d="M28.4 19.6H32.8V24.4C32.8 25 32.4 25.4 31.8 25.4H29.4C28.8 25.4 28.4 25 28.4 24.4Z" fill={c.shade} />
    </Svg>
  );
}

function Trousers({ size }: IconProps) {
  const c = O.blue;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M12.6 4H35.4L38 42C38.1 43.1 37.2 44 36.1 44H27.8C26.8 44 26 43.2 25.9 42.2L24 19.6L22.1 42.2C22 43.2 21.2 44 20.2 44H11.9C10.8 44 9.9 43.1 10 42Z" fill={c.base} />
      <Path d="M33 8.6H35.7L38 42C38.1 43.1 37.2 44 36.1 44H34.6Z" fill={c.shade} />
      <Path d="M12.6 4H35.4L35.7 8.6H12.3Z" fill={c.shade} />
      <Path d="M24 8.6V19.6M14.2 8.6C14.6 11.8 16.4 13.4 19 13.6" stroke={c.shade} strokeWidth={1.4} {...round} />
      <Path d="M17 4V8.6M24 4V8.6M31 4V8.6" stroke={c.base} strokeWidth={1.4} />
    </Svg>
  );
}

function Shoe({ size }: IconProps) {
  // La basket, de profil : tige rouge, semelle blanche, lacets.
  const c = O.red;
  const sole = O.porcelain;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M4.4 35.6C3.8 29.6 4.4 23.8 6.4 18.6C7.2 16.8 9.2 16.4 10.6 17.4C13.4 19.4 16.4 20.2 19 19.2C21 18.4 22.4 17 24 17.2C26 17.4 27.4 20 29 22.2C31 25 34.6 26.2 38.6 27.2C42 28 44 30.2 44 33V35.6Z" fill={c.base} />
      <Path d="M31.6 24.8C33.6 26 36 26.6 38.6 27.2C42 28 44 30.2 44 33V35.6H32.4C33.6 32 33.4 28 31.6 24.8Z" fill={c.shade} />
      <Path d="M4.4 35.6C4.2 31 4.6 26.6 5.8 22.4C7.4 23 8.6 24.8 8.8 27.6C9 30.6 8.4 33.4 7.4 35.6Z" fill={c.shade} />
      <Path d="M17.4 22.4L21.4 25.6M21.2 20.2L25 23.4M24.8 19.4L28.2 22.4" stroke={sole.light} strokeWidth={1.8} {...round} />
      <Path d="M3.6 35H44.4V38.4C44.4 40.4 42.8 42 40.8 42H7.2C5.2 42 3.6 40.4 3.6 38.4Z" fill={sole.base} />
      <Path d="M3.6 38.8H44.4C44.2 40.6 42.7 42 40.8 42H7.2C5.3 42 3.8 40.6 3.6 38.8Z" fill={sole.shade} />
    </Svg>
  );
}

function Hat({ size }: IconProps) {
  // Le chapeau de paille peul : calotte conique, sommet et bandeau de cuir.
  const c = O.straw;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M3.6 31.6C9.6 26.6 38.4 26.6 44.4 31.6C38.4 36.6 9.6 36.6 3.6 31.6Z" fill={c.base} />
      <Path d="M3.6 31.6C9.6 36.6 38.4 36.6 44.4 31.6C38 33.6 10 33.6 3.6 31.6Z" fill={c.shade} />
      <Path d="M14.6 30.4L22.2 9.4C22.8 7.8 25.2 7.8 25.8 9.4L33.4 30.4C27.2 32 20.8 32 14.6 30.4Z" fill={c.base} />
      <Path d="M24 8.2C24.8 8.2 25.5 8.6 25.8 9.4L33.4 30.4C30.3 31.2 27.1 31.6 24 31.6Z" fill={c.shade} />
      <Path d="M20.6 13.8L22.2 9.4C22.8 7.8 25.2 7.8 25.8 9.4L27.4 13.8C25.2 14.4 22.8 14.4 20.6 13.8Z" fill={O.bark.base} />
      <Path d="M16.4 25.4C21.4 26.8 26.6 26.8 31.6 25.4L32.6 28.2C26.8 29.8 21.2 29.8 15.4 28.2Z" fill={O.bark.base} />
      <Path d="M24 26.4C26.6 26.4 29.1 26 31.6 25.4L32.6 28.2C29.7 29 26.9 29.4 24 29.4Z" fill={O.bark.shade} />
    </Svg>
  );
}

function Scarf({ size }: IconProps) {
  // Le foulard, porté et noué — plus lisible qu'un carré de tissu posé à plat.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(24 26) scale(1.16) translate(-24 -20)">
        <Person skin="miel" cloth={O.sun} mood="smile" hair="wrap" wrap={O.pink} child shoulders={13} />
        <Path d={`${disc(18.6, 9.6, 1)}${disc(22.4, 7.4, 1)}${disc(26.6, 7.4, 1)}${disc(30.2, 9.8, 1)}`} fill={O.sun.base} />
      </G>
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : la case, la maison
// ---------------------------------------------------------------------------

function Door({ size }: IconProps) {
  // La porte de tôle peinte des cours tchadiennes : panneaux, losanges, poignée.
  const c = O.teal;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={10} y={4} width={28} height={39} rx={2.4} fill={c.base} />
      <Path d="M31.6 4H35.6C36.9 4 38 5.1 38 6.4V40.6C38 41.9 36.9 43 35.6 43H31.6Z" fill={c.shade} />
      <Rect x={13.6} y={8} width={14.6} height={13} rx={1.2} fill={c.shade} />
      <Rect x={13.6} y={25} width={14.6} height={14} rx={1.2} fill={c.shade} />
      <Path d="M20.9 10.6L24.4 14.5L20.9 18.4L17.4 14.5ZM20.9 27.8L24.4 32L20.9 36.2L17.4 32Z" fill={c.light} />
      <Path d={disc(33.8, 23.4, 1.7)} fill={O.sun.base} />
      <Rect x={6} y={42} width={36} height={3} rx={1.4} fill={O.banco.base} />
    </Svg>
  );
}

function Mat({ size }: IconProps) {
  // La natte tressée, à plat, avec ses franges — le sol de la plupart des cases.
  const c = O.straw;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M4 13.4H7M4 18H7M4 22.6H7M4 27.2H7M4 31.8H7M4 36.4H7M41 13.4H44M41 18H44M41 22.6H44M41 27.2H44M41 31.8H44M41 36.4H44" stroke={c.shade} strokeWidth={1.6} {...round} />
      <Rect x={6.4} y={11} width={35.2} height={28} rx={2} fill={c.base} />
      <Path d="M6.4 33H41.6V37C41.6 38.1 40.7 39 39.6 39H8.4C7.3 39 6.4 38.1 6.4 37Z" fill={c.shade} />
      <Path d="M6.4 15.6H41.6V19H6.4ZM6.4 29H41.6V32.4H6.4Z" fill={O.red.base} />
      <Path d="M6.4 22.4L10.6 26L14.8 22.4L19 26L23.2 22.4L27.4 26L31.6 22.4L35.8 26L40 22.4" stroke={O.green.base} strokeWidth={2} {...round} />
    </Svg>
  );
}

function Pot({ size }: IconProps) {
  // La marmite en aluminium : couvercle, bouton, anses.
  const c = O.metal;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(5.4, 26.4, 9, 26.4, 2)}${pill(39, 26.4, 42.6, 26.4, 2)}`} fill={c.shade} />
      <Path d="M8 22H40V35C40 39.4 36.4 43 32 43H16C11.6 43 8 39.4 8 35Z" fill={c.base} />
      <Path d="M33.6 22H40V35C40 39.4 36.4 43 32 43H28.6C32 40.6 33.6 37 33.6 32Z" fill={c.shade} />
      <Path d="M7 22C7 15.4 14.6 12 24 12C33.4 12 41 15.4 41 22Z" fill={c.light} />
      <Path d="M30 12.8C36.2 14.2 41 17.4 41 22H33.4C33.4 18 32 14.8 30 12.8Z" fill={c.base} />
      <Rect x={5.6} y={20.6} width={36.8} height={3.4} rx={1.7} fill={c.shade} />
      <Path d={pill(21, 10, 27, 10, 2)} fill={O.rubber.base} />
    </Svg>
  );
}

function Bucket({ size }: IconProps) {
  // Le seau en plastique : anse, bord, corps évasé.
  const c = O.sun;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M9.4 16C9.4 3.6 38.6 3.6 38.6 16" stroke={O.rubber.light} strokeWidth={2.2} {...round} />
      <Path d="M8 15H40L36.6 41.2C36.4 42.8 35 44 33.4 44H14.6C13 44 11.6 42.8 11.4 41.2Z" fill={c.base} />
      <Path d="M32.6 15H40L36.6 41.2C36.4 42.8 35 44 33.4 44H30.4C32 36 32.6 26 32.6 15Z" fill={c.shade} />
      <Rect x={6} y={11.6} width={36} height={5.4} rx={2.7} fill={c.shade} />
      <Path d="M12.6 26H35.4" stroke={c.shade} strokeWidth={1.6} {...round} />
    </Svg>
  );
}

function Broom({ size }: IconProps) {
  // Le balai court du Sahel : une botte de fibres liée, sans manche.
  const c = O.straw;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="rotate(24 24 24)">
        <Path d="M20.4 18H27.6L35.6 41C35.9 42.1 35.1 43.2 34 43.2H14C12.9 43.2 12.1 42.1 12.4 41Z" fill={c.base} />
        <Path d="M24 18H27.6L35.6 41C35.9 42.1 35.1 43.2 34 43.2H29.4C29 34 27 24.6 24 18Z" fill={c.shade} />
        <Path d="M20 29L17.6 42.6M24 26V42.6M28 29L30.4 42.6" stroke={c.shade} strokeWidth={1.2} {...round} />
        <Path d={pill(24, 4.6, 24, 20, 3.6)} fill={c.base} />
        <Path d="M24 1A3.6 3.6 0 0 1 27.6 4.6V20H24Z" fill={c.shade} />
        <Rect x={19.6} y={9} width={8.8} height={2.6} rx={1.3} fill={O.red.base} />
        <Rect x={19.6} y={14.4} width={8.8} height={2.6} rx={1.3} fill={O.red.base} />
      </G>
    </Svg>
  );
}

function Jar({ size }: IconProps) {
  // Le canari — the clay water jar that keeps water cool.
  const c = O.clay;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M17.6 9H30.4C30.4 11 29.4 12.4 28.8 13.6C36.6 15.6 42 21.8 42 29C42 37.6 34 44 24 44C14 44 6 37.6 6 29C6 21.8 11.4 15.6 19.2 13.6C18.6 12.4 17.6 11 17.6 9Z" fill={c.base} />
      <Path d="M42 29C42 37.6 34 44 24 44C31.6 40.4 35.6 34.6 35.6 28C35.6 22.6 32.6 17.8 28 15.4L28.8 13.6C36.6 15.6 42 21.8 42 29Z" fill={c.shade} />
      <Rect x={15.6} y={5.4} width={16.8} height={4.8} rx={2.4} fill={c.light} />
      <Path d="M10.2 22.4L13.6 25.6L17 22.8L20.4 26L24 23L27.6 26L31 22.8L34.4 25.6L37.8 22.4" stroke={c.shade} strokeWidth={1.6} {...round} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : le quartier, le village, la ville
// ---------------------------------------------------------------------------

function Well({ size }: IconProps) {
  // Le puits — the centre of village life, and of many CP word problems :
  // margelle maçonnée, fourches de bois, poulie, puisette.
  const w = O.wood;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(10.4, 30, 10.4, 9, 1.8)}${pill(37.6, 30, 37.6, 9, 1.8)}`} fill={w.base} />
      <Path d="M7.4 5.6L10.4 9.6L13.4 5.6M34.6 5.6L37.6 9.6L40.6 5.6" stroke={w.base} strokeWidth={2.4} {...round} />
      <Path d={pill(6.4, 9.4, 41.6, 9.4, 1.7)} fill={w.shade} />
      <Path d="M24 10.6V19.4" stroke={O.straw.shade} strokeWidth={1.3} {...round} />
      <Path d={disc(24, 10.2, 2.4)} fill={O.metal.shade} />
      <Path d="M19.6 19H28.4L27.2 25.4H20.8Z" fill={O.rubber.base} />
      <Rect x={5} y={25.4} width={38} height={18.6} rx={2.4} fill={O.banco.base} />
      <Path d="M34 25.4H40.6C41.9 25.4 43 26.5 43 27.8V41.6C43 42.9 41.9 44 40.6 44H34Z" fill={O.banco.shade} />
      <Rect x={4} y={24} width={40} height={4.4} rx={2.2} fill={O.banco.light} />
      <Path d="M5 34.6H43M15 28.4V34.6M30 28.4V34.6M22 34.6V44M37 34.6V44" stroke={O.banco.shade} strokeWidth={1.2} />
    </Svg>
  );
}

function Mosque({ size }: IconProps) {
  // La mosquée : murs de banco, coupole verte, minaret.
  const wall = O.banco;
  const dome = O.green;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={33.4} y={9.6} width={7.6} height={34.4} rx={1} fill={wall.base} />
      <Path d="M37.2 9.6H41V43C41 43.6 40.6 44 40 44H37.2Z" fill={wall.shade} />
      <Path d="M32.4 10.2C32.4 6.8 34.6 4.4 37.2 3.6C39.8 4.4 42 6.8 42 10.2Z" fill={dome.base} />
      <Path d="M37.2 3.6C39.8 4.4 42 6.8 42 10.2H37.2Z" fill={dome.shade} />
      <Rect x={4} y={23} width={30} height={21} rx={1.2} fill={wall.base} />
      <Path d="M4 23H34V26H4Z" fill={wall.shade} />
      <Path d="M8.6 23.4C8.6 15.2 13 9.8 19 9.8C25 9.8 29.4 15.2 29.4 23.4Z" fill={dome.base} />
      <Path d="M19 9.8C25 9.8 29.4 15.2 29.4 23.4H23.4C23.4 16.6 21.8 12.2 19 9.8Z" fill={dome.shade} />
      <Path d={pill(19, 9.8, 19, 5.4, 0.8)} fill={O.sun.base} />
      <Path d={disc(19, 5.2, 1.5)} fill={O.sun.base} />
      <Path d="M15 44V35.6C15 33.4 16.8 31.6 19 31.6C21.2 31.6 23 33.4 23 35.6V44Z" fill={dome.shade} />
      <Path d="M7.6 34V31.6C7.6 30.4 8.6 29.4 9.8 29.4C11 29.4 12 30.4 12 31.6V34ZM26 34V31.6C26 30.4 27 29.4 28.2 29.4C29.4 29.4 30.4 30.4 30.4 31.6V34ZM35.6 22V19.8C35.6 18.8 36.4 18 37.2 18C38 18 38.8 18.8 38.8 19.8V22Z" fill={wall.shade} />
    </Svg>
  );
}

function Church({ size }: IconProps) {
  // L'église : façade blanche, toit de tuiles, rosace, croix.
  const wall = O.porcelain;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(24, 2.6, 24, 10, 1.1)}${pill(21, 5.4, 27, 5.4, 1.1)}`} fill={O.bark.base} />
      <Path d="M8 25L24 12.4L40 25V42.6C40 43.4 39.4 44 38.6 44H9.4C8.6 44 8 43.4 8 42.6Z" fill={wall.base} />
      <Path d="M33 19.6L40 25V42.6C40 43.4 39.4 44 38.6 44H33Z" fill={wall.shade} />
      <Path d="M4.6 26.2L24 9.8L43.4 26.2L41.2 28.8L24 14.4L6.8 28.8Z" fill={O.clay.base} />
      <Path d="M24 9.8L43.4 26.2L41.2 28.8L24 14.4Z" fill={O.clay.shade} />
      <Path d={disc(24, 23.6, 3.2)} fill={O.sky.base} />
      <Path d={crescent(24, 23.6, 3.2, -1, -1)} fill={O.sky.shade} />
      <Path d="M19.4 44V34.6C19.4 32 21.4 30 24 30C26.6 30 28.6 32 28.6 34.6V44Z" fill={O.wood.base} />
      <Path d="M24 30C26.6 30 28.6 32 28.6 34.6V44H24Z" fill={O.wood.shade} />
    </Svg>
  );
}

function Road({ size }: IconProps) {
  // La route, vue d'en haut : elle serpente, bordée de latérite, tiretée de blanc.
  const d = 'M15.6 44.4C15.6 33.6 32.4 35 32.4 24C32.4 13 15.6 14.4 15.6 3.6';
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={d} stroke={O.banco.base} strokeWidth={19} fill="none" />
      <Path d={d} stroke={O.rubber.light} strokeWidth={13} fill="none" />
      <Path d={d} stroke={O.porcelain.base} strokeWidth={1.8} strokeDasharray="3.6 3.6" fill="none" />
    </Svg>
  );
}

function Field({ size }: IconProps) {
  // Le champ de mil : sillons de terre, tiges, épis.
  const stalk = O.leaf;
  const ear = O.straw;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M12 33V17M24 33V12M36 33V17" stroke={stalk.base} strokeWidth={2} {...round} />
      <Path d="M12 26C9 26 6.8 24.2 6 21.4C9 21.4 11.2 23 12 26ZM24 23C27 23 29.2 21.2 30 18.4C27 18.4 24.8 20 24 23ZM36 26C33 26 30.8 24.2 30 21.4C33 21.4 35.2 23 36 26Z" fill={stalk.base} />
      <Path d={`${oval(12, 12.4, 2.8, 6)}${oval(24, 7.6, 3, 6.2)}${oval(36, 12.4, 2.8, 6)}`} fill={ear.base} />
      <Path d={`${ellipseCrescent(12, 12.4, 2.8, 6, -0.9, -0.6)}${ellipseCrescent(24, 7.6, 3, 6.2, -0.9, -0.6)}${ellipseCrescent(36, 12.4, 2.8, 6, -0.9, -0.6)}`} fill={ear.shade} />
      <Path d="M4 33.4C4 32 5 31 6.4 31H41.6C43 31 44 32 44 33.4V40.6C44 42 43 43 41.6 43H6.4C5 43 4 42 4 40.6Z" fill={O.bark.light} />
      <Path d="M4 37H44" stroke={O.bark.base} strokeWidth={2} />
      <Path d="M4 40.4V40.6C4 42 5 43 6.4 43H41.6C43 43 44 42 44 40.6V40.4Z" fill={O.bark.base} />
    </Svg>
  );
}

function MarketStall({ size }: IconProps) {
  // L'étal du marché : auvent rayé, table, tas de tomates, de mangues, d'oignons.
  const awning = O.orange;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(8, 14, 8, 44, 1.6)}${pill(40, 14, 40, 44, 1.6)}`} fill={O.wood.shade} />
      <Path d="M4 8.4C4 6.5 5.5 5 7.4 5H40.6C42.5 5 44 6.5 44 8.4V15H4Z" fill={awning.base} />
      <Path d="M10.6 5H17.2V15H10.6ZM23.8 5H30.4V15H23.8ZM37 5H40.6C42.5 5 44 6.5 44 8.4V15H37Z" fill={O.porcelain.base} />
      <Path d={`${disc(7.3, 15, 3.3)}${disc(20.5, 15, 3.3)}${disc(33.7, 15, 3.3)}`} fill={awning.base} />
      <Path d={`${disc(13.9, 15, 3.3)}${disc(27.1, 15, 3.3)}${disc(40.4, 15, 3.3)}`} fill={O.porcelain.base} />
      <Path d={`${disc(13.4, 27.4, 3)}${disc(18.6, 27.4, 3)}${disc(16, 23.4, 3)}`} fill={O.red.base} />
      <Path d={`${oval(26.4, 27.2, 3.4, 2.6)}${oval(31.4, 26.4, 3.4, 2.6)}${oval(28.8, 22.8, 3.4, 2.6)}`} fill={O.mango.base} />
      <Path d={`${disc(36.4, 27.4, 2.6)}`} fill={O.pink.light} />
      <Rect x={5} y={29.4} width={38} height={5} rx={1.6} fill={O.wood.base} />
      <Path d="M5 32.6H43V32.8C43 33.7 42.3 34.4 41.4 34.4H6.6C5.7 34.4 5 33.7 5 32.8Z" fill={O.wood.shade} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : la famille
// ---------------------------------------------------------------------------

function Mother({ size }: IconProps) {
  // La mère : foulard noué, pagne, boucles d'oreilles.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Person skin="cannelle" cloth={O.green} mood="smile" hair="wrap" wrap={O.orange} collar="v" shoulders={17.5} />
      <Path d={`${disc(16.4, 20, 1)}${disc(31.6, 20, 1)}`} fill={O.sun.base} />
    </Svg>
  );
}

function Baby({ size }: IconProps) {
  // Le bébé : une grosse tête ronde, une mèche, la joie.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(24 25) scale(1.22) translate(-24 -20)">
        <Person skin="acajou" cloth={O.sky} mood="smile" hair="curl" child shoulders={11} />
      </G>
    </Svg>
  );
}

function Grandfather({ size }: IconProps) {
  // Le grand-père : cheveux et barbe blancs, boubou brun, canne.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Person skin="acajou" cloth={O.wood} mood="smile" hair="white" beard="white" collar="v" shoulders={17} headY={14.6} />
      <Path d={pill(40.6, 20, 40.6, 43, 1.4)} fill={O.bark.base} />
      <Path d="M36.4 21.4C36.4 18.4 38.4 17 40.6 18" stroke={O.bark.base} strokeWidth={2.8} {...round} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les métiers (liste officielle p. 19)
// Chaque métier est dit par son outil — plus lisible à 40 px qu'un visage.
// ---------------------------------------------------------------------------

function Farmer({ size }: IconProps) {
  // Le cultivateur : la daba (houe à manche court, lame en travers) et l'épi de mil.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M35 43V22" stroke={O.leaf.base} strokeWidth={2} {...round} />
      <Path d="M35 33C31.6 33 29.4 30.8 28.6 27.6C32 27.6 34.4 29.6 35 33Z" fill={O.leaf.base} />
      <Path d={oval(35, 15.6, 3.4, 8.8)} fill={O.straw.base} />
      <Path d={ellipseCrescent(35, 15.6, 3.4, 8.8, -1.1, -0.8)} fill={O.straw.shade} />
      <G transform="translate(8.6 34.6) rotate(40)">
        <Path d={pill(0, 0, 0, -37, 1.9)} fill={O.wood.base} />
        <Path d="M-1.8 -3.2L10.2 -1.2C11.3 -1 12 0 11.8 1.1L11 5.6C7.2 6.6 2 5.8 -1.8 3.6Z" fill={O.metal.base} />
        <Path d="M-1.8 1.6C2 3 7.6 3.4 11.6 2.4L11 5.6C7.2 6.6 2 5.8 -1.8 3.6Z" fill={O.metal.shade} />
      </G>
    </Svg>
  );
}

function Herder({ size }: IconProps) {
  // L'éleveur : bâton et troupeau.
  const w = O.wool;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M10.4 44V11C10.4 7 13 4.6 16 4.6C18.8 4.6 20.6 6.6 20.6 9.2" stroke={O.wood.base} strokeWidth={2.8} {...round} />
      <Path d={`${pill(22.4, 36, 22.4, 44, 1.3)}${pill(34.4, 36, 34.4, 44, 1.3)}`} fill={O.bark.base} />
      <Path d={`${disc(21.6, 27.6, 4.6)}${disc(27.4, 24.4, 5)}${disc(33.6, 27, 4.6)}${disc(22.4, 34, 4.2)}${disc(28.4, 35, 4.4)}${disc(34, 33.4, 4.2)}${oval(28, 30, 8, 6)}`} fill={w.base} />
      <Path d={`${crescent(22.4, 34, 4.2, -1.2, -1.8)}${crescent(28.4, 35, 4.4, -1.2, -1.8)}${crescent(34, 33.4, 4.2, -1.2, -1.8)}`} fill={w.shade} />
      <Path d="M36.6 22.6C38 20.2 41.4 20 43 22.2C44.2 23.8 44.4 26.2 43.6 28C42.8 29.8 40.8 30.4 39.2 29.4C37.6 28.4 36.6 26.6 36.2 25C36 24.2 36.2 23.4 36.6 22.6Z" fill={O.bark.base} />
      <Path d={disc(38.6, 21.6, 2.4)} fill={w.base} />
      <PictoEye cx={41} cy={24.4} r={0.95} />
    </Svg>
  );
}

function Blacksmith({ size }: IconProps) {
  // Le forgeron : l'enclume, le marteau, les étincelles.
  const iron = O.rubber;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M4.4 24C4.4 22.9 5.3 22 6.4 22H40C41.1 22 42 22.9 42 24V25.4C42 28.6 39.4 30.4 36.2 30.8L33.2 31.2V36H16.2V31C11 30 6.4 28 4.4 24Z" fill={iron.light} />
      <Path d="M33.2 31.2V36H27.6V22H40C41.1 22 42 22.9 42 24V25.4C42 28.6 39.4 30.4 36.2 30.8Z" fill={iron.base} />
      <Path d="M12.6 36H36.8C37.9 36 38.8 36.9 38.8 38V44H10.6V38C10.6 36.9 11.5 36 12.6 36Z" fill={iron.base} />
      <Path d={pill(31.6, 18, 44, 5.6, 1.7)} fill={O.wood.base} />
      <G transform="rotate(45 30 15)">
        <Rect x={23.4} y={11.6} width={13.2} height={6.8} rx={1.4} fill={O.metal.base} />
        <Rect x={30} y={11.6} width={6.6} height={6.8} rx={1.4} fill={O.metal.shade} />
      </G>
      <Path d="M14 16.6L11.4 12.4M19.4 14.6L19.8 9.4M9 19L4.6 17.4" stroke={O.sun.base} strokeWidth={2} {...round} />
    </Svg>
  );
}

function Cobbler({ size }: IconProps) {
  // Le cordonnier : la chaussure de cuir et l'alêne, avec son fil.
  const c = O.bark;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M4.4 37.6C3.8 32.4 4.6 27.6 6.6 23.4C7.4 21.6 9.4 21.2 10.8 22.2C13.6 24.2 16.6 25 19.4 24.4C22.6 23.8 25 24.8 27.4 27.2C29.6 29.4 32.8 30.4 36.2 31C40 31.6 42.4 33.6 42.4 36.4V37.6Z" fill={c.base} />
      <Path d="M28.6 28.4C30.8 29.8 33.4 30.6 36.2 31C40 31.6 42.4 33.6 42.4 36.4V37.6H30C30.8 34.4 30.4 31 28.6 28.4Z" fill={c.shade} />
      <Path d="M3.6 37H43.2V39.6C43.2 41 42.1 42 40.8 42H6C4.7 42 3.6 41 3.6 39.6Z" fill={O.rubber.base} />
      <Path d="M9.4 30.6C13.4 31.4 18 31.4 22.6 30.4" stroke={c.light} strokeWidth={1.4} strokeDasharray="1.6 1.8" {...round} />
      <Path d={pill(30.2, 21.4, 37.2, 9.4, 0.9)} fill={O.metal.shade} />
      <Path d={pill(37.6, 8.6, 41.4, 2.6, 2.6)} fill={O.wood.base} />
      <Path d="M30.6 21C27.4 20.4 24.4 18 25.2 14.6C26 11.2 30.4 11.6 30.6 15" stroke={O.sun.base} strokeWidth={1.4} {...round} />
    </Svg>
  );
}

function Tailor({ size }: IconProps) {
  // Le tailleur : la machine à coudre à manivelle des ateliers de marché.
  const m = O.ink;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={4} y={37.4} width={40} height={5.6} rx={1.6} fill={O.wood.base} />
      <Path d="M4 40.6H44V41.4C44 42.3 43.3 43 42.4 43H5.6C4.7 43 4 42.3 4 41.4Z" fill={O.wood.shade} />
      <Path d="M6 33C6 31.9 6.9 31 8 31H38V37.4H6Z" fill={m.base} />
      <Path d="M30 37.4V16C30 13.2 32.2 11 35 11H36C38.2 11 40 12.8 40 15V37.4Z" fill={m.base} />
      <Path d="M35.6 11.2C38.2 11.4 40 13 40 15V37.4H35.6Z" fill={m.shade} />
      <Path d="M10 13C10 11.3 11.3 10 13 10H35V17.6H16V24H10Z" fill={m.light} />
      <Path d="M16 13.6H32" stroke={O.sun.base} strokeWidth={1.4} {...round} />
      <Path d="M13 24V30" stroke={O.metal.base} strokeWidth={1.3} {...round} />
      <Path d="M5.6 29.6H22.4V32.6H5.6Z" fill={O.orange.base} />
      <Path d={disc(41, 20.4, 5)} fill={O.metal.base} />
      <Path d={crescent(41, 20.4, 5, -1.4, -1.4)} fill={O.metal.shade} />
      <Path d={disc(41, 20.4, 1.4)} fill={m.base} />
    </Svg>
  );
}

function Hunter({ size }: IconProps) {
  // Le chasseur : l'arc bandé et la flèche.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M10 5.6L10 42.4" stroke={O.straw.shade} strokeWidth={1.2} {...round} />
      <Path d="M10 5.6C24 9.6 30 16 30 24C30 32 24 38.4 10 42.4" stroke={O.wood.base} strokeWidth={3.2} {...round} />
      <Path d={pill(8, 24, 38, 24, 1)} fill={O.bark.base} />
      <Path d="M44.4 24L36.6 19.6V28.4Z" fill={O.metal.shade} />
      <Path d="M4 19.6L10 24L4 28.4H9.4L13.6 24L9.4 19.6Z" fill={O.red.base} />
    </Svg>
  );
}

function Fisherman({ size }: IconProps) {
  // Le pêcheur : la canne, la ligne, le poisson pris.
  const f = O.teal;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M4.6 43.4C10 26 22 10 38.6 5.4" stroke={O.wood.base} strokeWidth={2.6} {...round} />
      <Path d="M38.6 5.4V19" stroke={O.rubber.light} strokeWidth={1} {...round} />
      <G transform="translate(38.6 31.4) rotate(-90) translate(-34 -30.6)">
        <Path d="M27.4 30.6C31.6 24.6 41.6 24.4 46.6 30.6C41.6 36.8 31.6 36.6 27.4 30.6Z" fill={f.base} />
        <Path d="M46.6 30.6C41.6 36.8 31.6 36.6 27.4 30.6C33.4 33 41 33 46.6 30.6Z" fill={f.shade} />
        <Path d="M27.6 30.6L21 25.8V35.4Z" fill={f.shade} />
        <Path d="M34.6 26.6C35.8 28.6 35.8 32.6 34.6 34.6" stroke={f.light} strokeWidth={1.2} {...round} />
        <PictoEye cx={42.4} cy={29.6} r={1.1} />
      </G>
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les animaux sauvages et domestiques
// ---------------------------------------------------------------------------

function Cow({ size }: IconProps) {
  // Le zébu rouge mbororo, de profil : bosse, cornes en lyre, fanon.
  const c = O.rust;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(12.6, 30, 12.6, 43.2, 1.6)}${pill(30.4, 30, 30.4, 43.2, 1.6)}`} fill={c.shade} />
      <Path d="M7.6 23.4C5.6 26.4 5 30.4 5.4 34" stroke={c.base} strokeWidth={1.6} {...round} />
      <Path d={disc(5.4, 35, 1.9)} fill={O.bark.shade} />
      <Path d="M7.4 25.6C7.4 20.2 11.6 17.6 17.4 17.6H31.6C35.6 17.6 37.4 20.6 36.4 24.6L35 30.4C34.2 33.4 31.6 34.4 28.4 34.4H14.6C10.2 34.4 7.4 31.4 7.4 25.6Z" fill={c.base} />
      <Path d={disc(26.6, 16.6, 4.6)} fill={c.base} />
      <Path d="M30 26.6C32.4 30 32.4 34.4 30 37.6C28.6 35.6 28 32.6 28.4 29.4Z" fill={c.base} />
      <Path d={ellipseCrescent(21.6, 26, 14.4, 8.4, -1.4, -3.4)} fill={c.shade} />
      <Path d={`${pill(9.6, 30, 9.6, 43.4, 1.7)}${pill(27.4, 30, 27.4, 43.4, 1.7)}`} fill={c.base} />
      <Path d="M35.4 12.6C33.2 10 33.2 6.6 35.6 4.6M41.6 12.6C43.8 10 43.8 6.6 41.4 4.6" stroke={O.wool.base} strokeWidth={2.4} {...round} />
      <Path d="M33.6 14.6C35.4 12.4 41.6 12.4 43.4 14.6C44 15.4 44.2 16.4 44 17.4L43.2 24.4C42.8 26.6 41 27.6 38.6 27.6C36.4 27.6 34.6 26.6 34.2 24.4L33 17.4C32.8 16.4 33 15.4 33.6 14.6Z" fill={c.base} />
      <Path d={oval(38.6, 25, 4.2, 2.8)} fill={c.light} />
      <Path d={`${disc(37.2, 25.2, 0.7)}${disc(40, 25.2, 0.7)}`} fill={c.shade} />
      <Path d="M33.2 15.6C31.4 15 29.8 15.6 28.8 17C30.4 18.2 32.2 18.2 33.4 17.4ZM43.8 15.6C45.4 15 46.6 15.8 47 17C45.6 18 44.2 18 43.4 17.4Z" fill={c.shade} />
      <PictoEye cx={36} cy={19} r={1.1} />
      <PictoEye cx={41.2} cy={19} r={1.1} />
    </Svg>
  );
}

function Donkey({ size }: IconProps) {
  // L'âne, de profil : grandes oreilles, museau clair, crinière courte.
  const c = O.donkey;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(12.4, 30, 12.4, 43.2, 1.6)}${pill(28.4, 30, 28.4, 43.2, 1.6)}`} fill={c.shade} />
      <Path d="M7.2 23C5.6 25.6 5.2 28.4 5.6 31" stroke={c.base} strokeWidth={1.6} {...round} />
      <Path d={oval(5.6, 32.4, 1.6, 2.4)} fill={O.ink.base} />
      <Path d="M7 25.4C7 20.2 10.8 17.8 16.4 17.8H27.6L31.4 11.6L38.2 14.6L34 25.6C33 30.6 30 33.6 26 33.6H13.8C9.6 33.6 7 30.6 7 25.4Z" fill={c.base} />
      <Path d={ellipseCrescent(20.6, 25.6, 13.6, 8, -1, -3.6)} fill={O.wool.base} />
      <Path d={`${pill(9.6, 30, 9.6, 43.4, 1.7)}${pill(25.6, 30, 25.6, 43.4, 1.7)}`} fill={c.base} />
      <Path d="M27.4 17.8L31.2 11.4" stroke={c.shade} strokeWidth={2.6} {...round} />
      <Path d="M32.6 12.4C32.4 8 33.4 4.6 35 4C36.2 5.4 36.4 8.6 35.6 12.6Z" fill={c.base} />
      <Path d="M36 13.2C36.8 9 38.6 6.2 40.4 6C41 7.8 40 11 38.2 13.8Z" fill={c.shade} />
      <Path d="M31.4 13.6C33 11 37.6 10.8 39.4 13.4L43.6 20C44.6 21.8 43.8 24.2 41.6 24.4C39 24.6 36.4 23.4 34.6 21.6C32.4 19.4 30.4 16.2 31.4 13.6Z" fill={c.base} />
      <Path d="M39.4 18.4C41.4 17.8 43.2 18.6 43.8 20.4C44.4 22.2 43.4 24.2 41.6 24.4C39.8 24.6 38.4 23.6 37.8 22.2C37.2 20.6 37.8 18.8 39.4 18.4Z" fill={O.wool.base} />
      <Path d={disc(42.2, 21.6, 0.7)} fill={c.shade} />
      <PictoEye cx={36} cy={15.6} r={1.1} />
    </Svg>
  );
}

function Camel({ size }: IconProps) {
  // Le dromadaire du Sahel : une bosse, long cou, longues pattes.
  const c = O.sand;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(11.4, 28, 11.4, 43.2, 1.5)}${pill(26.4, 28, 26.4, 43.2, 1.5)}`} fill={c.shade} />
      <Path d="M6.4 22.6C5 24.8 4.6 27.2 5 29.6" stroke={c.base} strokeWidth={1.6} {...round} />
      <Path d="M6.4 25C6.4 19.6 9.6 15.6 13.4 13.4C15.4 12.2 18.4 9.6 21.4 9.6C24.6 9.6 26.6 12.4 28 15C29 17 30.6 18.4 32 18.4C33.4 18.4 34.4 17 34.6 14.6L35.4 9C35.6 7.4 37 6.2 38.6 6.2H40.4C42.4 6.2 43.8 7.6 44 9.4C44.2 11 43 12.4 41.4 12.4H39.8L38.8 19.6C38.2 25.4 35 30.6 29 31.4C25 32 18 32 13.6 31.4C9.4 30.8 6.4 28.6 6.4 25Z" fill={c.base} />
      <Path d={ellipseCrescent(20.4, 24.4, 14, 7.6, -1, -3.4)} fill={c.shade} />
      <Path d={`${pill(8.6, 28, 8.6, 43.4, 1.6)}${pill(23.4, 28, 23.4, 43.4, 1.6)}`} fill={c.base} />
      <Path d="M40.6 6.4C41.4 4.8 42.8 4.4 43.6 5.2" stroke={c.shade} strokeWidth={1.4} {...round} />
      <PictoEye cx={39.4} cy={8.8} r={0.95} />
    </Svg>
  );
}

function Hen({ size }: IconProps) {
  // La poule rousse, de profil : crête et barbillons rouges, queue relevée.
  const c = O.feather;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(20.6, 34, 20.6, 43, 1)}${pill(27.4, 34, 27.4, 43, 1)}`} fill={O.sun.shade} />
      <Path d="M17.4 43H23.6M24.2 43H30.4" stroke={O.sun.shade} strokeWidth={1.8} {...round} />
      <Path d="M5.6 11C9 12.4 12.6 16.6 14.4 21L10.4 23.6C7 20 5 15.4 5.6 11Z" fill={c.shade} />
      <Path d="M5.6 18.6C5.6 30 13 37.6 23.4 37.6C32.4 37.6 38.6 31.6 38.6 23.6C38.6 21.6 38.2 19.6 37.4 18L35.6 12.4C34.4 8.8 31.4 6.6 28 7.4C24.6 8.2 23.4 11.6 24.4 15C25 17.4 24.2 19 21.6 19C16.4 19 11 13.2 5.6 18.6Z" fill={c.base} />
      <Path d="M11.2 23.6C15.6 22 21.4 23.4 25.4 27.2C27.4 29.2 26.4 32.4 23.6 32.6C17.6 33 12.4 29.6 11.2 23.6Z" fill={c.shade} />
      <Path d="M27.2 7.6C27 5.2 28.6 3.6 30.4 4.4C31 3 33.4 3 33.6 5C35.2 4.8 36.2 6.6 35 8.2L33 9.6C31 8.4 29 8 27.2 7.6Z" fill={O.red.base} />
      <Path d="M35.4 13.6C36.6 14.6 36.8 16.6 35.8 17.8C34.4 17.6 33.8 15.8 34.4 14.2Z" fill={O.red.base} />
      <Path d="M35.6 10L41.4 12L35.8 13.8Z" fill={O.sun.base} />
      <PictoEye cx={31.4} cy={10.8} r={1.15} />
    </Svg>
  );
}

function Dog({ size }: IconProps) {
  // Le chien du village, de profil : oreille tombante, langue, collier, queue en anneau.
  const c = O.sand;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(13, 30, 13, 43.2, 1.7)}${pill(27.4, 30, 27.4, 43.2, 1.7)}`} fill={c.shade} />
      <Path d="M9 22.6C5.4 22 4.2 17.6 6.8 15.4C8.8 13.8 11.6 14.8 11.2 17.4" stroke={c.base} strokeWidth={2.8} {...round} />
      <Path d="M8 26.2C8 21.6 11 19.6 15.6 19.6H28L31.6 15.4L37.4 18.6L34.6 26.4C33.8 30.6 30.8 33.2 27 33.2H14.2C10.4 33.2 8 30.8 8 26.2Z" fill={c.base} />
      <Path d={ellipseCrescent(21, 26.4, 13, 7, -1, -3)} fill={c.shade} />
      <Path d={`${pill(10.2, 30, 10.2, 43.4, 1.8)}${pill(24.6, 30, 24.6, 43.4, 1.8)}`} fill={c.base} />
      <Path d={pill(30.4, 17.4, 34.4, 21, 1.5)} fill={O.red.base} />
      <Path d="M39.2 18.6C39.4 21 40.6 22.4 41.8 22C42.6 21.4 42.4 19.6 41.6 18.4Z" fill={O.pink.light} />
      <Path d="M30 14C30 9.6 33.2 7.2 36.8 7.2C39.6 7.2 41.4 8.8 42.2 11L44.2 12.2C45.4 13 45.6 14.8 44.6 16C43.4 17.4 41.6 18 39.8 18.2C37.8 18.4 36 20 33.8 20C31.4 20 30 17.4 30 14Z" fill={c.base} />
      <Path d="M32.2 9C29.6 9 28.2 11.4 28.6 14.8C29 17 30.6 17.8 32 16.8C33.2 15.8 33.4 12 32.2 9Z" fill={c.shade} />
      <Path d={oval(44.2, 13.4, 1.5, 1.2)} fill={O.ink.base} />
      <PictoEye cx={37.4} cy={11.8} r={1.15} />
    </Svg>
  );
}

function Lion({ size }: IconProps) {
  // Le lion, de face : crinière festonnée, museau clair.
  const c = O.lion;
  const mane = O.rust;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(24 24) scale(0.92) translate(-24 -24)">
        <Path
          d={`${disc(24, 6.8, 5)}${disc(35, 10.6, 5)}${disc(40.6, 20.6, 5)}${disc(39.4, 31.6, 5)}${disc(31.6, 39.6, 5)}${disc(16.4, 39.6, 5)}${disc(8.6, 31.6, 5)}${disc(7.4, 20.6, 5)}${disc(13, 10.6, 5)}${disc(24, 24, 15.6)}${disc(24, 41.4, 5)}`}
          fill={mane.base}
        />
        <Path d={`${crescent(39.4, 31.6, 5, -1.6, -1.6)}${crescent(31.6, 39.6, 5, -1.6, -1.6)}${crescent(24, 41.4, 5, -1.6, -1.6)}${crescent(40.6, 20.6, 5, -1.6, -1.6)}`} fill={mane.shade} />
        <Path d={`${disc(15.4, 13.6, 3)}${disc(32.6, 13.6, 3)}`} fill={c.base} />
        <Path d={`${disc(15.4, 13.6, 1.5)}${disc(32.6, 13.6, 1.5)}`} fill={mane.shade} />
        <Path d={egg(24, 24.4, 10.6, 11.2)} fill={c.base} />
        <Path d={crescent(24, 24.4, 10.8, -2.6, -2.4)} fill={c.shade} />
        <Path d="M24 26C28.6 26 31.6 28.6 31.6 31.6C31.6 34.4 28.6 36 24 36C19.4 36 16.4 34.4 16.4 31.6C16.4 28.6 19.4 26 24 26Z" fill={c.light} />
        <Path d="M21.4 27.4H26.6C26.6 29 25.4 30.4 24 30.4C22.6 30.4 21.4 29 21.4 27.4Z" fill={mane.shade} />
        <Path d="M24 30.4V32.2M20.8 33C22.4 34.2 25.6 34.2 27.2 33" stroke={mane.shade} strokeWidth={1.2} {...round} />
        <PictoEye cx={19.6} cy={22.2} r={1.5} />
        <PictoEye cx={28.4} cy={22.2} r={1.5} />
      </G>
    </Svg>
  );
}

function Elephant({ size }: IconProps) {
  // L'éléphant de Zakouma, de profil : grande oreille, trompe, défense.
  const c = O.elephant;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${pill(10.6, 30, 10.6, 42.6, 2.6)}${pill(25.8, 30, 25.8, 42.6, 2.6)}`} fill={c.shade} />
      <Path d="M5 22C3.8 24 3.6 26.4 4.4 28.6" stroke={c.base} strokeWidth={1.4} {...round} />
      <Path d="M5 24.6C5 15.6 11.6 10.4 20.4 10.4H28C34.6 10.4 39.6 14.6 39.6 21V25.6C39.6 30.6 41 34.4 43.6 36.2C44.4 36.8 44.4 38 43.6 38.4C40.8 39.8 36.6 38.4 35 33.6L34 30.4C32.4 33.2 29.4 34.4 25.4 34.4H13.6C8.6 34.4 5 30.4 5 24.6Z" fill={c.base} />
      <Path d={ellipseCrescent(19.4, 24.6, 14.4, 9.8, -1, -3.6)} fill={c.shade} />
      <Path d={`${pill(14.6, 30, 14.6, 43, 2.7)}${pill(30.2, 28, 30.2, 43, 2.7)}`} fill={c.base} />
      <Path d="M22.6 12.8C27.4 11.2 31.6 13.4 32 18.8C32.4 24.4 29.2 28.4 24.6 28.2C21 28 19.8 25 20 21.2C20.2 17.4 20.4 13.6 22.6 12.8Z" fill={c.light} />
      <Path d="M35.6 26.6C36.4 29 38.4 30 41 29.4" stroke={O.porcelain.base} strokeWidth={2.2} {...round} />
      <PictoEye cx={34.6} cy={19.2} r={1.1} />
    </Svg>
  );
}

function Snake({ size }: IconProps) {
  // Le serpent : corps en S, taches, langue fourchue.
  const c = O.green;
  const body = 'M5 41.6C10.6 41.6 14 40 16.6 36.4C19.4 32.6 22.6 30.6 27.6 30.6C33.4 30.6 36.6 27.6 36.6 23.4C36.6 19 33 16.4 27.6 16.4';
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={body} stroke={c.base} strokeWidth={6} {...round} />
      <Path d="M5 43.8C11 43.8 15.4 41.6 18.4 37.6C20.8 34.4 23.4 33 27.6 33C34.6 33 39 29 39 23.4" stroke={c.shade} strokeWidth={1.6} {...round} />
      <Path d={`${disc(12.2, 40.2, 1.2)}${disc(19.8, 33.6, 1.2)}${disc(28.6, 30.6, 1.2)}${disc(35.6, 25.2, 1.2)}`} fill={c.light} />
      <Path d="M27.6 11.4C22.4 11.4 18.6 13.6 18.6 16.8C18.6 20 22.4 22 27.6 22C30.6 22 32.6 20 32.6 16.8C32.6 13.6 30.6 11.4 27.6 11.4Z" fill={c.base} />
      <Path d="M18.6 16.8C18.6 20 22.4 22 27.6 22C30.6 22 32.6 20 32.6 16.8C30.4 18.6 23.2 19.4 18.6 16.8Z" fill={c.shade} />
      <Path d="M18.8 16.4H12.8M12.8 16.4L10.4 14.4M12.8 16.4L10.4 18.4" stroke={O.red.base} strokeWidth={1.2} {...round} />
      <PictoEye cx={23.6} cy={14.8} r={1.15} />
    </Svg>
  );
}

function Fish({ size }: IconProps) {
  // Le poisson du lac Tchad, de profil : nageoires, ouïe, écailles.
  const c = O.teal;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M17 14.6C20 9.6 26.6 8.6 30 11.4L27.6 16.4Z" fill={c.shade} />
      <Path d="M10.6 24L3.6 15V33Z" fill={c.shade} />
      <Path d="M8.4 24C13 15.4 21.6 12 29.6 12.6C37 13.2 42.6 18 44.4 24C42.6 30 37 34.8 29.6 35.4C21.6 36 13 32.6 8.4 24Z" fill={c.base} />
      <Path d="M44.4 24C42.6 30 37 34.8 29.6 35.4C21.6 36 13 32.6 8.4 24C16 29.6 34.8 30.6 44.4 24Z" fill={c.shade} />
      <Path d="M32.4 17C34 20.6 34 27.4 32.4 31" stroke={c.light} strokeWidth={1.4} {...round} />
      <Path d="M21.4 30.6L25.4 34.2L18.6 35.8Z" fill={c.shade} />
      <Path d="M17.6 20.6L20.6 23.8L23.6 20.6M22 24.8L25 28L28 24.8" stroke={c.light} strokeWidth={1.1} {...round} />
      <PictoEye cx={38} cy={21.6} r={1.5} />
    </Svg>
  );
}

function Bird({ size }: IconProps) {
  // Le tisserin jaune, perché : aile, bec, pattes.
  const c = O.sun;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M4 39.4H38" stroke={O.bark.base} strokeWidth={2.4} {...round} />
      <Path d="M20.4 33.4V39.4M25.4 33.4V39.4" stroke={O.bark.shade} strokeWidth={1.4} {...round} />
      <Path d="M4.4 30.4L13.8 25.6L14.6 31.6Z" fill={c.shade} />
      <Path d="M11.4 28.4C11.4 21 17.4 16.8 24.4 17.6C25 13.6 28.4 10.4 32.4 10.4C36.6 10.4 39.6 13.6 39.6 17.6C39.6 19.4 39 21 38 22.2C38.6 23.8 38.8 25.6 38.4 27.4C37 33 31.6 35.4 25 35.2C17 35 11.4 33.2 11.4 28.4Z" fill={c.base} />
      <Path d="M15.4 25.4C19.4 22.4 27.6 22.6 31.8 26.6C29.6 31.4 22.4 32.4 16.6 30.4C14.6 29.6 14 26.6 15.4 25.4Z" fill={c.shade} />
      <Path d="M39 14.6L44.4 17L39.2 19.6Z" fill={O.bark.base} />
      <PictoEye cx={35.8} cy={16} r={1.05} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les plantes
// ---------------------------------------------------------------------------

function Tree({ size }: IconProps) {
  // L'arbre (le manguier de la cour) : houppier rond, tronc fourchu.
  const c = O.leaf;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M21.4 44V30L16 24.6L18 22.6L22.4 27V22H25.6V27.6L30.4 23L32.4 25L26.6 30.6V44Z" fill={O.bark.base} />
      <Path d="M24 22H25.6V27.6L30.4 23L32.4 25L26.6 30.6V44H24Z" fill={O.bark.shade} />
      <Path d={`${disc(15.4, 18.6, 9.6)}${disc(24, 13.4, 10)}${disc(33, 18.6, 9.6)}${disc(24, 22, 9)}`} fill={c.base} />
      <Path d={`${crescent(33, 18.6, 9.6, -2.6, -3)}${crescent(24, 22, 9, -2, -3.4)}${crescent(15.4, 18.6, 9.6, -1, -3.4)}`} fill={c.shade} />
      <Path d={`${crescent(24, 13.4, 10, 2.4, 2.8)}${crescent(15.4, 18.6, 9.6, 2.6, 2.8)}`} fill={c.light} />
    </Svg>
  );
}

function Baobab({ size }: IconProps) {
  // Le baobab : tronc énorme, branches courtes et noueuses, touffes de feuilles.
  const c = O.bark;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${disc(9.6, 9.4, 4.6)}${disc(19.4, 6.6, 4.4)}${disc(29.6, 6.6, 4.4)}${disc(38.6, 9.6, 4.6)}`} fill={O.leaf.base} />
      <Path d={`${crescent(9.6, 9.4, 4.6, -1.2, -1.6)}${crescent(19.4, 6.6, 4.4, -1.2, -1.6)}${crescent(29.6, 6.6, 4.4, -1.2, -1.6)}${crescent(38.6, 9.6, 4.6, -1.2, -1.6)}`} fill={O.leaf.shade} />
      <Path d="M12.6 44C14.4 37.6 14.8 30 14.2 24.4C13.8 21 11.6 17.4 9.4 12.4L12.2 11L17.4 18.6L19 9.6H22.4L22.6 18.4L27.2 9.6H30.4L28.6 18.6L35.8 11.2L38.4 13.4C35.8 17.2 33.6 20.4 33.6 24.4C33.4 30 33.8 37.6 35.4 44Z" fill={c.light} />
      <Path d="M28.6 18.6L35.8 11.2L38.4 13.4C35.8 17.2 33.6 20.4 33.6 24.4C33.4 30 33.8 37.6 35.4 44H28.4C29.6 37 29.6 29 28.6 18.6Z" fill={c.base} />
      <Path d="M19.4 30.6C19.8 34 19.6 37.4 18.6 40.4M24 26V32" stroke={c.base} strokeWidth={1.3} {...round} />
    </Svg>
  );
}

function Acacia({ size }: IconProps) {
  // L'acacia du Sahel : couronne plate en parasol, tronc qui se divise haut.
  const c = O.leaf;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M22 44V30.4L13.6 21.6L15.6 19.8L22.4 26.6V18H25.6V26.4L32.6 19.6L34.6 21.6L26 30.4V44Z" fill={O.bark.base} />
      <Path d="M24 18H25.6V26.4L32.6 19.6L34.6 21.6L26 30.4V44H24Z" fill={O.bark.shade} />
      <Path d="M3.6 17.4C3.6 12.6 13 8.6 24 8.6C35 8.6 44.4 12.6 44.4 17.4C44.4 20.6 39.6 22.4 32 22.4H16C8.4 22.4 3.6 20.6 3.6 17.4Z" fill={c.base} />
      <Path d="M44.4 17.4C44.4 20.6 39.6 22.4 32 22.4H16C8.4 22.4 3.6 20.6 3.6 17.4C10 19.4 38 19.4 44.4 17.4Z" fill={c.shade} />
      <Path d="M9.4 13.4C15 11.2 21 10.4 27 10.6" stroke={c.light} strokeWidth={1.6} {...round} />
    </Svg>
  );
}

function MilletEar({ size }: IconProps) {
  // L'épi de mil — the staple crop of the Sahel : un long épi grenu sur sa tige.
  const c = O.straw;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M24 44V26" stroke={O.leaf.base} strokeWidth={2.4} {...round} />
      <Path d="M24 36C18.6 36 14.4 32.6 13.4 28C18.6 27.8 22.8 30.8 24 36ZM24 32C29.4 32 33.6 28.6 34.6 24C29.4 23.8 25.2 26.8 24 32Z" fill={O.leaf.base} />
      <Path d="M24 32C29.4 32 33.6 28.6 34.6 24C31.4 27 27.6 29.4 24 32Z" fill={O.leaf.shade} />
      <Path d="M24 3.6C27.2 3.6 29 6.4 29 10V22.4C29 25.6 26.8 27.6 24 27.6C21.2 27.6 19 25.6 19 22.4V10C19 6.4 20.8 3.6 24 3.6Z" fill={c.base} />
      <Path d="M24 3.6C27.2 3.6 29 6.4 29 10V22.4C29 25.6 26.8 27.6 24 27.6C25.8 25.4 26.4 22.6 26.4 19.6V9.6C26.4 6.8 25.6 4.8 24 3.6Z" fill={c.shade} />
      <Path d={`${disc(21.6, 9, 1)}${disc(21.6, 13.6, 1)}${disc(21.6, 18.2, 1)}${disc(21.6, 22.8, 1)}${disc(24.4, 11.2, 1)}${disc(24.4, 15.8, 1)}${disc(24.4, 20.4, 1)}`} fill={c.light} />
    </Svg>
  );
}

function Grass({ size }: IconProps) {
  // L'herbe : une touffe de brins pointus.
  const c = O.grass;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M8 42C6.6 34 6 26.6 4.4 18.6C9.6 24.4 12.6 32.6 13.4 42ZM18.6 42C17.4 30.4 18.4 18.6 22.4 6.4C24.4 18.4 24.4 30.4 23.6 42ZM33.6 42C33.6 32.4 36.2 22.6 43.6 13.4C41.6 23.4 39.6 32.6 39.4 42Z" fill={c.base} />
      <Path d="M13 42C13.4 31.6 11.6 21.6 9.4 11.4C15.6 20.6 18.2 31.4 18.6 42ZM26 42C26.4 32 28.4 22.6 33 13.6C33.6 23 32.6 32.6 31.4 42Z" fill={c.shade} />
      <Path d="M4.6 42H43.4" stroke={O.leaf.shade} strokeWidth={2.4} {...round} />
    </Svg>
  );
}

function Flower({ size }: IconProps) {
  // La fleur : cinq pétales, cœur doré, tige et feuille.
  const c = O.pink;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M24 44V26" stroke={O.leaf.base} strokeWidth={2.4} {...round} />
      <Path d="M24 38C18.8 38 15 34.8 14.2 30.4C19.2 30.2 23 33.2 24 38ZM24 34C29.2 34 33 30.8 33.8 26.4C28.8 26.2 25 29.2 24 34Z" fill={O.leaf.base} />
      <Path d="M24 34C29.2 34 33 30.8 33.8 26.4C30.6 29.6 27.4 31.8 24 34Z" fill={O.leaf.shade} />
      <Path d={`${disc(24, 8.6, 6)}${disc(33.6, 15.6, 6)}${disc(14.4, 15.6, 6)}`} fill={c.base} />
      <Path d={`${disc(30, 26.4, 6)}${disc(18, 26.4, 6)}`} fill={c.shade} />
      <Path d={crescent(33.6, 15.6, 6, -1.6, -1.6)} fill={c.shade} />
      <Path d={disc(24, 18.6, 5.2)} fill={O.sun.base} />
      <Path d={crescent(24, 18.6, 5.2, -1.4, -1.4)} fill={O.sun.shade} />
    </Svg>
  );
}

function Leaf({ size }: IconProps) {
  // La feuille : deux moitiés, une au soleil, une à l'ombre, et la nervure.
  const c = O.leaf;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M41.6 6.4C24 6 8.6 15.6 8.6 33.4C8.6 35.2 9 37 9.6 38.4C27.6 39.6 42 26 41.6 6.4Z" fill={c.base} />
      <Path d="M41.6 6.4C42 26 27.6 39.6 9.6 38.4C17.6 29 29 17.6 41.6 6.4Z" fill={c.shade} />
      <Path d="M4.4 43.6C14 33.4 26 20.4 39.6 8.6" stroke={c.light} strokeWidth={1.6} {...round} />
      <Path d="M18.6 28.4L16.4 19.6M25.8 21L25.4 13.4M18.6 28.4L28.4 29.2M25.8 21L34.6 21.2" stroke={c.light} strokeWidth={1.2} {...round} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les phénomènes naturels (la pluie, le vent, etc.)
// ---------------------------------------------------------------------------

function Rain({ size }: IconProps) {
  // La pluie : un nuage gris, des gouttes.
  const c = O.metal;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${disc(14, 19.4, 7.4)}${disc(24, 13.4, 9.4)}${disc(34, 18.4, 8)}${pill(12, 22.6, 36, 22.6, 5.6)}`} fill={c.base} />
      <Path d="M6.4 22.6A5.6 5.6 0 0 0 12 28.2H36A5.6 5.6 0 0 0 41.6 22.6C37 25.6 11 25.6 6.4 22.6Z" fill={c.shade} />
      <Path d={crescent(34, 18.4, 8, -2.2, -2.2)} fill={c.shade} />
      <Path d={`${drop(13.6, 37.4, 2.6)}${drop(24, 41.6, 2.6)}${drop(34.4, 37.4, 2.6)}${drop(18.8, 31.6, 1.8)}${drop(29.2, 32, 1.8)}`} fill={O.sky.shade} />
    </Svg>
  );
}

function Wind({ size }: IconProps) {
  // Le vent : des souffles enroulés, deux feuilles emportées.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M4.6 16.4H26.4C30.4 16.4 32.4 13.6 32.4 11C32.4 8.2 30.2 6.2 27.6 6.2C25.2 6.2 23.4 8 23.4 10.2" stroke={O.sky.shade} strokeWidth={3} {...round} />
      <Path d="M4.6 25H36.4C40.6 25 43.4 27.8 43.4 31.4C43.4 34.8 40.8 37.4 37.6 37.4C34.8 37.4 32.8 35.4 32.8 33" stroke={O.sky.base} strokeWidth={3} {...round} />
      <Path d="M8.6 33.4H22C24.8 33.4 26.6 35.4 26.6 37.8C26.6 40.2 24.8 42 22.6 42" stroke={O.sky.shade} strokeWidth={3} {...round} />
      <Path d="M36.4 8.4C38.6 5.4 42.4 4.6 44.4 5.6C44 8.6 41 10.8 36.4 8.4Z" fill={O.leaf.base} />
      <Path d="M36.4 8.4C39.4 7 42 6 44.4 5.6C44 8.6 41 10.8 36.4 8.4Z" fill={O.leaf.shade} />
      <Path d="M12.6 41.6C13 38.4 15.6 36.4 18 36.6C18.2 39.4 16 41.8 12.6 41.6Z" fill={O.leaf.base} />
    </Svg>
  );
}

function Sun({ size }: IconProps) {
  // Le soleil : un disque, huit rayons arrondis.
  const c = O.sun;
  const rays = [0, 45, 90, 135, 180, 225, 270, 315]
    .map((a) => {
      const t = (a * Math.PI) / 180;
      return pill(24 + Math.cos(t) * 15.6, 24 + Math.sin(t) * 15.6, 24 + Math.cos(t) * 19.4, 24 + Math.sin(t) * 19.4, 2);
    })
    .join('');
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={rays} fill={c.base} />
      <Path d={disc(24, 24, 11.6)} fill={c.base} />
      <Path d={crescent(24, 24, 11.6, -3, -3)} fill={c.shade} />
    </Svg>
  );
}

function Cloud({ size }: IconProps) {
  // Le nuage blanc : son ombre dessine sa forme sur la carte.
  const c = O.cloud;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${disc(13.4, 26.6, 8.4)}${disc(24.6, 19.4, 11)}${disc(35.4, 25.4, 8.6)}${pill(12.4, 30.6, 36.4, 30.6, 6.4)}`} fill={c.base} />
      <Path d="M6 30.6A6.4 6.4 0 0 0 12.4 37H36.4A6.4 6.4 0 0 0 42.8 30.6C38 34 11 34 6 30.6Z" fill={c.shade} />
      <Path d={crescent(35.4, 25.4, 8.6, -2.4, -2.4)} fill={c.shade} />
    </Svg>
  );
}

function Moon({ size }: IconProps) {
  // La lune : un croissant doré et deux étoiles.
  const c = O.sun;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={crescent(21.6, 26, 17.4, 9.4, -7)} fill={c.light} />
      <Path d={crescent(21.6, 26, 17.4, 6.2, -10.6)} fill={c.base} />
      <Path d="M37.4 5.6L38.7 8.9L42 10.2L38.7 11.5L37.4 14.8L36.1 11.5L32.8 10.2L36.1 8.9Z" fill={c.base} stroke={c.base} strokeWidth={0.8} strokeLinejoin="round" />
      <Path d="M41.2 22L42 24L44 24.8L42 25.6L41.2 27.6L40.4 25.6L38.4 24.8L40.4 24Z" fill={c.base} stroke={c.base} strokeWidth={0.8} strokeLinejoin="round" />
    </Svg>
  );
}

function Lightning({ size }: IconProps) {
  // L'éclair : un nuage d'orage, un éclair doré.
  const c = O.elephant;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${disc(13.6, 17.4, 7.4)}${disc(24, 11.6, 9)}${disc(34, 16.6, 8)}${pill(12, 21, 36, 21, 5.6)}`} fill={c.base} />
      <Path d="M6.4 21A5.6 5.6 0 0 0 12 26.6H36A5.6 5.6 0 0 0 41.6 21C37 24 11 24 6.4 21Z" fill={c.shade} />
      <Path d={crescent(34, 16.6, 8, -2.2, -2.2)} fill={c.shade} />
      <Path d="M25.4 22.6L16.8 34.2H23.4L19.8 44.2L32 30.4H25.2L29.4 22.6Z" fill={O.sun.base} stroke={O.sun.base} strokeWidth={1} strokeLinejoin="round" />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les aliments
// ---------------------------------------------------------------------------

function Rice({ size }: IconProps) {
  // Le bol de riz : un dôme de grains dans un bol émaillé.
  const rice = O.porcelain;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M7.4 25C7.4 15.6 14.8 9.4 24 9.4C33.2 9.4 40.6 15.6 40.6 25Z" fill={rice.base} />
      <Path d="M24 9.4C33.2 9.4 40.6 15.6 40.6 25H31.4C31.4 17.4 28.6 11.8 24 9.4Z" fill={rice.shade} />
      <Path d="M15.4 17.4L17.6 16.4M20.6 13.6L22.8 13.2M19.4 20.4L21.6 19.8M26.4 16.8L28.4 17.6M14 22.4L16.2 22M25.2 21.6L27.4 22.2" stroke={rice.shade} strokeWidth={1.2} {...round} />
      <Path d="M4 24H44C44 35 35 42.6 24 42.6C13 42.6 4 35 4 24Z" fill={O.blue.base} />
      <Path d="M44 24C44 35 35 42.6 24 42.6C32.6 39.6 38.4 32.6 39 24Z" fill={O.blue.shade} />
      <Path d="M4.2 26.4H43.8" stroke={O.blue.light} strokeWidth={2} />
    </Svg>
  );
}

function Bread({ size }: IconProps) {
  // Le pain : une baguette en travers, entailles dorées.
  const c = O.bread;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="rotate(-38 24 24)">
        <Path d={pill(9, 24, 39, 24, 6.6)} fill={c.base} />
        <Path d="M9 24H39A6.6 6.6 0 0 1 39 30.6H9A6.6 6.6 0 0 1 9 24Z" fill={c.shade} />
        <Path d="M13.4 21.4L17 25.2M20.4 20.8L24 24.6M27.4 20.8L31 24.6M34 21.4L37.4 25" stroke={c.light} strokeWidth={2.2} {...round} />
      </G>
    </Svg>
  );
}

function Milk({ size }: IconProps) {
  // Le lait : une bouteille de verre, le lait blanc, la capsule bleue.
  const glass = O.sky;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M19.4 4H28.6V9.4C28.6 11.6 30 12.8 31.6 14.4C33.6 16.4 34.6 18.6 34.6 21.6V40.6C34.6 42.5 33.1 44 31.2 44H16.8C14.9 44 13.4 42.5 13.4 40.6V21.6C13.4 18.6 14.4 16.4 16.4 14.4C18 12.8 19.4 11.6 19.4 9.4Z" fill={glass.light} />
      <Path d="M14.4 21.4H33.6V40C33.6 41.7 32.3 43 30.6 43H17.4C15.7 43 14.4 41.7 14.4 40Z" fill={O.porcelain.light} />
      <Path d="M28.4 21.4H33.6V40C33.6 41.7 32.3 43 30.6 43H28.4Z" fill={O.porcelain.base} />
      <Path d="M14.4 21.4H33.6" stroke={O.porcelain.shade} strokeWidth={1} />
      <Rect x={18.6} y={3.4} width={10.8} height={4.6} rx={1.4} fill={O.blue.base} />
      <Path d={drop(24, 34, 3)} fill={O.sky.base} />
    </Svg>
  );
}

function Meat({ size }: IconProps) {
  // La viande : un morceau sur l'os.
  const c = O.meat;
  const bone = O.porcelain;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(25 24) scale(1.06) translate(-25 -24)">
        <Path d={`${pill(30, 18, 39.6, 8.4, 2.8)}${disc(38.4, 6.2, 3)}${disc(42, 9.8, 3)}`} fill={bone.base} />
        <Path d={crescent(42, 9.8, 3, -0.9, -0.9)} fill={bone.shade} />
        <Path d="M8.4 30.4C4.6 22.6 9.8 11.6 20.4 9.8C29 8.4 36.2 15 34.8 23.4C33.6 31.4 26.4 37.6 18 37.6C13.8 37.6 10.4 34.6 8.4 30.4Z" fill={O.egg.light} />
        <Path d="M10.6 29.6C7.8 23.4 12 14.6 20.6 13.2C27.6 12 33.2 17.2 32 24C31 30.4 25.2 35 18.6 35C15.2 35 12.2 32.8 10.6 29.6Z" fill={c.base} />
        <Path d="M32 24C31 30.4 25.2 35 18.6 35C15.2 35 12.2 32.8 10.6 29.6C17.4 32 27 30 32 24Z" fill={c.shade} />
        <Path d="M16.2 20.4C18.6 18.4 22 17.6 24.6 18.6M15.2 25.6C18.6 23.6 23 23.4 26.4 24.6" stroke={c.light} strokeWidth={1.4} {...round} />
      </G>
    </Svg>
  );
}

function Banana({ size }: IconProps) {
  // La banane : un croissant jaune, bouts bruns.
  const c = O.sun;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(26 23) scale(1.08) translate(-26 -23)">
        <Path d="M9.4 8.6C8.2 24.6 18.8 38.4 34.8 40.6C38.6 41.2 42.4 40 43.6 37.4C44 36.4 43.2 35.4 42.2 35.4C27.4 35.4 15.6 24.8 14.6 9.4C14.4 6.4 9.6 6 9.4 8.6Z" fill={c.base} />
        <Path d="M43.6 37.4C42.4 40 38.6 41.2 34.8 40.6C22 38.8 12.6 29.4 10.4 17.2C14.4 28.4 25.6 36.8 39.6 36.2C41.2 36.2 42.6 36 43.6 37.4Z" fill={c.shade} />
        <Path d="M9.6 6.6C9.8 5 10.8 4 12 4C13.2 4 14.2 5 14.4 6.6L14.6 9.4H9.4Z" fill={O.bark.base} />
        <Path d={disc(42.8, 36.6, 1.6)} fill={O.bark.base} />
      </G>
    </Svg>
  );
}

function Peanut({ size }: IconProps) {
  // L'arachide — a Chadian staple : la coque à deux renflements, quadrillée, et deux graines.
  const c = O.peanut;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(25 24) scale(1.08) translate(-25 -24)">
        <G transform="rotate(-40 22 24)">
          <Path d="M22 3.6C27.6 3.6 30.6 7.6 30.6 12.4C30.6 16.2 28.6 18.6 28.6 21.2C28.6 23.8 31 26.6 31 31.6C31 37.6 27 41.6 22 41.6C17 41.6 13 37.6 13 31.6C13 26.6 15.4 23.8 15.4 21.2C15.4 18.6 13.4 16.2 13.4 12.4C13.4 7.6 16.4 3.6 22 3.6Z" fill={c.base} />
          <Path d="M22 3.6C27.6 3.6 30.6 7.6 30.6 12.4C30.6 16.2 28.6 18.6 28.6 21.2C28.6 23.8 31 26.6 31 31.6C31 37.6 27 41.6 22 41.6C25.4 39 26.8 35.4 26.4 31.4C26 27 24.6 24.4 24.6 21.2C24.6 18 26.4 15.6 26.2 12C26 8.6 24.6 5.4 22 3.6Z" fill={c.shade} />
          <Path d="M16.4 10.4H27.6M15.8 15.6H28.2M15.8 28H28.2M15.4 33.4H28.6M19 6.4V17.6M22 5V18.4M25 6.4V17.6M18.8 26V38.6M22 25.2V40M25.2 26V38.6" stroke={c.shade} strokeWidth={1} {...round} />
        </G>
        <Path d={`${oval(36.4, 37.6, 3.6, 5)}`} fill={O.rust.light} />
        <Path d={ellipseCrescent(36.4, 37.6, 3.6, 5, -1, -1.2)} fill={O.rust.base} />
      </G>
    </Svg>
  );
}

function Water({ size }: IconProps) {
  // L'eau : une grande goutte.
  const c = O.sky;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={drop(24, 32, 12.6)} fill={c.base} />
      <Path d={crescent(24, 32, 12.6, -3.2, -3.2)} fill={c.shade} />
    </Svg>
  );
}

function Egg({ size }: IconProps) {
  // L'œuf de poule du pays, brun clair.
  const c = O.egg;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M24 4.4C32.6 4.4 38.8 17.6 38.8 28.6C38.8 37.4 32.4 43.6 24 43.6C15.6 43.6 9.2 37.4 9.2 28.6C9.2 17.6 15.4 4.4 24 4.4Z" fill={c.base} />
      <Path d={ellipseCrescent(24, 28.6, 14.8, 15, -3.6, -3.6)} fill={c.shade} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : le marché
// ---------------------------------------------------------------------------

function Basket({ size }: IconProps) {
  // Le panier tressé, son anse, des fruits du marché.
  const c = O.straw;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M10.6 21C10.6 8.6 37.4 8.6 37.4 21" stroke={c.shade} strokeWidth={2.8} {...round} />
      <Path d={`${disc(17.6, 19.6, 4.2)}`} fill={O.red.base} />
      <Path d={`${oval(27.4, 18.8, 5, 3.6)}`} fill={O.mango.base} />
      <Path d={`${disc(33, 20.6, 3.4)}`} fill={O.orange.base} />
      <Path d="M4.6 21.4H43.4L39.4 41.4C39.1 42.9 37.8 44 36.3 44H11.7C10.2 44 8.9 42.9 8.6 41.4Z" fill={c.base} />
      <Path d="M34.4 21.4H43.4L39.4 41.4C39.1 42.9 37.8 44 36.3 44H33.2C34.4 37 34.8 29 34.4 21.4Z" fill={c.shade} />
      <Path d="M6.4 28.4H41.6M7.8 35.4H40.2" stroke={c.shade} strokeWidth={1.4} />
      <Path d="M14.4 21.4V44M24 21.4V44M33.6 21.4V44" stroke={c.light} strokeWidth={1.4} />
      <Rect x={3.6} y={20} width={40.8} height={3.6} rx={1.8} fill={c.shade} />
    </Svg>
  );
}

function Money({ size }: IconProps) {
  // Billets et pièces en francs CFA.
  const note = O.green;
  const coin = COINS.brass;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={4} y={9} width={34} height={21} rx={3} fill={note.shade} />
      <Rect x={4} y={9} width={34} height={21} rx={3} fill={note.base} transform="translate(2 4.4)" />
      <Path d={disc(23, 23.8, 5.4)} fill={note.light} />
      <Path d="M10 18H15M10 30H15M30.6 18H35" stroke={note.light} strokeWidth={1.6} {...round} />
      <Path d={disc(34.4, 34.4, 9.4)} fill={coin.rim} />
      <Path d={disc(34.4, 34.4, 7.4)} fill={coin.face} />
      <Path d={disc(34.4, 34.4, 4.2)} fill={coin.ring} />
      <Path d={disc(34.4, 34.4, 2.6)} fill={coin.face} />
    </Svg>
  );
}

function Scale({ size }: IconProps) {
  // La balance du marché : un fléau, deux plateaux.
  const c = O.metal;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M11 12L5.6 25M11 12L16.4 25M37 12L31.6 25M37 12L42.4 25" stroke={c.shade} strokeWidth={1.2} {...round} />
      <Path d={pill(24, 10.4, 24, 38, 1.8)} fill={c.shade} />
      <Path d={pill(8, 11.6, 40, 11.6, 1.7)} fill={c.base} />
      <Path d={disc(24, 9.6, 2.8)} fill={O.sun.base} />
      <Path d="M3.6 25H18.4C18.4 29.4 15.2 32.4 11 32.4C6.8 32.4 3.6 29.4 3.6 25Z" fill={c.base} />
      <Path d="M29.6 25H44.4C44.4 29.4 41.2 32.4 37 32.4C32.8 32.4 29.6 29.4 29.6 25Z" fill={c.base} />
      <Path d="M18.4 25C18.4 29.4 15.2 32.4 11 32.4C14 30.6 15.4 28 15.4 25ZM44.4 25C44.4 29.4 41.2 32.4 37 32.4C40 30.6 41.4 28 41.4 25Z" fill={c.shade} />
      <Path d={disc(11, 21.4, 3.8)} fill={O.red.base} />
      <Path d={oval(37, 22, 4.4, 3.2)} fill={O.mango.base} />
      <Path d="M15.6 38.4C15.6 37.3 16.5 36.4 17.6 36.4H30.4C31.5 36.4 32.4 37.3 32.4 38.4V42H15.6Z" fill={c.base} />
      <Path d="M15.6 40H32.4V42H15.6Z" fill={c.shade} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les moyens de transport et les voyages
// ---------------------------------------------------------------------------

function Bicycle({ size }: IconProps) {
  // Le vélo, de profil.
  const frame = O.blue;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={`${disc(11.6, 32, 7.4)}${disc(36.4, 32, 7.4)}`} stroke={O.rubber.base} strokeWidth={2.6} fill="none" />
      <Path d={`${disc(11.6, 32, 1.6)}${disc(36.4, 32, 1.6)}`} fill={O.metal.shade} />
      <Path d="M11.6 32L19.6 19.6H32.2L22.4 32ZM11.6 32H22.4M19 17.6L22.4 32M32.8 16.4L36.4 32" stroke={frame.base} strokeWidth={2.4} {...round} />
      <Path d={pill(15.6, 16.4, 21.8, 16.4, 1.7)} fill={O.rubber.base} />
      <Path d="M30.4 14.6L33 15.8L36.4 13.6" stroke={O.rubber.base} strokeWidth={2.2} {...round} />
      <Path d={disc(22.4, 32, 2.4)} fill={O.metal.shade} />
    </Svg>
  );
}

function Car({ size }: IconProps) {
  // La voiture, de profil.
  const c = O.orange;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M12.6 21.4L16.6 13.4C17.2 12.2 18.4 11.4 19.8 11.4H30.4C31.8 11.4 33 12.2 33.8 13.2L39.4 21.4Z" fill={c.base} />
      <Path d="M18.4 20.6L21 14.6H25.2V20.6ZM27.4 20.6V14.6H31.2L35.2 20.6Z" fill={O.sky.base} />
      <Path d="M4 25.4C4 23.2 5.8 21.4 8 21.4H39.4C42 21.4 44 23.4 44 26V31.6C44 33 42.9 34 41.6 34H6.4C5.1 34 4 33 4 31.6Z" fill={c.base} />
      <Path d="M4 29.4H44V31.6C44 33 42.9 34 41.6 34H6.4C5.1 34 4 33 4 31.6Z" fill={c.shade} />
      <Path d="M24.4 23.6H27.6" stroke={c.shade} strokeWidth={1.4} {...round} />
      <Path d={oval(41.6, 25, 1.4, 1.2)} fill={O.sun.light} />
      <Path d={`${disc(13.4, 34, 5.4)}${disc(34.6, 34, 5.4)}`} fill={O.rubber.base} />
      <Path d={`${disc(13.4, 34, 2.2)}${disc(34.6, 34, 2.2)}`} fill={O.metal.base} />
    </Svg>
  );
}

function Bus({ size }: IconProps) {
  // Le car de brousse : carrosserie jaune, vitres, bagages sur le toit.
  const c = O.sun;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M8 10.4C8 9.3 8.9 8.4 10 8.4H17.4V14.4H8ZM19.4 6.6C19.4 5.5 20.3 4.6 21.4 4.6H27.4C28.5 4.6 29.4 5.5 29.4 6.6V14.4H19.4Z" fill={O.orange.base} />
      <Path d="M31.4 9.4H38.4V14.4H31.4Z" fill={O.wood.base} />
      <Path d="M24.4 4.6H27.4C28.5 4.6 29.4 5.5 29.4 6.6V14.4H24.4Z" fill={O.orange.shade} />
      <Path d="M4 17.6C4 15.4 5.8 13.6 8 13.6H38.8C41.6 13.6 44 16 44 18.8V33.4C44 34.7 42.9 35.8 41.6 35.8H6.4C5.1 35.8 4 34.7 4 33.4Z" fill={c.base} />
      <Path d="M4 29.4H44V33.4C44 34.7 42.9 35.8 41.6 35.8H6.4C5.1 35.8 4 34.7 4 33.4Z" fill={c.shade} />
      <Path d="M7.6 17.4H14.6V24.4H7.6ZM17.2 17.4H24.2V24.4H17.2ZM26.8 17.4H33.8V24.4H26.8ZM36.4 17.4H40.6C41.2 17.4 41.6 17.8 41.6 18.4V24.4H36.4Z" fill={O.sky.base} />
      <Path d={`${disc(12.6, 36, 4.8)}${disc(35.4, 36, 4.8)}`} fill={O.rubber.base} />
      <Path d={`${disc(12.6, 36, 2)}${disc(35.4, 36, 2)}`} fill={O.metal.base} />
    </Svg>
  );
}

function Pirogue({ size }: IconProps) {
  // La pirogue du lac Tchad et du Chari : coque effilée, perche, vaguelettes.
  const w = O.wood;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={pill(30.4, 4.6, 19.6, 30, 1.2)} fill={O.bark.base} />
      <Path d="M3.6 21.4C8.4 30.6 16 34.2 24 34.2C32 34.2 39.6 30.6 44.4 21.4C38 25.4 31 26.8 24 26.8C17 26.8 10 25.4 3.6 21.4Z" fill={w.base} />
      <Path d="M3.6 21.4C10 25.4 17 26.8 24 26.8C31 26.8 38 25.4 44.4 21.4C42.6 25 40.4 27.6 37.8 29.4C33.6 30 28.8 30.4 24 30.4C19.2 30.4 14.4 30 10.2 29.4C7.6 27.6 5.4 25 3.6 21.4Z" fill={w.shade} />
      <Path d="M6.4 39.6C9.6 37.4 12.8 37.4 16 39.6C19.2 41.8 22.4 41.8 25.6 39.6C28.8 37.4 32 37.4 35.2 39.6C38.4 41.8 41.6 41.8 44 39.8" stroke={O.sky.base} strokeWidth={2.2} {...round} />
    </Svg>
  );
}

function Cart({ size }: IconProps) {
  // La charrette à âne : plateau de planches, une roue, les brancards.
  const w = O.wood;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={pill(32, 25.4, 44.4, 22.6, 1.4)} fill={w.shade} />
      <Path d="M6 12.6H8.8V22H6ZM16.4 12.6H19.2V22H16.4ZM26.8 12.6H29.6V22H26.8Z" fill={w.shade} />
      <Path d="M6 14.4H34V17.2H6Z" fill={w.base} />
      <Path d="M4.4 21.4C4.4 20.6 5 20 5.8 20H34.6C35.4 20 36 20.6 36 21.4V26.4C36 27.2 35.4 27.8 34.6 27.8H5.8C5 27.8 4.4 27.2 4.4 26.4Z" fill={w.base} />
      <Path d="M4.4 24.6H36V26.4C36 27.2 35.4 27.8 34.6 27.8H5.8C5 27.8 4.4 27.2 4.4 26.4Z" fill={w.shade} />
      <Path d={disc(20.2, 34, 9.6)} fill={O.rubber.base} />
      <Path d={disc(20.2, 34, 5.4)} fill={O.metal.base} />
      <Path d={crescent(20.2, 34, 5.4, -1.6, -1.6)} fill={O.metal.shade} />
      <Path d={disc(20.2, 34, 1.6)} fill={O.rubber.base} />
    </Svg>
  );
}

function Suitcase({ size }: IconProps) {
  // La valise : poignée, sangles, fermoirs.
  const c = O.orange;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M18 13.4V10.4C18 8.2 19.8 6.4 22 6.4H26C28.2 6.4 30 8.2 30 10.4V13.4" stroke={O.bark.base} strokeWidth={2.8} {...round} />
      <Rect x={4} y={13} width={40} height={30} rx={5} fill={c.base} />
      <Path d="M35 13H39C41.8 13 44 15.2 44 18V38C44 40.8 41.8 43 39 43H35Z" fill={c.shade} />
      <Path d="M13 13H17V43H13ZM31 13H35V43H31Z" fill={O.bark.base} />
      <Path d="M31 13H35V43H31Z" fill={O.bark.shade} />
      <Path d={`${disc(15, 18.4, 1.1)}${disc(33, 18.4, 1.1)}`} fill={O.sun.base} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les jeux, les cérémonies et les fêtes
// ---------------------------------------------------------------------------

function Ball({ size }: IconProps) {
  // Le ballon de football : blanc, pentagones sombres ; l'ombre dessine la sphère.
  const c = O.porcelain;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d={disc(24, 24, 19.6)} fill={c.base} />
      <Path d={crescent(24, 24, 19.6, -4.6, -4.6)} fill={c.shade} />
      <Path d="M24 15.6L31 20.6L28.4 28.8H19.6L17 20.6ZM24 4.4C27.4 4.4 30.6 5.2 33.4 6.8L30.6 11.4L24 9.6L17.4 11.4L14.6 6.8C17.4 5.2 20.6 4.4 24 4.4ZM43.2 21.6C43.6 25.4 42.8 29.4 41 32.6L36.6 29.8L37 23.6L40.2 19ZM7.8 19L11 23.6L11.4 29.8L7 32.6C5.2 29.4 4.4 25.4 4.8 21.6ZM17.4 42.4L19.4 37.4H28.6L30.6 42.4C28.6 43.2 26.4 43.6 24 43.6C21.6 43.6 19.4 43.2 17.4 42.4Z" fill={O.ink.base} />
      <Path d="M24 9.6V15.6M17 20.6L11 23.6M31 20.6L37 23.6M19.6 28.8L19.4 37.4M28.4 28.8L28.6 37.4" stroke={O.ink.light} strokeWidth={1.2} {...round} />
    </Svg>
  );
}

function Rope({ size }: IconProps) {
  // La corde à sauter en plein tour, poignées de bois : la boucle occupe la vignette, sinon
  // elle se lit comme un simple U.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M11.6 16.6C4 24.6 4.4 38.6 16.4 42.4C21.4 44 26.6 44 31.6 42.4C43.6 38.6 44 24.6 36.4 16.6" stroke={O.orange.base} strokeWidth={2.8} {...round} />
      <G transform="rotate(-24 10 10.4)">
        <Path d={pill(10, 4.4, 10, 16.4, 3.4)} fill={O.wood.base} />
        <Path d="M10 1A3.4 3.4 0 0 1 13.4 4.4V16.4A3.4 3.4 0 0 1 10 19.8Z" fill={O.wood.shade} />
      </G>
      <G transform="rotate(24 38 10.4)">
        <Path d={pill(38, 4.4, 38, 16.4, 3.4)} fill={O.wood.base} />
        <Path d="M38 1A3.4 3.4 0 0 1 41.4 4.4V16.4A3.4 3.4 0 0 1 38 19.8Z" fill={O.wood.shade} />
      </G>
    </Svg>
  );
}

function Drum({ size }: IconProps) {
  // Le tam-tam (djembé) : fût en calice, peau tendue, cordes de tension.
  const w = O.wood;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M10 9.6H38C38 18.6 32.4 22.8 28.6 26.2L30.4 41.4C30.5 42.8 29.4 44 28 44H20C18.6 44 17.5 42.8 17.6 41.4L19.4 26.2C15.6 22.8 10 18.6 10 9.6Z" fill={w.base} />
      <Path d="M31.6 9.6H38C38 18.6 32.4 22.8 28.6 26.2L30.4 41.4C30.5 42.8 29.4 44 28 44H25.6C26.4 36 25.6 28 26 24.4C29.6 20.6 31.4 16 31.6 9.6Z" fill={w.shade} />
      <Path d="M12 11L16.6 21.4L21.2 11L25.8 21.4L30.4 11L35 21.4" stroke={O.straw.light} strokeWidth={1.4} {...round} />
      <Rect x={8.6} y={5} width={30.8} height={6} rx={3} fill={O.egg.base} />
      <Path d="M33 5H36.4C38.1 5 39.4 6.3 39.4 8C39.4 9.7 38.1 11 36.4 11H33Z" fill={O.egg.shade} />
      <Path d="M17.4 37H30.6" stroke={O.red.base} strokeWidth={2.4} />
    </Svg>
  );
}

function Marble({ size }: IconProps) {
  // Les billes : trois sphères de verre, chacune sa couleur et sa spirale.
  const bead = (cx: number, cy: number, r: number, c: { light: string; base: string; shade: string }) => (
    <>
      <Path d={disc(cx, cy, r)} fill={c.base} />
      <Path d={crescent(cx, cy, r, -r * 0.3, -r * 0.3)} fill={c.shade} />
      <Path d={`M${cx - r * 0.5} ${cy + r * 0.1}C${cx - r * 0.2} ${cy - r * 0.5} ${cx + r * 0.4} ${cy - r * 0.4} ${cx + r * 0.4} ${cy + r * 0.1}`} stroke={c.light} strokeWidth={r * 0.22} {...round} />
    </>
  );
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      {bead(31.6, 14.4, 7.6, O.sun)}
      {bead(16, 29.6, 11.6, O.blue)}
      {bead(35.4, 35.4, 8.4, O.red)}
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les maladies
// ---------------------------------------------------------------------------

function Thermometer({ size }: IconProps) {
  // Le thermomètre : tube de verre, colonne rouge, graduations.
  const g = O.porcelain;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform="translate(24 24) scale(1.08) translate(-24 -24)">
        <G transform="rotate(38 24 24)">
          <Path d="M19.6 7.6C19.6 5.2 21.6 3.2 24 3.2C26.4 3.2 28.4 5.2 28.4 7.6V31.2C31 32.8 32.4 35.4 32.4 38.4C32.4 43 28.6 46.8 24 46.8C19.4 46.8 15.6 43 15.6 38.4C15.6 35.4 17 32.8 19.6 31.2Z" fill={g.base} />
          <Path d="M24 3.2C26.4 3.2 28.4 5.2 28.4 7.6V31.2C31 32.8 32.4 35.4 32.4 38.4C32.4 43 28.6 46.8 24 46.8C27.4 44.6 28.6 40.6 27.6 37C27 34.8 25.6 33 24 32Z" fill={g.shade} />
          <Path d={pill(24, 14, 24, 36, 1.8)} fill={O.red.base} />
          <Path d={disc(24, 38.4, 5.4)} fill={O.red.base} />
          <Path d={crescent(24, 38.4, 5.4, -1.4, -1.4)} fill={O.red.shade} />
          <Path d="M19.6 10.4H22M19.6 15.4H22M19.6 20.4H22M19.6 25.4H22" stroke={g.shade} strokeWidth={1.2} {...round} />
        </G>
      </G>
    </Svg>
  );
}

function Mosquito({ size }: IconProps) {
  // Le moustique — le paludisme est la première cause de maladie au CP :
  // corps rayé, longues pattes, ailes, trompe.
  const c = O.ink;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M22 26.4L14 33.6L13 43.4M25.2 27.6L22.4 36.4L25.4 44M28.4 27.4L32.6 35.2L40.8 39.4" stroke={c.base} strokeWidth={1.2} {...round} />
      <Path d="M23.4 21.6C20.4 13.6 22.6 6 28.4 4.4C30.8 9.6 28.6 16.8 23.4 21.6Z" fill={O.sky.light} />
      <Path d="M26.6 22.8C29.4 14.8 35.6 10.4 41.6 11.6C40.6 17.4 34 22 26.6 22.8Z" fill={O.sky.base} />
      <G transform="rotate(32 24 24)">
        <Path d={oval(31.6, 22.8, 9.6, 3.4)} fill={c.base} />
        <Path d="M27 19.6V26M31.6 19.4V26.2M36.2 19.8V25.8" stroke={c.light} strokeWidth={1.4} />
      </G>
      <Path d={disc(21, 22.6, 4.2)} fill={c.base} />
      <Path d={disc(14.8, 18.4, 3.2)} fill={c.base} />
      <Path d="M12.4 16.4L4.4 9.6" stroke={c.base} strokeWidth={1.3} {...round} />
      <Path d="M15.8 15.6L15 10.6M14 15.8L11 11.8" stroke={c.base} strokeWidth={1} {...round} />
      <PictoEye cx={14} cy={18.6} r={1.2} />
    </Svg>
  );
}

function Medicine({ size }: IconProps) {
  // Le médicament : le flacon et sa croix, une gélule.
  const c = O.orange;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={9} y={4} width={20} height={7} rx={2} fill={O.porcelain.shade} />
      <Path d="M7 14.6C7 12.4 8.8 10.6 11 10.6H27C29.2 10.6 31 12.4 31 14.6V40C31 42.2 29.2 44 27 44H11C8.8 44 7 42.2 7 40Z" fill={c.base} />
      <Path d="M25.4 10.6H27C29.2 10.6 31 12.4 31 14.6V40C31 42.2 29.2 44 27 44H25.4Z" fill={c.shade} />
      <Rect x={9.6} y={19} width={18.8} height={16} rx={2} fill={O.porcelain.light} />
      <Path d="M19 22.4V31.6M14.4 27H23.6" stroke={O.red.base} strokeWidth={3.2} {...round} />
      <G transform="rotate(-40 37 34)">
        <Path d={pill(31, 34, 43, 34, 4.2)} fill={O.porcelain.base} />
        <Path d="M37 29.8H43A4.2 4.2 0 0 1 43 38.2H37Z" fill={O.red.base} />
      </G>
    </Svg>
  );
}

function Hospital({ size }: IconProps) {
  // L'hôpital : un bâtiment blanc, la croix rouge, fenêtres et porte.
  const wall = O.porcelain;
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={5} y={12} width={38} height={32} rx={1.6} fill={wall.base} />
      <Path d="M34 12H41.4C42.3 12 43 12.7 43 13.6V42.4C43 43.3 42.3 44 41.4 44H34Z" fill={wall.shade} />
      <Rect x={4} y={9} width={40} height={4.4} rx={1.6} fill={O.sky.shade} />
      <Path d="M24 14.6V26.2M18.2 20.4H29.8" stroke={O.red.base} strokeWidth={4.4} {...round} />
      <Path d="M8.6 30H14.6V36H8.6ZM33.4 30H39.4V36H33.4ZM8.6 17H14.6V23H8.6ZM33.4 17H39.4V23H33.4Z" fill={O.sky.base} />
      <Path d="M19.4 44V32.4C19.4 31.6 20 31 20.8 31H27.2C28 31 28.6 31.6 28.6 32.4V44Z" fill={O.sky.shade} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les sentiments
// ---------------------------------------------------------------------------

function Happy({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform={FEELING}>
        <Person skin="miel" cloth={O.sun} mood="joy" hair="puffs" child shoulders={13} />
      </G>
    </Svg>
  );
}

function Sad({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform={FEELING}>
        <Person skin="acajou" cloth={O.sky} mood="sad" hair="short" child shoulders={13} />
        <Path d={drop(19.2, 25.6, 1.3)} fill={O.sky.shade} />
      </G>
    </Svg>
  );
}

function Angry({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform={FEELING}>
        <Person skin="cannelle" cloth={O.red} mood="angry" hair="short" child shoulders={13} />
      </G>
    </Svg>
  );
}

function Afraid({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <G transform={FEELING}>
        <Person skin="cacao" cloth={O.violet} mood="afraid" hair="puffs" child shoulders={13} />
        <Path d={drop(31.4, 12.6, 1.2)} fill={O.sky.base} />
      </G>
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Registre — ids référencés par le manifeste de contenu.
// ---------------------------------------------------------------------------

export const CURRICULUM_ICONS: Record<string, React.ComponentType<IconProps>> = {
  // l'école
  'icon-school': School,
  'icon-satchel': Satchel,
  'icon-slate': Slate,
  'icon-chalk': Chalk,
  'icon-book': Book,
  'icon-pencil': Pencil,
  'icon-desk': Desk,
  'icon-teacher': Teacher,
  // le corps humain
  'icon-hand': Hand,
  'icon-foot': Foot,
  'icon-head': Head,
  'icon-eye': Eye,
  'icon-mouth': Mouth,
  'icon-nose': Nose,
  'icon-ear': Ear,
  'icon-tooth': Tooth,
  // les habits
  'icon-boubou': Boubou,
  'icon-shirt': Shirt,
  'icon-trousers': Trousers,
  'icon-shoe': Shoe,
  'icon-hat': Hat,
  'icon-scarf': Scarf,
  // la case, la maison
  'icon-door': Door,
  'icon-mat': Mat,
  'icon-pot': Pot,
  'icon-bucket': Bucket,
  'icon-broom': Broom,
  'icon-jar': Jar,
  // le quartier, le village, la ville
  'icon-well': Well,
  'icon-mosque': Mosque,
  'icon-church': Church,
  'icon-road': Road,
  'icon-field': Field,
  'icon-market': MarketStall,
  // la famille
  'icon-mother': Mother,
  'icon-baby': Baby,
  'icon-grandfather': Grandfather,
  // les métiers
  'icon-farmer': Farmer,
  'icon-herder': Herder,
  'icon-blacksmith': Blacksmith,
  'icon-cobbler': Cobbler,
  'icon-tailor': Tailor,
  'icon-hunter': Hunter,
  'icon-fisherman': Fisherman,
  // les animaux
  'icon-cow': Cow,
  'icon-donkey': Donkey,
  'icon-camel': Camel,
  'icon-hen': Hen,
  'icon-dog': Dog,
  'icon-lion': Lion,
  'icon-elephant': Elephant,
  'icon-snake': Snake,
  'icon-fish': Fish,
  'icon-bird': Bird,
  // les plantes
  'icon-tree': Tree,
  'icon-baobab': Baobab,
  'icon-acacia': Acacia,
  'icon-millet': MilletEar,
  'icon-grass': Grass,
  'icon-flower': Flower,
  'icon-leaf': Leaf,
  // les phénomènes naturels
  'icon-rain': Rain,
  'icon-wind': Wind,
  'icon-sun': Sun,
  'icon-cloud': Cloud,
  'icon-moon': Moon,
  'icon-lightning': Lightning,
  // les aliments
  'icon-rice': Rice,
  'icon-bread': Bread,
  'icon-milk': Milk,
  'icon-meat': Meat,
  'icon-banana': Banana,
  'icon-peanut': Peanut,
  'icon-water': Water,
  'icon-egg': Egg,
  // le marché
  'icon-basket': Basket,
  'icon-money': Money,
  'icon-scale': Scale,
  // les moyens de transport et les voyages
  'icon-bicycle': Bicycle,
  'icon-car': Car,
  'icon-bus': Bus,
  'icon-pirogue': Pirogue,
  'icon-cart': Cart,
  'icon-suitcase': Suitcase,
  // les jeux et les fêtes
  'icon-ball': Ball,
  'icon-rope': Rope,
  'icon-drum': Drum,
  'icon-marble': Marble,
  // les maladies
  'icon-thermometer': Thermometer,
  'icon-mosquito': Mosquito,
  'icon-medicine': Medicine,
  'icon-hospital': Hospital,
  // les sentiments
  'icon-happy': Happy,
  'icon-sad': Sad,
  'icon-angry': Angry,
  'icon-afraid': Afraid,
};
