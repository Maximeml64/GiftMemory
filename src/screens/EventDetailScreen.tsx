// src/screens/EventDetailScreen.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { useEvents } from '../store/EventsContext';
import { Colors, Radius, Shadow, Spacing, Typography } from '../utils/theme';
import { daysUntilNext, daysLabel, formatEventDate, EVENT_TYPE_CONFIG } from '../utils/eventUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'EventDetail'>;

export default function EventDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { getEventById, removeEvent } = useEvents();
  const event = getEventById(route.params.eventId);

  if (!event) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><Text style={styles.notFound}>Événement introuvable</Text></View>
      </SafeAreaView>
    );
  }

  const config = EVENT_TYPE_CONFIG[event.type];
  const days = daysUntilNext(event.month, event.day);
  const isToday = days === 0;

  function confirmDelete() {
    Alert.alert('Supprimer', `Supprimer l'événement de "${event!.personName}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await removeEvent(event!.id); navigation.goBack(); } },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: config.color + '18' }]}>
          <Text style={styles.heroEmoji}>{config.emoji}</Text>
          <Text style={styles.heroName}>{event.personName}</Text>
          <Text style={styles.heroType}>{event.type}</Text>
          <View style={[styles.countdownBadge, isToday && { backgroundColor: Colors.primary }]}>
            <Text style={[styles.countdownText, isToday && { color: '#FFF' }]}>{daysLabel(days)}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.metaCard}>
            <MetaRow icon="📅" label="Date" value={formatEventDate(event.month, event.day)} />
            <View style={styles.divider} />
            <MetaRow icon="🔔" label="Rappel" value={`${event.reminderDays} jour${event.reminderDays > 1 ? 's' : ''} avant`} />
            {event.giftGiven && (<><View style={styles.divider} /><MetaRow icon="🎁" label="Cadeau prévu / offert" value={event.giftGiven} /></>)}
            {event.notes && (<><View style={styles.divider} /><MetaRow icon="📝" label="Notes" value={event.notes} /></>)}
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('AddEvent', { eventId: event.id })} activeOpacity={0.85}>
            <Text style={styles.editBtnText}>✏️  Modifier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} activeOpacity={0.85}>
            <Text style={styles.deleteBtnText}>🗑  Supprimer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={metaStyles.row}>
      <Text style={metaStyles.icon}>{icon}</Text>
      <View style={metaStyles.text}>
        <Text style={metaStyles.label}>{label}</Text>
        <Text style={metaStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: Spacing.md },
  icon: { fontSize: 20, marginRight: 12 },
  text: { flex: 1 },
  label: { ...Typography.caption, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  value: { ...Typography.bodyMedium, color: Colors.text },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { ...Typography.body, color: Colors.textSecondary },
  scroll: { paddingBottom: 40 },
  hero: { alignItems: 'center', paddingVertical: Spacing.xxl, paddingHorizontal: Spacing.lg },
  heroEmoji: { fontSize: 72, marginBottom: Spacing.sm },
  heroName: { ...Typography.displayMedium, color: Colors.text, textAlign: 'center' },
  heroType: { ...Typography.body, color: Colors.textSecondary, marginTop: 4, marginBottom: Spacing.md },
  countdownBadge: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: Radius.full, backgroundColor: Colors.shimmer },
  countdownText: { ...Typography.bodyMedium, color: Colors.text, fontWeight: '700' },
  content: { padding: Spacing.lg },
  metaCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.lg, ...Shadow.sm, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  editBtn: { backgroundColor: Colors.surface, borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center', marginBottom: Spacing.sm, borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm },
  editBtnText: { ...Typography.bodyMedium, color: Colors.text, fontWeight: '600' },
  deleteBtn: { backgroundColor: Colors.dangerLight, borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.danger + '30' },
  deleteBtnText: { ...Typography.bodyMedium, color: Colors.danger, fontWeight: '600' },
});