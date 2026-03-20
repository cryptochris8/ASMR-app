import { SceneId } from '../game/state';
import { AudioAssetRef, SceneAudioDef, InteractionAudioConfig, SurfaceType } from './types';
import { getSceneAudio } from './sceneAudioRegistry';

const DEFAULT_CONFIG: InteractionAudioConfig = {
  tapPitchMin: 0.97,
  tapPitchMax: 1.03,
  tapVolumeMin: 0.90,
  tapVolumeMax: 1.00,
  tapCooldownMs: 80,

  dragFadeInMs: 200,
  dragFadeOutMs: 300,
  dragMinVolume: 0.05,
  dragMaxVolume: 0.55,

  holdFadeInMs: 300,
  holdFadeOutMs: 250,
  holdMaxVolume: 0.35,

  ambientMinIntervalMs: 8000,
  ambientMaxIntervalMs: 30000,
  ambientMaxVolume: 0.30,

  maxOverlappingTaps: 4,
  maxSimultaneousSounds: 10,
};

interface ActiveDrag {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  loopIndex: number;
}

interface ActiveHold {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
}

export class InteractionAudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private config: InteractionAudioConfig;

  // Buffer cache
  private buffers: Map<string, AudioBuffer> = new Map();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  // Current scene
  private currentSceneId: SceneId | null = null;
  private currentSceneDef: SceneAudioDef | null = null;

  // Anti-repeat: track last played tap per surface
  private lastTapId: Map<string, string> = new Map();

  // Active tap tracking
  private activeTapCount: number = 0;
  private lastTapTime: number = 0;

  // Active drag state
  private activeDrag: ActiveDrag | null = null;

  // Active hold state
  private activeHold: ActiveHold | null = null;

  // Active ambient loops
  private activeAmbientSources: { source: AudioBufferSourceNode; gainNode: GainNode }[] = [];

  // Ambient one-shot scheduler
  private ambientTimerId: number | null = null;
  private lastOneShotTimes: Map<string, number> = new Map();

  constructor(config?: Partial<InteractionAudioConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /** Initialize with an existing AudioContext (shared with main AudioManager) */
  init(ctx: AudioContext, destination: AudioNode): void {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(destination);
  }

  isReady(): boolean {
    return this.ctx !== null && this.masterGain !== null;
  }

  // =============================================
  // SCENE LIFECYCLE
  // =============================================

  /** Load all audio assets for a scene and start base ambience + variations */
  async loadScene(sceneId: SceneId): Promise<void> {
    // Unload previous scene
    this.unloadScene();

    const sceneDef = getSceneAudio(sceneId);
    if (!sceneDef || !this.ctx) return;

    this.currentSceneId = sceneId;
    this.currentSceneDef = sceneDef;

    // Collect all asset refs for this scene
    const allAssets: AudioAssetRef[] = [
      ...sceneDef.baseAmbience,
      ...sceneDef.taps.flatMap(t => t.sounds),
      ...sceneDef.drags.flatMap(d => [...d.loops, ...(d.accents ?? [])]),
      ...sceneDef.holds.flatMap(h => h.loops),
      ...sceneDef.ambientOneShots.map(s => ({ id: s.id, file: s.file })),
    ];

    // Load all buffers in parallel
    await Promise.allSettled(
      allAssets.map(asset => this.loadBuffer(asset.id, `/audio/${asset.file}`))
    );

    // Start base ambience
    this.startBaseAmbience();

    // Start ambient one-shot scheduler
    this.startAmbientVariations();
  }

  /** Stop everything and release resources for current scene */
  unloadScene(): void {
    this.stopAmbientVariations();
    this.stopAllAmbience();
    this.stopDrag();
    this.stopHold();

    this.currentSceneId = null;
    this.currentSceneDef = null;
    this.lastTapId.clear();
    this.lastOneShotTimes.clear();
  }

  // =============================================
  // LAYER 1 — BASE AMBIENCE
  // =============================================

  private startBaseAmbience(): void {
    if (!this.ctx || !this.masterGain || !this.currentSceneDef) return;

    for (const asset of this.currentSceneDef.baseAmbience) {
      const buffer = this.buffers.get(asset.id);
      if (!buffer) continue;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = this.ctx.createGain();
      gain.gain.value = 0;
      // Fade in
      gain.gain.setTargetAtTime(0.7, this.ctx.currentTime, 0.5);

      source.connect(gain);
      gain.connect(this.masterGain);
      source.start(0);

      this.activeAmbientSources.push({ source, gainNode: gain });
    }
  }

  private stopAllAmbience(): void {
    for (const { source, gainNode } of this.activeAmbientSources) {
      if (this.ctx) {
        gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
      }
      setTimeout(() => {
        try { source.stop(); } catch {}
      }, 1000);
    }
    this.activeAmbientSources = [];
  }

  // =============================================
  // LAYER 2A — TAP INTERACTION
  // =============================================

  /** Play a tap sound with anti-repeat, pitch/volume randomization */
  playTap(surface?: SurfaceType): void {
    if (!this.ctx || !this.masterGain || !this.currentSceneDef) return;

    const now = performance.now();

    // Cooldown check
    if (now - this.lastTapTime < this.config.tapCooldownMs) return;

    // Max overlapping taps
    if (this.activeTapCount >= this.config.maxOverlappingTaps) return;

    // Find tap pool for surface (or pick first available)
    const pools = this.currentSceneDef.taps;
    const pool = surface
      ? pools.find(p => p.surface === surface) ?? pools[0]
      : pools[0];
    if (!pool || pool.sounds.length === 0) return;

    // Anti-repeat: pick random, but not the same as last
    const surfaceKey = pool.surface;
    const lastId = this.lastTapId.get(surfaceKey);
    let candidates = pool.sounds;
    if (candidates.length > 1 && lastId) {
      candidates = candidates.filter(s => s.id !== lastId);
    }
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    const buffer = this.buffers.get(chosen.id);
    if (!buffer) return;

    // Randomized pitch and volume
    const pitch = this.config.tapPitchMin + Math.random() * (this.config.tapPitchMax - this.config.tapPitchMin);
    const volume = this.config.tapVolumeMin + Math.random() * (this.config.tapVolumeMax - this.config.tapVolumeMin);

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitch;

    const gain = this.ctx.createGain();
    gain.gain.value = volume;

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(0);

    this.activeTapCount++;
    this.lastTapTime = now;
    this.lastTapId.set(surfaceKey, chosen.id);

    source.onended = () => {
      this.activeTapCount = Math.max(0, this.activeTapCount - 1);
    };
  }

  // =============================================
  // LAYER 2B — DRAG INTERACTION (Method A: Loop + Modulation)
  // =============================================

  /** Start a drag loop — fades in, responds to speed via updateDrag */
  startDrag(surface?: SurfaceType): void {
    if (!this.ctx || !this.masterGain || !this.currentSceneDef) return;
    if (this.activeDrag) return; // Already dragging

    const sets = this.currentSceneDef.drags;
    const set = surface
      ? sets.find(d => d.surface === surface) ?? sets[0]
      : sets[0];
    if (!set || set.loops.length === 0) return;

    // Pick a random loop (rotate between sessions)
    const loopIndex = Math.floor(Math.random() * set.loops.length);
    const chosen = set.loops[loopIndex];
    const buffer = this.buffers.get(chosen.id);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    // Fade in
    const fadeTime = this.config.dragFadeInMs / 1000 / 3;
    gain.gain.setTargetAtTime(this.config.dragMinVolume, this.ctx.currentTime, fadeTime);

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(0);

    this.activeDrag = { source, gainNode: gain, loopIndex };
  }

  /** Update drag volume/intensity based on movement speed (0-1 normalized) */
  updateDrag(speed: number): void {
    if (!this.activeDrag || !this.ctx) return;

    const clamped = Math.max(0, Math.min(1, speed));
    const volume = this.config.dragMinVolume + clamped * (this.config.dragMaxVolume - this.config.dragMinVolume);

    this.activeDrag.gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
  }

  /** Stop drag loop with fade-out */
  stopDrag(): void {
    if (!this.activeDrag || !this.ctx) return;

    const { source, gainNode } = this.activeDrag;
    const fadeTime = this.config.dragFadeOutMs / 1000 / 3;
    gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, fadeTime);

    const ref = this.activeDrag;
    this.activeDrag = null;

    setTimeout(() => {
      try { ref.source.stop(); } catch {}
    }, this.config.dragFadeOutMs + 100);
  }

  // =============================================
  // LAYER 2C — HOLD INTERACTION
  // =============================================

  /** Start a sustained hold layer — fades in gently */
  startHold(surface?: SurfaceType): void {
    if (!this.ctx || !this.masterGain || !this.currentSceneDef) return;
    if (this.activeHold) return; // Already holding

    const holds = this.currentSceneDef.holds;
    const holdDef = surface
      ? holds.find(h => h.surface === surface) ?? holds[0]
      : holds[0];
    if (!holdDef || holdDef.loops.length === 0) return;

    const chosen = holdDef.loops[Math.floor(Math.random() * holdDef.loops.length)];
    const buffer = this.buffers.get(chosen.id);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    // Smooth fade in
    const fadeTime = this.config.holdFadeInMs / 1000 / 3;
    gain.gain.setTargetAtTime(this.config.holdMaxVolume, this.ctx.currentTime, fadeTime);

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(0);

    this.activeHold = { source, gainNode: gain };
  }

  /** Stop hold layer with fade-out */
  stopHold(): void {
    if (!this.activeHold || !this.ctx) return;

    const { source, gainNode } = this.activeHold;
    const fadeTime = this.config.holdFadeOutMs / 1000 / 3;
    gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, fadeTime);

    const ref = this.activeHold;
    this.activeHold = null;

    setTimeout(() => {
      try { ref.source.stop(); } catch {}
    }, this.config.holdFadeOutMs + 100);
  }

  // =============================================
  // LAYER 3 — AMBIENT ONE-SHOT VARIATIONS
  // =============================================

  /** Start the ambient one-shot scheduler */
  startAmbientVariations(): void {
    if (this.ambientTimerId !== null) return;
    this.scheduleNextOneShot();
  }

  /** Stop the ambient one-shot scheduler */
  stopAmbientVariations(): void {
    if (this.ambientTimerId !== null) {
      clearTimeout(this.ambientTimerId);
      this.ambientTimerId = null;
    }
  }

  private scheduleNextOneShot(): void {
    const delay = this.config.ambientMinIntervalMs +
      Math.random() * (this.config.ambientMaxIntervalMs - this.config.ambientMinIntervalMs);

    this.ambientTimerId = window.setTimeout(() => {
      this.playRandomOneShot();
      this.scheduleNextOneShot();
    }, delay);
  }

  private playRandomOneShot(): void {
    if (!this.ctx || !this.masterGain || !this.currentSceneDef) return;

    const oneShots = this.currentSceneDef.ambientOneShots;
    if (oneShots.length === 0) return;

    const now = performance.now();

    // Filter to eligible one-shots (respect minInterval)
    const eligible = oneShots.filter(shot => {
      const lastTime = this.lastOneShotTimes.get(shot.id) ?? 0;
      return (now - lastTime) >= shot.minIntervalMs;
    });

    if (eligible.length === 0) return;

    const chosen = eligible[Math.floor(Math.random() * eligible.length)];
    const buffer = this.buffers.get(chosen.id);
    if (!buffer) return;

    // Subtle pitch variation
    const pitch = 0.98 + Math.random() * 0.04;
    const volume = chosen.maxVolume * (0.7 + Math.random() * 0.3);

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitch;

    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    // Quick fade in to avoid clicks
    gain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.08);

    source.connect(gain);
    gain.connect(this.masterGain);
    source.start(0);

    this.lastOneShotTimes.set(chosen.id, now);

    // Fade out near end
    source.onended = () => {
      // Cleanup happens naturally
    };
  }

  // =============================================
  // VOLUME CONTROL
  // =============================================

  /** Set master volume for all interaction audio */
  setMasterVolume(volume: number): void {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
  }

  /** Fade master volume (used by sleep timer) */
  fadeMasterTo(volume: number, durationMs: number): void {
    if (!this.masterGain || !this.ctx) return;
    const timeConstant = durationMs / 1000 / 3;
    this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, timeConstant);
  }

  // =============================================
  // BUFFER LOADING
  // =============================================

  private async loadBuffer(id: string, url: string): Promise<void> {
    if (this.buffers.has(id)) return;
    if (this.loadingPromises.has(id)) {
      await this.loadingPromises.get(id);
      return;
    }

    const promise = (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) return;
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
        this.buffers.set(id, audioBuffer);
      } catch (err) {
        console.warn(`[InteractionAudio] Failed to load ${id}:`, err);
      } finally {
        this.loadingPromises.delete(id);
      }
    })();

    this.loadingPromises.set(id, promise);
    await promise;
  }

  /** Get the primary surface type for the current scene */
  getSceneSurface(): SurfaceType | undefined {
    if (!this.currentSceneDef) return undefined;
    return this.currentSceneDef.taps[0]?.surface;
  }
}
