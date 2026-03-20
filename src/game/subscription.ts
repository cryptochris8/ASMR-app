import { Store } from './state';

export class SubscriptionManager {
  private store: Store;

  constructor(store: Store) {
    this.store = store;
  }

  isPremium(): boolean {
    const { subscriptionTier, subscriptionExpiresAt } = this.store.state;
    if (subscriptionTier === 'free') return false;
    if (subscriptionExpiresAt > 0 && Date.now() > subscriptionExpiresAt) {
      this.store.update({ subscriptionTier: 'free' });
      return false;
    }
    return true;
  }

  isContentLocked(requiresPremium: boolean): boolean {
    return requiresPremium && !this.isPremium();
  }

  // Stub for actual IAP — will integrate with RevenueCat or native IAP
  async purchaseMonthly(): Promise<boolean> {
    console.log('[Subscription] Monthly purchase requested — stub');
    return false;
  }

  async purchaseYearly(): Promise<boolean> {
    console.log('[Subscription] Yearly purchase requested — stub');
    return false;
  }

  async restorePurchases(): Promise<boolean> {
    console.log('[Subscription] Restore requested — stub');
    return false;
  }
}
