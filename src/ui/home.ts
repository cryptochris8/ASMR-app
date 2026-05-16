import { UIPanel } from './UIPanel';
import { Store, SceneId } from '../game/state';
import { SCENES } from '../content/scenes';
import { CONFIG } from '../game/config';

export class HomeScreen extends UIPanel {
  private store: Store;
  private onSceneSelect: (sceneId: SceneId) => void;
  private onTimerShortcut: () => void;
  private onSettingsOpen: () => void;

  constructor(
    container: HTMLElement,
    store: Store,
    onSceneSelect: (sceneId: SceneId) => void,
    onTimerShortcut: () => void,
    onSettingsOpen: () => void,
  ) {
    super(container, 'home-screen');
    this.store = store;
    this.onSceneSelect = onSceneSelect;
    this.onTimerShortcut = onTimerShortcut;
    this.onSettingsOpen = onSettingsOpen;
    this.applyStyles();
  }

  show(): void {
    this.beforeShow?.();
    this.render();
    this.element.style.display = 'flex';
    requestAnimationFrame(() => { this.element.style.opacity = '1'; });
    this.afterShow?.();
  }

  hide(): void {
    this.beforeHide?.();
    this.element.style.opacity = '0';
    setTimeout(() => {
      this.element.style.display = 'none';
      this.afterHide?.();
    }, CONFIG.uiFadeOutDuration);
  }

  protected render(): void {
    const { lastUsedScene, subscriptionTier } = this.store.state;
    const isPremium = subscriptionTier === 'premium';

    this.element.innerHTML = `
      <header class="home-header">
        <h1 class="home-title">ASMR Sleeps</h1>
        ${isPremium ? '<span class="home-premium-badge" aria-label="Premium subscription active">PREMIUM</span>' : ''}
        <button type="button" class="home-settings-btn" aria-label="Open settings">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colors.textMuted}" stroke-width="1.5" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
      </header>

      ${lastUsedScene ? `
        <button type="button" class="home-continue-btn" aria-label="Continue last session: ${SCENES.find(s => s.id === lastUsedScene)?.name ?? ''}">
          <span class="home-continue-label">Continue Last Session</span>
          <span class="home-continue-scene">${SCENES.find(s => s.id === lastUsedScene)?.name ?? ''}</span>
        </button>
      ` : `
        <div class="home-welcome-hint" role="note">
          <span class="home-welcome-greeting">Welcome.</span>
          <span class="home-welcome-text">Tap a scene below to begin.</span>
        </div>
      `}

      <h2 class="home-section-label">${lastUsedScene ? 'Choose a Scene' : 'Scenes'}</h2>

      <div class="home-scene-grid" role="list">
        ${SCENES.map(scene => `
          <button type="button" class="home-scene-card ${scene.premium && !isPremium ? 'locked' : ''}"
                  role="listitem"
                  data-scene="${scene.id}"
                  aria-label="Open ${scene.name} scene${scene.premium && !isPremium ? ' (Premium)' : ''}, mood: ${scene.moodLabel}">
            <div class="scene-card-thumb" aria-hidden="true" style="background: #${scene.thumbnailColor.toString(16).padStart(6, '0')}20;">
              <div class="scene-card-glow" style="background: radial-gradient(circle, #${scene.thumbnailColor.toString(16).padStart(6, '0')}40 0%, transparent 70%);"></div>
            </div>
            <div class="scene-card-info">
              <span class="scene-card-name">${scene.name}</span>
              <span class="scene-card-mood">${scene.moodLabel}</span>
            </div>
            ${scene.premium && !isPremium ? '<span class="scene-card-lock" aria-hidden="true">Premium</span>' : ''}
          </button>
        `).join('')}
      </div>

      <button type="button" class="home-timer-shortcut" aria-label="Set sleep timer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colors.timerActive}" stroke-width="1.5" aria-hidden="true" focusable="false">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <span>Set Sleep Timer</span>
      </button>

      <button type="button" class="home-sleep-btn" aria-label="Start quick sleep mode with last scene and timer">Sleep</button>
    `;

    this.element.querySelectorAll('.home-scene-card').forEach(card => {
      card.addEventListener('click', () => {
        const sceneId = card.getAttribute('data-scene') as SceneId;
        this.onSceneSelect(sceneId);
      });
    });

    this.element.querySelector('.home-continue-btn')?.addEventListener('click', () => {
      if (lastUsedScene) this.onSceneSelect(lastUsedScene);
    });

    this.element.querySelector('.home-timer-shortcut')?.addEventListener('click', () => {
      this.onTimerShortcut();
    });

    this.element.querySelector('.home-settings-btn')?.addEventListener('click', () => {
      this.onSettingsOpen();
    });

    this.element.querySelector('.home-sleep-btn')?.addEventListener('click', () => {
      const scene = this.store.state.lastUsedScene ?? 'rain-window';
      const timerMs = this.store.state.lastUsedTimerMs || 30 * 60_000;
      this.store.update({
        lastUsedTimerMs: timerMs,
        sleepModeRequested: true,
      });
      this.onSceneSelect(scene);
    });
  }

