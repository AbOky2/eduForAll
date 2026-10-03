import type { Ref } from 'react';
import { Text, type TextProps } from 'react-native';

import { colors, type TypographyVariant } from '../tokens';
import { useTypography } from '../responsive';

interface EcolnaTextProps extends TextProps {
  /** React 19 : la ref est une prop ; elle va au `Text` (focus d'accessibilité). */
  ref?: Ref<Text> | undefined;
  variant?: TypographyVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * The only way text is rendered in ECOLNA. Enforces the v4 type scale
 * (Ecolna Sans, Andika for taught glyphs), scales it with the window size — a tablet
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
