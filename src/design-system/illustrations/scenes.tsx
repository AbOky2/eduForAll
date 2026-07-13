import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

/**
 * Original flat illustrations in the Sahelian palette. The Stitch mockups use
 * painterly artwork; these are sober vector interpretations that keep the
 * spirit (dunes, acacia, warm light, dignified children) while staying tiny
 * and crisp on low-end devices. See docs/design-decisions.md.
 */

const SAND = '#d4a373';
const SAND_LIGHT = '#f0d5b1';
const SKY = '#f9e9ce';
const SUN = '#ffd166';
const TREE = '#7d562d';
const LEAF = '#5b7a4a';
const SKIN = '#8a5a3b';
const CLOTH = '#2b6485';
const INK = '#161a32';

interface SceneProps {
  width?: number;
  height?: number;
}

/** Child reading under an acacia at sunset (splash / onboarding 1). */
export function ReadingChildScene({ width = 280, height = 200 }: SceneProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 200">
      <Rect width={280} height={200} rx={20} fill={SKY} />
      <Circle cx={200} cy={92} r={40} fill={SUN} opacity={0.9} />
      <Ellipse cx={140} cy={185} rx={170} ry={45} fill={SAND_LIGHT} />
      <Ellipse cx={215} cy={175} rx={120} ry={32} fill={SAND} opacity={0.55} />
      {/* Acacia */}
      <Path d="M78 155c-2-28 -6-48 -18-70" stroke={TREE} strokeWidth={7} strokeLinecap="round" fill="none" />
      <Path d="M62 88c-14-6-26-4-38 3M62 88c2-12 10-20 22-24M62 88c12-4 26-2 36 6" stroke={TREE} strokeWidth={4} strokeLinecap="round" fill="none" />
      <Ellipse cx={30} cy={86} rx={22} ry={9} fill={LEAF} />
      <Ellipse cx={84} cy={58} rx={26} ry={10} fill={LEAF} />
      <Ellipse cx={104} cy={92} rx={22} ry={9} fill={LEAF} />
      {/* Child sitting with book */}
      <Circle cx={150} cy={128} r={13} fill={SKIN} />
      <Path d="M138 138c-8 6-12 16-12 26h48c0-10-4-20-12-26z" fill={CLOTH} />
      <Path d="M132 158l18-8 18 8-18 6z" fill="#fdf6e9" stroke={INK} strokeWidth={1.4} />
      <Path d="M150 150v14" stroke={INK} strokeWidth={1.2} />
    </Svg>
  );
}

/** Phone with a green check and smiling pebble (onboarding 3 / offline). */
export function OfflineReadyScene({ width = 280, height = 200 }: SceneProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 200">
      <Rect width={280} height={200} rx={20} fill="#f7efdd" />
      <Ellipse cx={140} cy={182} rx={150} ry={30} fill={SAND_LIGHT} />
      <G transform="rotate(-12 150 100)">
        <Rect x={105} y={45} width={90} height={150} rx={16} fill={INK} />
        <Rect x={111} y={51} width={78} height={138} rx={11} fill="#fdfaf2" />
        <Circle cx={150} cy={106} r={26} fill="#3e6837" />
        <Path d="M139 106l8 8 15-17" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </G>
      {/* Smiling pebble friend */}
      <Ellipse cx={78} cy={162} rx={26} ry={22} fill={SUN} />
      <Circle cx={70} cy={158} r={2.6} fill={INK} />
      <Circle cx={88} cy={158} r={2.6} fill={INK} />
      <Path d="M70 168c5 4 12 4 17 0" stroke={INK} strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** Smiling sun behind a cloud over a dune (offline info screen, S20). */
export function SunCloudScene({ width = 280, height = 200 }: SceneProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 200">
      <Rect width={280} height={200} rx={20} fill={SKY} />
      <Circle cx={150} cy={86} r={44} fill={SUN} />
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <Path
            key={index}
            d={`M${150 + Math.cos(angle) * 54} ${86 + Math.sin(angle) * 54} L${150 + Math.cos(angle) * 66} ${86 + Math.sin(angle) * 66}`}
            stroke={SUN}
            strokeWidth={7}
            strokeLinecap="round"
          />
        );
      })}
      <Circle cx={138} cy={80} r={3.4} fill={INK} />
      <Circle cx={162} cy={80} r={3.4} fill={INK} />
      <Path d="M138 94c8 7 17 7 25 0" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />
      {/* Cloud */}
      <G>
        <Circle cx={98} cy={122} r={24} fill="#fdfaf2" />
        <Circle cx={132} cy={128} r={20} fill="#fdfaf2" />
        <Circle cx={166} cy={124} r={23} fill="#fdfaf2" />
        <Rect x={80} y={124} width={106} height={24} rx={12} fill="#fdfaf2" />
      </G>
      <Ellipse cx={140} cy={192} rx={160} ry={38} fill={SAND} />
    </Svg>
  );
}

/** Avatar portraits — four distinct children, flat and dignified (S05). */
export function AvatarFace({
  variant,
  size = 64,
}: {
  variant: 1 | 2 | 3 | 4;
  size?: number;
}) {
  const skins = ['#8a5a3b', '#6e452c', '#9c6b46', '#7a4f33'] as const;
  const cloths = [CLOTH, '#c96f2f', '#5b7a4a', '#8c5fa8'] as const;
  const skin = skins[variant - 1] ?? skins[0];
  const cloth = cloths[variant - 1] ?? cloths[0];
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx={32} cy={32} r={32} fill={SAND_LIGHT} />
      {/* hair */}
      <Circle cx={32} cy={26} r={16.5} fill={INK} />
      {variant === 2 ? (
        <G>
          <Circle cx={18} cy={20} r={5} fill={INK} />
          <Circle cx={46} cy={20} r={5} fill={INK} />
        </G>
      ) : null}
      {variant === 4 ? <Rect x={16} y={8} width={32} height={10} rx={5} fill={cloth} /> : null}
      <Circle cx={32} cy={30} r={13} fill={skin} />
      <Circle cx={27} cy={28} r={1.8} fill={INK} />
      <Circle cx={37} cy={28} r={1.8} fill={INK} />
      <Path d="M27 35c3 2.6 7 2.6 10 0" stroke={INK} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Path d="M17 58c3-10 8-15 15-15s12 5 15 15z" fill={cloth} />
    </Svg>
  );
}
