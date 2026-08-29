import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, shadows, spacing } from '../tokens';

interface AlifaCardProps {
  children: ReactNode;
  onPress?: (() => void) | undefined;
  /** Rounded 24 for hero cards, 16 for standard cards. */
  rounded?: 'lg' | 'xl';
  padded?: boolean;
  backgroundColor?: string;
  accessibilityLabel?: string | undefined;
  style?: StyleProp<ViewStyle>;
}

/** White soft-shadow card used across every mockup. */
export function AlifaCard({
  children,
  onPress,
  rounded = 'lg',
  padded = true,
  backgroundColor = colors.card,
  accessibilityLabel,
  style,
}: AlifaCardProps) {
  const base = [
    styles.card,
    shadows.card,
    {
      borderRadius: radius[rounded],
      padding: padded ? spacing.lg : 0,
      backgroundColor,
    },
    style,
  ];

  if (!onPress) {
    return <View style={base}>{children}</View>;
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, { transform: [{ scale: pressed ? 0.98 : 1 }] }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
});
