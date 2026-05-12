// src/components/ui/GiftCard.tsx
//
// Carte cadeau format portrait (grille 2-col). Photo héroïsée en haut
// (aspect 4:5), nom serif au centre, donneur ou destinataire en
// sous-titre (préfixé d'une icône directionnelle), badge occasion en bas.

import React from 'react';
import { Image, TouchableOpacity, View, ViewStyle } from 'react-native';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { COLORS, OCCASIONS, RADIUS, SHADOWS, SPACING } from '../../utils/theme';
import { Gift } from '../../types';
import { OccasionBadge } from './OccasionBadge';
import { StyledText } from './StyledText';

type LucideIcon = React.ComponentType<{ color?: string; size?: number }>;
const InIcon = ArrowDownLeft as unknown as LucideIcon;
const OutIcon = ArrowUpRight as unknown as LucideIcon;

interface Props {
  gift: Gift;
  width: number;
  onPress: () => void;
}

export function GiftCard({ gift, width, onPress }: Props) {
  const occasion = OCCASIONS[gift.occasion] ?? OCCASIONS.Autre;
  const isGiven = gift.direction === 'given';
  const DirectionIcon = isGiven ? OutIcon : InIcon;

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
        {/* Direction badge in top-right corner */}
        <View
          style={{
            position: 'absolute',
            top: SPACING.sm,
            right: SPACING.sm,
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: 'rgba(253, 249, 244, 0.92)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel={isGiven ? 'Cadeau offert' : 'Cadeau reçu'}
        >
          <DirectionIcon color={COLORS.primary} size={14} />
        </View>
      </View>

      <View style={{ padding: SPACING.md, gap: SPACING.xs }}>
        <StyledText variant="h3" numberOfLines={2}>
          {gift.name}
        </StyledText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <StyledText variant="caption" color={COLORS.textTertiary}>
            {isGiven ? 'à' : 'de'}
          </StyledText>
          <StyledText
            variant="small"
            color={COLORS.textSecondary}
            numberOfLines={1}
            style={{ flexShrink: 1 }}
          >
            {gift.giver}
          </StyledText>
        </View>
        <View style={{ marginTop: SPACING.xs }}>
          <OccasionBadge occasion={gift.occasion} size="sm" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
