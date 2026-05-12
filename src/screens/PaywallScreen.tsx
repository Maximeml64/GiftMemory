// src/screens/PaywallScreen.tsx

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PurchasesPackage } from 'react-native-purchases';
import { Check, X } from 'lucide-react-native';

import { RootStackParamList } from '../types';
import { usePurchase } from '../store/PurchaseContext';
import { Button, Card, StyledText } from '../components/ui';
import { COLORS, RADIUS, SHADOWS, SPACING } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type LucideIcon = React.ComponentType<{ color?: string; size?: number }>;
const CheckIcon = Check as unknown as LucideIcon;
const XIcon = X as unknown as LucideIcon;

const FEATURES = [
  'Cadeaux illimités',
  'Événements et rappels illimités',
  'Photos haute qualité',
  'Donneurs illimités',
  'Notifications push',
  'Accès à toutes les futures fonctionnalités',
];

function packageLabel(pkg: PurchasesPackage): {
  title: string;
  price: string;
  badge?: string;
  savings?: string;
} {
  const id = pkg.packageType;
  const price = pkg.product.priceString;

  if (id === 'MONTHLY' || pkg.identifier === '$rc_monthly') {
    return { title: 'Mensuel', price: `${price} / mois`, badge: '7 jours offerts' };
  }
  if (id === 'ANNUAL' || pkg.identifier === '$rc_annual') {
    return { title: 'Annuel', price: `${price} / an`, badge: 'Populaire', savings: 'Économisez 50 %' };
  }
  if (id === 'LIFETIME' || pkg.identifier === '$rc_lifetime') {
    return { title: 'À vie', price: price, badge: 'Meilleure offre' };
  }
  return { title: pkg.product.title, price: price };
}

export default function PaywallScreen() {
  const navigation = useNavigation<Nav>();
  const { packages, purchasePackage, restorePurchases, isPremium } = usePurchase();
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (packages.length > 0 && !selectedPkg) {
      const annual = packages.find((p) => p.identifier === '$rc_annual') ?? packages[0];
      setSelectedPkg(annual);
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
    if (success) navigation.goBack();
  }

  const label = selectedPkg ? packageLabel(selectedPkg) : null;
  const isMonthly = selectedPkg?.identifier === '$rc_monthly';

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

        {/* Trial banner */}
        {isMonthly && label ? (
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
              ✨ 7 jours gratuits, puis {label.price}
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
        {packages.length === 0 ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: SPACING.xl }} />
        ) : (
          <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg }}>
            {packages.map((pkg) => {
              const info = packageLabel(pkg);
              const selected = selectedPkg?.identifier === pkg.identifier;
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  activeOpacity={0.8}
                  onPress={() => setSelectedPkg(pkg)}
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
                  {info.badge ? (
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
                        {info.badge}
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
                  {info.savings ? (
                    <StyledText variant="caption" color={COLORS.success} align="center" style={{ marginTop: 4 }}>
                      {info.savings}
                    </StyledText>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <Button
          label={isMonthly ? "Commencer l'essai gratuit" : 'Choisir cette offre'}
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
          L'abonnement se renouvelle automatiquement. Annulable à tout moment depuis les réglages de l'App Store. Sans engagement pour l'offre à vie.
        </StyledText>
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
