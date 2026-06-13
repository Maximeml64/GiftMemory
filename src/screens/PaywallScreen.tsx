// src/screens/PaywallScreen.tsx

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PurchasesPackage } from 'react-native-purchases';
import * as Haptics from 'expo-haptics';

import { RootStackParamList } from '../types';
import { usePurchase } from '../store/PurchaseContext';
import { Button, Card, CheckIcon, StyledText, XIcon } from '../components/ui';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRIVACY_POLICY_URL = 'https://momentous-locket-2af.notion.site/Politique-de-Confidentialit-GiftMemory-35684071bf3e803fafecdc548d553ef5';
const CGU_URL = 'https://momentous-locket-2af.notion.site/Conditions-G-n-rales-d-Utilisation-GiftMemory-35684071bf3e80288fd1f4947a1928d2';

const FEATURES = [
  'Cadeaux illimités',
  'Événements et rappels illimités',
  'Photos haute qualité',
  'Donneurs illimités',
  'Notifications de remerciement',
  'Accès à toutes les futures fonctionnalités',
];

type IntroPrice = NonNullable<PurchasesPackage['product']['introPrice']>;

// A free trial is an introductory price of 0. We read it off the product
// instead of hard-coding "7 days" so the wording always matches whatever is
// configured in App Store Connect / RevenueCat.
function getFreeTrial(pkg: PurchasesPackage): IntroPrice | null {
  const intro = pkg.product.introPrice;
  return intro && intro.price === 0 ? intro : null;
}

function trialDuration(intro: IntroPrice): string {
  const n = intro.periodNumberOfUnits;
  const units: Record<string, [string, string]> = {
    DAY: ['jour', 'jours'],
    WEEK: ['semaine', 'semaines'],
    MONTH: ['mois', 'mois'],
    YEAR: ['an', 'ans'],
  };
  const [singular, plural] = units[intro.periodUnit] ?? ['jour', 'jours'];
  return `${n} ${n > 1 ? plural : singular}`;
}

function packageLabel(pkg: PurchasesPackage): { title: string; price: string } {
  const id = pkg.packageType;
  const price = pkg.product.priceString;

  if (id === 'ANNUAL' || pkg.identifier === '$rc_annual') {
    return { title: 'Abonnement annuel', price: `${price} / an` };
  }
  if (id === 'MONTHLY' || pkg.identifier === '$rc_monthly') {
    return { title: 'Mensuel', price: `${price} / mois` };
  }
  if (id === 'LIFETIME' || pkg.identifier === '$rc_lifetime') {
    return { title: 'Premium à vie', price };
  }
  return { title: pkg.product.title, price };
}

