/**
 * Subtle gyroscope-based look-around + gentle auto-pan.
 *
 * On mobile: tilting the device shifts the skybox view.
 * On desktop (no gyro): a slow sine-wave drift keeps the scene alive.
 *
 * Does NOT rotate the camera — only provides offsets applied to
 * scene.backgroundRotation so 3D objects stay unaffected.
 */
export class GyroLookSystem {
  private gyroYaw = 0;
  private gyroPitch = 0;
  private smoothYaw = 0;
  private smoothPitch = 0;
  private autoPanAngle = 0;
  private hasGyro = false;
  private listening = false;
  private initialAlpha: number | null = null;
  private initialBeta: number | null = null;

  // How far the user can look by tilting (~17° yaw, ~8° pitch)
  private readonly maxYaw = 0.3;
  private readonly maxPitch = 0.15;
  // Smoothing factor (lower = smoother/slower response)
  private readonly smoothing = 0.08;
  // Auto-pan: gentle drift speed and amplitude
  private readonly autoPanSpeed = 0.015;
  private readonly autoPanRange = 0.08; // ~4.5° gentle sway

  /**
   * Must be called from a user gesture (tap/click) for iOS permission.
   * Safe to call multiple times — only initializes once.
   */
  async enable(): Promise<void> {
    if (this.listening) return;

    // iOS 13+ requires explicit permission
    const DOE = DeviceOrientationEvent as any;
    if (typeof DOE.requestPermission === 'function') {
      try {
        const result = await DOE.requestPermission();
        if (result !== 'granted') return;
      } catch {
        return;
      }
    }

    this.listening = true;
    window.addEventListener('deviceorientation', this.onOrientation);
  }

  private onOrientation = (e: DeviceOrientationEvent): void => {
    if (e.alpha === null || e.beta === null) return;

    this.hasGyro = true;

    // First reading becomes baseline
    if (this.initialAlpha === null) {
      this.initialAlpha = e.alpha;
      this.initialBeta = e.beta;
    }

    // Delta from baseline
    let dAlpha = e.alpha - this.initialAlpha;
    const dBeta = (e.beta ?? 0) - (this.initialBeta ?? 0);

    // Wrap around ±180°
    if (dAlpha > 180) dAlpha -= 360;
    if (dAlpha < -180) dAlpha += 360;

    // Convert to radians and clamp
    this.gyroYaw = Math.max(-this.maxYaw, Math.min(this.maxYaw, (dAlpha * Math.PI) / 180));
    this.gyroPitch = Math.max(-this.maxPitch, Math.min(this.maxPitch, (dBeta * Math.PI) / 180));
  };

  /** Call every frame with delta time */
  update(dt: number): void {
    // Auto-pan always runs (gives life even without gyro)
    this.autoPanAngle += dt * this.autoPanSpeed;

    // Smooth the gyro input
    if (this.hasGyro) {
      this.smoothYaw += (this.gyroYaw - this.smoothYaw) * this.smoothing;
      this.smoothPitch += (this.gyroPitch - this.smoothPitch) * this.smoothing;
    }
  }

  /** Y-axis offset (left/right) to add to backgroundRotation */
  getYawOffset(): number {
    const autoPan = Math.sin(this.autoPanAngle) * this.autoPanRange;
    return this.smoothYaw + autoPan;
  }

  /** X-axis offset (up/down) to add to backgroundRotation */
  getPitchOffset(): number {
    return this.smoothPitch;
  }

  /** Reset baseline — call when entering a new scene */
  recalibrate(): void {
    this.initialAlpha = null;
    this.initialBeta = null;
    this.smoothYaw = 0;
    this.smoothPitch = 0;
  }

  dispose(): void {
    window.removeEventListener('deviceorientation', this.onOrientation);
    this.listening = false;
  }
}
