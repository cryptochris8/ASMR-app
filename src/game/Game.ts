import * as THREE from 'three';
import { CONFIG } from './config';
import { Store, createInitialState, SceneId } from './state';
import { SubscriptionManager } from './subscription';
import { SceneController } from './SceneController';
import { createRenderer } from '../render/renderer';
import { createScene, switchSceneBackground } from '../render/scene';
import { createCamera } from '../render/camera';
import { setupLighting, updateSceneLighting, SceneLights } from '../render/lighting';
import { AudioManager } from '../audio/AudioManager';
import { InteractionAudioManager } from '../audio/InteractionAudioManager';
import { InputSystem } from '../systems/input';
import { SleepTimer } from '../systems/SleepTimer';
import { HapticsSystem } from '../systems/haptics';
import { SaveSystem } from '../systems/save';
import { initNative } from '../systems/native';
import { GyroLookSystem } from '../systems/gyro-look';
import { RainWindowScene } from '../scenes/RainWindowScene';
import { CozyRoomScene } from '../scenes/CozyRoomScene';
import { SandTableScene } from '../scenes/SandTableScene';
import { TempleZenScene } from '../scenes/TempleZenScene';
import { ApothecaryShopScene } from '../scenes/ApothecaryShopScene';
import { HotspotEditor } from '../dev/HotspotEditor';
import { getScene } from '../content/scenes';
import { nightOverlay } from '../ui/NightOverlay';
import { SplashScreen } from '../ui/splash';
import { HomeScreen } from '../ui/home';
import { PlayerHUD } from '../ui/player';
import { TimerModal } from '../ui/timer-modal';
import { MixerPanel } from '../ui/mixer-panel';
import { SettingsScreen } from '../ui/settings';
import { PaywallScreen } from '../ui/paywall';

export class Game {
  private store: Store;
  private subscriptionManager: SubscriptionManager;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private lights: SceneLights;
  private audioManager: AudioManager;
  private interactionAudio: InteractionAudioManager;
  private inputSystem!: InputSystem;
  private sleepTimer: SleepTimer;
  private hapticsSystem: HapticsSystem;
  private gyroLook: GyroLookSystem;
  private saveSystem: SaveSystem;
  private clock: THREE.Clock;
  private container: HTMLElement;
  private sceneController: SceneController;

  // UI
  private homeScreen: HomeScreen;
  private playerHUD: PlayerHUD;
  private timerModal: TimerModal;
  private mixerPanel: MixerPanel;
  private settingsScreen: SettingsScreen;
  private paywallScreen: PaywallScreen;

  // Lifecycle
  private paused = false;
  private lastRenderTime = 0;
  private lastInputTime = 0;
  private lastDragHapticAt = 0;
  private wakeLock: any = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.store = new Store(createInitialState());
    this.clock = new THREE.Clock();

    // Persistence
    this.saveSystem = new SaveSystem(this.store);
    this.saveSystem.load();
    this.saveSystem.autoSave();

    // Subscription
    this.subscriptionManager = new SubscriptionManager(this.store);

    // Rendering
    this.renderer = createRenderer(container);
    this.scene = createScene(this.store.state.activeScene);
    this.camera = createCamera(container);
    this.lights = setupLighting(this.scene);

    // Scene controller — registry of IScene factories
    this.sceneController = new SceneController(this.scene, this.camera, container);
    this.sceneController.register('rain-window', () => new RainWindowScene());
    this.sceneController.register('cozy-room', () => new CozyRoomScene());
    this.sceneController.register('sand-table', () => new SandTableScene());
    this.sceneController.register('temple-zen', () => new TempleZenScene());
    this.sceneController.register('apothecary-shop', () => new ApothecaryShopScene());

    // Audio — main mixer system (ambient loops, mixer panel layers)
    this.audioManager = new AudioManager(this.store);

    // Audio — 3-layer interaction system (tap/drag/hold + ambient one-shots)
    this.interactionAudio = new InteractionAudioManager(CONFIG.interaction, this.store);

    // Systems
    this.hapticsSystem = new HapticsSystem();
    this.gyroLook = new GyroLookSystem();
    this.sleepTimer = new SleepTimer(this.store, this.audioManager);

    // UI
    this.homeScreen = new HomeScreen(
      container,
      this.store,
      (sceneId) => this.selectScene(sceneId),
      () => this.timerModal.show(),
      () => this.settingsScreen.show(),
    );

