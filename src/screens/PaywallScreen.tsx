// src/screens/PaywallScreen.tsx

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PurchasesPackage } from 'react-native-purchases';

import { RootStackParamList } from '../types';
import { usePurchase } from '../store/PurchaseContext';
import { Colors, Radius, Shadow, Spacing, Typography } from '../utils/theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FEATURES = [
  '🎁 Cadeaux illimités',
  '🎂 Événements & rappels illimités',
  '📸 Photos haute qualité',
  '👥 Donneurs illimités',
  '🔔 Notifications push',
  '✨ Accès à toutes les futures fonctionnalités',
];

function packageLabel(pkg: PurchasesPackage): { title: string; price: string; badge?: string; savings?: string } {
  const id = pkg.packageType;
  const price = pkg.product.priceString;

  if (id === 'MONTHLY' || pkg.identifier === '$rc_monthly') {
    return { title: 'Mensuel', price: `${price} / mois`, badge: '7 jours gratuits' };
  }
  if (id === 'ANNUAL' || pkg.identifier === '$rc_annual') {
    return { title: 'Annuel', price: `${price} / an`, badge: '🔥 Le plus populaire', savings: 'Économisez 50%' };
  }
  if (id === 'LIFETIME' || pkg.identifier === '$rc_lifetime') {
    return { title: 'À vie', price: price, badge: '💎 Meilleure offre' };
  }
  return { title: pkg.product.title, price: price };
}

export default function PaywallScreen() {
  const navigation = useNavigation<Nav>();
  const { packages, purchasePackage, restorePurchases, isPremium } = usePurchase();
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (packages.length > 0 && !selectedPkg) {
      const annual = packages.find((p) => p.identifier === '$rc_annual') ?? packages[0];
      setSelectedPkg(annual);
    }
  }, [packages]);

  if (isPremium) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.alreadyPremiumContainer}>
          <Text style={styles.alreadyPremiumEmoji}>✨</Text>
          <Text style={styles.alreadyPremiumTitle}>Vous êtes déjà Premium !</Text>
          <Text style={styles.alreadyPremiumSub}>
            Profitez de toutes les fonctionnalités sans limite.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={styles.backBtnText}>Retour</Text>
          </TouchableOpacity>
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
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🎁</Text>
          <Text style={styles.heroTitle}>GiftMemory Premium</Text>
          <Text style={styles.heroSubtitle}>
            Ne ratez plus jamais un anniversaire.{'\n'}Gardez tous vos souvenirs.
          </Text>
        </View>

        {isMonthly && (
          <View style={styles.trialBanner}>
            <Text style={styles.trialText}>✨ 7 jours gratuits, puis {label?.price}</Text>
          </View>
        )}

        <View style={styles.featuresCard}>
          {FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Text style={styles.featureCheck}>✓</Text>
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        {packages.length === 0 ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.xl }} />
        ) : (
          <View style={styles.packagesContainer}>
            {packages.map((pkg) => {
              const info = packageLabel(pkg);
              const selected = selectedPkg?.identifier === pkg.identifier;
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[styles.packageCard, selected && styles.packageCardSelected]}
                  onPress={() => setSelectedPkg(pkg)}
                  activeOpacity={0.8}
                >
                  {info.badge && (
                    <View style={[styles.packageBadge, selected && styles.packageBadgeSelected]}>
                      <Text style={styles.packageBadgeText}>{info.badge}</Text>
                    </View>
                  )}
                  <Text style={[styles.packageTitle, selected && styles.packageTitleSelected]}>
                    {info.title}
                  </Text>
                  <Text style={[styles.packagePrice, selected && styles.packagePriceSelected]}>
                    {info.price}
                  </Text>
                  {info.savings && (
                    <Text style={styles.packageSavings}>{info.savings}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <TouchableOpacity
          style={[styles.ctaBtn, (loading || !selectedPkg) && styles.ctaBtnDisabled]}
          onPress={handlePurchase}
          disabled={loading || !selectedPkg}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.ctaText}>
              {isMonthly ? "Commencer l'essai gratuit" : 'Choisir cette offre'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={restorePurchases} activeOpacity={0.7} style={styles.restoreBtn}>
          <Text style={styles.restoreText}>Restaurer mes achats</Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          L'abonnement se renouvelle automatiquement. Annulable à tout moment depuis les réglages de l'App Store. Sans engagement pour l'offre à vie.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  closeBtn: {
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.shimmer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 16, color: Colors.textSecondary, fontWeight: '600' },
  alreadyPremiumContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  alreadyPremiumEmoji: { fontSize: 72, marginBottom: Spacing.lg },
  alreadyPremiumTitle: {
    ...Typography.displayMedium,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  alreadyPremiumSub: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  backBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    ...Shadow.sm,
  },
  backBtnText: { ...Typography.bodyMedium, color: '#FFF', fontWeight: '700' },
  hero: { alignItems: 'center', paddingVertical: Spacing.xl },
  heroEmoji: { fontSize: 64, marginBottom: Spacing.md },
  heroTitle: { ...Typography.displayMedium, color: Colors.text, textAlign: 'center' },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  trialBanner: {
    backgroundColor: Colors.primary + '18',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
  },
  trialText: { ...Typography.bodyMedium, color: Colors.primary, fontWeight: '600' },
  featuresCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
  featureCheck: { fontSize: 16, color: Colors.success, marginRight: 10, fontWeight: '700' },
  featureText: { ...Typography.body, color: Colors.text, flex: 1 },
  packagesContainer: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  packageCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    ...Shadow.sm,
    minHeight: 100,
    justifyContent: 'center',
  },
  packageCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  packageBadge: {
    backgroundColor: Colors.shimmer,
    borderRadius: Radius.full,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  packageBadgeSelected: { backgroundColor: Colors.primary + '20' },
  packageBadgeText: { ...Typography.captionMedium, color: Colors.textSecondary, textAlign: 'center' },
  packageTitle: { ...Typography.bodyMedium, color: Colors.textSecondary, textAlign: 'center' },
  packageTitleSelected: { color: Colors.primary, fontWeight: '700' },
  packagePrice: { ...Typography.caption, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 },
  packagePriceSelected: { color: Colors.text },
  packageSavings: { ...Typography.captionMedium, color: Colors.success, marginTop: 4, textAlign: 'center' },
  ctaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.md,
    marginBottom: Spacing.md,
  },
  ctaBtnDisabled: { opacity: 0.6 },
  ctaText: { ...Typography.bodyMedium, color: '#FFF', fontWeight: '700', fontSize: 16 },
  restoreBtn: { alignItems: 'center', paddingVertical: Spacing.sm },
  restoreText: { ...Typography.body, color: Colors.textSecondary },
  legal: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: Spacing.md,
  },
});
