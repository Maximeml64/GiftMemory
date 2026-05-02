// src/utils/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Gift } from '../types';

const GIFTS_KEY = '@gift_memory_gifts';
const IMAGES_DIR = FileSystem.documentDirectory + 'gift_images/';

async function ensureImagesDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(IMAGES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
}

export async function saveImageLocally(sourceUri: string, giftId: string): Promise<string> {
  await ensureImagesDir();
  const extension = sourceUri.split('.').pop()?.split('?')[0] || 'jpg';
  const destUri = `${IMAGES_DIR}${giftId}.${extension}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

export async function deleteImageLocally(imageUri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(imageUri);
    if (info.exists) {
      await FileSystem.deleteAsync(imageUri);
    }
  } catch (e) {
    // Silently fail — image may already be deleted
  }
}

export async function loadGifts(): Promise<Gift[]> {
  try {
    const raw = await AsyncStorage.getItem(GIFTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('loadGifts error:', e);
    return [];
  }
}

// Call once at boot from GiftsContext.refresh() — not on every read/write
export async function validateImageUris(gifts: Gift[]): Promise<Gift[]> {
  return Promise.all(
    gifts.map(async (gift) => {
      if (!gift.imageUri) return gift;
      try {
        const info = await FileSystem.getInfoAsync(gift.imageUri);
        return info.exists ? gift : { ...gift, imageUri: null };
      } catch {
        return { ...gift, imageUri: null };
      }
    })
  );
}

export async function saveGifts(gifts: Gift[]): Promise<void> {
  try {
    await AsyncStorage.setItem(GIFTS_KEY, JSON.stringify(gifts));
  } catch (e) {
    console.error('saveGifts error:', e);
    throw e;
  }
}

export async function upsertGift(gift: Gift): Promise<Gift[]> {
  const gifts = await loadGifts();
  const index = gifts.findIndex((g) => g.id === gift.id);
  if (index >= 0) {
    gifts[index] = gift;
  } else {
    gifts.unshift(gift);
  }
  await saveGifts(gifts);
  return gifts;
}

export async function deleteGift(giftId: string): Promise<Gift[]> {
  const gifts = await loadGifts();
  const gift = gifts.find((g) => g.id === giftId);
  if (gift?.imageUri) {
    await deleteImageLocally(gift.imageUri);
  }
  const updated = gifts.filter((g) => g.id !== giftId);
  await saveGifts(updated);
  return updated;
}
