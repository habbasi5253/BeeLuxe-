import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ApplicationPayload {
  full_name: string
  phone: string
  email?: string
  currently_employed?: string          // where they work now
  experience_years: number
  experience_types: string[]           // basic, deep, airbnb, construction_trailer, move_in_out, commercial
  has_own_supplies: boolean | null
  willing_to_get_supplies: boolean | null
  willing_to_get_insurance: boolean | null   // ~$20/mo business insurance
  solo_or_helper: 'solo' | 'helper_sometimes' | 'always_helper'
  pet_allergies: boolean | null
  covers_service_area: boolean | null  // can commute throughout Houston metro
  unsatisfied_customer_response: string  // KEY behavioral question
  availability: string[]               // weekdays, weekends, early_morning, evenings, flexible
  income_goal_weekly?: string          // e.g. "$500"
  knows_booking_koala: boolean | null
  can_pass_background: boolean | null
  work_authorized: boolean | null
  has_transport: boolean | null
  motivation: string                   // what draws them to BeeLuxe
  notes?: string
}

export interface ApplicationResult {
  score: number
  recommendation: 'hire' | 'maybe' | 'reject'
  summary: string
  strengths: string[]
  concerns: string[]
  owner_notes: string
  auto_vetted: boolean
}

const EXP_LABEL: Record<string, string> = {
  basic: 'basic/routine cleaning',
  deep: 'deep cleaning',
  airbnb: 'Airbnb / short-term rental turnovers',
  construction_trailer: 'construction site trailer cleaning',
  move_in_out: 'move-in / move-out cleans',
  commercial: 'commercial / office cleaning',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ApplicationPayload

    // Hard disqualifiers — skip Claude call entirely
    // These are operational non-starters: no amount of experience overcomes them.
    const hardRejectReasons: string[] = []
    if (body.work_authorized === false)       hardRejectReasons.push('Not authorized to work in the U.S.')
    if (body.has_transport === false)         hardRejectReasons.push('No reliable transportation')
    if (body.can_pass_background === false)   hardRejectReasons.push('Cannot pass background check')
    if (body.covers_service_area === false)   hardRejectReasons.push('Cannot cover Houston metro service area')
    if (body.willing_to_get_insurance === false) hardRejectReasons.push('Unwilling to carry business insurance (~$20/mo required)')

    if (hardRejectReasons.length > 0) {
      return NextResponse.json({
        score: 10,
        recommendation: 'reject',
        summary: 'Applicant does not meet minimum operational requirements for BeeLuxe Cleaners.',
        strengths: [],
        concerns: hardRejectReasons,
        owner_notes: 'Hard disqualifier — do not proceed to interview.',
        auto_vetted: false,
      } satisfies ApplicationResult)
    }

    const expText = body.experience_types.map((t) => EXP_LABEL[t] ?? t).join(', ') || 'not specified'
    const availText = body.availability.map((a) => ({
      weekdays: 'Mon–Fri', weekends: 'weekends', early_morning: 'early morning (6–7 AM)',
      evenings: 'evenings', flexible: 'fully flexible',
    }[a] ?? a)).join(', ') || 'not specified'

    const prompt = `You are evaluating a cleaning job application for BeeLuxe Cleaners in Houston, TX.

APPLICANT: ${body.full_name}  |  Phone: ${body.phone}${body.email ? `  |  Email: ${body.email}` : ''}
Currently employed: ${body.currently_employed || 'not provided'}
Years experience: ${body.experience_years}
Clean types: ${expText}
Has own supplies: ${body.has_own_supplies == null ? 'not answered' : body.has_own_supplies ? 'Yes' : `No — willing to get: ${body.willing_to_get_supplies ? 'Yes' : 'No'}`}
Willing to get $20/mo business insurance: ${body.willing_to_get_insurance == null ? 'not answered' : body.willing_to_get_insurance ? 'Yes' : 'No'}
Works: ${body.solo_or_helper === 'solo' ? 'Solo only' : body.solo_or_helper === 'helper_sometimes' ? 'Solo, sometimes brings a helper' : 'Always brings a helper'}
Pet allergies: ${body.pet_allergies ? 'Yes' : 'No'}
Can cover Houston service area: ${body.covers_service_area ? 'Yes' : 'No'}
Availability: ${availText}
Weekly income goal: ${body.income_goal_weekly || 'not stated'}
Familiar with Booking Koala: ${body.knows_booking_koala ? 'Yes' : 'No'}
Background check: ${body.can_pass_background ? 'Yes' : 'Not confirmed'}
Work authorized in US: ${body.work_authorized ? 'Yes' : 'Not confirmed'}
Reliable transportation: ${body.has_transport ? 'Yes' : 'Not confirmed'}
What draws them to BeeLuxe: "${body.motivation}"
${body.notes ? `Additional notes: "${body.notes}"` : ''}

KEY BEHAVIORAL QUESTION — How they handle a customer who is unsatisfied with a spot they've already cleaned twice:
"${body.unsatisfied_customer_response}"

⚠️ CRITICAL SCORING NOTE: The ideal answer to the behavioral question is NOT "I'd redo it again." The ideal answer demonstrates communication — asking the customer what their specific expectation is to understand the root of the dissatisfaction. A candidate who says "I'd clean it again" or "I'd just try harder" scores MAXIMUM 10/30 on RELIABILITY. A candidate who says they'd ask what the customer expected, understand the issue, and communicate honestly earns full RELIABILITY credit.

SCORING RIGOR — READ THIS CAREFULLY:
- You are the owner's ONLY automated filter. Being too lenient wastes the owner's time on bad interviews.
- Do NOT round up scores. If the evidence is weak, score weak.
- 0 or undefined experience types = max 10/35 on EXPERIENCE, regardless of "years."
- One-word or vague motivation ("money," "need job") = deduct 10pts from RELIABILITY.
- "Maybe" is NOT a consolation prize — it costs owner time. Default to "reject" when in doubt.
- A candidate with great experience but a weak behavioral answer must NOT exceed 72 overall (cap ensures "maybe" at best).

SCORE on these dimensions:
- RELIABILITY (30pts): Behavioral question quality (most important), professionalism, consistency signals
- EXPERIENCE (35pts): Clean types covered (construction trailer & Airbnb = bonus), years of experience, commercial
- AVAILABILITY (20pts): Early morning & weekend flexibility
- LOGISTICS (15pts): Own supplies (or willingness), transport, solo vs. helper context

Thresholds: hire ≥ 78 | maybe 55-77 | reject < 55

Respond with ONLY this JSON:
{
  "score": <0-100 integer>,
  "recommendation": "hire" | "maybe" | "reject",
  "summary": "<2-3 sentences about this specific applicant>",
  "strengths": ["<specific strength>", "<another strength>"],
  "concerns": ["<specific concern if any>"],
  "owner_notes": "<1-2 sentences: did their answers suggest connection/trust? Would you feel confident sending them to a client's home?>"
}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const result = JSON.parse(jsonMatch[0]) as Omit<ApplicationResult, 'auto_vetted'>
    const auto_vetted = result.score >= 78 && result.recommendation === 'hire'

    return NextResponse.json({ ...result, auto_vetted } satisfies ApplicationResult)
  } catch (err) {
    // Log only the error message — never the request body, which contains
    // applicant PII (name, phone, behavioral responses).
    const message = err instanceof Error ? err.message : 'unknown error'
    console.error('Apply API error:', message)
    return NextResponse.json({ error: 'Application scoring unavailable' }, { status: 500 })
  }
}
