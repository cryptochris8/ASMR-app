/**
 * Rain Window Scene — tunable configuration.
 *
 * All placement, sizing, and effect values are centralized here
 * so the scene can be visually tuned without touching logic code.
 */
export const RAIN_WINDOW_CONFIG = {
  // ── Interaction Plane Placement ──────────────────────────
  // Aligned with the visible window in the skybox.
  // Adjust x/y/z after previewing the skybox.
  plane: {
    x: -0.3,       // slightly left of center
    y: 1.2,        // vertically centered in view
    z: 1.0,        // depth from camera (camera is at z=5)
    width: 1.8,
    height: 2.8,
    rotationY: 0,  // slight rotation if window is angled
  },

  // ── Glass Material ───────────────────────────────────────
  glass: {
    color: 0x8899bb,
    opacity: 0.06,    // near-invisible — just enough sheen
    roughness: 0.2,
    metalness: 0.1,
  },

  // ── Rain FX Overlay ──────────────────────────────────────
  rain: {
    scrollSpeed: 0.04,        // UV scroll per second (slow drip)
    opacity: 0.12,            // overall rain layer opacity
    streakCount: 60,          // streaks per canvas layer
    dropletCount: 100,        // small droplets per canvas layer
    textureSize: 512,         // canvas resolution
    layers: 2,                // number of parallax rain layers
    layerSpeedRatio: 1.6,     // each layer scrolls this much faster
  },

  // ── Condensation / Drag Trail ────────────────────────────
  trail: {
    canvasSize: 512,
    lineWidth: 18,            // finger-width trace
    fadeRate: 0.012,          // per-frame alpha reduction (slow fade)
    color: 'rgba(180, 210, 240, 0.25)',
  },

  // ── Tap Ripple ───────────────────────────────────────────
  ripple: {
    radius: 22,               // pixels on canvas
    opacity: 0.3,
  },
};
