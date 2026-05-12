// src/components/ui/EventCountdownCard.tsx
//
// Card pour la liste des événements à venir. Compteur en numericLarge,
// nom personne en titre serif, type d'événement en badge, date pleine.

import React from 'react';
import { View } from 'react-native';
import { COLORS, FONTS, OCCASIONS, SPACING } from '../../utils/theme';
import { CalendarEvent, Occasion } from '../../types';
import { Card } from './Card';
import { OccasionBadge } from './OccasionBadge';
import { StyledText } from './StyledText';

interface Props {
  event: CalendarEvent;
  daysUntil: number; // 0 = aujourd'hui, négatif = passé
  onPress: () => void;
  ideaCount?: number;
  lastYearGiftName?: string;
}

const MONTH_LABELS = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

// EventType -> Occasion mapping (les types coïncident sauf "Mariage" et "Naissance")
function eventTypeToOccasion(type: CalendarEvent['type']): Occasion {
  if (type === 'Anniversaire' || type === 'Mariage' || type === 'Naissance') {
    return type;
  }
  return 'Autre';
}

export function EventCountdownCard({ event, daysUntil, onPress, ideaCount, lastYearGiftName }: Props) {
  const occasion = OCCASIONS[eventTypeToOccasion(event.type)] ?? OCCASIONS.Autre;
  const isToday = daysUntil === 0;
  const isPast = daysUntil < 0;
  const dateLabel = `${event.day} ${MONTH_LABELS[event.month - 1]}`;

  const countdownLabel = isToday
    ? "aujourd'hui"
    : isPast
      ? `${Math.abs(daysUntil)} j passés`
      : `dans ${daysUntil} j`;

  return (
    <Card onPress={onPress} padding="base">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.base }}>
        {/* Tile date — colored block */}
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 14,
            backgroundColor: occasion.bg,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <StyledText
            style={{
              fontFamily: FONTS.serifSemiBold,
              fontSize: 26,
              lineHeight: 28,
              color: occasion.color,
            }}
          >
            {event.day}
          </StyledText>
          <StyledText
            variant="caption"
            color={occasion.color}
            style={{ textTransform: 'uppercase', letterSpacing: 1 }}
          >
            {MONTH_LABELS[event.month - 1].replace('.', '')}
          </StyledText>
        </View>

        {/* Right column — info */}
        <View style={{ flex: 1, gap: SPACING.xs }}>
          <StyledText variant="h3" numberOfLines={1}>
            {event.personName}
          </StyledText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
            <OccasionBadge occasion={eventTypeToOccasion(event.type)} size="sm" />
          </View>
          <StyledText
            variant="smallMedium"
            color={isToday ? COLORS.primary : isPast ? COLORS.textTertiary : COLORS.textSecondary}
          >
            {countdownLabel} · {dateLabel}
          </StyledText>
        </View>
      </View>

      {ideaCount || lastYearGiftName ? (
        <View
          style={{
            marginTop: SPACING.sm,
            paddingTop: SPACING.sm,
            borderTopWidth: 0.5,
            borderTopColor: COLORS.border,
            gap: 2,
          }}
        >
          {ideaCount ? (
            <StyledText variant="caption" color={COLORS.primary}>
              💡 {ideaCount} idée{ideaCount > 1 ? 's' : ''} notée{ideaCount > 1 ? 's' : ''}
            </StyledText>
          ) : null}
          {lastYearGiftName ? (
            <StyledText variant="caption" color={COLORS.textTertiary} numberOfLines={1}>
              L'an dernier : {lastYearGiftName}
            </StyledText>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
