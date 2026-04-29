import { UIPanel } from './UIPanel';
import { CONFIG } from '../game/config';

export class SplashScreen extends UIPanel {
  private onComplete: () => void;

  constructor(container: HTMLElement, onComplete: () => void) {
    super(container, 'splash-screen');
    this.onComplete = onComplete;
    this.applyStyles();
    this.startSplash();
  }

  protected render(): void {
    this.element.innerHTML = `
      <div class="splash-content">
        <div class="splash-logo">
          <div class="splash-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="${CONFIG.colors.primary}" stroke-width="2" opacity="0.6"/>
              <circle cx="32" cy="32" r="18" stroke="${CONFIG.colors.primaryLight}" stroke-width="1.5" opacity="0.4"/>
              <circle cx="32" cy="32" r="8" fill="${CONFIG.colors.primary}" opacity="0.8"/>
            </svg>
          </div>
          <h1 class="splash-title">ASMR Sleep</h1>
        </div>
        <p class="splash-tagline">Relax. Breathe. Sleep.</p>
        <div class="splash-loader">
          <div class="splash-loader-bar"></div>
        </div>
      </div>
    `;
  }

  private startSplash(): void {
    this.render();
    this.element.style.display = '';
    this.element.style.opacity = '1';
    setTimeout(() => this.fadeOut(), CONFIG.splashDuration);
  }

  private fadeOut(): void {
    this.element.style.opacity = '0';
    setTimeout(() => {
      this.element.remove();
      this.onComplete();
    }, 600);
  }

  private applyStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .splash-screen {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: ${CONFIG.colors.background};
        display: flex; align-items: center; justify-content: center;
        z-index: 10000;
        opacity: 1;
        transition: opacity 0.6s ease;
      }
      .splash-content {
        text-align: center;
        animation: splashFadeIn 0.8s ease forwards;
      }
      .splash-logo {
        display: flex; flex-direction: column; align-items: center; gap: 16px;
      }
      .splash-icon {
        animation: splashPulse 2s ease-in-out infinite;
      }
      .splash-title {
        font-size: 28px; font-weight: 300; letter-spacing: 4px;
        color: ${CONFIG.colors.text}; text-transform: uppercase;
      }
      .splash-tagline {
        margin-top: 20px; font-size: 15px; font-weight: 300;
        color: ${CONFIG.colors.textMuted}; letter-spacing: 2px;
      }
      .splash-loader {
        margin-top: 40px; width: 120px; height: 2px;
        background: ${CONFIG.colors.surfaceLight};
        border-radius: 1px; margin-left: auto; margin-right: auto;
        overflow: hidden;
      }
      .splash-loader-bar {
        width: 0%; height: 100%;
        background: ${CONFIG.colors.primary};
        border-radius: 1px;
        animation: splashLoad ${CONFIG.splashDuration}ms ease forwards;
      }
      @keyframes splashFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes splashPulse {
        0%, 100% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.05); opacity: 1; }
      }
      @keyframes splashLoad {
        from { width: 0%; }
        to { width: 100%; }
      }
    `;
    document.head.appendChild(style);
  }
}
