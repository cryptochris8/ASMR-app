import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Store, createInitialState } from '../game/state';
import { AudioManager } from '../audio/AudioManager';

// Minimal AudioContext stub — just enough to let AudioManager.unlock() and
// playAmbient/playInteraction run without real Web Audio machinery.
function makeGainNodeStub() {
  return {
    gain: {
      value: 1,
      setTargetAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

function makeSourceNodeStub() {
  const node: any = {
    buffer: null,
    loop: false,
    playbackRate: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null,
  };
  return node;
}

function makeFakeAudioContext() {
  return {
    state: 'running' as AudioContextState,
    currentTime: 0,
    destination: {},
    resume: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    createGain: vi.fn(() => makeGainNodeStub()),
    createBufferSource: vi.fn(() => makeSourceNodeStub()),
    decodeAudioData: vi.fn().mockResolvedValue({} as AudioBuffer),
  };
}

class FakeAudioContext {
  state: AudioContextState = 'running';
  currentTime = 0;
  destination = {};
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
  createGain = vi.fn(() => makeGainNodeStub());
  createBufferSource = vi.fn(() => makeSourceNodeStub());
  decodeAudioData = vi.fn().mockResolvedValue({} as AudioBuffer);
}

describe('AudioManager', () => {
  let store: Store;
  let manager: AudioManager;

  beforeEach(async () => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    store = new Store(createInitialState());
    manager = new AudioManager(store);
    await manager.unlock();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ambient loops do not count toward the interaction limiter', async () => {
    const MAX = 8; // CONFIG.maxSimultaneousSounds

    // Seed 8 fake buffers for ambient sounds and register them.
    for (let i = 0; i < MAX; i++) {
      const id = `ambient-${i}`;
      // Bypass loadSound by stuffing a fake buffer directly into the private map.
      (manager as any).buffers.set(id, {} as AudioBuffer);
      manager.playAmbient(id, 0.5);
    }

    // All 8 ambient sources should be tracked.
    expect((manager as any).activeSources.size).toBe(MAX);
    // But the interaction counter must still be zero.
    expect((manager as any).activeInteractionCount).toBe(0);

    // A 9th interaction sound should be allowed.
    const interactionId = 'interaction-sound';
    (manager as any).buffers.set(interactionId, {} as AudioBuffer);
    manager.playInteraction(interactionId, 0.5);

    expect((manager as any).activeInteractionCount).toBe(1);
  });
});
