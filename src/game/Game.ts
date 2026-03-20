import * as THREE from 'three';
import { CONFIG } from './config';
import { Store, createInitialState, SceneId } from './state';
import { SubscriptionManager } from './subscription';
import { createRenderer } from '../render/renderer';
import { createScene, switchSceneBackground, buildCozyRoomScene, buildSandTableScene } from '../render/scene';
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
import { getScene } from '../content/scenes';
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

  // 3D scene groups
  private currentSceneGroup: THREE.Group | null = null;

  // Rain Window interactive scene
  private rainWindowScene: RainWindowScene | null = null;

  // UI
  private homeScreen: HomeScreen;
  private playerHUD: PlayerHUD;
  private timerModal: TimerModal;
  private mixerPanel: MixerPanel;
  private settingsScreen: SettingsScreen;
  private paywallScreen: PaywallScreen;

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

    // Audio — main mixer system (ambient loops, mixer panel layers)
    this.audioManager = new AudioManager(this.store);

    // Audio — 3-layer interaction system (tap/drag/hold + ambient one-shots)
    this.interactionAudio = new InteractionAudioManager(CONFIG.interaction);

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
      // Timer display update
      if (this.store.state.currentScreen === 'player') {
        this.playerHUD.updateTimerDisplay();
      }

      // Mute/unmute interaction audio to match
      if (this.interactionAudio.isReady()) {
        const vol = this.store.state.muted ? 0 : this.store.state.masterVolume;
        this.interactionAudio.setMasterVolume(vol);
      }
    });

    // Session tracking
    this.store.update({
      sessionCount: this.store.state.sessionCount + 1,
      firstLaunch: this.store.state.sessionCount === 0,
    });

    // Show splash then home
    new SplashScreen(container, () => {
      this.store.update({ currentScreen: 'home' });
      this.homeScreen.show();
    });

    // Start render loop
    this.animate();

    // Init native (Capacitor)
    initNative();
  }

  // =============================================
  // SCENE SELECTION
  // =============================================

  private selectScene(sceneId: SceneId): void {
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
    this.gyroLook.recalibrate();

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

    // Build 3D scene
    this.loadScene(sceneId);

    // Load 3-layer interaction audio (base ambience + interactions + ambient one-shots)
    this.interactionAudio.loadScene(sceneId);
  }

  // =============================================
  // 3D SCENE MANAGEMENT
  // =============================================

  private loadScene(sceneId: SceneId): void {
    // Clear previous scene objects
    if (this.rainWindowScene) {
      this.rainWindowScene.dispose();
      this.rainWindowScene = null;
    }
    if (this.currentSceneGroup) {
      this.scene.remove(this.currentSceneGroup);
      this.currentSceneGroup = null;
    }

    // Transition background
    switchSceneBackground(this.scene, sceneId);

    // Update lighting
    const sceneColors = CONFIG.sceneColors[sceneId];
    if (sceneColors) {
      updateSceneLighting(this.lights, sceneColors.ambient, sceneColors.directional);
    }

    // Build scene objects
    switch (sceneId) {
      case 'rain-window':
        this.rainWindowScene = new RainWindowScene(this.scene);
        this.currentSceneGroup = this.rainWindowScene.group;
        break;
      case 'cozy-room':
        this.currentSceneGroup = buildCozyRoomScene(this.scene);
        break;
      case 'sand-table':
        this.currentSceneGroup = buildSandTableScene(this.scene);
        break;
    }

    // Setup interaction input for this scene
    this.setupInput();
  }

  // =============================================
  // INPUT → INTERACTION AUDIO
  // =============================================

  /** Convert screen pixel coordinates to NDC (-1 to 1) */
  private screenToNDC(x: number, y: number): { ndcX: number; ndcY: number } {
    return {
      ndcX: (x / window.innerWidth) * 2 - 1,
      ndcY: -(y / window.innerHeight) * 2 + 1,
    };
  }

  private setupInput(): void {
    const surface = this.interactionAudio.getSceneSurface();
    const isRainWindow = this.store.state.activeScene === 'rain-window';

    this.inputSystem = new InputSystem(this.container, {
      // --- TAP: audio + visual ripple on glass ---
      onTap: (x, y) => {
        this.playerHUD.bringUpUI();
        this.interactionAudio.playTap(surface);

        // Rain window: raycast → ripple on glass
        if (isRainWindow && this.rainWindowScene) {
          const { ndcX, ndcY } = this.screenToNDC(x, y);
          const hit = this.rainWindowScene.hitTest(ndcX, ndcY, this.camera);
          if (hit) {
            this.rainWindowScene.drawRipple(hit.u, hit.v);
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

      // --- DRAG: audio + condensation trail ---
      onDragStart: (x, y) => {
        this.playerHUD.bringUpUI();
        this.interactionAudio.startDrag(surface);

        // Rain window: start condensation trail
        if (isRainWindow && this.rainWindowScene) {
          const { ndcX, ndcY } = this.screenToNDC(x, y);
          const hit = this.rainWindowScene.hitTest(ndcX, ndcY, this.camera);
          if (hit) {
            this.rainWindowScene.drawTrail(hit.u, hit.v);
          }
        }

        this.store.update({ isInteracting: true, interactionType: 'drag' });
      },

      onDragMove: (x, y, dx, dy) => {
        // Normalize speed to 0-1 based on movement delta
        const speed = Math.sqrt(dx * dx + dy * dy) / CONFIG.interaction.dragSpeedNormalize;
        this.interactionAudio.updateDrag(speed);

        // Rain window: extend condensation trail
        if (isRainWindow && this.rainWindowScene) {
          const { ndcX, ndcY } = this.screenToNDC(x, y);
          const hit = this.rainWindowScene.hitTest(ndcX, ndcY, this.camera);
          if (hit) {
            this.rainWindowScene.drawTrail(hit.u, hit.v);
          }
        }
      },

      onDragEnd: () => {
        this.interactionAudio.stopDrag();

        // Rain window: end trail line continuity
        if (isRainWindow && this.rainWindowScene) {
          this.rainWindowScene.endTrail();
        }

        this.store.update({ isInteracting: false, interactionType: 'none' });
      },

      // --- HOLD: sustained layer fade-in → fade-out on release ---
      onHoldStart: (_x, _y) => {
        this.playerHUD.bringUpUI();
        this.interactionAudio.startHold(surface);

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

  private goHome(): void {
    // Stop all audio layers
    this.audioManager.stopAllAmbient();
    this.interactionAudio.unloadScene();

    // Clear scene objects
    if (this.rainWindowScene) {
      this.rainWindowScene.dispose();
      this.rainWindowScene = null;
    }
    if (this.currentSceneGroup) {
      this.scene.remove(this.currentSceneGroup);
      this.currentSceneGroup = null;
    }

    this.store.update({ currentScreen: 'home' });
    this.playerHUD.hide();
    this.homeScreen.show();
  }

  private toggleMute(): void {
    this.store.update({ muted: !this.store.state.muted });
    this.playerHUD.show(); // Re-render to update icon
  }

  private toggleDimScreen(): void {
    this.store.update({ dimScreenPreference: !this.store.state.dimScreenPreference });
  }

  // =============================================
  // ANIMATION LOOP
  // =============================================

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    const dt = this.clock.getDelta();

    // Update rain window effects (rain overlay + condensation fade)
    if (this.rainWindowScene) {
      this.rainWindowScene.update(dt);
    }

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
  }
}
