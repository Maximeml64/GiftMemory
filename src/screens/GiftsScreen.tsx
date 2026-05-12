// src/screens/GiftsScreen.tsx

import React, { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, X } from 'lucide-react-native';

import { RootStackParamList } from '../types';
import { useGifts } from '../store/GiftsContext';
import { usePremiumGate } from '../hooks/usePremiumGate';
import {
  Chip,
  EmptyState,
  FAB,
  GiftCard,
  ScreenWrapper,
  StyledText,
} from '../components/ui';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SortKey = 'date' | 'name' | 'giver';

const SearchIcon = Search as unknown as React.ComponentType<{ color?: string; size?: number }>;
const XIcon = X as unknown as React.ComponentType<{ color?: string; size?: number }>;

const SORT_LABELS: Record<SortKey, string> = {
  date: 'Récent',
  name: 'Nom',
  giver: 'Donneur',
};

const GRID_GAP = SPACING.md;
const SCREEN_PADDING = SPACING.lg;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { gifts, loading } = useGifts();
  const { checkGiftLimit } = usePremiumGate();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('date');

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = useMemo(
    () => (screenWidth - SCREEN_PADDING * 2 - GRID_GAP) / 2,
    [screenWidth]
  );

  const filtered = useMemo(() => {
    let result = [...gifts];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) => g.name.toLowerCase().includes(q) || g.giver.toLowerCase().includes(q)
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
      <ScreenWrapper padded={false}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  const goAdd = () => {
    if (checkGiftLimit()) navigation.navigate('AddGift', undefined);
  };

  const countLabel = `${gifts.length} cadeau${gifts.length !== 1 ? 'x' : ''}`;

  return (
    <ScreenWrapper padded={false}>
      <View style={{ paddingHorizontal: SCREEN_PADDING, paddingTop: SPACING.sm }}>
        {/* Header éditorial */}
        <StyledText variant="display" style={{ marginBottom: 2 }}>
          Mes cadeaux
        </StyledText>
        <StyledText variant="small" color={COLORS.textSecondary}>
          {countLabel}
        </StyledText>

        {/* Search */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.sm,
            marginTop: SPACING.lg,
            backgroundColor: COLORS.surface,
            borderRadius: RADIUS.lg,
            paddingHorizontal: SPACING.md,
            paddingVertical: SPACING.sm + 2,
            borderWidth: 1,
            borderColor: COLORS.border,
            ...SHADOWS.sm,
          }}
        >
          <SearchIcon color={COLORS.textTertiary} size={18} />
          <TextInput
            style={{
              flex: 1,
              fontFamily: 'Inter_400Regular',
              fontSize: 15,
              lineHeight: 22,
              color: COLORS.text,
              padding: 0,
            }}
            placeholder="Chercher un cadeau ou un donneur…"
            placeholderTextColor={COLORS.textTertiary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <XIcon color={COLORS.textTertiary} size={16} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Sort chips */}
        <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md }}>
          {(['date', 'name', 'giver'] as SortKey[]).map((key) => (
            <Chip
              key={key}
              label={SORT_LABELS[key]}
              selected={sort === key}
              onPress={() => setSort(key)}
            />
          ))}
        </View>
      </View>

      {/* Grid or empty */}
      {filtered.length === 0 ? (
        <EmptyState
          emoji={search ? '🔎' : '🎁'}
          title={search ? 'Aucun résultat' : 'Votre boîte est vide'}
          description={
            search
              ? 'Essayez un autre terme de recherche.'
              : 'Commencez à garder en mémoire les cadeaux que vous offrez et recevez.'
          }
          ctaLabel={!search ? 'Ajouter un cadeau' : undefined}
          onCtaPress={!search ? goAdd : undefined}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING,
            paddingTop: SPACING.lg,
            paddingBottom: 120,
          }}
          columnWrapperStyle={{ gap: GRID_GAP, marginBottom: GRID_GAP }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GiftCard
              gift={item}
              width={cardWidth}
              onPress={() =>
                navigation.navigate('GiftDetail', { giftId: item.id, backTitle: 'Cadeaux' })
              }
            />
          )}
        />
      )}

      <FAB onPress={goAdd} accessibilityLabel="Ajouter un cadeau" />
    </ScreenWrapper>
  );
}
