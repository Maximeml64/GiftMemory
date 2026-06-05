// src/screens/AddGiftScreen.tsx

import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useHeaderHeight } from '@react-navigation/elements';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';

import {
  RootStackParamList,
  Gift,
  GiftCategory,
  GiftDirection,
  GiftStatus,
  Occasion,
} from '../types';
import { useGifts } from '../store/GiftsContext';
import {
  deleteImageLocally,
  saveAdditionalPhoto,
  saveImageLocally,
  saveReceiptImage,
} from '../utils/storage';
import OccasionPicker from '../components/OccasionPicker';
import DatePickerField from '../components/DatePickerField';
import {
  Button,
  PencilIcon,
  PlusIcon,
  StyledText,
  XIcon,
} from '../components/ui';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';
import { todayISO } from '../utils/dateUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddGift'>;

const SCREEN_PADDING = SPACING.lg;
const ADDITIONAL_THUMB = 72;

function FieldLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: SPACING.xs, marginBottom: SPACING.xs }}>
      <StyledText variant="eyebrow">{children}</StyledText>
      {optional ? (
        <StyledText variant="caption" color={COLORS.textTertiary}>(optionnel)</StyledText>
      ) : null}
    </View>
  );
}

const fieldInputStyle = {
  backgroundColor: COLORS.surface,
  borderRadius: RADIUS.md,
  paddingHorizontal: SPACING.md,
  paddingVertical: 14,
  borderWidth: 1,
  borderColor: COLORS.border,
  fontFamily: 'Inter_400Regular',
  fontSize: 15,
  lineHeight: 22,
  color: COLORS.text,
};

