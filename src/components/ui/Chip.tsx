// src/components/ui/Chip.tsx
//
// Chip sélectionnable (filtre, choix unique). Style soft + bordure
// quand sélectionné, plat sinon.

import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';
import { StyledText } from './StyledText';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function Chip({ label, selected = false, onPress, icon, disabled = false }: Props) {
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm - 2,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: selected ? COLORS.primary : COLORS.border,
    backgroundColor: selected ? COLORS.primaryMuted : COLORS.surface,
    opacity: disabled ? 0.4 : 1,
    alignSelf: 'flex-start',
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || !onPress}
      style={containerStyle}
    >
      {icon}
      <StyledText
        variant="smallMedium"
        color={selected ? COLORS.primary : COLORS.textSecondary}
      >
        {label}
      </StyledText>
    </TouchableOpacity>
  );
}
