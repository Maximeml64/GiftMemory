// src/screens/GiverDetailScreen.tsx

import React, { useMemo } from 'react';
import { Dimensions, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { useGifts } from '../store/GiftsContext';
import {
  Avatar,
  EmptyState,
  GiftCard,
  StyledText,
} from '../components/ui';
import { COLORS, SPACING } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'GiverDetail'>;

const SCREEN_PADDING = SPACING.lg;
const GRID_GAP = SPACING.md;

export default function GiverDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { getGiftsByGiver } = useGifts();

  const { giverName } = route.params;
  const gifts = getGiftsByGiver(giverName);

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = useMemo(
    () => (screenWidth - SCREEN_PADDING * 2 - GRID_GAP) / 2,
    [screenWidth]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['bottom']}>
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
            {gifts.length === 0
              ? 'Aucun cadeau'
              : `${gifts.length} cadeau${gifts.length > 1 ? 'x' : ''}`}
          </StyledText>
        </View>
      </View>

      {gifts.length === 0 ? (
        <EmptyState
          emoji="🎁"
          title="Aucun cadeau enregistré"
          description={`Vous n'avez pas encore noté de cadeau offert par ${giverName}.`}
        />
      ) : (
        <FlatList
          data={gifts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING,
            paddingTop: SPACING.lg,
            paddingBottom: 40,
          }}
          columnWrapperStyle={{ gap: GRID_GAP, marginBottom: GRID_GAP }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GiftCard
              gift={item}
              width={cardWidth}
              onPress={() => navigation.navigate('GiftDetail', { giftId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
