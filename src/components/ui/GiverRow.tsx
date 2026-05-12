// src/components/ui/GiverRow.tsx
//
// Ligne donneur : Avatar + nom + compte cadeaux + chevron droit.
// Utilisée dans la tab Givers.

import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS, SPACING } from '../../utils/theme';
import { Avatar } from './Avatar';
import { StyledText } from './StyledText';

// lucide-react-native ships with web-leaning types; cast to a minimal RN-compatible signature.
const ChevronIcon = ChevronRight as unknown as React.ComponentType<{ color?: string; size?: number }>;

interface Props {
  name: string;
  giftCount: number;
  onPress: () => void;
}

export function GiverRow({ name, giftCount, onPress }: Props) {
  const countLabel = giftCount === 0
    ? 'Aucun cadeau'
    : `${giftCount} cadeau${giftCount > 1 ? 'x' : ''}`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
      }}
    >
      <Avatar name={name} size={44} />

      <View style={{ flex: 1, gap: 2 }}>
        <StyledText variant="bodyMedium" numberOfLines={1}>
          {name}
        </StyledText>
        <StyledText variant="small" color={COLORS.textSecondary}>
          {countLabel}
        </StyledText>
      </View>

      <ChevronIcon color={COLORS.textTertiary} size={20} />
    </TouchableOpacity>
  );
}
