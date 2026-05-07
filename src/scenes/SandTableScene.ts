import * as THREE from 'three';
import { IScene, SceneInitParams, HitResult } from './IScene';

const PLANE_Y = -0.5;
const PLANE_SIZE = 10;

export class SandTableScene implements IScene {
  readonly id = 'sand-table';
  readonly group: THREE.Group;

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

  constructor() {
    this.group = new THREE.Group();

    const size = 1024;
    this.trailCanvas = document.createElement('canvas');
    this.trailCanvas.width = size;
    this.trailCanvas.height = size;
    this.trailCtx = this.trailCanvas.getContext('2d')!;
    this.trailTexture = new THREE.CanvasTexture(this.trailCanvas);
    this.trailTexture.colorSpace = THREE.SRGBColorSpace;
    this.trailTexture.anisotropy = 8;

    const planeGeo = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
    const planeMat = new THREE.MeshBasicMaterial({
      map: this.trailTexture,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.NormalBlending,
    });
    this.trailMesh = new THREE.Mesh(planeGeo, planeMat);
    this.trailMesh.rotation.x = -Math.PI / 2;
    this.trailMesh.position.y = PLANE_Y;
    this.trailMesh.renderOrder = 2;
    this.trailMesh.name = 'sand-touch-zone';
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
    const s = this.trailCanvas.width;
    if (this.idleFrames === 360) {
      this.trailCtx.clearRect(0, 0, s, s);
    } else {
      const fadeAlpha = this.idleFrames < 60 ? 0.012 : 0.025;
      this.trailCtx.globalCompositeOperation = 'destination-out';
      this.trailCtx.globalAlpha = fadeAlpha;
      this.trailCtx.fillRect(0, 0, s, s);
      this.trailCtx.globalCompositeOperation = 'source-over';
      this.trailCtx.globalAlpha = 1;
    }
    this.trailTexture.needsUpdate = true;
  }

  drawTrail(u: number, v: number): void {
    const s = this.trailCanvas.width;
    const x = u * s;
    const y = (1 - v) * s;

    if (this.lastU >= 0) {
      const lx = this.lastU * s;
      const ly = (1 - this.lastV) * s;
      this.trailCtx.strokeStyle = 'rgba(120, 88, 58, 0.32)';
      this.trailCtx.lineWidth = 38;
      this.trailCtx.lineCap = 'round';
      this.trailCtx.lineJoin = 'round';
      this.trailCtx.beginPath();
      this.trailCtx.moveTo(lx, ly);
      this.trailCtx.lineTo(x, y);
      this.trailCtx.stroke();
    }

    this.lastU = u;
    this.lastV = v;
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
    const hits = this.raycaster.intersectObject(this.trailMesh);
    if (hits.length === 0) return null;
    return {
      uv: hits[0].uv ? new THREE.Vector2(hits[0].uv.x, hits[0].uv.y) : undefined,
      surface: 'sand',
    };
  }

  dispose(): void {
    this.trailMesh.geometry.dispose();
    (this.trailMesh.material as THREE.Material).dispose();
    this.trailTexture.dispose();
    this.group.parent?.remove(this.group);
  }
}
