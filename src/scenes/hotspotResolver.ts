import * as THREE from 'three';
import { HotspotDef } from '../content/hotspots';

/**
 * Find the closest hotspot whose angular distance from the given ray
 * is within its radius. Returns null if no hotspot matches.
 *
 * `dir` is a normalized world-space ray direction (e.g., from
 * Raycaster.setFromCamera(...).ray.direction). `skyboxRotationY` matches
 * scene.backgroundRotation.y so coordinates stay anchored to the photo.
 */
export function resolveHotspot(
  dir: THREE.Vector3,
  skyboxRotationY: number,
  hotspots: HotspotDef[],
): HotspotDef | null {
  if (hotspots.length === 0) return null;

  const worldYaw = Math.atan2(dir.x, -dir.z);
  const pitch = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1));

  let photoYaw = worldYaw - skyboxRotationY;
  while (photoYaw > Math.PI) photoYaw -= 2 * Math.PI;
  while (photoYaw < -Math.PI) photoYaw += 2 * Math.PI;

  const yawDeg = (photoYaw * 180) / Math.PI;
  const pitchDeg = (pitch * 180) / Math.PI;

  let best: HotspotDef | null = null;
  let bestDist = Infinity;

  for (const h of hotspots) {
    const dy = wrapDeg(yawDeg - h.yawDeg);
    const dp = pitchDeg - h.pitchDeg;
    const dist = Math.sqrt(dy * dy + dp * dp);
    if (dist < h.radiusDeg && dist < bestDist) {
      best = h;
      bestDist = dist;
    }
  }
  return best;
}

function wrapDeg(d: number): number {
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}
