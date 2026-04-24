// src/components/DatePickerField.tsx
// Uses basic JS date pickers — no extra native deps required

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Colors, Radius, Shadow, Spacing, Typography } from '../utils/theme';
import { formatDate, toISODateString } from '../utils/dateUtils';

interface Props {
  value: string; // ISO date string YYYY-MM-DD
  onChange: (value: string) => void;
}

// Simple month/year/day picker — no external dep
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export default function DatePickerField({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const parsed = new Date(value + 'T12:00:00');
  const [year, setYear] = useState(parsed.getFullYear());
  const [month, setMonth] = useState(parsed.getMonth()); // 0-indexed
  const [day, setDay] = useState(parsed.getDate());

  function daysInMonth(y: number, m: number): number {
    return new Date(y, m + 1, 0).getDate();
  }

  function clampDay(d: number, y: number, m: number): number {
    return Math.min(d, daysInMonth(y, m));
  }

  function confirm() {
    const d = clampDay(day, year, month);
    const dateObj = new Date(year, month, d);
    onChange(toISODateString(dateObj));
    setOpen(false);
  }

  function changeMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 0) { newMonth = 11; newYear -= 1; }
    if (newMonth > 11) { newMonth = 0; newYear += 1; }
    setMonth(newMonth);
    setYear(newYear);
    setDay((prev) => clampDay(prev, newYear, newMonth));
  }

  const maxDay = daysInMonth(year, month);
  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => {
          const d = new Date(value + 'T12:00:00');
          setYear(d.getFullYear());
          setMonth(d.getMonth());
          setDay(d.getDate());
          setOpen(true);
        }}
        activeOpacity={0.75}
      >
        <Text style={styles.triggerEmoji}>📅</Text>
        <Text style={styles.triggerLabel}>{formatDate(value)}</Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Choisir une date</Text>

            {/* Month navigation */}
            <View style={styles.monthRow}>
              <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                <Text style={styles.navBtnText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{MONTHS[month]} {year}</Text>
              <TouchableOpacity
                onPress={() => changeMonth(1)}
                style={styles.navBtn}
                disabled={year === new Date().getFullYear() && month >= new Date().getMonth()}
              >
                <Text style={styles.navBtnText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day grid */}
            <View style={styles.dayGrid}>
              {days.map((d) => {
                const isToday =
                  d === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();
                const selected = d === day;
                const future =
                  new Date(year, month, d) > new Date();
                return (
                  <TouchableOpacity
                    key={d}
                    style={[
                      styles.dayBtn,
                      selected && styles.dayBtnSelected,
                      isToday && !selected && styles.dayBtnToday,
                    ]}
                    disabled={future}
                    onPress={() => setDay(d)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        selected && styles.dayTextSelected,
                        future && styles.dayTextDisabled,
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Confirm */}
            <TouchableOpacity style={styles.confirmBtn} onPress={confirm}>
              <Text style={styles.confirmText}>Confirmer</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  triggerEmoji: { fontSize: 18, marginRight: 10 },
  triggerLabel: { flex: 1, ...Typography.body, color: Colors.text },
  chevron: { fontSize: 20, color: Colors.textTertiary, fontWeight: '300' },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: 40,
    ...Shadow.lg,
  },
  sheetTitle: {
    ...Typography.titleMedium,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: { fontSize: 24, color: Colors.primary, fontWeight: '600' },
  monthLabel: { ...Typography.titleMedium, color: Colors.text },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: Spacing.lg,
  },
  dayBtn: {
    width: '13%',
    aspectRatio: 1,
    margin: '0.4%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  dayBtnSelected: { backgroundColor: Colors.primary },
  dayBtnToday: { borderWidth: 1.5, borderColor: Colors.primary },
  dayText: { ...Typography.body, color: Colors.text },
  dayTextSelected: { color: '#FFF', fontWeight: '700' },
  dayTextDisabled: { color: Colors.textTertiary },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: { ...Typography.bodyMedium, color: '#FFF', fontWeight: '700' },
});
