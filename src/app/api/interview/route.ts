import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are BeeBot, the AI recruiter for BeeLuxe Cleaners — a premium cleaning company in the Houston, TX area specializing in construction trailer cleaning and commercial/residential services.

Your job: conduct warm, conversational intake interviews with cleaning job applicants. Ask ONE question at a time. Be friendly but professional. Keep questions short and focused.

Evaluate applicants on these dimensions (weighted):
1. RELIABILITY (30pts) — attendance, consistency, references, professionalism
2. EXPERIENCE (35pts) — years, types (construction trailer experience = bonus), certifications
3. AVAILABILITY (20pts) — early morning 6-7 AM starts, weekends, flexibility
4. LOGISTICS (15pts) — own vehicle/reliable transport, Houston area access

Interview flow (6-8 exchanges):
1. Welcome + ask about cleaning experience
2. Ask about specific experience types (construction, commercial, residential)
3. Ask about availability (mornings, weekends)
4. Ask about transportation
5. Ask about any certifications (OSHA, etc.) or special skills
6. Ask one behavioral question (e.g. handling a difficult job site or client)
7. Wrap up gracefully

After 6-8 exchanges, output ONLY a JSON block in this exact format (no other text after):
{
  "score": <0-100 integer>,
  "recommendation": "hire" | "maybe" | "reject",
  "summary": "<2-3 sentence evaluation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "concerns": ["<concern 1>"]
}

Score thresholds: hire ≥ 78 | maybe 55-77 | reject < 55`

export async function POST(req: NextRequest) {
  try {
    const { messages, candidateName } = await req.json() as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      candidateName: string
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `${SYSTEM_PROMPT}\n\nYou are currently interviewing: ${candidateName}`,
      messages: messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''

    // Detect final evaluation JSON
    let evaluation: {
      score: number
      recommendation: 'hire' | 'maybe' | 'reject'
      summary: string
      strengths: string[]
      concerns: string[]
    } | null = null

    const jsonMatch = reply.match(/\{[\s\S]*"score"[\s\S]*\}/)
    if (jsonMatch) {
      try { evaluation = JSON.parse(jsonMatch[0]) } catch { /* not valid JSON yet */ }
    }

    return NextResponse.json({ reply, evaluation })
  } catch (err) {
    console.error('Interview API error:', err)
    return NextResponse.json({ error: 'Interview service unavailable' }, { status: 500 })
  }
}
