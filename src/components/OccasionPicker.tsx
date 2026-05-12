// src/components/OccasionPicker.tsx

import React, { useState } from 'react';
import { FlatList, Modal, Pressable, TouchableOpacity, View } from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';
import { Occasion } from '../types';
import { COLORS, OCCASIONS, RADIUS, SHADOWS, SPACING } from '../utils/theme';
import { StyledText } from './ui/StyledText';

const ORDER: Occasion[] = ['Anniversaire', 'Noël', 'Naissance', 'Mariage', 'Autre'];

type LucideIcon = React.ComponentType<{ color?: string; size?: number }>;
const ChevronIcon = ChevronRight as unknown as LucideIcon;
const CheckIcon = Check as unknown as LucideIcon;

interface Props {
  value: Occasion;
  onChange: (value: Occasion) => void;
}

export default function OccasionPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const current = OCCASIONS[value];

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => setOpen(true)}
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
        <StyledText style={{ fontSize: 18 }}>{current.emoji}</StyledText>
        <StyledText variant="body" style={{ flex: 1 }}>
          {current.label}
        </StyledText>
        <ChevronIcon color={COLORS.textTertiary} size={18} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
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
            <StyledText
              variant="h3"
              align="center"
              style={{ marginBottom: SPACING.md, paddingHorizontal: SPACING.lg }}
            >
              Occasion
            </StyledText>
            <FlatList
              data={ORDER}
              keyExtractor={(item) => item}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const occ = OCCASIONS[item];
                const selected = item === value;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: SPACING.md,
                      paddingHorizontal: SPACING.lg,
                      backgroundColor: selected ? COLORS.primaryMuted : 'transparent',
                      gap: SPACING.md,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: RADIUS.full,
                        backgroundColor: occ.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <StyledText style={{ fontSize: 18 }}>{occ.emoji}</StyledText>
                    </View>
                    <StyledText
                      variant={selected ? 'bodyMedium' : 'body'}
                      color={selected ? COLORS.primary : COLORS.text}
                      style={{ flex: 1 }}
                    >
                      {occ.label}
                    </StyledText>
                    {selected ? <CheckIcon color={COLORS.primary} size={20} /> : null}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
