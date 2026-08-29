import type React from 'react';
import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';

import {
  BLUE,
  BROWN,
  CREAM,
  GOLD,
  GREEN,
  GREY,
  INK,
  LEAF,
  OCHRE,
  RED,
  SAND,
  SKIN,
  SKY,
  WHITE,
} from './illustration-palette';

/**
 * Pictograms for the 18 vocabulary themes of the « Langage/Élocution »
 * programme (MEN Tchad 2004, p. 19) and for the maths, reading and writing
 * lessons that need a concrete object.
 *
 * Same hand as object-icons.tsx: flat 48×48, Sahelian palette, readable at
 * 40 px on a low-DPI tablet. Everything is drawn — no bitmap, no network.
 */

type IconProps = { size: number };
const BOX = '0 0 48 48';
const S = {
  stroke: INK,
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// ---------------------------------------------------------------------------
// Thème : l'école
// ---------------------------------------------------------------------------

function School({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M6 22L24 9l18 13z" fill={BROWN} />
      <Rect x={10} y={22} width={28} height={17} rx={2} fill={CREAM} {...S} />
      <Rect x={20} y={28} width={8} height={11} rx={1.5} fill={BLUE} />
      <Rect x={13} y={26} width={5} height={5} rx={1} fill={SKY} />
      <Rect x={30} y={26} width={5} height={5} rx={1} fill={SKY} />
      <Path d="M24 9V4" {...S} />
      <Path d="M24 5l6 2-6 2z" fill={RED} />
    </Svg>
  );
}

function Satchel({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M17 15c0-4 3-6 7-6s7 2 7 6" fill="none" {...S} />
      <Rect x={9} y={15} width={30} height={23} rx={4} fill={BROWN} {...S} />
      <Path d="M9 24h30" {...S} stroke={CREAM} strokeWidth={2} />
      <Rect
        x={20}
        y={22}
        width={8}
        height={6}
        rx={1.5}
        fill={GOLD}
        stroke={INK}
        strokeWidth={1.2}
      />
    </Svg>
  );
}

function Slate({ size }: IconProps) {
  // L'ardoise — the CP writing support named by the programme (p. 26).
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={8} y={10} width={32} height={28} rx={3} fill={BROWN} {...S} />
      <Rect x={11} y={13} width={26} height={22} rx={2} fill="#2f3542" />
      <Path d="M15 21h12M15 27h16" stroke={CREAM} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function Chalk({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect
        x={14}
        y={12}
        width={9}
        height={26}
        rx={3}
        fill={WHITE}
        {...S}
        transform="rotate(18 24 24)"
      />
      <Path d="M28 34l3 6" stroke={GREY} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function Book({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M7 12c5-2 10-2 16 1v25c-6-3-11-3-16-1z" fill={CREAM} {...S} />
      <Path d="M41 12c-5-2-10-2-16 1v25c6-3 11-3 16-1z" fill={WHITE} {...S} />
      <Path d="M24 13v25" {...S} stroke={BROWN} strokeWidth={1.8} />
      <Path
        d="M11 19h8M11 24h8M29 19h8M29 24h8"
        stroke={GREY}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Pencil({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M11 37l3-8 19-19 5 5-19 19z" fill={GOLD} {...S} />
      <Path d="M33 10l5 5" {...S} />
      <Path d="M11 37l3-8 3 3z" fill={INK} />
      <Path d="M29 14l5 5" stroke={OCHRE} strokeWidth={1.4} />
    </Svg>
  );
}

function Desk({ size }: IconProps) {
  // Le table-banc, the two-seat school bench used across Chadian classrooms.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M7 20h34v4H7z" fill={SAND} {...S} />
      <Path d="M11 24v14M37 24v14" {...S} strokeWidth={2.2} />
      <Path d="M9 30h30" {...S} strokeWidth={2} stroke={BROWN} />
      <Path d="M14 24v6M34 24v6" stroke={BROWN} strokeWidth={1.6} />
    </Svg>
  );
}

function Teacher({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Circle cx={19} cy={13} r={6} fill={SKIN} {...S} />
      <Path d="M10 40c0-7 4-11 9-11s9 4 9 11z" fill={BLUE} {...S} />
      <Rect
        x={30}
        y={12}
        width={13}
        height={17}
        rx={2}
        fill="#2f3542"
        stroke={INK}
        strokeWidth={1.2}
      />
      <Path d="M33 18h7M33 23h5" stroke={CREAM} strokeWidth={1.3} strokeLinecap="round" />
      <Path d="M27 27l4-4" {...S} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : le corps humain
// ---------------------------------------------------------------------------

function Hand({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path
        d="M16 40V24c0-2 3-2 3 0v-9c0-2 3-2 3 0v8c0-2 3-2 3 0v-7c0-2 3-2 3 0v9c0-1 3-2 3 1v9c0 5-4 9-9 9s-9-4-9-9z"
        fill={SKIN}
        {...S}
      />
    </Svg>
  );
}

function Foot({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M17 40c-4-3-3-9-1-14 2-4 2-9 6-9 5 0 8 4 8 10 0 7 2 10-1 13z" fill={SKIN} {...S} />
      <Circle cx={31} cy={13} r={2.4} fill={SKIN} {...S} />
      <Circle cx={35} cy={17} r={1.9} fill={SKIN} {...S} />
      <Circle cx={36} cy={22} r={1.6} fill={SKIN} {...S} />
    </Svg>
  );
}

function Head({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Circle cx={24} cy={22} r={13} fill={SKIN} {...S} />
      <Path d="M11 19c1-8 6-11 13-11s12 3 13 11c-4-3-9-4-13-4s-9 1-13 4z" fill={INK} />
      <Circle cx={19} cy={22} r={1.6} fill={INK} />
      <Circle cx={29} cy={22} r={1.6} fill={INK} />
      <Path d="M20 28c2 2 6 2 8 0" fill="none" {...S} />
    </Svg>
  );
}

function Eye({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M6 24c5-8 12-12 18-12s13 4 18 12c-5 8-12 12-18 12S11 32 6 24z" fill={WHITE} {...S} />
      <Circle cx={24} cy={24} r={6.5} fill={BROWN} {...S} />
      <Circle cx={24} cy={24} r={2.6} fill={INK} />
      <Circle cx={26} cy={21.5} r={1.2} fill={WHITE} />
    </Svg>
  );
}

function Mouth({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M6 23c5-7 11-9 18-5 7-4 13-2 18 5-5 9-11 14-18 14S11 32 6 23z" fill={RED} {...S} />
      <Path d="M6 23c6 2 12 3 18 3s12-1 18-3" fill="none" stroke={INK} strokeWidth={1.3} />
      <Path d="M12 22.5c4 1 7.5 1.6 12 1.6s8-.6 12-1.6" stroke={WHITE} strokeWidth={3.2} strokeLinecap="round" fill="none" />
      <Path d="M20 18c1.6-2 2.4-2 4 0" fill="none" stroke={INK} strokeWidth={1.1} />
    </Svg>
  );
}

function Nose({ size }: IconProps) {
  // Vu de face, avec des ailes et des narines franches : sans elles, un nez
  // se lit comme une goutte.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path
        d="M24 5c-1.5 10-3 15-6.5 20.5-2.5 4-1.5 8.5 2.5 10h8c4-1.5 5-6 2.5-10C27 20 25.5 15 24 5z"
        fill={SKIN}
        {...S}
      />
      <Path d="M14 30c1.5-4 5-4.5 6.5-1.5M34 30c-1.5-4-5-4.5-6.5-1.5" fill={SKIN} {...S} />
      <Ellipse cx={17.5} cy={31.5} rx={3.2} ry={2.4} fill={INK} />
      <Ellipse cx={30.5} cy={31.5} rx={3.2} ry={2.4} fill={INK} />
      <Path d="M21 11c-1.5 7-3 11-5 14.5" fill="none" stroke={CREAM} strokeWidth={1.8} opacity={0.55} />
      <Path d="M20 38c2.5 1.8 5.5 1.8 8 0" fill="none" {...S} />
    </Svg>
  );
}

function Ear({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path
        d="M32 12a11 11 0 0 0-19 7c0 6 2 9 2 14 0 5 3 8 7 8 4 0 5-3 5-6 0-3 2-4 4-7 3-3 4-6 4-9 0-3-1-5-3-7z"
        fill={SKIN}
        {...S}
      />
      <Path d="M19 20a6 6 0 0 1 10 3c0 3-2 5-4 7-1 1-2 2-2 4" fill="none" {...S} />
      <Path d="M17 33c0 4 2 6 4 6" fill="none" {...S} />
    </Svg>
  );
}

function Tooth({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path
        d="M14 14c0-4 4-6 10-6s10 2 10 6c0 8-2 12-3 19-1 4-4 4-5 0l-2-8-2 8c-1 4-4 4-5 0-1-7-3-11-3-19z"
        fill={WHITE}
        {...S}
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les habits
// ---------------------------------------------------------------------------

function Boubou({ size }: IconProps) {
  // Le boubou — the everyday garment across Chad.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M18 9h12l10 7-4 6-4-3v22H16V19l-4 3-4-6z" fill={SKY} {...S} />
      <Path d="M18 9c1 4 11 4 12 0" fill="none" {...S} />
      <Path d="M16 27h16M16 33h16" stroke={BLUE} strokeWidth={1.3} />
    </Svg>
  );
}

function Shirt({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M18 10h12l9 6-5 7-3-2v18H17V21l-3 2-5-7z" fill={CREAM} {...S} />
      <Path d="M18 10l6 6 6-6" fill="none" {...S} />
      <Circle cx={24} cy={24} r={1.1} fill={INK} />
      <Circle cx={24} cy={30} r={1.1} fill={INK} />
    </Svg>
  );
}

function Trousers({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M15 8h18l-1 32h-7l-2-18-2 18h-7z" fill={BLUE} {...S} />
      <Path d="M15 14h18" stroke={CREAM} strokeWidth={1.4} />
    </Svg>
  );
}

function Shoe({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path
        d="M9 30c0-6 2-11 6-11 4 0 4 4 8 5 5 1 13 1 15 6 1 3-1 5-4 5H12c-2 0-3-2-3-5z"
        fill={BROWN}
        {...S}
      />
      <Path d="M9 32h30" stroke={INK} strokeWidth={2} />
      <Path d="M18 24l4 3M22 21l4 3" stroke={CREAM} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

function Hat({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M14 26c0-8 4-13 10-13s10 5 10 13z" fill={SAND} {...S} />
      <Ellipse cx={24} cy={28} rx={18} ry={5} fill={OCHRE} {...S} />
      <Path d="M14 24h20" stroke={BROWN} strokeWidth={2.4} />
    </Svg>
  );
}

function Scarf({ size }: IconProps) {
  // Le foulard, porté — plus lisible qu'un carré de tissu posé à plat.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Circle cx={24} cy={24} r={10} fill={SKIN} {...S} />
      <Path
        d="M11 24a13 13 0 0 1 26 0c0 3-2 4-4 2-1-6-5-9-9-9s-8 3-9 9c-2 2-4 1-4-2z"
        fill={RED}
        {...S}
      />
      <Path d="M13 27c-2 8 1 14 5 15 2 1 3-2 2-4-2-4-3-7-3-11z" fill={RED} {...S} />
      <Path d="M15 22c5-4 13-4 18 0" fill="none" stroke={GOLD} strokeWidth={1.4} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : la case, la maison
// ---------------------------------------------------------------------------

function Door({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={12} y={7} width={24} height={34} rx={3} fill={BROWN} {...S} />
      <Rect x={16} y={11} width={16} height={26} rx={2} fill={SAND} />
      <Circle cx={29} cy={25} r={1.8} fill={INK} />
    </Svg>
  );
}

function Mat({ size }: IconProps) {
  // La natte tressée, à plat, avec ses franges — le sol de la plupart des cases.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={7} y={14} width={34} height={20} rx={3} fill={OCHRE} {...S} />
      <Path d="M7 20h34M7 27h34" stroke={BROWN} strokeWidth={1.2} />
      <Path d="M15 14v20M24 14v20M33 14v20" stroke={BROWN} strokeWidth={1.2} opacity={0.55} />
      <Path d="M11 14v-3M18 14v-3M25 14v-3M32 14v-3M38 14v-3" {...S} stroke={BROWN} />
      <Path d="M11 34v3M18 34v3M25 34v3M32 34v3M38 34v3" {...S} stroke={BROWN} />
    </Svg>
  );
}

function Pot({ size }: IconProps) {
  // La marmite.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M11 21h26v11a7 7 0 0 1-7 7H18a7 7 0 0 1-7-7z" fill={GREY} {...S} />
      <Ellipse cx={24} cy={21} rx={13} ry={3.5} fill="#d7d9e4" {...S} />
      <Path d="M11 25H7a3 3 0 0 0 0 6h4M37 25h4a3 3 0 0 1 0 6h-4" fill="none" {...S} />
      <Path
        d="M18 13c0 3 2 3 2 6M26 12c0 3 2 3 2 6"
        fill="none"
        stroke={GREY}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Bucket({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M12 18h24l-3 21H15z" fill={SKY} {...S} />
      <Ellipse cx={24} cy={18} rx={12} ry={3.5} fill="#c7e7ff" {...S} />
      <Path d="M13 17a11 9 0 0 1 22 0" fill="none" {...S} />
      <Path d="M17 26h14" stroke={BLUE} strokeWidth={1.4} />
    </Svg>
  );
}

function Broom({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M26 6l-8 20" {...S} strokeWidth={2.6} stroke={BROWN} />
      <Path d="M14 24l10 4-4 12c-6-1-10-5-11-9z" fill={OCHRE} {...S} />
      <Path d="M15 30l7 3M14 34l7 3" stroke={BROWN} strokeWidth={1.1} />
    </Svg>
  );
}

function Jar({ size }: IconProps) {
  // Le canari — the clay water jar that keeps water cool.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path
        d="M18 12h12l-1 5c5 2 8 7 8 13 0 7-6 11-13 11s-13-4-13-11c0-6 3-11 8-13z"
        fill={OCHRE}
        {...S}
      />
      <Ellipse cx={24} cy={12} rx={6} ry={2.4} fill={SAND} {...S} />
      <Path d="M15 29c5 3 13 3 18 0" fill="none" stroke={BROWN} strokeWidth={1.3} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : le quartier, le village, la ville
// ---------------------------------------------------------------------------

function Well({ size }: IconProps) {
  // Le puits — the centre of village life, and of many CP word problems.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M10 12l14-6 14 6" fill="none" {...S} strokeWidth={2} />
      <Path d="M11 22h26v16H11z" fill={GREY} {...S} />
      <Ellipse cx={24} cy={22} rx={13} ry={4} fill="#c8cad6" {...S} />
      <Path d="M24 6v12" {...S} />
      <Rect x={20} y={16} width={8} height={6} rx={1.5} fill={BROWN} {...S} />
      <Path d="M14 27h20M14 32h20" stroke={INK} strokeWidth={1} opacity={0.35} />
    </Svg>
  );
}

function Mosque({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={10} y={22} width={28} height={17} rx={2} fill={CREAM} {...S} />
      <Path d="M24 8c5 4 8 8 8 12H16c0-4 3-8 8-12z" fill={SKY} {...S} />
      <Path d="M20 39V30a4 4 0 0 1 8 0v9z" fill={BLUE} />
      <Rect x={7} y={16} width={5} height={23} rx={1.5} fill={CREAM} {...S} />
      <Path d="M9.5 10l3 6h-6z" fill={SKY} />
      <Circle cx={24} cy={6} r={1.6} fill={GOLD} />
    </Svg>
  );
}

function Church({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={11} y={24} width={26} height={15} rx={2} fill={CREAM} {...S} />
      <Path d="M11 24L24 12l13 12z" fill={RED} {...S} />
      <Path d="M24 12V6M21 9h6" {...S} strokeWidth={2} />
      <Rect x={21} y={30} width={6} height={9} rx={2} fill={BROWN} />
    </Svg>
  );
}

function Road({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M4 42l14-34h12l14 34z" fill={GREY} {...S} />
      <Path d="M24 11v6M24 22v6M24 33v7" stroke={WHITE} strokeWidth={3} strokeLinecap="round" />
      <Path d="M2 42c4-4 6-10 8-16M46 42c-4-4-6-10-8-16" fill="none" stroke={SAND} strokeWidth={2.4} />
    </Svg>
  );
}

function Field({ size }: IconProps) {
  // Le champ de mil.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M5 33c8-4 30-4 38 0v7H5z" fill={OCHRE} {...S} />
      <Path d="M13 33V20M24 33V16M35 33V21" stroke={GREEN} strokeWidth={2} strokeLinecap="round" />
      <Ellipse cx={13} cy={18} rx={3} ry={5} fill={GOLD} {...S} />
      <Ellipse cx={24} cy={14} rx={3.2} ry={5.5} fill={GOLD} {...S} />
      <Ellipse cx={35} cy={19} rx={3} ry={5} fill={GOLD} {...S} />
    </Svg>
  );
}

function MarketStall({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M7 18h34l-3-7H10z" fill={RED} {...S} />
      <Path d="M13 11l-1 7M20 11l-.5 7M27.5 11l.5 7M35 11l1 7" stroke={CREAM} strokeWidth={1.4} />
      <Path d="M10 18v21M38 18v21" {...S} strokeWidth={2} />
      <Rect x={12} y={26} width={24} height={5} rx={1.5} fill={SAND} {...S} />
      <Circle cx={17} cy={23} r={2.6} fill={GOLD} />
      <Circle cx={24} cy={23} r={2.6} fill={RED} />
      <Circle cx={31} cy={23} r={2.6} fill={LEAF} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : la famille
// ---------------------------------------------------------------------------

function Mother({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M13 15c0-6 5-9 11-9s11 3 11 9c0 2-1 3-2 3H15c-1 0-2-1-2-3z" fill={RED} {...S} />
      <Circle cx={24} cy={20} r={7} fill={SKIN} {...S} />
      <Path d="M10 42c0-9 6-14 14-14s14 5 14 14z" fill={GOLD} {...S} />
      <Circle cx={21} cy={19} r={1.3} fill={INK} />
      <Circle cx={27} cy={19} r={1.3} fill={INK} />
      <Path d="M21 24c2 1.6 4 1.6 6 0" fill="none" {...S} />
    </Svg>
  );
}

function Baby({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Circle cx={24} cy={18} r={10} fill={SKIN} {...S} />
      <Path d="M14 42c0-6 4-10 10-10s10 4 10 10z" fill={SKY} {...S} />
      <Circle cx={20.5} cy={17} r={1.4} fill={INK} />
      <Circle cx={27.5} cy={17} r={1.4} fill={INK} />
      <Path d="M21 22c2 2 4 2 6 0" fill="none" {...S} />
      <Path d="M24 8c2-2 5-1 5 1" fill="none" {...S} />
    </Svg>
  );
}

function Grandfather({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Circle cx={24} cy={16} r={8} fill={SKIN} {...S} />
      <Path d="M16 12c0-5 4-7 8-7s8 2 8 7z" fill={CREAM} {...S} />
      <Path d="M17 21c1 6 3 9 7 9s6-3 7-9c-4 3-10 3-14 0z" fill={WHITE} {...S} />
      <Circle cx={21} cy={16} r={1.3} fill={INK} />
      <Circle cx={27} cy={16} r={1.3} fill={INK} />
      <Path d="M12 43c0-7 5-11 12-11s12 4 12 11z" fill={BROWN} {...S} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les métiers (liste officielle p. 19)
// Chaque métier est dit par son outil — plus lisible à 40 px qu'un visage.
// ---------------------------------------------------------------------------

function Farmer({ size }: IconProps) {
  // Le cultivateur et sa daba (houe).
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M32 8L14 38" {...S} strokeWidth={3} stroke={BROWN} />
      <Path d="M10 34c-3 3-3 7 0 9 4-1 7-4 8-8z" fill={GREY} {...S} />
      <Path
        d="M5 24c6-3 12-3 17 0"
        fill="none"
        stroke={LEAF}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={34} cy={9} r={4} fill={GOLD} {...S} />
    </Svg>
  );
}

function Herder({ size }: IconProps) {
  // L'éleveur : bâton et troupeau.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M12 6v30" {...S} strokeWidth={2.6} stroke={BROWN} />
      <Path d="M12 8c5-4 9 0 6 3" fill="none" {...S} strokeWidth={2.4} stroke={BROWN} />
      <Ellipse cx={30} cy={30} rx={9} ry={6.5} fill={CREAM} {...S} />
      <Circle cx={39} cy={25} r={4.5} fill={CREAM} {...S} />
      <Circle cx={40.5} cy={24} r={1} fill={INK} />
      <Path d="M24 36v4M29 37v3M34 37v3M38 36v4" {...S} />
    </Svg>
  );
}

function Blacksmith({ size }: IconProps) {
  // Le forgeron : enclume et marteau.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M9 26h22c-2 4-6 5-6 5v3H16v-3s-5-1-7-5z" fill={GREY} {...S} />
      <Path d="M17 34h9v6h-9z" fill="#8f8fa3" {...S} />
      <Path d="M30 6l10 5-3 5-10-5z" fill={GREY} {...S} />
      <Path d="M31 14l-6 10" {...S} strokeWidth={2.4} stroke={BROWN} />
      <Path d="M12 20l3-4M20 18l1-4" stroke={GOLD} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function Cobbler({ size }: IconProps) {
  // Le cordonnier : chaussure et alêne.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path
        d="M7 33c0-5 2-9 5-9 3 0 3 3 6 4 4 1 11 1 13 5 1 2-1 4-3 4H10c-2 0-3-1-3-4z"
        fill={BROWN}
        {...S}
      />
      <Path d="M7 35h24" stroke={INK} strokeWidth={1.8} />
      <Path d="M38 8l-9 14" {...S} strokeWidth={2.2} stroke={GREY} />
      <Circle cx={39} cy={7} r={3} fill={SAND} {...S} />
      <Path d="M14 28l4 2M18 26l4 2" stroke={CREAM} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

function Tailor({ size }: IconProps) {
  // Le tailleur : machine à coudre.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M8 34h32v5H8z" fill={BROWN} {...S} />
      <Path d="M11 34V18h5v8h13c4 0 6 3 6 8z" fill={BLUE} {...S} />
      <Path d="M11 18h9" {...S} strokeWidth={2} />
      <Path d="M33 26v6" stroke={GREY} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={13.5} cy={26} r={3.5} fill={GOLD} {...S} />
      <Path d="M24 30h12" stroke={CREAM} strokeWidth={1.4} />
    </Svg>
  );
}

function Hunter({ size }: IconProps) {
  // Le chasseur : arc et flèche.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M16 7a22 22 0 0 1 0 34" fill="none" {...S} strokeWidth={2.6} stroke={BROWN} />
      <Path d="M16 7L16 41" fill="none" stroke={GREY} strokeWidth={1.4} />
      <Path d="M16 24h22" {...S} strokeWidth={2} />
      <Path d="M38 24l-6-4v8z" fill={GREY} {...S} />
      <Path d="M18 21l-3 3 3 3" fill="none" {...S} />
    </Svg>
  );
}

function Fisherman({ size }: IconProps) {
  // Le pêcheur : filet et poisson.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M8 12h32l-6 24H14z" fill="none" {...S} strokeWidth={1.6} stroke={BLUE} />
      <Path d="M14 12l4 24M24 12v24M34 12l-4 24M11 20h26M13 28h22" stroke={SKY} strokeWidth={1.2} />
      <Path d="M18 24c3-3 8-3 10 0-2 3-7 3-10 0z" fill={GOLD} {...S} />
      <Path d="M28 24l4-3v6z" fill={GOLD} {...S} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les animaux sauvages et domestiques
// ---------------------------------------------------------------------------

function Cow({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Ellipse cx={19} cy={27} rx={13} ry={9} fill={CREAM} {...S} />
      <Path d="M12 23c4 2 7 1 8-2-4-1-7 0-8 2zM16 32c4 2 8 1 9-2-4-1-8 0-9 2z" fill={BROWN} opacity={0.4} />
      <Path d="M40 14c3-2 6-3 7-6M28 14c-3-2-6-3-7-6" fill="none" stroke={CREAM} strokeWidth={4.5} strokeLinecap="round" />
      <Path d="M40 14c3-2 6-3 7-6M28 14c-3-2-6-3-7-6" fill="none" stroke={INK} strokeWidth={1.4} strokeLinecap="round" />
      <Circle cx={34} cy={20} r={8} fill={CREAM} {...S} />
      <Ellipse cx={36} cy={24} rx={5} ry={3.6} fill="#e5b3a6" {...S} />
      <Circle cx={34.5} cy={24} r={1} fill={INK} />
      <Circle cx={38} cy={24} r={1} fill={INK} />
      <Circle cx={32} cy={17} r={1.3} fill={INK} />
      <Path d="M10 36v5M17 37v4M25 37v4M30 36v5" {...S} strokeWidth={1.9} />
      <Path d="M7 23c-3-1-4 1-3 3" fill="none" {...S} />
    </Svg>
  );
}

function Donkey({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Ellipse cx={22} cy={26} rx={13} ry={8} fill={GREY} {...S} />
      <Circle cx={36} cy={19} r={6} fill={GREY} {...S} />
      <Path d="M34 12c-1-5 0-7 1-7s2 3 1 7M39 12c1-5 2-7 3-6s1 4-1 7" fill={GREY} {...S} />
      <Circle cx={38} cy={18} r={1.2} fill={INK} />
      <Path d="M11 34v6M18 35v5M27 35v5M32 34v6" {...S} strokeWidth={1.8} />
      <Path d="M9 22c-3 0-4 3-2 5" fill="none" {...S} />
    </Svg>
  );
}

function Camel({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M9 30c0-4 2-6 5-8 2-4 5-4 7 0 2-4 5-4 7 0 3 2 5 4 5 8z" fill={SAND} {...S} />
      <Path d="M33 30c1-6 3-8 5-12 1-3 4-2 4 1 0 4-2 5-3 8" fill={SAND} {...S} />
      <Circle cx={41} cy={17} r={1.1} fill={INK} />
      <Path d="M11 30v9M17 31v8M26 31v8M32 30v9" {...S} strokeWidth={1.8} />
      <Path d="M42 16c2-1 3 0 3 1" fill="none" {...S} />
    </Svg>
  );
}

function Hen({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Ellipse cx={22} cy={28} rx={12} ry={9} fill={CREAM} {...S} />
      <Circle cx={33} cy={19} r={5.5} fill={CREAM} {...S} />
      <Path d="M31 13c0-3 2-3 2-1 1-2 3-2 2 1z" fill={RED} {...S} />
      <Circle cx={35} cy={18} r={1.1} fill={INK} />
      <Path d="M38 20l4 2-4 2z" fill={GOLD} {...S} />
      <Path d="M14 25c4 3 9 3 13 0" fill="none" stroke={OCHRE} strokeWidth={1.4} />
      <Path d="M19 37v4M26 37v4" {...S} strokeWidth={1.8} stroke={GOLD} />
    </Svg>
  );
}

function Dog({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Ellipse cx={19} cy={28} rx={12} ry={8} fill={OCHRE} {...S} />
      <Path d="M8 24c-3-4-5-8-3-10 2 0 4 4 5 8" fill={OCHRE} {...S} />
      <Circle cx={33} cy={20} r={8} fill={OCHRE} {...S} />
      <Path d="M27 13c-3 0-5 4-4 8 2-1 4-3 5-6zM39 13c3 0 5 4 4 8-2-1-4-3-5-6z" fill={BROWN} {...S} />
      <Ellipse cx={38} cy={24} rx={5} ry={3.6} fill={CREAM} {...S} />
      <Ellipse cx={41} cy={23} rx={2} ry={1.6} fill={INK} />
      <Circle cx={31} cy={18} r={1.3} fill={INK} />
      <Path d="M36 27c1.6 1.2 3.4 1.2 5 0" fill="none" {...S} />
      <Path d="M11 36v5M17 37v4M24 37v4M29 36v5" {...S} strokeWidth={1.9} />
    </Svg>
  );
}

function Lion({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Polygon
        points="24,3 30,10 39,8 39,17 45,24 39,31 39,40 30,38 24,45 18,38 9,40 9,31 3,24 9,17 9,8 18,10"
        fill={OCHRE}
        {...S}
      />
      <Circle cx={24} cy={24} r={11} fill={GOLD} {...S} />
      <Circle cx={20} cy={21} r={1.6} fill={INK} />
      <Circle cx={28} cy={21} r={1.6} fill={INK} />
      <Path d="M24 26l-2.5 2.5h5z" fill={INK} />
      <Path d="M24 28.5v2M20 33c2 1.6 6 1.6 8 0" fill="none" {...S} />
      <Path d="M13 24h-3M13 27h-3M35 24h3M35 27h3" stroke={BROWN} strokeWidth={1.2} strokeLinecap="round" />
    </Svg>
  );
}

function Elephant({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Ellipse cx={22} cy={26} rx={14} ry={11} fill={GREY} {...S} />
      <Path d="M34 22c4 0 6 4 5 9-1 4-1 7 1 8" fill="none" {...S} strokeWidth={2.6} stroke={GREY} />
      <Path d="M12 20c-5-2-8 0-8 4s4 6 8 4z" fill="#a8a6b8" {...S} />
      <Circle cx={30} cy={22} r={1.4} fill={INK} />
      <Path d="M13 37v4M20 37v4M28 36v5" {...S} strokeWidth={2} />
    </Svg>
  );
}

function Snake({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M8 36c8 0 8-8 16-8s8-8 16-8" fill="none" {...S} strokeWidth={5} stroke={LEAF} />
      <Circle cx={40} cy={19} r={4} fill={GREEN} {...S} />
      <Circle cx={41.5} cy={18} r={1} fill={INK} />
      <Path d="M44 20l3 1-3 1" stroke={RED} strokeWidth={1.2} fill="none" />
    </Svg>
  );
}

function Fish({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M8 24c6-8 18-8 24 0-6 8-18 8-24 0z" fill={SKY} {...S} />
      <Path d="M32 24l8-6v12z" fill={BLUE} {...S} />
      <Circle cx={15} cy={22} r={1.5} fill={INK} />
      <Path d="M20 18c2 4 2 8 0 12" fill="none" stroke={BLUE} strokeWidth={1.3} />
    </Svg>
  );
}

function Bird({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Ellipse cx={22} cy={26} rx={11} ry={8} fill={SKY} {...S} />
      <Circle cx={32} cy={19} r={5} fill={SKY} {...S} />
      <Circle cx={33.5} cy={18} r={1.1} fill={INK} />
      <Path d="M37 20l4 2-4 2z" fill={GOLD} {...S} />
      <Path d="M14 24c4-4 10-3 12 2-4 3-9 2-12-2z" fill={BLUE} {...S} />
      <Path d="M11 27l-6 3 6 3z" fill={BLUE} {...S} />
      <Path d="M22 34v5M27 34v5" {...S} stroke={GOLD} strokeWidth={1.6} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les plantes
// ---------------------------------------------------------------------------

function Tree({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M22 42V24h4v18z" fill={BROWN} {...S} />
      <Circle cx={24} cy={18} r={13} fill={LEAF} {...S} />
      <Circle cx={16} cy={22} r={7} fill={GREEN} opacity={0.65} />
      <Circle cx={31} cy={21} r={6} fill={GREEN} opacity={0.55} />
    </Svg>
  );
}

function Baobab({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M17 42c0-10-2-16 7-16s7 6 7 16z" fill={BROWN} {...S} />
      <Path d="M24 26V14" {...S} strokeWidth={2.4} stroke={BROWN} />
      <Path
        d="M24 16c-6-2-9-6-11-9M24 16c6-2 9-6 11-9M24 14V6"
        fill="none"
        {...S}
        strokeWidth={2}
        stroke={BROWN}
      />
      <Circle cx={12} cy={7} r={3.5} fill={LEAF} />
      <Circle cx={36} cy={7} r={3.5} fill={LEAF} />
      <Circle cx={24} cy={5} r={3.5} fill={LEAF} />
    </Svg>
  );
}

function Acacia({ size }: IconProps) {
  // L'acacia du Sahel : couronne plate en parasol, tronc qui se divise haut.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M22 42V24h4v18z" fill={BROWN} {...S} />
      <Path d="M24 25l-9-6M24 25l9-6M24 25v-7" fill="none" {...S} strokeWidth={2} stroke={BROWN} />
      <Path d="M5 17c5-6 33-6 38 0-3 4-10 6-19 6S8 21 5 17z" fill={LEAF} {...S} />
      <Path d="M11 15c9-3 17-3 26 0" fill="none" stroke={GREEN} strokeWidth={1.3} />
      <Circle cx={13} cy={19} r={2} fill={GREEN} opacity={0.5} />
      <Circle cx={24} cy={21} r={2.2} fill={GREEN} opacity={0.5} />
      <Circle cx={35} cy={19} r={2} fill={GREEN} opacity={0.5} />
    </Svg>
  );
}

function MilletEar({ size }: IconProps) {
  // L'épi de mil — the staple crop of the Sahel.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M24 42V22" {...S} strokeWidth={2.4} stroke={GREEN} />
      <Ellipse cx={24} cy={14} rx={6} ry={11} fill={GOLD} {...S} />
      <Path d="M20 8v12M24 6v18M28 8v12" stroke={OCHRE} strokeWidth={1.2} />
      <Path
        d="M24 28c-5 0-8-3-9-6 5 0 8 2 9 6zM24 34c5 0 8-3 9-6-5 0-8 2-9 6z"
        fill={LEAF}
        {...S}
      />
    </Svg>
  );
}

function Grass({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path
        d="M6 40c2-10 5-14 8-18M16 40c1-12 4-17 7-22M26 40c0-11 3-16 6-21M36 40c1-9 3-13 5-16"
        fill="none"
        {...S}
        strokeWidth={2.4}
        stroke={LEAF}
      />
      <Path d="M4 40h40" {...S} strokeWidth={2} stroke={BROWN} />
    </Svg>
  );
}

function Flower({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M23 42V24h2v18z" fill={GREEN} {...S} />
      <Path d="M24 32c-5 0-8-3-8-6 5-1 8 2 8 6z" fill={LEAF} {...S} />
      <Circle cx={24} cy={11} r={5} fill={RED} {...S} />
      <Circle cx={16} cy={17} r={5} fill={RED} {...S} />
      <Circle cx={32} cy={17} r={5} fill={RED} {...S} />
      <Circle cx={19} cy={25} r={5} fill={RED} {...S} />
      <Circle cx={29} cy={25} r={5} fill={RED} {...S} />
      <Circle cx={24} cy={19} r={4.5} fill={GOLD} {...S} />
    </Svg>
  );
}

function Leaf({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M38 8C20 8 8 20 8 36c0 2 2 4 4 4 16 0 28-12 28-30 0-1-1-2-2-2z" fill={LEAF} {...S} />
      <Path d="M10 38C18 30 28 20 38 10" fill="none" stroke={GREEN} strokeWidth={1.6} />
      <Path d="M18 30l-4-6M26 22l-4-6M32 16l-3-5" stroke={GREEN} strokeWidth={1.2} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les phénomènes naturels (la pluie, le vent, etc.)
// ---------------------------------------------------------------------------

function Rain({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M14 24a8 8 0 0 1 1-16 10 10 0 0 1 19 2 7 7 0 0 1-1 14z" fill={GREY} {...S} />
      <Path d="M15 30l-2 7M23 30l-2 8M31 30l-2 7" {...S} strokeWidth={2.4} stroke={BLUE} />
    </Svg>
  );
}

function Wind({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M6 17h20a5 5 0 1 0-5-5" fill="none" {...S} strokeWidth={2.4} stroke={BLUE} />
      <Path d="M6 26h26a5 5 0 1 1-5 5" fill="none" {...S} strokeWidth={2.4} stroke={SKY} />
      <Path d="M8 35h13a4 4 0 1 0-4-4" fill="none" {...S} strokeWidth={2.2} stroke={BLUE} />
    </Svg>
  );
}

function Sun({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Circle cx={24} cy={24} r={10} fill={GOLD} {...S} />
      <Path
        d="M24 4v6M24 38v6M4 24h6M38 24h6M10 10l4 4M34 34l4 4M38 10l-4 4M14 34l-4 4"
        {...S}
        strokeWidth={2.4}
        stroke={OCHRE}
      />
    </Svg>
  );
}

function Cloud({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M14 34a9 9 0 0 1 1-18 11 11 0 0 1 21 2 8 8 0 0 1-1 16z" fill={WHITE} {...S} />
    </Svg>
  );
}

function Moon({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M30 6a18 18 0 1 0 12 25A15 15 0 0 1 30 6z" fill={GOLD} {...S} />
      <Circle cx={38} cy={12} r={1.4} fill={GOLD} />
      <Circle cx={43} cy={19} r={1} fill={GOLD} />
    </Svg>
  );
}

function Lightning({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M14 26a8 8 0 0 1 1-16 10 10 0 0 1 19 2 7 7 0 0 1-1 14z" fill={GREY} {...S} />
      <Path d="M25 28l-8 10h7l-3 8 10-11h-7z" fill={GOLD} {...S} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les aliments
// ---------------------------------------------------------------------------

function Rice({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M9 26h30c0 8-7 13-15 13S9 34 9 26z" fill={WHITE} {...S} />
      <Ellipse cx={24} cy={26} rx={15} ry={4} fill={CREAM} {...S} />
      <Path
        d="M18 22c1-3 3-4 4-2M24 20c1-3 3-4 4-2M29 23c1-3 3-3 4-1"
        fill="none"
        stroke={GREY}
        strokeWidth={1.2}
      />
      <Path d="M6 39h36" {...S} strokeWidth={2} stroke={BROWN} />
    </Svg>
  );
}

function Bread({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M8 30c0-8 7-14 16-14s16 6 16 14c0 3-2 5-5 5H13c-3 0-5-2-5-5z" fill={OCHRE} {...S} />
      <Path
        d="M15 22c2-3 5-4 7-2M25 20c2-3 5-3 7-1"
        fill="none"
        stroke={BROWN}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <Path d="M8 30h32" stroke={BROWN} strokeWidth={1.4} />
    </Svg>
  );
}

function Milk({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M16 16h16v22a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" fill={WHITE} {...S} />
      <Path d="M16 24h16v14a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" fill="#eef2f7" />
      <Path d="M18 6h12l2 10H16z" fill={SKY} {...S} />
      <Path d="M20 30h8" stroke={SKY} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

function Meat({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M12 30c-4-8 2-18 12-18 9 0 15 7 13 15-2 7-9 10-16 8z" fill={RED} {...S} />
      <Path
        d="M18 26c-1-5 3-9 7-9"
        fill="none"
        stroke={CREAM}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
      <Path d="M12 32l-6 8" {...S} strokeWidth={3} stroke={CREAM} />
    </Svg>
  );
}

function Banana({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path
        d="M10 14c0 14 10 24 24 24 4 0 6-2 5-5-11-1-20-9-22-20-1-3-7-2-7 1z"
        fill={GOLD}
        {...S}
      />
      <Path d="M14 16c2 10 10 17 20 19" fill="none" stroke={OCHRE} strokeWidth={1.4} />
      <Path d="M10 13l-2-4" {...S} strokeWidth={2.2} stroke={GREEN} />
    </Svg>
  );
}

function Peanut({ size }: IconProps) {
  // L'arachide — a Chadian staple.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path
        d="M18 8c6 0 9 4 9 8 0 5 6 6 6 12 0 7-5 12-11 12s-11-5-11-11c0-6 5-7 5-12 0-5 1-9 2-9z"
        fill={SAND}
        {...S}
      />
      <Path d="M14 26c6 3 12 3 18 0" fill="none" stroke={BROWN} strokeWidth={1.3} />
      <Path
        d="M18 16c3 1 6 1 8 0M17 34c4 2 9 2 12 0"
        fill="none"
        stroke={BROWN}
        strokeWidth={1.1}
      />
    </Svg>
  );
}

function Water({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M24 6c8 11 13 17 13 23a13 13 0 0 1-26 0c0-6 5-12 13-23z" fill={SKY} {...S} />
      <Path
        d="M17 30c0 5 3 8 7 8"
        fill="none"
        stroke={WHITE}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Egg({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M24 7c8 0 13 12 13 21a13 13 0 0 1-26 0c0-9 5-21 13-21z" fill={CREAM} {...S} />
      <Path
        d="M17 30c0 5 3 7 6 7"
        fill="none"
        stroke={WHITE}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : le marché
// ---------------------------------------------------------------------------

function Basket({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M9 20h30l-4 20H13z" fill={OCHRE} {...S} />
      <Path d="M14 20a10 8 0 0 1 20 0" fill="none" {...S} strokeWidth={2} />
      <Path d="M15 27h18M14 33h20" stroke={BROWN} strokeWidth={1.2} />
      <Path d="M18 20v20M24 20v20M30 20v20" stroke={BROWN} strokeWidth={1} opacity={0.6} />
    </Svg>
  );
}

function Money({ size }: IconProps) {
  // Billets et pièces en francs CFA.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={6} y={16} width={30} height={17} rx={3} fill={LEAF} {...S} />
      <Circle cx={21} cy={24.5} r={5} fill={CREAM} stroke={GREEN} strokeWidth={1.2} />
      <Path d="M19 22h4M19 27h4M21 21v7" stroke={GREEN} strokeWidth={1.2} />
      <Circle cx={36} cy={31} r={8} fill={GOLD} {...S} />
      <Path d="M33 31h6M36 28v6" stroke={BROWN} strokeWidth={1.4} />
    </Svg>
  );
}

function Scale({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M24 10v28M14 40h20" {...S} strokeWidth={2.4} stroke={BROWN} />
      <Path d="M8 16h32" {...S} strokeWidth={2} />
      <Path d="M8 16l-4 8h8zM40 16l-4 8h8z" fill={GREY} {...S} />
      <Circle cx={24} cy={10} r={2.4} fill={GOLD} {...S} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les moyens de transport et les voyages
// ---------------------------------------------------------------------------

function Bicycle({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Circle cx={12} cy={31} r={8} fill="none" {...S} strokeWidth={2} />
      <Circle cx={36} cy={31} r={8} fill="none" {...S} strokeWidth={2} />
      <Path
        d="M12 31l8-13h8l8 13M20 18h10M22 31h12"
        fill="none"
        {...S}
        strokeWidth={2}
        stroke={BLUE}
      />
      <Path d="M28 18v-4h4" fill="none" {...S} strokeWidth={2} />
    </Svg>
  );
}

function Car({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M7 30v-5l5-9h24l5 9v5z" fill={RED} {...S} />
      <Path d="M14 17h8v7h-12zM26 17h8l4 7H26z" fill={SKY} {...S} />
      <Circle cx={15} cy={32} r={4.5} fill={INK} />
      <Circle cx={33} cy={32} r={4.5} fill={INK} />
      <Circle cx={15} cy={32} r={1.8} fill={GREY} />
      <Circle cx={33} cy={32} r={1.8} fill={GREY} />
    </Svg>
  );
}

function Bus({ size }: IconProps) {
  // Le car de brousse.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={5} y={11} width={38} height={22} rx={4} fill={GOLD} {...S} />
      <Rect x={9} y={16} width={9} height={8} rx={1.5} fill={SKY} />
      <Rect x={21} y={16} width={9} height={8} rx={1.5} fill={SKY} />
      <Rect x={33} y={16} width={7} height={8} rx={1.5} fill={SKY} />
      <Path d="M5 28h38" stroke={OCHRE} strokeWidth={1.6} />
      <Circle cx={14} cy={35} r={4} fill={INK} />
      <Circle cx={34} cy={35} r={4} fill={INK} />
    </Svg>
  );
}

function Pirogue({ size }: IconProps) {
  // La pirogue du lac Tchad et du Chari.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M5 27h38c-3 8-9 11-19 11S8 35 5 27z" fill={BROWN} {...S} />
      <Path d="M24 26V9M24 12l9 4-9 4" fill={CREAM} {...S} />
      <Path
        d="M4 40c5-3 10-3 15 0 5-3 10-3 15 0"
        fill="none"
        stroke={SKY}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Cart({ size }: IconProps) {
  // La charrette à âne.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M10 18h26v12H10z" fill={OCHRE} {...S} />
      <Path d="M36 22h8" {...S} strokeWidth={2.2} stroke={BROWN} />
      <Circle cx={16} cy={35} r={5.5} fill="none" {...S} strokeWidth={2} />
      <Circle cx={31} cy={35} r={5.5} fill="none" {...S} strokeWidth={2} />
      <Path d="M14 18v12M22 18v12M30 18v12" stroke={BROWN} strokeWidth={1.2} />
    </Svg>
  );
}

function Suitcase({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={7} y={16} width={34} height={22} rx={4} fill={BROWN} {...S} />
      <Path d="M18 16v-4a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v4" fill="none" {...S} strokeWidth={2} />
      <Path d="M7 26h34" stroke={SAND} strokeWidth={2.4} />
      <Rect
        x={21}
        y={23}
        width={6}
        height={6}
        rx={1.5}
        fill={GOLD}
        stroke={INK}
        strokeWidth={1.1}
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les jeux, les cérémonies et les fêtes
// ---------------------------------------------------------------------------

function Ball({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Circle cx={24} cy={24} r={16} fill={WHITE} {...S} />
      <Path d="M24 14l7 5-3 9h-8l-3-9z" fill={INK} />
      <Path d="M24 8v6M10 20l7 3M38 20l-7 3M15 36l5-8M33 36l-5-8" stroke={INK} strokeWidth={1.4} />
    </Svg>
  );
}

function Rope({ size }: IconProps) {
  // La corde à sauter en plein tour : la boucle occupe la vignette, sinon
  // elle se lit comme un simple U.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path
        d="M12 13C1 23 3 40 17 43c5 1 9 1 14 0 14-3 16-20 5-30"
        fill="none"
        stroke={OCHRE}
        strokeWidth={3.6}
        strokeLinecap="round"
      />
      <Path d="M15 27c6 3 12 3 18 0" fill="none" stroke={SAND} strokeWidth={1.6} />
      <Rect x={5} y={4} width={8} height={15} rx={4} fill={BROWN} {...S} transform="rotate(-22 9 11.5)" />
      <Rect x={35} y={4} width={8} height={15} rx={4} fill={BROWN} {...S} transform="rotate(22 39 11.5)" />
    </Svg>
  );
}

function Drum({ size }: IconProps) {
  // Le tam-tam : fût évasé, peau tendue, cordes de tension.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M13 15h22l-4 13-1 12H18l-1-12z" fill={BROWN} {...S} />
      <Ellipse cx={24} cy={15} rx={11} ry={4.5} fill={CREAM} {...S} />
      <Ellipse cx={24} cy={15} rx={7} ry={2.6} fill="none" stroke={SAND} strokeWidth={1.1} />
      <Path d="M16 19l16 0M17 24l14 0" stroke={SAND} strokeWidth={1.2} />
      <Path d="M16 19l4 5-3 5M32 19l-4 5 3 5M24 19v10" fill="none" stroke={CREAM} strokeWidth={1.3} />
      <Ellipse cx={24} cy={40} rx={6} ry={2.4} fill={SAND} {...S} />
    </Svg>
  );
}

function Marble({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Circle cx={17} cy={28} r={9} fill={SKY} {...S} />
      <Circle cx={33} cy={32} r={6} fill={RED} {...S} />
      <Circle cx={31} cy={17} r={5} fill={GOLD} {...S} />
      <Circle cx={14} cy={24} r={2.4} fill={WHITE} opacity={0.8} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les maladies
// ---------------------------------------------------------------------------

function Thermometer({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Path d="M20 8a4 4 0 0 1 8 0v20a7 7 0 1 1-8 0z" fill={WHITE} {...S} />
      <Path d="M24 16v14" {...S} strokeWidth={3} stroke={RED} />
      <Circle cx={24} cy={34} r={4.5} fill={RED} />
      <Path d="M30 14h4M30 19h4M30 24h4" stroke={GREY} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

function Mosquito({ size }: IconProps) {
  // Le moustique — le paludisme est la première cause de maladie au CP.
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Ellipse cx={24} cy={28} rx={5} ry={10} fill={GREY} {...S} transform="rotate(20 24 28)" />
      <Circle cx={19} cy={17} r={4.5} fill={INK} {...S} />
      <Path d="M15 14l-6-5M23 13l3-6" fill="none" {...S} />
      <Path
        d="M26 22c7-6 14-5 15-1-4 3-11 5-15 1zM28 27c8-3 14 1 13 5-5 1-11-1-13-5z"
        fill={SKY}
        opacity={0.75}
        stroke={INK}
        strokeWidth={1.1}
      />
    </Svg>
  );
}

function Medicine({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={12} y={14} width={24} height={26} rx={4} fill={WHITE} {...S} />
      <Rect x={17} y={8} width={14} height={7} rx={2} fill={SKY} {...S} />
      <Path d="M24 22v12M18 28h12" {...S} strokeWidth={3.4} stroke={RED} />
    </Svg>
  );
}

function Hospital({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Rect x={8} y={14} width={32} height={25} rx={3} fill={WHITE} {...S} />
      <Path d="M8 14l16-8 16 8z" fill={SKY} {...S} />
      <Path d="M24 20v12M18 26h12" {...S} strokeWidth={3.4} stroke={RED} />
      <Rect x={12} y={33} width={6} height={6} rx={1} fill={SKY} />
      <Rect x={30} y={33} width={6} height={6} rx={1} fill={SKY} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Thème : les sentiments
// ---------------------------------------------------------------------------

function faceBase(mouth: React.ReactNode, brows: React.ReactNode, fill: string) {
  return (
    <>
      <Circle cx={24} cy={24} r={16} fill={fill} {...S} />
      <Circle cx={18} cy={21} r={1.8} fill={INK} />
      <Circle cx={30} cy={21} r={1.8} fill={INK} />
      {brows}
      {mouth}
    </>
  );
}

function Happy({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      {faceBase(<Path d="M16 28c3 5 13 5 16 0" fill="none" {...S} strokeWidth={2} />, null, GOLD)}
    </Svg>
  );
}

function Sad({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      {faceBase(
        <Path d="M17 33c3-5 11-5 14 0" fill="none" {...S} strokeWidth={2} />,
        <Path d="M14 17c2-2 5-2 6 0M28 17c1-2 4-2 6 0" fill="none" {...S} />,
        SKY,
      )}
      <Path
        d="M18 25c0 3-1 5-2 6"
        fill="none"
        stroke={BLUE}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Angry({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      {faceBase(
        <Path d="M17 32c3-4 11-4 14 0" fill="none" {...S} strokeWidth={2} />,
        <Path d="M13 15l7 4M35 15l-7 4" fill="none" {...S} strokeWidth={2} />,
        '#e08060',
      )}
    </Svg>
  );
}

function Afraid({ size }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox={BOX}>
      <Circle cx={24} cy={24} r={16} fill="#cfc9e8" {...S} />
      <Circle cx={18} cy={21} r={3} fill={WHITE} stroke={INK} strokeWidth={1.2} />
      <Circle cx={30} cy={21} r={3} fill={WHITE} stroke={INK} strokeWidth={1.2} />
      <Circle cx={18} cy={21} r={1.3} fill={INK} />
      <Circle cx={30} cy={21} r={1.3} fill={INK} />
      <Ellipse cx={24} cy={31} rx={4} ry={5} fill={INK} />
      <Path d="M12 14c2-3 5-3 7-1M36 14c-2-3-5-3-7-1" fill="none" {...S} />
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
