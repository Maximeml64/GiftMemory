// src/screens/GiftDetailScreen.tsx

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { useGifts } from '../store/GiftsContext';
import { Colors, Occasions, Radius, Shadow, Spacing, Typography } from '../utils/theme';
import { formatDate } from '../utils/dateUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GiftDetail'>;

export default function GiftDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { getGiftById, removeGift } = useGifts();

  const gift = getGiftById(route.params.giftId);

  if (!gift) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Cadeau introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const occasion = Occasions[gift.occasion] ?? Occasions['Autre'];
  const isWine = gift.category === 'Vin & Spiritueux';

  function confirmDelete() {
    Alert.alert(
      'Supprimer',
      `Supprimer "${gift!.name}" définitivement ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await removeGift(gift!.id);
            navigation.goBack();
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={styles.heroContainer}>
          {gift.imageUri ? (
            <Image source={{ uri: gift.imageUri }} style={styles.heroImage} resizeMode="cover" />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroEmoji}>{isWine ? '🍷' : occasion.emoji}</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Badges row */}
          <View style={styles.badgesRow}>
            <View style={[styles.occasionBadge, { backgroundColor: occasion.color + '20' }]}>
              <Text style={styles.occasionEmoji}>{occasion.emoji}</Text>
              <Text style={[styles.occasionLabel, { color: occasion.color }]}>{occasion.label}</Text>
            </View>
            {isWine && (
              <View style={styles.wineBadge}>
                <Text style={styles.wineBadgeText}>🍷 Cave</Text>
              </View>
            )}
          </View>

          <Text style={styles.giftName}>{gift.name}</Text>

          <View style={styles.metaCard}>
            <MetaRow icon="👤" label="Offert par" value={gift.giver} />
            <View style={styles.divider} />
            <MetaRow icon="📅" label="Date" value={formatDate(gift.date)} />
            {isWine && gift.appellation && (
              <>
                <View style={styles.divider} />
                <MetaRow icon="📍" label="Appellation" value={gift.appellation} />
              </>
            )}
            {isWine && gift.vintage && (
              <>
                <View style={styles.divider} />
                <MetaRow icon="🗓" label="Millésime" value={gift.vintage} />
              </>
            )}
            {isWine && gift.quantity !== undefined && (
              <>
                <View style={styles.divider} />
                <MetaRow icon="🔢" label="Bouteilles" value={`${gift.quantity} bouteille${gift.quantity > 1 ? 's' : ''}`} />
              </>
            )}
          </View>

          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => navigation.navigate('AddGift', { giftId: gift.id })}
            activeOpacity={0.85}
          >
            <Text style={styles.editBtnText}>✏️  Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} activeOpacity={0.85}>
            <Text style={styles.deleteBtnText}>🗑  Supprimer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={metaStyles.row}>
      <Text style={metaStyles.icon}>{icon}</Text>
      <View style={metaStyles.text}>
        <Text style={metaStyles.label}>{label}</Text>
        <Text style={metaStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: Spacing.md },
  icon: { fontSize: 20, marginRight: 12 },
  text: { flex: 1 },
  label: { ...Typography.caption, color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  value: { ...Typography.bodyMedium, color: Colors.text },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { ...Typography.body, color: Colors.textSecondary },
  scroll: { paddingBottom: 40 },
  heroContainer: { width: '100%', aspectRatio: 1.2, backgroundColor: Colors.shimmer },
  heroImage: { width: '100%', height: '100%' },
  heroPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 80 },
  content: { padding: Spacing.lg },
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.sm },
  occasionBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    gap: 6,
  },
  occasionEmoji: { fontSize: 16 },
  occasionLabel: { ...Typography.captionMedium, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  wineBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: '#8B1A1A20',
  },
  wineBadgeText: { ...Typography.captionMedium, color: '#8B1A1A', fontWeight: '600' },
  giftName: { ...Typography.displayMedium, color: Colors.text, marginBottom: Spacing.lg },
  metaCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing.lg, ...Shadow.sm, overflow: 'hidden' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.md },
  editBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  editBtnText: { ...Typography.bodyMedium, color: Colors.text, fontWeight: '600' },
  deleteBtn: {
    backgroundColor: Colors.dangerLight,
    borderRadius: Radius.lg,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.danger + '30',
  },
  deleteBtnText: { ...Typography.bodyMedium, color: Colors.danger, fontWeight: '600' },
});
