// src/screens/GiftDetailScreen.tsx

import React from 'react';
import { Alert, Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { useGifts } from '../store/GiftsContext';
import {
  Button,
  Card,
  InfoRow,
  OccasionBadge,
  StyledText,
} from '../components/ui';
import { COLORS, OCCASIONS, SPACING } from '../utils/theme';
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
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <StyledText variant="body" color={COLORS.textSecondary}>
            Cadeau introuvable
          </StyledText>
        </View>
      </SafeAreaView>
    );
  }

  const occasion = OCCASIONS[gift.occasion] ?? OCCASIONS.Autre;
  const isWine = gift.category === 'Vin & Spiritueux';

  function confirmDelete() {
    Alert.alert('Supprimer', `Supprimer "${gift!.name}" définitivement ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await removeGift(gift!.id);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ width: '100%', aspectRatio: 1.2, backgroundColor: occasion.bg }}>
          {gift.imageUri ? (
            <Image
              source={{ uri: gift.imageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <StyledText style={{ fontSize: 80, lineHeight: 92 }}>
                {isWine ? '🍷' : occasion.emoji}
              </StyledText>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg }}>
          {/* Badges */}
          <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md }}>
            <OccasionBadge occasion={gift.occasion} />
            {isWine ? (
              <View
                style={{
                  paddingVertical: 4,
                  paddingHorizontal: SPACING.md,
                  borderRadius: 999,
                  backgroundColor: '#EBDDE6',
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.xs,
                }}
              >
                <StyledText style={{ fontSize: 13 }}>🍷</StyledText>
                <StyledText variant="smallMedium" color="#4A1942">Cave</StyledText>
              </View>
            ) : null}
          </View>

          {/* Name */}
          <StyledText variant="h1" style={{ marginBottom: SPACING.xl }}>
            {gift.name}
          </StyledText>

          {/* Meta card */}
          <Card padding="none" style={{ overflow: 'hidden', marginBottom: SPACING.xl }}>
            <View style={{ paddingHorizontal: SPACING.base }}>
              <InfoRow label="Offert par" value={gift.giver} />
              <InfoRow label="Date" value={formatDate(gift.date)} divider={isWine} />
              {isWine && gift.appellation ? (
                <InfoRow label="Appellation" value={gift.appellation} divider={!!gift.vintage || gift.quantity !== undefined} />
              ) : null}
              {isWine && gift.vintage ? (
                <InfoRow label="Millésime" value={gift.vintage} divider={gift.quantity !== undefined} />
              ) : null}
              {isWine && gift.quantity !== undefined ? (
                <InfoRow
                  label="Bouteilles"
                  value={`${gift.quantity} bouteille${gift.quantity > 1 ? 's' : ''}`}
                  divider={false}
                />
              ) : null}
            </View>
          </Card>

          {/* Actions */}
          <View style={{ gap: SPACING.sm }}>
            <Button
              label="Modifier"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={() => navigation.navigate('AddGift', { giftId: gift.id })}
            />
            <Button
              label="Supprimer"
              variant="danger"
              size="lg"
              fullWidth
              onPress={confirmDelete}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
