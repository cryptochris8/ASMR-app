import { Store } from '../game/state';
import { CONFIG } from '../game/config';
import { SleepTimer } from '../systems/SleepTimer';

export class TimerModal {
  private el: HTMLElement;
  private store: Store;
  private timer: SleepTimer;

  constructor(container: HTMLElement, store: Store, timer: SleepTimer) {
    this.store = store;
    this.timer = timer;

    this.el = document.createElement('div');
    this.el.className = 'timer-modal';
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
    const { timerActive, timerFadeAudio, timerDimScreen, lastUsedTimerMs } = this.store.state;

    this.el.innerHTML = `
      <div class="timer-backdrop"></div>
      <div class="timer-sheet">
        <div class="timer-handle"></div>
        <h2 class="timer-title">Sleep Timer</h2>

        ${timerActive ? `
          <div class="timer-active-display">
            <span class="timer-remaining">${this.timer.getRemainingFormatted()}</span>
            <button class="timer-cancel-btn">Cancel Timer</button>
          </div>
        ` : `
          <div class="timer-options">
            ${CONFIG.timerOptions.map(opt => `
              <button class="timer-option ${opt.ms === lastUsedTimerMs ? 'selected' : ''}"
                      data-ms="${opt.ms}">
                ${opt.label}
              </button>
            `).join('')}
            <button class="timer-option" data-ms="0">No Timer</button>
          </div>
        `}

        <div class="timer-toggles">
          <label class="timer-toggle">
            <span>Fade audio before end</span>
            <input type="checkbox" ${timerFadeAudio ? 'checked' : ''} data-toggle="fade"/>
          </label>
          <label class="timer-toggle">
            <span>Dim screen gradually</span>
            <input type="checkbox" ${timerDimScreen ? 'checked' : ''} data-toggle="dim"/>
          </label>
        </div>

        <button class="timer-close-btn">Done</button>
      </div>
    `;

    // Bind events
    this.el.querySelector('.timer-backdrop')?.addEventListener('click', () => this.hide());
    this.el.querySelector('.timer-close-btn')?.addEventListener('click', () => this.hide());

    this.el.querySelectorAll('.timer-option').forEach(btn => {
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

    this.el.querySelector('.timer-cancel-btn')?.addEventListener('click', () => {
      this.timer.stop();
      this.render();
    });

    this.el.querySelectorAll('input[data-toggle]').forEach(input => {
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
        color: ${CONFIG.colors.text}; margin-bottom: 20px;
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
        cursor: pointer; transition: all 0.2s;
      }
      .timer-option.selected {
        border-color: ${CONFIG.colors.primary};
        background: ${CONFIG.colors.primary}15;
      }
      .timer-option:active { background: ${CONFIG.colors.primary}20; }
      .timer-active-display {
        text-align: center; margin-bottom: 24px;
      }
      .timer-remaining {
        display: block; font-size: 48px; font-weight: 300;
        color: ${CONFIG.colors.timerActive}; margin-bottom: 16px;
        letter-spacing: 2px;
      }
      .timer-cancel-btn {
        background: ${CONFIG.colors.danger}20; border: none;
        color: ${CONFIG.colors.danger}; padding: 10px 24px;
        border-radius: 10px; font-size: 14px; cursor: pointer;
      }
      .timer-toggles {
        display: flex; flex-direction: column; gap: 12px;
        margin-bottom: 24px;
      }
      .timer-toggle {
        display: flex; align-items: center;
        justify-content: space-between;
        font-size: 14px; color: ${CONFIG.colors.textMuted};
        cursor: pointer;
      }
      .timer-toggle input[type="checkbox"] {
        width: 44px; height: 24px;
        appearance: none; -webkit-appearance: none;
        background: ${CONFIG.colors.surfaceLight};
        border-radius: 12px; cursor: pointer;
        position: relative; transition: background 0.2s;
      }
      .timer-toggle input[type="checkbox"]::after {
        content: ''; position: absolute;
        width: 20px; height: 20px; border-radius: 10px;
        background: ${CONFIG.colors.textMuted};
        top: 2px; left: 2px;
        transition: transform 0.2s;
      }
      .timer-toggle input[type="checkbox"]:checked {
        background: ${CONFIG.colors.primary};
      }
      .timer-toggle input[type="checkbox"]:checked::after {
        transform: translateX(20px);
        background: #fff;
      }
      .timer-close-btn {
        width: 100%; padding: 14px;
        background: ${CONFIG.colors.primary};
        border: none; border-radius: 12px;
        color: #fff; font-size: 15px; font-weight: 500;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }
}