    this.playerHUD = new PlayerHUD(container, this.store, {
      onTimerOpen: () => this.timerModal.show(),
      onMixerOpen: () => this.mixerPanel.show(),
      onBack: () => this.goHome(),
      onToggleMute: () => this.toggleMute(),
      onDimScreen: () => this.toggleDimScreen(),
    });

    this.timerModal = new TimerModal(container, this.store, this.sleepTimer);
    this.mixerPanel = new MixerPanel(container, this.store, this.audioManager);
    this.settingsScreen = new SettingsScreen(container, this.store, this.subscriptionManager, () => {});
    this.paywallScreen = new PaywallScreen(container, this.store, this.subscriptionManager, () => {});

    // Subscribe to state changes
    this.store.subscribe(() => {
      if (this.store.state.currentScreen === 'player') {
        this.playerHUD.updateTimerDisplay();
      }

      if (this.interactionAudio.isReady()) {
        const vol = this.store.state.muted ? 0 : this.store.state.masterVolume;
        this.interactionAudio.setMasterVolume(vol);
      }

      nightOverlay.setEnabled(this.store.state.warmScreenTintEnabled);

      if (this.store.state.sleepModeRequested) {
        const timerMs = this.store.state.lastUsedTimerMs ?? 30 * 60_000;
        this.store.update({
          timerDurationMs: timerMs,
          timerRemainingMs: timerMs,
          dimScreenPreference: true,
          timerFadeAudio: true,
          sleepModeRequested: false,
        });
        this.sleepTimer.start(timerMs);
      }
    });

    // Session tracking
    this.store.update({
      sessionCount: this.store.state.sessionCount + 1,
      firstLaunch: this.store.state.sessionCount === 0,
    });

    // Visibility handler — handles app backgrounding/foregrounding
    document.addEventListener('visibilitychange', this.onVisibility);

    // Onboarding: show on first launch before home screen
    this.startupFlow(container);

    // Re-evaluate any persisted premium subscription against current wall clock
    this.subscriptionManager.checkExpiry();

    // Start render loop
    this.animate();

    // Init native (Capacitor)
    initNative();

