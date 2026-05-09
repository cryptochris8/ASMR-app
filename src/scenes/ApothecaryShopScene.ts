import * as THREE from 'three';
import { IScene, SceneInitParams, HitResult } from './IScene';
import { getScene } from '../content/scenes';
import { getHotspots } from '../content/hotspots';
import { resolveHotspot } from './hotspotResolver';
import { SceneId } from '../game/state';

/**
 * Skybox + hotspots scene for the mystical apothecary shop.
 * Hotspots and audio bindings are populated after the silent
 * audition step (place via ?hotspots=edit, then add to hotspots.ts).
 */
export class ApothecaryShopScene implements IScene {
  readonly id: SceneId = 'apothecary-shop';
  readonly group: THREE.Group;

  private raycaster = new THREE.Raycaster();
  private _ndc = new THREE.Vector2();
  private _camera: THREE.Camera | null = null;

  // Sticky candle flicker — tap-to-toggle, persists across other interactions
  private candleFlicker: HTMLAudioElement | null = null;
  private candleFlickerPlaying = false;

  // Always-on background music (Gymnopédie no. 1 for harp, public domain)
  private bgMusic: HTMLAudioElement | null = null;

  constructor() {
    this.group = new THREE.Group();
    this.candleFlicker = new Audio('/audio/interactions/hold/candles/candle-flicker-loop-01.wav');
    this.candleFlicker.loop = true;
    this.candleFlicker.preload = 'auto';
    this.candleFlicker.volume = 0.5;

    this.bgMusic = new Audio('/audio/music/gymnopedie-loop.wav');
    this.bgMusic.loop = true;
    this.bgMusic.preload = 'auto';
    this.bgMusic.volume = 1.0; // file is pre-attenuated to 0.35; tweak here for relative mix
  }

  toggleCandleFlicker(): boolean {
    if (!this.candleFlicker) return false;
    if (this.candleFlickerPlaying) {
      this.candleFlicker.pause();
      this.candleFlicker.currentTime = 0;
      this.candleFlickerPlaying = false;
    } else {
      this.candleFlicker.play().catch(() => {});
      this.candleFlickerPlaying = true;
    }
    return this.candleFlickerPlaying;
  }

  init({ scene, camera }: SceneInitParams): Promise<void> {
    this._camera = camera;
    scene.add(this.group);

    // Auto-play background music when scene mounts
    this.bgMusic?.play().catch(() => {});

    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        '/skybox/apothecary-shop.jpg',
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
          scene.background = new THREE.Color(0x140a04);
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
    if (this.candleFlicker) {
      this.candleFlicker.pause();
      this.candleFlicker.src = '';
      this.candleFlicker = null;
    }
    this.candleFlickerPlaying = false;
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.src = '';
      this.bgMusic = null;
    }
    this.group.parent?.remove(this.group);
  }
}
