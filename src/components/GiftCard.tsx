// src/components/GiftCard.tsx

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Gift } from '../types';
import { Colors, Radius, Shadow, Typography, Occasions } from '../utils/theme';

const CARD_MARGIN = 6;
const NUM_COLUMNS = 2;
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - CARD_MARGIN * (NUM_COLUMNS * 2)) / NUM_COLUMNS;

interface Props {
  gift: Gift;
  onPress: () => void;
}

export default function GiftCard({ gift, onPress }: Props) {
  const occasion = Occasions[gift.occasion] ?? Occasions['Autre'];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        {gift.imageUri ? (
          <Image
            source={{ uri: gift.imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderEmoji}>{occasion.emoji}</Text>
          </View>
        )}
        {/* Occasion badge */}
        <View style={[styles.badge, { backgroundColor: occasion.color + '22' }]}>
          <Text style={styles.badgeEmoji}>{occasion.emoji}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {gift.name}
        </Text>
        <Text style={styles.giver} numberOfLines={1}>
          👤 {gift.giver}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    margin: CARD_MARGIN,
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.shimmer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 40,
    opacity: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  badgeEmoji: {
    fontSize: 14,
  },
  info: {
    padding: 10,
    paddingTop: 8,
  },
  name: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: 2,
  },
  giver: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
