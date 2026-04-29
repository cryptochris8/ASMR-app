import { Game } from './game/Game';
import './ui/NightOverlay';

// PHASE 5 INTEGRATION (crash + error reporting):
//   npm install @sentry/capacitor @sentry/browser
//   npx cap sync
// Then add VITE_SENTRY_DSN to the build env (CI secrets / .env.local) and
// uncomment the block below. Init must run BEFORE `new Game()` so any constructor
// error is captured. The native SDK is wired automatically by the Capacitor plugin.
//
// import * as Sentry from '@sentry/capacitor';
// import * as SentryBrowser from '@sentry/browser';
// if (import.meta.env.VITE_SENTRY_DSN) {
//   Sentry.init(
//     {
//       dsn: import.meta.env.VITE_SENTRY_DSN,
//       tracesSampleRate: 0.2,
//       beforeSend(event) {
//         // Strip any local audio paths from breadcrumbs before send
//         return event;
//       },
//     },
//     SentryBrowser.init,
//   );
// }

const container = document.getElementById('app');
if (container) {
  new Game(container);
}
