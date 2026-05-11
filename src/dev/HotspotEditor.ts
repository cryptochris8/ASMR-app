import * as THREE from 'three';
import { getScene } from '../content/scenes';
import { Store, SceneId } from '../game/state';

/**
 * Dev-only tool for placing hotspots on a skybox.
 *
 * Activate with `?hotspots=edit` in the URL. Tap the canvas to log a
 * hotspot snippet (photo-relative yaw + pitch in degrees) to the console.
 *
 * Coordinates are stored as photo-relative yaw so they remain stable when
 * `skyboxRotationY` changes for a scene.
 */
export class HotspotEditor {
  private canvas: HTMLCanvasElement;
  private camera: THREE.PerspectiveCamera;
  private store: Store;
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private bound: (e: PointerEvent) => void;
  private active = false;

  constructor(canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera, store: Store) {
    this.canvas = canvas;
    this.camera = camera;
    this.store = store;
    this.bound = (e) => this.onPointerDown(e);
  }

  enable(): void {
    if (this.active) return;
    // Listen at the document level so HUD overlays (mute/timer/mixer buttons)
    // can't swallow taps on parts of the panorama covered by UI.
    document.addEventListener('pointerdown', this.bound, true);
    this.active = true;
    console.log(
      '%c[HotspotEditor] ON%c — tap anywhere to log a hotspot snippet. Call __hotspotEditor.disable() to stop.',
      'color: #000; background: #ffd700; font-weight: bold; padding: 2px 6px;',
      'color: inherit;',
    );
  }

  disable(): void {
    if (!this.active) return;
    document.removeEventListener('pointerdown', this.bound, true);
    this.active = false;
    console.log('[HotspotEditor] off');
  }

  private onPointerDown(e: PointerEvent): void {
    e.stopPropagation();
    e.preventDefault();

    const rect = this.canvas.getBoundingClientRect();
    this.ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.ndc, this.camera);
    const dir = this.raycaster.ray.direction;

    const sceneId = this.store.state.activeScene as SceneId;
    const sceneDef = getScene(sceneId);
    const rotY = sceneDef?.skyboxRotationY ?? 0;

    // Camera looks down -Z by default. Yaw 0 = looking forward (-Z).
    const worldYaw = Math.atan2(dir.x, -dir.z);
    const pitch = Math.asin(THREE.MathUtils.clamp(dir.y, -1, 1));

    // Subtract skybox rotation so the value anchors to the photo content,
    // not world space — survives changes to skyboxRotationY.
    let photoYaw = worldYaw - rotY;
    while (photoYaw > Math.PI) photoYaw -= 2 * Math.PI;
    while (photoYaw < -Math.PI) photoYaw += 2 * Math.PI;

    const yawDeg = +(photoYaw * 180 / Math.PI).toFixed(2);
    const pitchDeg = +(pitch * 180 / Math.PI).toFixed(2);

    const snippet = `{ id: 'TODO', yaw: ${yawDeg}, pitch: ${pitchDeg}, radius: 8, sound: 'TODO' },`;

    console.log(
      `%c[hotspot @ ${sceneId}]%c ${snippet}`,
      'color: #000; background: #ffd700; font-weight: bold; padding: 1px 6px;',
      'color: inherit;',
    );
  }
}
