// src/components/ui/EmptyState.tsx
//
// État vide : emoji ou icône Lucide, titre éditorial, description, CTA optionnel.

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../utils/theme';
import { Button } from './Button';
import { StyledText } from './StyledText';

interface Props {
  emoji?: string;
  icon?: React.ReactNode;
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  paddingVertical?: number;
}

export function EmptyState({
  emoji,
  icon,
  title,
  description,
  ctaLabel,
  onCtaPress,
  paddingVertical = SPACING.huge,
}: Props) {
  const containerStyle: ViewStyle = {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical,
    gap: SPACING.md,
  };

  return (
    <View style={containerStyle}>
      {emoji ? (
        <StyledText style={{ fontSize: 56, lineHeight: 64 }}>{emoji}</StyledText>
      ) : icon ? (
        <View style={{ marginBottom: SPACING.xs }}>{icon}</View>
      ) : null}
      <StyledText variant="h2" align="center" color={COLORS.text}>
        {title}
      </StyledText>
      {description ? (
        <StyledText
          variant="body"
          align="center"
          color={COLORS.textSecondary}
          style={{ maxWidth: 320 }}
        >
          {description}
        </StyledText>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <View style={{ marginTop: SPACING.md }}>
          <Button label={ctaLabel} onPress={onCtaPress} variant="primary" />
        </View>
      ) : null}
    </View>
  );
}
