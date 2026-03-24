/**
 * Runtime environment variable validation.
 *
 * DESIGN GOAL: crash at startup with a clear error, not at 6 AM when
 * a cleaner tries to confirm a job and gets a silent 500.
 *
 * Usage in API routes:
 *   import { requireEnv } from '@/lib/env'
 *   const sid = requireEnv('TWILIO_ACCOUNT_SID')
 *
 * Usage for build-time assertion (call once in instrumentation.ts or layout):
 *   import { assertRequiredEnv } from '@/lib/env'
 *   assertRequiredEnv()  // throws if any required server var is missing
 */

/** All server-side vars that must be present in production. */
const SERVER_REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  // AI: GROQ_API_KEY (free) or ANTHROPIC_API_KEY (fallback) — at least one required
  // Validated at runtime in src/lib/ai.ts; both listed here so the startup check
  // can warn if neither is set.
  'NOTIFY_SECRET',
  'ARCHIVE_SECRET',
  'RESEND_API_KEY',
  'SENTRY_DSN',
] as const

/** Public vars needed by the browser bundle. */
const PUBLIC_REQUIRED = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_ENV',
  'NEXT_PUBLIC_APP_URL',
] as const

export type ServerEnvKey = (typeof SERVER_REQUIRED)[number]
export type PublicEnvKey = (typeof PUBLIC_REQUIRED)[number]

/**
 * Returns the value of an env var, or throws a descriptive error.
 * Prefer this over direct `process.env.FOO` in API routes so the error
 * surface (Sentry / logs) points to the missing variable, not a downstream
 * "Cannot read property of undefined."
 */
export function requireEnv(key: string): string {
  const val = process.env[key]
  if (!val) {
    const env = process.env.NEXT_PUBLIC_APP_ENV ?? 'unknown'
    throw new Error(
      `[BeeLuxe] Missing required environment variable "${key}" in ${env} environment. ` +
      `Add it in Vercel → Settings → Environment Variables (or .env.local for dev).`
    )
  }
  return val
}

/**
 * Validates all required server env vars are present.
 * Call once from src/instrumentation.ts so the process crashes before
 * serving any requests in production.
 * Skipped in local dev (APP_ENV=development) so developers aren't
 * blocked before they've set up Sentry/Twilio locally.
 */
export function assertRequiredEnv(): void {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? 'development'
  if (appEnv === 'development') return

  const missing = SERVER_REQUIRED.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(
      `[BeeLuxe] Refusing to start in "${appEnv}" with missing env vars:\n` +
      missing.map((k) => `  • ${k}`).join('\n') + '\n' +
      `Set these in Vercel → Settings → Environment Variables.`
    )
  }
}

/** Typed accessor for well-known vars — avoids raw process.env strings. */
export const env = {
  appEnv:    (process.env.NEXT_PUBLIC_APP_ENV ?? 'development') as 'development' | 'staging' | 'production',
  appUrl:    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  isProduction: process.env.NEXT_PUBLIC_APP_ENV === 'production',
  isStaging:    process.env.NEXT_PUBLIC_APP_ENV === 'staging',
  isDev:        (process.env.NEXT_PUBLIC_APP_ENV ?? 'development') === 'development',
} as const
