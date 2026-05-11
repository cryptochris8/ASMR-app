import { Store, AppState } from '../game/state';

const SAVE_KEY = 'asmr-sleep-save';
const SAVE_DEBOUNCE_MS = 2000;
const SCHEMA_VERSION = 1;

const TRANSIENT_KEYS: ReadonlyArray<keyof AppState> = [
  'currentScreen',
  'paywallShown',
  'isInteracting',
  'interactionType',
  'timerActive',
  'timerRemainingMs',
  'sleepModeRequested',
  'timerFadeFactor',
];

function migrate(saved: any): any {
  let v = saved.schemaVersion ?? 0;
  // future: if (v === 1) { /* upgrade to 2 */; v = 2; }
  saved.schemaVersion = SCHEMA_VERSION;
  return saved;
}

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

      let saved = JSON.parse(raw) as Partial<AppState> & { schemaVersion?: number };
      saved = migrate(saved);

      delete saved.schemaVersion;

      for (const key of TRANSIENT_KEYS) {
        delete saved[key];
      }

      this.store.update(saved);
    } catch (err) {
      console.warn('[Save] Failed to load:', err);
    }

    // TEMP DEV OVERRIDE — force premium so older localStorage saves get
    // upgraded for mobile testing. Remove before launch.
    this.store.update({
      subscriptionTier: 'premium',
      subscriptionExpiresAt: Date.now() + 365 * 24 * 60 * 60_000,
    });
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
      const state: Partial<AppState> & { schemaVersion: number } = {
        ...this.store.state,
        schemaVersion: SCHEMA_VERSION,
      };

      for (const key of TRANSIENT_KEYS) {
        delete state[key];
      }

      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('[save] persist failed:', err);
    }
  }
}
