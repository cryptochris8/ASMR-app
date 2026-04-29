import { UIPanel } from './UIPanel';
import { Store } from '../game/state';
import { CONFIG } from '../game/config';
import { SubscriptionManager } from '../game/subscription';

export class PaywallScreen extends UIPanel {
  private store: Store;
  private subscriptionManager: SubscriptionManager;
  private onClose: () => void;
  private escapeHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(
    container: HTMLElement,
    store: Store,
    subscriptionManager: SubscriptionManager,
    onClose: () => void,
  ) {
    super(container, 'paywall-screen');
    this.store = store;
    this.subscriptionManager = subscriptionManager;
    this.onClose = onClose;
    this.applyStyles();
  }

  show(): void {
    this.store.update({
      paywallShown: true,
      paywallTriggerCount: this.store.state.paywallTriggerCount + 1,
    });
    this.render();
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-labelledby', 'paywall-title');
    this.element.style.display = 'flex';
    requestAnimationFrame(() => { this.element.style.opacity = '1'; });
    this.escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hide();
        this.onClose();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  hide(): void {
    this.element.style.opacity = '0';
    setTimeout(() => { this.element.style.display = 'none'; }, 400);
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
  }

  shouldTrigger(): boolean {
    const { sessionCount, paywallTriggerCount, subscriptionTier } = this.store.state;
    if (subscriptionTier === 'premium') return false;
    if (sessionCount < CONFIG.paywallMinSessions) return false;
    if (paywallTriggerCount >= CONFIG.paywallMaxShowsPerDay) return false;
    return true;
  }

  protected render(): void {
    // Trial wiring: integrates with RevenueCat introductory offer in Phase 5.
    let trialEnabled = true;

    this.element.innerHTML = `
      <div class="paywall-content">
        <div class="paywall-hero">
          <div class="paywall-glow"></div>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="${CONFIG.colors.premium}" stroke-width="2" opacity="0.6"/>
            <circle cx="32" cy="32" r="18" stroke="${CONFIG.colors.premiumGlow}" stroke-width="1.5" opacity="0.4"/>
            <circle cx="32" cy="32" r="8" fill="${CONFIG.colors.premium}" opacity="0.9"/>
          </svg>
        </div>

        <h1 class="paywall-headline" id="paywall-title">Unlock the Full<br>Sleep Experience</h1>
        <p class="paywall-subheadline">Premium scenes, better sleep tools, unlimited presets</p>

        <div class="paywall-trial-row">
          <span class="paywall-trial-label">Try free for 7 days</span>
          <input type="checkbox" class="paywall-trial-toggle" checked aria-label="Enable 7-day free trial"/>
        </div>

        <div class="paywall-benefits">
          <div class="paywall-benefit">All sound scenes & environments</div>
          <div class="paywall-benefit">Premium ambient sound packs</div>
          <div class="paywall-benefit">Unlimited sleep timer & presets</div>
          <div class="paywall-benefit">Advanced sound mixer</div>
          <div class="paywall-benefit">New content updates</div>
        </div>

        <div class="paywall-plans">
          <button class="paywall-plan" data-plan="monthly">
            <span class="plan-label">Monthly</span>
            <span class="plan-price">$${CONFIG.monthlyPrice}/mo</span>
          </button>
          <button class="paywall-plan best-value" data-plan="yearly">
            <span class="plan-badge plan-trial-badge">7-day free trial</span>
            <span class="plan-label">Yearly</span>
            <span class="plan-price">$${CONFIG.yearlyPrice}/yr</span>
            <span class="plan-savings">Save 50%</span>
          </button>
        </div>

        <button class="paywall-cta">Start Premium</button>
        <button class="paywall-skip">Continue Free</button>

        <div class="paywall-footer">
          <button class="paywall-restore">Restore Purchases</button>
          <span class="paywall-terms">Terms & Privacy</span>
        </div>
      </div>
    `;

    let selectedPlan: 'monthly' | 'yearly' = 'yearly';

    const trialToggle = this.element.querySelector('.paywall-trial-toggle') as HTMLInputElement;
    const trialBadge = this.element.querySelector('.plan-trial-badge') as HTMLElement;

    const updateTrialUI = () => {
      trialEnabled = trialToggle.checked;
      if (trialBadge) {
        trialBadge.textContent = trialEnabled ? '7-day free trial' : 'Best Value';
      }
    };

    trialToggle?.addEventListener('change', updateTrialUI);

    this.element.querySelectorAll('.paywall-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        this.element.querySelectorAll('.paywall-plan').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedPlan = btn.getAttribute('data-plan') as 'monthly' | 'yearly';
      });
    });

    this.element.querySelector('.paywall-plan.best-value')?.classList.add('selected');

    this.element.querySelector('.paywall-cta')?.addEventListener('click', async () => {
      if (selectedPlan === 'yearly') {
        await this.subscriptionManager.purchaseYearly();
      } else {
        await this.subscriptionManager.purchaseMonthly();
      }
    });

    this.element.querySelector('.paywall-skip')?.addEventListener('click', () => {
      this.hide();
      this.onClose();
    });

    this.element.querySelector('.paywall-restore')?.addEventListener('click', () => {
      this.subscriptionManager.restorePurchases();
    });
  }

  private applyStyles(): void {
    if (document.querySelector('#paywall-styles')) return;
    const style = document.createElement('style');
    style.id = 'paywall-styles';
    style.textContent = `
      .paywall-screen {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: ${CONFIG.colors.background};
        display: flex; align-items: center; justify-content: center;
        z-index: 7000; opacity: 0;
        transition: opacity 0.4s ease;
        overflow-y: auto;
      }
      .paywall-content {
        padding: 48px 28px 40px;
        text-align: center; max-width: 400px;
        width: 100%;
      }
      .paywall-hero {
        position: relative; margin-bottom: 28px;
        display: flex; justify-content: center;
      }
      .paywall-glow {
        position: absolute; width: 120px; height: 120px;
        background: radial-gradient(circle, ${CONFIG.colors.premium}20 0%, transparent 70%);
        border-radius: 50%; top: -28px; left: 50%; transform: translateX(-50%);
      }
      .paywall-headline {
        font-size: 26px; font-weight: 400;
        color: ${CONFIG.colors.text}; line-height: 1.3;
        margin-bottom: 10px;
      }
      .paywall-subheadline {
        font-size: 14px; color: ${CONFIG.colors.textMuted};
        margin-bottom: 20px;
      }
      .paywall-trial-row {
        display: flex; align-items: center; justify-content: center;
        gap: 12px; margin-bottom: 24px;
        padding: 12px 20px;
        background: ${CONFIG.colors.timerActive}12;
        border: 1px solid ${CONFIG.colors.timerActive}30;
        border-radius: 12px;
      }
      .paywall-trial-label {
        font-size: 15px; font-weight: 500;
        color: ${CONFIG.colors.timerActive};
      }
      .paywall-trial-toggle {
        width: 44px; height: 24px;
        appearance: none; -webkit-appearance: none;
        background: ${CONFIG.colors.surfaceLight};
        border-radius: 12px; cursor: pointer;
        position: relative; transition: background 0.2s;
        flex-shrink: 0;
      }
      .paywall-trial-toggle::after {
        content: ''; position: absolute;
        width: 20px; height: 20px; border-radius: 10px;
        background: ${CONFIG.colors.textMuted};
        top: 2px; left: 2px;
        transition: transform 0.2s;
      }
      .paywall-trial-toggle:checked {
        background: ${CONFIG.colors.timerActive};
      }
      .paywall-trial-toggle:checked::after {
        transform: translateX(20px);
        background: #fff;
      }
      .paywall-benefits {
        text-align: left; margin-bottom: 28px;
      }
      .paywall-benefit {
        font-size: 14px; color: ${CONFIG.colors.text};
        padding: 8px 0; padding-left: 20px; position: relative;
      }
      .paywall-benefit::before {
        content: ''; position: absolute; left: 0; top: 50%;
        transform: translateY(-50%);
        width: 8px; height: 8px; border-radius: 50%;
        background: ${CONFIG.colors.premium};
      }
      .paywall-plans {
        display: flex; gap: 10px; margin-bottom: 20px;
      }
      .paywall-plan {
        flex: 1; padding: 16px 12px;
        background: ${CONFIG.colors.surface};
        border: 2px solid ${CONFIG.colors.surfaceLight};
        border-radius: 14px; cursor: pointer;
        display: flex; flex-direction: column;
        align-items: center; gap: 4px;
        position: relative; transition: border-color 0.2s;
      }
      .paywall-plan.selected {
        border-color: ${CONFIG.colors.premium};
      }
      .plan-badge {
        position: absolute; top: -10px;
        background: ${CONFIG.colors.premium};
        color: #000; font-size: 10px; font-weight: 600;
        padding: 3px 10px; border-radius: 8px;
        letter-spacing: 0.5px;
      }
      .plan-trial-badge {
        background: ${CONFIG.colors.timerActive};
        color: #fff;
      }
      .plan-label {
        font-size: 13px; color: ${CONFIG.colors.textMuted}; font-weight: 500;
      }
      .plan-price {
        font-size: 20px; color: ${CONFIG.colors.text}; font-weight: 500;
      }
      .plan-savings {
        font-size: 11px; color: ${CONFIG.colors.premium}; font-weight: 500;
      }
      .paywall-cta {
        width: 100%; padding: 16px;
        background: ${CONFIG.colors.premium};
        border: none; border-radius: 14px;
        color: #000; font-size: 16px; font-weight: 600;
        cursor: pointer; margin-bottom: 12px;
        letter-spacing: 0.3px;
      }
      .paywall-skip {
        background: none; border: none;
        color: ${CONFIG.colors.textMuted}; font-size: 14px;
        cursor: pointer; padding: 10px;
        margin-bottom: 20px;
      }
      .paywall-footer {
        display: flex; justify-content: center; gap: 20px;
      }
      .paywall-restore, .paywall-terms {
        background: none; border: none;
        color: ${CONFIG.colors.textDim}; font-size: 12px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }
}
