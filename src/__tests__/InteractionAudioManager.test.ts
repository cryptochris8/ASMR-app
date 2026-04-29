import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InteractionAudioManager } from '../audio/InteractionAudioManager';
import { TapPool } from '../audio/types';

// Minimal GainNode and BufferSource stubs for InteractionAudioManager.
function makeGainStub() {
  return {
    gain: { value: 1, setTargetAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

function makeSourceStub() {
  const s: any = {
    buffer: null,
    loop: false,
    playbackRate: { value: 1 },
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null as (() => void) | null,
  };
  return s;
}

class FakeAudioContext {
  state: AudioContextState = 'running';
  currentTime = 0;
  destination = {};
  createGain = vi.fn(() => makeGainStub());
  createBufferSource = vi.fn(() => makeSourceStub());
}

describe('InteractionAudioManager', () => {
  let mgr: InteractionAudioManager;
  let fakeCtx: FakeAudioContext;
  let fakeDestination: any;

  beforeEach(() => {
    fakeCtx = new FakeAudioContext();
    fakeDestination = makeGainStub();
    mgr = new InteractionAudioManager();
    mgr.init(fakeCtx as unknown as AudioContext, fakeDestination);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('surface-key dedupe: two pools with surface=undefined but different ids do NOT collide', () => {
    // The key is built as: `${pool.surface ?? '_'}::${pool.sounds[0]?.id ?? ''}`
    // With surface=undefined both become '_' prefix, but the first sound id differs.
    const poolA: TapPool = { surface: undefined as any, sounds: [{ id: 'tap-a', file: 'a.mp3' }] };
    const poolB: TapPool = { surface: undefined as any, sounds: [{ id: 'tap-b', file: 'b.mp3' }] };

    const keyA = `${poolA.surface ?? '_'}::${poolA.sounds[0]?.id ?? ''}`;
    const keyB = `${poolB.surface ?? '_'}::${poolB.sounds[0]?.id ?? ''}`;

    expect(keyA).toBe('_::tap-a');
    expect(keyB).toBe('_::tap-b');
    expect(keyA).not.toBe(keyB);
  });

  it('one-shot GainNode disconnect is called in the onended handler', () => {
    // Set up a fake scene definition directly on the manager's private fields.
    const soundId = 'tap-test';
    const fakeBuffer = {} as AudioBuffer;
    (mgr as any).buffers.set(soundId, fakeBuffer);

    const sceneDef = {
      sceneId: 'rain-window',
      baseAmbience: [],
      taps: [{ surface: 'glass', sounds: [{ id: soundId, file: 'tap.mp3' }] }],
      drags: [],
      holds: [],
      ambientOneShots: [],
    };
    (mgr as any).currentSceneDef = sceneDef;
    (mgr as any).currentSceneId = 'rain-window';

    // Capture the source and gain stubs that will be created.
    const sourceStub = makeSourceStub();
    const gainStub = makeGainStub();
    fakeCtx.createBufferSource.mockReturnValueOnce(sourceStub);
    fakeCtx.createGain.mockReturnValueOnce(gainStub);

    mgr.playTap('glass' as any);

    // The tap should have been started.
    expect(sourceStub.start).toHaveBeenCalled();

    // Simulate the audio engine firing onended.
    expect(sourceStub.onended).toBeTypeOf('function');
    sourceStub.onended!();

    // Both the source and gain nodes should have been disconnected.
    expect(sourceStub.disconnect).toHaveBeenCalled();
    expect(gainStub.disconnect).toHaveBeenCalled();
  });
});
