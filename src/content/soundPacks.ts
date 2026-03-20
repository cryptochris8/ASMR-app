export interface SoundAsset {
  id: string;
  file: string;
  loop: boolean;
  category: 'ambient' | 'interaction' | 'accent';
  defaultVolume: number;
}

export interface SoundPack {
  id: string;
  name: string;
  description: string;
  premium: boolean;
  category: 'rain' | 'fireplace' | 'tapping' | 'sand' | 'night' | 'water' | 'noise' | 'tone' | 'interior';
  sceneCompatible: string[];
  mixerCategory: string;
  sounds: SoundAsset[];
}

export const SOUND_PACKS: SoundPack[] = [
  // 1. Rain & Window (Free)
  {
    id: 'rain',
    name: 'Rain & Window',
    description: 'Rain on glass, distant thunder, roof rain',
    premium: false,
    category: 'rain',
    sceneCompatible: ['rain-window'],
    mixerCategory: 'Weather',
    sounds: [
      { id: 'rain_base', file: 'rain/rain-base.wav', loop: true, category: 'ambient', defaultVolume: 0.7 },
      { id: 'rain_tap_glass_01', file: 'rain/tap-glass-01.wav', loop: false, category: 'interaction', defaultVolume: 0.5 },
      { id: 'rain_tap_glass_02', file: 'rain/tap-glass-02.wav', loop: false, category: 'interaction', defaultVolume: 0.5 },
      { id: 'rain_thunder_soft', file: 'rain/thunder-soft.wav', loop: false, category: 'accent', defaultVolume: 0.3 },
      { id: 'rain_roof', file: 'rain/rain-roof.wav', loop: true, category: 'ambient', defaultVolume: 0.4 },
    ],
  },
  // 2. Cozy Fireplace (Premium)
  {
    id: 'fireplace',
    name: 'Cozy Fireplace',
    description: 'Fireplace crackle, warm room ambience, wooden creaks',
    premium: true,
    category: 'fireplace',
    sceneCompatible: ['cozy-room'],
    mixerCategory: 'Interior',
    sounds: [
      { id: 'fire_base', file: 'fireplace/fire-base.wav', loop: true, category: 'ambient', defaultVolume: 0.6 },
      { id: 'fire_crackle_01', file: 'fireplace/crackle-01.wav', loop: false, category: 'interaction', defaultVolume: 0.5 },
      { id: 'wood_creak_01', file: 'fireplace/wood-creak-01.wav', loop: false, category: 'interaction', defaultVolume: 0.3 },
      { id: 'fabric_brush_01', file: 'fireplace/fabric-brush-01.wav', loop: false, category: 'interaction', defaultVolume: 0.4 },
      { id: 'room_hum', file: 'fireplace/room-hum.wav', loop: true, category: 'ambient', defaultVolume: 0.2 },
    ],
  },
  // 3. Soft Tapping & Texture (Mixed)
  {
    id: 'tapping',
    name: 'Soft Tapping & Texture',
    description: 'Glass tapping, wood tapping, fabric brushing',
    premium: false,
    category: 'tapping',
    sceneCompatible: ['rain-window', 'cozy-room', 'sand-table'],
    mixerCategory: 'Tactile',
    sounds: [
      { id: 'tap_glass_soft', file: 'tapping/glass-soft.wav', loop: false, category: 'interaction', defaultVolume: 0.5 },
      { id: 'tap_wood_soft', file: 'tapping/wood-soft.wav', loop: false, category: 'interaction', defaultVolume: 0.5 },
      { id: 'tap_fabric', file: 'tapping/fabric.wav', loop: false, category: 'interaction', defaultVolume: 0.4 },
    ],
  },
  // 4. Sand & Tactile (Premium)
  {
    id: 'sand',
    name: 'Sand & Tactile',
    description: 'Sand movement, grain brushing, drag textures',
    premium: true,
    category: 'sand',
    sceneCompatible: ['sand-table'],
    mixerCategory: 'Tactile',
    sounds: [
      { id: 'sand_base', file: 'sand/sand-base.wav', loop: true, category: 'ambient', defaultVolume: 0.3 },
      { id: 'sand_drag_01', file: 'sand/drag-01.wav', loop: false, category: 'interaction', defaultVolume: 0.6 },
      { id: 'sand_drag_02', file: 'sand/drag-02.wav', loop: false, category: 'interaction', defaultVolume: 0.6 },
      { id: 'sand_grain_brush', file: 'sand/grain-brush.wav', loop: false, category: 'interaction', defaultVolume: 0.5 },
    ],
  },
  // 5. Night Ambience (Premium)
  {
    id: 'night',
    name: 'Night Ambience',
    description: 'Distant crickets, soft wind, evening atmosphere',
    premium: true,
    category: 'night',
    sceneCompatible: ['rain-window', 'cozy-room', 'sand-table'],
    mixerCategory: 'Nature',
    sounds: [
      { id: 'night_crickets', file: 'night/crickets.wav', loop: true, category: 'ambient', defaultVolume: 0.3 },
      { id: 'night_wind', file: 'night/soft-wind.wav', loop: true, category: 'ambient', defaultVolume: 0.25 },
      { id: 'night_ambience', file: 'night/evening-ambience.wav', loop: true, category: 'ambient', defaultVolume: 0.4 },
    ],
  },
  // 6. Water & Drip (Premium)
  {
    id: 'water',
    name: 'Water & Drip',
    description: 'Soft water drips, slow stream, gentle ripples',
    premium: true,
    category: 'water',
    sceneCompatible: ['rain-window', 'sand-table'],
    mixerCategory: 'Water',
    sounds: [
      { id: 'water_drip', file: 'water/drip.wav', loop: true, category: 'ambient', defaultVolume: 0.35 },
      { id: 'water_stream', file: 'water/stream.wav', loop: true, category: 'ambient', defaultVolume: 0.3 },
      { id: 'water_ripple', file: 'water/ripple.wav', loop: false, category: 'interaction', defaultVolume: 0.4 },
    ],
  },
  // 7. Fan & Sleep Noise (Mixed)
  {
    id: 'noise',
    name: 'Fan & Sleep Noise',
    description: 'Soft fan, white noise, brown noise',
    premium: false,
    category: 'noise',
    sceneCompatible: ['rain-window', 'cozy-room', 'sand-table'],
    mixerCategory: 'Noise',
    sounds: [
      { id: 'fan_soft', file: 'noise/fan-soft.wav', loop: true, category: 'ambient', defaultVolume: 0.4 },
      { id: 'white_noise', file: 'noise/white-noise.wav', loop: true, category: 'ambient', defaultVolume: 0.35 },
      { id: 'brown_noise', file: 'noise/brown-noise.wav', loop: true, category: 'ambient', defaultVolume: 0.35 },
    ],
  },
  // 8. Calm Breath & Tone (Premium)
  {
    id: 'tone',
    name: 'Calm Breath & Tone',
    description: 'Soft tonal pads, breathing guides, warm drones',
    premium: true,
    category: 'tone',
    sceneCompatible: ['rain-window', 'cozy-room', 'sand-table'],
    mixerCategory: 'Wellness',
    sounds: [
      { id: 'tone_pad', file: 'tone/pad.wav', loop: true, category: 'ambient', defaultVolume: 0.25 },
      { id: 'tone_drone', file: 'tone/warm-drone.wav', loop: true, category: 'ambient', defaultVolume: 0.2 },
      { id: 'tone_chime', file: 'tone/chime.wav', loop: false, category: 'accent', defaultVolume: 0.3 },
    ],
  },
  // 9. Cozy Interior Objects (Premium)
  {
    id: 'interior',
    name: 'Cozy Interior Objects',
    description: 'Book pages, cups, curtains, gentle creaks',
    premium: true,
    category: 'interior',
    sceneCompatible: ['cozy-room'],
    mixerCategory: 'Interior',
    sounds: [
      { id: 'page_turn', file: 'interior/page-turn.wav', loop: false, category: 'interaction', defaultVolume: 0.4 },
      { id: 'cup_set', file: 'interior/cup-set.wav', loop: false, category: 'interaction', defaultVolume: 0.35 },
      { id: 'curtain_move', file: 'interior/curtain.wav', loop: false, category: 'interaction', defaultVolume: 0.3 },
    ],
  },
];

export function getSoundPack(id: string): SoundPack | undefined {
  return SOUND_PACKS.find(p => p.id === id);
}

export function getPacksForScene(sceneId: string): SoundPack[] {
  return SOUND_PACKS.filter(p => p.sceneCompatible.includes(sceneId));
}

export function getFreePacks(): SoundPack[] {
  return SOUND_PACKS.filter(p => !p.premium);
}

export function getPremiumPacks(): SoundPack[] {
  return SOUND_PACKS.filter(p => p.premium);
}
