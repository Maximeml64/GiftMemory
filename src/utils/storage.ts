// src/utils/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { Gift } from '../types';

const GIFTS_KEY = '@gift_memory_gifts';
const IMAGES_DIR = FileSystem.documentDirectory + 'gift_images/';

// Largest dimension a gift photo is allowed to be after import. The picker
// can return 4000×3000 photos that bloat the sandbox; this cap brings each
// photo well under 500 KB without visible quality loss for our card UI.
const MAX_IMAGE_DIMENSION = 1280;
const IMAGE_QUALITY = 0.75;

async function ensureImagesDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(IMAGES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
}

// Pipe a picker URI through ImageManipulator (resize + JPEG compress) and
// copy the result to its final destination inside gift_images/.
async function processAndCopy(sourceUri: string, destUri: string): Promise<void> {
  const manipulated = await ImageManipulator.manipulateAsync(
    sourceUri,
    [{ resize: { width: MAX_IMAGE_DIMENSION } }],
    { compress: IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG },
  );
  await FileSystem.copyAsync({ from: manipulated.uri, to: destUri });
}

export async function saveImageLocally(sourceUri: string, giftId: string): Promise<string> {
  await ensureImagesDir();
  const destUri = `${IMAGES_DIR}${giftId}.jpg`;
  await processAndCopy(sourceUri, destUri);
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

function isValidGift(g: unknown): g is Gift {
  if (!g || typeof g !== 'object') return false;
  const x = g as Record<string, unknown>;
  return (
    typeof x.id === 'string' &&
    typeof x.name === 'string' &&
    typeof x.giver === 'string' &&
    typeof x.occasion === 'string' &&
    typeof x.date === 'string' &&
    typeof x.createdAt === 'string' &&
    typeof x.category === 'string'
  );
}

export async function loadGifts(): Promise<Gift[]> {
  try {
    const raw = await AsyncStorage.getItem(GIFTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error('loadGifts: stored value is not an array, resetting');
      return [];
    }
    // Silently drop malformed entries — better than crashing on first read.
    // Pre-direction Gifts default to 'received', pre-status Gifts to 'done'
    // so existing data behaves as before the new features.
    return parsed.filter(isValidGift).map((g) => ({
      ...g,
      direction: g.direction ?? 'received',
      status: g.status ?? 'done',
    }));
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
  if (gift?.additionalPhotos?.length) {
    await Promise.all(gift.additionalPhotos.map((uri) => deleteImageLocally(uri)));
  }
  const updated = gifts.filter((g) => g.id !== giftId);
  await saveGifts(updated);
  return updated;
}

// Helper for saving an additional photo with a per-photo id suffix.
export async function saveAdditionalPhoto(sourceUri: string, giftId: string): Promise<string> {
  await ensureImagesDir();
  const suffix = Math.random().toString(36).slice(2, 8);
  const destUri = `${IMAGES_DIR}${giftId}_${suffix}.jpg`;
  await processAndCopy(sourceUri, destUri);
  return destUri;
}
