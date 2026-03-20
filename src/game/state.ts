export type SceneId = 'rain-window' | 'cozy-room' | 'sand-table';
export type SoundPackId = string;
export type SubscriptionTier = 'free' | 'premium';

export interface MixerLayer {
  id: string;
  packId: string;
  soundId: string;
  volume: number;
  muted: boolean;
}

export interface SavedPreset {
  id: string;
  name: string;
  sceneId: SceneId;
  layers: MixerLayer[];
  createdAt: number;
}

export interface AppState {
  // Navigation
  currentScreen: 'splash' | 'home' | 'scene-select' | 'player' | 'settings';
  activeScene: SceneId;
  previousScene: SceneId | null;

  // Audio
  masterVolume: number;
  ambientVolume: number;
  interactionVolume: number;
  muted: boolean;
  activeLayers: MixerLayer[];

  // Sleep Timer
  timerActive: boolean;
  timerDurationMs: number;
  timerRemainingMs: number;
  timerFadeAudio: boolean;
  timerDimScreen: boolean;

  // Interaction
  isInteracting: boolean;
  interactionType: 'none' | 'tap' | 'drag' | 'hold';

  // Subscription
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: number;

  // Preferences
  hapticsEnabled: boolean;
  dimScreenPreference: boolean;
  lastUsedScene: SceneId | null;
  lastUsedTimerMs: number;

  // Favorites & Presets
  favoriteScenes: SceneId[];
  savedPresets: SavedPreset[];

  // Session
  sessionCount: number;
  totalSessionTimeMs: number;
  firstLaunch: boolean;
  onboardingComplete: boolean;

  // Paywall
  paywallShown: boolean;
  paywallTriggerCount: number;
}

export function createInitialState(): AppState {
  return {
    currentScreen: 'splash',
    activeScene: 'rain-window',
    previousScene: null,

    masterVolume: 0.8,
    ambientVolume: 0.7,
    interactionVolume: 0.6,
    muted: false,
    activeLayers: [],

    timerActive: false,
    timerDurationMs: 0,
    timerRemainingMs: 0,
    timerFadeAudio: true,
    timerDimScreen: true,

    isInteracting: false,
    interactionType: 'none',

    subscriptionTier: 'free',
    subscriptionExpiresAt: 0,

    hapticsEnabled: true,
    dimScreenPreference: false,
    lastUsedScene: null,
    lastUsedTimerMs: 1800000, // 30 min default

    favoriteScenes: [],
    savedPresets: [],

    sessionCount: 0,
    totalSessionTimeMs: 0,
    firstLaunch: true,
    onboardingComplete: false,

    paywallShown: false,
    paywallTriggerCount: 0,
  };
}

type Listener = () => void;

export class Store {
  state: AppState;
  private listeners: Set<Listener> = new Set();
  private isNotifying: boolean = false;

  constructor(initial: AppState) {
    this.state = initial;
  }

  update(partial: Partial<AppState>) {
    Object.assign(this.state, partial);
    if (this.isNotifying) return;
    this.notify();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.isNotifying = true;
    this.listeners.forEach(fn => fn());
    this.isNotifying = false;
  }
}
