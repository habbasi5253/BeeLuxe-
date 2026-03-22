import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are BeeBot, BeeLuxe Cleaners' AI recruiter assistant.
Your job is to conduct intake interviews with cleaning job applicants via SMS.

Quality benchmarks to evaluate:
- Experience (residential, commercial, construction trailers preferred)
- Availability (early morning 6-7 AM starts, weekends)
- Transportation (own vehicle required)
- Reliability and professionalism
- Safety knowledge (OSHA, chemical handling)

Ask one clear question at a time. Be warm, professional, and concise.
After 6-8 exchanges, provide a JSON summary with:
{
  "score": 0-100,
  "recommendation": "hire" | "maybe" | "reject",
  "summary": "2-3 sentence evaluation",
  "strengths": ["..."],
  "concerns": ["..."]
}`

export async function POST(req: NextRequest) {
  try {
    const { messages, candidateName } = await req.json() as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>
      candidateName: string
    }

    const systemMessage = `${SYSTEM_PROMPT}\n\nYou are currently interviewing: ${candidateName}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const reply = response.choices[0].message.content ?? ''

    // Detect if this is the final evaluation (contains JSON)
    let evaluation = null
    const jsonMatch = reply.match(/\{[\s\S]*"score"[\s\S]*\}/)
    if (jsonMatch) {
      try {
        evaluation = JSON.parse(jsonMatch[0])
      } catch {
        // Not valid JSON yet
      }
    }

    return NextResponse.json({ reply, evaluation })
  } catch (err) {
    console.error('Interview API error:', err)
    return NextResponse.json({ error: 'Interview service unavailable' }, { status: 500 })
  }
}
