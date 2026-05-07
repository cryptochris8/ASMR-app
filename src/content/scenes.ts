import { SceneId } from '../game/state';

export interface SceneDef {
  id: SceneId;
  name: string;
  description: string;
  moodLabel: string;
  premium: boolean;
  skybox: string;
  skyboxRotationY: number; // radians — which direction the camera faces in the panorama
  ambientSoundPack: string;
  interactionSounds: string[];
  bgColor: number;
  thumbnailColor: number;
}

export const SCENES: SceneDef[] = [
  {
    id: 'rain-window',
    name: 'Rain Window',
    description: 'Rain hitting glass with subtle thunder and soothing taps',
    moodLabel: 'Rainy & Calm',
    premium: false,
    skybox: 'rain-window',
    skyboxRotationY: 0,  // adjust after previewing
    ambientSoundPack: 'rain',
    interactionSounds: ['rain_tap_glass_01', 'rain_tap_glass_02', 'rain_thunder_soft'],
    bgColor: 0x0a0a18,
    thumbnailColor: 0x4466aa,
  },
  {
    id: 'cozy-room',
    name: 'Cozy Room',
    description: 'Warm fireplace crackle with soft fabric and wood sounds',
    moodLabel: 'Warm & Cozy',
    premium: true,
    skybox: 'cozy-rain',
    skyboxRotationY: Math.PI * 0.35, // face the fireplace
    ambientSoundPack: 'fireplace',
    interactionSounds: ['fire_crackle_01', 'wood_creak_01', 'fabric_brush_01'],
    bgColor: 0x120e08,
    thumbnailColor: 0xcc8844,
  },
  {
    id: 'sand-table',
    name: 'Sand Table',
    description: 'Drag through soft sand for gentle tactile sounds',
    moodLabel: 'Tactile & Soft',
    premium: true,
    skybox: 'warm-neutral',
    skyboxRotationY: 0,
    ambientSoundPack: 'sand',
    interactionSounds: ['sand_drag_01', 'sand_drag_02', 'sand_grain_brush'],
    bgColor: 0x0e0c08,
    thumbnailColor: 0xccbb88,
  },
  {
    id: 'temple-zen',
    name: 'Zen Temple',
    description: 'Quiet temple courtyard at dusk',
    moodLabel: 'Still & Meditative',
    premium: true,
    skybox: 'temple-zen',
    skyboxRotationY: Math.PI,
    ambientSoundPack: 'tone',
    interactionSounds: [],
    bgColor: 0x0a0e14,
    thumbnailColor: 0x5a6878,
  },
];

export function getScene(id: SceneId): SceneDef | undefined {
  return SCENES.find(s => s.id === id);
}
