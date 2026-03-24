// Next.js instrumentation hook — runs once on server startup.
// This is the approved Next.js 14+ way to initialise Sentry on the server.
// See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
import { assertRequiredEnv } from '@/lib/env'

export async function register() {
  // Crash at startup (not at runtime) if required env vars are absent.
  // Only enforced in staging/production — dev builds skip this.
  assertRequiredEnv()

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}
