import { Store } from '../game/state';
import { CONFIG } from '../game/config';
import { getScene } from '../content/scenes';

export class PlayerHUD {
  private el: HTMLElement;
  private store: Store;
  private onTimerOpen: () => void;
  private onMixerOpen: () => void;
  private onBack: () => void;
  private onToggleMute: () => void;
  private onDimScreen: () => void;
  private autoHideTimer: number | null = null;
  private visible: boolean = true;

  constructor(
    container: HTMLElement,
    store: Store,
    callbacks: {
      onTimerOpen: () => void;
      onMixerOpen: () => void;
      onBack: () => void;
      onToggleMute: () => void;
      onDimScreen: () => void;
    },
  ) {
    this.store = store;
    this.onTimerOpen = callbacks.onTimerOpen;
    this.onMixerOpen = callbacks.onMixerOpen;
    this.onBack = callbacks.onBack;
    this.onToggleMute = callbacks.onToggleMute;
    this.onDimScreen = callbacks.onDimScreen;

    this.el = document.createElement('div');
    this.el.className = 'player-hud';
    this.el.style.display = 'none';
    container.appendChild(this.el);

    this.applyStyles();
    this.startAutoHide();
  }

  show(): void {
    this.render();
    this.el.style.display = 'flex';
    requestAnimationFrame(() => {
      this.el.style.opacity = '1';
    });
    this.resetAutoHide();
  }

  hide(): void {
    this.el.style.opacity = '0';
    setTimeout(() => {
      this.el.style.display = 'none';
    }, CONFIG.uiFadeOutDuration);
  }

  bringUpUI(): void {
    if (!this.visible) {
      this.visible = true;
      this.el.style.opacity = '1';
      this.el.style.pointerEvents = 'auto';
    }
    this.resetAutoHide();
  }

  updateTimerDisplay(): void {
    const timerBadge = this.el.querySelector('.player-timer-badge') as HTMLElement;
    if (!timerBadge) return;

    if (this.store.state.timerActive) {
      const ms = this.store.state.timerRemainingMs;
      const minutes = Math.floor(ms / 60000);
      const seconds = Math.floor((ms % 60000) / 1000);
      timerBadge.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      timerBadge.style.display = 'block';
    } else {
      timerBadge.style.display = 'none';
    }
  }

  private render(): void {
    const scene = getScene(this.store.state.activeScene);
    const { muted, timerActive } = this.store.state;

    this.el.innerHTML = `
      <div class="player-top-bar">
        <button class="player-btn player-back-btn" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colors.text}" stroke-width="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div class="player-scene-label">${scene?.name ?? ''}</div>
        <div class="player-timer-badge" style="display: ${timerActive ? 'block' : 'none'}"></div>
      </div>

      <div class="player-bottom-bar">
        <button class="player-btn" data-action="timer" aria-label="Sleep Timer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${timerActive ? CONFIG.colors.timerActive : CONFIG.colors.textMuted}" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <span class="player-btn-label" style="color: ${timerActive ? CONFIG.colors.timerActive : CONFIG.colors.textMuted}">Timer</span>
        </button>

        <button class="player-btn" data-action="mixer" aria-label="Sound Mixer">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colors.textMuted}" stroke-width="1.5">
            <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
            <circle cx="4" cy="12" r="2"/><circle cx="12" cy="10" r="2"/><circle cx="20" cy="14" r="2"/>
          </svg>
          <span class="player-btn-label">Mixer</span>
        </button>

        <button class="player-btn" data-action="mute" aria-label="${muted ? 'Unmute' : 'Mute'}">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${muted ? CONFIG.colors.danger : CONFIG.colors.textMuted}" stroke-width="1.5">
            ${muted
              ? '<path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"/>'
              : '<path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>'}
          </svg>
          <span class="player-btn-label">${muted ? 'Muted' : 'Sound'}</span>
        </button>

        <button class="player-btn" data-action="dim" aria-label="Dim Screen">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colors.textMuted}" stroke-width="1.5">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
          </svg>
          <span class="player-btn-label">Dim</span>
        </button>
      </div>
    `;

    // Bind events
    this.el.querySelector('.player-back-btn')?.addEventListener('click', () => this.onBack());

    this.el.querySelectorAll('.player-btn[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        if (action === 'timer') this.onTimerOpen();
        else if (action === 'mixer') this.onMixerOpen();
        else if (action === 'mute') this.onToggleMute();
        else if (action === 'dim') this.onDimScreen();
        this.resetAutoHide();
      });
    });

    // Tap anywhere on the HUD area to reset auto-hide
    this.el.addEventListener('pointerdown', () => this.resetAutoHide());
  }

  private startAutoHide(): void {
    // Will auto-hide after delay
  }

  private resetAutoHide(): void {
    if (this.autoHideTimer !== null) {
      clearTimeout(this.autoHideTimer);
    }
    this.autoHideTimer = window.setTimeout(() => {
      this.visible = false;
      this.el.style.opacity = '0.15';
      this.el.style.pointerEvents = 'none';
    }, CONFIG.uiAutoHideDelay);
  }

  private applyStyles(): void {
    if (document.querySelector('#player-hud-styles')) return;
    const style = document.createElement('style');
    style.id = 'player-hud-styles';
    style.textContent = `
      .player-hud {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        display: flex; flex-direction: column;
        justify-content: space-between;
        pointer-events: none;
        z-index: 4000;
        opacity: 0;
        transition: opacity ${CONFIG.uiFadeInDuration}ms ease;
      }
      .player-top-bar {
        display: flex; align-items: center; gap: 12px;
        padding: 16px 20px;
        padding-top: max(16px, env(safe-area-inset-top, 0px) + 8px);
        pointer-events: auto;
      }
      .player-scene-label {
        flex: 1; font-size: 16px; font-weight: 400;
        color: ${CONFIG.colors.text}; opacity: 0.8;
      }
      .player-timer-badge {
        font-size: 13px; font-weight: 500;
        color: ${CONFIG.colors.timerActive};
        background: ${CONFIG.colors.timerActive}18;
        padding: 4px 12px; border-radius: 12px;
      }
      .player-bottom-bar {
        display: flex; align-items: center; justify-content: space-around;
        padding: 16px 20px;
        padding-bottom: max(20px, env(safe-area-inset-bottom, 0px) + 12px);
        background: linear-gradient(transparent, ${CONFIG.colors.background}cc);
        pointer-events: auto;
      }
      .player-btn {
        background: none; border: none; cursor: pointer;
        display: flex; flex-direction: column; align-items: center; gap: 4px;
        padding: 8px 12px; border-radius: 12px;
        transition: background 0.2s;
      }
      .player-btn:active { background: ${CONFIG.colors.surfaceLight}40; }
      .player-btn-label {
        font-size: 10px; color: ${CONFIG.colors.textMuted};
        font-weight: 500; letter-spacing: 0.3px;
      }
      .player-back-btn {
        flex-direction: row; gap: 0; padding: 8px;
      }
    `;
    document.head.appendChild(style);
  }
}
