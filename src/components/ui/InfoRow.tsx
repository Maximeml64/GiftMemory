// src/components/ui/InfoRow.tsx
//
// Ligne label (gauche) + valeur (droite). Utilisé dans les écrans de détail.

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../utils/theme';
import { StyledText } from './StyledText';

interface Props {
  label: string;
  value: string | React.ReactNode;
  divider?: boolean;
}

export function InfoRow({ label, value, divider = true }: Props) {
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: divider ? 0.5 : 0,
    borderBottomColor: COLORS.border,
    gap: SPACING.md,
  };

  return (
    <View style={containerStyle}>
      <StyledText variant="small" color={COLORS.textSecondary} style={{ flexShrink: 0 }}>
        {label}
      </StyledText>
      {typeof value === 'string' ? (
        <StyledText
          variant="smallMedium"
          color={COLORS.text}
          align="right"
          style={{ flex: 1, flexShrink: 1 }}
          numberOfLines={2}
        >
          {value}
        </StyledText>
      ) : (
        <View style={{ flexShrink: 1 }}>{value}</View>
      )}
    </View>
  );
}
