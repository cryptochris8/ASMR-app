/**
 * Audio Asset Manifest
 *
 * Comprehensive inventory of every audio file referenced by the app,
 * across both the interaction system (sceneAudioRegistry.ts) and the
 * mixer system (soundPacks.ts).
 *
 * Status legend:
 *   present          - file exists on disk
 *   missing          - file referenced in code but not on disk
 *   needs-processing - file exists but needs downsampling / trimming / normalization
 *
 * Provider legend:
 *   user-manual       - hero asset; must be sourced or recorded by the user
 *   claude-generated  - can be procedurally generated (noise, tones, drones)
 *   claude-processed  - exists on disk but requires processing (resample to 48 kHz 16-bit, trim, normalize)
 */

export interface AssetStatus {
  id: string;
  file: string;           // path relative to public/audio/
  scene: string;          // which scene uses this (or 'all' for cross-scene packs)
  system: 'interaction' | 'mixer';
  category: string;       // ambience, tap, drag, hold, one-shot, mixer-layer
  provider: 'user-manual' | 'claude-generated' | 'claude-processed';
  status: 'present' | 'missing' | 'needs-processing';
  isPremium: boolean;
  isHeroAsset: boolean;
  notes: string;
}

export const ASSET_MANIFEST: AssetStatus[] = [

  // =====================================================================
  // RAIN WINDOW SCENE  --  Interaction System (sceneAudioRegistry.ts)
  // =====================================================================

  // --- Base Ambience ---
  {
    id: 'rain_base_loop',
    file: 'packs/rain/rain-base.wav',
    scene: 'rain-window',
    system: 'interaction',
    category: 'ambience',
    provider: 'claude-processed',
    status: 'needs-processing',
    isPremium: false,
    isHeroAsset: true,
    notes: 'Present on disk (96 kHz 24-bit). Needs downsample to 48 kHz 16-bit, loop-point trim, and loudness normalization to -18 LUFS.',
  },

  // --- Tap: glass ---
  {
    id: 'glass_tap_01',
    file: 'packs/rain/tap-glass-01.wav',
    scene: 'rain-window',
    system: 'interaction',
    category: 'tap',
    provider: 'claude-processed',
    status: 'needs-processing',
    isPremium: false,
    isHeroAsset: true,
    notes: 'Present on disk (96 kHz 24-bit). Needs downsample, tail trim, and peak normalization.',
  },
  {
    id: 'glass_tap_02',
    file: 'packs/rain/tap-glass-02.wav',
    scene: 'rain-window',
    system: 'interaction',
    category: 'tap',
    provider: 'claude-processed',
    status: 'needs-processing',
    isPremium: false,
    isHeroAsset: true,
    notes: 'Present on disk (96 kHz 24-bit). Needs downsample, tail trim, and peak normalization.',
  },

  // --- Drag: glass ---
  {
    id: 'rain_roof_drag',
    file: 'packs/rain/rain-roof.wav',
    scene: 'rain-window',
    system: 'interaction',
    category: 'drag',
    provider: 'claude-processed',
    status: 'needs-processing',
    isPremium: false,
    isHeroAsset: false,
    notes: 'Present on disk (96 kHz 24-bit). Temporarily reused as glass drag loop. Needs downsample and loop-point trim.',
  },

  // --- Hold: glass ---
  {
    id: 'rain_base_hold',
    file: 'packs/rain/rain-base.wav',
    scene: 'rain-window',
    system: 'interaction',
    category: 'hold',
    provider: 'claude-processed',
    status: 'needs-processing',
    isPremium: false,
    isHeroAsset: false,
    notes: 'Reuses rain-base.wav as hold layer. Same file as base ambience -- no separate asset needed until dedicated hold file is added.',
  },

  // --- Ambient One-Shots ---
  {
    id: 'thunder_soft_01',
    file: 'packs/rain/thunder-soft.wav',
    scene: 'rain-window',
    system: 'interaction',
    category: 'one-shot',
    provider: 'claude-processed',
    status: 'needs-processing',
    isPremium: false,
    isHeroAsset: true,
    notes: 'Present on disk (96 kHz 24-bit). Needs downsample and normalization. Triggered randomly every ~20 s at max 0.3 volume.',
  },

  // =====================================================================
  // COZY ROOM SCENE  --  Interaction System (sceneAudioRegistry.ts)
  // =====================================================================

  // --- Base Ambience ---
  {
    id: 'fireplace_room_loop_01',
    file: 'ambient/fireplace-room-loop-01.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'ambience',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Needs a warm fireplace room loop (~60 s). Source from Freesound or record with field mic.',
  },

  // --- Tap: wood ---
  {
    id: 'wood_tap_01',
    file: 'interactions/tap/wood/wood-tap-01.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Soft fingertip tap on hardwood or table surface. 6 variations needed for natural round-robin.',
  },
  {
    id: 'wood_tap_02',
    file: 'interactions/tap/wood/wood-tap-02.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Variation 2 of wood tap.',
  },
  {
    id: 'wood_tap_03',
    file: 'interactions/tap/wood/wood-tap-03.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Wood tap variation 3.',
  },
  {
    id: 'wood_tap_04',
    file: 'interactions/tap/wood/wood-tap-04.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Wood tap variation 4.',
  },
  {
    id: 'wood_tap_05',
    file: 'interactions/tap/wood/wood-tap-05.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Wood tap variation 5.',
  },
  {
    id: 'wood_tap_06',
    file: 'interactions/tap/wood/wood-tap-06.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Wood tap variation 6.',
  },

  // --- Tap: ceramic ---
  {
    id: 'ceramic_click_01',
    file: 'interactions/tap/ceramic/ceramic-click-01.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Gentle ceramic click (mug or bowl). 4 variations needed.',
  },
  {
    id: 'ceramic_click_02',
    file: 'interactions/tap/ceramic/ceramic-click-02.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Ceramic click variation 2.',
  },
  {
    id: 'ceramic_click_03',
    file: 'interactions/tap/ceramic/ceramic-click-03.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Ceramic click variation 3.',
  },
  {
    id: 'ceramic_click_04',
    file: 'interactions/tap/ceramic/ceramic-click-04.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Ceramic click variation 4.',
  },

  // --- Drag: fabric ---
  {
    id: 'fabric_brush_loop_01',
    file: 'interactions/drag/fabric/fabric-brush-loop-01.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'drag',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Loopable fabric brush texture (~5-10 s). Volume modulated by drag speed.',
  },
  {
    id: 'blanket_drag_loop_01',
    file: 'interactions/drag/fabric/blanket-drag-loop-01.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'drag',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Loopable blanket drag texture (~5-10 s).',
  },

  // --- Hold: fabric ---
  {
    id: 'warm_tone_hold_01',
    file: 'interactions/hold/warm-tone-hold-01.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'hold',
    provider: 'claude-generated',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Warm tonal pad that fades in on sustained press. Can be procedurally generated (sine pad with gentle LFO).',
  },

  // --- Ambient One-Shots ---
  {
    id: 'fireplace_pop_01',
    file: 'one_shots/fireplace/fireplace-pop-01.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'one-shot',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Short fireplace pop/snap. Triggered randomly every ~10 s at max 0.35 volume.',
  },
  {
    id: 'chair_creak_01',
    file: 'one_shots/fireplace/chair-creak-01.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'one-shot',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Subtle chair/furniture creak. Triggered every ~18 s at max 0.2 volume.',
  },
  {
    id: 'room_settle_01',
    file: 'one_shots/fireplace/room-settle-01.wav',
    scene: 'cozy-room',
    system: 'interaction',
    category: 'one-shot',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Subtle room settling sound (wood expansion, soft thud). Every ~25 s at max 0.15 volume.',
  },

  // =====================================================================
  // SAND TABLE SCENE  --  Interaction System (sceneAudioRegistry.ts)
  // =====================================================================

  // --- Base Ambience ---
  {
    id: 'sand_room_loop_01',
    file: 'ambient/sand-room-loop-01.wav',
    scene: 'sand-table',
    system: 'interaction',
    category: 'ambience',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Quiet room tone with very subtle sand/grain texture undertone (~60 s loop).',
  },

  // --- Tap: sand ---
  {
    id: 'tray_tap_01',
    file: 'interactions/tap/sand/tray-tap-01.wav',
    scene: 'sand-table',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Finger press into sand tray. 5 variations needed for round-robin.',
  },
  {
    id: 'tray_tap_02',
    file: 'interactions/tap/sand/tray-tap-02.wav',
    scene: 'sand-table',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Sand tray tap variation 2.',
  },
  {
    id: 'tray_tap_03',
    file: 'interactions/tap/sand/tray-tap-03.wav',
    scene: 'sand-table',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Sand tray tap variation 3.',
  },
  {
    id: 'tray_tap_04',
    file: 'interactions/tap/sand/tray-tap-04.wav',
    scene: 'sand-table',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Sand tray tap variation 4.',
  },
  {
    id: 'tray_tap_05',
    file: 'interactions/tap/sand/tray-tap-05.wav',
    scene: 'sand-table',
    system: 'interaction',
    category: 'tap',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Sand tray tap variation 5.',
  },

  // --- Drag: sand ---
  {
    id: 'sand_drag_loop_01',
    file: 'interactions/drag/sand/sand-drag-loop-01.wav',
    scene: 'sand-table',
    system: 'interaction',
    category: 'drag',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Loopable sand drag texture (~5-10 s). Volume modulated by drag speed.',
  },
  {
    id: 'sand_drag_loop_02',
    file: 'interactions/drag/sand/sand-drag-loop-02.wav',
    scene: 'sand-table',
    system: 'interaction',
    category: 'drag',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Sand drag variation 2 for alternating loop selection.',
  },
  {
    id: 'grain_shift_loop_01',
    file: 'interactions/drag/sand/grain-shift-loop-01.wav',
    scene: 'sand-table',
    system: 'interaction',
    category: 'drag',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Grain shifting texture loop, layered with sand drag.',
  },

  // --- Hold: sand ---
  {
    id: 'texture_pressure_01',
    file: 'interactions/hold/texture-pressure-01.wav',
    scene: 'sand-table',
    system: 'interaction',
    category: 'hold',
    provider: 'claude-generated',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Low-frequency pressure texture that fades in on sustained press. Can be procedurally generated.',
  },

  // --- Ambient One-Shots ---
  {
    id: 'grain_slide_01',
    file: 'one_shots/sand/grain-slide-01.wav',
    scene: 'sand-table',
    system: 'interaction',
    category: 'one-shot',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Random grain sliding sound. Triggered every ~15 s at max 0.2 volume.',
  },
  {
    id: 'tray_shift_01',
    file: 'one_shots/sand/tray-shift-01.wav',
    scene: 'sand-table',
    system: 'interaction',
    category: 'one-shot',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Subtle tray shift/settle. Triggered every ~20 s at max 0.15 volume.',
  },

  // =====================================================================
  // MIXER SYSTEM -- Sound Packs (soundPacks.ts)
  // All mixer files live under public/audio/packs/<category>/
  // =====================================================================

  // --- Pack 1: Rain & Window (Free) ---
  {
    id: 'rain_base',
    file: 'packs/rain/rain-base.wav',
    scene: 'rain-window',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'claude-processed',
    status: 'needs-processing',
    isPremium: false,
    isHeroAsset: true,
    notes: 'Present on disk (96 kHz 24-bit). Looping ambient layer. Shared with interaction system base ambience.',
  },
  {
    id: 'rain_tap_glass_01',
    file: 'packs/rain/tap-glass-01.wav',
    scene: 'rain-window',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'claude-processed',
    status: 'needs-processing',
    isPremium: false,
    isHeroAsset: false,
    notes: 'Present on disk (96 kHz 24-bit). Mixer interaction accent. Shared with interaction system tap.',
  },
  {
    id: 'rain_tap_glass_02',
    file: 'packs/rain/tap-glass-02.wav',
    scene: 'rain-window',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'claude-processed',
    status: 'needs-processing',
    isPremium: false,
    isHeroAsset: false,
    notes: 'Present on disk (96 kHz 24-bit). Mixer interaction accent. Shared with interaction system tap.',
  },
  {
    id: 'rain_thunder_soft',
    file: 'packs/rain/thunder-soft.wav',
    scene: 'rain-window',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'claude-processed',
    status: 'needs-processing',
    isPremium: false,
    isHeroAsset: false,
    notes: 'Present on disk (96 kHz 24-bit). Mixer accent layer. Shared with interaction system one-shot.',
  },
  {
    id: 'rain_roof',
    file: 'packs/rain/rain-roof.wav',
    scene: 'rain-window',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'claude-processed',
    status: 'needs-processing',
    isPremium: false,
    isHeroAsset: false,
    notes: 'Present on disk (96 kHz 24-bit). Looping ambient layer.',
  },

  // --- Pack 2: Cozy Fireplace (Premium) ---
  {
    id: 'fire_base',
    file: 'packs/fireplace/fire-base.wav',
    scene: 'cozy-room',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Looping fireplace crackle base (~60 s). Core mixer layer for cozy room.',
  },
  {
    id: 'fire_crackle_01',
    file: 'packs/fireplace/crackle-01.wav',
    scene: 'cozy-room',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Short fireplace crackle accent for mixer interaction layer.',
  },
  {
    id: 'wood_creak_01',
    file: 'packs/fireplace/wood-creak-01.wav',
    scene: 'cozy-room',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Subtle wood creak accent for mixer.',
  },
  {
    id: 'fabric_brush_01',
    file: 'packs/fireplace/fabric-brush-01.wav',
    scene: 'cozy-room',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Fabric brush accent for mixer interaction layer.',
  },
  {
    id: 'room_hum',
    file: 'packs/fireplace/room-hum.wav',
    scene: 'cozy-room',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'claude-generated',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Low-frequency room hum loop. Can be procedurally generated (filtered noise + subtle resonance).',
  },

  // --- Pack 3: Soft Tapping & Texture (Free) ---
  {
    id: 'tap_glass_soft',
    file: 'packs/tapping/glass-soft.wav',
    scene: 'all',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: false,
    isHeroAsset: true,
    notes: 'Hero asset. Soft glass tap for universal mixer layer. Compatible with all scenes.',
  },
  {
    id: 'tap_wood_soft',
    file: 'packs/tapping/wood-soft.wav',
    scene: 'all',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: false,
    isHeroAsset: true,
    notes: 'Hero asset. Soft wood tap for universal mixer layer.',
  },
  {
    id: 'tap_fabric',
    file: 'packs/tapping/fabric.wav',
    scene: 'all',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: false,
    isHeroAsset: false,
    notes: 'Fabric brush/tap for universal mixer layer.',
  },

  // --- Pack 4: Sand & Tactile (Premium) ---
  {
    id: 'sand_base',
    file: 'packs/sand/sand-base.wav',
    scene: 'sand-table',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Looping sand ambience for mixer base layer (~60 s).',
  },
  {
    id: 'sand_drag_01',
    file: 'packs/sand/drag-01.wav',
    scene: 'sand-table',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Sand drag accent for mixer interaction layer.',
  },
  {
    id: 'sand_drag_02',
    file: 'packs/sand/drag-02.wav',
    scene: 'sand-table',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Sand drag accent variation 2.',
  },
  {
    id: 'sand_grain_brush',
    file: 'packs/sand/grain-brush.wav',
    scene: 'sand-table',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Grain brushing texture accent for mixer.',
  },

  // --- Pack 5: Night Ambience (Premium) ---
  {
    id: 'night_crickets',
    file: 'packs/night/crickets.wav',
    scene: 'all',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Looping distant cricket ambience (~60 s). Universal cross-scene mixer layer.',
  },
  {
    id: 'night_wind',
    file: 'packs/night/soft-wind.wav',
    scene: 'all',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Looping soft wind for night ambience.',
  },
  {
    id: 'night_ambience',
    file: 'packs/night/evening-ambience.wav',
    scene: 'all',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Composite evening atmosphere loop.',
  },

  // --- Pack 6: Water & Drip (Premium) ---
  {
    id: 'water_drip',
    file: 'packs/water/drip.wav',
    scene: 'rain-window,sand-table',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Looping gentle water drip pattern (~30-60 s).',
  },
  {
    id: 'water_stream',
    file: 'packs/water/stream.wav',
    scene: 'rain-window,sand-table',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: true,
    notes: 'Hero asset. Looping slow stream / water flow.',
  },
  {
    id: 'water_ripple',
    file: 'packs/water/ripple.wav',
    scene: 'rain-window,sand-table',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Short water ripple accent for mixer interaction layer.',
  },

  // --- Pack 7: Fan & Sleep Noise (Free) ---
  {
    id: 'fan_soft',
    file: 'packs/noise/fan-soft.wav',
    scene: 'all',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: false,
    isHeroAsset: true,
    notes: 'Hero asset. Looping soft fan noise for sleep utility. Universal cross-scene. Record or source a clean fan loop.',
  },
  {
    id: 'white_noise',
    file: 'packs/noise/white-noise.wav',
    scene: 'all',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'claude-generated',
    status: 'missing',
    isPremium: false,
    isHeroAsset: true,
    notes: 'Hero asset. Looping white noise (~30 s with seamless crossfade). Can be procedurally generated.',
  },
  {
    id: 'brown_noise',
    file: 'packs/noise/brown-noise.wav',
    scene: 'all',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'claude-generated',
    status: 'missing',
    isPremium: false,
    isHeroAsset: true,
    notes: 'Hero asset. Looping brown noise (~30 s with seamless crossfade). Can be procedurally generated.',
  },

  // --- Pack 8: Calm Breath & Tone (Premium) ---
  {
    id: 'tone_pad',
    file: 'packs/tone/pad.wav',
    scene: 'all',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'claude-generated',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Looping soft tonal pad (~30-60 s). Can be procedurally generated (sine harmonics with slow LFO).',
  },
  {
    id: 'tone_drone',
    file: 'packs/tone/warm-drone.wav',
    scene: 'all',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'claude-generated',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Looping warm drone (~60 s). Can be procedurally generated (layered sine waves with detuning).',
  },
  {
    id: 'tone_chime',
    file: 'packs/tone/chime.wav',
    scene: 'all',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'claude-generated',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Short chime accent. Can be procedurally generated (filtered impulse with decay).',
  },

  // --- Pack 9: Cozy Interior Objects (Premium) ---
  {
    id: 'page_turn',
    file: 'packs/interior/page-turn.wav',
    scene: 'cozy-room',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Book page turn sound for mixer interaction layer.',
  },
  {
    id: 'cup_set',
    file: 'packs/interior/cup-set.wav',
    scene: 'cozy-room',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Cup/mug set-down sound for mixer interaction layer.',
  },
  {
    id: 'curtain_move',
    file: 'packs/interior/curtain.wav',
    scene: 'cozy-room',
    system: 'mixer',
    category: 'mixer-layer',
    provider: 'user-manual',
    status: 'missing',
    isPremium: true,
    isHeroAsset: false,
    notes: 'Curtain movement sound for mixer interaction layer.',
  },
];

