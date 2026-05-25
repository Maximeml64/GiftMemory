// src/components/ui/Divider.tsx
//
// Séparation horizontale discrète (hairline sur fond border).

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS, SPACING } from '../../utils/theme';

interface Props {
  marginVertical?: number;
  inset?: number;
  color?: string;
}

export function Divider({ marginVertical = SPACING.sm, inset = 0, color }: Props) {
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: color ?? COLORS.border,
        marginVertical,
        marginLeft: inset,
      }}
    />
  );
}
