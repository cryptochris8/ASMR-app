import * as THREE from 'three';
import { IScene, SceneInitParams, HitResult } from './IScene';
import { getScene } from '../content/scenes';
import { getHotspots } from '../content/hotspots';
import { resolveHotspot } from './hotspotResolver';
import { SceneId } from '../game/state';

/**
 * Skybox + hotspots scene for the antique clockmaker's workshop.
 * Hotspots and audio bindings are populated after the silent
 * audition step (place via ?hotspots=edit, then add to hotspots.ts).
 */
export class ClockmakerWorkshopScene implements IScene {
  readonly id: SceneId = 'clockmaker-workshop';
  readonly group: THREE.Group;

  private raycaster = new THREE.Raycaster();
  private _ndc = new THREE.Vector2();
  private _camera: THREE.Camera | null = null;

  constructor() {
    this.group = new THREE.Group();
  }

  init({ scene, camera }: SceneInitParams): Promise<void> {
    this._camera = camera;
    scene.add(this.group);

    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        '/skybox/clockmakersworkshop.jpg',
        (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          texture.colorSpace = THREE.SRGBColorSpace;
          if (scene.background && (scene.background as any).dispose) {
            (scene.background as any).dispose();
          }
          scene.background = texture;
          resolve();
        },
        undefined,
        () => {
          if (scene.background && (scene.background as any).dispose) {
            (scene.background as any).dispose();
          }
          scene.background = new THREE.Color(0x0e0a08);
          resolve();
        },
      );
    });
  }

  update(_dt: number): void {
    // Static skybox — no per-frame work
  }

  hitTest(ndc: THREE.Vector2, currentSkyboxRotationY?: number): HitResult | null {
    if (!this._camera) return null;
    this._ndc.set(ndc.x, ndc.y);
    this.raycaster.setFromCamera(this._ndc, this._camera);

    const sceneDef = getScene(this.id);
    const rotationY = currentSkyboxRotationY ?? sceneDef?.skyboxRotationY ?? 0;
    const hit = resolveHotspot(this.raycaster.ray.direction, rotationY, getHotspots(this.id));
    if (!hit) return null;
    return { surface: hit.surface };
  }

  dispose(): void {
    this.group.parent?.remove(this.group);
  }
}
