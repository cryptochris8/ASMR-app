import { Store } from '../game/state';
import { CONFIG } from '../game/config';
import { SubscriptionManager } from '../game/subscription';

export class SettingsScreen {
  private el: HTMLElement;
  private store: Store;
  private subscriptionManager: SubscriptionManager;
  private onClose: () => void;

  constructor(
    container: HTMLElement,
    store: Store,
    subscriptionManager: SubscriptionManager,
    onClose: () => void,
  ) {
    this.store = store;
    this.subscriptionManager = subscriptionManager;
    this.onClose = onClose;

    this.el = document.createElement('div');
    this.el.className = 'settings-screen';
    this.el.style.display = 'none';
    container.appendChild(this.el);

    this.applyStyles();
  }

  show(): void {
    this.render();
    this.el.style.display = 'flex';
    requestAnimationFrame(() => {
      this.el.style.opacity = '1';
    });
  }

  hide(): void {
    this.el.style.opacity = '0';
    setTimeout(() => {
      this.el.style.display = 'none';
    }, 300);
  }

  private render(): void {
    const { hapticsEnabled, timerFadeAudio, timerDimScreen, subscriptionTier } = this.store.state;
    const isPremium = subscriptionTier === 'premium';

    this.el.innerHTML = `
      <div class="settings-header">
        <button class="settings-back-btn" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colors.text}" stroke-width="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="settings-title">Settings</h1>
      </div>

      <div class="settings-content">
        <div class="settings-section">
          <div class="settings-section-label">Sound & Haptics</div>
          <label class="settings-row">
            <span>Haptic Feedback</span>
            <input type="checkbox" ${hapticsEnabled ? 'checked' : ''} data-setting="haptics"/>
          </label>
          <label class="settings-row">
            <span>Fade audio on timer end</span>
            <input type="checkbox" ${timerFadeAudio ? 'checked' : ''} data-setting="timerFade"/>
          </label>
          <label class="settings-row">
            <span>Dim screen on timer end</span>
            <input type="checkbox" ${timerDimScreen ? 'checked' : ''} data-setting="timerDim"/>
          </label>
        </div>

        <div class="settings-section">
          <div class="settings-section-label">Subscription</div>
          <div class="settings-row">
            <span>Status</span>
            <span class="settings-value" style="color: ${isPremium ? CONFIG.colors.premium : CONFIG.colors.textMuted}">
              ${isPremium ? 'Premium' : 'Free'}
            </span>
          </div>
          ${!isPremium ? `
            <button class="settings-upgrade-btn">Upgrade to Premium</button>
          ` : ''}
          <button class="settings-restore-btn">Restore Purchases</button>
        </div>

        <div class="settings-section">
          <div class="settings-section-label">About</div>
          <div class="settings-row">
            <span>Version</span>
            <span class="settings-value">1.0.0</span>
          </div>
          <button class="settings-link-btn">Privacy Policy</button>
          <button class="settings-link-btn">Terms of Service</button>
          <button class="settings-link-btn">Contact Support</button>
        </div>
      </div>
    `;

    // Bind events
    this.el.querySelector('.settings-back-btn')?.addEventListener('click', () => {
      this.hide();
      this.onClose();
    });

    this.el.querySelectorAll('input[data-setting]').forEach(input => {
      input.addEventListener('change', (e) => {
        const setting = (input as HTMLInputElement).getAttribute('data-setting');
        const checked = (e.target as HTMLInputElement).checked;
        if (setting === 'haptics') this.store.update({ hapticsEnabled: checked });
        else if (setting === 'timerFade') this.store.update({ timerFadeAudio: checked });
        else if (setting === 'timerDim') this.store.update({ timerDimScreen: checked });
      });
    });

    this.el.querySelector('.settings-restore-btn')?.addEventListener('click', () => {
      this.subscriptionManager.restorePurchases();
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
      }
      .settings-title {
        font-size: 20px; font-weight: 400;
        color: ${CONFIG.colors.text};
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
        margin-bottom: 12px; font-weight: 500;
      }
      .settings-row {
        display: flex; align-items: center;
        justify-content: space-between;
        padding: 14px 0;
        border-bottom: 1px solid ${CONFIG.colors.surfaceLight}40;
        font-size: 14px; color: ${CONFIG.colors.text};
        cursor: pointer;
      }
      .settings-value {
        font-size: 14px; color: ${CONFIG.colors.textMuted};
      }
      .settings-row input[type="checkbox"] {
        width: 44px; height: 24px;
        appearance: none; -webkit-appearance: none;
        background: ${CONFIG.colors.surfaceLight};
        border-radius: 12px; cursor: pointer;
        position: relative; transition: background 0.2s;
      }
      .settings-row input[type="checkbox"]::after {
        content: ''; position: absolute;
        width: 20px; height: 20px; border-radius: 10px;
        background: ${CONFIG.colors.textMuted};
        top: 2px; left: 2px;
        transition: transform 0.2s;
      }
      .settings-row input[type="checkbox"]:checked {
        background: ${CONFIG.colors.primary};
      }
      .settings-row input[type="checkbox"]:checked::after {
        transform: translateX(20px);
        background: #fff;
      }
      .settings-upgrade-btn {
        width: 100%; padding: 14px; margin: 8px 0;
        background: ${CONFIG.colors.premium}20;
        border: 1px solid ${CONFIG.colors.premium}40;
        border-radius: 12px;
        color: ${CONFIG.colors.premium}; font-size: 14px; font-weight: 500;
        cursor: pointer;
      }
      .settings-restore-btn {
        width: 100%; padding: 12px;
        background: none; border: none;
        color: ${CONFIG.colors.primary}; font-size: 14px;
        cursor: pointer; text-align: center;
      }
      .settings-link-btn {
        display: block; width: 100%;
        padding: 14px 0; text-align: left;
        background: none; border: none;
        border-bottom: 1px solid ${CONFIG.colors.surfaceLight}40;
        color: ${CONFIG.colors.text}; font-size: 14px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }
}
