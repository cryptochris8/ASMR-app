import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Store, createInitialState } from '../game/state';
import { SleepTimer } from '../systems/SleepTimer';

function makeAudioStub() {
  return {
    fadeMasterTo: vi.fn(),
    stopAll: vi.fn(),
  } as unknown as import('../audio/AudioManager').AudioManager;
}

describe('SleepTimer', () => {
  let store: Store;
  let audio: ReturnType<typeof makeAudioStub>;
  let timer: SleepTimer;

  beforeEach(() => {
    vi.useFakeTimers();
    store = new Store(createInitialState());
    audio = makeAudioStub();
    timer = new SleepTimer(store, audio);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('start() sets timerActive=true; after 1s the remaining decrements', () => {
    const duration = 10_000;
    timer.start(duration);

    expect(store.state.timerActive).toBe(true);
    expect(store.state.timerRemainingMs).toBe(duration);

    // Advance 1 second so the first tick fires.
    vi.advanceTimersByTime(1000);

    // Remaining should be less than the full duration now.
    expect(store.state.timerRemainingMs).toBeLessThan(duration);
    expect(store.state.timerRemainingMs).toBeGreaterThan(0);
  });

  it('end-time is wall-clock anchored: resync() after 5s of elapsed time yields remaining ≈ duration-5s', () => {
    const duration = 30_000;
    timer.start(duration);

    // Advance 5 real-fake seconds.
    vi.advanceTimersByTime(5000);

    // resync() fires the tick immediately against the anchored endTime.
    timer.resync();

    // Allow the synchronous tick to be processed (resync calls tick() directly).
    // Remaining should be approximately duration - 5s, not 0 or the full duration.
    const remaining = store.state.timerRemainingMs;
    expect(remaining).toBeLessThanOrEqual(duration - 5000 + 200); // +200ms tolerance
    expect(remaining).toBeGreaterThan(0);
  });

  it('stop() clears the handle; subsequent time advance does not call fadeMasterTo again', () => {
    timer.start(60_000);
    timer.stop();

    const callsAfterStop = (audio.fadeMasterTo as ReturnType<typeof vi.fn>).mock.calls.length;

    // Advance well past the original tick interval.
    vi.advanceTimersByTime(5000);

    // No additional fadeMasterTo calls should have happened from ticks.
    expect((audio.fadeMasterTo as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsAfterStop);
    expect(store.state.timerActive).toBe(false);
  });
});
