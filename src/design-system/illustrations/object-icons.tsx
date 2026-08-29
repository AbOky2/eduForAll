import type React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { CURRICULUM_ICONS } from './curriculum-icons';

/**
 * Original flat pictograms for exercises (counting, word-image association).
 * One coherent set, Sahelian palette, readable at 40 px on low-DPI screens.
 * Ids match the curriculum manifest (assets/illustrations in the manifest).
 */

const INK = '#161a32';
const SAND = '#d4a373';
const BROWN = '#7d562d';
const BLUE = '#2b6485';
const CREAM = '#fdf6e9';
const GREEN = '#5b7a4a';
const RED = '#c9503c';
const GOLD = '#ffd166';

interface ObjectIconProps {
  id: string;
  size?: number;
}

function Goat({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Ellipse cx={24} cy={28} rx={13} ry={9} fill={CREAM} stroke={INK} strokeWidth={1.4} />
      <Circle cx={35} cy={20} r={6.5} fill={CREAM} stroke={INK} strokeWidth={1.4} />
      <Path
        d="M38 14c2-2 2-4 1-6M33 14c-1-2-1-4 0-6"
        stroke={BROWN}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx={37} cy={19} r={1.2} fill={INK} />
      <Path
        d="M35 25c0 2 1 3 2 3"
        stroke={INK}
        strokeWidth={1.2}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M14 35v6M20 36v5M28 36v5M33 35v6"
        stroke={INK}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M12 27c-2 0-3 1-3 3"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function Mango({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M14 20c4-8 16-9 21-3 5 7 1 19-8 21C17 40 10 31 14 20z"
        fill={GOLD}
        stroke={RED}
        strokeWidth={1.6}
      />
      <Path d="M30 12c1-3 4-4 6-4-1 3-3 5-6 4z" fill={GREEN} />
      <Path
        d="M18 22c-1 4 0 8 3 11"
        stroke="#e8a23d"
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function Hut({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path d="M8 24L24 8l16 16z" fill={BROWN} />
      <Path d="M10 24h28v3H10z" fill={INK} opacity={0.25} />
      <Rect
        x={12}
        y={26}
        width={24}
        height={14}
        rx={2}
        fill={SAND}
        stroke={INK}
        strokeWidth={1.2}
      />
      <Rect x={21} y={30} width={7} height={10} rx={2} fill={BROWN} />
    </Svg>
  );
}

function Star({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M24 6l5.2 10.8L41 18.4l-8.6 8 2.2 11.6L24 32.4 13.4 38l2.2-11.6-8.6-8 11.8-1.6z"
        fill={GOLD}
        stroke="#d99a00"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function Calabash({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M24 10c-2 5-10 6-10 15 0 8 5 13 10 13s10-5 10-13c0-9-8-10-10-15z"
        fill={SAND}
        stroke={BROWN}
        strokeWidth={1.6}
      />
      <Ellipse
        cx={24}
        cy={26}
        rx={6}
        ry={7}
        fill="none"
        stroke={BROWN}
        strokeWidth={1.2}
        opacity={0.5}
      />
    </Svg>
  );
}

function Moto({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx={12} cy={34} r={7} fill="none" stroke={INK} strokeWidth={2} />
      <Circle cx={37} cy={34} r={7} fill="none" stroke={INK} strokeWidth={2} />
      <Path
        d="M12 34l7-13h9l6 9"
        stroke={BLUE}
        strokeWidth={2.6}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M19 21l-4-4h6" stroke={INK} strokeWidth={2} strokeLinecap="round" fill="none" />
      <Path d="M28 21l4-6h5" stroke={INK} strokeWidth={2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function Bed({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M8 16v22M8 30h32v8"
        stroke={BROWN}
        strokeWidth={2.4}
        strokeLinecap="round"
        fill="none"
      />
      <Rect
        x={11}
        y={22}
        width={10}
        height={7}
        rx={3}
        fill={CREAM}
        stroke={INK}
        strokeWidth={1.2}
      />
      <Path d="M8 30c0-5 5-8 14-8 12 0 18 3 18 8z" fill={BLUE} />
    </Svg>
  );
}

function Tomato({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx={24} cy={28} r={14} fill={RED} stroke="#963527" strokeWidth={1.6} />
      <Path d="M24 14c-2-3-5-4-8-3 2 2 4 3 8 3zM24 14c2-3 5-4 8-3-2 2-4 3-8 3z" fill={GREEN} />
      <Path d="M24 14v4" stroke={GREEN} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function Salad({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path d="M10 26a14 14 0 0 0 28 0z" fill={CREAM} stroke={INK} strokeWidth={1.4} />
      <Circle cx={18} cy={22} r={5} fill={GREEN} />
      <Circle cx={27} cy={19} r={6} fill="#6f9459" />
      <Circle cx={33} cy={23} r={4} fill={GREEN} />
      <Circle cx={24} cy={23} r={3} fill={RED} />
    </Svg>
  );
}

function Father({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx={24} cy={16} r={8} fill="#8a5a3b" />
      <Path d="M10 42c2-9 7-13 14-13s12 4 14 13z" fill={BLUE} />
      <Rect x={16} y={6} width={16} height={5} rx={2.5} fill={INK} />
    </Svg>
  );
}

function Friends({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx={17} cy={17} r={6.5} fill="#8a5a3b" />
      <Circle cx={32} cy={18} r={5.5} fill="#6e452c" />
      <Path d="M6 40c1.5-8 5.5-11 11-11s9.5 3 11 11z" fill="#c96f2f" />
      <Path d="M25 40c1.2-6.5 3.8-9.5 7.5-9.5S38.8 33.5 40 40z" fill={GREEN} />
    </Svg>
  );
}

function Cat({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx={24} cy={26} r={12} fill="#b98a5a" stroke={INK} strokeWidth={1.4} />
      <Path
        d="M14 18l-2-8 8 4zM34 18l2-8-8 4z"
        fill="#b98a5a"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <Circle cx={19.5} cy={24} r={1.6} fill={INK} />
      <Circle cx={28.5} cy={24} r={1.6} fill={INK} />
      <Path
        d="M21 30c2 1.6 4 1.6 6 0"
        stroke={INK}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M10 27h-5M11 30l-4 2M38 27h5M37 30l4 2"
        stroke={INK}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Sheep({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Ellipse cx={26} cy={26} rx={13} ry={10} fill={CREAM} stroke={INK} strokeWidth={1.4} />
      <Circle cx={12} cy={22} r={6} fill={INK} />
      <Circle cx={10} cy={21} r={1.2} fill="#fff" />
      <Path
        d="M9 16c-1-2 0-4 2-4M15 16c1-2 0-4-2-4"
        stroke={INK}
        strokeWidth={1.3}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M18 35v6M24 36v5M31 36v5M36 34v7"
        stroke={INK}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function Soap({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Rect
        x={9}
        y={20}
        width={30}
        height={17}
        rx={6}
        fill={BLUE}
        stroke="#1c4a63"
        strokeWidth={1.4}
      />
      <Circle cx={16} cy={14} r={3} fill="none" stroke={BLUE} strokeWidth={1.6} />
      <Circle cx={25} cy={9} r={2.4} fill="none" stroke={BLUE} strokeWidth={1.4} />
      <Circle cx={33} cy={13} r={1.8} fill="none" stroke={BLUE} strokeWidth={1.2} />
      <Path
        d="M15 27c3-2 15-2 18 0"
        stroke="#a3d8fe"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function King({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx={24} cy={22} r={9} fill="#6e452c" />
      <Path d="M12 42c2-8 6-11 12-11s10 3 12 11z" fill="#8c5fa8" />
      <Path
        d="M14 14l3-7 4 4 3-6 3 6 4-4 3 7z"
        fill={GOLD}
        stroke="#d99a00"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <Circle cx={21} cy={21} r={1.5} fill={INK} />
      <Circle cx={27} cy={21} r={1.5} fill={INK} />
      <Path
        d="M21 26c2 1.4 4 1.4 6 0"
        stroke={INK}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function Wolf({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M24 40c-8 0-13-6-13-13 0-3 1-6 3-8l-2-9 8 5c1.2-.4 2.6-.6 4-.6s2.8.2 4 .6l8-5-2 9c2 2 3 5 3 8 0 7-5 13-13 13z"
        fill="#7a7f92"
        stroke={INK}
        strokeWidth={1.4}
      />
      <Circle cx={19} cy={25} r={1.8} fill={INK} />
      <Circle cx={29} cy={25} r={1.8} fill={INK} />
      <Path d="M24 29l-2.5 3h5z" fill={INK} />
    </Svg>
  );
}

function Wood({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G transform="rotate(-8 24 30)">
        <Rect x={8} y={24} width={30} height={9} rx={4.5} fill={BROWN} />
        <Ellipse cx={38} cy={28.5} rx={4} ry={4.5} fill={SAND} stroke={BROWN} strokeWidth={1.2} />
      </G>
      <G transform="rotate(6 24 20)">
        <Rect x={10} y={13} width={28} height={8} rx={4} fill="#8a5a3b" />
        <Ellipse cx={38} cy={17} rx={3.6} ry={4} fill={SAND} stroke="#6e452c" strokeWidth={1.2} />
      </G>
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
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Rect x={8} y={8} width={32} height={32} rx={8} fill="#efedf6" />
        <Path d="M18 30l6-12 6 12z" fill="#b9b6c9" />
      </Svg>
    );
  }
  return <Component size={size} />;
}

export function hasObjectIcon(id: string): boolean {
  return id in REGISTRY;
}
