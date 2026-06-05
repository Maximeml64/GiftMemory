// src/screens/AddEventScreen.tsx

import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHeaderHeight } from '@react-navigation/elements';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';

import { RootStackParamList, CalendarEvent, EventType } from '../types';
import { useEvents } from '../store/EventsContext';
import {
  Button,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StyledText,
} from '../components/ui';
import { COLORS, OCCASIONS, RADIUS, SHADOWS, SPACING } from '../utils/theme';
import {
  EVENT_TYPES,
  REMINDER_OPTIONS,
  eventTypeToOccasion,
  formatEventDate,
  formatTime,
  reminderLabel,
} from '../utils/eventUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddEvent'>;

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function daysInMonth(month: number): number {
  return new Date(2000, month, 0).getDate();
}

function FieldLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: SPACING.xs, marginBottom: SPACING.xs }}>
      <StyledText variant="eyebrow">{children}</StyledText>
      {optional ? (
        <StyledText variant="caption" color={COLORS.textTertiary}>(optionnel)</StyledText>
      ) : null}
    </View>
  );
}

const fieldInputStyle = {
  backgroundColor: COLORS.surface,
  borderRadius: RADIUS.md,
  paddingHorizontal: SPACING.md,
  paddingVertical: 14,
  borderWidth: 1,
  borderColor: COLORS.border,
  fontFamily: 'Inter_400Regular',
  fontSize: 15,
  lineHeight: 22,
  color: COLORS.text,
};

const SCREEN_PADDING = SPACING.lg;

