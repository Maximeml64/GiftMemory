// src/types/index.ts

export type Occasion = 'Anniversaire' | 'Noël' | 'Naissance' | 'Mariage' | 'Autre';
export type GiftCategory = 'Cadeau' | 'Vin & Spiritueux';
export type EventType = 'Anniversaire' | 'Mariage' | 'Naissance' | 'Autre';
export type GiftDirection = 'received' | 'given';

export interface Gift {
  id: string;
  imageUri: string | null;
  name: string;
  // Personne associée : donneur si direction='received', destinataire si direction='given'
  giver: string;
  // 'received' = cadeau reçu (giver = donneur)
  // 'given'    = cadeau offert (giver = destinataire)
  // Champ optionnel pour rétrocompat avec les Gifts créés avant la feature.
  // À la lecture, un Gift sans direction est traité comme 'received'.
  direction?: GiftDirection;
  occasion: Occasion;
  date: string;
  notes?: string;
  createdAt: string;
  category: GiftCategory;
  vintage?: string;
  appellation?: string;
  quantity?: number;
}

export interface CalendarEvent {
  id: string;
  personName: string;
  type: EventType;
  month: number;
  day: number;
  reminderDays: number;
  giftGiven?: string;
  notes?: string;
  createdAt: string;
}

export type RootStackParamList = {
  Main: undefined;
  AddGift: { giftId?: string } | undefined;
  GiftDetail: { giftId: string; backTitle?: string };
  GiverDetail: { giverName: string; backTitle?: string };
  AddEvent: { eventId?: string } | undefined;
  EventDetail: { eventId: string; backTitle?: string };
  Paywall: undefined;
};

export type TabParamList = {
  Home: undefined;
  Gifts: undefined;
  Events: undefined;
  Givers: undefined;
  Settings: undefined;
};