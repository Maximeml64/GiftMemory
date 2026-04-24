// src/components/OccasionPicker.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Occasion } from '../types';
import { Colors, Radius, Shadow, Spacing, Typography, Occasions } from '../utils/theme';

const OCCASIONS: Occasion[] = ['Anniversaire', 'Noël', 'Naissance', 'Mariage', 'Autre'];

interface Props {
  value: Occasion;
  onChange: (value: Occasion) => void;
}

export default function OccasionPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const current = Occasions[value];

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.75}
      >
        <Text style={styles.triggerEmoji}>{current.emoji}</Text>
        <Text style={styles.triggerLabel}>{current.label}</Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Occasion</Text>
            <FlatList
              data={OCCASIONS}
              keyExtractor={(item) => item}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const occ = Occasions[item];
                const selected = item === value;
                return (
                  <TouchableOpacity
                    style={[styles.option, selected && styles.optionSelected]}
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.optionEmoji}>{occ.emoji}</Text>
                    <Text
                      style={[
                        styles.optionLabel,
                        selected && styles.optionLabelSelected,
                      ]}
                    >
                      {occ.label}
                    </Text>
                    {selected && <Text style={styles.check}>✓</Text>}
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
  triggerEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  triggerLabel: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textTertiary,
    fontWeight: '300',
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    ...Shadow.lg,
  },
  sheetTitle: {
    ...Typography.titleMedium,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
  },
  optionSelected: {
    backgroundColor: Colors.primary + '10',
  },
  optionEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  optionLabel: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
  },
  optionLabelSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  check: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '700',
  },
});
