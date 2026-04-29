// SECURITY: Until RevenueCat ships (Phase 5), entitlement is derived from
// persisted client state which is trivially tampered with via DevTools/rooted
// devices. App Store Review will reject IAP that gates content client-side.
//
// PHASE 5 INTEGRATION (RevenueCat):
//   npm install @revenuecat/purchases-capacitor
//   npx cap sync
// Then in main.ts, before `new Game()`:
//   import { Purchases } from '@revenuecat/purchases-capacitor';
//   await Purchases.configure({ apiKey: import.meta.env.VITE_REVENUECAT_KEY });
// Replace the three stubs below with the SDK calls noted inline.

import { Store } from './state';

export class SubscriptionManager {
  private store: Store;

  constructor(store: Store) {
    this.store = store;
  }

  isPremium(): boolean {
    return (
      this.store.state.subscriptionTier === 'premium' &&
      (this.store.state.subscriptionExpiresAt ?? 0) > Date.now()
    );
  }

  checkExpiry(): void {
    if (
      this.store.state.subscriptionTier === 'premium' &&
      (this.store.state.subscriptionExpiresAt ?? 0) <= Date.now()
    ) {
      this.store.update({ subscriptionTier: 'free', subscriptionExpiresAt: null });
    }
  }

  isContentLocked(requiresPremium: boolean): boolean {
    return requiresPremium && !this.isPremium();
  }

  // TODO(phase-5): Replace with:
  //   const { customerInfo } = await Purchases.purchaseProduct({ productIdentifier: 'premium_monthly' });
  //   return this.applyCustomerInfo(customerInfo);
  async purchaseMonthly(): Promise<boolean> {
    return false;
  }

  // TODO(phase-5): same as purchaseMonthly with productIdentifier: 'premium_yearly'
  async purchaseYearly(_trialEnabled: boolean = false): Promise<boolean> {
    return false;
  }

  // TODO(phase-5): Replace with:
  //   const customerInfo = await Purchases.restorePurchases();
  //   return this.applyCustomerInfo(customerInfo);
  async restorePurchases(): Promise<boolean> {
    return false;
  }

  // TODO(phase-5): Add `private applyCustomerInfo(info)` that reads
  // info.entitlements.active['premium'] and updates the store with the real
  // expiry. Until then, premium remains derivable only from persisted state.
}
