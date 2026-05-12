// src/screens/SettingsScreen.tsx

import React, { useEffect, useState } from 'react';
import { Alert, Linking, Switch, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, ChevronRight, FileText, Lock, Mail, Sparkles } from 'lucide-react-native';

import { RootStackParamList } from '../types';
import { usePurchase } from '../store/PurchaseContext';
import { useGifts } from '../store/GiftsContext';
import {
  Card,
  Divider,
  ScreenWrapper,
  StyledText,
} from '../components/ui';
import { COLORS, RADIUS, SPACING } from '../utils/theme';
import {
  cancelAllThankYouReminders,
  isThankYouRemindersEnabled,
  rescheduleAllThankYouReminders,
  setThankYouRemindersEnabled,
} from '../utils/notifications';

const PRIVACY_POLICY_URL = 'https://momentous-locket-2af.notion.site/Politique-de-Confidentialit-GiftMemory-35684071bf3e803fafecdc548d553ef5';
const CGU_URL = 'https://momentous-locket-2af.notion.site/Conditions-G-n-rales-d-Utilisation-GiftMemory-35684071bf3e80288fd1f4947a1928d2';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type LucideIcon = React.ComponentType<{ color?: string; size?: number }>;
const BellIcon = Bell as unknown as LucideIcon;
const ChevronIcon = ChevronRight as unknown as LucideIcon;
const FileTextIcon = FileText as unknown as LucideIcon;
const LockIcon = Lock as unknown as LucideIcon;
const MailIcon = Mail as unknown as LucideIcon;
const SparklesIcon = Sparkles as unknown as LucideIcon;

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { isPremium } = usePurchase();
  const { gifts } = useGifts();
  const [thankYouEnabled, setThankYouEnabledState] = useState(true);

  useEffect(() => {
    isThankYouRemindersEnabled().then(setThankYouEnabledState);
  }, []);

  async function toggleThankYou(value: boolean) {
    setThankYouEnabledState(value);
    await setThankYouRemindersEnabled(value);
    if (value) {
      await rescheduleAllThankYouReminders(gifts);
    } else {
      await cancelAllThankYouReminders(gifts);
    }
  }

  async function openMail() {
    const url = 'mailto:m.maurylaribiere@gmail.com?subject=GiftMemory%20-%20Question%20%2F%20Probl%C3%A8me';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Erreur', "Impossible d'ouvrir l'application mail.");
    }
  }

  return (
    <ScreenWrapper scroll>
      <StyledText variant="display" style={{ marginTop: SPACING.sm, marginBottom: SPACING.lg }}>
        Réglages
      </StyledText>

      {/* App info card */}
      <Card variant="soft" padding="xl" style={{ alignItems: 'center', marginBottom: SPACING.lg }}>
        <StyledText style={{ fontSize: 56, lineHeight: 64, marginBottom: SPACING.sm }}>🎁</StyledText>
        <StyledText variant="h2" align="center">GiftMemory</StyledText>
        <StyledText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 4 }}>
          Version 1.0.0
        </StyledText>
        {isPremium ? (
          <View
            style={{
              marginTop: SPACING.md,
              backgroundColor: COLORS.primaryMuted,
              paddingVertical: 4,
              paddingHorizontal: SPACING.md,
              borderRadius: RADIUS.full,
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.xs,
            }}
          >
            <SparklesIcon color={COLORS.primary} size={14} />
            <StyledText variant="smallMedium" color={COLORS.primary}>
              Premium actif
            </StyledText>
          </View>
        ) : null}
      </Card>

      {/* Premium banner */}
      {!isPremium ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Paywall')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.md,
            backgroundColor: COLORS.primary,
            borderRadius: RADIUS.lg,
            padding: SPACING.base,
            marginBottom: SPACING.xl,
          }}
        >
          <SparklesIcon color={COLORS.textInverse} size={28} />
          <View style={{ flex: 1 }}>
            <StyledText variant="bodyMedium" color={COLORS.textInverse}>
              Passer à Premium
            </StyledText>
            <StyledText variant="small" color={'rgba(253,249,244,0.78)'}>
              Cadeaux et événements illimités
            </StyledText>
          </View>
          <ChevronIcon color={COLORS.textInverse} size={20} />
        </TouchableOpacity>
      ) : null}

      {/* Section Rappels */}
      <StyledText variant="eyebrow" style={{ marginBottom: SPACING.sm, marginLeft: SPACING.xs }}>
        Rappels
      </StyledText>
      <Card padding="none" style={{ marginBottom: SPACING.lg, overflow: 'hidden' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.base,
            gap: SPACING.md,
          }}
        >
          <BellIcon color={COLORS.textSecondary} size={20} />
          <View style={{ flex: 1 }}>
            <StyledText variant="bodyMedium">Penser à remercier</StyledText>
            <StyledText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
              Notification le lendemain d'un cadeau reçu
            </StyledText>
          </View>
          <Switch
            value={thankYouEnabled}
            onValueChange={toggleThankYou}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor={COLORS.surface}
          />
        </View>
      </Card>

      {/* Section Légal */}
      <StyledText variant="eyebrow" style={{ marginBottom: SPACING.sm, marginLeft: SPACING.xs }}>
        Légal
      </StyledText>
      <Card padding="none" style={{ marginBottom: SPACING.lg, overflow: 'hidden' }}>
        <SettingsRow
          icon={<FileTextIcon color={COLORS.textSecondary} size={20} />}
          label="Conditions générales d'utilisation"
          onPress={() => Linking.openURL(CGU_URL)}
        />
        <Divider marginVertical={0} inset={SPACING.xl + 20} />
        <SettingsRow
          icon={<LockIcon color={COLORS.textSecondary} size={20} />}
          label="Politique de confidentialité"
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
        />
      </Card>

      {/* Section Support */}
      <StyledText variant="eyebrow" style={{ marginBottom: SPACING.sm, marginLeft: SPACING.xs }}>
        Support
      </StyledText>
      <Card padding="none" style={{ marginBottom: SPACING.xl, overflow: 'hidden' }}>
        <SettingsRow
          icon={<MailIcon color={COLORS.textSecondary} size={20} />}
          label="Nous contacter"
          sublabel="m.maurylaribiere@gmail.com"
          onPress={openMail}
        />
      </Card>

      <StyledText
        variant="caption"
        align="center"
        color={COLORS.textTertiary}
        style={{ marginTop: SPACING.sm }}
      >
        GiftMemory · Fait avec attention{'\n'}
        Toutes vos données restent sur votre appareil.
      </StyledText>
    </ScreenWrapper>
  );
}

function SettingsRow({
  icon,
  label,
  sublabel,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.base,
        gap: SPACING.md,
      }}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <StyledText variant="bodyMedium">{label}</StyledText>
        {sublabel ? (
          <StyledText variant="caption" color={COLORS.textSecondary} style={{ marginTop: 2 }}>
            {sublabel}
          </StyledText>
        ) : null}
      </View>
      <ChevronIcon color={COLORS.textTertiary} size={20} />
    </TouchableOpacity>
  );
}
