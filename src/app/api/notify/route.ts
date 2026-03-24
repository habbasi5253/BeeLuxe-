/**
 * POST /api/notify — Send a notification to a cleaner
 * GET  /api/notify — Batch 24h reminders (cron job endpoint)
 *
 * CHANNEL ROUTING (cost-optimised):
 *   1. Email via Resend    — FREE (3,000/month), preferred
 *   2. SMS via Twilio      — $0.0075/msg, fallback when email unavailable
 *   3. Demo mode           — logs message preview when neither is configured
 *
 * The `channel` field in the request body lets callers override routing:
 *   "email"  → Resend only
 *   "sms"    → Twilio only (requires Twilio env vars)
 *   "auto"   → email first, SMS if email field missing (default)
 */
import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { sendNotificationEmail, type NotifyType } from '@/lib/mailer'
import { logger } from '@/lib/logger'

export interface NotifyPayload {
  type:         NotifyType
  phone?:       string             // required for SMS channel
  email?:       string             // required for email channel
  cleaner_name: string
  job_title?:   string
  address?:     string
  city?:        string
  start_time?:  string
  message?:     string
  channel?:     'email' | 'sms' | 'auto'
}

// ── SMS body builder (kept for Twilio fallback) ────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'America/Chicago',
  })
}

function buildSMS(payload: NotifyPayload): string {
  const { type, cleaner_name, job_title, address, city, start_time, message } = payload
  const firstName = cleaner_name.split(' ')[0]
  const location  = city ? `${address}, ${city}` : address
  const time      = start_time ? formatTime(start_time) : null

  switch (type) {
    case 'assignment':
      return `Hi ${firstName}! 🐝 You've been assigned: ${job_title}` +
        (location ? ` at ${location}` : '') + (time ? ` on ${time}` : '') +
        `. Log in to your portal for the checklist. Reply CONFIRM to acknowledge. -BeeLuxe`
    case 'reminder_24h':
      return `Hey ${firstName}, reminder 🐝: Job tomorrow — ${job_title}` +
        (location ? ` at ${location}` : '') + (time ? ` at ${time}` : '') +
        `. Reply CONFIRM or call us ASAP. -BeeLuxe`
    case 'reminder_1h':
      return `${firstName}, your job starts in ~1 hour! ${job_title}` +
        (location ? ` — ${location}` : '') + `. Safe travels! 🐝 -BeeLuxe`
    case 'custom':
      return message ?? `Message from BeeLuxe Cleaners. -BeeLuxe`
  }
}

// ── Route handlers ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let payload: NotifyPayload | undefined
  try {
    payload = await req.json() as NotifyPayload

    if (!payload.cleaner_name) {
      return NextResponse.json({ error: 'cleaner_name is required' }, { status: 400 })
    }

    const channel = payload.channel ?? 'auto'

    // ── EMAIL path ──────────────────────────────────────────────────────────
    if (channel === 'email' || (channel === 'auto' && payload.email)) {
      if (!payload.email) {
        return NextResponse.json({ error: 'email is required for email channel' }, { status: 400 })
      }
      const result = await sendNotificationEmail({
        type:         payload.type,
        email:        payload.email,
        cleaner_name: payload.cleaner_name,
        job_title:    payload.job_title,
        address:      payload.address,
        city:         payload.city,
        start_time:   payload.start_time,
        message:      payload.message,
      })
      if (!result.success) throw new Error(result.error ?? 'Email send failed')
      logger.info('notify', 'Email sent', { type: payload.type, demo: result.demo })
      return NextResponse.json({ success: true, channel: 'email', id: result.id, demo: result.demo })
    }

    // ── SMS path (Twilio) ───────────────────────────────────────────────────
    if (channel === 'sms' || channel === 'auto') {
      if (!payload.phone) {
        return NextResponse.json({ error: 'phone is required for SMS channel' }, { status: 400 })
      }
      const smsBody = buildSMS(payload)

      // Demo mode — Twilio not configured
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        const redacted = payload.phone.replace(/\d(?=\d{4})/g, '•')
        logger.info('notify', `[DEMO] SMS to ${redacted}: ${smsBody}`)
        return NextResponse.json({ success: true, demo: true, channel: 'sms', message_preview: smsBody })
      }

      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      const msg = await client.messages.create({
        body: smsBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to:   payload.phone,
      })
      logger.info('notify', 'SMS sent', { sid: msg.sid })
      return NextResponse.json({ success: true, channel: 'sms', sid: msg.sid })
    }

    return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
  } catch (err) {
    logger.error('notify', err, { type: payload?.type })
    return NextResponse.json({ error: 'Notification service unavailable' }, { status: 500 })
  }
}

// Batch 24h reminders — triggered by Vercel Cron daily at 8 AM CST
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  if (secret !== (process.env.NOTIFY_SECRET ?? 'beeluxe-notify')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // TODO: query Supabase for jobs starting tomorrow that have an assigned cleaner
  // with an email address, then call sendNotificationEmail() for each.
  return NextResponse.json({
    message: 'Batch 24h reminder would run here against the DB.',
    tip: 'Wired to Vercel Cron via vercel.json — runs daily at 8 AM CST.',
  })
}
