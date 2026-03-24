/**
 * BeeLuxe AI Client — Groq (free tier) with Anthropic fallback
 *
 * PRIMARY:  Groq  → llama-3.3-70b-versatile
 *   • ~30 tokens/s inference, generous free tier (14,400 req/day)
 *   • OpenAI-compatible API — uses the `openai` package with a custom baseURL
 *   • Sign up at https://console.groq.com → API Keys → create key
 *   • Set GROQ_API_KEY in Vercel env vars
 *
 * FALLBACK: Anthropic → claude-sonnet-4-6
 *   • Used automatically when GROQ_API_KEY is not set (e.g. local dev with
 *     Anthropic key already configured, or if you prefer Claude for quality)
 *   • Set ANTHROPIC_API_KEY to activate
 *
 * INTERFACE: Both paths expose the same `chat()` function so callers don't
 * care which backend is running.
 */

import OpenAI from 'openai'

// ── Models ────────────────────────────────────────────────────────────────────
export const GROQ_MODEL      = 'llama-3.3-70b-versatile'
export const FALLBACK_MODEL  = 'claude-sonnet-4-6'

// ── Groq client (OpenAI-compatible) ──────────────────────────────────────────
let _groq: OpenAI | null = null
function groqClient(): OpenAI {
  if (!_groq) {
    _groq = new OpenAI({
      apiKey:  process.env.GROQ_API_KEY!,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  }
  return _groq
}

// ── Message type shared by both providers ─────────────────────────────────────
export interface ChatMessage {
  role:    'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  maxTokens?: number
}

export interface ChatResult {
  text:     string
  provider: 'groq' | 'anthropic'
  model:    string
}

/**
 * Send a chat completion request.
 * Routes to Groq if GROQ_API_KEY is set, otherwise falls back to Anthropic.
 * Callers pass a standard messages array (system message first if needed).
 */
export async function chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<ChatResult> {
  const maxTokens = opts.maxTokens ?? 600

  // ── Groq path ──────────────────────────────────────────────────────────────
  if (process.env.GROQ_API_KEY) {
    const res = await groqClient().chat.completions.create({
      model:      GROQ_MODEL,
      max_tokens: maxTokens,
      messages,
    })
    const text = res.choices[0]?.message?.content ?? ''
    return { text, provider: 'groq', model: GROQ_MODEL }
  }

  // ── Anthropic fallback ─────────────────────────────────────────────────────
  if (process.env.ANTHROPIC_API_KEY) {
    // Dynamic import keeps @anthropic-ai/sdk out of the bundle when using Groq
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Split system message out — Anthropic takes it as a top-level param
    const systemMsg   = messages.find((m) => m.role === 'system')
    const chatMsgs    = messages.filter((m) => m.role !== 'system')

    const res = await client.messages.create({
      model:      FALLBACK_MODEL,
      max_tokens: maxTokens,
      system:     systemMsg?.content,
      messages:   chatMsgs.map((m) => ({
        role:    m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })
    const text = res.content[0].type === 'text' ? res.content[0].text : ''
    return { text, provider: 'anthropic', model: FALLBACK_MODEL }
  }

  throw new Error(
    '[BeeLuxe] No AI provider configured. ' +
    'Set GROQ_API_KEY (free: https://console.groq.com) or ANTHROPIC_API_KEY.'
  )
}