function SegmentedPill<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: COLORS.surfaceAlt,
        borderRadius: RADIUS.full,
        padding: 4,
      }}
    >
      {options.map(({ key, label }) => {
        const active = value === key;
        return (
          <TouchableOpacity
            key={key}
            activeOpacity={0.85}
            onPress={() => onChange(key)}
            style={{
              flex: 1,
              paddingVertical: SPACING.sm + 2,
              borderRadius: RADIUS.full,
              backgroundColor: active ? COLORS.surface : 'transparent',
              alignItems: 'center',
              ...(active ? SHADOWS.sm : {}),
            }}
          >
            <StyledText
              variant="bodyMedium"
              color={active ? COLORS.primary : COLORS.textSecondary}
            >
              {label}
            </StyledText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AddGiftScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const headerHeight = useHeaderHeight();
  const { saveGift, getGiftById } = useGifts();

  const giftId = route.params?.giftId;
  const isEditing = !!giftId;
  const existing = giftId ? getGiftById(giftId) : undefined;

  const [status, setStatus] = useState<GiftStatus>(
    existing?.status ?? route.params?.initialStatus ?? 'done'
  );
  const [category, setCategory] = useState<GiftCategory>(existing?.category ?? 'Cadeau');
  const [direction, setDirection] = useState<GiftDirection>(existing?.direction ?? 'received');
  const [name, setName] = useState(existing?.name ?? '');
  const [giver, setGiver] = useState(existing?.giver ?? '');
  const [occasion, setOccasion] = useState<Occasion>(existing?.occasion ?? 'Anniversaire');
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [imageUri, setImageUri] = useState<string | null>(existing?.imageUri ?? null);
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [additionalPhotos, setAdditionalPhotos] = useState<string[]>(
    existing?.additionalPhotos ?? []
  );
  // Tracks photos newly picked this session that still live at their picker URI
  // and need to be copied into the gift_images dir on save.
  const [stagedAdditionalPhotos, setStagedAdditionalPhotos] = useState<string[]>([]);
  const [receiptUri, setReceiptUri] = useState<string | null>(existing?.receiptUri ?? null);
  const [newReceiptUri, setNewReceiptUri] = useState<string | null>(null);
  const [price, setPrice] = useState(
    existing?.price !== undefined ? existing.price.toString().replace('.', ',') : ''
  );
  const [purchaseLocation, setPurchaseLocation] = useState(existing?.purchaseLocation ?? '');
  const [purchaseUrl, setPurchaseUrl] = useState(existing?.purchaseUrl ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [vintage, setVintage] = useState(existing?.vintage ?? '');
  const [appellation, setAppellation] = useState(existing?.appellation ?? '');
  const [quantity, setQuantity] = useState(existing?.quantity?.toString() ?? '1');
  const [saving, setSaving] = useState(false);

  const isWine = category === 'Vin & Spiritueux';
  const isIdea = status === 'idea';

  async function pickMainImage(fromCamera: boolean) {
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission refusée', "L'accès à la caméra est nécessaire.");
        return;
      }
    }
    // No allowsEditing/aspect: keep the photo exactly as framed in the
    // viewfinder instead of forcing a square crop that cuts portrait subjects.
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          quality: 0.8,
        });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setNewImageUri(result.assets[0].uri);
    }
  }

  function showImageOptions() {
    const options: Array<{ text: string; onPress?: () => void; style?: 'destructive' | 'cancel' }> = [
      { text: 'Caméra', onPress: () => pickMainImage(true) },
      { text: 'Galerie', onPress: () => pickMainImage(false) },
    ];
    if (imageUri) {
      options.push({
        text: 'Supprimer la photo',
        style: 'destructive',
        onPress: () => { setImageUri(null); setNewImageUri(null); },
      });
    }
    options.push({ text: 'Annuler', style: 'cancel' });
    Alert.alert('Photo', 'Choisir la source', options);
  }

  async function pickReceipt(fromCamera: boolean) {
    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission refusée', "L'accès à la caméra est nécessaire.");
        return;
      }
    }
    // No crop: a receipt is tall and the whole thing must stay readable.
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled && result.assets[0]) {
      setReceiptUri(result.assets[0].uri);
      setNewReceiptUri(result.assets[0].uri);
    }
  }

  function showReceiptOptions() {
    const options: Array<{ text: string; onPress?: () => void; style?: 'destructive' | 'cancel' }> = [
      { text: 'Caméra', onPress: () => pickReceipt(true) },
      { text: 'Galerie', onPress: () => pickReceipt(false) },
    ];
    if (receiptUri) {
      options.push({
        text: 'Supprimer le ticket',
        style: 'destructive',
        onPress: () => { setReceiptUri(null); setNewReceiptUri(null); },
      });
    }
    options.push({ text: 'Annuler', style: 'cancel' });
    Alert.alert('Ticket de caisse', 'Choisir la source', options);
  }

  async function addAdditionalPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAdditionalPhotos((prev) => [...prev, uri]);
      setStagedAdditionalPhotos((prev) => [...prev, uri]);
    }
  }

  function removeAdditionalPhoto(uri: string) {
    setAdditionalPhotos((prev) => prev.filter((p) => p !== uri));
    setStagedAdditionalPhotos((prev) => prev.filter((p) => p !== uri));
  }

  function parsePrice(raw: string): number | undefined {
    if (!raw.trim()) return undefined;
    const normalized = raw.replace(',', '.').replace(/[^\d.]/g, '');
    const n = parseFloat(normalized);
    return isFinite(n) && n >= 0 ? n : undefined;
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert(
        'Champ requis',
        isWine ? 'Entrez un nom pour la bouteille.' : 'Entrez un nom pour le cadeau.'
      );
      return;
    }
    if (!giver.trim()) {
      Alert.alert(
        'Champ requis',
        direction === 'received'
          ? 'Entrez le nom de la personne qui vous l\'a offert (ou doit vous l\'offrir).'
          : 'Entrez le nom de la personne à qui vous l\'offrez (ou voulez l\'offrir).'
      );
      return;
    }
    setSaving(true);
    try {
      const id = existing?.id ?? Crypto.randomUUID();

      // Main photo handling
      let finalImageUri = imageUri;
      if (newImageUri) {
        if (isEditing && existing?.imageUri && existing.imageUri !== newImageUri) {
          await deleteImageLocally(existing.imageUri);
        }
        finalImageUri = await saveImageLocally(newImageUri, id);
      }
      if (isEditing && existing?.imageUri && imageUri === null && !newImageUri) {
        await deleteImageLocally(existing.imageUri);
      }

      // Receipt handling (same lifecycle as the main photo)
      let finalReceiptUri = receiptUri;
      if (newReceiptUri) {
        finalReceiptUri = await saveReceiptImage(newReceiptUri, id);
      }
      if (isEditing && existing?.receiptUri && receiptUri === null && !newReceiptUri) {
        await deleteImageLocally(existing.receiptUri);
      }

      // Additional photos: copy any staged URIs into permanent storage,
      // and delete any previously-saved URIs that the user removed.
      const previousAdditional = existing?.additionalPhotos ?? [];
      const removedAdditional = previousAdditional.filter(
        (p) => !additionalPhotos.includes(p)
      );
      await Promise.all(removedAdditional.map((p) => deleteImageLocally(p)));

      const persistedAdditional: string[] = [];
      for (const p of additionalPhotos) {
        if (stagedAdditionalPhotos.includes(p)) {
          // Newly picked from gallery → copy into gift_images
          const saved = await saveAdditionalPhoto(p, id);
          persistedAdditional.push(saved);
        } else {
          // Already in gift_images from a previous save
          persistedAdditional.push(p);
        }
      }

      const parsedPrice = parsePrice(price);

      const gift: Gift = {
        id,
        name: name.trim(),
        giver: giver.trim(),
        direction,
        status,
        occasion,
        date,
        imageUri: finalImageUri,
        additionalPhotos: persistedAdditional.length > 0 ? persistedAdditional : undefined,
        receiptUri: finalReceiptUri || undefined,
        price: parsedPrice,
        purchaseLocation: purchaseLocation.trim() || undefined,
        purchaseUrl: purchaseUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        category,
        ...(isWine && {
          vintage: vintage.trim() || undefined,
          appellation: appellation.trim() || undefined,
          quantity: Math.min(999, Math.max(1, parseInt(quantity, 10) || 1)),
        }),
      };
      await saveGift(gift);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Erreur', `Impossible de sauvegarder.\n${msg}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING,
            paddingTop: SPACING.md,
            paddingBottom: 80,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {/* Status: Idée / Effectif */}
          <View style={{ marginBottom: SPACING.md }}>
            <SegmentedPill
              options={[
                { key: 'idea', label: 'Idée' },
                { key: 'done', label: 'Effectif' },
              ]}
              value={status}
              onChange={setStatus}
            />
            <StyledText
              variant="caption"
              color={COLORS.textTertiary}
              style={{ marginTop: SPACING.xs, marginLeft: SPACING.sm }}
            >
              {isIdea
                ? direction === 'received'
                  ? 'Une envie de cadeau pour vous-même'
                  : 'Une idée à offrir, pas encore concrétisée'
                : 'Un cadeau réellement reçu ou offert'}
            </StyledText>
          </View>

          {/* Direction: Reçu / Offert */}
          <View style={{ marginBottom: SPACING.lg }}>
            <SegmentedPill
              options={[
                { key: 'received', label: 'Reçu' },
                { key: 'given', label: 'Offert' },
              ]}
              value={direction}
              onChange={setDirection}
            />
          </View>

          {/* Category toggle */}
          <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl }}>
            {(['Cadeau', 'Vin & Spiritueux'] as GiftCategory[]).map((cat) => {
              const active = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.85}
                  onPress={() => setCategory(cat)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: SPACING.xs,
                    paddingVertical: SPACING.md,
                    borderRadius: RADIUS.lg,
                    backgroundColor: active ? COLORS.primaryMuted : COLORS.surface,
                    borderWidth: 1,
                    borderColor: active ? COLORS.primary : COLORS.border,
                  }}
                >
                  <StyledText style={{ fontSize: 18 }}>{cat === 'Cadeau' ? '🎁' : '🍷'}</StyledText>
                  <StyledText
                    variant="bodyMedium"
                    color={active ? COLORS.primary : COLORS.textSecondary}
                  >
                    {cat}
                  </StyledText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Main image picker */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={showImageOptions}
            style={{
              alignSelf: 'center',
              width: 180,
              height: 180,
              borderRadius: RADIUS.xl,
              overflow: 'hidden',
              marginBottom: SPACING.md,
              backgroundColor: COLORS.surface,
              ...SHADOWS.md,
              position: 'relative',
            }}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
            ) : (
              <View
                style={{
                  flex: 1,
                  backgroundColor: COLORS.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderStyle: 'dashed',
                  borderRadius: RADIUS.xl,
                  gap: SPACING.sm,
                }}
              >
                <StyledText style={{ fontSize: 36, lineHeight: 44 }}>{isWine ? '🍷' : '📸'}</StyledText>
                <StyledText variant="smallMedium" color={COLORS.textSecondary}>
                  Ajouter une photo
                </StyledText>
              </View>
            )}
            <View
              style={{
                position: 'absolute',
                bottom: SPACING.sm,
                right: SPACING.sm,
                width: 36,
                height: 36,
                borderRadius: RADIUS.full,
                backgroundColor: COLORS.surface,
                alignItems: 'center',
                justifyContent: 'center',
                ...SHADOWS.sm,
              }}
            >
              <PencilIcon color={COLORS.primary} size={16} />
            </View>
          </TouchableOpacity>

          {/* Additional photos */}
          <View style={{ marginBottom: SPACING.xxl }}>
            <StyledText
              variant="caption"
              color={COLORS.textTertiary}
              align="center"
              style={{ marginBottom: SPACING.sm }}
            >
              Photos supplémentaires (carte, emballage…)
            </StyledText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: SPACING.sm, paddingHorizontal: SPACING.xs }}
            >
              {additionalPhotos.map((uri) => (
                <View key={uri} style={{ position: 'relative' }}>
                  <Image
                    source={{ uri }}
                    style={{
                      width: ADDITIONAL_THUMB,
                      height: ADDITIONAL_THUMB,
                      borderRadius: RADIUS.md,
                    }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => removeAdditionalPhoto(uri)}
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: COLORS.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...SHADOWS.sm,
                    }}
                  >
                    <XIcon color={COLORS.text} size={12} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                onPress={addAdditionalPhoto}
                style={{
                  width: ADDITIONAL_THUMB,
                  height: ADDITIONAL_THUMB,
                  borderRadius: RADIUS.md,
                  backgroundColor: COLORS.surfaceAlt,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlusIcon color={COLORS.primary} size={22} />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Ticket de caisse */}
          <View style={{ marginBottom: SPACING.xxl }}>
            <StyledText
              variant="caption"
              color={COLORS.textTertiary}
              align="center"
              style={{ marginBottom: SPACING.sm }}
            >
              Ticket de caisse (échange / retour / garantie)
            </StyledText>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={showReceiptOptions}
              style={{ alignSelf: 'center' }}
            >
              {receiptUri ? (
                <View style={{ position: 'relative' }}>
                  <Image
                    source={{ uri: receiptUri }}
                    style={{ width: 120, height: 160, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceAlt }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: SPACING.xs,
                      right: SPACING.xs,
                      width: 32,
                      height: 32,
                      borderRadius: RADIUS.full,
                      backgroundColor: COLORS.surface,
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...SHADOWS.sm,
                    }}
                  >
                    <PencilIcon color={COLORS.primary} size={15} />
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    width: 120,
                    height: 160,
                    borderRadius: RADIUS.md,
                    backgroundColor: COLORS.surfaceAlt,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderStyle: 'dashed',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: SPACING.xs,
                  }}
                >
                  <StyledText style={{ fontSize: 30, lineHeight: 36 }}>🧾</StyledText>
                  <StyledText variant="smallMedium" color={COLORS.textSecondary}>
                    Ajouter
                  </StyledText>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={{ gap: SPACING.lg }}>
            <View>
              <FieldLabel>{isWine ? 'Nom / Cuvée' : 'Nom du cadeau'}</FieldLabel>
              <TextInput
                style={fieldInputStyle}
                value={name}
                onChangeText={setName}
                placeholder={isWine ? 'Ex: Château Margaux 2019' : 'Ex: Pull en laine bleue'}
                placeholderTextColor={COLORS.textTertiary}
                returnKeyType="next"
                maxLength={80}
              />
            </View>

            {isWine ? (
              <>
                <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
                  <View style={{ flex: 1 }}>
                    <FieldLabel>Millésime</FieldLabel>
                    <TextInput
                      style={fieldInputStyle}
                      value={vintage}
                      onChangeText={setVintage}
                      placeholder="Ex: 2019"
                      placeholderTextColor={COLORS.textTertiary}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FieldLabel>Nb bouteilles</FieldLabel>
                    <TextInput
                      style={fieldInputStyle}
                      value={quantity}
                      onChangeText={setQuantity}
                      placeholder="1"
                      placeholderTextColor={COLORS.textTertiary}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>
                </View>
                <View>
                  <FieldLabel>Appellation / Région</FieldLabel>
                  <TextInput
                    style={fieldInputStyle}
                    value={appellation}
                    onChangeText={setAppellation}
                    placeholder="Ex: Bordeaux, Champagne, Whisky…"
                    placeholderTextColor={COLORS.textTertiary}
                    maxLength={60}
                  />
                </View>
              </>
            ) : null}

            <View>
              <FieldLabel>{direction === 'received' ? 'Offert par' : 'Offert à'}</FieldLabel>
              <TextInput
                style={fieldInputStyle}
                value={giver}
                onChangeText={setGiver}
                placeholder={direction === 'received' ? 'Ex: Mamie Suzanne' : 'Ex: Jules, mon frère'}
                placeholderTextColor={COLORS.textTertiary}
                returnKeyType="done"
                maxLength={50}
              />
            </View>

            <View>
              <FieldLabel>Occasion</FieldLabel>
              <OccasionPicker value={occasion} onChange={setOccasion} />
            </View>

            <View>
              <FieldLabel>{isIdea ? 'Date prévue' : 'Date'}</FieldLabel>
              <DatePickerField value={date} onChange={setDate} />
            </View>

            <View>
              <FieldLabel optional>Prix (€)</FieldLabel>
              <TextInput
                style={fieldInputStyle}
                value={price}
                onChangeText={setPrice}
                placeholder="Ex: 45,90"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="decimal-pad"
                maxLength={10}
              />
            </View>

            <View>
              <FieldLabel optional>Où acheter / acheté</FieldLabel>
              <TextInput
                style={fieldInputStyle}
                value={purchaseLocation}
                onChangeText={setPurchaseLocation}
                placeholder="Ex: Galeries Lafayette, Etsy, marché de Noël…"
                placeholderTextColor={COLORS.textTertiary}
                maxLength={80}
              />
            </View>

            <View>
              <FieldLabel optional>Lien web</FieldLabel>
              <TextInput
                style={fieldInputStyle}
                value={purchaseUrl}
                onChangeText={setPurchaseUrl}
                placeholder="https://…"
                placeholderTextColor={COLORS.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                maxLength={200}
              />
            </View>

            <View>
              <FieldLabel optional>Notes</FieldLabel>
              <TextInput
                style={[fieldInputStyle, { height: 90, textAlignVertical: 'top' }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Souvenirs, anecdotes, préférences…"
                placeholderTextColor={COLORS.textTertiary}
                multiline
                maxLength={500}
              />
            </View>
          </View>

          {/* Save */}
          <View style={{ marginTop: SPACING.xxl }}>
            <Button
              label={isEditing ? 'Enregistrer les modifications' : 'Enregistrer'}
              onPress={handleSave}
              loading={saving}
              fullWidth
              size="lg"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
