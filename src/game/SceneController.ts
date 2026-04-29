import * as THREE from 'three';
import { SceneId } from './state';
import { IScene } from '../scenes/IScene';
import { disposeGroup } from '../render/scene';

export class SceneController {
  private threeScene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private container: HTMLElement;

  private registry = new Map<SceneId, () => IScene>();
  private _current: IScene | null = null;

  constructor(
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    container: HTMLElement,
  ) {
    this.threeScene = scene;
    this.camera = camera;
    this.container = container;
  }

  register(id: SceneId, factory: () => IScene): void {
    this.registry.set(id, factory);
  }

  async load(id: SceneId): Promise<IScene> {
    this.disposeCurrent();

    const factory = this.registry.get(id);
    if (!factory) throw new Error(`SceneController: no factory registered for "${id}"`);

    const scene = factory();
    await scene.init({
      scene: this.threeScene,
      camera: this.camera,
      container: this.container,
    });
    this._current = scene;
    return scene;
  }

  current(): IScene | null {
    return this._current;
  }

  update(dt: number): void {
    this._current?.update(dt);
  }

  disposeCurrent(): void {
    if (!this._current) return;
    try {
      this._current.dispose();
    } catch {
      // Fallback: manually traverse and dispose if the scene's dispose threw
      disposeGroup(this._current.group);
      this._current.group.parent?.remove(this._current.group);
    }
    this._current = null;
  }
}
