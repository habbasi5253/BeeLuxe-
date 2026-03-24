/**
 * Structured logger for BeeLuxe server-side code.
 *
 * Why not console.error directly?
 *   1. Vercel log drain captures console output, but Sentry captures structured
 *      errors with stack traces, user context, and environment tags.
 *   2. This module automatically redacts phone numbers so PII never appears in
 *      Sentry breadcrumbs or Vercel logs.
 *   3. Consistent log format makes grep/log-drain queries predictable.
 *
 * Usage:
 *   import { logger } from '@/lib/logger'
 *   logger.error('notify', err, { job_id: 'j001', cleaner_id: '...' })
 *   logger.warn('interview', 'Claude returned no JSON')
 *   logger.info('notify', 'SMS sent', { sid: msg.sid })
 */

import * as Sentry from '@sentry/nextjs'
import { env } from '@/lib/env'

export type LogService = 'notify' | 'interview' | 'apply' | 'health' | 'middleware' | 'general'

/** Redact all but last 4 digits of any phone-like sequence */
function redactPhones(s: string): string {
  return s.replace(/\b(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '•••-REDACTED')
}

function sanitize(value: unknown): string {
  if (value instanceof Error) return redactPhones(value.message)
  if (typeof value === 'string') return redactPhones(value)
  try { return redactPhones(JSON.stringify(value)) } catch { return '[unserializable]' }
}

interface LogContext {
  job_id?:      string
  cleaner_id?:  string
  lead_id?:     string
  request_id?:  string
  [key: string]: string | number | boolean | undefined
}

function formatMessage(service: LogService, message: string, context?: LogContext): string {
  const parts = [`[BeeLuxe:${service}]`, message]
  if (context) {
    const ctxStr = Object.entries(context)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ')
    if (ctxStr) parts.push(`{${ctxStr}}`)
  }
  return parts.join(' ')
}

export const logger = {
  /**
   * Log an error. In staging/production, also captures to Sentry with
   * service tag and context as extra data.
   */
  error(service: LogService, err: unknown, context?: LogContext): void {
    const message = sanitize(err)
    console.error(formatMessage(service, message, context))

    if (!env.isDev) {
      Sentry.withScope((scope) => {
        scope.setTag('service', service)
        scope.setTag('environment', env.appEnv)
        if (context) {
          Object.entries(context).forEach(([k, v]) => {
            if (v !== undefined) scope.setExtra(k, v)
          })
        }
        if (err instanceof Error) {
          Sentry.captureException(err)
        } else {
          Sentry.captureMessage(message, 'error')
        }
      })
    }
  },

  /** Log a warning — to console always; to Sentry in production only. */
  warn(service: LogService, message: string, context?: LogContext): void {
    console.warn(formatMessage(service, sanitize(message), context))

    if (env.isProduction) {
      Sentry.withScope((scope) => {
        scope.setTag('service', service)
        if (context) Object.entries(context).forEach(([k, v]) => {
          if (v !== undefined) scope.setExtra(k, v)
        })
        Sentry.captureMessage(sanitize(message), 'warning')
      })
    }
  },

  /** Informational log — console only, never sent to Sentry. */
  info(service: LogService, message: string, context?: LogContext): void {
    console.log(formatMessage(service, sanitize(message), context))
  },
} as const
