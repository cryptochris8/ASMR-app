import * as THREE from 'three';
import { IScene, SceneInitParams, HitResult } from './IScene';
import { getScene } from '../content/scenes';
import { getHotspots } from '../content/hotspots';
import { resolveHotspot } from './hotspotResolver';
import { SceneId } from '../game/state';

/**
 * Skybox + hotspots scene. The skybox is the visual; tappable regions
 * are defined by angular hotspot configs in `content/hotspots.ts`.
 * Outside any hotspot, taps produce no sound.
 */
export class CozyRoomScene implements IScene {
  readonly id: SceneId = 'cozy-room';
  readonly group: THREE.Group;

  private raycaster = new THREE.Raycaster();
  private _ndc = new THREE.Vector2();
  private _camera: THREE.Camera | null = null;

  // Sticky speaker music — tap-to-toggle, persists across other interactions
  private moonlight: HTMLAudioElement | null = null;
  private moonlightPlaying = false;

  constructor() {
    this.group = new THREE.Group();
    this.moonlight = new Audio('/audio/music/moonlight-loop.wav');
    this.moonlight.loop = true;
    this.moonlight.preload = 'auto';
  }

  toggleSpeakerMusic(): boolean {
    if (!this.moonlight) return false;
    if (this.moonlightPlaying) {
      this.moonlight.pause();
      this.moonlight.currentTime = 0;
      this.moonlightPlaying = false;
    } else {
      this.moonlight.play().catch(() => {});
      this.moonlightPlaying = true;
    }
    return this.moonlightPlaying;
  }

  init({ scene, camera }: SceneInitParams): Promise<void> {
    this._camera = camera;
    scene.add(this.group);

    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        '/skybox/cozy-room.jpg',
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
    if (this.moonlight) {
      this.moonlight.pause();
      this.moonlight.src = '';
      this.moonlight = null;
    }
    this.moonlightPlaying = false;
    this.group.parent?.remove(this.group);
  }
}
