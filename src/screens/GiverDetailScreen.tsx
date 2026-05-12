// src/screens/GiverDetailScreen.tsx

import React, { useMemo } from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Gift, RootStackParamList } from '../types';
import { useGifts } from '../store/GiftsContext';
import {
  Avatar,
  EmptyState,
  GiftCard,
  SectionHeader,
  StyledText,
} from '../components/ui';
import { COLORS, SPACING } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GiverDetail'>;

const SCREEN_PADDING = SPACING.lg;
const GRID_GAP = SPACING.md;

function GiftsGrid({ gifts, cardWidth, onPress }: {
  gifts: Gift[];
  cardWidth: number;
  onPress: (gift: Gift) => void;
}) {
  // Render 2-col grid via simple flex wrap so we can mix it with other sections.
  const rows: Gift[][] = [];
  for (let i = 0; i < gifts.length; i += 2) {
    rows.push(gifts.slice(i, i + 2));
  }
  return (
    <View style={{ gap: GRID_GAP }}>
      {rows.map((row, idx) => (
        <View key={idx} style={{ flexDirection: 'row', gap: GRID_GAP }}>
          {row.map((gift) => (
            <GiftCard key={gift.id} gift={gift} width={cardWidth} onPress={() => onPress(gift)} />
          ))}
        </View>
      ))}
    </View>
  );
}

export default function GiverDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { getGiftsByGiver } = useGifts();

  const { giverName } = route.params;
  const gifts = getGiftsByGiver(giverName);

  const received = useMemo(
    () => gifts.filter((g) => (g.direction ?? 'received') === 'received'),
    [gifts]
  );
  const given = useMemo(
    () => gifts.filter((g) => g.direction === 'given'),
    [gifts]
  );

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = useMemo(
    () => (screenWidth - SCREEN_PADDING * 2 - GRID_GAP) / 2,
    [screenWidth]
  );

  const summaryLabel =
    gifts.length === 0
      ? 'Aucun cadeau'
      : received.length > 0 && given.length > 0
        ? `${received.length} reçu${received.length > 1 ? 's' : ''} · ${given.length} offert${given.length > 1 ? 's' : ''}`
        : received.length > 0
          ? `${received.length} cadeau${received.length > 1 ? 'x' : ''} reçu${received.length > 1 ? 's' : ''}`
          : `${given.length} cadeau${given.length > 1 ? 'x' : ''} offert${given.length > 1 ? 's' : ''}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            alignItems: 'center',
            paddingVertical: SPACING.xl,
            borderBottomWidth: 0.5,
            borderBottomColor: COLORS.border,
            gap: SPACING.sm,
          }}
        >
          <Avatar name={giverName} size={72} />
          <View style={{ alignItems: 'center', gap: 2 }}>
            <StyledText variant="h2" align="center">
              {giverName}
            </StyledText>
            <StyledText variant="small" color={COLORS.textSecondary}>
              {summaryLabel}
            </StyledText>
          </View>
        </View>

        {gifts.length === 0 ? (
          <EmptyState
            emoji="🎁"
            title="Aucun cadeau enregistré"
            description={`Vous n'avez encore noté aucun cadeau lié à ${giverName}.`}
          />
        ) : (
          <View style={{ paddingHorizontal: SCREEN_PADDING }}>
            {received.length > 0 ? (
              <>
                <SectionHeader
                  eyebrow={given.length > 0 ? 'Reçus' : 'Cadeaux'}
                  title={given.length > 0 ? `Reçus de ${giverName}` : `Cadeaux de ${giverName}`}
                />
                <GiftsGrid
                  gifts={received}
                  cardWidth={cardWidth}
                  onPress={(g) => navigation.navigate('GiftDetail', { giftId: g.id })}
                />
              </>
            ) : null}

            {given.length > 0 ? (
              <>
                <SectionHeader
                  eyebrow="Offerts"
                  title={`Offerts à ${giverName}`}
                />
                <GiftsGrid
                  gifts={given}
                  cardWidth={cardWidth}
                  onPress={(g) => navigation.navigate('GiftDetail', { giftId: g.id })}
                />
              </>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
