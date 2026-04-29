import { Store } from '../game/state';
import { CONFIG } from '../game/config';

interface LoadedBuffer {
  buffer: AudioBuffer;
  id: string;
}

interface ActiveSource {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  id: string;
  loop: boolean;
}

export class AudioManager {
  private store: Store;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private interactionGain: GainNode | null = null;
  private buffers: Map<string, AudioBuffer> = new Map();
  private activeSources: Map<string, ActiveSource> = new Map();
  private unlocked: boolean = false;
  private activeInteractionCount: number = 0;

  constructor(store: Store) {
    this.store = store;

    // React to volume changes
    store.subscribe(() => {
      this.updateVolumes();
    });
  }

  async unlock(): Promise<void> {
    if (this.unlocked) return;

    this.ctx = new AudioContext();
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.connect(this.masterGain);

    this.interactionGain = this.ctx.createGain();
    this.interactionGain.connect(this.masterGain);

    this.updateVolumes();
    this.unlocked = true;
  }

  getContext(): AudioContext | null {
    return this.ctx;
  }

  isUnlocked(): boolean {
    return this.unlocked;
  }

  private updateVolumes(): void {
    if (!this.masterGain || !this.ambientGain || !this.interactionGain) return;

    const { masterVolume, ambientVolume, interactionVolume, muted } = this.store.state;

    const master = muted ? 0 : masterVolume;
    this.masterGain.gain.setTargetAtTime(master, this.ctx!.currentTime, 0.05);
    this.ambientGain.gain.setTargetAtTime(ambientVolume, this.ctx!.currentTime, 0.05);
    this.interactionGain.gain.setTargetAtTime(interactionVolume, this.ctx!.currentTime, 0.05);
  }

  async loadSound(id: string, url: string): Promise<void> {
    if (this.buffers.has(id)) return;
    if (!this.ctx) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.buffers.set(id, audioBuffer);
    } catch (err) {
      console.warn(`[Audio] Failed to load ${id}:`, err);
    }
  }

  async loadSounds(sounds: { id: string; file: string }[]): Promise<void> {
    const promises = sounds.map(s =>
      this.loadSound(s.id, `/audio/packs/${s.file}`)
    );
    await Promise.allSettled(promises);
  }

  playAmbient(id: string, volume: number = 0.5): void {
    if (!this.ctx || !this.ambientGain) return;
    if (this.activeSources.has(id)) return; // Already playing

    const buffer = this.buffers.get(id);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0;
    gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, CONFIG.audioFadeInDuration / 1000 / 3);

    source.connect(gainNode);
    gainNode.connect(this.ambientGain);
    source.start(0);

    this.activeSources.set(id, { source, gainNode, id, loop: true });
  }

  stopAmbient(id: string): void {
    const active = this.activeSources.get(id);
    if (!active || !this.ctx) return;

    const fadeTime = CONFIG.audioFadeOutDuration / 1000;
    active.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, fadeTime / 3);

    setTimeout(() => {
      try { active.source.stop(); } catch {}
      this.activeSources.delete(id);
    }, CONFIG.audioFadeOutDuration);
  }

  stopAllAmbient(): void {
    for (const [id, active] of this.activeSources) {
      if (active.loop) {
        this.stopAmbient(id);
      }
    }
  }

  playInteraction(id: string, volume: number = 0.5): void {
    if (!this.ctx || !this.interactionGain) return;

    const buffer = this.buffers.get(id);
    if (!buffer) return;

    if (this.activeInteractionCount >= CONFIG.maxSimultaneousSounds) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = false;

    // Subtle pitch variation for natural feel
    source.playbackRate.value = 0.97 + Math.random() * 0.06;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.interactionGain);
    source.start(0);

    const instanceId = `${id}_${Date.now()}`;
    this.activeSources.set(instanceId, { source, gainNode, id: instanceId, loop: false });
    this.activeInteractionCount++;

    source.onended = () => {
      this.activeSources.delete(instanceId);
      this.activeInteractionCount = Math.max(0, this.activeInteractionCount - 1);
      try { source.disconnect(); } catch {}
      try { gainNode.disconnect(); } catch {}
    };
  }

  setLayerVolume(id: string, volume: number): void {
    const active = this.activeSources.get(id);
    if (!active || !this.ctx) return;

    active.gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1);
  }

  fadeMasterTo(volume: number, durationMs: number): void {
    if (!this.masterGain || !this.ctx) return;

    const fadeTime = durationMs / 1000 / 3; // time constant
    this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, fadeTime);
  }

  getMasterVolume(): number {
    return this.masterGain?.gain.value ?? 0;
  }

  async resumeContext(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch {}
    }
  }

  stopAll(): void {
    for (const [, active] of this.activeSources) {
      try { active.source.stop(); } catch {}
      try { active.source.disconnect(); } catch {}
      try { active.gainNode.disconnect(); } catch {}
    }
    this.activeSources.clear();
    this.activeInteractionCount = 0;
  }

  async dispose(): Promise<void> {
    this.stopAll();
    try { this.masterGain?.disconnect(); } catch {}
    try { this.ambientGain?.disconnect(); } catch {}
    try { this.interactionGain?.disconnect(); } catch {}
    await this.ctx?.close?.();
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.interactionGain = null;
    this.buffers.clear();
    this.unlocked = false;
  }

  getActiveSourceCount(): number {
    return this.activeSources.size;
  }
}
