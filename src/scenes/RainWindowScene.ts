import * as THREE from 'three';
import { RAIN_WINDOW_CONFIG } from './rainWindowConfig';
import { RainGlassOverlay } from '../effects/RainGlassOverlay';
import { CondensationTrail } from '../effects/CondensationTrail';
import { IScene, SceneInitParams, HitResult } from './IScene';

/**
 * Rain Window interactive scene.
 *
 * Layers:
 *  1. Skybox (handled externally by scene.background)
 *  2. Glass interaction plane (near-invisible, receives raycasts)
 *  3. Animated rain streak overlay
 *  4. Condensation trail canvas (drag traces + tap ripples)
 *
 * No room geometry — the skybox is the entire visual.
 */
export class RainWindowScene implements IScene {
  readonly id = 'rain-window';
  readonly group: THREE.Group;
  private interactionPlane: THREE.Mesh;
  private rainOverlay: RainGlassOverlay;
  private condensationTrail: CondensationTrail;
  private raycaster: THREE.Raycaster;
  private _ndc = new THREE.Vector2();
  private _camera: THREE.Camera | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.raycaster = new THREE.Raycaster();

    const cfg = RAIN_WINDOW_CONFIG;
    const pos = new THREE.Vector3(cfg.plane.x, cfg.plane.y, cfg.plane.z);

    // ── Glass interaction plane ────────────────────────────
    const planeGeo = new THREE.PlaneGeometry(cfg.plane.width, cfg.plane.height);
    const planeMat = new THREE.MeshBasicMaterial({
      color: cfg.glass.color,
      transparent: true,
      opacity: cfg.glass.opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    this.interactionPlane = new THREE.Mesh(planeGeo, planeMat);
    this.interactionPlane.position.copy(pos);
    if (cfg.plane.rotationY) {
      this.interactionPlane.rotation.y = cfg.plane.rotationY;
    }
    this.interactionPlane.name = 'glass-interaction';
    this.group.add(this.interactionPlane);

    // ── Rain overlay (scrolling streaks) ───────────────────
    this.rainOverlay = new RainGlassOverlay(
      this.group,
      pos,
      cfg.plane.width,
      cfg.plane.height,
      cfg.rain,
    );

    // ── Condensation trail (drag + tap feedback) ───────────
    this.condensationTrail = new CondensationTrail(
      this.group,
      pos,
      cfg.plane.width,
      cfg.plane.height,
      cfg.trail,
    );
  }

  init({ scene, camera }: SceneInitParams): void {
    this._camera = camera;
    scene.add(this.group);
  }

  /**
   * IScene hitTest — accepts NDC Vector2.
   * Also supports legacy (ndcX, ndcY, camera) call pattern via overloaded helper.
   */
  hitTest(ndc: THREE.Vector2): HitResult | null {
    if (!this._camera) return null;
    this._ndc.set(ndc.x, ndc.y);
    this.raycaster.setFromCamera(this._ndc, this._camera);
    const hits = this.raycaster.intersectObject(this.interactionPlane);
    if (hits.length === 0 || !hits[0].uv) return null;
    return {
      uv: new THREE.Vector2(hits[0].uv.x, hits[0].uv.y),
      surface: 'glass',
    };
  }

  /**
   * Legacy hit test used by Game.ts input callbacks.
   * Returns UV {u, v} if hit, null if missed.
   */
  hitTestLegacy(
    ndcX: number,
    ndcY: number,
    camera: THREE.Camera,
  ): { u: number; v: number } | null {
    this._ndc.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this._ndc, camera);
    const hits = this.raycaster.intersectObject(this.interactionPlane);
    if (hits.length === 0 || !hits[0].uv) return null;
    return { u: hits[0].uv.x, v: hits[0].uv.y };
  }

  drawTrail(u: number, v: number): void {
    this.condensationTrail.draw(u, v);
  }

  drawRipple(u: number, v: number): void {
    const cfg = RAIN_WINDOW_CONFIG.ripple;
    this.condensationTrail.drawRipple(u, v, cfg.radius, cfg.opacity);
  }

  endTrail(): void {
    this.condensationTrail.endDrag();
  }

  update(dt: number): void {
    this.rainOverlay.update(dt);
    this.condensationTrail.update();
  }

  dispose(): void {
    this.rainOverlay.dispose();
    this.condensationTrail.dispose();
    this.interactionPlane.geometry.dispose();
    (this.interactionPlane.material as THREE.Material).dispose();
    this.group.parent?.remove(this.group);
  }
}
