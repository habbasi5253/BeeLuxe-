/**
 * GET /api/health
 *
 * Uptime monitor endpoint. Returns JSON describing the status of each
 * external dependency BeeLuxe relies on. Point UptimeRobot / Better Uptime /
 * Datadog at this URL and alert when status !== "ok".
 *
 * Response shape:
 *   { status: "ok" | "degraded", env, services: { ... }, uptime_ms }
 *
 * HTTP status codes:
 *   200 — all services reachable
 *   503 — one or more services unavailable (monitor should page)
 */
import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

interface ServiceStatus {
  status: 'ok' | 'missing' | 'error'
  note?: string
}

function checkEnvPresent(keys: string[]): ServiceStatus {
  const missing = keys.filter((k) => !process.env[k])
  if (missing.length === 0) return { status: 'ok' }
  return {
    status: 'missing',
    note: `Missing env vars: ${missing.join(', ')}`,
  }
}

export async function GET() {
  const start = Date.now()

  const services: Record<string, ServiceStatus> = {
    supabase: checkEnvPresent([
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ]),
    twilio: checkEnvPresent([
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER',
    ]),
    anthropic: checkEnvPresent(['ANTHROPIC_API_KEY']),
    sentry: checkEnvPresent(['SENTRY_DSN', 'NEXT_PUBLIC_SENTRY_DSN']),
  }

  // In production, do a live Supabase reachability check (lightweight ping)
  if (env.isProduction || env.isStaging) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (supabaseUrl) {
        const res = await fetch(`${supabaseUrl}/rest/v1/`, {
          headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '' },
          signal: AbortSignal.timeout(3000),
        })
        services.supabase = res.ok || res.status === 400
          ? { status: 'ok' }                           // 400 = "no table specified" but DB is alive
          : { status: 'error', note: `HTTP ${res.status}` }
      }
    } catch (err) {
      services.supabase = {
        status: 'error',
        note: err instanceof Error ? err.message : 'unreachable',
      }
    }
  }

  const degraded = Object.values(services).some((s) => s.status !== 'ok')
  const httpStatus = degraded ? 503 : 200

  return NextResponse.json(
    {
      status: degraded ? 'degraded' : 'ok',
      environment: env.appEnv,
      uptime_ms: Date.now() - start,
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
      services,
    },
    { status: httpStatus }
  )
}
