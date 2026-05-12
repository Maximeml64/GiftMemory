// src/screens/EventDetailScreen.tsx

import React from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList, Occasion } from '../types';
import { useEvents } from '../store/EventsContext';
import {
  Button,
  Card,
  InfoRow,
  OccasionBadge,
  StyledText,
} from '../components/ui';
import { COLORS, FONTS, OCCASIONS, RADIUS, SPACING } from '../utils/theme';
import { daysLabel, daysUntilNext, formatEventDate } from '../utils/eventUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'EventDetail'>;

const MONTH_LABELS_SHORT = [
  'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
  'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
];

function eventTypeToOccasion(type: 'Anniversaire' | 'Mariage' | 'Naissance' | 'Autre'): Occasion {
  if (type === 'Anniversaire' || type === 'Mariage' || type === 'Naissance') return type;
  return 'Autre';
}

export default function EventDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { getEventById, removeEvent } = useEvents();
  const event = getEventById(route.params.eventId);

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <StyledText variant="body" color={COLORS.textSecondary}>
            Événement introuvable
          </StyledText>
        </View>
      </SafeAreaView>
    );
  }

  const occ = OCCASIONS[eventTypeToOccasion(event.type)] ?? OCCASIONS.Autre;
  const days = daysUntilNext(event.month, event.day);
  const isToday = days === 0;

  function confirmDelete() {
    Alert.alert('Supprimer', `Supprimer l'événement de "${event!.personName}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await removeEvent(event!.id);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View
          style={{
            alignItems: 'center',
            paddingVertical: SPACING.xxl,
            paddingHorizontal: SPACING.lg,
            backgroundColor: occ.bg,
            gap: SPACING.md,
          }}
        >
          {/* Mini date tile */}
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: RADIUS.lg,
              backgroundColor: COLORS.surface,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <StyledText
              style={{
                fontFamily: FONTS.serifBold,
                fontSize: 36,
                lineHeight: 40,
                color: occ.color,
              }}
            >
              {event.day}
            </StyledText>
            <StyledText
              variant="caption"
              color={occ.color}
              style={{ textTransform: 'uppercase', letterSpacing: 1 }}
            >
              {MONTH_LABELS_SHORT[event.month - 1].replace('.', '')}
            </StyledText>
          </View>

          <View style={{ alignItems: 'center', gap: 4 }}>
            <StyledText variant="h1" align="center" color={occ.color}>
              {event.personName}
            </StyledText>
            <OccasionBadge occasion={eventTypeToOccasion(event.type)} />
          </View>

          <View
            style={{
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.lg,
              borderRadius: 999,
              backgroundColor: isToday ? occ.color : COLORS.surface,
            }}
          >
            <StyledText
              variant="bodyMedium"
              color={isToday ? COLORS.textInverse : occ.color}
            >
              {daysLabel(days)}
            </StyledText>
          </View>
        </View>

        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg }}>
          {/* Meta card */}
          <Card padding="none" style={{ overflow: 'hidden', marginBottom: SPACING.xl }}>
            <View style={{ paddingHorizontal: SPACING.base }}>
              <InfoRow label="Date" value={formatEventDate(event.month, event.day)} />
              <InfoRow
                label="Rappel"
                value={`${event.reminderDays} jour${event.reminderDays > 1 ? 's' : ''} avant`}
                divider={!!(event.giftGiven || event.notes)}
              />
              {event.giftGiven ? (
                <InfoRow label="Cadeau prévu / offert" value={event.giftGiven} divider={!!event.notes} />
              ) : null}
              {event.notes ? <InfoRow label="Notes" value={event.notes} divider={false} /> : null}
            </View>
          </Card>

          {/* Actions */}
          <View style={{ gap: SPACING.sm }}>
            <Button
              label="Modifier"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={() => navigation.navigate('AddEvent', { eventId: event.id })}
            />
            <Button
              label="Supprimer"
              variant="danger"
              size="lg"
              fullWidth
              onPress={confirmDelete}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
