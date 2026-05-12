// src/screens/OnboardingScreen.tsx

import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Button, StyledText } from '../components/ui';
import { COLORS, OCCASIONS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

const { width } = Dimensions.get('window');

const ONBOARDING_KEY = '@gift_memory_onboarding_done';

interface Slide {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  bg: string;
}

const SLIDES: Slide[] = [
  {
    id: '1',
    emoji: '🎁',
    title: 'Une boîte\nà souvenirs',
    subtitle:
      'Notez les cadeaux que l\'on vous offre. Qui, quand, pour quelle occasion — pour ne plus jamais oublier.',
    bg: OCCASIONS.Anniversaire.bg,
  },
  {
    id: '2',
    emoji: '🎂',
    title: 'Les dates\nqui comptent',
    subtitle:
      'Anniversaires, fêtes, événements importants : recevez un rappel discret avant qu\'il ne soit trop tard.',
    bg: OCCASIONS.Naissance.bg,
  },
  {
    id: '3',
    emoji: '✨',
    title: 'Simple\net discret',
    subtitle:
      'Une photo, un nom, un donneur. Vos souvenirs restent sur votre appareil, en toute confidentialité.',
    bg: OCCASIONS.Mariage.bg,
  },
];

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  async function finish() {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onDone();
  }

  function next() {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      finish();
    }
  }

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top', 'bottom']}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        renderItem={({ item }) => (
          <View
            style={{
              width,
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: SPACING.xl,
              paddingBottom: 140,
            }}
          >
            <View
              style={{
                width: 180,
                height: 180,
                borderRadius: RADIUS.full,
                backgroundColor: item.bg,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SPACING.xxl,
                ...SHADOWS.md,
              }}
            >
              <StyledText style={{ fontSize: 80, lineHeight: 90 }}>{item.emoji}</StyledText>
            </View>
            <StyledText variant="h1" align="center" style={{ marginBottom: SPACING.md }}>
              {item.title}
            </StyledText>
            <StyledText
              variant="body"
              align="center"
              color={COLORS.textSecondary}
              style={{ maxWidth: 320 }}
            >
              {item.subtitle}
            </StyledText>
          </View>
        )}
      />

      {/* Dots */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: SPACING.sm,
          marginBottom: SPACING.xl,
        }}
      >
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === currentIndex ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === currentIndex ? COLORS.primary : COLORS.border,
            }}
          />
        ))}
      </View>

      {/* Buttons */}
      <View style={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg, gap: SPACING.sm }}>
        <Button
          label={isLast ? 'Commencer' : 'Suivant'}
          onPress={next}
          fullWidth
          size="lg"
        />
        {!isLast ? (
          <TouchableOpacity
            onPress={finish}
            activeOpacity={0.7}
            style={{ alignItems: 'center', paddingVertical: SPACING.sm }}
          >
            <StyledText variant="body" color={COLORS.textSecondary}>
              Passer
            </StyledText>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export async function hasSeenOnboarding(): Promise<boolean> {
  const val = await AsyncStorage.getItem(ONBOARDING_KEY);
  return val === 'true';
}
