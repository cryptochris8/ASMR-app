import { Store, effectiveMasterVolume } from '../game/state';

/**
 * Tracks HTMLAudioElement-based music/loop tracks that scenes own
 * (Moonlight in cozy-room, Gymnopédie in apothecary, candle flicker, etc).
 *
 * Why this exists: the Web Audio masterGain doesn't apply to <audio>
 * elements, so the SleepTimer's fade and the Mixer's master volume
 * slider used to leave music playing at full blast. This module lets
 * scenes register their elements once; on every store change we
 * recompute and apply `intrinsicVolume * effectiveMasterVolume(state)`.
 *
 * `intrinsicVolume` is the per-track baseline (e.g. Gymnopédie sits at
 * 0.85, candle flicker at 0.5) — it's the value the scene wants when
 * the master is at 100%. The track is unregistered on scene dispose.
 */
interface RegisteredTrack {
  el: HTMLAudioElement;
  intrinsicVolume: number;
}

class MusicChannelImpl {
  private store: Store | null = null;
  private tracks: RegisteredTrack[] = [];
  private unsubscribe: (() => void) | null = null;

  init(store: Store): void {
    if (this.store) return;
    this.store = store;
    this.unsubscribe = store.subscribe(() => this.applyVolumes());
  }

  register(el: HTMLAudioElement, intrinsicVolume: number): void {
    this.tracks.push({ el, intrinsicVolume });
    this.applyVolumes();
  }

  unregister(el: HTMLAudioElement): void {
    this.tracks = this.tracks.filter(t => t.el !== el);
  }

  private applyVolumes(): void {
    if (!this.store) return;
    const eff = effectiveMasterVolume(this.store.state);
    for (const { el, intrinsicVolume } of this.tracks) {
      el.volume = Math.max(0, Math.min(1, intrinsicVolume * eff));
    }
  }
}

export const musicChannel = new MusicChannelImpl();