// =====================================================================
// Helper Functions
// =====================================================================

/** Returns all assets with status 'missing'. */
export function getMissingAssets(): AssetStatus[] {
  return ASSET_MANIFEST.filter(a => a.status === 'missing');
}

/** Returns all assets that exist on disk but need processing (downsample, trim, normalize). */
export function getAssetsNeedingProcessing(): AssetStatus[] {
  return ASSET_MANIFEST.filter(a => a.status === 'needs-processing');
}

/** Returns all assets that must be manually sourced by the user (cannot be procedurally generated). */
export function getUserManualAssets(): AssetStatus[] {
  return ASSET_MANIFEST.filter(a => a.provider === 'user-manual');
}

/** Returns all assets designated as hero assets (highest-priority for the experience). */
export function getHeroAssets(): AssetStatus[] {
  return ASSET_MANIFEST.filter(a => a.isHeroAsset);
}

/** Returns all assets for a given scene (including 'all' cross-scene assets). */
export function getAssetsByScene(sceneId: string): AssetStatus[] {
  return ASSET_MANIFEST.filter(a => a.scene === sceneId || a.scene === 'all' || a.scene.includes(sceneId));
}

/** Returns all assets belonging to the interaction audio system. */
export function getInteractionAssets(): AssetStatus[] {
  return ASSET_MANIFEST.filter(a => a.system === 'interaction');
}

