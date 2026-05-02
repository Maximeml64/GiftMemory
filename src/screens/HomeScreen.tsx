// src/screens/HomeScreen.tsx

import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TextInput,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { useGifts } from '../store/GiftsContext';
import { usePremiumGate } from '../hooks/usePremiumGate';
import GiftCard from '../components/GiftCard';
import FAB from '../components/FAB';
import EmptyState from '../components/EmptyState';
import { Colors, Spacing, Radius, Typography, Shadow } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SortKey = 'date' | 'name' | 'giver';

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { gifts, loading } = useGifts();
  const { checkGiftLimit } = usePremiumGate();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('date');

  const filtered = useMemo(() => {
    let result = [...gifts];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.giver.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sort === 'date') return b.date.localeCompare(a.date);
      if (sort === 'name') return a.name.localeCompare(b.name, 'fr');
      return a.giver.localeCompare(b.giver, 'fr');
    });
    return result;
  }, [gifts, search, sort]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Mes cadeaux</Text>
          <Text style={styles.subtitle}>
            {gifts.length} cadeau{gifts.length !== 1 ? 'x' : ''}
          </Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Chercher un cadeau ou un donneur…"
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort pills */}
      <View style={styles.sortRow}>
        {(['date', 'name', 'giver'] as SortKey[]).map((key) => {
          const labels: Record<SortKey, string> = {
            date: '📅 Date',
            name: '🎁 Nom',
            giver: '👤 Donneur',
          };
          return (
            <TouchableOpacity
              key={key}
              style={[styles.pill, sort === key && styles.pillActive]}
              onPress={() => setSort(key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, sort === key && styles.pillTextActive]}>
                {labels[key]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji="🎁"
          title={search ? 'Aucun résultat' : 'Aucun cadeau enregistré'}
          subtitle={
            search
              ? 'Essayez un autre terme de recherche'
              : 'Appuyez sur + pour ajouter votre premier cadeau !'
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GiftCard
              gift={item}
              onPress={() => navigation.navigate('GiftDetail', { giftId: item.id })}
            />
          )}
        />
      )}

      <FAB onPress={() => { if (checkGiftLimit()) navigation.navigate('AddGift', undefined); }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  title: { ...Typography.displayMedium, color: Colors.text },
  subtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: 2 },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    ...Shadow.sm,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text,
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.textTertiary,
    paddingLeft: 8,
    fontWeight: '600',
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: { ...Typography.captionMedium, color: Colors.textSecondary },
  pillTextActive: { color: '#FFF' },
  grid: {
    paddingHorizontal: Spacing.lg - 6,
    paddingBottom: 100,
  },
});