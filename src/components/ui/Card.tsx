// src/components/ui/Card.tsx
//
// Carte conteneur. Variants : 'flat' (pas d'ombre), 'soft' (ombre douce sm),
// 'raised' (ombre md). Padding par défaut 16, désactivable.

import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../../utils/theme';

type Variant = 'flat' | 'soft' | 'raised';

interface Props {
  variant?: Variant;
  padding?: keyof typeof SPACING | 'none';
  onPress?: () => void;
  bordered?: boolean;
  background?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
  accessibilityLabel?: string;
  testID?: string;
}

export function Card({
  variant = 'soft',
  padding = 'base',
  onPress,
  bordered = false,
  background,
  style,
  children,
  accessibilityLabel,
  testID,
}: Props) {
  const cardStyle: ViewStyle = {
    backgroundColor: background ?? COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: padding === 'none' ? 0 : SPACING[padding],
    ...(bordered ? { borderWidth: 1, borderColor: COLORS.border } : {}),
    ...(variant === 'soft' ? SHADOWS.sm : variant === 'raised' ? SHADOWS.md : {}),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[cardStyle, style]}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]} accessibilityLabel={accessibilityLabel} testID={testID}>
      {children}
    </View>
  );
}
