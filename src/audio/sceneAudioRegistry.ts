import { SceneAudioDef } from './types';

/**
 * 3-layer audio definitions for each scene.
 *
 * Layer 1: Base Ambience (long loops)
 * Layer 2: Interaction (tap/drag/hold with variations)
 * Layer 3: Variation (random ambient one-shots)
 *
 * File paths are relative to /audio/ in the public directory.
 */
export const SCENE_AUDIO_REGISTRY: SceneAudioDef[] = [
  // ============================================
  // RAIN WINDOW SCENE
  // ============================================
  {
    sceneId: 'rain-window',

    baseAmbience: [
      {
        id: 'rain_base_loop', file: 'packs/rain/rain-base.wav',
        isHeroAsset: true, isManualSource: true, isLoopPrepared: false,
        interactionCategory: 'ambient',
        recommendedUse: 'Primary rain ambience loop — needs seamless loop processing',
      },
    ],

    taps: [
      {
        surface: 'glass',
        sounds: [
          {
            id: 'glass_tap_01', file: 'packs/rain/tap-glass-01.wav',
            isManualSource: true, interactionCategory: 'tap',
          },
          {
            id: 'glass_tap_02', file: 'packs/rain/tap-glass-02.wav',
            isManualSource: true, interactionCategory: 'tap',
          },
        ],
      },
    ],

    drags: [
      {
        surface: 'glass',
        loops: [
          // Uses rain-roof as a drag loop until dedicated drag files are added
          {
            id: 'rain_roof_drag', file: 'packs/rain/rain-roof.wav',
            isManualSource: true, isPlaceholder: true, needsReplacement: true,
            interactionCategory: 'drag',
            recommendedUse: 'Placeholder drag loop — repurposed from rain-roof ambience',
          },
        ],
      },
    ],

    holds: [
      {
        surface: 'glass',
        loops: [
          // Uses rain-base as hold layer until dedicated hold files are added
          {
            id: 'rain_base_hold', file: 'packs/rain/rain-base.wav',
            isManualSource: true, isPlaceholder: true, needsReplacement: true,
            interactionCategory: 'hold',
            recommendedUse: 'Placeholder hold layer — repurposed from rain-base ambience',
          },
        ],
      },
    ],

    ambientOneShots: [
      {
        id: 'thunder_soft_01', file: 'packs/rain/thunder-soft.wav', minIntervalMs: 20000, maxVolume: 0.3,
        isManualSource: true, interactionCategory: 'one-shot',
      },
    ],
  },

  // ============================================
  // COZY ROOM SCENE
  // ============================================
  {
    sceneId: 'cozy-room',

    baseAmbience: [
      {
        id: 'fireplace_room_loop_01', file: 'ambient/fireplace-room-loop-01.wav',
        isPlaceholder: false, needsReplacement: false, isPremium: true,
        interactionCategory: 'ambient',
        recommendedUse: 'Primary cozy room ambience — file not yet present',
      },
    ],

    taps: [
      {
        surface: 'wood',
        sounds: [
          { id: 'wood_tap_01', file: 'interactions/tap/wood/wood-tap-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'wood_tap_02', file: 'interactions/tap/wood/wood-tap-02.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'wood_tap_03', file: 'interactions/tap/wood/wood-tap-03.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'wood_tap_04', file: 'interactions/tap/wood/wood-tap-04.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'wood_tap_05', file: 'interactions/tap/wood/wood-tap-05.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'wood_tap_06', file: 'interactions/tap/wood/wood-tap-06.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
        ],
      },
      {
        surface: 'ceramic',
        sounds: [
          { id: 'ceramic_click_01', file: 'interactions/tap/ceramic/ceramic-click-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'ceramic_click_02', file: 'interactions/tap/ceramic/ceramic-click-02.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'ceramic_click_03', file: 'interactions/tap/ceramic/ceramic-click-03.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'ceramic_click_04', file: 'interactions/tap/ceramic/ceramic-click-04.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
        ],
      },
    ],

    drags: [
      {
        surface: 'fabric',
        loops: [
          { id: 'fabric_brush_loop_01', file: 'interactions/drag/fabric/fabric-brush-loop-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'drag' },
          { id: 'blanket_drag_loop_01', file: 'interactions/drag/fabric/blanket-drag-loop-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'drag' },
        ],
      },
    ],

    holds: [
      {
        surface: 'fabric',
        loops: [
          { id: 'warm_tone_hold_01', file: 'interactions/hold/warm-tone-hold-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'hold' },
        ],
      },
    ],

    ambientOneShots: [
      { id: 'fireplace_pop_01', file: 'one_shots/fireplace/fireplace-pop-01.wav', minIntervalMs: 10000, maxVolume: 0.35, isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'one-shot' },
      { id: 'chair_creak_01', file: 'one_shots/fireplace/chair-creak-01.wav', minIntervalMs: 18000, maxVolume: 0.2, isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'one-shot' },
      { id: 'room_settle_01', file: 'one_shots/fireplace/room-settle-01.wav', minIntervalMs: 25000, maxVolume: 0.15, isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'one-shot' },
    ],
  },

  // ============================================
  // SAND TABLE SCENE
  // ============================================
  {
    sceneId: 'sand-table',

    baseAmbience: [
      {
        id: 'sand_room_loop_01', file: 'ambient/sand-room-loop-01.wav',
        isPlaceholder: false, needsReplacement: false, isPremium: true,
        interactionCategory: 'ambient',
        recommendedUse: 'Primary sand table ambience — file not yet present',
      },
    ],

    taps: [
      {
        surface: 'sand',
        sounds: [
          { id: 'tray_tap_01', file: 'interactions/tap/sand/tray-tap-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'tray_tap_02', file: 'interactions/tap/sand/tray-tap-02.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'tray_tap_03', file: 'interactions/tap/sand/tray-tap-03.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'tray_tap_04', file: 'interactions/tap/sand/tray-tap-04.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'tray_tap_05', file: 'interactions/tap/sand/tray-tap-05.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
        ],
      },
    ],

    drags: [
      {
        surface: 'sand',
        loops: [
          { id: 'sand_drag_loop_01', file: 'interactions/drag/sand/sand-drag-loop-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'drag' },
          { id: 'sand_drag_loop_02', file: 'interactions/drag/sand/sand-drag-loop-02.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'drag' },
          { id: 'grain_shift_loop_01', file: 'interactions/drag/sand/grain-shift-loop-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'drag' },
        ],
      },
    ],

    holds: [
      {
        surface: 'sand',
        loops: [
          { id: 'texture_pressure_01', file: 'interactions/hold/texture-pressure-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'hold' },
        ],
      },
    ],

    ambientOneShots: [
      { id: 'grain_slide_01', file: 'one_shots/sand/grain-slide-01.wav', minIntervalMs: 15000, maxVolume: 0.2, isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'one-shot' },
      { id: 'tray_shift_01', file: 'one_shots/sand/tray-shift-01.wav', minIntervalMs: 20000, maxVolume: 0.15, isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'one-shot' },
    ],
  },

  // ============================================
  // ZEN TEMPLE SCENE
  // ============================================
  {
    sceneId: 'temple-zen',

    baseAmbience: [
      {
        id: 'zen_temple_loop_01', file: 'ambient/zen-temple-loop-01.wav',
        isPlaceholder: false, needsReplacement: false, isPremium: true,
        interactionCategory: 'ambient',
        recommendedUse: 'Primary zen temple ambience — distant pine wind + singing bowl drone',
      },
    ],

    taps: [
      {
        surface: 'sand',
        sounds: [
          { id: 'sand_pat_zen_01', file: 'interactions/tap/sand/sand-pat-zen-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'sand_pat_zen_02', file: 'interactions/tap/sand/sand-pat-zen-02.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'sand_pat_zen_03', file: 'interactions/tap/sand/sand-pat-zen-03.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
          { id: 'sand_pat_zen_04', file: 'interactions/tap/sand/sand-pat-zen-04.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'tap' },
        ],
      },
    ],

    drags: [
      {
        surface: 'sand',
        loops: [
          { id: 'sand_rake_loop_01', file: 'interactions/drag/sand/sand-rake-loop-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'drag' },
          { id: 'sand_trail_loop_01', file: 'interactions/drag/sand/sand-trail-loop-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'drag' },
          { id: 'sand_grain_loop_zen_01', file: 'interactions/drag/sand/sand-grain-loop-zen-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'drag' },
        ],
      },
    ],

    holds: [
      {
        surface: 'sand',
        loops: [
          { id: 'zen_hold_pad_01', file: 'interactions/hold/zen-hold-pad-01.wav', isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'hold' },
        ],
      },
    ],

    ambientOneShots: [
      { id: 'temple_bell_distant_01', file: 'one_shots/zen/temple-bell-distant-01.wav', minIntervalMs: 45000, maxVolume: 0.3, isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'one-shot' },
      { id: 'temple_bell_distant_02', file: 'one_shots/zen/temple-bell-distant-02.wav', minIntervalMs: 60000, maxVolume: 0.22, isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'one-shot' },
      { id: 'shoji_creak_01', file: 'one_shots/zen/shoji-creak-01.wav', minIntervalMs: 35000, maxVolume: 0.15, isPlaceholder: false, needsReplacement: false, isPremium: true, interactionCategory: 'one-shot' },
    ],
  },
];

export function getSceneAudio(sceneId: string): SceneAudioDef | undefined {
  return SCENE_AUDIO_REGISTRY.find(s => s.sceneId === sceneId);
}
