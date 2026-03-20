import { Haptics, ImpactStyle } from '@capacitor/haptics';

export class HapticsSystem {
  private available: boolean = true;

  async tapFeedback(): Promise<void> {
    if (!this.available) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      this.available = false;
    }
  }

  async holdFeedback(): Promise<void> {
    if (!this.available) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      this.available = false;
    }
  }
}
