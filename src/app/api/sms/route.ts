import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function POST(req: NextRequest) {
  try {
    const { to, body, type } = await req.json() as {
      to: string
      body: string
      type: 'interview' | 'schedule' | 'reminder' | 'general'
    }

    if (!to || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    })

    return NextResponse.json({
      success: true,
      messageSid: message.sid,
      type,
    })
  } catch (err) {
    console.error('SMS API error:', err)
    return NextResponse.json({ error: 'SMS service unavailable' }, { status: 500 })
  }
}

// Webhook handler for incoming SMS replies (Twilio webhook)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('From')
  const body = searchParams.get('Body')

  if (!from || !body) {
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
  }

  // TODO: Match incoming SMS to candidate session and continue interview
  // This would lookup the candidate by phone number and pass the message to the AI
  console.log(`Incoming SMS from ${from}: ${body}`)

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thanks! We received your reply. BeeBot will follow up shortly.</Message>
</Response>`

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  })
}
