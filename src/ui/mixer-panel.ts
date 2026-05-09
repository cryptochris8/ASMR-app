import { UIPanel } from './UIPanel';
import { Store } from '../game/state';
import { CONFIG } from '../game/config';
import { AudioManager } from '../audio/AudioManager';
import { getPacksForScene } from '../content/soundPacks';

export class MixerPanel extends UIPanel {
  private store: Store;
  private audio: AudioManager;
  private escapeHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(container: HTMLElement, store: Store, audio: AudioManager) {
    super(container, 'mixer-panel');
    this.store = store;
    this.audio = audio;
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
    const { masterVolume, ambientVolume, interactionVolume, activeScene, subscriptionTier } = this.store.state;
    const isPremium = subscriptionTier === 'premium';
    const packs = getPacksForScene(activeScene);

    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('aria-labelledby', 'mixer-title');

    this.element.innerHTML = `
      <div class="mixer-backdrop" aria-hidden="true"></div>
      <div class="mixer-sheet">
        <div class="mixer-handle" aria-hidden="true"></div>
        <h2 class="mixer-title" id="mixer-title">Sound Mixer</h2>

        <div class="mixer-section">
          <div class="mixer-slider-row">
            <span class="mixer-label">Master</span>
            <input type="range" class="mixer-slider" min="0" max="100"
                   value="${Math.round(masterVolume * 100)}" data-target="master"
                   aria-label="Master volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(masterVolume * 100)}"/>
            <span class="mixer-value">${Math.round(masterVolume * 100)}%</span>
          </div>
        </div>

        <div class="mixer-section">
          <div class="mixer-section-label">Layers</div>

          <div class="mixer-slider-row">
            <span class="mixer-label">Ambient</span>
            <input type="range" class="mixer-slider" min="0" max="100"
                   value="${Math.round(ambientVolume * 100)}" data-target="ambient"
                   aria-label="Ambient volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(ambientVolume * 100)}"/>
            <span class="mixer-value">${Math.round(ambientVolume * 100)}%</span>
          </div>

          <div class="mixer-slider-row">
            <span class="mixer-label">Interaction</span>
            <input type="range" class="mixer-slider" min="0" max="100"
                   value="${Math.round(interactionVolume * 100)}" data-target="interaction"
                   aria-label="Interaction volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(interactionVolume * 100)}"/>
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
                : `<button type="button" class="mixer-layer-toggle" data-pack="${pack.id}" aria-pressed="${this.isLayerActive(pack.id)}" aria-label="${pack.name} layer ${this.isLayerActive(pack.id) ? 'on' : 'off'}, tap to toggle">
                    ${this.isLayerActive(pack.id) ? 'On' : 'Off'}
                   </button>`
              }
            </div>
          `).join('')}
        </div>

        <button type="button" class="mixer-close-btn" aria-label="Close mixer">Done</button>
      </div>
    `;

    const sheet = this.element.querySelector('.mixer-sheet') as HTMLElement;
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

    this.element.querySelector('.mixer-backdrop')?.addEventListener('click', () => this.hide());
    this.element.querySelector('.mixer-close-btn')?.addEventListener('click', () => this.hide());

    this.element.querySelectorAll('.mixer-slider').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const target = (slider as HTMLInputElement).getAttribute('data-target');
        const rawVal = parseInt((e.target as HTMLInputElement).value, 10);
        const value = rawVal / 100;
        const valueEl = slider.parentElement?.querySelector('.mixer-value');
        if (valueEl) valueEl.textContent = `${rawVal}%`;
        (slider as HTMLInputElement).setAttribute('aria-valuenow', String(rawVal));

        if (target === 'master') this.store.update({ masterVolume: value });
        else if (target === 'ambient') this.store.update({ ambientVolume: value });
        else if (target === 'interaction') this.store.update({ interactionVolume: value });
      });
    });

    this.element.querySelectorAll('.mixer-layer-toggle').forEach(btn => {
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
    this.render();
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
        color: ${CONFIG.colors.text}; margin: 0 0 24px;
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
        margin-bottom: 14px;
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
        cursor: pointer;
      }
      .mixer-slider::-webkit-slider-thumb {
        -webkit-appearance: none; appearance: none;
        width: 22px; height: 22px; border-radius: 50%;
        background: ${CONFIG.colors.primary};
        cursor: pointer;
        border: 2px solid ${CONFIG.colors.surface};
        box-shadow: 0 1px 3px rgba(0,0,0,0.4);
        transition: transform 0.2s ease, background 0.4s ease;
      }
      .mixer-slider::-webkit-slider-thumb:hover {
        background: ${CONFIG.colors.primaryLight};
        transform: scale(1.08);
      }
      .mixer-slider::-moz-range-thumb {
        width: 22px; height: 22px; border-radius: 50%;
        background: ${CONFIG.colors.primary};
        cursor: pointer;
        border: 2px solid ${CONFIG.colors.surface};
        box-shadow: 0 1px 3px rgba(0,0,0,0.4);
      }
      .mixer-slider:focus-visible {
        outline: none;
      }
      .mixer-slider:focus-visible::-webkit-slider-thumb {
        box-shadow: 0 0 0 3px ${CONFIG.colors.primaryLight}80, 0 1px 3px rgba(0,0,0,0.4);
      }
      .mixer-slider:focus-visible::-moz-range-thumb {
        box-shadow: 0 0 0 3px ${CONFIG.colors.primaryLight}80, 0 1px 3px rgba(0,0,0,0.4);
      }
      .mixer-value {
        font-size: 12px; color: ${CONFIG.colors.textMuted};
        min-width: 40px; text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .mixer-layer-row {
        display: flex; align-items: center;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid ${CONFIG.colors.surfaceLight}40;
        min-height: 48px;
      }
      .mixer-layer-row.locked { opacity: 0.5; }
      .mixer-layer-toggle {
        background: ${CONFIG.colors.surfaceLight};
        border: none; border-radius: 8px;
        padding: 6px 16px; color: ${CONFIG.colors.text};
        font-size: 12px; cursor: pointer;
        transition: background 0.4s ease;
        min-height: 36px; min-width: 60px;
      }
      .mixer-layer-toggle:hover { background: ${CONFIG.colors.primary}30; }
      .mixer-layer-toggle:active { background: ${CONFIG.colors.primary}30; }
      .mixer-layer-toggle:focus-visible { outline-color: ${CONFIG.colors.primary}; }
      .mixer-premium-badge {
        font-size: 10px; color: ${CONFIG.colors.premium};
        font-weight: 600; letter-spacing: 0.5px;
      }
      .mixer-close-btn {
        width: 100%; padding: 14px; margin-top: 8px;
        background: ${CONFIG.colors.primary};
        border: none; border-radius: 12px;
        color: #fff; font-size: 15px; font-weight: 500;
        cursor: pointer;
        transition: background 0.4s ease, transform 0.3s ease;
        min-height: 48px;
      }
      .mixer-close-btn:hover { background: ${CONFIG.colors.primaryLight}; }
      .mixer-close-btn:active { transform: scale(0.99); }
      .mixer-close-btn:focus-visible {
        outline-color: ${CONFIG.colors.primaryLight};
        outline-offset: 4px;
      }
    `;
    document.head.appendChild(style);
  }
}
