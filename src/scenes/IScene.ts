import * as THREE from 'three';

export interface SceneInitParams {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  container: HTMLElement;
}

export interface HitResult {
  position?: THREE.Vector3;
  uv?: THREE.Vector2;
  surface?: string;
}

export interface IScene {
  readonly id: string;
  readonly group: THREE.Object3D;
  init(params: SceneInitParams): Promise<void> | void;
  update(dt: number): void;
  /**
   * @param currentSkyboxRotationY  total applied skybox rotation in radians,
   *   including any runtime swipe-pan offset on top of the baked
   *   `skyboxRotationY`. Hotspot scenes must use this (NOT the baked value)
   *   when resolving angular hit positions or every tap after a swipe lands
   *   in the wrong place. Non-hotspot scenes can ignore it.
   */
  hitTest(ndc: THREE.Vector2, currentSkyboxRotationY?: number): HitResult | null;
  dispose(): void;
}
