'use client'

import { useState, useRef, useEffect } from 'react'
import {
  X, Bot, Send, CheckCircle2, AlertCircle, XCircle,
  Loader2, Phone, UserCheck, Star
} from 'lucide-react'
import { clsx } from 'clsx'
import type { Candidate } from './CandidateTable'

interface Props {
  candidate: Candidate
  onClose: () => void
  onStatusChange?: (id: string, status: Candidate['status'], score?: number, rec?: Candidate['ai_recommendation'], summary?: string) => void
}

type Message = { role: 'user' | 'assistant'; content: string }

interface Evaluation {
  score: number
  recommendation: 'hire' | 'maybe' | 'reject'
  summary: string
  strengths: string[]
  concerns: string[]
}

const REC_CONFIG = {
  hire:   { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Recommend: Hire' },
  maybe:  { icon: AlertCircle,  color: 'text-amber-500',   bg: 'bg-amber-50 border-amber-200',     label: 'Recommend: Maybe' },
  reject: { icon: XCircle,      color: 'text-red-500',     bg: 'bg-red-50 border-red-200',         label: 'Recommend: Reject' },
}

export function InterviewModal({ candidate, onClose, onStatusChange }: Props) {
  const [phase, setPhase] = useState<'idle' | 'chatting' | 'done'>(
    candidate.status === 'new' ? 'idle' :
    candidate.score !== null   ? 'done' : 'chatting'
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(
    candidate.score !== null && candidate.ai_recommendation
      ? {
          score: candidate.score,
          recommendation: candidate.ai_recommendation,
          summary: candidate.ai_summary ?? '',
          strengths: [], concerns: [],
        }
      : null
  )
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Start the interview (BeeBot sends the first message) ─────────────────
  const startInterview = async () => {
    setPhase('chatting')
    setLoading(true)
    const res = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [], candidateName: candidate.full_name }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.reply) {
      setMessages([{ role: 'assistant', content: data.reply }])
    }
    onStatusChange?.(candidate.id, 'interviewing')
  }

  // ── Candidate sends a reply ───────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    const res = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: next, candidateName: candidate.full_name }),
    })
    const data = await res.json()
    setLoading(false)

    if (data.evaluation) {
      // Final evaluation received
      setEvaluation(data.evaluation)
      setMessages([...next, { role: 'assistant', content: data.reply }])
      setPhase('done')
      const newStatus: Candidate['status'] = data.evaluation.score >= 78 && data.evaluation.recommendation === 'hire'
        ? 'approved' : 'evaluated'
      onStatusChange?.(
        candidate.id, newStatus,
        data.evaluation.score,
        data.evaluation.recommendation,
        data.evaluation.summary,
      )
    } else if (data.reply) {
      setMessages([...next, { role: 'assistant', content: data.reply }])
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // ── Manual approve/reject ─────────────────────────────────────────────────
  const approve = () => onStatusChange?.(candidate.id, 'approved', evaluation?.score, evaluation?.recommendation, evaluation?.summary)
  const reject  = () => onStatusChange?.(candidate.id, 'rejected', evaluation?.score, evaluation?.recommendation, evaluation?.summary)

  const rec = evaluation?.recommendation ? REC_CONFIG[evaluation.recommendation] : null
  const isHighScore = evaluation && evaluation.score >= 78 && evaluation.recommendation === 'hire'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxe-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-luxe-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bee-100 flex items-center justify-center text-lg">🐝</div>
            <div>
              <p className="font-bold text-luxe-900">{candidate.full_name}</p>
              <p className="text-xs text-luxe-400">
                {candidate.phone}
                {candidate.source && ` · ${candidate.source}`}
                {candidate.experience_years && ` · ${candidate.experience_years} yr exp`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-luxe-100 text-luxe-400"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* ── Evaluation banner ─────────────────────────────────────────── */}
          {evaluation && rec && (
            <div className={clsx('mx-5 mt-5 p-4 rounded-xl border', rec.bg)}>
              <div className="flex items-center gap-2 mb-2">
                <rec.icon size={16} className={rec.color} />
                <span className={clsx('text-sm font-semibold', rec.color)}>{rec.label}</span>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-white/60 overflow-hidden">
                    <div
                      className={clsx('h-full rounded-full', evaluation.score >= 78 ? 'bg-emerald-500' : evaluation.score >= 55 ? 'bg-amber-400' : 'bg-red-400')}
                      style={{ width: `${evaluation.score}%` }}
                    />
                  </div>
                  <span className="text-lg font-black text-luxe-800">{evaluation.score}/100</span>
                </div>
              </div>
              {evaluation.summary && (
                <p className="text-xs text-luxe-600 leading-relaxed mb-3">{evaluation.summary}</p>
              )}
              {evaluation.strengths?.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  {evaluation.strengths.map((s) => (
                    <span key={s} className="flex items-center gap-1 text-[11px] text-emerald-700">
                      <CheckCircle2 size={10} />{s}
                    </span>
                  ))}
                  {evaluation.concerns?.map((c) => (
                    <span key={c} className="flex items-center gap-1 text-[11px] text-amber-600">
                      <AlertCircle size={10} />{c}
                    </span>
                  ))}
                </div>
              )}
              {isHighScore && (
                <div className="mt-3 flex items-center gap-2 pt-3 border-t border-emerald-200">
                  <Star size={13} className="text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">High score — eligible for auto-vetting</span>
                </div>
              )}
            </div>
          )}

          {/* ── Idle / not started ────────────────────────────────────────── */}
          {phase === 'idle' && (
            <div className="px-6 py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-bee-100 flex items-center justify-center mx-auto mb-4 text-3xl">🐝</div>
              <p className="text-base font-semibold text-luxe-800 mb-1">Start AI Interview</p>
              <p className="text-sm text-luxe-500 max-w-sm mx-auto mb-6">
                BeeBot will conduct a live chat interview with {candidate.full_name}.<br />
                Powered by Claude — scores on reliability, experience, and availability.
              </p>
              <button onClick={startInterview} className="btn-primary mx-auto">
                <Bot size={15} />Launch BeeBot Interview
              </button>
            </div>
          )}

          {/* ── Chat transcript ───────────────────────────────────────────── */}
          {(phase === 'chatting' || phase === 'done') && messages.length > 0 && (
            <div className="px-5 py-4 space-y-3">
              {phase === 'done' && (
                <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest text-center py-1">
                  Interview Complete
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={clsx('flex gap-2.5', m.role === 'user' && 'flex-row-reverse')}>
                  <div className={clsx(
                    'w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-sm font-bold',
                    m.role === 'assistant' ? 'bg-bee-100' : 'bg-luxe-200 text-luxe-700'
                  )}>
                    {m.role === 'assistant' ? '🐝' : candidate.full_name[0].toUpperCase()}
                  </div>
                  <div className={clsx(
                    'max-w-sm px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                    m.role === 'assistant'
                      ? 'bg-bee-50 text-luxe-800 rounded-tl-sm'
                      : 'bg-luxe-100 text-luxe-700 rounded-tr-sm'
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-bee-100 flex items-center justify-center text-sm shrink-0">🐝</div>
                  <div className="bg-bee-50 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                    {[0,1,2].map((i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-bee-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-luxe-100 bg-luxe-50/50">
          {phase === 'chatting' && (
            <div className="flex gap-2 p-4">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={`Reply as ${candidate.full_name}…`}
                className="input flex-1"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="btn-primary shrink-0 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between px-4 pb-4 pt-0 gap-2">
            <button onClick={onClose} className="btn-secondary">Close</button>
            <div className="flex gap-2">
              {phase === 'done' && candidate.status !== 'rejected' && (
                <button onClick={reject} className="btn-danger">
                  <XCircle size={14} />Reject
                </button>
              )}
              {phase === 'done' && (evaluation?.recommendation === 'hire' || evaluation?.recommendation === 'maybe') && candidate.status !== 'approved' && (
                <button onClick={approve} className={clsx('btn-primary', isHighScore && 'ring-2 ring-emerald-400 ring-offset-1')}>
                  <UserCheck size={14} />
                  {isHighScore ? 'Approve & Vet ⭐' : 'Approve'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
