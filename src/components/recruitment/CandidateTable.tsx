'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { Bot, Phone, Mail, ChevronRight, CheckCircle2, XCircle, AlertCircle, Star } from 'lucide-react'
import { InterviewModal } from './InterviewModal'

export type Candidate = {
  id: string
  full_name: string
  phone: string
  email: string | null
  status: 'new' | 'interviewing' | 'evaluated' | 'approved' | 'rejected'
  score: number | null
  ai_recommendation: 'hire' | 'maybe' | 'reject' | null
  ai_summary: string | null
  experience_years: number | null
  source: string | null
  created_at: string
}

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: '1', full_name: 'Darius Lee', phone: '(713) 555-2001', email: 'darius@mail.com',
    status: 'interviewing', score: null, ai_recommendation: null,
    ai_summary: null, experience_years: 3, source: 'Indeed', created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2', full_name: 'Rosa Medina', phone: '(713) 555-2002', email: 'rosa@mail.com',
    status: 'evaluated', score: 91, ai_recommendation: 'hire',
    ai_summary: 'Excellent communicator. 5 years commercial cleaning. Flexible schedule. Highly recommended.',
    experience_years: 5, source: 'Referral', created_at: '2024-01-14T09:00:00Z',
  },
  {
    id: '3', full_name: 'Kevin Okafor', phone: '(713) 555-2003', email: 'kevin@mail.com',
    status: 'approved', score: 88, ai_recommendation: 'hire',
    ai_summary: 'Strong construction site experience. Reliable with own transport. Green flag.',
    experience_years: 4, source: 'ZipRecruiter', created_at: '2024-01-13T14:00:00Z',
  },
  {
    id: '4', full_name: 'Linda Park', phone: '(713) 555-2004', email: null,
    status: 'evaluated', score: 62, ai_recommendation: 'maybe',
    ai_summary: 'Limited experience but showed genuine interest. Suggested 90-day probation.',
    experience_years: 1, source: 'Craigslist', created_at: '2024-01-12T11:00:00Z',
  },
  {
    id: '5', full_name: 'Marcus Bell', phone: '(713) 555-2005', email: 'marcus@mail.com',
    status: 'rejected', score: 34, ai_recommendation: 'reject',
    ai_summary: 'No-show for follow-up. Inconsistent answers on availability. Not recommended.',
    experience_years: 0, source: 'Indeed', created_at: '2024-01-11T08:00:00Z',
  },
  {
    id: '6', full_name: 'Priya Sharma', phone: '(713) 555-2006', email: 'priya@mail.com',
    status: 'new', score: null, ai_recommendation: null,
    ai_summary: null, experience_years: 2, source: 'Referral', created_at: '2024-01-16T16:00:00Z',
  },
  {
    id: '7', full_name: 'James Wright', phone: '(281) 555-2007', email: 'james@mail.com',
    status: 'new', score: null, ai_recommendation: null,
    ai_summary: null, experience_years: null, source: 'BeeLuxe Apply', created_at: '2024-01-17T09:00:00Z',
  },
]

const STATUS_CONFIG: Record<Candidate['status'], { label: string; classes: string }> = {
  new:          { label: 'New',          classes: 'bg-luxe-100 text-luxe-600' },
  interviewing: { label: 'Interviewing', classes: 'bg-blue-100 text-blue-700' },
  evaluated:    { label: 'Evaluated',    classes: 'bg-bee-100 text-bee-700' },
  approved:     { label: 'Vetted ✓',     classes: 'bg-emerald-100 text-emerald-700' },
  rejected:     { label: 'Rejected',     classes: 'bg-red-100 text-red-500' },
}

const REC_ICON = {
  hire:   <CheckCircle2 size={14} className="text-emerald-500" />,
  maybe:  <AlertCircle  size={14} className="text-amber-400" />,
  reject: <XCircle      size={14} className="text-red-400" />,
}

const FILTERS = ['all', 'new', 'interviewing', 'evaluated', 'approved', 'rejected'] as const

