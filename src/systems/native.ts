import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export async function initNative(): Promise<void> {
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0a0a14' });
  } catch {
    // Not running in Capacitor (web)
  }

  try {
    await SplashScreen.hide();
  } catch {
    // Not running in Capacitor (web)
  }

  await initBackgroundAudio();
}

// PHASE 5 INTEGRATION (background audio on lock screen):
//   npm install @capacitor-community/music-controls
//   npx cap sync
// Then replace this stub with:
//   import { CapacitorMusicControls } from '@capacitor-community/music-controls';
//   await CapacitorMusicControls.create({
//     track: 'ASMR Sleep',
//     artist: 'Calm',
//     isPlaying: true,
//     hasPrev: false, hasNext: false, hasClose: true,
//     dismissable: true,
//     playIcon: 'media_play', pauseIcon: 'media_pause',
//   });
// On iOS this also needs AVAudioSessionCategoryPlayback to be set in the
// native audio session — the plugin handles it, but verify the iOS Info.plist
// has UIBackgroundModes including 'audio' after `cap sync`.
//
// Without this plugin, audio dies the moment the screen locks (~3 min on iOS,
// immediately on Android). This is the #1 ship-blocker for a sleep app.
async function initBackgroundAudio(): Promise<void> {
  // no-op until phase 5
}
