import { UIPanel } from './UIPanel';
import { Store } from '../game/state';
import { CONFIG } from '../game/config';
import { SubscriptionManager } from '../game/subscription';
import { nightOverlay } from './NightOverlay';

export class SettingsScreen extends UIPanel {
  private store: Store;
  private subscriptionManager: SubscriptionManager;
  private onClose: () => void;

  constructor(
    container: HTMLElement,
    store: Store,
    subscriptionManager: SubscriptionManager,
    onClose: () => void,
  ) {
    super(container, 'settings-screen');
    this.store = store;
    this.subscriptionManager = subscriptionManager;
    this.onClose = onClose;
    this.applyStyles();
  }

  show(): void {
    this.render();
    this.element.style.display = 'flex';
    requestAnimationFrame(() => { this.element.style.opacity = '1'; });
  }

  hide(): void {
    this.element.style.opacity = '0';
    setTimeout(() => { this.element.style.display = 'none'; }, 300);
  }

  protected render(): void {
    const { hapticsEnabled, timerFadeAudio, timerDimScreen, subscriptionTier, warmScreenTintEnabled } = this.store.state;
    const isPremium = subscriptionTier === 'premium';
    const warmTint = warmScreenTintEnabled;

    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-labelledby', 'settings-title');

    this.element.innerHTML = `
      <header class="settings-header">
        <button type="button" class="settings-back-btn" aria-label="Close settings and go back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colors.text}" stroke-width="1.5" aria-hidden="true" focusable="false">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="settings-title" id="settings-title">Settings</h1>
      </header>

      <div class="settings-content">
        <section class="settings-section" aria-labelledby="settings-section-sound">
          <h2 class="settings-section-label" id="settings-section-sound">Sound & Haptics</h2>
          <label class="settings-row">
            <span>Haptic Feedback</span>
            <input type="checkbox" role="switch" aria-label="Haptic Feedback" ${hapticsEnabled ? 'checked' : ''} data-setting="haptics"/>
          </label>
          <label class="settings-row">
            <span>Fade audio on timer end</span>
            <input type="checkbox" role="switch" aria-label="Fade audio on timer end" ${timerFadeAudio ? 'checked' : ''} data-setting="timerFade"/>
          </label>
          <label class="settings-row">
            <span>Dim screen on timer end</span>
            <input type="checkbox" role="switch" aria-label="Dim screen on timer end" ${timerDimScreen ? 'checked' : ''} data-setting="timerDim"/>
          </label>
        </section>

        <section class="settings-section" aria-labelledby="settings-section-display">
          <h2 class="settings-section-label" id="settings-section-display">Display</h2>
          <label class="settings-row">
            <span>Warm screen tint</span>
            <input type="checkbox" role="switch" aria-label="Warm screen tint" ${warmTint ? 'checked' : ''} data-setting="warmTint"/>
          </label>
        </section>

        <section class="settings-section" aria-labelledby="settings-section-sub">
          <h2 class="settings-section-label" id="settings-section-sub">Subscription</h2>
          <div class="settings-row">
            <span>Status</span>
            <span class="settings-value" style="color: ${isPremium ? CONFIG.colors.premium : CONFIG.colors.textMuted}">
              ${isPremium ? 'Premium' : 'Free'}
            </span>
          </div>
          ${!isPremium ? `
            <button type="button" class="settings-upgrade-btn">Upgrade to Premium</button>
          ` : ''}
          <button type="button" class="settings-restore-btn">Restore Purchases</button>
        </section>

        <section class="settings-section" aria-labelledby="settings-section-about">
          <h2 class="settings-section-label" id="settings-section-about">About</h2>
          <div class="settings-row">
            <span>Version</span>
            <span class="settings-value">1.0.0</span>
          </div>
          <button type="button" class="settings-link-btn" disabled aria-disabled="true">Privacy Policy<span class="settings-link-soon">Coming soon</span></button>
          <button type="button" class="settings-link-btn" disabled aria-disabled="true">Terms of Service<span class="settings-link-soon">Coming soon</span></button>
          <button type="button" class="settings-link-btn" disabled aria-disabled="true">Contact Support<span class="settings-link-soon">Coming soon</span></button>
          <button type="button" class="settings-replay-onboarding-btn">Replay Introduction</button>
          <button type="button" class="settings-replay-hints-btn">Replay Scene Hints</button>
        </section>
      </div>
    `;

    this.element.querySelector('.settings-back-btn')?.addEventListener('click', () => {
      this.hide();
      this.onClose();
    });

    this.element.querySelectorAll('input[data-setting]').forEach(input => {
      input.addEventListener('change', (e) => {
        const setting = (input as HTMLInputElement).getAttribute('data-setting');
        const checked = (e.target as HTMLInputElement).checked;
        if (setting === 'haptics') this.store.update({ hapticsEnabled: checked });
        else if (setting === 'timerFade') this.store.update({ timerFadeAudio: checked });
        else if (setting === 'timerDim') this.store.update({ timerDimScreen: checked });
        else if (setting === 'warmTint') {
          this.store.update({ warmScreenTintEnabled: checked });
          nightOverlay.setEnabled(checked);
        }
      });
    });

    this.element.querySelector('.settings-restore-btn')?.addEventListener('click', () => {
      this.subscriptionManager.restorePurchases();
    });

    this.element.querySelector('.settings-replay-onboarding-btn')?.addEventListener('click', () => {
      (this.store.state as any).onboardingComplete = false;
      this.store.update({ onboardingComplete: false });
      window.location.reload();
    });

    this.element.querySelector('.settings-replay-hints-btn')?.addEventListener('click', () => {
      this.store.update({ hotspotsSeenScenes: [] });
    });
  }

