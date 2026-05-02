// src/store/GiftsContext.tsx

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Gift } from '../types';
import { loadGifts, upsertGift, deleteGift, validateImageUris, saveGifts } from '../utils/storage';

interface GiftsState {
  gifts: Gift[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_GIFTS'; payload: Gift[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

function reducer(state: GiftsState, action: Action): GiftsState {
  switch (action.type) {
    case 'SET_GIFTS':
      return { ...state, gifts: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

const initialState: GiftsState = {
  gifts: [],
  loading: true,
  error: null,
};

interface GiftsContextValue extends GiftsState {
  saveGift: (gift: Gift) => Promise<void>;
  removeGift: (giftId: string) => Promise<void>;
  getGiftById: (giftId: string) => Gift | undefined;
  getGiftsByGiver: (giverName: string) => Gift[];
  getUniqueGivers: () => string[];
  refresh: () => Promise<void>;
}

const GiftsContext = createContext<GiftsContextValue | null>(null);

// Validate image URIs only once per app session, not on every save
let hasValidatedOnBoot = false;

export function GiftsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const refresh = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      let gifts = await loadGifts();
      if (!hasValidatedOnBoot) {
        hasValidatedOnBoot = true;
        const validated = await validateImageUris(gifts);
        const hasChanges = validated.some((g, i) => g.imageUri !== gifts[i].imageUri);
        if (hasChanges) {
          await saveGifts(validated);
          gifts = validated;
        }
      }
      dispatch({ type: 'SET_GIFTS', payload: gifts });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Erreur de chargement' });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveGift = useCallback(async (gift: Gift) => {
    try {
      const updated = await upsertGift(gift);
      dispatch({ type: 'SET_GIFTS', payload: updated });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Erreur de sauvegarde' });
      throw e;
    }
  }, []);

  const removeGift = useCallback(async (giftId: string) => {
    try {
      const updated = await deleteGift(giftId);
      dispatch({ type: 'SET_GIFTS', payload: updated });
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: 'Erreur de suppression' });
      throw e;
    }
  }, []);

  const getGiftById = useCallback(
    (giftId: string) => state.gifts.find((g) => g.id === giftId),
    [state.gifts]
  );

  const getGiftsByGiver = useCallback(
    (giverName: string) =>
      state.gifts.filter(
        (g) => g.giver.toLowerCase() === giverName.toLowerCase()
      ),
    [state.gifts]
  );

  const getUniqueGivers = useCallback(() => {
    const givers = state.gifts.map((g) => g.giver);
    return [...new Set(givers)].sort((a, b) => a.localeCompare(b, 'fr'));
  }, [state.gifts]);

  return (
    <GiftsContext.Provider
      value={{
        ...state,
        saveGift,
        removeGift,
        getGiftById,
        getGiftsByGiver,
        getUniqueGivers,
        refresh,
      }}
    >
      {children}
    </GiftsContext.Provider>
  );
}

export function useGifts(): GiftsContextValue {
  const ctx = useContext(GiftsContext);
  if (!ctx) throw new Error('useGifts must be used within GiftsProvider');
  return ctx;
}
