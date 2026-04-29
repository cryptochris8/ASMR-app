import * as THREE from 'three';
import { CONFIG } from '../game/config';

export interface SceneLights {
  ambient: THREE.AmbientLight;
  directional: THREE.DirectionalLight;
}

let activeRaf: number | null = null;

export function setupLighting(scene: THREE.Scene): SceneLights {
  const ambient = new THREE.AmbientLight(
    CONFIG.ambientLightColor,
    CONFIG.ambientLightIntensity,
  );
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(
    CONFIG.directionalLightColor,
    CONFIG.directionalLightIntensity,
  );
  directional.position.set(...CONFIG.directionalLightPosition);
  directional.castShadow = false; // Keep it light for battery
  scene.add(directional);

  return { ambient, directional };
}

export function updateSceneLighting(
  lights: SceneLights,
  ambientColor: number,
  directionalColor: number,
  duration: number = 800,
): void {
  const startAmbient = lights.ambient.color.clone();
  const startDirectional = lights.directional.color.clone();
  const targetAmbient = new THREE.Color(ambientColor);
  const targetDirectional = new THREE.Color(directionalColor);

  if (activeRaf !== null) {
    cancelAnimationFrame(activeRaf);
    activeRaf = null;
  }

  const startTime = performance.now();

  const animate = (now: number) => {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = t * t * (3 - 2 * t); // smoothstep

    lights.ambient.color.lerpColors(startAmbient, targetAmbient, eased);
    lights.directional.color.lerpColors(startDirectional, targetDirectional, eased);

    if (t < 1) {
      activeRaf = requestAnimationFrame(animate);
    } else {
      activeRaf = null;
    }
  };

  activeRaf = requestAnimationFrame(animate);
}
