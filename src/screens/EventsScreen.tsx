// src/screens/EventsScreen.tsx

import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { useEvents } from '../store/EventsContext';
import { usePremiumGate } from '../hooks/usePremiumGate';
import {
  EmptyState,
  EventCountdownCard,
  FAB,
  ScreenWrapper,
  StyledText,
} from '../components/ui';
import { COLORS, SPACING } from '../utils/theme';
import { daysUntilNext, sortEventsByNext } from '../utils/eventUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SCREEN_PADDING = SPACING.lg;

export default function EventsScreen() {
  const navigation = useNavigation<Nav>();
  const { events, loading } = useEvents();
  const { checkEventLimit } = usePremiumGate();

  const sorted = useMemo(() => sortEventsByNext(events), [events]);

  const goAdd = () => {
    if (checkEventLimit()) navigation.navigate('AddEvent', undefined);
  };

  if (loading) {
    return (
      <ScreenWrapper padded={false}>
        <View style={{ paddingHorizontal: SCREEN_PADDING, paddingTop: SPACING.sm }}>
          <StyledText variant="display">Événements</StyledText>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper padded={false}>
      <View style={{ paddingHorizontal: SCREEN_PADDING, paddingTop: SPACING.sm }}>
        <StyledText variant="display" style={{ marginBottom: 2 }}>
          Événements
        </StyledText>
        <StyledText variant="small" color={COLORS.textSecondary}>
          {events.length === 0
            ? 'Aucun rappel'
            : `${events.length} rappel${events.length > 1 ? 's' : ''} annuel${events.length > 1 ? 's' : ''}`}
        </StyledText>
      </View>

      {events.length === 0 ? (
        <EmptyState
          emoji="🎂"
          title="Aucun événement"
          description="Ajoutez des anniversaires ou événements pour recevoir un rappel chaque année."
          ctaLabel="Ajouter un événement"
          onCtaPress={goAdd}
        />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING,
            paddingTop: SPACING.lg,
            paddingBottom: 120,
            gap: SPACING.sm,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <EventCountdownCard
              event={item}
              daysUntil={daysUntilNext(item.month, item.day)}
              onPress={() =>
                navigation.navigate('EventDetail', { eventId: item.id, backTitle: 'Événements' })
              }
            />
          )}
        />
      )}

      <FAB onPress={goAdd} accessibilityLabel="Ajouter un événement" />
    </ScreenWrapper>
  );
}
