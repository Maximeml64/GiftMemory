// src/components/FAB.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Colors, Shadow, Radius } from '../utils/theme';

interface Props {
  onPress: () => void;
}

export default function FAB({ onPress }: Props) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.lg,
  },
  icon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
});
