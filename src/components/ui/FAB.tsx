// src/components/ui/FAB.tsx
//
// Floating Action Button : icône Lucide centrée sur cercle prune.
// Position : absolute bottom-right par défaut, override possible.

import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { Plus } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../utils/theme';

interface Props {
  onPress: () => void;
  icon?: React.ComponentType<{ color?: string; size?: number }>;
  size?: number;
  bottom?: number;
  right?: number;
  background?: string;
  iconColor?: string;
  accessibilityLabel?: string;
}

export function FAB({
  onPress,
  icon: Icon = Plus,
  size = 56,
  bottom = SPACING.xl,
  right = SPACING.lg,
  background,
  iconColor,
  accessibilityLabel = 'Ajouter',
}: Props) {
  const buttonStyle: ViewStyle = {
    position: 'absolute',
    bottom,
    right,
    width: size,
    height: size,
    borderRadius: RADIUS.full,
    backgroundColor: background ?? COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={buttonStyle}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Icon color={iconColor ?? COLORS.textInverse} size={26} />
    </TouchableOpacity>
  );
}
