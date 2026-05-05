// src/store/PurchaseContext.tsx

import React, {
  createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode,
} from 'react';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

const ENTITLEMENT_ID = 'premium';

const API_KEY = Platform.OS === 'ios'
  ? (process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '')
  : (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '');

const isExpoGo =
  (Constants.appOwnership as string) === 'expo' ||
  Constants.executionEnvironment === 'storeClient';

interface PurchaseContextValue {
  isLoading: boolean;
  isPremium: boolean;
  packages: PurchasesPackage[];
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<void>;
}

const PurchaseContext = createContext<PurchaseContextValue | null>(null);

export function PurchaseProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  function checkPremium(info: CustomerInfo) {
    const active = !!info.entitlements.active[ENTITLEMENT_ID];
    setIsPremium(active);
  }

  useEffect(() => {
    if (isExpoGo || !API_KEY) {
      console.warn('[RC] Skipping RevenueCat init —', isExpoGo ? 'Expo Go (use dev build for RC features)' : 'API key not configured');
      setIsLoading(false);
      return;
    }

    async function init() {
      try {
        Purchases.configure({ apiKey: API_KEY });

        // Listener setup inside try so Expo Go failures are caught cleanly
        const sub = Purchases.addCustomerInfoUpdateListener(checkPremium);
        if (typeof sub === 'function') unsubscribeRef.current = sub;

        const info = await Purchases.getCustomerInfo();
        checkPremium(info);
        const offerings = await Purchases.getOfferings();
        if (offerings.current?.availablePackages) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (e) {
        console.error('RevenueCat init error:', e);
      } finally {
        setIsLoading(false);
      }
    }

    init();

    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      checkPremium(customerInfo);
      return !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Erreur', "L'achat a échoué. Réessayez.");
      }
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    try {
      const info = await Purchases.restorePurchases();
      checkPremium(info);
      const active = !!info.entitlements.active[ENTITLEMENT_ID];
      Alert.alert(
        active ? 'Abonnement restauré ✓' : 'Aucun achat trouvé',
        active ? 'Votre accès Premium est actif.' : 'Aucun achat à restaurer sur ce compte.',
      );
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de restaurer les achats.');
    }
  }, []);

  return (
    <PurchaseContext.Provider value={{ isLoading, isPremium, packages, purchasePackage, restorePurchases }}>
      {children}
    </PurchaseContext.Provider>
  );
}

export function usePurchase(): PurchaseContextValue {
  const ctx = useContext(PurchaseContext);
  if (!ctx) throw new Error('usePurchase must be used within PurchaseProvider');
  return ctx;
}
