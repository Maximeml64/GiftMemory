// src/types/index.ts

export type Occasion = 'Anniversaire' | 'Noël' | 'Naissance' | 'Mariage' | 'Autre';

export interface Gift {
  id: string;
  imageUri: string | null;
  name: string;
  giver: string;
  occasion: Occasion;
  date: string; // ISO string
  notes?: string;
  createdAt: string; // ISO string
}

export type RootStackParamList = {
  Main: undefined;
  AddGift: { giftId?: string } | undefined;
  GiftDetail: { giftId: string };
  GiverDetail: { giverName: string };
};

export type TabParamList = {
  Home: undefined;
  Givers: undefined;
};