    // Dev-only: hotspot placement tool. Activate with ?hotspots=edit in URL.
    if (new URLSearchParams(location.search).get('hotspots') === 'edit') {
      const editor = new HotspotEditor(this.renderer.domElement, this.camera, this.store);
      editor.enable();
      (window as any).__hotspotEditor = editor;
    }
  }

  private async startupFlow(container: HTMLElement): Promise<void> {
    new SplashScreen(container, async () => {
      if (!this.store.state.onboardingComplete) {
        try {
          // Dynamic path prevents TS resolution error before Agent B lands the file
          const mod = '../ui/onboarding' as string;
          const { OnboardingScreen } = await import(/* @vite-ignore */ mod);
          const onboarding = new OnboardingScreen(container);
          onboarding.show(() => {
            this.store.update({ onboardingComplete: true });
            this.store.update({ currentScreen: 'home' });
            this.homeScreen.show();
          });
        } catch {
          // OnboardingScreen not yet available — fall through to home
          this.store.update({ currentScreen: 'home' });
          this.homeScreen.show();
        }
      } else {
        this.store.update({ currentScreen: 'home' });
        this.homeScreen.show();
      }
    });
  }

  private onVisibility = async (): Promise<void> => {
    if (document.visibilityState === 'hidden') {
      this.paused = true;
      try { await this.wakeLock?.release?.(); } catch {}
      this.wakeLock = null;
    } else {
      this.paused = false;
      // Drain accumulated delta so the first rendered frame doesn't spike
      this.clock.getDelta();
      await (this.audioManager as any).resumeContext?.();
      await (this.interactionAudio as any).resumeContext?.();
      this.subscriptionManager.checkExpiry();
      if (this.store.state.currentScreen === 'player') {
        await this.acquireWakeLock();
      }
      this.sleepTimer?.resync?.();
      requestAnimationFrame(this.animate);
    }
  };

  private async acquireWakeLock(): Promise<void> {
    try {
      this.wakeLock = await (navigator as any).wakeLock?.request?.('screen');
    } catch {}
  }

  // =============================================
  // SCENE SELECTION
  // =============================================

  private async selectScene(sceneId: SceneId): Promise<void> {
    const sceneDef = getScene(sceneId);
    if (!sceneDef) return;

    // Check premium lock
    if (this.subscriptionManager.isContentLocked(sceneDef.premium)) {
      if (this.paywallScreen.shouldTrigger()) {
        this.paywallScreen.show();
      }
      return;
    }

    // Unlock audio on first interaction (user gesture context)
    this.audioManager.unlock();

    // Enable gyroscope (iOS requires user gesture for permission)
    this.gyroLook.enable();

    // Initialize interaction audio system with shared AudioContext
    if (!this.interactionAudio.isReady()) {
      const ctx = this.audioManager.getContext();
      if (ctx) {
        this.interactionAudio.init(ctx, ctx.destination);
      }
    }

    // Update state
    this.store.update({
      activeScene: sceneId,
      lastUsedScene: sceneId,
      currentScreen: 'player',
    });

    // Transition UI
    this.homeScreen.hide();
    this.playerHUD.show();

    // Transition background then load IScene
    switchSceneBackground(this.scene, sceneId);
    const sceneColors = CONFIG.sceneColors[sceneId];
    if (sceneColors) {
      updateSceneLighting(this.lights, sceneColors.ambient, sceneColors.directional);
    }
    await this.sceneController.load(sceneId);

    // Load interaction audio first, then bind input so callbacks are ready
    await this.interactionAudio.loadScene(sceneId);
    this.setupInput();

    await this.acquireWakeLock();
  }

  // =============================================
  // INPUT → INTERACTION AUDIO
  // =============================================

  private screenToNDC(x: number, y: number): { ndcX: number; ndcY: number } {
    return {
      ndcX: (x / window.innerWidth) * 2 - 1,
      ndcY: -(y / window.innerHeight) * 2 + 1,
    };
  }

  private hitTestActive(x: number, y: number) {
    const scene = this.sceneController.current();
    if (!scene) return null;
    const { ndcX, ndcY } = this.screenToNDC(x, y);
    return scene.hitTest(new THREE.Vector2(ndcX, ndcY));
  }

  private setupInput(): void {
    const surface = this.interactionAudio.getSceneSurface();
    const activeScene = this.store.state.activeScene;

    this.inputSystem?.dispose();

    this.inputSystem = new InputSystem(this.container, {
      onTap: (x, y) => {
        this.lastInputTime = Date.now();
        this.playerHUD.bringUpUI();

        // Hotspot scenes: require a hit and use the hotspot's surface.
        // Outside any hotspot = silent.
        let tapSurface = surface;
        if (activeScene === 'cozy-room' || activeScene === 'apothecary-shop') {
          const hit = this.hitTestActive(x, y);
          if (!hit?.surface) {
            this.store.update({ isInteracting: true, interactionType: 'tap' });
            setTimeout(() => this.store.update({ isInteracting: false, interactionType: 'none' }), CONFIG.tapFeedbackDuration);
            return;
          }
          tapSurface = hit.surface as typeof surface;
        }
        this.interactionAudio.playTap(tapSurface);

        // Sticky speaker: tap-to-toggle Moonlight
        if (activeScene === 'cozy-room' && tapSurface === 'speaker') {
          const crs = this.sceneController.current() as CozyRoomScene | null;
          crs?.toggleSpeakerMusic();
        }
        // Sticky candles: tap-to-toggle flicker loop
        if (activeScene === 'apothecary-shop' && tapSurface === 'candles') {
          const aps = this.sceneController.current() as ApothecaryShopScene | null;
          aps?.toggleCandleFlicker();
        }

        if (activeScene === 'rain-window') {
          const rws = this.sceneController.current() as RainWindowScene | null;
          if (rws) {
            const { ndcX, ndcY } = this.screenToNDC(x, y);
            const hit = rws.hitTestLegacy(ndcX, ndcY, this.camera);
            if (hit) rws.drawRipple(hit.u, hit.v);
          }
        }

        if (this.store.state.hapticsEnabled) {
          this.hapticsSystem.tapFeedback();
        }

        this.store.update({ isInteracting: true, interactionType: 'tap' });
        setTimeout(() => {
          this.store.update({ isInteracting: false, interactionType: 'none' });
        }, CONFIG.tapFeedbackDuration);
      },

      onDragStart: (x, y) => {
        this.lastInputTime = Date.now();
        this.playerHUD.bringUpUI();
        this.interactionAudio.startDrag(surface);

        if (activeScene === 'rain-window') {
          const rws = this.sceneController.current() as RainWindowScene | null;
          if (rws) {
            const { ndcX, ndcY } = this.screenToNDC(x, y);
            const hit = rws.hitTestLegacy(ndcX, ndcY, this.camera);
            if (hit) rws.drawTrail(hit.u, hit.v);
          }
        }

        if (activeScene === 'sand-table') {
          const sts = this.sceneController.current() as SandTableScene | null;
          if (sts) {
            const { ndcX, ndcY } = this.screenToNDC(x, y);
            const ndc = new THREE.Vector2(ndcX, ndcY);
            const hit = sts.hitTest(ndc);
            if (hit?.uv) sts.drawTrail(hit.uv.x, hit.uv.y);
          }
        }

        this.store.update({ isInteracting: true, interactionType: 'drag' });
      },

      onDragMove: (x, y, dx, dy) => {
        // Throttled drag haptic pulse
        if (Date.now() - this.lastDragHapticAt > 100) {
          (this.hapticsSystem as any).lightFeedback?.();
          this.lastDragHapticAt = Date.now();
        }

        const speed = Math.sqrt(dx * dx + dy * dy) / CONFIG.interaction.dragSpeedNormalize;
        this.interactionAudio.updateDrag(speed);

        if (activeScene === 'rain-window') {
          const rws = this.sceneController.current() as RainWindowScene | null;
          if (rws) {
            const { ndcX, ndcY } = this.screenToNDC(x, y);
            const hit = rws.hitTestLegacy(ndcX, ndcY, this.camera);
            if (hit) rws.drawTrail(hit.u, hit.v);
          }
        }

        if (activeScene === 'sand-table') {
          const sts = this.sceneController.current() as SandTableScene | null;
          if (sts) {
            const { ndcX, ndcY } = this.screenToNDC(x, y);
            const ndc = new THREE.Vector2(ndcX, ndcY);
            const hit = sts.hitTest(ndc);
            if (hit?.uv) sts.drawTrail(hit.uv.x, hit.uv.y);
          }
        }
      },

      onDragEnd: () => {
        this.interactionAudio.stopDrag();

        if (activeScene === 'rain-window') {
          const rws = this.sceneController.current() as RainWindowScene | null;
          rws?.endTrail();
        }

        if (activeScene === 'sand-table') {
          const sts = this.sceneController.current() as SandTableScene | null;
          sts?.endTrail();
        }

        this.store.update({ isInteracting: false, interactionType: 'none' });
      },

      onHoldStart: (x, y) => {
        this.lastInputTime = Date.now();
        this.playerHUD.bringUpUI();

        let holdSurface = surface;
        if (activeScene === 'cozy-room' || activeScene === 'apothecary-shop') {
          const hit = this.hitTestActive(x, y);
          if (!hit?.surface) return;
          holdSurface = hit.surface as typeof surface;
        }
        this.interactionAudio.startHold(holdSurface);

        if (this.store.state.hapticsEnabled) {
          this.hapticsSystem.holdFeedback();
        }

        this.store.update({ isInteracting: true, interactionType: 'hold' });
      },

      onHoldEnd: () => {
        this.interactionAudio.stopHold();
        this.store.update({ isInteracting: false, interactionType: 'none' });
      },
    });
  }

  // =============================================
  // NAVIGATION
  // =============================================

  private async goHome(): Promise<void> {
    this.audioManager.stopAllAmbient();
    this.interactionAudio.unloadScene();

    try { await this.wakeLock?.release?.(); } catch {}
    this.wakeLock = null;

    this.sceneController.disposeCurrent();

    this.store.update({ currentScreen: 'home' });
    this.playerHUD.hide();
    this.homeScreen.show();
  }

  private toggleMute(): void {
    this.store.update({ muted: !this.store.state.muted });
    this.playerHUD.show();
  }

  private toggleDimScreen(): void {
    this.store.update({ dimScreenPreference: !this.store.state.dimScreenPreference });
  }

  // =============================================
  // ANIMATION LOOP
  // =============================================

  private animate = (): void => {
    if (this.paused) return;

    requestAnimationFrame(this.animate);

    const now = performance.now();
    const targetMs = (now - this.lastInputTime < 600) ? 33 : 66;
    if (now - this.lastRenderTime < targetMs) return;
    this.lastRenderTime = now;

    const dt = this.clock.getDelta();

    this.sceneController.update(dt);

    // Update gyro + auto-pan and apply to skybox rotation
    this.gyroLook.update(dt);
    if (this.store.state.currentScreen === 'player') {
      const sceneDef = getScene(this.store.state.activeScene);
      if (sceneDef) {
        const baseY = sceneDef.skyboxRotationY;
        this.scene.backgroundRotation.set(
          this.gyroLook.getPitchOffset(),
          baseY + this.gyroLook.getYawOffset(),
          0,
        );
      }
    }

    this.renderer.render(this.scene, this.camera);
  };
}
