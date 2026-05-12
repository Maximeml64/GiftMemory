// src/components/ui/SectionHeader.tsx
//
// En-tête de section : eyebrow optionnel + titre serif + action droite optionnelle.

import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { COLORS, SPACING } from '../../utils/theme';
import { StyledText } from './StyledText';

interface Props {
  eyebrow?: string;
  title: string;
  action?: { label: string; onPress: () => void };
  serif?: boolean;
}

export function SectionHeader({ eyebrow, title, action, serif = true }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: SPACING.md,
        marginTop: SPACING.lg,
      }}
    >
      <View style={{ flex: 1 }}>
        {eyebrow ? (
          <StyledText variant="eyebrow" style={{ marginBottom: SPACING.xs }}>
            {eyebrow}
          </StyledText>
        ) : null}
        <StyledText variant={serif ? 'h3' : 'title'}>{title}</StyledText>
      </View>
      {action ? (
        <TouchableOpacity onPress={action.onPress} hitSlop={8}>
          <StyledText variant="smallMedium" color={COLORS.primary}>
            {action.label}
          </StyledText>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
