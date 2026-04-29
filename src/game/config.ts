export const CONFIG = {
  // Visual
  bgColor: 0x0a0a14,
  ambientLightColor: 0xc8c0d8,
  ambientLightIntensity: 0.3,
  directionalLightColor: 0xffeedd,
  directionalLightIntensity: 0.5,
  directionalLightPosition: [2, 5, 3] as [number, number, number],

  // Camera
  cameraFov: 55,
  cameraPosition: [0, 2, 5] as [number, number, number],
  cameraLookAt: [0, 0.5, 0] as [number, number, number],

  // Scene transitions
  sceneFadeDuration: 800,
  sceneTransitionDelay: 200,

  // Audio (legacy mixer system)
  audioFadeInDuration: 1500,
  audioFadeOutDuration: 2000,
  maxSimultaneousSounds: 8,
  interactionSoundCooldownMs: 100,
  loopCrossfadeDuration: 500,

  // Interaction audio (new 3-layer system)
  interaction: {
    // Tap randomization
    tapPitchMin: 0.97,
    tapPitchMax: 1.03,
    tapVolumeMin: 0.90,
    tapVolumeMax: 1.00,
    tapCooldownMs: 80,
    maxOverlappingTaps: 4,

    // Drag behavior (Method A: loop + modulation)
    dragFadeInMs: 200,
    dragFadeOutMs: 300,
    dragMinVolume: 0.05,
    dragMaxVolume: 0.55,
    dragSpeedNormalize: 15, // pixels/frame to normalize speed 0-1

    // Hold behavior
    holdFadeInMs: 300,
    holdFadeOutMs: 250,
    holdMaxVolume: 0.35,

    // Ambient one-shot scheduling
    ambientMinIntervalMs: 8000,
    ambientMaxIntervalMs: 30000,
    ambientMaxVolume: 0.30,
  },

  // Interaction input
  tapFeedbackDuration: 150,
  dragMinDistance: 10,
  holdThresholdMs: 400,
  holdLayerFadeIn: 500,
  holdLayerFadeOut: 300,

  // Sleep Timer
  timerOptions: [
    { label: '5 min', ms: 300000 },
    { label: '10 min', ms: 600000 },
    { label: '30 min', ms: 1800000 },
    { label: '1 hour', ms: 3600000 },
  ] as { label: string; ms: number }[],
  timerFadeDuration: 30000, // 30s fade before end
  timerDimOpacity: 0.85,

  // Mixer
  mixerMaxLayers: 5,
  mixerVolumeStep: 0.05,

  // Subscription
  monthlyPrice: 4.99,
  yearlyPrice: 29.99,

  // Paywall triggers
  paywallMinSessions: 2,
  paywallMaxShowsPerDay: 2,

  // UI
  uiAutoHideDelay: 4000,
  uiFadeInDuration: 300,
  uiFadeOutDuration: 500,
  splashDuration: 2000,

  // Haptics
  hapticTapStyle: 'Light' as const,
  hapticHoldStyle: 'Medium' as const,

  // Colors (calming palette)
  colors: {
    background: '#0a0a14',
    surface: '#141420',
    surfaceLight: '#1e1e2e',
    primary: '#7c6fb0',
    primaryLight: '#a393d3',
    accent: '#4a90a4',
    text: '#e8e4df',
    textMuted: '#8a8692',
    textDim: '#7a7682',
    timerActive: '#6bb88f',
    premium: '#c9a84c',
    premiumGlow: '#e6c96a',
    danger: '#c75a5a',
  },

  // Scene-specific colors
  sceneColors: {
    'rain-window': {
      ambient: 0x8899bb,
      directional: 0xaabbdd,
      fog: 0x0a0a18,
    },
    'cozy-room': {
      ambient: 0xddaa77,
      directional: 0xffcc88,
      fog: 0x120e08,
    },
    'sand-table': {
      ambient: 0xccbb99,
      directional: 0xeeddbb,
      fog: 0x0e0c08,
    },
  } as Record<string, { ambient: number; directional: number; fog: number }>,
} as const;
