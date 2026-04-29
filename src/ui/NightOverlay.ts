export class NightOverlay {
  private el: HTMLDivElement;

  constructor() {
    this.el = document.createElement('div');
    this.el.id = 'night-overlay';
    this.el.style.cssText =
      'position:fixed;inset:0;pointer-events:none;background:rgba(255,140,20,0);' +
      'transition:background 1s ease;z-index:9999;';
    document.body.appendChild(this.el);
  }

  setEnabled(on: boolean): void {
    this.setIntensity(on ? 0.08 : 0);
  }

  setIntensity(alpha: number): void {
    this.el.style.background = `rgba(255,140,20,${alpha})`;
  }
}

export const nightOverlay = new NightOverlay();