  private applyStyles(): void {
    if (document.querySelector('#settings-styles')) return;
    const style = document.createElement('style');
    style.id = 'settings-styles';
    style.textContent = `
      .settings-screen {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: ${CONFIG.colors.background};
        display: flex; flex-direction: column;
        z-index: 5500; opacity: 0;
        transition: opacity 0.3s ease;
        overflow-y: auto;
      }
      .settings-header {
        display: flex; align-items: center; gap: 12px;
        padding: 16px 20px;
        padding-top: max(16px, env(safe-area-inset-top, 0px) + 8px);
      }
      .settings-back-btn {
        background: none; border: none; cursor: pointer; padding: 8px;
        min-height: 44px; min-width: 44px;
        border-radius: 12px;
        display: inline-flex; align-items: center; justify-content: center;
        transition: background 0.4s ease, transform 0.3s ease;
      }
      .settings-back-btn:hover { background: ${CONFIG.colors.surfaceLight}40; }
      .settings-back-btn:active { transform: scale(0.94); }
      .settings-back-btn:focus-visible { outline-color: ${CONFIG.colors.primary}; }
      .settings-title {
        font-size: 20px; font-weight: 400;
        color: ${CONFIG.colors.text};
        margin: 0;
      }
      .settings-content {
        padding: 0 24px 40px;
      }
      .settings-section {
        margin-bottom: 28px;
      }
      .settings-section-label {
        font-size: 11px; color: ${CONFIG.colors.textMuted};
        text-transform: uppercase; letter-spacing: 1px;
        margin: 0 0 12px; font-weight: 500;
      }
      .settings-row {
        display: flex; align-items: center;
        justify-content: space-between;
        padding: 14px 0;
        border-bottom: 1px solid ${CONFIG.colors.surfaceLight}40;
        font-size: 14px; color: ${CONFIG.colors.text};
        cursor: pointer;
        min-height: 48px;
      }
      .settings-value {
        font-size: 14px; color: ${CONFIG.colors.textMuted};
      }
      .settings-row input[type="checkbox"] {
        width: 44px; height: 24px;
        appearance: none; -webkit-appearance: none;
        background: ${CONFIG.colors.surfaceLight};
        border-radius: 12px; cursor: pointer;
        position: relative;
        transition: background 0.4s ease;
        flex-shrink: 0;
      }
      .settings-row input[type="checkbox"]::after {
        content: ''; position: absolute;
        width: 20px; height: 20px; border-radius: 10px;
        background: ${CONFIG.colors.textMuted};
        top: 2px; left: 2px;
        transition: transform 0.3s ease, background 0.4s ease;
      }
      .settings-row input[type="checkbox"]:checked {
        background: ${CONFIG.colors.primary};
      }
      .settings-row input[type="checkbox"]:checked::after {
        transform: translateX(20px);
        background: #fff;
      }
      .settings-row input[type="checkbox"]:focus-visible {
        outline-color: ${CONFIG.colors.primary};
        outline-offset: 4px;
      }
      .settings-upgrade-btn {
        width: 100%; padding: 14px; margin: 8px 0;
        background: ${CONFIG.colors.premium}20;
        border: 1px solid ${CONFIG.colors.premium}40;
        border-radius: 12px;
        color: ${CONFIG.colors.premium}; font-size: 14px; font-weight: 500;
        cursor: pointer;
        min-height: 48px;
        transition: background 0.4s ease, border-color 0.4s ease;
      }
      .settings-upgrade-btn:hover { background: ${CONFIG.colors.premium}30; border-color: ${CONFIG.colors.premium}60; }
      .settings-upgrade-btn:focus-visible { outline-color: ${CONFIG.colors.premium}; }
      .settings-restore-btn {
        width: 100%; padding: 12px;
        background: none; border: none;
        color: ${CONFIG.colors.primary}; font-size: 14px;
        cursor: pointer; text-align: center;
        min-height: 44px;
        border-radius: 8px;
        transition: background 0.4s ease;
      }
      .settings-restore-btn:hover { background: ${CONFIG.colors.primary}12; }
      .settings-restore-btn:focus-visible { outline-color: ${CONFIG.colors.primary}; }
      .settings-link-btn {
        display: flex; width: 100%;
        align-items: center; justify-content: space-between;
        padding: 14px 0; text-align: left;
        background: none; border: none;
        border-bottom: 1px solid ${CONFIG.colors.surfaceLight}40;
        color: ${CONFIG.colors.text}; font-size: 14px;
        cursor: pointer;
        min-height: 48px;
        transition: color 0.4s ease;
      }
      .settings-link-btn:hover:not(:disabled) { color: ${CONFIG.colors.primaryLight}; }
      .settings-link-btn:focus-visible {
        outline-color: ${CONFIG.colors.primary};
        outline-offset: 0;
      }
      .settings-link-btn:disabled {
        color: ${CONFIG.colors.textMuted};
        cursor: not-allowed;
      }
      .settings-link-soon {
        font-size: 11px; color: ${CONFIG.colors.textDim};
        background: ${CONFIG.colors.surfaceLight}40;
        padding: 3px 8px; border-radius: 8px;
        letter-spacing: 0.3px; font-weight: 500;
      }
      .settings-replay-onboarding-btn,
      .settings-replay-hints-btn {
        display: block; width: 100%;
        padding: 14px 0; text-align: left;
        background: none; border: none;
        color: ${CONFIG.colors.textMuted}; font-size: 14px;
        cursor: pointer; margin-top: 4px;
        min-height: 44px;
        transition: color 0.4s ease;
      }
      .settings-replay-onboarding-btn:hover,
      .settings-replay-hints-btn:hover { color: ${CONFIG.colors.text}; }
      .settings-replay-onboarding-btn:focus-visible,
      .settings-replay-hints-btn:focus-visible { outline-color: ${CONFIG.colors.primary}; }
    `;
    document.head.appendChild(style);
  }
}
