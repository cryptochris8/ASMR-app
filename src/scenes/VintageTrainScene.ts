import * as THREE from 'three';
import { IScene, SceneInitParams, HitResult } from './IScene';
import { getScene } from '../content/scenes';
import { getHotspots } from '../content/hotspots';
import { resolveHotspot } from './hotspotResolver';
import { SceneId } from '../game/state';
import { musicChannel } from '../audio/MusicChannel';

/**
 * Skybox + hotspots scene. The book hotspot is sticky-toggle —
 * tapping it starts/stops the ASMR storytelling layer (in addition
 * to firing the page-rustle tap sound).
 */
export class VintageTrainScene implements IScene {
  readonly id: SceneId = 'vintage-train';
  readonly group: THREE.Group;

  private raycaster = new THREE.Raycaster();
  private _ndc = new THREE.Vector2();
  private _camera: THREE.Camera | null = null;

  // Sticky storytelling — tap-book-to-toggle, persists across other interactions
  private story: HTMLAudioElement | null = null;
  private storyPlaying = false;

  constructor() {
    this.group = new THREE.Group();
    this.story = new Audio('/audio/music/train-story-loop.wav');
    this.story.loop = true;
    this.story.preload = 'auto';
    // Intrinsic 1.0 — file is pre-attenuated; SleepTimer / master slider scale it.
    musicChannel.register(this.story, 1.0);
  }

  toggleStory(): boolean {
    if (!this.story) return false;
    if (this.storyPlaying) {
      this.story.pause();
      this.story.currentTime = 0;
      this.storyPlaying = false;
    } else {
      this.story.play().catch(() => {});
      this.storyPlaying = true;
    }
    return this.storyPlaying;
  }

  init({ scene, camera }: SceneInitParams): Promise<void> {
    this._camera = camera;
    scene.add(this.group);

    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      loader.load(
        '/skybox/vintage-train.jpg',
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
          scene.background = new THREE.Color(0x140e08);
          resolve();
        },
      );
    });
  }

  update(_dt: number): void {
    // Static skybox — no per-frame work
  }

  hitTest(ndc: THREE.Vector2, currentSkyboxRotationY?: number): HitResult | null {
    if (!this._camera) return null;
    this._ndc.set(ndc.x, ndc.y);
    this.raycaster.setFromCamera(this._ndc, this._camera);

    const sceneDef = getScene(this.id);
    const rotationY = currentSkyboxRotationY ?? sceneDef?.skyboxRotationY ?? 0;
    const hit = resolveHotspot(this.raycaster.ray.direction, rotationY, getHotspots(this.id));
    if (!hit) return null;
    return { surface: hit.surface };
  }

  dispose(): void {
    if (this.story) {
      musicChannel.unregister(this.story);
      this.story.pause();
      this.story.src = '';
      this.story = null;
    }
    this.storyPlaying = false;
    this.group.parent?.remove(this.group);
  }
}
