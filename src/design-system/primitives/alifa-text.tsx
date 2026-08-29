import { Text, type TextProps } from 'react-native';

import { colors, type TypographyVariant } from '../tokens';
import { useTypography } from '../responsive';

interface AlifaTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * The only way text is rendered in ALIFA. Enforces the Stitch type scale
 * (Quicksand / Plus Jakarta Sans), scales it with the window size — a tablet
 * held at arm's length needs bigger letters, not the same letters spread
 * wider — and supports OS font scaling within child-safe bounds.
 */
export function AlifaText({
  variant = 'bodyMd',
  color = colors.textPrimary,
  align = 'left',
  style,
  children,
  ...rest
}: AlifaTextProps) {
  const typography = useTypography();
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
