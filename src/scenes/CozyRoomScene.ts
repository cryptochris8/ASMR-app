import * as THREE from 'three';
import { IScene, SceneInitParams, HitResult } from './IScene';

export class CozyRoomScene implements IScene {
  readonly id = 'cozy-room';
  readonly group: THREE.Group;

  private interactionPlane: THREE.Mesh;
  private warmLight: THREE.PointLight;
  private flickerTime = 0;
  private raycaster = new THREE.Raycaster();
  private _ndc = new THREE.Vector2();
  private _camera: THREE.Camera | null = null;
  private _isDragging = false;

  constructor() {
    this.group = new THREE.Group();

    // Flickering warm point light (fireplace)
    this.warmLight = new THREE.PointLight(0xffb070, 1.2, 8);
    this.warmLight.position.set(0, -0.5, 1);
    this.group.add(this.warmLight);

    // Near-invisible interaction plane slightly right of center
    const planeGeo = new THREE.PlaneGeometry(2.0, 3.0);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.interactionPlane = new THREE.Mesh(planeGeo, planeMat);
    this.interactionPlane.position.set(0.3, 0.5, 1.0);
    this.interactionPlane.name = 'cozy-interaction';
    this.group.add(this.interactionPlane);
  }

  init({ scene, camera }: SceneInitParams): Promise<void> {
    this._camera = camera;
    scene.add(this.group);

    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        '/skybox/cozy-rain.jpg',
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
          scene.background = new THREE.Color(0x2a1810);
          resolve();
        },
      );
    });
  }

  update(dt: number): void {
    this.flickerTime += dt;
    // Sine wave + pseudo-noise for flicker
    const noise =
      Math.sin(this.flickerTime * 7.3) * 0.04 +
      Math.sin(this.flickerTime * 13.7) * 0.025 +
      Math.sin(this.flickerTime * 2.1) * 0.06;
    this.warmLight.intensity = 1.2 + noise;
  }

  hitTest(ndc: THREE.Vector2): HitResult | null {
    if (!this._camera) return null;
    this._ndc.set(ndc.x, ndc.y);
    this.raycaster.setFromCamera(this._ndc, this._camera);
    const hits = this.raycaster.intersectObject(this.interactionPlane);
    if (hits.length === 0) return null;
    return {
      uv: hits[0].uv ? new THREE.Vector2(hits[0].uv.x, hits[0].uv.y) : undefined,
      surface: this._isDragging ? 'fabric' : 'wood',
    };
  }

  setDragging(value: boolean): void {
    this._isDragging = value;
  }

  dispose(): void {
    this.interactionPlane.geometry.dispose();
    (this.interactionPlane.material as THREE.Material).dispose();
    this.group.remove(this.warmLight);
    this.group.parent?.remove(this.group);
  }
}
