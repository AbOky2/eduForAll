import { Text, type TextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '../tokens';

interface AlifaTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * The only way text is rendered in ALIFA. Enforces the Stitch type scale
 * (Quicksand / Plus Jakarta Sans) and supports OS font scaling within
 * child-safe bounds.
 */
export function AlifaText({
  variant = 'bodyMd',
  color = colors.textPrimary,
  align = 'left',
  style,
  children,
  ...rest
}: AlifaTextProps) {
  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={1.4}
      style={[typography[variant], { color, textAlign: align }, style]}
    >
      {children}
    </Text>
  );
}
