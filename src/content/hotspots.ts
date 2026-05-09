import { SceneId } from '../game/state';
import { SurfaceType } from '../audio/types';

/**
 * A tappable region on a skybox panorama. Coordinates are photo-relative
 * (degrees, anchored to the skybox image, independent of skyboxRotationY)
 * so the values stay valid if the panorama is rotated.
 *
 * Author with the dev-time HotspotEditor (URL `?hotspots=edit`): tap the
 * canvas, copy the logged snippet, paste here.
 */
export interface HotspotDef {
  id: string;
  yawDeg: number;
  pitchDeg: number;
  radiusDeg: number;
  surface: SurfaceType;
  label?: string;
}

export const SCENE_HOTSPOTS: Partial<Record<SceneId, HotspotDef[]>> = {
  'cozy-room': [
    { id: 'fireplace', yawDeg: -178.93, pitchDeg: -0.71, radiusDeg: 14, surface: 'fireplace', label: 'Fireplace' },
    { id: 'speaker',   yawDeg:  166.35, pitchDeg: -4.36, radiusDeg: 12, surface: 'speaker',   label: 'Vintage speaker' },
    { id: 'bookshelf', yawDeg:  119.97, pitchDeg:  1.79, radiusDeg: 14, surface: 'bookshelf', label: 'Bookshelf' },
    { id: 'armchair',  yawDeg:  117.23, pitchDeg: -12.72, radiusDeg: 14, surface: 'armchair', label: 'Armchair' },
    { id: 'pot',       yawDeg: -114.63, pitchDeg: -23.40, radiusDeg: 10, surface: 'pot',      label: 'Wooden pot' },
  ],
};

export function getHotspots(sceneId: SceneId): HotspotDef[] {
  return SCENE_HOTSPOTS[sceneId] ?? [];
}
