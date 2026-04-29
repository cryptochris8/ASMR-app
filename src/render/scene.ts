import * as THREE from 'three';
import { CONFIG } from '../game/config';
import { SceneId } from '../game/state';
import { getScene as getSceneDef } from '../content/scenes';

export function createScene(sceneId: SceneId): THREE.Scene {
  const scene = new THREE.Scene();
  const sceneColors = CONFIG.sceneColors[sceneId];

  // Solid color fallback while skybox loads
  scene.background = new THREE.Color(sceneColors?.fog ?? CONFIG.bgColor);

  return scene;
}

export function switchSceneBackground(scene: THREE.Scene, sceneId: SceneId): void {
  const sceneColors = CONFIG.sceneColors[sceneId];
  if (!sceneColors) return;

  // No fog for skybox scenes — it washes out the panorama
  scene.fog = null;

  loadSkybox(scene, sceneId);
}

export function loadSkybox(scene: THREE.Scene, sceneId: SceneId): void {
  const sceneDef = getSceneDef(sceneId);
  if (!sceneDef) return;

  const skyboxPath = `/skybox/${sceneDef.skybox}.jpg`;
  const loader = new THREE.TextureLoader();

  loader.load(
    skyboxPath,
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      if (scene.background && (scene.background as any).dispose) (scene.background as any).dispose();
      scene.background = texture;
      scene.backgroundRotation = new THREE.Euler(0, sceneDef.skyboxRotationY, 0);
    },
    undefined,
    () => {
      // Skybox file not found — keep solid color fallback
      const colors = CONFIG.sceneColors[sceneId];
      if (scene.background && (scene.background as any).dispose) (scene.background as any).dispose();
      scene.background = new THREE.Color(colors?.fog ?? CONFIG.bgColor);
    },
  );
}

export function disposeGroup(obj: THREE.Object3D): void {
  obj.traverse((o: any) => {
    if (o.geometry) o.geometry.dispose?.();
    const m = o.material;
    if (Array.isArray(m)) m.forEach((x: any) => x?.dispose?.());
    else if (m) m.dispose?.();
  });
}
