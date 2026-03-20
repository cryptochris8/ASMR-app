import { Store } from '../game/state';
import { CONFIG } from '../game/config';
import { AudioManager } from '../audio/AudioManager';

export class SleepTimer {
  private store: Store;
  private audio: AudioManager;
  private intervalId: number | null = null;
  private dimOverlay: HTMLElement | null = null;

  constructor(store: Store, audio: AudioManager) {
    this.store = store;
    this.audio = audio;
  }

  start(durationMs: number): void {
    this.stop(); // Clear any existing timer

    this.store.update({
      timerActive: true,
      timerDurationMs: durationMs,
      timerRemainingMs: durationMs,
      lastUsedTimerMs: durationMs,
    });

    const tickInterval = 1000;
    this.intervalId = window.setInterval(() => {
      const remaining = this.store.state.timerRemainingMs - tickInterval;

      if (remaining <= 0) {
        this.onTimerEnd();
        return;
      }

      this.store.update({ timerRemainingMs: remaining });

      // Start fading audio in the last phase
      if (remaining <= CONFIG.timerFadeDuration && this.store.state.timerFadeAudio) {
        const fadeProgress = 1 - (remaining / CONFIG.timerFadeDuration);
        const targetVolume = this.store.state.masterVolume * (1 - fadeProgress);
        this.audio.fadeMasterTo(Math.max(0, targetVolume), tickInterval);
      }

      // Dim screen gradually
      if (remaining <= CONFIG.timerFadeDuration && this.store.state.timerDimScreen) {
        const fadeProgress = remaining / CONFIG.timerFadeDuration;
        this.updateDimOverlay(1 - fadeProgress);
      }
    }, tickInterval);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.store.update({
      timerActive: false,
      timerRemainingMs: 0,
    });

    // Restore volume
    this.audio.fadeMasterTo(this.store.state.masterVolume, 500);

    // Remove dim overlay
    this.removeDimOverlay();
  }

  private onTimerEnd(): void {
    this.stop();

    // Fade out all audio
    this.audio.fadeMasterTo(0, 3000);

    // Full dim
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
