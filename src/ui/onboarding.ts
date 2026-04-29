import { CONFIG } from '../game/config';

const PAGES = [
  {
    icon: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="30" stroke="${CONFIG.colors.primary}" stroke-width="1.5" opacity="0.5"/>
      <path d="M36 20 C28 28, 28 44, 36 52 C44 44, 44 28, 36 20Z" stroke="${CONFIG.colors.primaryLight}" stroke-width="1.5" fill="${CONFIG.colors.primary}30"/>
      <path d="M20 36 C28 28, 44 28, 52 36 C44 44, 28 44, 20 36Z" stroke="${CONFIG.colors.primaryLight}" stroke-width="1.5" fill="${CONFIG.colors.primary}20"/>
    </svg>`,
    heading: 'Tap & drag to interact.',
    body: 'Touch the scene to trigger sounds and create condensation trails on the glass.',
  },
  {
    icon: `<svg width="72" height="72" viewBox="0 0 72 72" fill="none">
      <circle cx="36" cy="36" r="28" stroke="${CONFIG.colors.timerActive}" stroke-width="1.5" opacity="0.5"/>
      <circle cx="36" cy="36" r="18" stroke="${CONFIG.colors.timerActive}" stroke-width="1" opacity="0.3"/>
      <line x1="36" y1="20" x2="36" y2="36" stroke="${CONFIG.colors.timerActive}" stroke-width="2" stroke-linecap="round"/>
      <line x1="36" y1="36" x2="46" y2="42" stroke="${CONFIG.colors.timerActive}" stroke-width="2" stroke-linecap="round"/>
      <circle cx="36" cy="36" r="3" fill="${CONFIG.colors.timerActive}"/>
    </svg>`,
    heading: 'Set a sleep timer to fade out.',
    body: 'The app will gently fade audio and dim the screen so you drift off naturally.',
  },
];

export class OnboardingScreen {
  private el: HTMLDivElement;
  private currentPage = 0;
  private onCompleteCb: (() => void) | null = null;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'onboarding-screen';
    this.el.style.display = 'none';
    container.appendChild(this.el);
    this.applyStyles();
  }

  show(onComplete: () => void): void {
    this.onCompleteCb = onComplete;
    this.currentPage = 0;
    this.render();
    this.el.setAttribute('role', 'dialog');
    this.el.setAttribute('aria-modal', 'true');
    this.el.setAttribute('aria-labelledby', 'onboarding-heading');
    this.el.style.display = 'flex';
    requestAnimationFrame(() => { this.el.style.opacity = '1'; });

    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', escHandler);
        this.finish();
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  hide(): void {
    this.el.style.opacity = '0';
    setTimeout(() => { this.el.style.display = 'none'; }, 300);
  }

  private render(): void {
    const page = PAGES[this.currentPage];
    const isLast = this.currentPage === PAGES.length - 1;

    this.el.innerHTML = `
      <div class="onboarding-content">
        <div class="onboarding-icon">${page.icon}</div>
        <h2 class="onboarding-heading" id="onboarding-heading">${page.heading}</h2>
        <p class="onboarding-body">${page.body}</p>
        <div class="onboarding-dots">
          ${PAGES.map((_, i) => `<span class="onboarding-dot ${i === this.currentPage ? 'active' : ''}"></span>`).join('')}
        </div>
        <button class="onboarding-continue-btn">${isLast ? 'Get Started' : 'Continue'}</button>
        ${!isLast ? '<button class="onboarding-skip-btn">Skip</button>' : ''}
      </div>
    `;

    this.el.querySelector('.onboarding-continue-btn')?.addEventListener('click', () => {
      if (isLast) {
        this.finish();
      } else {
        this.currentPage++;
        this.render();
      }
    });

    this.el.querySelector('.onboarding-skip-btn')?.addEventListener('click', () => {
      this.finish();
    });
  }

  private finish(): void {
    this.hide();
    this.onCompleteCb?.();
    this.onCompleteCb = null;
  }

  private applyStyles(): void {
    if (document.querySelector('#onboarding-styles')) return;
    const style = document.createElement('style');
    style.id = 'onboarding-styles';
    style.textContent = `
      .onboarding-screen {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: ${CONFIG.colors.background};
        display: flex; align-items: center; justify-content: center;
        z-index: 9000; opacity: 0;
        transition: opacity 0.3s ease;
      }
      .onboarding-content {
        display: flex; flex-direction: column; align-items: center;
        padding: 48px 32px 56px;
        text-align: center; max-width: 360px; width: 100%;
      }
      .onboarding-icon {
        margin-bottom: 32px;
        animation: onboardingPulse 2.5s ease-in-out infinite;
      }
      @keyframes onboardingPulse {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.04); opacity: 1; }
      }
      .onboarding-heading {
        font-size: 22px; font-weight: 400; letter-spacing: 0.2px;
        color: ${CONFIG.colors.text}; margin-bottom: 14px;
        line-height: 1.3;
      }
      .onboarding-body {
        font-size: 15px; font-weight: 300; line-height: 1.6;
        color: ${CONFIG.colors.textMuted}; margin-bottom: 36px;
      }
      .onboarding-dots {
        display: flex; gap: 8px; margin-bottom: 32px;
      }
      .onboarding-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: ${CONFIG.colors.surfaceLight};
        transition: background 0.2s;
      }
      .onboarding-dot.active {
        background: ${CONFIG.colors.primary};
      }
      .onboarding-continue-btn {
        width: 100%; padding: 16px;
        background: ${CONFIG.colors.primary};
        border: none; border-radius: 14px;
        color: #fff; font-size: 16px; font-weight: 500;
        letter-spacing: 0.3px; cursor: pointer;
        transition: background 0.2s; margin-bottom: 12px;
      }
      .onboarding-continue-btn:active { background: ${CONFIG.colors.primaryLight}; }
      .onboarding-skip-btn {
        background: none; border: none;
        color: ${CONFIG.colors.textMuted}; font-size: 14px;
        cursor: pointer; padding: 8px;
        min-height: 44px;
      }
    `;
    document.head.appendChild(style);
  }
}
