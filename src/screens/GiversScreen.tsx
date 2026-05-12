// src/screens/GiversScreen.tsx

import React, { useMemo } from 'react';
import { FlatList, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../types';
import { useGifts } from '../store/GiftsContext';
import {
  Divider,
  EmptyState,
  GiverRow,
  ScreenWrapper,
  StyledText,
} from '../components/ui';
import { COLORS, SPACING } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SCREEN_PADDING = SPACING.lg;

export default function GiversScreen() {
  const navigation = useNavigation<Nav>();
  const { gifts, getUniqueGivers } = useGifts();

  const givers = useMemo(
    () =>
      getUniqueGivers().map((name) => ({
        name,
        count: gifts.filter((g) => g.giver.toLowerCase() === name.toLowerCase()).length,
      })),
    [gifts, getUniqueGivers]
  );

  return (
    <ScreenWrapper padded={false}>
      <View style={{ paddingHorizontal: SCREEN_PADDING, paddingTop: SPACING.sm }}>
        <StyledText variant="display" style={{ marginBottom: 2 }}>
          Donneurs
        </StyledText>
        <StyledText variant="small" color={COLORS.textSecondary}>
          {givers.length === 0
            ? 'Personne enregistrée pour l\'instant'
            : `${givers.length} personne${givers.length > 1 ? 's' : ''}`}
        </StyledText>
      </View>

      {givers.length === 0 ? (
        <EmptyState
          emoji="👥"
          title="Aucun donneur"
          description="Les personnes qui vous offrent des cadeaux apparaîtront ici dès que vous en enregistrez un."
        />
      ) : (
        <FlatList
          data={givers}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING,
            paddingTop: SPACING.md,
            paddingBottom: 40,
          }}
          ItemSeparatorComponent={() => <Divider marginVertical={0} inset={56} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <GiverRow
              name={item.name}
              giftCount={item.count}
              onPress={() =>
                navigation.navigate('GiverDetail', {
                  giverName: item.name,
                  backTitle: 'Donneurs',
                })
              }
            />
          )}
        />
      )}
    </ScreenWrapper>
  );
}
