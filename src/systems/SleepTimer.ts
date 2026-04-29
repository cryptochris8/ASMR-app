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

    if (remaining <= CONFIG.timerFadeDuration && this.store.state.timerFadeAudio) {
      const fadeProgress = 1 - (remaining / CONFIG.timerFadeDuration);
      const targetVolume = this.store.state.masterVolume * (1 - fadeProgress);
      this.audio.fadeMasterTo(Math.max(0, targetVolume), 1000);
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
    });

    this.audio.fadeMasterTo(this.store.state.masterVolume, 500);
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
    });

    this.audio.fadeMasterTo(0, 3000);

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
