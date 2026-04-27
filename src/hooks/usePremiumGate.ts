// src/hooks/usePremiumGate.ts

import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePurchase } from '../store/PurchaseContext';
import { useGifts } from '../store/GiftsContext';
import { useEvents } from '../store/EventsContext';
import { RootStackParamList } from '../types';

const FREE_GIFTS_LIMIT = 10;
const FREE_EVENTS_LIMIT = 5;

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function usePremiumGate() {
  const { isPremium } = usePurchase();
  const { gifts } = useGifts();
  const { events } = useEvents();
  const navigation = useNavigation<Nav>();

  const checkGiftLimit = useCallback((): boolean => {
    if (isPremium) return true;
    if (gifts.length >= FREE_GIFTS_LIMIT) {
      navigation.navigate('Paywall');
      return false;
    }
    return true;
  }, [isPremium, gifts.length, navigation]);

  const checkEventLimit = useCallback((): boolean => {
    if (isPremium) return true;
    if (events.length >= FREE_EVENTS_LIMIT) {
      navigation.navigate('Paywall');
      return false;
    }
    return true;
  }, [isPremium, events.length, navigation]);

  return { isPremium, checkGiftLimit, checkEventLimit };
}