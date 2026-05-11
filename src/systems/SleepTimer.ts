import { Store } from '../game/state';
import { CONFIG } from '../game/config';
import { AudioManager } from '../audio/AudioManager';

export class SleepTimer {
  private store: Store;
  private audio: AudioManager;
  private timerHandle: number | null = null;
  private endTime: number = 0;
  private dimOverlay: HTMLElement | null = null;

  constructor(store: Store, audio: AudioManager) {
    this.store = store;
    this.audio = audio;
  }

  start(durationMs: number): void {
    this.stop();

    this.store.update({
      timerActive: true,
      timerDurationMs: durationMs,
      timerRemainingMs: durationMs,
      lastUsedTimerMs: durationMs,
      timerFadeFactor: 1.0,
    });

    this.endTime = Date.now() + durationMs;
    this.scheduleTick();
  }

  private scheduleTick = (): void => {
    this.timerHandle = window.setTimeout(this.tick, 1000);
  };

  private tick = (): void => {
    const remaining = Math.max(0, this.endTime - Date.now());

    if (remaining <= 0) {
      this.handleEnd();
      return;
    }

    this.store.update({ timerRemainingMs: remaining });

    // Audio fade — drive the global timerFadeFactor (0..1). All audio paths
    // (mixer, interaction, scene music) honor it via effectiveMasterVolume.
    if (remaining <= CONFIG.timerFadeDuration && this.store.state.timerFadeAudio) {
      const factor = Math.max(0, remaining / CONFIG.timerFadeDuration);
      this.store.update({ timerFadeFactor: factor });
    }

    if (remaining <= CONFIG.timerFadeDuration && this.store.state.timerDimScreen) {
      const fadeProgress = remaining / CONFIG.timerFadeDuration;
      this.updateDimOverlay(1 - fadeProgress);
    }

    this.scheduleTick();
  };

  /** Resync after the app returns from background — fires tick immediately without waiting. */
  resync(): void {
    if (!this.store.state.timerActive) return;
    if (this.timerHandle !== null) {
      window.clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
    this.tick();
  }

  stop(): void {
    if (this.timerHandle !== null) {
      window.clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }

    this.store.update({
      timerActive: false,
      timerRemainingMs: 0,
      timerFadeFactor: 1.0,
    });

    this.removeDimOverlay();
  }

  private handleEnd(): void {
    if (this.timerHandle !== null) {
      window.clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }

    this.store.update({
      timerActive: false,
      timerRemainingMs: 0,
      timerFadeFactor: 0,
    });

    if (this.store.state.timerDimScreen) {
      this.updateDimOverlay(CONFIG.timerDimOpacity);
    }
  }

  private updateDimOverlay(opacity: number): void {
    if (!this.dimOverlay) {
      this.dimOverlay = document.createElement('div');
      this.dimOverlay.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: #000; pointer-events: none; z-index: 9999;
        transition: opacity 1s ease;
      `;
      document.body.appendChild(this.dimOverlay);
    }
    this.dimOverlay.style.opacity = String(Math.min(opacity, CONFIG.timerDimOpacity));
  }

  private removeDimOverlay(): void {
    if (this.dimOverlay) {
      this.dimOverlay.style.opacity = '0';
      setTimeout(() => {
        this.dimOverlay?.remove();
        this.dimOverlay = null;
      }, 1000);
    }
  }

  getRemainingFormatted(): string {
    const ms = this.store.state.timerRemainingMs;
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  isActive(): boolean {
    return this.store.state.timerActive;
  }
}
