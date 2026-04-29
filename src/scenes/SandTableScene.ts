import * as THREE from 'three';
import { IScene, SceneInitParams, HitResult } from './IScene';

export class SandTableScene implements IScene {
  readonly id = 'sand-table';
  readonly group: THREE.Group;

  private sandMesh: THREE.Mesh;
  private trailMesh: THREE.Mesh;
  private trailCanvas: HTMLCanvasElement;
  private trailCtx: CanvasRenderingContext2D;
  private trailTexture: THREE.CanvasTexture;
  private raycaster = new THREE.Raycaster();
  private _ndc = new THREE.Vector2();
  private _camera: THREE.Camera | null = null;
  private lastU = -1;
  private lastV = -1;
  private idleFrames = 0;
  private dirty = false;

  constructor() {
    this.group = new THREE.Group();

    // Flat circular sand surface, tilted camera-facing
    const sandGeo = new THREE.CircleGeometry(1, 64);
    const sandMat = new THREE.MeshBasicMaterial({ color: 0xc4a877 });
    this.sandMesh = new THREE.Mesh(sandGeo, sandMat);
    this.sandMesh.rotation.x = -Math.PI * 0.18; // slight tilt toward camera
    this.sandMesh.name = 'sand-surface';
    this.group.add(this.sandMesh);

    // Sand drag trail canvas overlay
    const size = 512;
    this.trailCanvas = document.createElement('canvas');
    this.trailCanvas.width = size;
    this.trailCanvas.height = size;
    this.trailCtx = this.trailCanvas.getContext('2d')!;
    this.trailTexture = new THREE.CanvasTexture(this.trailCanvas);

    const trailGeo = new THREE.CircleGeometry(1, 64);
    const trailMat = new THREE.MeshBasicMaterial({
      map: this.trailTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    this.trailMesh = new THREE.Mesh(trailGeo, trailMat);
    this.trailMesh.rotation.x = -Math.PI * 0.18;
    this.trailMesh.position.z = 0.002; // just in front of sand surface
    this.trailMesh.renderOrder = 2;
    this.group.add(this.trailMesh);
  }

  init({ scene, camera }: SceneInitParams): Promise<void> {
    this._camera = camera;
    scene.add(this.group);

    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        '/skybox/warm-neutral.jpg',
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
          scene.background = new THREE.Color(0xc4a877);
          resolve();
        },
      );
    });
  }

  update(_dt: number): void {
    this.idleFrames++;
    if (this.idleFrames <= 120) {
      const s = this.trailCanvas.width;
      this.trailCtx.globalCompositeOperation = 'destination-out';
      this.trailCtx.globalAlpha = 0.008;
      this.trailCtx.fillRect(0, 0, s, s);
      this.trailCtx.globalCompositeOperation = 'source-over';
      this.trailCtx.globalAlpha = 1;
      this.dirty = true;
    }
    if (this.dirty) {
      this.trailTexture.needsUpdate = true;
      this.dirty = false;
    }
  }

  drawTrail(u: number, v: number): void {
    const s = this.trailCanvas.width;
    const x = u * s;
    const y = (1 - v) * s;

    if (this.lastU >= 0) {
      const lx = this.lastU * s;
      const ly = (1 - this.lastV) * s;
      this.trailCtx.strokeStyle = 'rgba(90, 60, 30, 0.35)';
      this.trailCtx.lineWidth = 22;
      this.trailCtx.lineCap = 'round';
      this.trailCtx.lineJoin = 'round';
      this.trailCtx.beginPath();
      this.trailCtx.moveTo(lx, ly);
      this.trailCtx.lineTo(x, y);
      this.trailCtx.stroke();
    }

    this.lastU = u;
    this.lastV = v;
    this.dirty = true;
    this.idleFrames = 0;
  }

  endTrail(): void {
    this.lastU = -1;
    this.lastV = -1;
  }

  hitTest(ndc: THREE.Vector2): HitResult | null {
    if (!this._camera) return null;
    this._ndc.set(ndc.x, ndc.y);
    this.raycaster.setFromCamera(this._ndc, this._camera);
    const hits = this.raycaster.intersectObject(this.sandMesh);
    if (hits.length === 0) return null;
    return {
      uv: hits[0].uv ? new THREE.Vector2(hits[0].uv.x, hits[0].uv.y) : undefined,
      surface: 'sand',
    };
  }

  dispose(): void {
    this.sandMesh.geometry.dispose();
    (this.sandMesh.material as THREE.Material).dispose();
    this.trailMesh.geometry.dispose();
    (this.trailMesh.material as THREE.Material).dispose();
    this.trailTexture.dispose();
    this.group.parent?.remove(this.group);
  }
}
