import { Store } from '../game/state';
import { CONFIG } from '../game/config';
import { AudioManager } from '../audio/AudioManager';
import { getPacksForScene, SoundPack } from '../content/soundPacks';

export class MixerPanel {
  private el: HTMLElement;
  private store: Store;
  private audio: AudioManager;

  constructor(container: HTMLElement, store: Store, audio: AudioManager) {
    this.store = store;
    this.audio = audio;

    this.el = document.createElement('div');
    this.el.className = 'mixer-panel';
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
    const { masterVolume, ambientVolume, interactionVolume, activeScene, subscriptionTier } = this.store.state;
    const isPremium = subscriptionTier === 'premium';
    const packs = getPacksForScene(activeScene);

    this.el.innerHTML = `
      <div class="mixer-backdrop"></div>
      <div class="mixer-sheet">
        <div class="mixer-handle"></div>
        <h2 class="mixer-title">Sound Mixer</h2>

        <div class="mixer-section">
          <div class="mixer-slider-row">
            <span class="mixer-label">Master</span>
            <input type="range" class="mixer-slider" min="0" max="100"
                   value="${Math.round(masterVolume * 100)}" data-target="master"/>
            <span class="mixer-value">${Math.round(masterVolume * 100)}%</span>
          </div>
        </div>

        <div class="mixer-section">
          <div class="mixer-section-label">Layers</div>

          <div class="mixer-slider-row">
            <span class="mixer-label">Ambient</span>
            <input type="range" class="mixer-slider" min="0" max="100"
                   value="${Math.round(ambientVolume * 100)}" data-target="ambient"/>
            <span class="mixer-value">${Math.round(ambientVolume * 100)}%</span>
          </div>

          <div class="mixer-slider-row">
            <span class="mixer-label">Interaction</span>
            <input type="range" class="mixer-slider" min="0" max="100"
                   value="${Math.round(interactionVolume * 100)}" data-target="interaction"/>
            <span class="mixer-value">${Math.round(interactionVolume * 100)}%</span>
          </div>
        </div>

        <div class="mixer-section">
          <div class="mixer-section-label">Extra Layers</div>
          ${packs.filter(p => p.sounds.some(s => s.loop)).map(pack => `
            <div class="mixer-layer-row ${pack.premium && !isPremium ? 'locked' : ''}">
              <span class="mixer-label">${pack.name}</span>
              ${pack.premium && !isPremium
                ? '<span class="mixer-premium-badge">Premium</span>'
                : `<button class="mixer-layer-toggle" data-pack="${pack.id}">
                    ${this.isLayerActive(pack.id) ? 'On' : 'Off'}
                   </button>`
              }
            </div>
          `).join('')}
        </div>

        <button class="mixer-close-btn">Done</button>
      </div>
    `;

    // Bind events
    this.el.querySelector('.mixer-backdrop')?.addEventListener('click', () => this.hide());
    this.el.querySelector('.mixer-close-btn')?.addEventListener('click', () => this.hide());

    this.el.querySelectorAll('.mixer-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const target = (slider as HTMLInputElement).getAttribute('data-target');
        const value = parseInt((e.target as HTMLInputElement).value, 10) / 100;
        const valueEl = slider.parentElement?.querySelector('.mixer-value');
        if (valueEl) valueEl.textContent = `${Math.round(value * 100)}%`;

        if (target === 'master') this.store.update({ masterVolume: value });
        else if (target === 'ambient') this.store.update({ ambientVolume: value });
        else if (target === 'interaction') this.store.update({ interactionVolume: value });
      });
    });

    this.el.querySelectorAll('.mixer-layer-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const packId = btn.getAttribute('data-pack');
        if (packId) this.toggleLayer(packId);
      });
    });
  }

  private isLayerActive(packId: string): boolean {
    return this.store.state.activeLayers.some(l => l.packId === packId);
  }

  private toggleLayer(packId: string): void {
    const layers = [...this.store.state.activeLayers];
    const existing = layers.findIndex(l => l.packId === packId);

    if (existing >= 0) {
      const layer = layers[existing];
      this.audio.stopAmbient(layer.soundId);
      layers.splice(existing, 1);
    } else {
      const pack = getPacksForScene(this.store.state.activeScene).find(p => p.id === packId);
      if (!pack) return;
      if (layers.length >= CONFIG.mixerMaxLayers) return;

      const ambientSound = pack.sounds.find(s => s.loop && s.category === 'ambient');
      if (!ambientSound) return;

      layers.push({
        id: `${packId}_${Date.now()}`,
        packId,
        soundId: ambientSound.id,
        volume: ambientSound.defaultVolume,
        muted: false,
      });

      this.audio.playAmbient(ambientSound.id, ambientSound.defaultVolume);
    }

    this.store.update({ activeLayers: layers });
    this.render(); // Re-render to update toggle states
  }

  private applyStyles(): void {
    if (document.querySelector('#mixer-panel-styles')) return;
    const style = document.createElement('style');
    style.id = 'mixer-panel-styles';
    style.textContent = `
      .mixer-panel {
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        display: flex; align-items: flex-end; justify-content: center;
        z-index: 6000; opacity: 0;
        transition: opacity 0.3s ease;
      }
      .mixer-backdrop {
        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5);
      }
      .mixer-sheet {
        position: relative; width: 100%; max-width: 420px;
        background: ${CONFIG.colors.surface};
        border-radius: 24px 24px 0 0;
        padding: 12px 24px 40px;
        padding-bottom: max(40px, env(safe-area-inset-bottom, 0px) + 20px);
        max-height: 80vh; overflow-y: auto;
      }
      .mixer-handle {
        width: 36px; height: 4px; border-radius: 2px;
        background: ${CONFIG.colors.surfaceLight};
        margin: 0 auto 20px;
      }
      .mixer-title {
        font-size: 18px; font-weight: 500;
        color: ${CONFIG.colors.text}; margin-bottom: 24px;
        text-align: center;
      }
      .mixer-section {
        margin-bottom: 20px;
      }
      .mixer-section-label {
        font-size: 11px; color: ${CONFIG.colors.textMuted};
        text-transform: uppercase; letter-spacing: 1px;
        margin-bottom: 12px; font-weight: 500;
      }
      .mixer-slider-row {
        display: flex; align-items: center; gap: 12px;
        margin-bottom: 12px;
      }
      .mixer-label {
        font-size: 14px; color: ${CONFIG.colors.text};
        min-width: 80px;
      }
      .mixer-slider {
        flex: 1; height: 4px;
        -webkit-appearance: none; appearance: none;
        background: ${CONFIG.colors.surfaceLight};
        border-radius: 2px; outline: none;
      }
      .mixer-slider::-webkit-slider-thumb {
        -webkit-appearance: none; appearance: none;
        width: 20px; height: 20px; border-radius: 50%;
        background: ${CONFIG.colors.primary};
        cursor: pointer;
      }
      .mixer-value {
        font-size: 12px; color: ${CONFIG.colors.textMuted};
        min-width: 36px; text-align: right;
      }
      .mixer-layer-row {
        display: flex; align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid ${CONFIG.colors.surfaceLight}40;
      }
      .mixer-layer-row.locked { opacity: 0.5; }
      .mixer-layer-toggle {
        background: ${CONFIG.colors.surfaceLight};
        border: none; border-radius: 8px;
        padding: 6px 16px; color: ${CONFIG.colors.text};
        font-size: 12px; cursor: pointer;
        transition: background 0.2s;
      }
      .mixer-layer-toggle:active { background: ${CONFIG.colors.primary}30; }
      .mixer-premium-badge {
        font-size: 10px; color: ${CONFIG.colors.premium};
        font-weight: 600;
      }
      .mixer-close-btn {
        width: 100%; padding: 14px; margin-top: 8px;
        background: ${CONFIG.colors.primary};
        border: none; border-radius: 12px;
        color: #fff; font-size: 15px; font-weight: 500;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }
}
