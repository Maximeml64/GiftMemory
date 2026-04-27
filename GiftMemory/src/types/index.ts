// src/types/index.ts

export type Occasion = 'Anniversaire' | 'Noël' | 'Naissance' | 'Mariage' | 'Autre';

export type GiftCategory = 'Cadeau' | 'Vin & Spiritueux';

export interface Gift {
  id: string;
  imageUri: string | null;
  name: string;
  giver: string;
  occasion: Occasion;
  date: string; // ISO string
  notes?: string;
  createdAt: string; // ISO string
  // Category
  category: GiftCategory;
  // Wine/spirits fields (only when category === 'Vin & Spiritueux')
  vintage?: string;       // millésime ex: "2019"
  appellation?: string;   // ex: "Bordeaux", "Champagne"
  quantity?: number;      // nombre de bouteilles
}

export type RootStackParamList = {
  Main: undefined;
  AddGift: { giftId?: string } | undefined;
  GiftDetail: { giftId: string };
  GiverDetail: { giverName: string };
  Cgu: undefined;
  Privacy: undefined;
};

export type TabParamList = {
  Home: undefined;
  Givers: undefined;
  Settings: undefined;
};
