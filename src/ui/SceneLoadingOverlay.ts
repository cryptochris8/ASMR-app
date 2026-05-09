import { CONFIG } from '../game/config';

/**
 * Subtle full-screen overlay shown during scene transitions while
 * skybox JPGs and audio assets load. Designed to be calm — no spinners,
 * just a soft pulsing dot. Auto-respects prefers-reduced-motion.
 */
class SceneLoadingOverlayImpl {
  private el: HTMLDivElement | null = null;
  private errorTimer: number | null = null;

  private ensureMounted(): void {
    if (this.el) return;
    this.applyStyles();
    this.el = document.createElement('div');
    this.el.className = 'scene-loading-overlay';
    this.el.setAttribute('role', 'status');
    this.el.setAttribute('aria-live', 'polite');
    this.el.innerHTML = `
      <div class="scene-loading-dot" aria-hidden="true"></div>
      <span class="scene-loading-label">Loading scene</span>
    `;
    document.body.appendChild(this.el);
  }

  show(label = 'Loading scene'): void {
    this.ensureMounted();
    if (!this.el) return;
    if (this.errorTimer) {
      clearTimeout(this.errorTimer);
      this.errorTimer = null;
    }
    this.el.classList.remove('error');
    const labelEl = this.el.querySelector('.scene-loading-label');
    if (labelEl) labelEl.textContent = label;
    this.el.style.display = 'flex';
    requestAnimationFrame(() => {
      if (this.el) this.el.style.opacity = '1';
    });
  }

  hide(): void {
    if (!this.el) return;
    this.el.style.opacity = '0';
    setTimeout(() => {
      if (this.el && !this.el.classList.contains('error')) {
        this.el.style.display = 'none';
      }
    }, 400);
  }

  showError(message = "Couldn't load that scene"): void {
    this.ensureMounted();
    if (!this.el) return;
    this.el.classList.add('error');
    const labelEl = this.el.querySelector('.scene-loading-label');
    if (labelEl) labelEl.textContent = message;
    this.el.style.display = 'flex';
    requestAnimationFrame(() => {
      if (this.el) this.el.style.opacity = '1';
    });
    if (this.errorTimer) clearTimeout(this.errorTimer);
    this.errorTimer = window.setTimeout(() => {
      this.hide();
      this.errorTimer = null;
    }, 3500);
  }

  private applyStyles(): void {
    if (document.querySelector('#scene-loading-overlay-styles')) return;
    const style = document.createElement('style');
    style.id = 'scene-loading-overlay-styles';
    style.textContent = `
      .scene-loading-overlay {
        position: fixed; inset: 0;
        display: none; flex-direction: column;
        align-items: center; justify-content: center;
        gap: 18px;
        background: ${CONFIG.colors.background}cc;
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 8500;
        opacity: 0;
        transition: opacity 0.4s ease;
        pointer-events: none;
      }
      .scene-loading-dot {
        width: 14px; height: 14px; border-radius: 50%;
        background: ${CONFIG.colors.primary};
        animation: scene-loading-pulse 1.6s ease-in-out infinite;
      }
      .scene-loading-label {
        font-size: 13px; color: ${CONFIG.colors.textMuted};
        letter-spacing: 1px; text-transform: uppercase;
        font-weight: 500;
      }
      .scene-loading-overlay.error .scene-loading-dot {
        background: ${CONFIG.colors.danger};
        animation: none;
        opacity: 0.85;
      }
      .scene-loading-overlay.error .scene-loading-label {
        color: ${CONFIG.colors.text};
        text-transform: none;
        letter-spacing: 0.3px;
        font-size: 14px;
      }
      @keyframes scene-loading-pulse {
        0%, 100% { transform: scale(0.7); opacity: 0.5; }
        50%      { transform: scale(1.0); opacity: 1.0; }
      }
      @media (prefers-reduced-motion: reduce) {
        .scene-loading-dot { animation: none; opacity: 0.85; }
        .scene-loading-overlay { transition: none; }
      }
    `;
    document.head.appendChild(style);
  }
}

export const sceneLoadingOverlay = new SceneLoadingOverlayImpl();
