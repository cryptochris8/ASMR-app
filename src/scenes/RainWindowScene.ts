import * as THREE from 'three';
import { RAIN_WINDOW_CONFIG } from './rainWindowConfig';
import { RainGlassOverlay } from '../effects/RainGlassOverlay';
import { CondensationTrail } from '../effects/CondensationTrail';

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
export class RainWindowScene {
  readonly group: THREE.Group;
  private interactionPlane: THREE.Mesh;
  private rainOverlay: RainGlassOverlay;
  private condensationTrail: CondensationTrail;
  private raycaster: THREE.Raycaster;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.raycaster = new THREE.Raycaster();

    const cfg = RAIN_WINDOW_CONFIG;
    const pos = new THREE.Vector3(cfg.plane.x, cfg.plane.y, cfg.plane.z);

    // ── Glass interaction plane ────────────────────────────
    // Near-invisible surface for raycasting + subtle glass sheen
    const planeGeo = new THREE.PlaneGeometry(cfg.plane.width, cfg.plane.height);
    const planeMat = new THREE.MeshStandardMaterial({
      color: cfg.glass.color,
      transparent: true,
      opacity: cfg.glass.opacity,
      roughness: cfg.glass.roughness,
      metalness: cfg.glass.metalness,
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

    scene.add(this.group);
  }

  /**
   * Raycast from screen coordinates to the interaction plane.
   * Returns UV coordinates (0–1) if hit, null if missed.
   *
   * @param ndcX  Normalized device X (-1 to 1)
   * @param ndcY  Normalized device Y (-1 to 1)
   * @param camera  The scene camera
   */
  hitTest(
    ndcX: number,
    ndcY: number,
    camera: THREE.Camera,
  ): { u: number; v: number } | null {
    this.raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    const hits = this.raycaster.intersectObject(this.interactionPlane);
    if (hits.length === 0 || !hits[0].uv) return null;
    return { u: hits[0].uv.x, v: hits[0].uv.y };
  }

  /** Draw condensation line at UV during drag */
  drawTrail(u: number, v: number): void {
    this.condensationTrail.draw(u, v);
  }

  /** Draw tap ripple at UV */
  drawRipple(u: number, v: number): void {
    const cfg = RAIN_WINDOW_CONFIG.ripple;
    this.condensationTrail.drawRipple(u, v, cfg.radius, cfg.opacity);
  }

  /** End drag tracking (resets line continuity) */
  endTrail(): void {
    this.condensationTrail.endDrag();
  }

  /** Call every frame */
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
