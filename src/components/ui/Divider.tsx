// src/components/ui/Divider.tsx
//
// Séparation horizontale discrète (1px sur fond border).

import React from 'react';
import { View } from 'react-native';
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
        height: StyleSheetHairlineWidth(),
        backgroundColor: color ?? COLORS.border,
        marginVertical,
        marginLeft: inset,
      }}
    />
  );
}

function StyleSheetHairlineWidth(): number {
  // 0.5 is the visual standard for separators on iOS, 1 on Android.
  return 0.5;
}
