// src/screens/AddEventScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Crypto from 'expo-crypto';

import { RootStackParamList, CalendarEvent, EventType } from '../types';
import { useEvents } from '../store/EventsContext';
import { Colors, Radius, Shadow, Spacing, Typography } from '../utils/theme';
import { EVENT_TYPES, EVENT_TYPE_CONFIG, REMINDER_OPTIONS, formatEventDate } from '../utils/eventUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddEvent'>;

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function daysInMonth(month: number): number {
  return new Date(2000, month, 0).getDate();
}

export default function AddEventScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { saveEvent, getEventById } = useEvents();

  const eventId = route.params?.eventId;
  const existing = eventId ? getEventById(eventId) : undefined;

  const [personName, setPersonName] = useState(existing?.personName ?? '');
  const [type, setType] = useState<EventType>(existing?.type ?? 'Anniversaire');
  const [month, setMonth] = useState(existing?.month ?? new Date().getMonth() + 1);
  const [day, setDay] = useState(existing?.day ?? new Date().getDate());
  const [reminderDays, setReminderDays] = useState(existing?.reminderDays ?? 7);
  const [giftGiven, setGiftGiven] = useState(existing?.giftGiven ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const maxDay = daysInMonth(month);
  const safeDay = Math.min(day, maxDay);

  async function handleSave() {
    if (!personName.trim()) {
      Alert.alert('Champ requis', 'Entrez un nom.');
      return;
    }
    setSaving(true);
    try {
      const event: CalendarEvent = {
        id: existing?.id ?? Crypto.randomUUID(),
        personName: personName.trim(),
        type,
        month,
        day: safeDay,
        reminderDays,
        giftGiven: giftGiven.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };
      await saveEvent(event);
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('Erreur', `Impossible de sauvegarder.\n${msg}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Type */}
          <View style={styles.typeRow}>
            {EVENT_TYPES.map((t) => {
              const cfg = EVENT_TYPE_CONFIG[t];
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                  onPress={() => setType(t)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.typeEmoji}>{cfg.emoji}</Text>
                  <Text style={[styles.typeLabel, type === t && { color: cfg.color, fontWeight: '700' }]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.form}>
            {/* Nom */}
            <View style={styles.field}>
              <Text style={styles.label}>{type === 'Autre' ? '📝 Description' : '👤 Prénom / Nom'}</Text>
              <TextInput
                style={styles.input} value={personName} onChangeText={setPersonName}
                placeholder={type === 'Autre' ? 'Ex: Réunion de famille, Vacances…' : 'Ex: Mamie Suzanne'} placeholderTextColor={Colors.textTertiary} maxLength={50}
              />
            </View>

            {/* Date */}
            <View style={styles.field}>
              <Text style={styles.label}>📅 Date (jour et mois)</Text>
              <View style={styles.dateRow}>
                <View style={styles.dayContainer}>
                  <Text style={styles.dateLabel}>Jour</Text>
                  <View style={styles.dayButtons}>
                    <TouchableOpacity style={styles.dayArrow} onPress={() => setDay((d) => Math.max(1, d - 1))}>
                      <Text style={styles.dayArrowText}>‹</Text>
                    </TouchableOpacity>
                    <Text style={styles.dayValue}>{safeDay}</Text>
                    <TouchableOpacity style={styles.dayArrow} onPress={() => setDay((d) => Math.min(maxDay, d + 1))}>
                      <Text style={styles.dayArrowText}>›</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity style={styles.monthPicker} onPress={() => setShowMonthPicker(true)} activeOpacity={0.8}>
                  <Text style={styles.dateLabel}>Mois</Text>
                  <Text style={styles.monthValue}>{MONTHS[month - 1]}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.datePreview}>→ {formatEventDate(month, safeDay)}</Text>
            </View>

            {/* Rappel */}
            <View style={styles.field}>
              <Text style={styles.label}>🔔 Rappel avant l'événement</Text>
              <View style={styles.reminderRow}>
                {REMINDER_OPTIONS.map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.reminderBtn, reminderDays === d && styles.reminderBtnActive]}
                    onPress={() => setReminderDays(d)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.reminderText, reminderDays === d && styles.reminderTextActive]}>{d}j</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cadeau */}
            <View style={styles.field}>
              <Text style={styles.label}>🎁 Cadeau prévu / offert <Text style={styles.optional}>(optionnel)</Text></Text>
              <TextInput
                style={styles.input} value={giftGiven} onChangeText={setGiftGiven}
                placeholder="Ex: Bouquet de fleurs, Bon restaurant…"
                placeholderTextColor={Colors.textTertiary} maxLength={100}
              />
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={styles.label}>📝 Notes <Text style={styles.optional}>(optionnel)</Text></Text>
              <TextInput
                style={[styles.input, styles.inputMulti]} value={notes} onChangeText={setNotes}
                placeholder="Ex: Préfère les fleurs blanches…"
                placeholderTextColor={Colors.textTertiary} multiline maxLength={200}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave} disabled={saving} activeOpacity={0.85}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : (
              <Text style={styles.saveBtnText}>{existing ? 'Enregistrer les modifications' : 'Enregistrer'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Month modal */}
      <Modal visible={showMonthPicker} transparent animationType="slide" onRequestClose={() => setShowMonthPicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowMonthPicker(false)}>
          <View style={styles.monthSheet}>
            <Text style={styles.monthSheetTitle}>Choisir un mois</Text>
            {MONTHS.map((m, i) => (
              <TouchableOpacity
                key={m}
                style={[styles.monthOption, month === i + 1 && styles.monthOptionActive]}
                onPress={() => { setMonth(i + 1); setShowMonthPicker(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.monthOptionText, month === i + 1 && styles.monthOptionTextActive]}>{m}</Text>
                {month === i + 1 && <Text style={styles.monthCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 40 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.lg },
  typeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: Radius.full,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, ...Shadow.sm,
  },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '12' },
  typeEmoji: { fontSize: 16 },
  typeLabel: { ...Typography.captionMedium, color: Colors.textSecondary },
  form: { gap: Spacing.md },
  field: { gap: 6 },
  label: { ...Typography.captionMedium, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  optional: { textTransform: 'none', fontWeight: '400', color: Colors.textTertiary },
  input: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: Spacing.md,
    paddingVertical: 14, borderWidth: 1.5, borderColor: Colors.border, ...Typography.body, color: Colors.text,
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  dateRow: { flexDirection: 'row', gap: 10 },
  dayContainer: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1.5,
    borderColor: Colors.border, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center',
  },
  dateLabel: { ...Typography.caption, color: Colors.textTertiary, marginBottom: 4 },
  dayButtons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayArrow: { padding: 4 },
  dayArrowText: { fontSize: 22, color: Colors.primary, fontWeight: '600' },
  dayValue: { ...Typography.titleMedium, color: Colors.text, minWidth: 28, textAlign: 'center' },
  monthPicker: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, borderWidth: 1.5,
    borderColor: Colors.border, paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center',
  },
  monthValue: { ...Typography.bodyMedium, color: Colors.text, marginTop: 4 },
  datePreview: { ...Typography.caption, color: Colors.primary, marginTop: 4, marginLeft: 2 },
  reminderRow: { flexDirection: 'row', gap: 8 },
  reminderBtn: {
    flex: 1, paddingVertical: 10, borderRadius: Radius.md, backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
  },
  reminderBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  reminderText: { ...Typography.bodyMedium, color: Colors.textSecondary },
  reminderTextActive: { color: '#FFF', fontWeight: '700' },
  saveBtn: {
    marginTop: Spacing.xl, backgroundColor: Colors.primary, borderRadius: Radius.lg,
    paddingVertical: 16, alignItems: 'center', ...Shadow.md,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { ...Typography.bodyMedium, color: '#FFF', fontWeight: '700', fontSize: 16 },
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  monthSheet: {
    backgroundColor: Colors.surface, borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl, paddingTop: Spacing.lg, paddingBottom: 40,
  },
  monthSheetTitle: { ...Typography.titleMedium, color: Colors.text, textAlign: 'center', marginBottom: Spacing.sm },
  monthOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: Spacing.lg },
  monthOptionActive: { backgroundColor: Colors.primary + '10' },
  monthOptionText: { flex: 1, ...Typography.body, color: Colors.text },
  monthOptionTextActive: { color: Colors.primary, fontWeight: '600' },
  monthCheck: { fontSize: 16, color: Colors.primary, fontWeight: '700' },
});