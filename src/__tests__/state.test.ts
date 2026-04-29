import { describe, it, expect, beforeEach } from 'vitest';
import { Store, createInitialState } from '../game/state';

describe('Store', () => {
  let store: Store;

  beforeEach(() => {
    store = new Store(createInitialState());
  });

  it('update() notifies subscribers', () => {
    let callCount = 0;
    store.subscribe(() => { callCount++; });

    store.update({ muted: true });

    expect(callCount).toBe(1);
    expect(store.state.muted).toBe(true);
  });

  it('nested update() inside listener triggers a second notify pass (re-entrancy via pendingNotify)', () => {
    const calls: string[] = [];

    store.subscribe(() => {
      calls.push('A:muted=' + store.state.muted);
      if (store.state.muted && !store.state.timerActive) {
        // nested update while notifying — must queue, not drop
        store.update({ timerActive: true });
      }
    });

    store.subscribe(() => {
      calls.push('B:timerActive=' + store.state.timerActive);
    });

    store.update({ muted: true });

    // Both listeners fire on the first pass.
    // The nested update triggers a second pass (pendingNotify loop).
    expect(store.state.muted).toBe(true);
    expect(store.state.timerActive).toBe(true);

    // Listener A fires: once for muted, once for the re-entry from timerActive.
    const aCalls = calls.filter(c => c.startsWith('A:'));
    expect(aCalls.length).toBeGreaterThanOrEqual(2);

    // On the second pass timerActive must be visible to listener B.
    const bSecondPass = calls.filter(c => c === 'B:timerActive=true');
    expect(bSecondPass.length).toBeGreaterThanOrEqual(1);
  });

  it('multiple listeners all receive the same state snapshot', () => {
    const snapshots: boolean[] = [];

    store.subscribe(() => snapshots.push(store.state.muted));
    store.subscribe(() => snapshots.push(store.state.muted));
    store.subscribe(() => snapshots.push(store.state.muted));

    store.update({ muted: true });

    expect(snapshots).toEqual([true, true, true]);
  });
});
