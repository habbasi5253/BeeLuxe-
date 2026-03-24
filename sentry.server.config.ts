// Sentry — Node.js server-side initialisation
// Runs inside the Next.js server process (API routes, Server Components, middleware).
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  environment: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',

  // 100% on staging so we catch every edge case before going live
  tracesSampleRate: process.env.NEXT_PUBLIC_APP_ENV === 'production' ? 0.2 : 1.0,

  release: process.env.VERCEL_GIT_COMMIT_SHA,

  // Attach basic request info (URL, method) but NOT request body — contains PII.
  // The beforeSend hook below strips anything that slips through.
  beforeSend(event) {
    // Strip any phone numbers that might appear in breadcrumb messages or extras.
    // Pattern: any sequence of 10+ digits (US phone)
    const sanitize = (s: string) => s.replace(/\b\d{7,}\b/g, '•••-REDACTED')

    if (event.message)            event.message            = sanitize(event.message)
    if (event.transaction)        event.transaction        = sanitize(event.transaction)
    if (event.request?.url)       event.request.url        = sanitize(event.request.url)

    // Never send request body to Sentry — it may contain applicant PII
    if (event.request)            delete event.request.data

    return event
  },
})
