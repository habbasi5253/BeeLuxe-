import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ApplicationPayload {
  full_name: string
  phone: string
  email?: string
  experience_years: number
  experience_types: string[]   // e.g. ['residential','commercial','construction_trailer']
  availability: string[]       // e.g. ['weekdays','early_morning','weekends']
  has_transport: boolean
  has_osha: boolean
  motivation: string           // "why do you want to work at BeeLuxe?"
  notes?: string
}

export interface ApplicationResult {
  score: number
  recommendation: 'hire' | 'maybe' | 'reject'
  summary: string
  strengths: string[]
  concerns: string[]
  auto_vetted: boolean         // true when score >= 78 and recommendation === 'hire'
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ApplicationPayload

    const availabilityText = body.availability
      .map((a) => ({
        weekdays: 'weekday availability',
        weekends: 'weekend availability',
        early_morning: 'early morning (6-7 AM) starts',
        evening: 'evening availability',
        flexible: 'fully flexible schedule',
      }[a] ?? a))
      .join(', ')

    const experienceText = body.experience_types
      .map((t) => ({
        residential: 'residential home cleaning',
        commercial: 'commercial/office cleaning',
        construction_trailer: 'construction site trailer cleaning',
        industrial: 'industrial cleaning',
        deep_clean: 'deep/move-out cleaning',
      }[t] ?? t))
      .join(', ')

    const prompt = `You are evaluating a cleaning job application for BeeLuxe Cleaners in Houston, TX.

Applicant: ${body.full_name}
Phone: ${body.phone}
${body.email ? `Email: ${body.email}` : ''}
Years of experience: ${body.experience_years}
Experience types: ${experienceText || 'not specified'}
Availability: ${availabilityText || 'not specified'}
Has reliable transportation: ${body.has_transport ? 'Yes' : 'No'}
OSHA certified: ${body.has_osha ? 'Yes' : 'No'}
Why they want to work here: "${body.motivation}"
${body.notes ? `Additional notes: "${body.notes}"` : ''}

Score this applicant on:
- RELIABILITY (30pts): professionalism, communication quality, completeness of answers
- EXPERIENCE (35pts): years + types (construction trailer = strongest signal), certifications
- AVAILABILITY (20pts): early morning 6-7 AM and weekend flexibility are highly valued
- LOGISTICS (15pts): own transport is required; Houston area access matters

Thresholds: hire ≥ 78 | maybe 55-77 | reject < 55

Respond with ONLY this JSON object, nothing else:
{
  "score": <0-100 integer>,
  "recommendation": "hire" | "maybe" | "reject",
  "summary": "<2-3 sentence evaluation of this specific applicant>",
  "strengths": ["<specific strength 1>", "<specific strength 2>"],
  "concerns": ["<specific concern 1>"]
}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const result = JSON.parse(jsonMatch[0]) as Omit<ApplicationResult, 'auto_vetted'>
    const auto_vetted = result.score >= 78 && result.recommendation === 'hire'

    return NextResponse.json({ ...result, auto_vetted })
  } catch (err) {
    console.error('Apply API error:', err)
    return NextResponse.json({ error: 'Application scoring unavailable' }, { status: 500 })
  }
}
