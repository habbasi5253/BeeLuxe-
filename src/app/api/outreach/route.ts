import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { lead, mode, tone } = await req.json() as {
      lead: {
        contact_name: string
        company_name: string | null
        lead_type: string
        city: string | null
        state: string | null
        cleaning_frequency: string | null
        project_value: number | null
        notes: string | null
      }
      mode: 'email' | 'sms'
      tone: 'professional' | 'friendly'
    }

    const firstName = lead.contact_name.split(' ')[0]
    const company = lead.company_name ? ` at ${lead.company_name}` : ''
    const location = lead.city ? `${lead.city}, ${lead.state ?? 'TX'}` : 'the local area'
    const freq = lead.cleaning_frequency?.replace('_', '-') ?? 'regular'
    const typeLabel: Record<string, string> = {
      residential:  'residential home cleaning',
      commercial:   'commercial/office cleaning',
      airbnb:       'Airbnb / short-term rental turnover cleaning',
      deep_clean:   'one-time deep clean',
      move_in_out:  'move-in/move-out cleaning',
      industrial:   'industrial facility cleaning',
    }
    const serviceType = typeLabel[lead.lead_type] ?? 'cleaning service'

    const systemPrompt = `You are a sales copywriter for BeeLuxe Cleaners, a professional cleaning company serving B2C and B2B clients. Write concise, compelling outreach copy that feels genuine — never pushy or generic. The company phone is (713) 555-LUXE and email is hello@beeluxecleaners.com.`

    const userPrompt = mode === 'email'
      ? `Write a ${tone} outreach email to ${firstName}${company} in ${location} about our ${serviceType} service (${freq} frequency${lead.project_value ? `, estimated value $${lead.project_value.toLocaleString()}` : ''}). ${lead.notes ? `Context: ${lead.notes}` : ''} Include a subject line. Keep it concise (under 200 words). End with a clear call to action.`
      : `Write a ${tone} SMS outreach message to ${firstName}${company} in ${location} about our ${serviceType} service. ${lead.notes ? `Context: ${lead.notes}` : ''} Keep it under 160 characters. Include a call to action.`

    const result = await chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
      ],
      { maxTokens: 400 }
    )

    return NextResponse.json({ template: result.text })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI generation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
