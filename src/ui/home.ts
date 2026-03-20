import { Store, SceneId } from '../game/state';
import { SCENES } from '../content/scenes';
import { CONFIG } from '../game/config';

export class HomeScreen {
  private el: HTMLElement;
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
    this.store = store;
    this.onSceneSelect = onSceneSelect;
    this.onTimerShortcut = onTimerShortcut;
    this.onSettingsOpen = onSettingsOpen;

    this.el = document.createElement('div');
    this.el.className = 'home-screen';
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
    }, CONFIG.uiFadeOutDuration);
  }

  private render(): void {
    const { lastUsedScene, subscriptionTier } = this.store.state;
    const isPremium = subscriptionTier === 'premium';

    this.el.innerHTML = `
      <div class="home-header">
        <h1 class="home-title">ASMR Sleep</h1>
        ${isPremium ? '<span class="home-premium-badge">PREMIUM</span>' : ''}
        <button class="home-settings-btn" aria-label="Settings">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colors.textMuted}" stroke-width="1.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
      </div>

      ${lastUsedScene ? `
        <button class="home-continue-btn">
          <span class="home-continue-label">Continue Last Session</span>
          <span class="home-continue-scene">${SCENES.find(s => s.id === lastUsedScene)?.name ?? ''}</span>
        </button>
      ` : ''}

      <div class="home-section-label">Choose a Scene</div>

      <div class="home-scene-grid">
        ${SCENES.map(scene => `
          <button class="home-scene-card ${scene.premium && !isPremium ? 'locked' : ''}"
                  data-scene="${scene.id}">
            <div class="scene-card-thumb" style="background: #${scene.thumbnailColor.toString(16).padStart(6, '0')}20;">
              <div class="scene-card-glow" style="background: radial-gradient(circle, #${scene.thumbnailColor.toString(16).padStart(6, '0')}40 0%, transparent 70%);"></div>
            </div>
            <div class="scene-card-info">
              <span class="scene-card-name">${scene.name}</span>
              <span class="scene-card-mood">${scene.moodLabel}</span>
            </div>
            ${scene.premium && !isPremium ? '<span class="scene-card-lock">Premium</span>' : ''}
          </button>
        `).join('')}
      </div>

      <button class="home-timer-shortcut">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.colors.timerActive}" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <span>Set Sleep Timer</span>
      </button>

      <button class="home-start-btn">Start Relaxing</button>
    `;

    // Bind events
    this.el.querySelectorAll('.home-scene-card').forEach(card => {
      card.addEventListener('click', () => {
        const sceneId = card.getAttribute('data-scene') as SceneId;
        this.onSceneSelect(sceneId);
      });
    });

    this.el.querySelector('.home-continue-btn')?.addEventListener('click', () => {
      if (lastUsedScene) this.onSceneSelect(lastUsedScene);
    });

    this.el.querySelector('.home-timer-shortcut')?.addEventListener('click', () => {
      this.onTimerShortcut();
    });

    this.el.querySelector('.home-settings-btn')?.addEventListener('click', () => {
      this.onSettingsOpen();
    });

    this.el.querySelector('.home-start-btn')?.addEventListener('click', () => {
      this.onSceneSelect(lastUsedScene ?? 'rain-window');
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
        font-size: 10px; font-weight: 600; letter-spacing: 1px;
        color: ${CONFIG.colors.premium}; background: ${CONFIG.colors.premium}18;
        padding: 4px 10px; border-radius: 12px;
      }
      .home-settings-btn {
        background: none; border: none; cursor: pointer; padding: 8px;
        opacity: 0.6; transition: opacity 0.2s;
      }
      .home-settings-btn:hover { opacity: 1; }
      .home-continue-btn {
        background: ${CONFIG.colors.surfaceLight};
        border: 1px solid ${CONFIG.colors.primary}30;
        border-radius: 16px; padding: 16px 20px;
        display: flex; flex-direction: column; gap: 4px;
        text-align: left; cursor: pointer;
        margin-bottom: 24px;
        transition: background 0.2s;
      }
      .home-continue-btn:active { background: ${CONFIG.colors.primary}15; }
      .home-continue-label {
        font-size: 13px; color: ${CONFIG.colors.primary}; font-weight: 500;
      }
      .home-continue-scene {
        font-size: 16px; color: ${CONFIG.colors.text}; font-weight: 400;
      }
      .home-section-label {
        font-size: 13px; color: ${CONFIG.colors.textMuted};
        letter-spacing: 1px; text-transform: uppercase;
        margin-bottom: 16px; font-weight: 500;
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
        transition: background 0.2s, border-color 0.2s;
        text-align: left;
      }
      .home-scene-card:active {
        background: ${CONFIG.colors.surfaceLight};
        border-color: ${CONFIG.colors.primary}40;
      }
      .home-scene-card.locked { opacity: 0.6; }
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
      }
      .scene-card-mood {
        font-size: 12px; color: ${CONFIG.colors.textMuted};
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
        cursor: pointer; margin-bottom: 24px;
        transition: border-color 0.2s;
      }
      .home-timer-shortcut:active { border-color: ${CONFIG.colors.timerActive}40; }
      .home-start-btn {
        width: 100%; padding: 16px;
        background: ${CONFIG.colors.primary};
        border: none; border-radius: 14px;
        color: #fff; font-size: 16px; font-weight: 500;
        letter-spacing: 0.5px; cursor: pointer;
        transition: background 0.2s;
      }
      .home-start-btn:active { background: ${CONFIG.colors.primaryLight}; }
    `;
    document.head.appendChild(style);
  }
}
