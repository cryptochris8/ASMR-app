import { describe, it, expect, beforeEach } from 'vitest';
import { Store, createInitialState } from '../game/state';
import { SubscriptionManager } from '../game/subscription';

describe('SubscriptionManager', () => {
  let store: Store;
  let sub: SubscriptionManager;

  beforeEach(() => {
    store = new Store(createInitialState());
    sub = new SubscriptionManager(store);
  });

  it('isPremium() returns true when tier=premium and expires in the future', () => {
    store.update({
      subscriptionTier: 'premium',
      subscriptionExpiresAt: Date.now() + 86_400_000,
    });

    expect(sub.isPremium()).toBe(true);
  });

  it('isPremium() returns false when tier=free', () => {
    store.update({ subscriptionTier: 'free', subscriptionExpiresAt: 0 });
    expect(sub.isPremium()).toBe(false);
  });

  it('isPremium() returns false when subscription has expired (pure — no side-effects)', () => {
    store.update({
      subscriptionTier: 'premium',
      subscriptionExpiresAt: Date.now() - 1,
    });

    const result = sub.isPremium();

    // isPremium() is pure: it must return false for expired premium...
    expect(result).toBe(false);
    // ...but must NOT mutate state (that is checkExpiry()'s job).
    expect(store.state.subscriptionTier).toBe('premium');
  });

  it('checkExpiry() resets tier to free and clears expiresAt when expired', () => {
    store.update({
      subscriptionTier: 'premium',
      subscriptionExpiresAt: Date.now() - 1,
    });

    sub.checkExpiry();

    expect(store.state.subscriptionTier).toBe('free');
    expect(store.state.subscriptionExpiresAt).toBeNull();
  });

  it('checkExpiry() is a no-op when subscription has not expired', () => {
    store.update({
      subscriptionTier: 'premium',
      subscriptionExpiresAt: Date.now() + 86_400_000,
    });

    sub.checkExpiry();

    expect(store.state.subscriptionTier).toBe('premium');
  });
});
