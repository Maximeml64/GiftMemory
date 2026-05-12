// src/components/ui/Badge.tsx
//
// Badge duo-ton (bg pâle + texte saturé). Utilisé pour les occasions
// et les status. Accepte une icône (emoji ou node) à gauche.

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { RADIUS, SPACING } from '../../utils/theme';
import { StyledText } from './StyledText';

interface Props {
  label: string;
  color: string;
  bg: string;
  icon?: string | React.ReactNode;
  size?: 'sm' | 'md';
}

export function Badge({ label, color, bg, icon, size = 'md' }: Props) {
  const paddingV = size === 'sm' ? 2 : 4;
  const paddingH = size === 'sm' ? SPACING.sm : SPACING.md;

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: paddingH,
    paddingVertical: paddingV,
    borderRadius: RADIUS.full,
    backgroundColor: bg,
    alignSelf: 'flex-start',
  };

  return (
    <View style={containerStyle}>
      {icon
        ? typeof icon === 'string'
          ? <StyledText variant={size === 'sm' ? 'caption' : 'small'}>{icon}</StyledText>
          : icon
        : null}
      <StyledText
        variant={size === 'sm' ? 'caption' : 'smallMedium'}
        color={color}
      >
        {label}
      </StyledText>
    </View>
  );
}
