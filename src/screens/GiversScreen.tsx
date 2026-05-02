// src/screens/GiversScreen.tsx

import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { useGifts } from '../store/GiftsContext';
import EmptyState from '../components/EmptyState';
import { Colors, Radius, Shadow, Spacing, Typography } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function GiversScreen() {
  const navigation = useNavigation<Nav>();
  const { gifts, getUniqueGivers } = useGifts();

  const givers = useMemo(() => {
    return getUniqueGivers().map((name) => ({
      name,
      count: gifts.filter((g) => g.giver.toLowerCase() === name.toLowerCase()).length,
    }));
  }, [gifts, getUniqueGivers]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Donneurs</Text>
        <Text style={styles.subtitle}>{givers.length} personne{givers.length !== 1 ? 's' : ''}</Text>
      </View>

      {givers.length === 0 ? (
        <EmptyState
          emoji="👥"
          title="Aucun donneur"
          subtitle="Les donneurs apparaîtront ici une fois que vous aurez enregistré des cadeaux."
        />
      ) : (
        <FlatList
          data={givers}
          keyExtractor={(item) => item.name}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('GiverDetail', { giverName: item.name })
              }
              activeOpacity={0.8}
            >
              <View style={[styles.avatar, { backgroundColor: avatarColor(item.name) }]}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.giverName}>{item.name}</Text>
                <Text style={styles.giverCount}>
                  {item.count} cadeau{item.count !== 1 ? 'x' : ''}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// Simple color hash from name
function avatarColor(name: string): string {
  const colors = [
    '#E8734A', '#4A7E8C', '#7B9FE8', '#C48BCE',
    '#5A9E6F', '#F2C94C', '#E05A5A', '#9E7B5A',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  title: { ...Typography.displayMedium, color: Colors.text },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 2 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  cardInfo: { flex: 1 },
  giverName: { ...Typography.bodyMedium, color: Colors.text },
  giverCount: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  chevron: { fontSize: 20, color: Colors.textTertiary, fontWeight: '300' },
});