export function CandidateTable() {
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES)
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? candidates : candidates.filter((c) => c.status === filter)

  // Called by InterviewModal when status/score changes
  const handleStatusChange = (
    id: string,
    status: Candidate['status'],
    score?: number,
    rec?: Candidate['ai_recommendation'],
    summary?: string,
  ) => {
    setCandidates((prev) => prev.map((c) =>
      c.id === id
        ? {
            ...c,
            status,
            score: score ?? c.score,
            ai_recommendation: rec ?? c.ai_recommendation,
            ai_summary: summary ?? c.ai_summary,
          }
        : c
    ))
    // Sync selected if open
    setSelected((prev) => prev?.id === id
      ? { ...prev, status, score: score ?? prev.score, ai_recommendation: rec ?? prev.ai_recommendation, ai_summary: summary ?? prev.ai_summary }
      : prev
    )
  }

  const counts = {
    new:          candidates.filter((c) => c.status === 'new').length,
    interviewing: candidates.filter((c) => c.status === 'interviewing').length,
    evaluated:    candidates.filter((c) => c.status === 'evaluated').length,
    approved:     candidates.filter((c) => c.status === 'approved').length,
    rejected:     candidates.filter((c) => c.status === 'rejected').length,
  }

  return (
    <>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 px-5 py-3 border-b border-luxe-50 bg-luxe-50/50">
        {FILTERS.map((f) => {
          const count = f === 'all' ? candidates.length : counts[f]
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors',
                filter === f ? 'bg-bee-500 text-white' : 'text-luxe-500 hover:bg-luxe-100'
              )}
            >
              {f === 'approved' ? 'Vetted' : f}
              <span className={clsx(
                'inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold',
                filter === f ? 'bg-white/30' : 'bg-luxe-200 text-luxe-600'
              )}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Auto-vetting notice */}
      {candidates.some((c) => c.score !== null && c.score >= 78 && c.ai_recommendation === 'hire' && c.status === 'evaluated') && (
        <div className="mx-5 mt-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <Star size={14} className="text-emerald-600 shrink-0" />
          <p className="text-xs text-emerald-800 font-medium">
            {candidates.filter((c) => c.score !== null && c.score >= 78 && c.ai_recommendation === 'hire' && c.status === 'evaluated').length} candidate(s) scored ≥78 and are eligible for auto-vetting — open their profile to approve.
          </p>
        </div>
      )}

      <table className="w-full text-sm mt-2">
        <thead>
          <tr className="table-header">
            <th className="text-left px-5 py-3">Candidate</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">AI Score</th>
            <th className="text-left px-4 py-3">Rec.</th>
            <th className="text-left px-4 py-3">Experience</th>
            <th className="text-left px-4 py-3">Source</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((c) => {
            const highScore = c.score !== null && c.score >= 78 && c.ai_recommendation === 'hire' && c.status === 'evaluated'
            return (
              <tr key={c.id} className={clsx('table-row', highScore && 'bg-emerald-50/40')}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    {highScore && <Star size={12} className="text-emerald-500 shrink-0" />}
                    <div>
                      <p className="font-semibold text-luxe-900">{c.full_name}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-xs text-luxe-400">
                          <Phone size={10} />{c.phone}
                        </span>
                        {c.email && (
                          <span className="flex items-center gap-1 text-xs text-luxe-400">
                            <Mail size={10} />{c.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={clsx('badge', STATUS_CONFIG[c.status].classes)}>
                    {STATUS_CONFIG[c.status].label}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  {c.score !== null ? (
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-luxe-100 overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full', c.score >= 78 ? 'bg-emerald-500' : c.score >= 55 ? 'bg-amber-400' : 'bg-red-400')}
                          style={{ width: `${c.score}%` }}
                        />
                      </div>
                      <span className="font-semibold text-xs text-luxe-700">{c.score}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-luxe-300">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {c.ai_recommendation ? (
                    <div className="flex items-center gap-1 capitalize text-xs font-medium">
                      {REC_ICON[c.ai_recommendation]}
                      {c.ai_recommendation}
                    </div>
                  ) : (
                    <span className="text-xs text-luxe-300">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-xs text-luxe-600">
                  {c.experience_years ? `${c.experience_years} yr${c.experience_years !== 1 ? 's' : ''}` : 'None listed'}
                </td>
                <td className="px-4 py-3.5">
                  <span className={clsx(
                    'text-xs',
                    c.source === 'BeeLuxe Apply' ? 'text-bee-600 font-semibold' : 'text-luxe-400'
                  )}>
                    {c.source ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <button
                    onClick={() => setSelected(c)}
                    className="flex items-center gap-1 text-xs text-bee-600 hover:text-bee-700 font-medium whitespace-nowrap"
                  >
                    <Bot size={13} />
                    {c.status === 'new' ? 'Interview' : 'View'}
                    <ChevronRight size={12} />
                  </button>
                </td>
              </tr>
            )
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center text-luxe-300 text-sm">No candidates in this stage.</td>
            </tr>
          )}
        </tbody>
      </table>

      {selected && (
        <InterviewModal
          candidate={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  )
}
