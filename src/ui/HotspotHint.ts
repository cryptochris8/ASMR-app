import * as THREE from 'three';
import { CONFIG } from '../game/config';
import { HotspotDef } from '../content/hotspots';

const HINT_DURATION_MS = 6000;
const HINT_FADE_OUT_MS = 800;

interface ActiveHint {
  el: HTMLDivElement;
  hotspot: HotspotDef;
  worldDir: THREE.Vector3; // unit vector in world space
}

/**
 * First-visit hotspot discovery hint. Shows soft pulsing dots over each
 * hotspot for ~6 seconds when a user enters a scene for the first time.
 *
 * Dots are projected from 3D angular positions to 2D screen pixels every
 * frame via the active camera, so they stay glued to objects in the
 * panorama (and naturally hide themselves when the angular position is
 * behind the camera or off-screen).
 */
class HotspotHintImpl {
  private container: HTMLDivElement | null = null;
  private active: ActiveHint[] = [];
  private camera: THREE.PerspectiveCamera | null = null;
  private fadeTimerId: number | null = null;

  setCamera(camera: THREE.PerspectiveCamera): void {
    this.camera = camera;
  }

  show(hotspots: HotspotDef[], skyboxRotationY: number): void {
    this.dismiss();
    if (hotspots.length === 0) return;
    this.applyStyles();
    this.ensureContainer();

    for (const h of hotspots) {
      const yaw = (h.yawDeg * Math.PI) / 180 + skyboxRotationY;
      const pitch = (h.pitchDeg * Math.PI) / 180;
      const worldDir = new THREE.Vector3(
        Math.sin(yaw) * Math.cos(pitch),
        Math.sin(pitch),
        -Math.cos(yaw) * Math.cos(pitch),
      ).normalize();

      const el = document.createElement('div');
      el.className = 'hotspot-hint-dot';
      this.container!.appendChild(el);
      this.active.push({ el, hotspot: h, worldDir });
    }

    this.fadeTimerId = window.setTimeout(() => this.fadeOut(), HINT_DURATION_MS);
  }

  /** Quick dismiss — call when the user starts interacting with the scene. */
  dismissEarly(): void {
    if (this.active.length > 0) this.fadeOut();
  }

  /** Hard remove (used on scene change / dispose). */
  dismiss(): void {
    if (this.fadeTimerId) {
      clearTimeout(this.fadeTimerId);
      this.fadeTimerId = null;
    }
    for (const a of this.active) a.el.remove();
    this.active = [];
  }

  /** Per-frame: project each dot from world to screen. */
  update(): void {
    if (this.active.length === 0 || !this.camera) return;

    // Camera "forward" in world space — dots whose direction is behind
    // the camera should be hidden.
    const camForward = new THREE.Vector3();
    this.camera.getWorldDirection(camForward);

    const tmp = new THREE.Vector3();
    const w = window.innerWidth;
    const h = window.innerHeight;

    for (const a of this.active) {
      tmp.copy(a.worldDir);
      const dot = tmp.dot(camForward);
      if (dot <= 0.05) {
        a.el.style.display = 'none';
        continue;
      }
      // Project as if the direction were a far point
      const projected = tmp.clone().multiplyScalar(50).project(this.camera);
      const x = (projected.x * 0.5 + 0.5) * w;
      const y = (-projected.y * 0.5 + 0.5) * h;
      if (projected.x < -1.05 || projected.x > 1.05 || projected.y < -1.05 || projected.y > 1.05) {
        a.el.style.display = 'none';
      } else {
        a.el.style.display = 'block';
        a.el.style.transform = `translate(${x - 12}px, ${y - 12}px)`;
      }
    }
  }

  private fadeOut(): void {
    for (const a of this.active) a.el.classList.add('fade-out');
    setTimeout(() => this.dismiss(), HINT_FADE_OUT_MS);
  }

  private ensureContainer(): void {
    if (this.container) return;
    this.container = document.createElement('div');
    this.container.className = 'hotspot-hint-layer';
    document.body.appendChild(this.container);
  }

  private applyStyles(): void {
    if (document.querySelector('#hotspot-hint-styles')) return;
    const style = document.createElement('style');
    style.id = 'hotspot-hint-styles';
    style.textContent = `
      .hotspot-hint-layer {
        position: fixed; inset: 0;
        pointer-events: none;
        z-index: 5800;
      }
      .hotspot-hint-dot {
        position: absolute; top: 0; left: 0;
        width: 24px; height: 24px;
        border-radius: 50%;
        background: ${CONFIG.colors.primaryLight};
        opacity: 0;
        box-shadow: 0 0 18px ${CONFIG.colors.primaryLight}80;
        animation: hotspot-hint-pulse 1.6s ease-in-out infinite,
                   hotspot-hint-fade-in 0.6s ease-out forwards;
        will-change: transform, opacity;
      }
      .hotspot-hint-dot.fade-out {
        animation: hotspot-hint-fade-out ${HINT_FADE_OUT_MS}ms ease-out forwards;
      }
      @keyframes hotspot-hint-pulse {
        0%, 100% { transform-origin: center; }
        0%       { box-shadow: 0 0 12px ${CONFIG.colors.primaryLight}80; }
        50%      { box-shadow: 0 0 24px ${CONFIG.colors.primaryLight}; }
        100%     { box-shadow: 0 0 12px ${CONFIG.colors.primaryLight}80; }
      }
      @keyframes hotspot-hint-fade-in {
        from { opacity: 0; }
        to   { opacity: 0.7; }
      }
      @keyframes hotspot-hint-fade-out {
        from { opacity: 0.7; }
        to   { opacity: 0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .hotspot-hint-dot {
          animation: hotspot-hint-fade-in 0.6s ease-out forwards;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

export const hotspotHint = new HotspotHintImpl();
