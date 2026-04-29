import * as THREE from 'three';

interface TrailConfig {
  canvasSize: number;
  lineWidth: number;
  fadeRate: number;
  color: string;
}

/**
 * Canvas-based condensation trail for drag interactions + tap ripples.
 *
 * Drawing happens in UV space (0–1). The canvas is used as a texture
 * on a plane overlaying the glass. Each frame, existing marks are
 * faded using destination-out compositing.
 */
export class CondensationTrail {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private mesh: THREE.Mesh;
  private config: TrailConfig;

  // Track previous drag position for smooth line drawing
  private lastU = -1;
  private lastV = -1;
  private _dirty = false;
  private _idleFrames = 0;

  constructor(
    group: THREE.Group,
    position: THREE.Vector3,
    width: number,
    height: number,
    config: TrailConfig,
  ) {
    this.config = config;

    // Off-screen canvas for drawing trails
    this.canvas = document.createElement('canvas');
    this.canvas.width = config.canvasSize;
    this.canvas.height = config.canvasSize;
    this.ctx = this.canvas.getContext('2d')!;

    this.texture = new THREE.CanvasTexture(this.canvas);

    const material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const geometry = new THREE.PlaneGeometry(width, height);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.mesh.position.z += 0.015; // in front of rain overlay
    this.mesh.renderOrder = 10;

    group.add(this.mesh);
  }

  /** Draw a line segment at UV coordinates (called each drag move) */
  draw(u: number, v: number): void {
    const s = this.config.canvasSize;
    const x = u * s;
    const y = (1 - v) * s; // flip Y — canvas origin is top-left

    if (this.lastU >= 0) {
      const lx = this.lastU * s;
      const ly = (1 - this.lastV) * s;

      this.ctx.strokeStyle = this.config.color;
      this.ctx.lineWidth = this.config.lineWidth;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.ctx.beginPath();
      this.ctx.moveTo(lx, ly);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
    }

    this.lastU = u;
    this.lastV = v;
    this._dirty = true;
    this._idleFrames = 0;
  }

  /** Draw a soft radial ripple at UV coordinates (called on tap) */
  drawRipple(u: number, v: number, radius: number, opacity: number): void {
    const s = this.config.canvasSize;
    const x = u * s;
    const y = (1 - v) * s;

    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(200, 220, 255, ${opacity})`);
    gradient.addColorStop(0.5, `rgba(200, 220, 255, ${opacity * 0.3})`);
    gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this._dirty = true;
    this._idleFrames = 0;
  }

  /** Reset drag tracking (call on pointer up) */
  endDrag(): void {
    this.lastU = -1;
    this.lastV = -1;
  }

  /** Fade existing trails and update the texture (call every frame) */
  update(): void {
    this._idleFrames++;
    if (this._idleFrames <= 100) {
      // Erase existing content gradually using destination-out
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.globalAlpha = this.config.fadeRate;
      this.ctx.fillRect(0, 0, this.config.canvasSize, this.config.canvasSize);
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.globalAlpha = 1;
      this._dirty = true;
    }

    if (this._dirty) {
      this.texture.needsUpdate = true;
      this._dirty = false;
    }
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.config.canvasSize, this.config.canvasSize);
    this.texture.needsUpdate = true;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.texture.dispose();
  }
}
