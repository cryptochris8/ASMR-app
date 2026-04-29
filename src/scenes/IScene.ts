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
  hitTest(ndc: THREE.Vector2): HitResult | null;
  dispose(): void;
}
