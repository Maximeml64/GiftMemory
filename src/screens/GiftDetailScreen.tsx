// src/screens/GiftDetailScreen.tsx

import React from 'react';
import { Alert, Image, Linking, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowDownLeft, ArrowUpRight, ExternalLink, MapPin } from 'lucide-react-native';

import { RootStackParamList } from '../types';
import { useGifts } from '../store/GiftsContext';
import {
  Badge,
  Button,
  Card,
  InfoRow,
  OccasionBadge,
  StyledText,
} from '../components/ui';
import { COLORS, OCCASIONS, RADIUS, SPACING } from '../utils/theme';
import { formatDate } from '../utils/dateUtils';

type LucideIcon = React.ComponentType<{ color?: string; size?: number }>;
const InIcon = ArrowDownLeft as unknown as LucideIcon;
const OutIcon = ArrowUpRight as unknown as LucideIcon;
const ExternalLinkIcon = ExternalLink as unknown as LucideIcon;
const MapPinIcon = MapPin as unknown as LucideIcon;

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GiftDetail'>;

const THUMB = 86;

function formatPrice(p: number): string {
  return p.toLocaleString('fr-FR', { minimumFractionDigits: p % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 }) + ' €';
}

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
  const isGiven = gift.direction === 'given';
  const isIdea = gift.status === 'idea';
  const additionalPhotos = gift.additionalPhotos ?? [];

  async function openUrl(raw: string) {
    let url = raw.trim();
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Lien invalide', "Impossible d'ouvrir ce lien.");
      }
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir ce lien.");
    }
  }

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
              style={{ width: '100%', height: '100%', opacity: isIdea ? 0.85 : 1 }}
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

        {/* Additional photos strip */}
        {additionalPhotos.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              gap: SPACING.sm,
              paddingHorizontal: SPACING.lg,
              paddingTop: SPACING.md,
            }}
          >
            {additionalPhotos.map((uri) => (
              <Image
                key={uri}
                source={{ uri }}
                style={{
                  width: THUMB,
                  height: THUMB,
                  borderRadius: RADIUS.md,
                  backgroundColor: COLORS.surfaceAlt,
                }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : null}

        <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg }}>
          {/* Badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md }}>
            {isIdea ? (
              <Badge label="Idée" color={COLORS.textInverse} bg={COLORS.primary} />
            ) : null}
            <Badge
              label={isGiven ? 'Offert' : 'Reçu'}
              color={COLORS.primary}
              bg={COLORS.primaryMuted}
              icon={
                isGiven
                  ? <OutIcon color={COLORS.primary} size={13} />
                  : <InIcon color={COLORS.primary} size={13} />
              }
            />
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
          <StyledText variant="h1" style={{ marginBottom: SPACING.xs }}>
            {gift.name}
          </StyledText>

          {/* Price spotlight */}
          {gift.price !== undefined ? (
            <StyledText variant="numericMedium" color={COLORS.textSecondary} style={{ marginBottom: SPACING.lg }}>
              {formatPrice(gift.price)}
            </StyledText>
          ) : (
            <View style={{ height: SPACING.md }} />
          )}

          {/* Meta card */}
          <Card padding="none" style={{ overflow: 'hidden', marginBottom: SPACING.lg }}>
            <View style={{ paddingHorizontal: SPACING.base }}>
              <InfoRow label={isGiven ? 'Offert à' : 'Offert par'} value={gift.giver} />
              <InfoRow
                label={isIdea ? 'Date prévue' : 'Date'}
                value={formatDate(gift.date)}
                divider={isWine || !!gift.purchaseLocation || !!gift.purchaseUrl}
              />
              {isWine && gift.appellation ? (
                <InfoRow label="Appellation" value={gift.appellation} divider={!!gift.vintage || gift.quantity !== undefined || !!gift.purchaseLocation || !!gift.purchaseUrl} />
              ) : null}
              {isWine && gift.vintage ? (
                <InfoRow label="Millésime" value={gift.vintage} divider={gift.quantity !== undefined || !!gift.purchaseLocation || !!gift.purchaseUrl} />
              ) : null}
              {isWine && gift.quantity !== undefined ? (
                <InfoRow
                  label="Bouteilles"
                  value={`${gift.quantity} bouteille${gift.quantity > 1 ? 's' : ''}`}
                  divider={!!gift.purchaseLocation || !!gift.purchaseUrl}
                />
              ) : null}
              {gift.purchaseLocation ? (
                <InfoRow
                  label={isIdea ? 'Où acheter' : 'Acheté à'}
                  value={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
                      <MapPinIcon color={COLORS.textTertiary} size={14} />
                      <StyledText variant="smallMedium" align="right" style={{ flexShrink: 1 }}>
                        {gift.purchaseLocation}
                      </StyledText>
                    </View>
                  }
                  divider={!!gift.purchaseUrl}
                />
              ) : null}
              {gift.purchaseUrl ? (
                <InfoRow
                  label="Lien"
                  value={
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => openUrl(gift.purchaseUrl!)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexShrink: 1 }}
                    >
                      <StyledText
                        variant="smallMedium"
                        color={COLORS.primary}
                        numberOfLines={1}
                        style={{ flexShrink: 1, textAlign: 'right' }}
                      >
                        {gift.purchaseUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '')}
                      </StyledText>
                      <ExternalLinkIcon color={COLORS.primary} size={14} />
                    </TouchableOpacity>
                  }
                  divider={false}
                />
              ) : null}
            </View>
          </Card>

          {/* Tags */}
          {gift.tags && gift.tags.length > 0 ? (
            <View style={{ marginBottom: SPACING.lg }}>
              <StyledText variant="eyebrow" style={{ marginBottom: SPACING.sm }}>
                Étiquettes
              </StyledText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs }}>
                {gift.tags.map((tag) => (
                  <View
                    key={tag}
                    style={{
                      paddingVertical: 4,
                      paddingHorizontal: SPACING.sm,
                      backgroundColor: COLORS.surfaceAlt,
                      borderRadius: RADIUS.full,
                      borderWidth: 1,
                      borderColor: COLORS.border,
                    }}
                  >
                    <StyledText variant="smallMedium" color={COLORS.textSecondary}>
                      {tag}
                    </StyledText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Notes */}
          {gift.notes ? (
            <View style={{ marginBottom: SPACING.lg }}>
              <StyledText variant="eyebrow" style={{ marginBottom: SPACING.sm }}>
                Notes
              </StyledText>
              <Card padding="base">
                <StyledText variant="body">{gift.notes}</StyledText>
              </Card>
            </View>
          ) : null}

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
