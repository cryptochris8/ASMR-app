import * as THREE from 'three';
import { IScene, SceneInitParams, HitResult } from './IScene';
import { getScene } from '../content/scenes';
import { getHotspots } from '../content/hotspots';
import { resolveHotspot } from './hotspotResolver';
import { SceneId } from '../game/state';

/**
 * Skybox + hotspots scene. No sticky layers yet — hotspots author
 * via `?hotspots=edit` then we wire up tap/hold audio per the
 * standard hotspot pattern.
 */
export class OldLighthouseScene implements IScene {
  readonly id: SceneId = 'old-lighthouse';
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
        '/skybox/old-lighthouse.jpg',
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
          scene.background = new THREE.Color(0x0c1018);
          resolve();
        },
      );
    });
  }

  update(_dt: number): void {
    // Static skybox — no per-frame work
  }

  hitTest(ndc: THREE.Vector2): HitResult | null {
    if (!this._camera) return null;
    this._ndc.set(ndc.x, ndc.y);
    this.raycaster.setFromCamera(this._ndc, this._camera);

    const sceneDef = getScene(this.id);
    const skyboxRotationY = sceneDef?.skyboxRotationY ?? 0;
    const hit = resolveHotspot(this.raycaster.ray.direction, skyboxRotationY, getHotspots(this.id));
    if (!hit) return null;
    return { surface: hit.surface };
  }

  dispose(): void {
    this.group.parent?.remove(this.group);
  }
}
