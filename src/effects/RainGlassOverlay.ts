import * as THREE from 'three';

interface RainOverlayConfig {
  scrollSpeed: number;
  opacity: number;
  streakCount: number;
  dropletCount: number;
  textureSize: number;
  layers: number;
  layerSpeedRatio: number;
}

/**
 * Animated rain-on-glass overlay.
 *
 * Creates procedural canvas textures with rain streaks/droplets,
 * then scrolls them downward at different speeds per layer.
 * Uses additive blending for a soft, subtle glow effect.
 */
export class RainGlassOverlay {
  private planes: THREE.Mesh[] = [];
  private textures: THREE.CanvasTexture[] = [];
  private scrollSpeeds: number[] = [];

  constructor(
    group: THREE.Group,
    position: THREE.Vector3,
    width: number,
    height: number,
    config: RainOverlayConfig,
  ) {
    for (let layer = 0; layer < config.layers; layer++) {
      const canvas = this.createRainCanvas(
        config.textureSize,
        config.streakCount,
        config.dropletCount,
      );
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: config.opacity / (layer + 1),
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });

      const geometry = new THREE.PlaneGeometry(width, height);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.copy(position);
      mesh.position.z += 0.005 * (layer + 1); // slight offset per layer
      mesh.renderOrder = 1 + layer;

      group.add(mesh);
      this.planes.push(mesh);
      this.textures.push(texture);
      this.scrollSpeeds.push(
        config.scrollSpeed * Math.pow(config.layerSpeedRatio, layer),
      );
    }
  }

  /** Generate a canvas with random rain streaks and droplets */
  private createRainCanvas(
    size: number,
    streakCount: number,
    dropletCount: number,
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, size, size);

    // Streaks — thin, slightly curved vertical lines
    for (let i = 0; i < streakCount; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const length = 20 + Math.random() * 80;
      const width = 0.5 + Math.random() * 1.5;
      const alpha = 0.1 + Math.random() * 0.4;

      ctx.strokeStyle = `rgba(200, 220, 255, ${alpha})`;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(x, y);
      const curve = (Math.random() - 0.5) * 8;
      ctx.quadraticCurveTo(
        x + curve * 0.5,
        y + length * 0.5,
        x + curve,
        y + length,
      );
      ctx.stroke();
    }

    // Small droplets
    for (let i = 0; i < dropletCount; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 0.5 + Math.random() * 2;
      const alpha = 0.1 + Math.random() * 0.3;

      ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  }

  /** Call every frame — scrolls the rain texture downward */
  update(dt: number): void {
    for (let i = 0; i < this.textures.length; i++) {
      this.textures[i].offset.y -= this.scrollSpeeds[i] * dt;
    }
  }

  dispose(): void {
    for (const mesh of this.planes) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    for (const tex of this.textures) {
      tex.dispose();
    }
    this.planes = [];
    this.textures = [];
  }
}
