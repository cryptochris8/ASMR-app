import { UIPanel } from './UIPanel';
import { Store } from '../game/state';
import { CONFIG } from '../game/config';
import { SleepTimer } from '../systems/SleepTimer';

export class TimerModal extends UIPanel {
  private store: Store;
  private timer: SleepTimer;
  private escapeHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(container: HTMLElement, store: Store, timer: SleepTimer) {
    super(container, 'timer-modal');
    this.store = store;
    this.timer = timer;
    this.applyStyles();
  }

  show(): void {
    this.render();
    this.element.style.display = 'flex';
    requestAnimationFrame(() => { this.element.style.opacity = '1'; });
    this.escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.hide();
    };
    document.addEventListener('keydown', this.escapeHandler);
  }

  hide(): void {
    this.element.style.opacity = '0';
    setTimeout(() => { this.element.style.display = 'none'; }, 300);
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
  }

  protected render(): void {
    const { timerActive, timerFadeAudio, timerDimScreen, lastUsedTimerMs } = this.store.state;

    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-labelledby', 'timer-title');

    this.element.innerHTML = `
      <div class="timer-backdrop" aria-hidden="true"></div>
      <div class="timer-sheet">
        <div class="timer-handle" aria-hidden="true"></div>
        <h2 class="timer-title" id="timer-title">Sleep Timer</h2>

        ${timerActive ? `
          <div class="timer-active-display">
            <span class="timer-remaining" role="timer" aria-live="polite">${this.timer.getRemainingFormatted()}</span>
            <button type="button" class="timer-cancel-btn" aria-label="Cancel sleep timer">Cancel Timer</button>
          </div>
        ` : `
          <div class="timer-options" role="group" aria-label="Choose timer duration">
            ${CONFIG.timerOptions.map(opt => `
              <button type="button" class="timer-option ${opt.ms === lastUsedTimerMs ? 'selected' : ''}"
                      data-ms="${opt.ms}"
                      aria-label="Set timer to ${opt.label}"
                      ${opt.ms === lastUsedTimerMs ? 'aria-pressed="true"' : 'aria-pressed="false"'}>
                ${opt.label}
              </button>
            `).join('')}
            <button type="button" class="timer-option" data-ms="0" aria-label="No timer">No Timer</button>
          </div>
        `}

        <div class="timer-toggles">
          <label class="timer-toggle">
            <span>Fade audio before end</span>
            <input type="checkbox" role="switch" aria-label="Fade audio before end" ${timerFadeAudio ? 'checked' : ''} data-toggle="fade"/>
          </label>
          <label class="timer-toggle">
            <span>Dim screen gradually</span>
            <input type="checkbox" role="switch" aria-label="Dim screen gradually" ${timerDimScreen ? 'checked' : ''} data-toggle="dim"/>
          </label>
        </div>

        <button type="button" class="timer-close-btn" aria-label="Close timer">Done</button>
      </div>
    `;

    this.element.querySelector('.timer-backdrop')?.addEventListener('click', () => this.hide());
    this.element.querySelector('.timer-close-btn')?.addEventListener('click', () => this.hide());

    const sheet = this.element.querySelector('.timer-sheet') as HTMLElement;
    let startY = 0;
    sheet.addEventListener('touchstart', (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    }, { passive: true });
    sheet.addEventListener('touchmove', (e: TouchEvent) => {
      const dy = e.touches[0].clientY - startY;
      if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    sheet.addEventListener('touchend', (e: TouchEvent) => {
      const dy = e.changedTouches[0].clientY - startY;
      if (dy > 80) {
        sheet.style.transform = '';
        this.hide();
      } else {
        sheet.style.transition = 'transform 0.2s ease';
        sheet.style.transform = 'translateY(0)';
        setTimeout(() => { sheet.style.transition = ''; }, 200);
      }
    });

    this.element.querySelectorAll('.timer-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const ms = parseInt(btn.getAttribute('data-ms') ?? '0', 10);
        if (ms > 0) {
          this.timer.start(ms);
        } else {
          this.timer.stop();
        }
        this.hide();
      });
    });

    this.element.querySelector('.timer-cancel-btn')?.addEventListener('click', () => {
      this.timer.stop();
      this.render();
    });

    this.element.querySelectorAll('input[data-toggle]').forEach(input => {
      input.addEventListener('change', (e) => {
        const toggle = (input as HTMLInputElement).getAttribute('data-toggle');
        const checked = (e.target as HTMLInputElement).checked;
        if (toggle === 'fade') this.store.update({ timerFadeAudio: checked });
        if (toggle === 'dim') this.store.update({ timerDimScreen: checked });
      });
    });
  }

  private applyStyles(): void {
    if (document.querySelector('#timer-modal-styles')) return;
    const style = document.createElement('style');
    style.id = 'timer-modal-styles';
    style.textContent = `
      .timer-modal {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        display: flex; align-items: flex-end; justify-content: center;
        z-index: 6000; opacity: 0;
        transition: opacity 0.3s ease;
      }
      .timer-backdrop {
        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5);
      }
      .timer-sheet {
        position: relative; width: 100%; max-width: 420px;
        background: ${CONFIG.colors.surface};
        border-radius: 24px 24px 0 0;
        padding: 12px 24px 40px;
        padding-bottom: max(40px, env(safe-area-inset-bottom, 0px) + 20px);
      }
      .timer-handle {
        width: 36px; height: 4px; border-radius: 2px;
        background: ${CONFIG.colors.surfaceLight};
        margin: 0 auto 20px;
      }
      .timer-title {
        font-size: 18px; font-weight: 500;
        color: ${CONFIG.colors.text}; margin: 0 0 20px;
        text-align: center;
      }
      .timer-options {
        display: grid; grid-template-columns: 1fr 1fr;
        gap: 10px; margin-bottom: 24px;
      }
      .timer-option {
        padding: 14px; border-radius: 12px;
        background: ${CONFIG.colors.surfaceLight};
        border: 1px solid transparent;
        color: ${CONFIG.colors.text}; font-size: 15px;
        cursor: pointer;
        transition: background 0.4s ease, border-color 0.4s ease, transform 0.3s ease;
        min-height: 48px;
      }
      .timer-option:hover {
        background: ${CONFIG.colors.primary}18;
        border-color: ${CONFIG.colors.primary}55;
      }
      .timer-option.selected {
        border-color: ${CONFIG.colors.primary};
        background: ${CONFIG.colors.primary}15;
      }
      .timer-option:active { background: ${CONFIG.colors.primary}20; transform: scale(0.98); }
      .timer-option:focus-visible {
        outline-color: ${CONFIG.colors.primary};
      }
      .timer-active-display {
        text-align: center; margin-bottom: 24px;
      }
      .timer-remaining {
        display: block; font-size: 48px; font-weight: 300;
        color: ${CONFIG.colors.timerActive}; margin-bottom: 16px;
        letter-spacing: 2px;
        font-variant-numeric: tabular-nums;
      }
      .timer-cancel-btn {
        background: ${CONFIG.colors.danger}20; border: none;
        color: ${CONFIG.colors.danger}; padding: 10px 24px;
        border-radius: 10px; font-size: 14px; cursor: pointer;
        min-height: 44px;
        transition: background 0.4s ease;
      }
      .timer-cancel-btn:hover { background: ${CONFIG.colors.danger}30; }
      .timer-cancel-btn:focus-visible { outline-color: ${CONFIG.colors.danger}; }
      .timer-toggles {
        display: flex; flex-direction: column; gap: 12px;
        margin-bottom: 24px;
      }
      .timer-toggle {
        display: flex; align-items: center;
        justify-content: space-between;
        font-size: 14px; color: ${CONFIG.colors.textMuted};
        cursor: pointer;
        min-height: 44px;
      }
      .timer-toggle input[type="checkbox"] {
        width: 44px; height: 24px;
        appearance: none; -webkit-appearance: none;
        background: ${CONFIG.colors.surfaceLight};
        border-radius: 12px; cursor: pointer;
        position: relative;
        transition: background 0.4s ease;
        flex-shrink: 0;
      }
      .timer-toggle input[type="checkbox"]::after {
        content: ''; position: absolute;
        width: 20px; height: 20px; border-radius: 10px;
        background: ${CONFIG.colors.textMuted};
        top: 2px; left: 2px;
        transition: transform 0.3s ease, background 0.4s ease;
      }
      .timer-toggle input[type="checkbox"]:checked {
        background: ${CONFIG.colors.primary};
      }
      .timer-toggle input[type="checkbox"]:checked::after {
        transform: translateX(20px);
        background: #fff;
      }
      .timer-toggle input[type="checkbox"]:focus-visible {
        outline-color: ${CONFIG.colors.primary};
        outline-offset: 4px;
      }
      .timer-close-btn {
        width: 100%; padding: 14px;
        background: ${CONFIG.colors.primary};
        border: none; border-radius: 12px;
        color: #fff; font-size: 15px; font-weight: 500;
        cursor: pointer;
        min-height: 48px;
        transition: background 0.4s ease, transform 0.3s ease;
      }
      .timer-close-btn:hover { background: ${CONFIG.colors.primaryLight}; }
      .timer-close-btn:active { transform: scale(0.99); }
      .timer-close-btn:focus-visible {
        outline-color: ${CONFIG.colors.primaryLight};
        outline-offset: 4px;
      }
    `;
    document.head.appendChild(style);
  }
}
