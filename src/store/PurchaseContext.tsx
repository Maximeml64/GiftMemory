// src/store/PurchaseContext.tsx

import React, {
  createContext, useContext, useEffect, useState, useCallback, ReactNode,
} from 'react';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import { Alert } from 'react-native';

const API_KEY = 'appl_test_ktMTDcsmuIyXdseoUofGfOuzMeN';

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

  function checkPremium(info: CustomerInfo) {
    const active = Object.keys(info.entitlements.active).length > 0;
    setIsPremium(active);
  }

  useEffect(() => {
    async function init() {
      try {
        Purchases.configure({ apiKey: API_KEY });
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

    Purchases.addCustomerInfoUpdateListener((info) => {
      checkPremium(info);
    });
  }, []);

  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      checkPremium(customerInfo);
      return Object.keys(customerInfo.entitlements.active).length > 0;
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
      const active = Object.keys(info.entitlements.active).length > 0;
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