import { Text, type TextProps } from 'react-native';

import { colors, type TypographyVariant } from '../tokens';
import { useTypography } from '../responsive';

interface EcolnaTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * The only way text is rendered in ECOLNA. Enforces the Stitch type scale
 * (Quicksand / Plus Jakarta Sans), scales it with the window size — a tablet
 * held at arm's length needs bigger letters, not the same letters spread
 * wider — and supports OS font scaling within child-safe bounds.
 */
export function EcolnaText({
  variant = 'bodyMd',
  color = colors.textPrimary,
  align = 'left',
  style,
  children,
  ...rest
}: EcolnaTextProps) {
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
