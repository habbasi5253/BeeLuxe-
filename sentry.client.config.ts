// Sentry — browser-side initialisation
// Runs once when the JS bundle is first evaluated in the user's browser.
// Kept intentionally minimal: replays and profiling are expensive; enable in
// production only after validating DSN and verifying consent for session data.
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',

  // Capture 100% of transactions in staging; 10% in production to stay within quota.
  tracesSampleRate: process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 0.1 : 1.0,

  // Session replays — disabled by default; enable with caution (captures PII).
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 0.5 : 0,

  // Don't flood Sentry with errors from ad blockers or browser extensions
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],

  // Tag every event with the release SHA for source map lookup
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
})
