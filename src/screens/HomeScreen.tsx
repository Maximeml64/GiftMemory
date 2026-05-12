// src/screens/HomeScreen.tsx
//
// Dashboard d'accueil — landing hub avec greeting, prochains événements,
// stats, derniers cadeaux. Navigation rapide vers les autres tabs.

import React, { useMemo } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Gift as GiftLucide, Cake, Users } from 'lucide-react-native';

import { RootStackParamList, TabParamList } from '../types';
import { useGifts } from '../store/GiftsContext';
import { useEvents } from '../store/EventsContext';
import { usePremiumGate } from '../hooks/usePremiumGate';
import {
  Button,
  Card,
  EmptyState,
  EventCountdownCard,
  GiftCard,
  ScreenWrapper,
  SectionHeader,
  StyledText,
} from '../components/ui';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';
import { daysUntilNext, sortEventsByNext } from '../utils/eventUtils';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type LucideIcon = React.ComponentType<{ color?: string; size?: number }>;
const GiftIcon = GiftLucide as unknown as LucideIcon;
const CakeIcon = Cake as unknown as LucideIcon;
const UsersIcon = Users as unknown as LucideIcon;

const SCREEN_PADDING = SPACING.lg;
const MINI_CARD_GAP = SPACING.sm;

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Bonne nuit';
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bel après-midi';
  return 'Bonsoir';
}

