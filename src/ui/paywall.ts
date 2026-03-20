import { Store } from '../game/state';
import { CONFIG } from '../game/config';
import { SubscriptionManager } from '../game/subscription';

export class PaywallScreen {
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
    this.el.className = 'paywall-screen';
    this.el.style.display = 'none';
    container.appendChild(this.el);

    this.applyStyles();
  }

  show(): void {
    this.store.update({
      paywallShown: true,
      paywallTriggerCount: this.store.state.paywallTriggerCount + 1,
    });
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
    }, 400);
  }

  shouldTrigger(): boolean {
    const { sessionCount, paywallTriggerCount, subscriptionTier } = this.store.state;
    if (subscriptionTier === 'premium') return false;
    if (sessionCount < CONFIG.paywallMinSessions) return false;
    if (paywallTriggerCount >= CONFIG.paywallMaxShowsPerDay) return false;
    return true;
  }

  private render(): void {
    this.el.innerHTML = `
      <div class="paywall-content">
        <div class="paywall-hero">
          <div class="paywall-glow"></div>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="28" stroke="${CONFIG.colors.premium}" stroke-width="2" opacity="0.6"/>
            <circle cx="32" cy="32" r="18" stroke="${CONFIG.colors.premiumGlow}" stroke-width="1.5" opacity="0.4"/>
            <circle cx="32" cy="32" r="8" fill="${CONFIG.colors.premium}" opacity="0.9"/>
          </svg>
        </div>

        <h1 class="paywall-headline">Unlock the Full<br>Sleep Experience</h1>
        <p class="paywall-subheadline">Premium scenes, better sleep tools, unlimited presets</p>

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
            <span class="plan-badge">Best Value</span>
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

    // Bind events
    let selectedPlan: 'monthly' | 'yearly' = 'yearly';

    this.el.querySelectorAll('.paywall-plan').forEach(btn => {
      btn.addEventListener('click', () => {
        this.el.querySelectorAll('.paywall-plan').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedPlan = btn.getAttribute('data-plan') as 'monthly' | 'yearly';
      });
    });

    // Auto-select yearly
    this.el.querySelector('.paywall-plan.best-value')?.classList.add('selected');

    this.el.querySelector('.paywall-cta')?.addEventListener('click', async () => {
      if (selectedPlan === 'yearly') {
        await this.subscriptionManager.purchaseYearly();
      } else {
        await this.subscriptionManager.purchaseMonthly();
      }
    });

    this.el.querySelector('.paywall-skip')?.addEventListener('click', () => {
      this.hide();
      this.onClose();
    });

    this.el.querySelector('.paywall-restore')?.addEventListener('click', () => {
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
        margin-bottom: 28px;
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
      .paywall-plan.best-value .plan-badge {
        position: absolute; top: -10px;
        background: ${CONFIG.colors.premium};
        color: #000; font-size: 10px; font-weight: 600;
        padding: 3px 10px; border-radius: 8px;
        letter-spacing: 0.5px;
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
