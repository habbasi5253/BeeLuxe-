import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

export type NotifyType = 'assignment' | 'reminder_24h' | 'reminder_1h' | 'custom'

export interface NotifyPayload {
  type: NotifyType
  phone: string
  cleaner_name: string
  job_title?: string
  address?: string
  city?: string
  start_time?: string     // ISO string
  message?: string        // used for 'custom' type
}

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
  const location = city ? `${address}, ${city}` : address
  const time = start_time ? formatTime(start_time) : null

  switch (type) {
    case 'assignment':
      return `Hi ${firstName}! 🐝 You've been assigned a new job — ${job_title}` +
        (location ? ` at ${location}` : '') +
        (time ? ` on ${time}` : '') +
        `. Log in to your portal for the checklist. Reply CONFIRM to acknowledge. -BeeLuxe`

    case 'reminder_24h':
      return `Hey ${firstName}, reminder from BeeLuxe 🐝: You have a job tomorrow — ${job_title}` +
        (location ? ` at ${location}` : '') +
        (time ? ` at ${time}` : '') +
        `. Please reply CONFIRM if you're good to go, or call us ASAP. -BeeLuxe`

    case 'reminder_1h':
      return `${firstName}, your job starts in ~1 hour! ${job_title}` +
        (location ? ` — ${location}` : '') +
        `. Safe travels! 🐝 -BeeLuxe`

    case 'custom':
      return message ?? `Message from BeeLuxe Cleaners. -BeeLuxe`
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json() as NotifyPayload

    if (!payload.phone || !payload.cleaner_name) {
      return NextResponse.json({ error: 'phone and cleaner_name are required' }, { status: 400 })
    }

    const smsBody = buildSMS(payload)

    // If Twilio creds aren't configured, return the message preview without sending
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      // Redact all but the last 4 digits — phone numbers are PII and must not
      // appear in plain-text server logs.
      const redactedPhone = payload.phone.replace(/\d(?=\d{4})/g, '•')
      console.log(`[DEMO] SMS to ${redactedPhone}: ${smsBody}`)
      return NextResponse.json({
        success: true,
        demo: true,
        message_preview: smsBody,
        // Never echo raw phone numbers back to the client — return redacted form.
        to: redactedPhone,
      })
    }

    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    const msg = await client.messages.create({
      body: smsBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: payload.phone,
    })

    return NextResponse.json({ success: true, sid: msg.sid, to: payload.phone })
  } catch (err) {
    // Log only the error message — the payload contains cleaner phone numbers (PII).
    const message = err instanceof Error ? err.message : 'unknown error'
    console.error('Notify API error:', message)
    return NextResponse.json({ error: 'SMS service unavailable' }, { status: 500 })
  }
}

// Batch: send 24hr reminders for all jobs scheduled tomorrow
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')

  // Simple secret guard so this isn't publicly callable
  if (secret !== (process.env.NOTIFY_SECRET ?? 'beeluxe-notify')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // In production: query DB for jobs starting tomorrow that have an assigned cleaner
  // For demo, return a mock response
  return NextResponse.json({
    message: 'Batch 24hr reminder would run here against the DB.',
    tip: 'Wire this to a cron job (Vercel Cron, GitHub Actions, etc.) to run daily at 8 AM.',
  })
}
