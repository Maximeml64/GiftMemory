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
type DirectionFilter = 'all' | 'received' | 'given';
type StatusView = 'done' | 'idea';

const SearchIcon = Search as unknown as React.ComponentType<{ color?: string; size?: number }>;
const XIcon = X as unknown as React.ComponentType<{ color?: string; size?: number }>;

const SORT_LABELS: Record<SortKey, string> = {
  date: 'Récent',
  name: 'Nom',
  giver: 'Personne',
};

const DIRECTION_LABELS: Record<DirectionFilter, string> = {
  all: 'Tous',
  received: 'Reçus',
  given: 'Offerts',
};

const GRID_GAP = SPACING.md;
const SCREEN_PADDING = SPACING.lg;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { gifts, loading } = useGifts();
  const { checkGiftLimit } = usePremiumGate();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('date');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [statusView, setStatusView] = useState<StatusView>('done');

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = useMemo(
    () => (screenWidth - SCREEN_PADDING * 2 - GRID_GAP) / 2,
    [screenWidth]
  );

  const filtered = useMemo(() => {
    let result = gifts.filter((g) => (g.status ?? 'done') === statusView);
    if (directionFilter !== 'all') {
      result = result.filter((g) => (g.direction ?? 'received') === directionFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.giver.toLowerCase().includes(q) ||
          (g.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    result.sort((a, b) => {
      if (sort === 'date') return b.date.localeCompare(a.date);
      if (sort === 'name') return a.name.localeCompare(b.name, 'fr');
      return a.giver.localeCompare(b.giver, 'fr');
    });
    return result;
  }, [gifts, search, sort, directionFilter, statusView]);

  const doneGifts = useMemo(() => gifts.filter((g) => (g.status ?? 'done') === 'done'), [gifts]);
  const ideaGifts = useMemo(() => gifts.filter((g) => g.status === 'idea'), [gifts]);
  const receivedCount = useMemo(
    () => doneGifts.filter((g) => (g.direction ?? 'received') === 'received').length,
    [doneGifts]
  );
  const givenCount = doneGifts.length - receivedCount;

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

  const headerTitle = statusView === 'idea' ? 'Mes idées' : 'Mes cadeaux';
  const countLabel =
    statusView === 'idea'
      ? ideaGifts.length === 0
        ? 'Aucune idée notée'
        : `${ideaGifts.length} idée${ideaGifts.length > 1 ? 's' : ''} en réserve`
      : doneGifts.length === 0
        ? 'Aucun cadeau'
        : `${doneGifts.length} cadeau${doneGifts.length > 1 ? 'x' : ''} · ${receivedCount} reçu${receivedCount > 1 ? 's' : ''} · ${givenCount} offert${givenCount > 1 ? 's' : ''}`;

  return (
    <ScreenWrapper padded={false}>
      <View style={{ paddingHorizontal: SCREEN_PADDING, paddingTop: SPACING.sm }}>
        {/* Header éditorial */}
        <StyledText variant="display" style={{ marginBottom: 2 }}>
          {headerTitle}
        </StyledText>
        <StyledText variant="small" color={COLORS.textSecondary}>
          {countLabel}
        </StyledText>

        {/* Status view: Effectifs / Idées */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: COLORS.surfaceAlt,
            borderRadius: RADIUS.full,
            padding: 4,
            marginTop: SPACING.md,
          }}
        >
          {(
            [
              { key: 'done', label: 'Effectifs' },
              { key: 'idea', label: 'Idées' },
            ] as { key: StatusView; label: string }[]
          ).map(({ key, label }) => {
            const active = statusView === key;
            const count = key === 'idea' ? ideaGifts.length : doneGifts.length;
            return (
              <TouchableOpacity
                key={key}
                activeOpacity={0.85}
                onPress={() => setStatusView(key)}
                style={{
                  flex: 1,
                  paddingVertical: SPACING.sm + 2,
                  borderRadius: RADIUS.full,
                  backgroundColor: active ? COLORS.surface : 'transparent',
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: SPACING.xs,
                  ...(active ? SHADOWS.sm : {}),
                }}
              >
                <StyledText
                  variant="bodyMedium"
                  color={active ? COLORS.primary : COLORS.textSecondary}
                >
                  {label}
                </StyledText>
                <StyledText
                  variant="caption"
                  color={active ? COLORS.primary : COLORS.textTertiary}
                >
                  {count}
                </StyledText>
              </TouchableOpacity>
            );
          })}
        </View>

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
            placeholder="Chercher un cadeau ou une personne…"
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

        {/* Direction filter */}
        <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md }}>
          {(['all', 'received', 'given'] as DirectionFilter[]).map((key) => (
            <Chip
              key={key}
              label={DIRECTION_LABELS[key]}
              selected={directionFilter === key}
              onPress={() => setDirectionFilter(key)}
            />
          ))}
        </View>

        {/* Sort chips */}
        <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm }}>
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
          emoji={search ? '🔎' : statusView === 'idea' ? '💡' : '🎁'}
          title={
            search
              ? 'Aucun résultat'
              : statusView === 'idea'
                ? 'Aucune idée notée'
                : 'Votre boîte est vide'
          }
          description={
            search
              ? 'Essayez un autre terme de recherche.'
              : statusView === 'idea'
                ? 'Notez vos envies — les vôtres ou celles que vous voulez offrir.'
                : 'Commencez à garder en mémoire les cadeaux que vous offrez et recevez.'
          }
          ctaLabel={!search ? (statusView === 'idea' ? 'Ajouter une idée' : 'Ajouter un cadeau') : undefined}
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
