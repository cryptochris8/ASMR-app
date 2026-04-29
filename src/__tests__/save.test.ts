import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Store, createInitialState } from '../game/state';
import { SaveSystem } from '../systems/save';

const SAVE_KEY = 'asmr-sleep-save';

describe('SaveSystem', () => {
  let store: Store;
  let saveSystem: SaveSystem;

  beforeEach(() => {
    store = new Store(createInitialState());
    saveSystem = new SaveSystem(store);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('save() writes schemaVersion field', () => {
    (saveSystem as any).save();

    const raw = localStorage.getItem(SAVE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.schemaVersion).toBe(1);
  });

  it('save() excludes transient keys: paywallShown, currentScreen, isInteracting', () => {
    store.update({ paywallShown: true, currentScreen: 'player', isInteracting: true });
    (saveSystem as any).save();

    const raw = localStorage.getItem(SAVE_KEY);
    const parsed = JSON.parse(raw!);

    expect(parsed).not.toHaveProperty('paywallShown');
    expect(parsed).not.toHaveProperty('currentScreen');
    expect(parsed).not.toHaveProperty('isInteracting');
  });

  it('load() with no localStorage entry does not throw and leaves state at defaults', () => {
    expect(() => saveSystem.load()).not.toThrow();
    expect(store.state.masterVolume).toBe(0.8);
  });

  it('load() of a v1 blob succeeds and merges non-transient fields', () => {
    const blob = JSON.stringify({
      schemaVersion: 1,
      masterVolume: 0.5,
      muted: true,
      // These transient keys must be stripped on load.
      currentScreen: 'player',
      paywallShown: true,
    });
    localStorage.setItem(SAVE_KEY, blob);

    saveSystem.load();

    expect(store.state.masterVolume).toBe(0.5);
    expect(store.state.muted).toBe(true);
    // Transient keys must not bleed through — defaults must be preserved.
    expect(store.state.currentScreen).toBe('splash');
    expect(store.state.paywallShown).toBe(false);
  });
});
