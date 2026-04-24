// src/screens/GiverDetailScreen.tsx

import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { useGifts } from '../store/GiftsContext';
import GiftCard from '../components/GiftCard';
import EmptyState from '../components/EmptyState';
import { Colors, Spacing, Typography } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GiverDetail'>;

export default function GiverDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { getGiftsByGiver } = useGifts();

  const { giverName } = route.params;
  const gifts = getGiftsByGiver(giverName);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{giverName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{giverName}</Text>
        <Text style={styles.count}>
          {gifts.length} cadeau{gifts.length !== 1 ? 'x' : ''}
        </Text>
      </View>

      {gifts.length === 0 ? (
        <EmptyState emoji="🎁" title="Aucun cadeau" />
      ) : (
        <FlatList
          data={gifts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GiftCard
              gift={item}
              onPress={() =>
                navigation.navigate('GiftDetail', { giftId: item.id })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#FFF' },
  name: { ...Typography.titleLarge, color: Colors.text },
  count: { ...Typography.body, color: Colors.textSecondary, marginTop: 4 },
  grid: {
    paddingHorizontal: Spacing.lg - 6,
    paddingBottom: 40,
  },
});
