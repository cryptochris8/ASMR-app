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

  // Load skybox texture with per-scene rotation
  loadSkybox(scene, sceneId);
}

function loadSkybox(scene: THREE.Scene, sceneId: SceneId): void {
  const sceneDef = getSceneDef(sceneId);
  if (!sceneDef) return;

  const skyboxPath = `/skybox/${sceneDef.skybox}.jpg`;
  const loader = new THREE.TextureLoader();

  loader.load(
    skyboxPath,
    (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
      scene.backgroundRotation = new THREE.Euler(0, sceneDef.skyboxRotationY, 0);
    },
    undefined,
    () => {
      // Skybox file not found — keep solid color fallback
      const colors = CONFIG.sceneColors[sceneId];
      scene.background = new THREE.Color(colors?.fog ?? CONFIG.bgColor);
    },
  );
}

// --- Scene-specific 3D effect builders ---
// Skybox-based scenes need no geometry — the panorama is the visual.
// Audio + interactions provide the experience.

export function buildRainWindowScene(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group();
  scene.add(group);
  return group;
}

export function buildCozyRoomScene(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group();
  scene.add(group);
  return group;
}

export function buildSandTableScene(scene: THREE.Scene): THREE.Group {
  const group = new THREE.Group();

  // Table surface
  const tableGeo = new THREE.CylinderGeometry(2, 2, 0.15, 48);
  const tableMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.95 });
  const table = new THREE.Mesh(tableGeo, tableMat);
  table.position.set(0, 0.8, 0);
  group.add(table);

  // Sand surface
  const sandGeo = new THREE.CircleGeometry(1.9, 48);
  const sandMat = new THREE.MeshStandardMaterial({
    color: 0xd4c4a0,
    roughness: 1.0,
    metalness: 0.0,
  });
  const sand = new THREE.Mesh(sandGeo, sandMat);
  sand.rotation.x = -Math.PI / 2;
  sand.position.set(0, 0.88, 0);
  sand.name = 'sand-surface';
  group.add(sand);

  // Table rim
  const rimGeo = new THREE.TorusGeometry(2, 0.06, 8, 48);
  const rimMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.8 });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 0.88, 0);
  group.add(rim);

  scene.add(group);
  return group;
}
