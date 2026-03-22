'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { Bot, Phone, Mail, ChevronRight, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
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

const mockCandidates: Candidate[] = [
  {
    id: '1', full_name: 'Darius Lee', phone: '555-2001', email: 'darius@mail.com',
    status: 'interviewing', score: null, ai_recommendation: null,
    ai_summary: null, experience_years: 3, source: 'Indeed', created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2', full_name: 'Rosa Medina', phone: '555-2002', email: 'rosa@mail.com',
    status: 'evaluated', score: 91, ai_recommendation: 'hire',
    ai_summary: 'Excellent communicator. 5 years commercial cleaning. Flexible schedule. Highly recommended.',
    experience_years: 5, source: 'Referral', created_at: '2024-01-14T09:00:00Z',
  },
  {
    id: '3', full_name: 'Kevin Okafor', phone: '555-2003', email: 'kevin@mail.com',
    status: 'approved', score: 88, ai_recommendation: 'hire',
    ai_summary: 'Strong construction site experience. Reliable with own transport. Green flag.',
    experience_years: 4, source: 'ZipRecruiter', created_at: '2024-01-13T14:00:00Z',
  },
  {
    id: '4', full_name: 'Linda Park', phone: '555-2004', email: null,
    status: 'evaluated', score: 62, ai_recommendation: 'maybe',
    ai_summary: 'Limited experience but showed genuine interest. Suggested 90-day probation.',
    experience_years: 1, source: 'Craigslist', created_at: '2024-01-12T11:00:00Z',
  },
  {
    id: '5', full_name: 'Marcus Bell', phone: '555-2005', email: 'marcus@mail.com',
    status: 'rejected', score: 34, ai_recommendation: 'reject',
    ai_summary: 'No-show for follow-up. Inconsistent answers on availability. Not recommended.',
    experience_years: 0, source: 'Indeed', created_at: '2024-01-11T08:00:00Z',
  },
  {
    id: '6', full_name: 'Priya Sharma', phone: '555-2006', email: 'priya@mail.com',
    status: 'new', score: null, ai_recommendation: null,
    ai_summary: null, experience_years: 2, source: 'Referral', created_at: '2024-01-16T16:00:00Z',
  },
]

const statusConfig: Record<string, { label: string; classes: string }> = {
  new:         { label: 'New',         classes: 'bg-luxe-100 text-luxe-600' },
  interviewing:{ label: 'Interviewing',classes: 'bg-blue-100 text-blue-700' },
  evaluated:   { label: 'Evaluated',   classes: 'bg-bee-100 text-bee-700' },
  approved:    { label: 'Approved',    classes: 'bg-emerald-100 text-emerald-700' },
  rejected:    { label: 'Rejected',    classes: 'bg-red-100 text-red-500' },
}

const recIcon = {
  hire:   <CheckCircle2 size={14} className="text-emerald-500" />,
  maybe:  <AlertCircle size={14} className="text-bee-500" />,
  reject: <XCircle size={14} className="text-red-500" />,
}

export function CandidateTable() {
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all'
    ? mockCandidates
    : mockCandidates.filter((c) => c.status === filter)

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-1 px-5 py-3 border-b border-luxe-50 bg-luxe-50/50">
        {['all','new','interviewing','evaluated','approved','rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors',
              filter === f
                ? 'bg-bee-500 text-white'
                : 'text-luxe-500 hover:bg-luxe-100'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <table className="w-full text-sm">
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
          {filtered.map((c) => (
            <tr key={c.id} className="table-row">
              <td className="px-5 py-3.5">
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
              </td>
              <td className="px-4 py-3.5">
                <span className={clsx('badge', statusConfig[c.status].classes)}>
                  {statusConfig[c.status].label}
                </span>
              </td>
              <td className="px-4 py-3.5">
                {c.score !== null ? (
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-luxe-100 overflow-hidden">
                      <div
                        className={clsx(
                          'h-full rounded-full',
                          c.score >= 80 ? 'bg-emerald-500' : c.score >= 60 ? 'bg-bee-500' : 'bg-red-400'
                        )}
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
                    {recIcon[c.ai_recommendation]}
                    {c.ai_recommendation}
                  </div>
                ) : (
                  <span className="text-xs text-luxe-300">Pending</span>
                )}
              </td>
              <td className="px-4 py-3.5 text-xs text-luxe-600">
                {c.experience_years ? `${c.experience_years} yr${c.experience_years !== 1 ? 's' : ''}` : 'None'}
              </td>
              <td className="px-4 py-3.5">
                <span className="text-xs text-luxe-400">{c.source ?? '—'}</span>
              </td>
              <td className="px-4 py-3.5">
                <button
                  onClick={() => setSelected(c)}
                  className="flex items-center gap-1 text-xs text-bee-600 hover:text-bee-700 font-medium"
                >
                  <Bot size={13} /> View
                  <ChevronRight size={12} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <InterviewModal candidate={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