function StatCard({
  icon,
  count,
  label,
  detail,
  onPress,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
  detail?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        gap: SPACING.xs,
        ...SHADOWS.sm,
      }}
    >
      <View style={{ alignSelf: 'flex-start' }}>{icon}</View>
      <StyledText variant="numericLarge">{count}</StyledText>
      <StyledText variant="caption" color={COLORS.textSecondary}>
        {label}
      </StyledText>
      {detail ? (
        <StyledText variant="caption" color={COLORS.textTertiary}>
          {detail}
        </StyledText>
      ) : null}
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { gifts, loading: giftsLoading, getUniqueGivers } = useGifts();
  const { events, loading: eventsLoading } = useEvents();
  const { checkGiftLimit, checkEventLimit } = usePremiumGate();

  const upcomingEvents = useMemo(() => sortEventsByNext(events).slice(0, 3), [events]);
  const recentGifts = useMemo(
    () => [...gifts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [gifts]
  );
  const giversCount = useMemo(() => getUniqueGivers().length, [getUniqueGivers]);

  const receivedCount = useMemo(
    () => gifts.filter((g) => (g.direction ?? 'received') === 'received').length,
    [gifts]
  );
  const givenCount = gifts.length - receivedCount;
  const giftsDetail =
    gifts.length === 0
      ? undefined
      : `${receivedCount} reçu${receivedCount > 1 ? 's' : ''} · ${givenCount} offert${givenCount > 1 ? 's' : ''}`;

  const screenWidth = Dimensions.get('window').width;
  const miniCardWidth = Math.min(160, (screenWidth - SCREEN_PADDING * 2 - MINI_CARD_GAP) / 2.2);

  const greeting = getGreeting();
  const isEmpty = !giftsLoading && !eventsLoading && gifts.length === 0 && events.length === 0;

  if (isEmpty) {
    return (
      <ScreenWrapper>
        <View style={{ paddingTop: SPACING.lg }}>
          <StyledText variant="display" style={{ marginBottom: 2 }}>
            {greeting}
          </StyledText>
          <StyledText variant="body" color={COLORS.textSecondary}>
            Votre boîte à souvenirs
          </StyledText>
        </View>
        <EmptyState
          emoji="🎁"
          title="Commençons à remplir votre boîte"
          description="Notez un premier cadeau ou ajoutez l'anniversaire d'un proche pour démarrer."
          ctaLabel="Ajouter un cadeau"
          onCtaPress={() => {
            if (checkGiftLimit()) navigation.navigate('AddGift', undefined);
          }}
          paddingVertical={SPACING.xl}
        />
        <View style={{ alignItems: 'center', marginTop: -SPACING.lg }}>
          <Button
            label="Ajouter un événement"
            variant="ghost"
            onPress={() => {
              if (checkEventLimit()) navigation.navigate('AddEvent', undefined);
            }}
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper padded={false}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: SCREEN_PADDING,
          paddingTop: SPACING.lg,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={{ marginBottom: SPACING.xl }}>
          <StyledText variant="display" style={{ marginBottom: 2 }}>
            {greeting}
          </StyledText>
          <StyledText variant="body" color={COLORS.textSecondary}>
            Votre boîte à souvenirs
          </StyledText>
        </View>

        {/* Stats trio */}
        <View style={{ flexDirection: 'row', gap: MINI_CARD_GAP }}>
          <StatCard
            icon={<GiftIcon color={COLORS.primary} size={18} />}
            count={gifts.length}
            label={gifts.length > 1 ? 'cadeaux' : 'cadeau'}
            detail={giftsDetail}
            onPress={() => navigation.navigate('Gifts')}
          />
          <StatCard
            icon={<CakeIcon color={COLORS.primary} size={18} />}
            count={events.length}
            label={events.length > 1 ? 'événements' : 'événement'}
            onPress={() => navigation.navigate('Events')}
          />
          <StatCard
            icon={<UsersIcon color={COLORS.primary} size={18} />}
            count={giversCount}
            label={giversCount > 1 ? 'donneurs' : 'donneur'}
            onPress={() => navigation.navigate('Givers')}
          />
        </View>

        {/* Prochains événements */}
        {upcomingEvents.length > 0 ? (
          <>
            <SectionHeader
              eyebrow="À venir"
              title="Prochains événements"
              action={
                events.length > 3
                  ? { label: 'Tout voir', onPress: () => navigation.navigate('Events') }
                  : undefined
              }
            />
            <View style={{ gap: SPACING.sm }}>
              {upcomingEvents.map((event) => (
                <EventCountdownCard
                  key={event.id}
                  event={event}
                  daysUntil={daysUntilNext(event.month, event.day)}
                  onPress={() =>
                    navigation.navigate('EventDetail', { eventId: event.id, backTitle: 'Accueil' })
                  }
                />
              ))}
            </View>
          </>
        ) : events.length === 0 ? (
          <>
            <SectionHeader eyebrow="À venir" title="Prochains événements" />
            <Card variant="soft" padding="base" bordered>
              <StyledText variant="body" color={COLORS.textSecondary} align="center" style={{ marginBottom: SPACING.md }}>
                Aucun événement enregistré pour l'instant.
              </StyledText>
              <Button
                label="Ajouter un événement"
                variant="secondary"
                size="sm"
                onPress={() => {
                  if (checkEventLimit()) navigation.navigate('AddEvent', undefined);
                }}
                style={{ alignSelf: 'center' }}
              />
            </Card>
          </>
        ) : null}

        {/* Derniers cadeaux */}
        {recentGifts.length > 0 ? (
          <>
            <SectionHeader
              eyebrow="Récents"
              title="Derniers cadeaux"
              action={
                gifts.length > recentGifts.length
                  ? { label: 'Tout voir', onPress: () => navigation.navigate('Gifts') }
                  : undefined
              }
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: MINI_CARD_GAP, paddingRight: SCREEN_PADDING }}
              style={{ marginHorizontal: -SCREEN_PADDING, paddingHorizontal: SCREEN_PADDING }}
            >
              {recentGifts.map((gift) => (
                <GiftCard
                  key={gift.id}
                  gift={gift}
                  width={miniCardWidth}
                  onPress={() =>
                    navigation.navigate('GiftDetail', { giftId: gift.id, backTitle: 'Accueil' })
                  }
                />
              ))}
            </ScrollView>
          </>
        ) : gifts.length === 0 ? (
          <>
            <SectionHeader eyebrow="Récents" title="Derniers cadeaux" />
            <Card variant="soft" padding="base" bordered>
              <StyledText variant="body" color={COLORS.textSecondary} align="center" style={{ marginBottom: SPACING.md }}>
                Aucun cadeau enregistré pour l'instant.
              </StyledText>
              <Button
                label="Ajouter un cadeau"
                variant="secondary"
                size="sm"
                onPress={() => {
                  if (checkGiftLimit()) navigation.navigate('AddGift', undefined);
                }}
                style={{ alignSelf: 'center' }}
              />
            </Card>
          </>
        ) : null}
      </ScrollView>
    </ScreenWrapper>
  );
}
