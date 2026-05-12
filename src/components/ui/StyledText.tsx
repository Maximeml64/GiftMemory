// src/components/ui/StyledText.tsx
//
// Composant Text typé avec variants pré-définis depuis TYPOGRAPHY.
// Usage : <StyledText variant="h2">Mon titre</StyledText>

import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { TYPOGRAPHY } from '../../utils/theme';

type Variant = keyof typeof TYPOGRAPHY;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  align?: TextStyle['textAlign'];
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

export function StyledText({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...rest
}: Props) {
  const baseStyle = TYPOGRAPHY[variant];

  return (
    <Text
      {...rest}
      style={[
        baseStyle as TextStyle,
        color ? { color } : null,
        align ? { textAlign: align } : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}