  private applyStyles(): void {
    if (document.querySelector('#home-styles')) return;
    const style = document.createElement('style');
    style.id = 'home-styles';
    style.textContent = `
      .home-screen {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: ${CONFIG.colors.background};
        display: flex; flex-direction: column;
        padding: 60px 24px 40px;
        padding-top: max(60px, env(safe-area-inset-top, 0px) + 20px);
        overflow-y: auto;
        z-index: 5000;
        opacity: 0;
        transition: opacity ${CONFIG.uiFadeInDuration}ms ease;
      }
      .home-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 32px;
      }
      .home-title {
        font-size: 24px; font-weight: 300; letter-spacing: 3px;
        color: ${CONFIG.colors.text}; text-transform: uppercase;
      }
      .home-premium-badge {
        font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
        color: ${CONFIG.colors.premium};
        background: ${CONFIG.colors.premium}30;
        border: 1px solid ${CONFIG.colors.premium}55;
        padding: 5px 11px; border-radius: 12px;
      }
      .home-settings-btn {
        background: none; border: none; cursor: pointer; padding: 8px;
        opacity: 0.6; transition: opacity 0.4s ease, transform 0.4s ease;
        min-height: 44px; min-width: 44px;
        display: inline-flex; align-items: center; justify-content: center;
        border-radius: 12px;
      }
      .home-settings-btn:hover { opacity: 1; }
      .home-settings-btn:active { transform: scale(0.96); }
      .home-settings-btn:focus-visible {
        outline-color: ${CONFIG.colors.primary};
        opacity: 1;
      }
      .home-continue-btn {
        background: ${CONFIG.colors.surfaceLight};
        border: 1px solid ${CONFIG.colors.primary}30;
        border-radius: 16px; padding: 16px 20px;
        display: flex; flex-direction: column; gap: 4px;
        text-align: left; cursor: pointer;
        margin-bottom: 24px;
        transition: background 0.4s ease, border-color 0.4s ease;
        min-height: 44px;
      }
      .home-continue-btn:hover { background: ${CONFIG.colors.primary}12; border-color: ${CONFIG.colors.primary}55; }
      .home-continue-btn:active { background: ${CONFIG.colors.primary}15; }
      .home-continue-btn:focus-visible { outline-color: ${CONFIG.colors.primary}; }
      .home-continue-label {
        font-size: 13px; color: ${CONFIG.colors.primary}; font-weight: 500;
        letter-spacing: 0.3px;
      }
      .home-continue-scene {
        font-size: 16px; color: ${CONFIG.colors.text}; font-weight: 400;
        line-height: 1.3;
      }
      .home-welcome-hint {
        display: flex; flex-direction: column; gap: 4px;
        padding: 16px 20px; margin-bottom: 24px;
        background: ${CONFIG.colors.primary}10;
        border: 1px solid ${CONFIG.colors.primary}25;
        border-radius: 16px;
      }
      .home-welcome-greeting {
        font-size: 13px; color: ${CONFIG.colors.primary}; font-weight: 500;
        letter-spacing: 0.3px;
      }
      .home-welcome-text {
        font-size: 15px; color: ${CONFIG.colors.text}; font-weight: 400;
        line-height: 1.4;
      }
      .home-section-label {
        font-size: 13px; color: ${CONFIG.colors.textMuted};
        letter-spacing: 1px; text-transform: uppercase;
        margin: 0 0 16px; font-weight: 500;
      }
      .home-scene-grid {
        display: flex; flex-direction: column; gap: 12px;
        margin-bottom: 24px;
      }
      .home-scene-card {
        background: ${CONFIG.colors.surface};
        border: 1px solid ${CONFIG.colors.surfaceLight};
        border-radius: 16px; padding: 0;
        display: flex; align-items: center; gap: 16px;
        cursor: pointer; overflow: hidden;
        transition: background 0.4s ease, border-color 0.4s ease, transform 0.3s ease;
        text-align: left;
        min-height: 80px;
      }
      .home-scene-card:hover:not(.locked) {
        background: ${CONFIG.colors.surfaceLight};
        border-color: ${CONFIG.colors.primary}55;
      }
      .home-scene-card:active:not(.locked) {
        background: ${CONFIG.colors.surfaceLight};
        border-color: ${CONFIG.colors.primary}40;
        transform: scale(0.99);
      }
      .home-scene-card:focus-visible { outline-color: ${CONFIG.colors.primary}; }
      .home-scene-card.locked { opacity: 0.6; cursor: pointer; }
      .home-scene-card.locked:hover { border-color: ${CONFIG.colors.premium}55; }
      .scene-card-thumb {
        width: 80px; height: 80px; position: relative;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .scene-card-glow {
        position: absolute; width: 100%; height: 100%;
      }
      .scene-card-info {
        display: flex; flex-direction: column; gap: 4px; flex: 1;
        padding: 16px 0;
      }
      .scene-card-name {
        font-size: 16px; color: ${CONFIG.colors.text}; font-weight: 500;
        line-height: 1.2;
      }
      .scene-card-mood {
        font-size: 12px; color: ${CONFIG.colors.textMuted};
        line-height: 1.3;
      }
      .scene-card-lock {
        font-size: 10px; color: ${CONFIG.colors.premium};
        background: ${CONFIG.colors.premium}15;
        padding: 4px 10px; border-radius: 10px;
        margin-right: 16px; font-weight: 600;
        letter-spacing: 0.5px;
      }
      .home-timer-shortcut {
        display: flex; align-items: center; gap: 10px;
        background: none; border: 1px solid ${CONFIG.colors.surfaceLight};
        border-radius: 12px; padding: 14px 18px;
        color: ${CONFIG.colors.textMuted}; font-size: 14px;
        cursor: pointer; margin-bottom: 16px;
        transition: border-color 0.4s ease, color 0.4s ease, background 0.4s ease;
        min-height: 48px;
      }
      .home-timer-shortcut:hover {
        border-color: ${CONFIG.colors.timerActive}55;
        color: ${CONFIG.colors.text};
      }
      .home-timer-shortcut:active { border-color: ${CONFIG.colors.timerActive}40; background: ${CONFIG.colors.timerActive}10; }
      .home-timer-shortcut:focus-visible { outline-color: ${CONFIG.colors.timerActive}; }
      .home-sleep-btn {
        width: 100%; padding: 16px;
        background: ${CONFIG.colors.primary};
        border: none; border-radius: 14px;
        color: #fff; font-size: 16px; font-weight: 500;
        letter-spacing: 0.5px; cursor: pointer;
        transition: background 0.4s ease, transform 0.3s ease;
        min-height: 52px;
      }
      .home-sleep-btn:hover { background: ${CONFIG.colors.primaryLight}; }
      .home-sleep-btn:active { background: ${CONFIG.colors.primaryLight}; transform: scale(0.99); }
      .home-sleep-btn:focus-visible {
        outline-color: ${CONFIG.colors.primaryLight};
        outline-offset: 4px;
      }
      .home-premium-badge {
        font-variant-numeric: tabular-nums;
      }
    `;
    document.head.appendChild(style);
  }
}
