/**
 * BeeLuxe Mailer — Resend (3,000 free emails/month)
 *
 * Replaces per-SMS Twilio cost with free email notifications to cleaners.
 * Resend free tier: 3,000 emails/month, 100/day — more than enough for MVP.
 *
 * Setup (5 min):
 *   1. Create account at https://resend.com
 *   2. Add & verify your domain (or use the free @resend.dev test address for dev)
 *   3. Create an API key → set RESEND_API_KEY env var
 *   4. Set RESEND_FROM_EMAIL (e.g. "BeeLuxe Cleaners <dispatch@beeluxecleaners.com>")
 *
 * All email subjects + bodies are defined here so they're easy to update
 * without touching the API route.
 */

import { Resend } from 'resend'

let _resend: Resend | null = null
function resendClient(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM = () =>
  process.env.RESEND_FROM_EMAIL ?? 'BeeLuxe Cleaners <onboarding@resend.dev>'

// ── Time formatter (Chicago / CST) ────────────────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'America/Chicago',
  })
}

// ── HTML email templates ──────────────────────────────────────────────────────
function layout(body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <tr>
          <td style="background:#1a1a2e;padding:20px 32px">
            <span style="color:#fbbf24;font-size:22px;font-weight:700;letter-spacing:-0.5px">🐝 BeeLuxe Cleaners</span>
          </td>
        </tr>
        <tr><td style="padding:32px">${body}</td></tr>
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #f0f0f0">
            <p style="margin:0;font-size:12px;color:#999">
              BeeLuxe Cleaners · Houston, TX ·
              <a href="https://beeluxecleaners.com" style="color:#6366f1;text-decoration:none">beeluxecleaners.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function h1(text: string) {
  return `<h1 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#1a1a2e">${text}</h1>`
}
function p(text: string) {
  return `<p style="margin:0 0 12px;font-size:15px;color:#374151;line-height:1.6">${text}</p>`
}
function infoBox(rows: [string, string][]) {
  const rowsHtml = rows.map(([label, val]) => `
    <tr>
      <td style="padding:8px 12px;font-size:13px;color:#6b7280;width:120px">${label}</td>
      <td style="padding:8px 12px;font-size:13px;color:#1a1a2e;font-weight:500">${val}</td>
    </tr>`).join('')
  return `<table cellpadding="0" cellspacing="0" style="width:100%;background:#f9fafb;border-radius:8px;margin:16px 0">${rowsHtml}</table>`
}
function ctaButton(text: string, url: string) {
  return `<a href="${url}" style="display:inline-block;margin:16px 0 0;padding:12px 28px;background:#fbbf24;color:#1a1a2e;font-weight:700;font-size:14px;border-radius:8px;text-decoration:none">${text}</a>`
}

// ── Email builders ─────────────────────────────────────────────────────────────
export type NotifyType = 'assignment' | 'reminder_24h' | 'reminder_1h' | 'custom'

export interface NotifyPayload {
  type:         NotifyType
  email:        string
  cleaner_name: string
  job_title?:   string
  address?:     string
  city?:        string
  start_time?:  string
  message?:     string
}

interface EmailContent { subject: string; html: string }

function buildEmail(payload: NotifyPayload): EmailContent {
  const { type, cleaner_name, job_title, address, city, start_time, message } = payload
  const firstName = cleaner_name.split(' ')[0]
  const location  = city ? `${address}, ${city}, TX` : (address ?? '')
  const time      = start_time ? formatTime(start_time) : null
  const portalUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://beeluxecleaners.com'

  switch (type) {
    case 'assignment':
      return {
        subject: `🐝 New Job Assigned: ${job_title ?? 'BeeLuxe Job'}`,
        html: layout(
          h1(`Hi ${firstName}, you've been assigned a new job!`) +
          p(`You have a new cleaning job waiting in your portal. Here are the details:`) +
          infoBox([
            ['Job',      job_title ?? '—'],
            ['Location', location  || '—'],
            ['Date/Time', time     ?? '—'],
          ]) +
          p('Please log in to your portal to view the full checklist and confirm the job. Reply <strong>CONFIRM</strong> in the portal or contact dispatch.') +
          ctaButton('Open My Portal →', `${portalUrl}/portal`)
        ),
      }

    case 'reminder_24h':
      return {
        subject: `⏰ Reminder: Your job is tomorrow — ${job_title ?? 'BeeLuxe Job'}`,
        html: layout(
          h1(`Hey ${firstName} — job reminder for tomorrow!`) +
          p('This is your 24-hour reminder for your upcoming BeeLuxe job:') +
          infoBox([
            ['Job',      job_title ?? '—'],
            ['Location', location  || '—'],
            ['Time',     time      ?? '—'],
          ]) +
          p('Please confirm you're good to go by logging into your portal. If there's a problem, contact dispatch <strong>right away</strong> so we can arrange coverage.') +
          ctaButton('View Job Details →', `${portalUrl}/portal`)
        ),
      }

    case 'reminder_1h':
      return {
        subject: `🚗 Heads up — your job starts in ~1 hour!`,
        html: layout(
          h1(`${firstName}, your job starts in about 1 hour!`) +
          p(`You're cleaning <strong>${job_title ?? 'a BeeLuxe job'}</strong>${location ? ` at <strong>${location}</strong>` : ''} ${time ? `at <strong>${time}</strong>` : 'soon'}.`) +
          p('Safe travels! Open the portal for your checklist.') +
          ctaButton('Open Checklist →', `${portalUrl}/portal`)
        ),
      }

    case 'custom':
      return {
        subject: `📬 Message from BeeLuxe Cleaners`,
        html: layout(
          h1(`Hey ${firstName},`) +
          p(message ?? 'You have a message from BeeLuxe Cleaners dispatch.') +
          ctaButton('Open Portal →', `${portalUrl}/portal`)
        ),
      }
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────
export interface SendEmailResult {
  success: boolean
  id?:     string
  demo?:   boolean
  error?:  string
}

export async function sendNotificationEmail(payload: NotifyPayload): Promise<SendEmailResult> {
  // Demo mode — RESEND_API_KEY not configured
  if (!process.env.RESEND_API_KEY) {
    const { subject } = buildEmail(payload)
    console.log(`[DEMO] Email to ${payload.email}: ${subject}`)
    return { success: true, demo: true }
  }

  const { subject, html } = buildEmail(payload)

  const { data, error } = await resendClient().emails.send({
    from:    FROM(),
    to:      [payload.email],
    subject,
    html,
  })

  if (error) return { success: false, error: error.message }
  return { success: true, id: data?.id }
}
