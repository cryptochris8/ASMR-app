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
  // COZY ROOM SCENE — hotspot-driven (skybox + 5 hotspots)
  // ============================================
  {
    sceneId: 'cozy-room',

    baseAmbience: [
      {
        id: 'cozy_room_loop_v2_01', file: 'ambient/cozy-room-v2-loop-01.wav',
        isPlaceholder: false, needsReplacement: false, isPremium: true,
        interactionCategory: 'ambient',
        recommendedUse: 'Warm cozy room base loop with very distant fire baseline',
      },
    ],

    taps: [
      {
        surface: 'fireplace',
        sounds: [
          { id: 'fire_pop_01', file: 'interactions/tap/fireplace/fire-pop-01.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'fire_pop_02', file: 'interactions/tap/fireplace/fire-pop-02.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'fire_pop_03', file: 'interactions/tap/fireplace/fire-pop-03.wav', isPremium: true, interactionCategory: 'tap' },
        ],
      },
      {
        surface: 'speaker',
        sounds: [
          { id: 'vinyl_click_01', file: 'interactions/tap/speaker/vinyl-click-01.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'vinyl_click_02', file: 'interactions/tap/speaker/vinyl-click-02.wav', isPremium: true, interactionCategory: 'tap' },
        ],
      },
      {
        surface: 'bookshelf',
        sounds: [
          { id: 'page_rustle_01', file: 'interactions/tap/bookshelf/page-rustle-01.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'page_rustle_02', file: 'interactions/tap/bookshelf/page-rustle-02.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'page_rustle_03', file: 'interactions/tap/bookshelf/page-rustle-03.wav', isPremium: true, interactionCategory: 'tap' },
        ],
      },
      {
        surface: 'armchair',
        sounds: [
          { id: 'leather_creak_01', file: 'interactions/tap/armchair/leather-creak-01.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'leather_creak_02', file: 'interactions/tap/armchair/leather-creak-02.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'leather_creak_03', file: 'interactions/tap/armchair/leather-creak-03.wav', isPremium: true, interactionCategory: 'tap' },
        ],
      },
      {
        surface: 'pot',
        sounds: [
          { id: 'wood_lid_clack_01', file: 'interactions/tap/pot/wood-lid-clack-01.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'wood_lid_clack_02', file: 'interactions/tap/pot/wood-lid-clack-02.wav', isPremium: true, interactionCategory: 'tap' },
        ],
      },
    ],

    drags: [],

    holds: [
      {
        surface: 'fireplace',
        loops: [
          { id: 'fire_hold_loop_01', file: 'interactions/hold/fireplace/fire-hold-loop-01.wav', isPremium: true, interactionCategory: 'hold' },
        ],
      },
      // Speaker is sticky tap-to-toggle (handled in CozyRoomScene), not a normal hold
      {
        surface: 'bookshelf',
        loops: [
          { id: 'pages_hold_loop_01', file: 'interactions/hold/bookshelf/pages-hold-loop-01.wav', isPremium: true, interactionCategory: 'hold' },
        ],
      },
      {
        surface: 'armchair',
        loops: [
          { id: 'fabric_brush_hold_loop_01', file: 'interactions/hold/armchair/fabric-brush-hold-loop-01.wav', isPremium: true, interactionCategory: 'hold' },
        ],
      },
    ],

    ambientOneShots: [
      // Subtle background life between hotspot interactions
      { id: 'chair_creak_01', file: 'one_shots/fireplace/chair-creak-01.wav', minIntervalMs: 22000, maxVolume: 0.18, isPremium: true, interactionCategory: 'one-shot' },
      { id: 'room_settle_01', file: 'one_shots/fireplace/room-settle-01.wav', minIntervalMs: 30000, maxVolume: 0.12, isPremium: true, interactionCategory: 'one-shot' },
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

  // ============================================
  // APOTHECARY SHOP SCENE — hotspot-driven (skybox + 6 hotspots)
  // ============================================
  {
    sceneId: 'apothecary-shop',

    baseAmbience: [
      {
        id: 'apothecary_room_loop_01', file: 'ambient/apothecary-room-loop-01.wav',
        isPremium: true, interactionCategory: 'ambient',
        recommendedUse: 'Warm dim apothecary shop ambience',
      },
    ],

    taps: [
      {
        surface: 'jars',
        sounds: [
          { id: 'jar_clink_01', file: 'interactions/tap/jars/jar-clink-01.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'jar_clink_02', file: 'interactions/tap/jars/jar-clink-02.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'jar_clink_03', file: 'interactions/tap/jars/jar-clink-03.wav', isPremium: true, interactionCategory: 'tap' },
        ],
      },
      {
        surface: 'spellbook',
        sounds: [
          { id: 'spellbook_page_01', file: 'interactions/tap/spellbook/spellbook-page-01.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'spellbook_page_02', file: 'interactions/tap/spellbook/spellbook-page-02.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'spellbook_page_03', file: 'interactions/tap/spellbook/spellbook-page-03.wav', isPremium: true, interactionCategory: 'tap' },
        ],
      },
      {
        surface: 'candles',
        sounds: [
          { id: 'candle_puff_01', file: 'interactions/tap/candles/candle-puff-01.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'candle_puff_02', file: 'interactions/tap/candles/candle-puff-02.wav', isPremium: true, interactionCategory: 'tap' },
        ],
      },
      {
        surface: 'herbs',
        sounds: [
          { id: 'herb_rustle_01', file: 'interactions/tap/herbs/herb-rustle-01.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'herb_rustle_02', file: 'interactions/tap/herbs/herb-rustle-02.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'herb_rustle_03', file: 'interactions/tap/herbs/herb-rustle-03.wav', isPremium: true, interactionCategory: 'tap' },
        ],
      },
      {
        surface: 'scale',
        sounds: [
          { id: 'scale_tick_01', file: 'interactions/tap/scale/scale-tick-01.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'scale_tick_02', file: 'interactions/tap/scale/scale-tick-02.wav', isPremium: true, interactionCategory: 'tap' },
        ],
      },
      {
        surface: 'mortar',
        sounds: [
          { id: 'mortar_clack_01', file: 'interactions/tap/mortar/mortar-clack-01.wav', isPremium: true, interactionCategory: 'tap' },
          { id: 'mortar_clack_02', file: 'interactions/tap/mortar/mortar-clack-02.wav', isPremium: true, interactionCategory: 'tap' },
        ],
      },
    ],

    drags: [],

    holds: [
      {
        surface: 'spellbook',
        loops: [
          { id: 'spellbook_pages_loop_01', file: 'interactions/hold/spellbook/spellbook-pages-loop-01.wav', isPremium: true, interactionCategory: 'hold' },
        ],
      },
      // Candles is sticky tap-to-toggle (handled in ApothecaryShopScene), not a normal hold
      {
        surface: 'herbs',
        loops: [
          { id: 'herb_rustle_loop_01', file: 'interactions/hold/herbs/herb-rustle-loop-01.wav', isPremium: true, interactionCategory: 'hold' },
        ],
      },
      {
        surface: 'mortar',
        loops: [
          { id: 'mortar_grind_loop_01', file: 'interactions/hold/mortar/mortar-grind-loop-01.wav', isPremium: true, interactionCategory: 'hold' },
        ],
      },
    ],

    ambientOneShots: [],
  },
];

export function getSceneAudio(sceneId: string): SceneAudioDef | undefined {
  return SCENE_AUDIO_REGISTRY.find(s => s.sceneId === sceneId);
}
