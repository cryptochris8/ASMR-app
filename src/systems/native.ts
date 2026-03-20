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
}
