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
  'apothecary-shop': [
    { id: 'jars',      yawDeg: -42.93, pitchDeg:   8.50, radiusDeg: 14, surface: 'jars',      label: 'Brass jars' },
    { id: 'spellbook', yawDeg: -25.87, pitchDeg: -30.65, radiusDeg: 12, surface: 'spellbook', label: 'Spell book' },
    { id: 'candles',   yawDeg: -48.42, pitchDeg: -19.05, radiusDeg: 14, surface: 'candles',   label: 'Beeswax candles' },
    { id: 'herbs',     yawDeg:  58.91, pitchDeg: -12.15, radiusDeg: 12, surface: 'herbs',     label: 'Hanging herbs' },
    { id: 'scale',     yawDeg:  74.05, pitchDeg: -18.18, radiusDeg: 10, surface: 'scale',     label: 'Brass scale' },
    { id: 'mortar',    yawDeg: -41.84, pitchDeg: -34.80, radiusDeg: 10, surface: 'mortar',    label: 'Mortar' },
  ],
  'clockmaker-workshop': [
    { id: 'lamp',        yawDeg: -165.50, pitchDeg: -18.60, radiusDeg: 14, surface: 'lamp',        label: 'Green oil lamp' },
    { id: 'gauge',       yawDeg: -138.88, pitchDeg:  17.82, radiusDeg: 10, surface: 'gauge',       label: 'Brass gauge' },
    { id: 'window',      yawDeg:  -89.19, pitchDeg:  14.90, radiusDeg: 14, surface: 'window',      label: 'Forest window' },
    { id: 'workbench',   yawDeg: -114.83, pitchDeg: -36.59, radiusDeg: 12, surface: 'workbench',   label: 'Workbench' },
    { id: 'clock-left',  yawDeg:  -38.88, pitchDeg:  13.19, radiusDeg: 10, surface: 'clock-left',  label: 'Mantel clock' },
    { id: 'clock-right', yawDeg:  -29.40, pitchDeg:  -6.81, radiusDeg: 10, surface: 'clock-right', label: 'Grandfather clock' },
  ],
  'vintage-train': [
    { id: 'book',         yawDeg:  23.58, pitchDeg: -48.55, radiusDeg: 10, surface: 'book',         label: 'Book on table' },
    { id: 'teacup',       yawDeg: -53.03, pitchDeg: -37.87, radiusDeg:  8, surface: 'teacup',       label: 'Teacup on bench' },
    { id: 'window-right', yawDeg: -58.25, pitchDeg: -16.65, radiusDeg: 14, surface: 'window-right', label: 'Right window' },
    { id: 'window-left',  yawDeg:  68.56, pitchDeg: -14.16, radiusDeg: 14, surface: 'window-left',  label: 'Left window' },
  ],
};

export function getHotspots(sceneId: SceneId): HotspotDef[] {
  return SCENE_HOTSPOTS[sceneId] ?? [];
}
