import { SceneId } from '../game/state';

/** Canonical asset manifest entry. schema_version defaults to 1 at validate-time. */
export interface AssetStatus {
  id: string;
  file: string;           // path relative to public/audio/
  scene: string;          // which scene uses this (or 'all' for cross-scene packs)
  system: 'interaction' | 'mixer';
  category: string;       // ambience, tap, drag, hold, one-shot, mixer-layer
  provider: 'user-manual' | 'claude-generated' | 'claude-processed';
  status: 'present' | 'missing' | 'needs-processing';
  isPremium: boolean;
  isHeroAsset: boolean;
  notes: string;
  schema_version?: number;
}

/** Surface types that define the emotional character of interactions.
 *  Includes both raw materials (glass, wood, fabric, sand, ceramic) and
 *  named hotspot identifiers used by skybox-with-hotspots scenes. */
export type SurfaceType =
  | 'glass' | 'wood' | 'fabric' | 'sand' | 'ceramic'
  | 'fireplace' | 'speaker' | 'bookshelf' | 'armchair' | 'pot'
  | 'jars' | 'spellbook' | 'candles' | 'herbs' | 'scale' | 'mortar';

/** Interaction sound categories */
export type InteractionCategory = 'tap' | 'drag' | 'hold';

/** A single audio asset reference with optional production metadata */
export interface AudioAssetRef {
  id: string;
  file: string;

  // Production metadata flags (all optional, won't break existing usage)
  /** Critical premium-quality sound that defines the scene */
  isHeroAsset?: boolean;
  /** Audio file was manually sourced/recorded (not generated) */
  isManualSource?: boolean;
  /** Temporary placeholder, needs a real replacement */
  isPlaceholder?: boolean;
  /** Flagged for quality upgrade even if functional */
  needsReplacement?: boolean;
  /** Has been processed for seamless looping (crossfade, zero-crossing trim) */
  isLoopPrepared?: boolean;
  /** Requires premium subscription to access */
  isPremium?: boolean;
  /** Interaction category this asset belongs to */
  interactionCategory?: 'tap' | 'drag' | 'hold' | 'ambient' | 'one-shot';
  /** Description of intended use for this asset */
  recommendedUse?: string;
}

/** Tap variation pool for a surface type */
export interface TapPool {
  surface: SurfaceType;
  sounds: AudioAssetRef[];
}

/** Drag loop set for a surface type */
export interface DragLoopSet {
  surface: SurfaceType;
  loops: AudioAssetRef[];
  accents?: AudioAssetRef[]; // optional short accent one-shots during drag
}

/** Hold layer for sustained interaction */
export interface HoldLayer {
  surface: SurfaceType;
  loops: AudioAssetRef[];
}

/** Ambient one-shot definition (extends AudioAssetRef for production metadata) */
export interface AmbientOneShot extends AudioAssetRef {
  minIntervalMs: number; // minimum time between triggers of this specific sound
  maxVolume: number;
}

/** Complete 3-layer audio definition for a scene */
export interface SceneAudioDef {
  sceneId: SceneId;

  /** Layer 1 — Base Ambience (long loops) */
  baseAmbience: AudioAssetRef[];

  /** Layer 2 — Interaction sounds */
  taps: TapPool[];
  drags: DragLoopSet[];
  holds: HoldLayer[];

  /** Layer 3 — Random ambient one-shots */
  ambientOneShots: AmbientOneShot[];
}

/** Playback configuration for the interaction system */
export interface InteractionAudioConfig {
  // Tap randomization
  tapPitchMin: number;      // 0.97
  tapPitchMax: number;      // 1.03
  tapVolumeMin: number;     // 0.90
  tapVolumeMax: number;     // 1.00
  tapCooldownMs: number;    // minimum between taps

  // Drag behavior
  dragFadeInMs: number;
  dragFadeOutMs: number;
  dragMinVolume: number;    // volume at zero speed
  dragMaxVolume: number;    // volume at full speed

  // Hold behavior
  holdFadeInMs: number;     // 150-400ms
  holdFadeOutMs: number;
  holdMaxVolume: number;

  // Ambient one-shot scheduling
  ambientMinIntervalMs: number;  // 8000
  ambientMaxIntervalMs: number;  // 30000
  ambientMaxVolume: number;

  // Performance
  maxOverlappingTaps: number;
  maxSimultaneousSounds: number;
}

