import { memo, useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '../accessibility/use-reduced-motion';
import { colors, subjectColors } from '../tokens';

const PIECES = 26;
const HUES = [
  colors.reward,
  subjectColors.reading.solid,
  subjectColors.language.solid,
  colors.white,
  subjectColors.writing.solid,
  subjectColors.math.solid,
  colors.reward,
];

/** Un pseudo-hasard stable : la même pluie à chaque rendu, sans `Math.random`. */
function noise(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface Piece {
  x: number;
  delay: number;
  drift: number;
  spin: number;
  size: number;
  round: boolean;
  color: string;
}

const LAYOUT: readonly Piece[] = Array.from({ length: PIECES }, (_, index) => ({
  x: noise(index, 1),
  delay: Math.round(noise(index, 2) * 420),
  drift: (noise(index, 3) - 0.5) * 120,
  spin: (noise(index, 4) - 0.5) * 900,
  size: 7 + Math.round(noise(index, 5) * 7),
  round: noise(index, 6) > 0.62,
  color: HUES[index % HUES.length] ?? colors.reward,
}));

function Falling({ piece, height, width }: { piece: Piece; height: number; width: number }) {
  const [fall] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const animation = Animated.timing(fall, {
      toValue: 1,
      duration: 1900,
      delay: piece.delay,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [fall, piece.delay]);
  const translateY = fall.interpolate({ inputRange: [0, 1], outputRange: [-24, height * 0.78] });
  const translateX = fall.interpolate({ inputRange: [0, 1], outputRange: [0, piece.drift] });
  const rotate = fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${piece.spin}deg`] });
  const opacity = fall.interpolate({ inputRange: [0, 0.05, 0.75, 1], outputRange: [0, 1, 1, 0] });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: piece.x * width,
        top: 0,
        width: piece.size,
        height: piece.round ? piece.size : piece.size * 0.55,
        borderRadius: piece.round ? piece.size / 2 : 2,
        backgroundColor: piece.color,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }],
      }}
    />
  );
}

/**
 * Une pluie de confettis, une seule fois, à l'ouverture de la célébration :
 * des rubans et des pastilles aux couleurs des disciplines et du soleil, qui
 * tombent en 2 s puis s'effacent. Décorative, jamais touchable ; absente si
 * le système demande moins de mouvement.
 */
export const Confetti = memo(function Confetti({ width, height }: { width: number; height: number }) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion || width === 0) {
    return null;
  }
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} aria-hidden importantForAccessibility="no-hide-descendants">
      {LAYOUT.map((piece, index) => (
        <Falling key={index} piece={piece} width={width} height={height} />
      ))}
    </View>
  );
});
