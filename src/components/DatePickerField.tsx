// src/components/DatePickerField.tsx
// Modal date picker, no extra native deps.

import React, { useState } from 'react';
import { Modal, Pressable, TouchableOpacity, View } from 'react-native';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';
import { formatDate, toISODateString } from '../utils/dateUtils';
import { Button } from './ui/Button';
import { StyledText } from './ui/StyledText';

interface Props {
  value: string; // ISO date string YYYY-MM-DD
  onChange: (value: string) => void;
}

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

type LucideIcon = React.ComponentType<{ color?: string; size?: number }>;
const CalendarIcon = Calendar as unknown as LucideIcon;
const ChevronLeftIcon = ChevronLeft as unknown as LucideIcon;
const ChevronRightIcon = ChevronRight as unknown as LucideIcon;

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
        activeOpacity={0.75}
        onPress={() => {
          const d = new Date(value + 'T12:00:00');
          setYear(d.getFullYear());
          setMonth(d.getMonth());
          setDay(d.getDate());
          setOpen(true);
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.md,
          paddingHorizontal: SPACING.md,
          paddingVertical: 14,
          borderWidth: 1,
          borderColor: COLORS.border,
          gap: SPACING.sm,
        }}
      >
        <CalendarIcon color={COLORS.textSecondary} size={18} />
        <StyledText variant="body" style={{ flex: 1 }}>
          {formatDate(value)}
        </StyledText>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
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
              Choisir une date
            </StyledText>

            {/* Month navigation */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: SPACING.md,
              }}
            >
              <TouchableOpacity
                onPress={() => changeMonth(-1)}
                style={{ padding: SPACING.sm }}
                hitSlop={8}
              >
                <ChevronLeftIcon color={COLORS.primary} size={24} />
              </TouchableOpacity>
              <StyledText variant="title">
                {MONTHS[month]} {year}
              </StyledText>
              <TouchableOpacity
                onPress={() => changeMonth(1)}
                disabled={year === new Date().getFullYear() && month >= new Date().getMonth()}
                style={{
                  padding: SPACING.sm,
                  opacity:
                    year === new Date().getFullYear() && month >= new Date().getMonth() ? 0.3 : 1,
                }}
                hitSlop={8}
              >
                <ChevronRightIcon color={COLORS.primary} size={24} />
              </TouchableOpacity>
            </View>

            {/* Day grid */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                marginBottom: SPACING.lg,
              }}
            >
              {days.map((d) => {
                const isToday =
                  d === new Date().getDate() &&
                  month === new Date().getMonth() &&
                  year === new Date().getFullYear();
                const selected = d === day;
                const future = new Date(year, month, d) > new Date();
                return (
                  <TouchableOpacity
                    key={d}
                    disabled={future}
                    onPress={() => setDay(d)}
                    activeOpacity={0.7}
                    style={{
                      width: '13%',
                      aspectRatio: 1,
                      margin: '0.4%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: RADIUS.full,
                      backgroundColor: selected ? COLORS.primary : 'transparent',
                      borderWidth: isToday && !selected ? 1.5 : 0,
                      borderColor: COLORS.primary,
                    }}
                  >
                    <StyledText
                      variant="body"
                      color={
                        selected
                          ? COLORS.textInverse
                          : future
                            ? COLORS.textTertiary
                            : COLORS.text
                      }
                      style={selected ? { fontFamily: 'Inter_600SemiBold' } : undefined}
                    >
                      {d}
                    </StyledText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button label="Confirmer" onPress={confirm} fullWidth />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
