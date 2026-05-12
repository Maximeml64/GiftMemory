// src/components/ui/Avatar.tsx
//
// Avatar circulaire avec initiales. Couleur dérivée du nom (hash → palette).

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS, FONTS, RADIUS } from '../../utils/theme';
import { StyledText } from './StyledText';

interface Props {
  name: string;
  size?: number;
  background?: string;
  textColor?: string;
}

// Palette d'avatars dérivée des occasions (cohérence visuelle)
const AVATAR_COLORS: { bg: string; text: string }[] = [
  { bg: '#F8E1EC', text: '#A82864' },
  { bg: '#E0EDE3', text: '#3D6B4A' },
  { bg: '#E1EAF2', text: '#4A6481' },
  { bg: '#EBDDE6', text: '#4A1942' },
  { bg: '#F3E8D4', text: '#B07D2E' },
  { bg: '#F5E1E8', text: '#A82864' },
];

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = 40, background, textColor }: Props) {
  const palette = AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
  const bg = background ?? palette.bg;
  const fg = textColor ?? palette.text;
  const initials = getInitials(name);

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: RADIUS.full,
    backgroundColor: bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  };

  return (
    <View style={containerStyle}>
      <StyledText
        style={{
          fontFamily: FONTS.sansSemiBold,
          fontSize: Math.max(11, size * 0.36),
          color: fg,
        }}
      >
        {initials}
      </StyledText>
    </View>
  );
}
