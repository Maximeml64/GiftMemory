// src/screens/EventsScreen.tsx

import React, { useCallback, useMemo, useRef } from 'react';
import { ActivityIndicator, Alert, FlatList, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CalendarEvent, RootStackParamList } from '../types';
import { useEvents } from '../store/EventsContext';
import { usePremiumGate } from '../hooks/usePremiumGate';
import {
  EmptyState,
  EventCountdownCard,
  FAB,
  ScreenWrapper,
  StyledText,
} from '../components/ui';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';
import { daysUntilNext, sortEventsByNext } from '../utils/eventUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SCREEN_PADDING = SPACING.lg;

// ==================== SWIPE-TO-DELETE ROW ====================

interface SwipeableEventRowProps {
  event: CalendarEvent;
  onPress: () => void;
  onDelete: () => void;
}

function SwipeableEventRow({ event, onPress, onDelete }: SwipeableEventRowProps) {
  const swipeRef = useRef<Swipeable>(null);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      'Supprimer',
      `Supprimer l'événement de "${event.personName}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => swipeRef.current?.close(),
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            swipeRef.current?.close();
            onDelete();
          },
        },
      ],
    );
  }, [event.personName, onDelete]);

  const renderRightActions = useCallback(() => (
    <TouchableOpacity
      onPress={confirmDelete}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Supprimer l'événement"
      style={{
        width: 84,
        backgroundColor: COLORS.danger,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
      }}
    >
      <Trash2 color="#fff" size={22} />
      <StyledText variant="caption" color="#fff" style={{ fontWeight: '700', letterSpacing: 0.3 }}>
        Supprimer
      </StyledText>
    </TouchableOpacity>
  ), [confirmDelete]);

  return (
    <View
      style={{
        borderRadius: RADIUS.lg,
        overflow: 'hidden',
        backgroundColor: COLORS.surface,
        ...SHADOWS.sm,
      }}
    >
      <Swipeable
        ref={swipeRef}
        renderRightActions={renderRightActions}
        rightThreshold={40}
        friction={2}
        overshootRight={false}
      >
        <EventCountdownCard
          event={event}
          daysUntil={daysUntilNext(event.month, event.day)}
          onPress={onPress}
        />
      </Swipeable>
    </View>
  );
}

export default function EventsScreen() {
  const navigation = useNavigation<Nav>();
  const { events, loading, removeEvent } = useEvents();
  const { checkEventLimit } = usePremiumGate();

  const sorted = useMemo(() => sortEventsByNext(events), [events]);

  const goAdd = () => {
    if (checkEventLimit()) navigation.navigate('AddEvent', undefined);
  };

  const handleDelete = useCallback(async (eventId: string) => {
    try {
      await removeEvent(eventId);
    } catch {
      Alert.alert('Erreur', "Impossible de supprimer l'événement.");
    }
  }, [removeEvent]);

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
            <SwipeableEventRow
              event={item}
              onPress={() =>
                navigation.navigate('EventDetail', { eventId: item.id, backTitle: 'Événements' })
              }
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      )}

      <FAB onPress={goAdd} accessibilityLabel="Ajouter un événement" />
    </ScreenWrapper>
  );
}