/** Returns all assets belonging to the mixer panel system. */
export function getMixerAssets(): AssetStatus[] {
  return ASSET_MANIFEST.filter(a => a.system === 'mixer');
}

/** Returns all assets that can be procedurally generated by Claude. */
export function getClaudeGeneratedAssets(): AssetStatus[] {
  return ASSET_MANIFEST.filter(a => a.provider === 'claude-generated');
}

/** Returns a summary object with counts by status, provider, and scene. */
export function getManifestSummary() {
  const total = ASSET_MANIFEST.length;
  const present = ASSET_MANIFEST.filter(a => a.status === 'present').length;
  const missing = ASSET_MANIFEST.filter(a => a.status === 'missing').length;
  const needsProcessing = ASSET_MANIFEST.filter(a => a.status === 'needs-processing').length;

  const byProvider = {
    userManual: ASSET_MANIFEST.filter(a => a.provider === 'user-manual').length,
    claudeGenerated: ASSET_MANIFEST.filter(a => a.provider === 'claude-generated').length,
    claudeProcessed: ASSET_MANIFEST.filter(a => a.provider === 'claude-processed').length,
  };

  const byScene = {
    rainWindow: ASSET_MANIFEST.filter(a => a.scene === 'rain-window').length,
    cozyRoom: ASSET_MANIFEST.filter(a => a.scene === 'cozy-room').length,
    sandTable: ASSET_MANIFEST.filter(a => a.scene === 'sand-table').length,
    all: ASSET_MANIFEST.filter(a => a.scene === 'all').length,
    multiScene: ASSET_MANIFEST.filter(a => a.scene.includes(',')).length,
  };

  const bySystem = {
    interaction: ASSET_MANIFEST.filter(a => a.system === 'interaction').length,
    mixer: ASSET_MANIFEST.filter(a => a.system === 'mixer').length,
  };

  const heroAssets = ASSET_MANIFEST.filter(a => a.isHeroAsset).length;
  const premiumAssets = ASSET_MANIFEST.filter(a => a.isPremium).length;
  const freeAssets = ASSET_MANIFEST.filter(a => !a.isPremium).length;

  // Deduplicated file count (some files are referenced by both systems)
  const uniqueFiles = new Set(ASSET_MANIFEST.map(a => a.file)).size;

  return {
    total,
    uniqueFiles,
    present,
    missing,
    needsProcessing,
    heroAssets,
    premiumAssets,
    freeAssets,
    byProvider,
    byScene,
    bySystem,
  };
}