export default function AddEventScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const headerHeight = useHeaderHeight();
  const { saveEvent, getEventById } = useEvents();

  const eventId = route.params?.eventId;
  const existing = eventId ? getEventById(eventId) : undefined;

  const [personName, setPersonName] = useState(existing?.personName ?? '');
  const [type, setType] = useState<EventType>(existing?.type ?? 'Anniversaire');
  const [month, setMonth] = useState(existing?.month ?? new Date().getMonth() + 1);
  const [day, setDay] = useState(existing?.day ?? new Date().getDate());
  const [weddingYear, setWeddingYear] = useState(
    existing?.year != null ? String(existing.year) : '',
  );
  const [birthYear, setBirthYear] = useState(
    existing?.birthYear != null ? String(existing.birthYear) : '',
  );
  const [reminderDays, setReminderDays] = useState(existing?.reminderDays ?? 7);
  const [reminderHour, setReminderHour] = useState(existing?.reminderHour ?? 9);
  const [reminderMinute, setReminderMinute] = useState(existing?.reminderMinute ?? 0);
  const [giftGiven, setGiftGiven] = useState(existing?.giftGiven ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const maxDay = daysInMonth(month);
  const safeDay = Math.min(day, maxDay);

  async function handleSave() {
    if (!personName.trim()) {
      Alert.alert('Champ requis', 'Entrez un nom.');
      return;
    }
    const wy = parseInt(weddingYear, 10);
    const by = parseInt(birthYear, 10);
    const thisYear = new Date().getFullYear();
    setSaving(true);
    try {
      const event: CalendarEvent = {
        id: existing?.id ?? Crypto.randomUUID(),
        personName: personName.trim(),
        type,
        month,
        day: safeDay,
        // Mariage = événement ponctuel daté (année requise pour viser la bonne année).
        year:
          type === 'Mariage' && Number.isInteger(wy) && wy >= thisYear && wy <= thisYear + 20
            ? wy
            : undefined,
        // Anniversaire = âge optionnel.
        birthYear:
          type === 'Anniversaire' && Number.isInteger(by) && by >= 1900 && by <= thisYear
            ? by
            : undefined,
        reminderDays,
        reminderHour,
        reminderMinute,
        giftGiven: giftGiven.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };
      await saveEvent(event);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Erreur', `Impossible de sauvegarder.\n${msg}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING,
            paddingTop: SPACING.md,
            paddingBottom: 80,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {/* Type chips */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl }}>
            {EVENT_TYPES.map((t) => {
              const active = type === t;
              const colors = OCCASIONS[eventTypeToOccasion(t)];
              return (
                <TouchableOpacity
                  key={t}
                  activeOpacity={0.8}
                  onPress={() => setType(t)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: SPACING.xs,
                    paddingVertical: SPACING.sm - 2,
                    paddingHorizontal: SPACING.md,
                    borderRadius: RADIUS.full,
                    backgroundColor: active ? colors.bg : COLORS.surface,
                    borderWidth: 1,
                    borderColor: active ? colors.color : COLORS.border,
                  }}
                >
                  <StyledText style={{ fontSize: 14 }}>{colors.emoji}</StyledText>
                  <StyledText
                    variant="smallMedium"
                    color={active ? colors.color : COLORS.textSecondary}
                  >
                    {t}
                  </StyledText>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ gap: SPACING.lg }}>
            {/* Nom */}
            <View>
              <FieldLabel>{type === 'Autre' ? 'Description' : 'Prénom / Nom'}</FieldLabel>
              <TextInput
                style={fieldInputStyle}
                value={personName}
                onChangeText={setPersonName}
                placeholder={type === 'Autre' ? 'Ex: Réunion de famille, Vacances…' : 'Ex: Mamie Suzanne'}
                placeholderTextColor={COLORS.textTertiary}
                maxLength={50}
              />
            </View>

            {/* Date */}
            <View>
              <FieldLabel>{type === 'Mariage' ? 'Date du mariage' : 'Date (jour et mois)'}</FieldLabel>
              <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                {/* Day stepper */}
                <View
                  style={{
                    backgroundColor: COLORS.surface,
                    borderRadius: RADIUS.md,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    paddingVertical: SPACING.sm,
                    paddingHorizontal: SPACING.md,
                    alignItems: 'center',
                    minWidth: 130,
                  }}
                >
                  <StyledText variant="caption" color={COLORS.textTertiary}>Jour</StyledText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginTop: 4 }}>
                    <TouchableOpacity
                      hitSlop={8}
                      onPress={() => setDay((d) => Math.max(1, d - 1))}
                    >
                      <ChevronLeftIcon color={COLORS.primary} size={20} />
                    </TouchableOpacity>
                    <StyledText variant="numericMedium" style={{ minWidth: 28, textAlign: 'center' }}>
                      {safeDay}
                    </StyledText>
                    <TouchableOpacity
                      hitSlop={8}
                      onPress={() => setDay((d) => Math.min(maxDay, d + 1))}
                    >
                      <ChevronRightIcon color={COLORS.primary} size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
                {/* Month picker */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setShowMonthPicker(true)}
                  style={{
                    flex: 1,
                    backgroundColor: COLORS.surface,
                    borderRadius: RADIUS.md,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    paddingVertical: SPACING.sm,
                    paddingHorizontal: SPACING.md,
                    alignItems: 'center',
                  }}
                >
                  <StyledText variant="caption" color={COLORS.textTertiary}>Mois</StyledText>
                  <StyledText variant="bodyMedium" style={{ marginTop: 4 }}>
                    {MONTHS[month - 1]}
                  </StyledText>
                </TouchableOpacity>
              </View>
              <StyledText
                variant="small"
                color={COLORS.primary}
                style={{ marginTop: SPACING.xs, marginLeft: 2 }}
              >
                → {formatEventDate(month, safeDay)}
                {type === 'Mariage' && weddingYear ? ` ${weddingYear}` : ''}
              </StyledText>
            </View>

            {/* Année — mariage (date ponctuelle) */}
            {type === 'Mariage' ? (
              <View>
                <FieldLabel>Année</FieldLabel>
                <TextInput
                  style={fieldInputStyle}
                  value={weddingYear}
                  onChangeText={(t) => setWeddingYear(t.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder={`Ex: ${new Date().getFullYear() + 1}`}
                  placeholderTextColor={COLORS.textTertiary}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                <StyledText variant="caption" color={COLORS.textTertiary} style={{ marginTop: SPACING.xs, marginLeft: 2 }}>
                  Le mariage peut être à plus d'un an.
                </StyledText>
              </View>
            ) : null}

            {/* Année de naissance — anniversaire (âge) */}
            {type === 'Anniversaire' ? (
              <View>
                <FieldLabel optional>Année de naissance</FieldLabel>
                <TextInput
                  style={fieldInputStyle}
                  value={birthYear}
                  onChangeText={(t) => setBirthYear(t.replace(/[^0-9]/g, '').slice(0, 4))}
                  placeholder="Ex: 1990"
                  placeholderTextColor={COLORS.textTertiary}
                  keyboardType="number-pad"
                  maxLength={4}
                />
                <StyledText variant="caption" color={COLORS.textTertiary} style={{ marginTop: SPACING.xs, marginLeft: 2 }}>
                  Pour afficher l'âge. Laisser vide si inconnu.
                </StyledText>
              </View>
            ) : null}

            {/* Rappel */}
            <View>
              <FieldLabel>Rappel</FieldLabel>
              <View style={{ flexDirection: 'row', gap: SPACING.xs }}>
                {REMINDER_OPTIONS.map((d) => {
                  const active = reminderDays === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      activeOpacity={0.8}
                      onPress={() => setReminderDays(d)}
                      style={{
                        flex: 1,
                        paddingVertical: SPACING.sm + 2,
                        borderRadius: RADIUS.md,
                        backgroundColor: active ? COLORS.primary : COLORS.surface,
                        borderWidth: 1,
                        borderColor: active ? COLORS.primary : COLORS.border,
                        alignItems: 'center',
                      }}
                    >
                      <StyledText
                        variant="smallMedium"
                        color={active ? COLORS.textInverse : COLORS.textSecondary}
                      >
                        {reminderLabel(d)}
                      </StyledText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Heure du rappel */}
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setShowTimePicker(true)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.md,
                  paddingHorizontal: SPACING.md,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  marginTop: SPACING.sm,
                }}
              >
                <StyledText variant="body" color={COLORS.textSecondary}>
                  {reminderDays === 0 ? 'Notifié le jour J à' : 'Notifié à'}
                </StyledText>
                <StyledText variant="bodyMedium" color={COLORS.primary}>
                  {formatTime(reminderHour, reminderMinute)}
                </StyledText>
              </TouchableOpacity>
            </View>

            {/* Cadeau */}
            <View>
              <FieldLabel optional>Cadeau prévu / offert</FieldLabel>
              <TextInput
                style={fieldInputStyle}
                value={giftGiven}
                onChangeText={setGiftGiven}
                placeholder="Ex: Bouquet de fleurs, Bon restaurant…"
                placeholderTextColor={COLORS.textTertiary}
                maxLength={100}
              />
            </View>

            {/* Notes */}
            <View>
              <FieldLabel optional>Notes</FieldLabel>
              <TextInput
                style={[fieldInputStyle, { height: 80, textAlignVertical: 'top' }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Ex: Préfère les fleurs blanches…"
                placeholderTextColor={COLORS.textTertiary}
                multiline
                maxLength={200}
              />
            </View>
          </View>

          <View style={{ marginTop: SPACING.xxl }}>
            <Button
              label={existing ? 'Enregistrer les modifications' : 'Enregistrer'}
              onPress={handleSave}
              loading={saving}
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Month modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <Pressable
          onPress={() => setShowMonthPicker(false)}
          style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' }}
        >
          <View
            style={{
              backgroundColor: COLORS.surface,
              borderTopLeftRadius: RADIUS.xxl,
              borderTopRightRadius: RADIUS.xxl,
              paddingTop: SPACING.lg,
              paddingBottom: 40,
              ...SHADOWS.xl,
            }}
          >
            <StyledText variant="h3" align="center" style={{ marginBottom: SPACING.md }}>
              Choisir un mois
            </StyledText>
            {MONTHS.map((m, i) => {
              const selected = month === i + 1;
              return (
                <TouchableOpacity
                  key={m}
                  activeOpacity={0.7}
                  onPress={() => { setMonth(i + 1); setShowMonthPicker(false); }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: SPACING.md,
                    paddingHorizontal: SPACING.lg,
                    backgroundColor: selected ? COLORS.primaryMuted : 'transparent',
                  }}
                >
                  <StyledText
                    variant={selected ? 'bodyMedium' : 'body'}
                    color={selected ? COLORS.primary : COLORS.text}
                    style={{ flex: 1 }}
                  >
                    {m}
                  </StyledText>
                  {selected ? <CheckIcon color={COLORS.primary} size={20} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      {/* Time modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <Pressable
          onPress={() => setShowTimePicker(false)}
          style={{ flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: COLORS.surface,
              borderTopLeftRadius: RADIUS.xxl,
              borderTopRightRadius: RADIUS.xxl,
              padding: SPACING.lg,
              paddingBottom: 40,
              ...SHADOWS.xl,
            }}
          >
            <StyledText variant="h3" align="center" style={{ marginBottom: SPACING.md }}>
              Heure du rappel
            </StyledText>

            <View style={{ flexDirection: 'row', height: 200, gap: SPACING.md }}>
              {/* Hours */}
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {Array.from({ length: 24 }, (_, h) => {
                  const selected = reminderHour === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      activeOpacity={0.7}
                      onPress={() => setReminderHour(h)}
                      style={{
                        paddingVertical: SPACING.sm + 2,
                        borderRadius: RADIUS.md,
                        backgroundColor: selected ? COLORS.primaryMuted : 'transparent',
                        alignItems: 'center',
                      }}
                    >
                      <StyledText
                        variant={selected ? 'bodyMedium' : 'body'}
                        color={selected ? COLORS.primary : COLORS.text}
                      >
                        {h.toString().padStart(2, '0')} h
                      </StyledText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              {/* Minutes (pas de 5) */}
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => {
                  const selected = reminderMinute === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      activeOpacity={0.7}
                      onPress={() => setReminderMinute(m)}
                      style={{
                        paddingVertical: SPACING.sm + 2,
                        borderRadius: RADIUS.md,
                        backgroundColor: selected ? COLORS.primaryMuted : 'transparent',
                        alignItems: 'center',
                      }}
                    >
                      <StyledText
                        variant={selected ? 'bodyMedium' : 'body'}
                        color={selected ? COLORS.primary : COLORS.text}
                      >
                        {m.toString().padStart(2, '0')} min
                      </StyledText>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={{ marginTop: SPACING.lg }}>
              <Button label="Confirmer" onPress={() => setShowTimePicker(false)} fullWidth />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
