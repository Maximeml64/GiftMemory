// src/screens/AddGiftScreen.tsx

import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import { Camera, Image as ImageIcon, Pencil, Trash2 } from 'lucide-react-native';

import { RootStackParamList, Gift, Occasion, GiftCategory } from '../types';
import { useGifts } from '../store/GiftsContext';
import { saveImageLocally, deleteImageLocally } from '../utils/storage';
import OccasionPicker from '../components/OccasionPicker';
import DatePickerField from '../components/DatePickerField';
import { Button, StyledText } from '../components/ui';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';
import { todayISO } from '../utils/dateUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddGift'>;

type LucideIcon = React.ComponentType<{ color?: string; size?: number }>;
const PencilIcon = Pencil as unknown as LucideIcon;

const SCREEN_PADDING = SPACING.lg;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <StyledText variant="eyebrow" style={{ marginBottom: SPACING.xs }}>
      {children}
    </StyledText>
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

export default function AddGiftScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { saveGift, getGiftById } = useGifts();

  const giftId = route.params?.giftId;
  const isEditing = !!giftId;
  const existing = giftId ? getGiftById(giftId) : undefined;

  const [category, setCategory] = useState<GiftCategory>(existing?.category ?? 'Cadeau');
  const [name, setName] = useState(existing?.name ?? '');
  const [giver, setGiver] = useState(existing?.giver ?? '');
  const [occasion, setOccasion] = useState<Occasion>(existing?.occasion ?? 'Anniversaire');
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [imageUri, setImageUri] = useState<string | null>(existing?.imageUri ?? null);
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [vintage, setVintage] = useState(existing?.vintage ?? '');
  const [appellation, setAppellation] = useState(existing?.appellation ?? '');
  const [quantity, setQuantity] = useState(existing?.quantity?.toString() ?? '1');
  const [saving, setSaving] = useState(false);

  const isWine = category === 'Vin & Spiritueux';

  async function pickFromGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setNewImageUri(result.assets[0].uri);
    }
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission refusée', "L'accès à la caméra est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setNewImageUri(result.assets[0].uri);
    }
  }

  function showImageOptions() {
    const options: Array<{ text: string; onPress?: () => void; style?: 'destructive' | 'cancel' }> = [
      { text: 'Caméra', onPress: pickFromCamera },
      { text: 'Galerie', onPress: pickFromGallery },
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

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Champ requis', isWine ? 'Entrez un nom pour la bouteille.' : 'Entrez un nom pour le cadeau.');
      return;
    }
    if (!giver.trim()) {
      Alert.alert('Champ requis', 'Entrez le nom du donneur.');
      return;
    }
    setSaving(true);
    try {
      const id = existing?.id ?? Crypto.randomUUID();
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
      const gift: Gift = {
        id,
        name: name.trim(),
        giver: giver.trim(),
        occasion,
        date,
        imageUri: finalImageUri,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        category,
        ...(isWine && {
          vintage: vintage.trim() || undefined,
          appellation: appellation.trim() || undefined,
          quantity: Math.max(1, parseInt(quantity, 10) || 1),
        }),
      };
      await saveGift(gift);
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      Alert.alert('Erreur', `Impossible de sauvegarder.\n${msg}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: SCREEN_PADDING,
            paddingTop: SPACING.md,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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

          {/* Image picker */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={showImageOptions}
            style={{
              alignSelf: 'center',
              width: 180,
              height: 180,
              borderRadius: RADIUS.xl,
              overflow: 'hidden',
              marginBottom: SPACING.xxl,
              backgroundColor: COLORS.surface,
              ...SHADOWS.md,
              position: 'relative',
            }}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
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
                <StyledText style={{ fontSize: 36 }}>{isWine ? '🍷' : '📸'}</StyledText>
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
              <FieldLabel>Donneur</FieldLabel>
              <TextInput
                style={fieldInputStyle}
                value={giver}
                onChangeText={setGiver}
                placeholder="Ex: Mamie Suzanne"
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
              <FieldLabel>Date</FieldLabel>
              <DatePickerField value={date} onChange={setDate} />
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
