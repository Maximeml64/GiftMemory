// src/components/ui/GiftCard.tsx
//
// Carte cadeau format portrait (grille 2-col). Photo héroïsée en haut
// (aspect 4:5), nom serif au centre, donneur en sous-titre, badge
// occasion en bas. Touchable.

import React from 'react';
import { Image, View, ViewStyle } from 'react-native';
import { COLORS, OCCASIONS, RADIUS, SHADOWS, SPACING } from '../../utils/theme';
import { Gift } from '../../types';
import { OccasionBadge } from './OccasionBadge';
import { StyledText } from './StyledText';
import { TouchableOpacity } from 'react-native';

interface Props {
  gift: Gift;
  width: number;
  onPress: () => void;
}

export function GiftCard({ gift, width, onPress }: Props) {
  const occasion = OCCASIONS[gift.occasion] ?? OCCASIONS.Autre;

  const containerStyle: ViewStyle = {
    width,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    ...SHADOWS.sm,
  };

  const imageHeight = Math.round(width * 1.05); // 4:5 aspect ratio approx (105%)

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={containerStyle}>
      <View style={{ width: '100%', height: imageHeight }}>
        {gift.imageUri ? (
          <Image
            source={{ uri: gift.imageUri }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: occasion.bg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <StyledText style={{ fontSize: 56, lineHeight: 64 }}>{occasion.emoji}</StyledText>
          </View>
        )}
      </View>

      <View style={{ padding: SPACING.md, gap: SPACING.xs }}>
        <StyledText variant="h3" numberOfLines={2}>
          {gift.name}
        </StyledText>
        <StyledText variant="small" color={COLORS.textSecondary} numberOfLines={1}>
          {gift.giver}
        </StyledText>
        <View style={{ marginTop: SPACING.xs }}>
          <OccasionBadge occasion={gift.occasion} size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
