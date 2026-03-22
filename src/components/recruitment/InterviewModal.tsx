'use client'

import { useState } from 'react'
import { X, Bot, Send, Phone, CheckCircle2, AlertCircle, XCircle, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import type { Candidate } from './CandidateTable'

interface Props {
  candidate: Candidate
  onClose: () => void
}

const sampleTranscript = [
  { role: 'ai', text: "Hi! I'm BeeBot, BeeLuxe's AI recruiter. Thanks for applying! First, can you tell me a bit about your cleaning experience?" },
  { role: 'candidate', text: "Sure, I've been cleaning residential homes and offices for about 5 years. I'm really comfortable with deep cleaning and construction site trailers." },
  { role: 'ai', text: 'Great experience! How would you rate your availability? We often need early morning starts around 6-7 AM.' },
  { role: 'candidate', text: "That works perfectly for me. I'm actually a morning person and prefer starting early." },
  { role: 'ai', text: 'Wonderful. Do you have reliable transportation to reach job sites across the Dallas metro area?' },
  { role: 'candidate', text: 'Yes, I have my own vehicle and a valid driver\'s license. No issues getting around.' },
  { role: 'ai', text: "Last one — how do you handle cleaning chemicals and safety protocols on construction sites?" },
  { role: 'candidate', text: "I'm OSHA-10 certified and always follow proper PPE and chemical handling procedures. Safety first." },
]

export function InterviewModal({ candidate, onClose }: Props) {
  const [launching, setLaunching] = useState(false)
  const [launched, setLaunched] = useState(false)
  const [message, setMessage] = useState('')

  const handleLaunchInterview = () => {
    setLaunching(true)
    setTimeout(() => {
      setLaunching(false)
      setLaunched(true)
    }, 1800)
  }

  const recMap = {
    hire:   { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Recommend: Hire' },
    maybe:  { icon: AlertCircle,  color: 'text-bee-600',     bg: 'bg-bee-50 border-bee-200',         label: 'Recommend: Maybe' },
    reject: { icon: XCircle,      color: 'text-red-500',     bg: 'bg-red-50 border-red-200',         label: 'Recommend: Reject' },
  }

  const rec = candidate.ai_recommendation ? recMap[candidate.ai_recommendation] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxe-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-luxe-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-bee-100 flex items-center justify-center">
              <Bot size={18} className="text-bee-700" />
            </div>
            <div>
              <p className="font-bold text-luxe-900">{candidate.full_name}</p>
              <p className="text-xs text-luxe-400">{candidate.phone} · {candidate.source}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-luxe-100 text-luxe-500">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* AI Evaluation Panel */}
          {candidate.score !== null && rec && (
            <div className={clsx('mx-6 mt-5 p-4 rounded-xl border', rec.bg)}>
              <div className="flex items-center gap-2 mb-2">
                <rec.icon size={16} className={rec.color} />
                <span className={clsx('text-sm font-semibold', rec.color)}>{rec.label}</span>
                <span className="ml-auto text-lg font-bold text-luxe-800">{candidate.score}/100</span>
              </div>
              {candidate.ai_summary && (
                <p className="text-xs text-luxe-600 leading-relaxed">{candidate.ai_summary}</p>
              )}
            </div>
          )}

          {/* Interview Transcript */}
          {candidate.status !== 'new' && (
            <div className="px-6 py-4">
              <p className="text-xs font-semibold text-luxe-500 uppercase tracking-wider mb-3">
                Interview Transcript (SMS)
              </p>
              <div className="space-y-3">
                {sampleTranscript.slice(0, candidate.status === 'interviewing' ? 4 : undefined).map((m, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'flex gap-3',
                      m.role === 'candidate' && 'flex-row-reverse'
                    )}
                  >
                    <div className={clsx(
                      'w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-xs font-bold',
                      m.role === 'ai' ? 'bg-bee-100 text-bee-700' : 'bg-luxe-200 text-luxe-700'
                    )}>
                      {m.role === 'ai' ? '🐝' : candidate.full_name[0]}
                    </div>
                    <div className={clsx(
                      'max-w-xs px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed',
                      m.role === 'ai'
                        ? 'bg-bee-50 text-luxe-800 rounded-tl-sm'
                        : 'bg-luxe-100 text-luxe-700 rounded-tr-sm'
                    )}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live input if still interviewing */}
              {candidate.status === 'interviewing' && (
                <div className="mt-4 flex gap-2">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type reply to send via SMS..."
                    className="input flex-1"
                  />
                  <button className="btn-primary shrink-0">
                    <Send size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Launch Interview for new candidates */}
          {candidate.status === 'new' && (
            <div className="px-6 py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-bee-100 flex items-center justify-center mx-auto mb-4">
                <Bot size={28} className="text-bee-600" />
              </div>
              <p className="text-base font-semibold text-luxe-800 mb-1">Start AI Interview</p>
              <p className="text-sm text-luxe-500 mb-6">
                BeeBot will send an automated SMS interview to {candidate.phone}.<br />
                Responses are evaluated against quality benchmarks in real time.
              </p>

              {!launched ? (
                <button
                  onClick={handleLaunchInterview}
                  disabled={launching}
                  className="btn-primary mx-auto"
                >
                  {launching ? (
                    <><Loader2 size={14} className="animate-spin" />Launching…</>
                  ) : (
                    <><Phone size={14} />Send SMS Interview</>
                  )}
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-medium">
                  <CheckCircle2 size={15} />
                  Interview sent to {candidate.phone}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-luxe-100 bg-luxe-50/50">
          <button onClick={onClose} className="btn-secondary">Close</button>
          <div className="flex gap-2">
            {candidate.ai_recommendation === 'hire' && (
              <button className="btn-primary">
                <CheckCircle2 size={14} />
                Approve & Onboard
              </button>
            )}
            {candidate.status !== 'rejected' && candidate.status !== 'new' && (
              <button className="btn-danger">
                <XCircle size={14} />
                Reject
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