export default function PaywallScreen() {
  const navigation = useNavigation<Nav>();
  const { packages, purchasePackage, restorePurchases, reloadOfferings, isLoading, isPremium } = usePurchase();
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (packages.length > 0 && !selectedPkg) {
      const preferred =
        packages.find((p) => p.identifier === '$rc_lifetime' || p.packageType === 'LIFETIME') ??
        packages[0];
      setSelectedPkg(preferred);
    }
  }, [packages, selectedPkg]);

  if (isPremium) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top', 'bottom']}>
        <CloseButton onPress={() => navigation.goBack()} />
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: SPACING.xl,
            gap: SPACING.md,
          }}
        >
          <StyledText style={{ fontSize: 80, lineHeight: 90 }}>✨</StyledText>
          <StyledText variant="h1" align="center">
            Vous êtes Premium
          </StyledText>
          <StyledText variant="body" align="center" color={COLORS.textSecondary} style={{ maxWidth: 320 }}>
            Toutes les fonctionnalités sont accessibles sans limite.
          </StyledText>
          <View style={{ marginTop: SPACING.md }}>
            <Button label="Retour" onPress={() => navigation.goBack()} size="lg" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  async function handlePurchase() {
    if (!selectedPkg) return;
    setLoading(true);
    const success = await purchasePackage(selectedPkg);
    setLoading(false);
    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      navigation.goBack();
    }
  }

  const label = selectedPkg ? packageLabel(selectedPkg) : null;
  const trial = selectedPkg ? getFreeTrial(selectedPkg) : null;
  const isLifetime =
    selectedPkg?.packageType === 'LIFETIME' || selectedPkg?.identifier === '$rc_lifetime';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <CloseButton onPress={() => navigation.goBack()} />

        {/* Hero */}
        <View style={{ alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm }}>
          <StyledText style={{ fontSize: 64, lineHeight: 72 }}>🎁</StyledText>
          <StyledText variant="display" align="center">
            GiftMemory Premium
          </StyledText>
          <StyledText
            variant="body"
            align="center"
            color={COLORS.textSecondary}
            style={{ maxWidth: 320, marginTop: SPACING.xs }}
          >
            Ne ratez plus jamais un anniversaire. Gardez tous vos souvenirs.
          </StyledText>
        </View>

        {/* Offer banner */}
        {label && (trial || isLifetime) ? (
          <View
            style={{
              backgroundColor: COLORS.primaryMuted,
              borderWidth: 1,
              borderColor: COLORS.primary,
              borderRadius: RADIUS.lg,
              padding: SPACING.md,
              alignItems: 'center',
              marginBottom: SPACING.md,
            }}
          >
            <StyledText variant="bodyMedium" color={COLORS.primary}>
              {trial
                ? `✨ ${trialDuration(trial)} gratuits, puis ${label.price}`
                : `💎 Paiement unique — accès à vie pour ${label.price}`}
            </StyledText>
          </View>
        ) : null}

        {/* Features */}
        <Card padding="base" style={{ marginBottom: SPACING.lg }}>
          {FEATURES.map((f) => (
            <View
              key={f}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: SPACING.md,
                paddingVertical: SPACING.xs + 3,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: COLORS.successMuted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckIcon color={COLORS.success} size={14} />
              </View>
              <StyledText variant="body" style={{ flex: 1 }}>
                {f}
              </StyledText>
            </View>
          ))}
        </Card>

        {/* Packages */}
        {isLoading && packages.length === 0 ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: SPACING.xl }} />
        ) : packages.length === 0 ? (
          <View style={{ alignItems: 'center', gap: SPACING.md, marginVertical: SPACING.xl }}>
            <StyledText variant="body" align="center" color={COLORS.textSecondary} style={{ maxWidth: 300 }}>
              Les offres n'ont pas pu être chargées. Vérifiez votre connexion et réessayez.
            </StyledText>
            <Button label="Réessayer" variant="secondary" onPress={() => reloadOfferings()} />
          </View>
        ) : packages.length === 1 && label ? (
          <Card padding="base" style={{ marginBottom: SPACING.lg, alignItems: 'center', gap: 4 }}>
            <StyledText variant="bodyMedium" color={COLORS.primary}>
              {label.title}
            </StyledText>
            <StyledText variant="h2">{label.price}</StyledText>
            {trial ? (
              <StyledText variant="caption" color={COLORS.textSecondary} align="center">
                {trialDuration(trial)} d'essai gratuit, sans engagement
              </StyledText>
            ) : isLifetime ? (
              <StyledText variant="caption" color={COLORS.textSecondary} align="center">
                Paiement unique, sans abonnement
              </StyledText>
            ) : null}
          </Card>
        ) : (
          <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg }}>
            {packages.map((pkg) => {
              const info = packageLabel(pkg);
              const selected = selectedPkg?.identifier === pkg.identifier;
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  activeOpacity={0.8}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setSelectedPkg(pkg);
                  }}
                  style={{
                    flex: 1,
                    minHeight: 110,
                    backgroundColor: selected ? COLORS.primaryMuted : COLORS.surface,
                    borderRadius: RADIUS.lg,
                    padding: SPACING.md,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    borderColor: selected ? COLORS.primary : COLORS.border,
                    ...(selected ? {} : SHADOWS.sm),
                  }}
                >
                  {getFreeTrial(pkg) ? (
                    <View
                      style={{
                        backgroundColor: selected ? COLORS.primary : COLORS.surfaceAlt,
                        borderRadius: 999,
                        paddingVertical: 2,
                        paddingHorizontal: SPACING.sm,
                        marginBottom: SPACING.xs,
                      }}
                    >
                      <StyledText
                        variant="caption"
                        color={selected ? COLORS.textInverse : COLORS.textSecondary}
                      >
                        Essai gratuit
                      </StyledText>
                    </View>
                  ) : null}
                  <StyledText
                    variant="bodyMedium"
                    color={selected ? COLORS.primary : COLORS.textSecondary}
                    align="center"
                  >
                    {info.title}
                  </StyledText>
                  <StyledText
                    variant="caption"
                    color={selected ? COLORS.text : COLORS.textSecondary}
                    align="center"
                    style={{ marginTop: 4 }}
                  >
                    {info.price}
                  </StyledText>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Button
          label={trial ? "Commencer l'essai gratuit" : isLifetime ? 'Débloquer à vie' : 'Continuer'}
          onPress={handlePurchase}
          loading={loading}
          disabled={!selectedPkg}
          fullWidth
          size="lg"
        />

        <TouchableOpacity
          onPress={restorePurchases}
          activeOpacity={0.7}
          style={{ alignItems: 'center', paddingVertical: SPACING.md }}
        >
          <StyledText variant="body" color={COLORS.textSecondary}>
            Restaurer mes achats
          </StyledText>
        </TouchableOpacity>

        <StyledText
          variant="caption"
          align="center"
          color={COLORS.textTertiary}
          style={{ marginTop: SPACING.sm }}
        >
          {isLifetime
            ? 'Paiement unique. Accès Premium à vie, sans abonnement ni renouvellement. Achat restaurable à tout moment.'
            : "L'essai gratuit se transforme en abonnement payant à son terme, sauf annulation au moins 24 h avant la fin. Renouvellement automatique, annulable à tout moment depuis les réglages de l'App Store."}
        </StyledText>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: SPACING.lg,
            marginTop: SPACING.md,
          }}
        >
          <TouchableOpacity onPress={() => Linking.openURL(CGU_URL)} activeOpacity={0.7}>
            <StyledText
              variant="caption"
              color={COLORS.textSecondary}
              style={{ textDecorationLine: 'underline' }}
            >
              Conditions d'utilisation
            </StyledText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} activeOpacity={0.7}>
            <StyledText
              variant="caption"
              color={COLORS.textSecondary}
              style={{ textDecorationLine: 'underline' }}
            >
              Politique de confidentialité
            </StyledText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        alignSelf: 'flex-end',
        marginTop: SPACING.sm,
        width: 36,
        height: 36,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <XIcon color={COLORS.textSecondary} size={18} />
    </TouchableOpacity>
  );
}
