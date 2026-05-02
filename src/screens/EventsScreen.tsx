// src/screens/EventsScreen.tsx

import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { useEvents } from '../store/EventsContext';
import { usePremiumGate } from '../hooks/usePremiumGate';
import FAB from '../components/FAB';
import EmptyState from '../components/EmptyState';
import { Colors, Radius, Shadow, Spacing, Typography } from '../utils/theme';
import { sortEventsByNext, daysUntilNext, daysLabel, formatEventDate, EVENT_TYPE_CONFIG } from '../utils/eventUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EventsScreen() {
  const navigation = useNavigation<Nav>();
  const { events, loading } = useEvents();
  const { checkEventLimit } = usePremiumGate();
  const sorted = useMemo(() => sortEventsByNext(events), [events]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Événements</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (events.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Événements</Text>
          <Text style={styles.subtitle}>Rappels annuels</Text>
        </View>
        <EmptyState
          emoji="🎂"
          title="Aucun événement"
          subtitle="Ajoutez des anniversaires et événements pour recevoir des rappels."
        />
        <FAB onPress={() => { if (checkEventLimit()) navigation.navigate('AddEvent', undefined); }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Événements</Text>
        <Text style={styles.subtitle}>{events.length} événement{events.length !== 1 ? 's' : ''}</Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const days = daysUntilNext(item.month, item.day);
          const config = EVENT_TYPE_CONFIG[item.type];
          const isToday = days === 0;
          const isSoon = days <= 7;

          return (
            <TouchableOpacity
              style={[styles.card, isToday && styles.cardToday]}
              onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
              activeOpacity={0.8}
            >
              <View style={[styles.countdownBox, { backgroundColor: config.color + '18' }]}>
                <Text style={styles.emoji}>{config.emoji}</Text>
                <Text style={[styles.daysNumber, { color: config.color }]}>
                  {isToday ? '🎉' : days}
                </Text>
                {!isToday && <Text style={styles.daysWord}>j</Text>}
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.personName}>{item.personName}</Text>
                <Text style={styles.eventType}>{item.type} • {formatEventDate(item.month, item.day)}</Text>
                {item.giftGiven ? <Text style={styles.giftTag}>🎁 {item.giftGiven}</Text> : null}
              </View>

              <View style={[styles.badge, isToday && styles.badgeToday, isSoon && !isToday && styles.badgeSoon]}>
                <Text style={[styles.badgeText, (isToday || isSoon) && styles.badgeTextHighlight]}>
                  {daysLabel(days)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <FAB onPress={() => { if (checkEventLimit()) navigation.navigate('AddEvent', undefined); }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  title: { ...Typography.displayMedium, color: Colors.text },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.sm,
  },
  cardToday: { borderWidth: 2, borderColor: Colors.primary },
  countdownBox: {
    width: 56, height: 56, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  emoji: { fontSize: 18 },
  daysNumber: { fontSize: 16, fontWeight: '800', lineHeight: 18 },
  daysWord: { fontSize: 10, color: Colors.textTertiary },
  cardInfo: { flex: 1 },
  personName: { ...Typography.bodyMedium, color: Colors.text },
  eventType: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  giftTag: { ...Typography.caption, color: Colors.primary, marginTop: 3 },
  badge: {
    paddingVertical: 4, paddingHorizontal: 8,
    borderRadius: Radius.full, backgroundColor: Colors.shimmer, maxWidth: 90,
  },
  badgeToday: { backgroundColor: Colors.primary },
  badgeSoon: { backgroundColor: Colors.primary + '20' },
  badgeText: { ...Typography.captionMedium, color: Colors.textSecondary, textAlign: 'center' },
  badgeTextHighlight: { color: Colors.primary },
});
