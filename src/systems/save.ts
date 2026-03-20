import { Store, AppState } from '../game/state';

const SAVE_KEY = 'asmr-sleep-save';
const SAVE_DEBOUNCE_MS = 2000;

export class SaveSystem {
  private store: Store;
  private saveTimer: number | null = null;

  constructor(store: Store) {
    this.store = store;
  }

  load(): void {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;

      const saved = JSON.parse(raw) as Partial<AppState>;

      // Don't restore transient state
      delete saved.currentScreen;
      delete saved.isInteracting;
      delete saved.interactionType;
      delete saved.timerActive;
      delete saved.timerRemainingMs;
      delete saved.paywallShown;

      this.store.update(saved);
    } catch (err) {
      console.warn('[Save] Failed to load:', err);
    }
  }

  autoSave(): void {
    this.store.subscribe(() => {
      if (this.saveTimer !== null) {
        clearTimeout(this.saveTimer);
      }
      this.saveTimer = window.setTimeout(() => {
        this.save();
      }, SAVE_DEBOUNCE_MS);
    });
  }

  private save(): void {
    try {
      const state = { ...this.store.state };
      // Don't persist transient state
      delete (state as any).currentScreen;
      delete (state as any).isInteracting;
      delete (state as any).interactionType;
      delete (state as any).timerActive;
      delete (state as any).timerRemainingMs;

      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('[Save] Failed to save:', err);
    }
  }
}
