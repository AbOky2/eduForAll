import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

import { colors } from '../tokens';

export type IconName =
  | 'speaker'
  | 'play'
  | 'check'
  | 'close'
  | 'star'
  | 'star-outline'
  | 'lock'
  | 'lightbulb'
  | 'arrow-back'
  | 'chevron-right'
  | 'gear'
  | 'home'
  | 'book'
  | 'pencil'
  | 'ear'
  | 'calculator'
  | 'parents'
  | 'cloud-off'
  | 'pause'
  | 'replay'
  | 'leaf'
  | 'sparkle'
  | 'trash'
  | 'share';

interface AlifaIconProps {
  name: IconName;
  size?: number;
  color?: string;
  /** Filled version where it exists (stars). */
  filled?: boolean;
}

/**
 * Original hand-drawn icon set on a 24×24 grid, matching the light outlined
 * style of the mockups (no @expo/vector-icons — see ADR notes).
 */
export function AlifaIcon({ name, size = 24, color = colors.onSurface, filled = false }: AlifaIconProps) {
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };
  const box = { width: size, height: size, viewBox: '0 0 24 24' };

  switch (name) {
    case 'speaker':
      return (
        <Svg {...box}>
          <Path {...stroke} d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5H4z" fill={filled ? color : 'none'} />
          <Path {...stroke} d="M15 9.2a4 4 0 0 1 0 5.6" />
          <Path {...stroke} d="M17.6 7a7.4 7.4 0 0 1 0 10" />
        </Svg>
      );
    case 'play':
      return (
        <Svg {...box}>
          <Path d="M8.5 5.8v12.4c0 .8.9 1.3 1.6.9l9.4-6.2c.6-.4.6-1.3 0-1.7L10.1 4.9c-.7-.4-1.6 0-1.6.9z" fill={color} />
        </Svg>
      );
    case 'pause':
      return (
        <Svg {...box}>
          <Rect x={7} y={5.5} width={3.4} height={13} rx={1.4} fill={color} />
          <Rect x={13.6} y={5.5} width={3.4} height={13} rx={1.4} fill={color} />
        </Svg>
      );
    case 'replay':
      return (
        <Svg {...box}>
          <Path {...stroke} d="M12 5a7 7 0 1 1-6.3 4" />
          <Polyline {...stroke} points="5.2,4.4 5.7,9 10.2,8.4" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...box}>
          <Polyline {...stroke} strokeWidth={2.4} points="5,12.5 10,17.5 19,7" />
        </Svg>
      );
    case 'close':
      return (
        <Svg {...box}>
          <Line {...stroke} strokeWidth={2.2} x1={6.5} y1={6.5} x2={17.5} y2={17.5} />
          <Line {...stroke} strokeWidth={2.2} x1={17.5} y1={6.5} x2={6.5} y2={17.5} />
        </Svg>
      );
    case 'star':
    case 'star-outline': {
      const starPath =
        'M12 3.6l2.5 5.2 5.7.7-4.2 3.9 1.1 5.6L12 16.2 6.9 19l1.1-5.6-4.2-3.9 5.7-.7z';
      return (
        <Svg {...box}>
          <Path
            d={starPath}
            fill={name === 'star' || filled ? color : 'none'}
            stroke={color}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </Svg>
      );
    }
    case 'lock':
      return (
        <Svg {...box}>
          <Rect {...stroke} x={5.5} y={10.5} width={13} height={9} rx={2.5} />
          <Path {...stroke} d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
          <Circle cx={12} cy={15} r={1.4} fill={color} />
        </Svg>
      );
    case 'lightbulb':
      return (
        <Svg {...box}>
          <Path {...stroke} d="M12 3.5a5.5 5.5 0 0 1 3.2 10c-.7.5-1.2 1.1-1.2 1.9v.6h-4v-.6c0-.8-.5-1.4-1.2-1.9A5.5 5.5 0 0 1 12 3.5z" />
          <Line {...stroke} x1={10} y1={19.5} x2={14} y2={19.5} />
        </Svg>
      );
    case 'arrow-back':
      return (
        <Svg {...box}>
          <Line {...stroke} strokeWidth={2.2} x1={20} y1={12} x2={5} y2={12} />
          <Polyline {...stroke} strokeWidth={2.2} points="11,5.5 4.5,12 11,18.5" />
        </Svg>
      );
    case 'chevron-right':
      return (
        <Svg {...box}>
          <Polyline {...stroke} strokeWidth={2.2} points="9,5.5 15.5,12 9,18.5" />
        </Svg>
      );
    case 'gear':
      return (
        <Svg {...box}>
          <Circle {...stroke} cx={12} cy={12} r={3} />
          <Path
            {...stroke}
            d="M12 3.8l1 2.1 2.3.4 1.9-1.3 1.8 1.8-1.3 1.9.4 2.3 2.1 1-2.1 1-.4 2.3 1.3 1.9-1.8 1.8-1.9-1.3-2.3.4-1 2.1-1-2.1-2.3-.4-1.9 1.3-1.8-1.8 1.3-1.9-.4-2.3-2.1-1 2.1-1 .4-2.3L6.8 5l1.8-1.8 1.9 1.3 2.3-.4z"
          />
        </Svg>
      );
    case 'home':
      return (
        <Svg {...box}>
          <Path {...stroke} d="M4.5 11.5 12 4.5l7.5 7v7.5a1.5 1.5 0 0 1-1.5 1.5h-3.5v-5.5h-5V20.5H6a1.5 1.5 0 0 1-1.5-1.5z" fill={filled ? color : 'none'} />
        </Svg>
      );
    case 'book':
      return (
        <Svg {...box}>
          <Path {...stroke} d="M12 6.5c-1.6-1.3-3.8-1.8-7-1.5v13c3.2-.3 5.4.2 7 1.5 1.6-1.3 3.8-1.8 7-1.5v-13c-3.2-.3-5.4.2-7 1.5z" />
          <Line {...stroke} x1={12} y1={6.8} x2={12} y2={19} />
        </Svg>
      );
    case 'pencil':
      return (
        <Svg {...box}>
          <Path {...stroke} d="M5 16.2 15.6 5.6a2 2 0 0 1 2.8 2.8L7.8 19 4.5 19.5z" />
        </Svg>
      );
    case 'ear':
      return (
        <Svg {...box}>
          <Path {...stroke} d="M7.5 9a4.8 4.8 0 0 1 9.6 0c0 2.6-2.3 3.5-2.6 5.4-.2 1.6-1 2.9-2.6 2.9" />
          <Path {...stroke} d="M10.4 9.1a2.2 2.2 0 0 1 4 1.2c0 1.3-1.3 1.9-1.7 3" />
        </Svg>
      );
    case 'calculator':
      return (
        <Svg {...box}>
          <Rect {...stroke} x={5.5} y={3.5} width={13} height={17} rx={2.5} />
          <Line {...stroke} x1={8.5} y1={7.5} x2={15.5} y2={7.5} />
          <Circle cx={9} cy={12} r={1.1} fill={color} />
          <Circle cx={15} cy={12} r={1.1} fill={color} />
          <Circle cx={9} cy={16.5} r={1.1} fill={color} />
          <Circle cx={15} cy={16.5} r={1.1} fill={color} />
        </Svg>
      );
    case 'parents':
      return (
        <Svg {...box}>
          <Circle {...stroke} cx={9} cy={8} r={2.6} />
          <Circle {...stroke} cx={16.4} cy={9.4} r={2} />
          <Path {...stroke} d="M4.5 19c.4-3 2.3-4.8 4.5-4.8S13.1 16 13.5 19" />
          <Path {...stroke} d="M14.6 19c.3-2.1 1.4-3.4 3-3.4 1.3 0 2.3 1 2.9 2.6" />
        </Svg>
      );
    case 'cloud-off':
      return (
        <Svg {...box}>
          <Path {...stroke} d="M8 17.5h9a3.5 3.5 0 0 0 .8-6.9A5.5 5.5 0 0 0 8.2 8.5 4 4 0 0 0 8 17.5z" />
          <Line {...stroke} x1={4.5} y1={4.5} x2={19.5} y2={19.5} stroke={colors.error} />
        </Svg>
      );
    case 'leaf':
      return (
        <Svg {...box}>
          <Path {...stroke} d="M6 18C6 10 11 5.5 19 5c.4 8-3.8 13-12 13z" />
          <Path {...stroke} d="M6.5 17.5C9 14 12 11 16 8.5" />
        </Svg>
      );
    case 'sparkle':
      return (
        <Svg {...box}>
          <Path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z" fill={color} />
          <Circle cx={18.5} cy={17.5} r={1.6} fill={color} />
        </Svg>
      );
    case 'trash':
      return (
        <Svg {...box}>
          <Path {...stroke} d="M6 7h12l-.8 12.2a1.8 1.8 0 0 1-1.8 1.7H8.6a1.8 1.8 0 0 1-1.8-1.7z" />
          <Line {...stroke} x1={4.5} y1={7} x2={19.5} y2={7} />
          <Path {...stroke} d="M9.5 7V5.4c0-.8.6-1.4 1.4-1.4h2.2c.8 0 1.4.6 1.4 1.4V7" />
        </Svg>
      );
    case 'share':
      return (
        <Svg {...box}>
          <Circle {...stroke} cx={6.5} cy={12} r={2.2} />
          <Circle {...stroke} cx={17.5} cy={6} r={2.2} />
          <Circle {...stroke} cx={17.5} cy={18} r={2.2} />
          <Line {...stroke} x1={8.6} y1={11} x2={15.5} y2={7} />
          <Line {...stroke} x1={8.6} y1={13} x2={15.5} y2={17} />
        </Svg>
      );
    default: {
      const unhandled: never = name;
      throw new Error(`unknown icon: ${String(unhandled)}`);
    }
  }
}
