// src/screens/AddGiftScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';

import { RootStackParamList, Gift, Occasion } from '../types';
import { useGifts } from '../store/GiftsContext';
import { saveImageLocally, deleteImageLocally } from '../utils/storage';
import OccasionPicker from '../components/OccasionPicker';
import DatePickerField from '../components/DatePickerField';
import { Colors, Radius, Shadow, Spacing, Typography } from '../utils/theme';
import { todayISO } from '../utils/dateUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'AddGift'>;

export default function AddGiftScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { saveGift, getGiftById } = useGifts();

  const giftId = route.params?.giftId;
  const isEditing = !!giftId;
  const existing = giftId ? getGiftById(giftId) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [giver, setGiver] = useState(existing?.giver ?? '');
  const [occasion, setOccasion] = useState<Occasion>(existing?.occasion ?? 'Anniversaire');
  const [date, setDate] = useState(existing?.date ?? todayISO());
  const [imageUri, setImageUri] = useState<string | null>(existing?.imageUri ?? null);
  const [saving, setSaving] = useState(false);
  // Track if we've picked a new image (requires copy to permanent storage)
  const [newImageUri, setNewImageUri] = useState<string | null>(null);

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
    Alert.alert('Photo du cadeau', 'Choisir la source', [
      { text: '📷 Caméra', onPress: pickFromCamera },
      { text: '🖼 Galerie', onPress: pickFromGallery },
      imageUri
        ? {
            text: '🗑 Supprimer la photo',
            style: 'destructive',
            onPress: () => {
              setImageUri(null);
              setNewImageUri(null);
            },
          }
        : null,
      { text: 'Annuler', style: 'cancel' },
    ].filter(Boolean) as any);
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Champ requis', 'Entrez un nom pour le cadeau.');
      return;
    }
    if (!giver.trim()) {
      Alert.alert('Champ requis', 'Entrez le nom du donneur.');
      return;
    }

    setSaving(true);
    try {
      const id = existing?.id ?? uuidv4();
      let finalImageUri = imageUri;

      // If new image was picked, copy to permanent storage
      if (newImageUri) {
        // Delete old image if editing and had one
        if (isEditing && existing?.imageUri && existing.imageUri !== newImageUri) {
          await deleteImageLocally(existing.imageUri);
        }
        finalImageUri = await saveImageLocally(newImageUri, id);
      }
      // If image was removed while editing, delete old file
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
      };

      await saveGift(gift);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de sauvegarder le cadeau.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Photo picker */}
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={showImageOptions}
            activeOpacity={0.8}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>📸</Text>
                <Text style={styles.imagePlaceholderText}>Ajouter une photo</Text>
              </View>
            )}
            <View style={styles.imageEditBadge}>
              <Text style={styles.imageEditBadgeText}>✏️</Text>
            </View>
          </TouchableOpacity>

          {/* Fields */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>🎁 Nom du cadeau</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Pull en laine bleue"
                placeholderTextColor={Colors.textTertiary}
                returnKeyType="next"
                maxLength={80}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>👤 Donneur</Text>
              <TextInput
                style={styles.input}
                value={giver}
                onChangeText={setGiver}
                placeholder="Ex: Mamie Suzanne"
                placeholderTextColor={Colors.textTertiary}
                returnKeyType="done"
                maxLength={50}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>🎉 Occasion</Text>
              <OccasionPicker value={occasion} onChange={setOccasion} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>📅 Date</Text>
              <DatePickerField value={date} onChange={setDate} />
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveBtnText}>
                {isEditing ? 'Enregistrer les modifications' : 'Enregistrer le cadeau'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
  imagePicker: {
    alignSelf: 'center',
    width: 160,
    height: 160,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadow.md,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: Colors.shimmer,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: Radius.xl,
  },
  imagePlaceholderIcon: { fontSize: 36, marginBottom: 8 },
  imagePlaceholderText: {
    ...Typography.captionMedium,
    color: Colors.textSecondary,
  },
  imageEditBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  imageEditBadgeText: { fontSize: 14 },
  form: { gap: Spacing.md },
  field: { gap: 6 },
  label: {
    ...Typography.captionMedium,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Typography.body,
    color: Colors.text,
  },
  saveBtn: {
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.md,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    ...Typography.bodyMedium,
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
