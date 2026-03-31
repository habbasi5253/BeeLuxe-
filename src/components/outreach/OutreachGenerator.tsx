'use client'

import React, { useState } from 'react'
import {
  Mail, MessageSquare, Copy, Check, ChevronDown, ChevronUp,
  Home, Building2, Star, Sparkles, ArrowRightLeft, Wind,
  Zap, Users, RefreshCw, Loader2
} from 'lucide-react'
import { clsx } from 'clsx'

type LeadType = 'residential' | 'commercial' | 'airbnb' | 'deep_clean' | 'move_in_out' | 'industrial'

type Lead = {
  id: string
  company_name: string | null
  contact_name: string
  phone: string | null
  email: string | null
  lead_type: LeadType
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  city: string | null
  state: string | null
  cleaning_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'one_time' | null
  project_value: number | null
  notes: string | null
}

const LEADS: Lead[] = [
  {
    id: '1', company_name: null, contact_name: 'Sarah Chen',
    phone: '(832) 555-0201', email: 'schen@gmail.com',
    lead_type: 'residential', status: 'new', city: 'The Woodlands', state: 'TX',
    cleaning_frequency: 'biweekly', project_value: 280, notes: '3BR home.',
  },
  {
    id: '2', company_name: 'Skyline Properties', contact_name: 'Angela Reed',
    phone: '(713) 555-0401', email: 'areed@skylineprops.com',
    lead_type: 'commercial', status: 'new', city: 'Houston', state: 'TX',
    cleaning_frequency: 'monthly', project_value: 5200, notes: 'Office complex, 3 floors.',
  },
  {
    id: '3', company_name: 'Sunset Stays', contact_name: 'Maria Lopez',
    phone: '(713) 555-0301', email: 'maria@sunsetstays.com',
    lead_type: 'airbnb', status: 'contacted', city: 'Austin', state: 'TX',
    cleaning_frequency: 'weekly', project_value: 1800, notes: '3-unit Airbnb portfolio, turnover cleans.',
  },
  {
    id: '4', company_name: null, contact_name: 'James Park',
    phone: '(469) 555-0601', email: 'jpark@email.com',
    lead_type: 'deep_clean', status: 'contacted', city: 'Plano', state: 'TX',
    cleaning_frequency: 'one_time', project_value: 420, notes: 'One-time deep clean before listing.',
  },
  {
    id: '5', company_name: 'Metro Office Mgmt', contact_name: 'Linda Shaw',
    phone: '(713) 555-0701', email: 'lshaw@metroofficemgmt.com',
    lead_type: 'commercial', status: 'qualified', city: 'Houston', state: 'TX',
    cleaning_frequency: 'weekly', project_value: 7800, notes: 'Proposal sent. 2 buildings.',
  },
  {
    id: '6', company_name: null, contact_name: 'Tom Hughes',
    phone: '(214) 555-0302', email: 'tom.h@email.com',
    lead_type: 'move_in_out', status: 'qualified', city: 'Irving', state: 'TX',
    cleaning_frequency: 'one_time', project_value: 350, notes: 'Move-out, 4BR house.',
  },
  {
    id: '7', company_name: 'Gulf Coast Logistics', contact_name: 'Rosa Martinez',
    phone: '(713) 555-0788', email: 'rmartinez@gulfcoastco.com',
    lead_type: 'industrial', status: 'proposal', city: 'Houston', state: 'TX',
    cleaning_frequency: 'weekly', project_value: 12000, notes: 'Warehouse + break rooms.',
  },
]

const TYPE_ICON: Record<LeadType, React.ElementType> = {
  residential: Home, commercial: Building2, airbnb: Star,
  deep_clean: Sparkles, move_in_out: ArrowRightLeft, industrial: Wind,
}
const TYPE_COLOR: Record<LeadType, string> = {
  residential:  'text-blue-600 bg-blue-100',
  commercial:   'text-violet-600 bg-violet-100',
  airbnb:       'text-amber-600 bg-amber-100',
  deep_clean:   'text-emerald-600 bg-emerald-100',
  move_in_out:  'text-rose-600 bg-rose-100',
  industrial:   'text-gray-600 bg-gray-100',
}
const TYPE_LABEL: Record<LeadType, string> = {
  residential:  'Residential',
  commercial:   'Commercial',
  airbnb:       'Airbnb / STR',
  deep_clean:   'Deep Clean',
  move_in_out:  'Move-In/Out',
  industrial:   'Industrial',
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className={clsx(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
        copied ? 'bg-emerald-100 text-emerald-700' : 'bg-luxe-100 text-luxe-600 hover:bg-luxe-200'
      )}
    >
      {copied ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy</>}
    </button>
  )
}

function TemplateCard({ lead, mode, tone }: { lead: Lead; mode: 'email' | 'sms'; tone: 'professional' | 'friendly' }) {
  const [expanded, setExpanded] = useState(false)
  const [aiText, setAiText] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState<string | null>(null)
  const Icon = TYPE_ICON[lead.lead_type]

  const generateWithAI = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setGenerating(true)
    setGenError(null)
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead, mode, tone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setAiText(data.template)
      setExpanded(true)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setGenerating(false)
    }
  }

  const displayText = aiText ?? null

  return (
    <div className="border border-luxe-100 rounded-xl overflow-hidden hover:border-bee-200 transition-colors">
      <div
        className="flex items-center gap-3 px-4 py-3.5 bg-white cursor-pointer hover:bg-luxe-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', TYPE_COLOR[lead.lead_type])}>
          <Icon size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-luxe-900 truncate">{lead.company_name || lead.contact_name}</p>
          <p className="text-[11px] text-luxe-400 truncate">{lead.contact_name} · {lead.city} · {TYPE_LABEL[lead.lead_type]}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {mode === 'email' ? (
            <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium hidden sm:block">
              {lead.email ?? 'No email'}
            </span>
          ) : (
            <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium hidden sm:block">
              {lead.phone ?? 'No phone'}
            </span>
          )}
          <button
            onClick={generateWithAI}
            disabled={generating}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-bee-500 text-white text-[11px] font-bold hover:bg-bee-600 transition-colors disabled:opacity-60"
          >
            {generating ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
            {generating ? 'Writing…' : 'AI Write'}
          </button>
          {expanded ? <ChevronUp size={14} className="text-luxe-400" /> : <ChevronDown size={14} className="text-luxe-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-luxe-100">
          {genError && (
            <div className="px-4 py-2 bg-red-50 text-xs text-red-600">{genError}</div>
          )}
          {displayText ? (
            <>
              <div className="flex items-center justify-between px-4 py-2 bg-bee-50 border-b border-bee-100">
                <p className="text-[11px] font-bold text-bee-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={10} />AI-Generated · {mode === 'email' ? 'Email' : 'SMS'} · {tone}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); generateWithAI(e) }}
                    disabled={generating}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-bee-600 hover:bg-bee-100 font-medium"
                  >
                    <RefreshCw size={10} />Regenerate
                  </button>
                  <CopyButton text={displayText} />
                </div>
              </div>
              <pre className="px-4 py-3 text-xs text-luxe-700 whitespace-pre-wrap font-mono leading-relaxed bg-white max-h-80 overflow-y-auto">
                {displayText}
              </pre>
            </>
          ) : (
            <div className="px-4 py-6 text-center text-xs text-luxe-400">
              Click <strong>AI Write</strong> to generate a personalized template for this lead.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function OutreachGenerator() {
  const [mode, setMode] = useState<'email' | 'sms'>('email')
  const [tone, setTone] = useState<'professional' | 'friendly'>('professional')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = LEADS.filter((l) => {
    if (typeFilter !== 'all' && l.lead_type !== typeFilter) return false
    if (statusFilter !== 'all' && l.status !== statusFilter) return false
    return true
  })

  const stats = {
    total:     filtered.length,
    withEmail: filtered.filter((l) => l.email).length,
    withPhone: filtered.filter((l) => l.phone).length,
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest mb-1.5">Channel</p>
            <div className="flex rounded-xl border border-luxe-200 overflow-hidden">
              {([['email', Mail, 'Email'], ['sms', MessageSquare, 'SMS']] as const).map(([val, Icon, label]) => (
                <button
                  key={val}
                  onClick={() => setMode(val)}
                  className={clsx(
                    'flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors',
                    mode === val ? 'bg-bee-500 text-white' : 'text-luxe-500 hover:bg-luxe-50'
                  )}
                >
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>
          </div>

          {mode === 'email' && (
            <div>
              <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest mb-1.5">Tone</p>
              <div className="flex rounded-xl border border-luxe-200 overflow-hidden">
                {(['professional', 'friendly'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={clsx(
                      'px-4 py-2 text-sm font-semibold transition-colors capitalize',
                      tone === t ? 'bg-luxe-700 text-white' : 'text-luxe-500 hover:bg-luxe-50'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest mb-1.5">Service Type</p>
            <select className="select !py-2 !text-xs" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              {(Object.keys(TYPE_LABEL) as LeadType[]).map((t) => (
                <option key={t} value={t}>{TYPE_LABEL[t]}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest mb-1.5">Status</p>
            <select className="select !py-2 !text-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-luxe-100">
          {[
            { label: 'Leads targeted',                                       value: stats.total,     icon: Users },
            { label: mode === 'email' ? 'Have email' : 'Have phone',         value: mode === 'email' ? stats.withEmail : stats.withPhone, icon: mode === 'email' ? Mail : MessageSquare },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <s.icon size={14} className="text-luxe-400" />
              <span className="text-sm font-bold text-luxe-800">{s.value}</span>
              <span className="text-xs text-luxe-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Template List */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-luxe-100 flex items-center justify-between">
          <div>
            <p className="font-semibold text-luxe-800">
              {mode === 'email' ? 'Email' : 'SMS'} Outreach — {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-luxe-400 mt-0.5">
              Click <strong>AI Write</strong> on any lead for a personalized template powered by Groq
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-bee-600 font-semibold bg-bee-50 px-3 py-1.5 rounded-lg">
            <Zap size={12} />
            AI-Powered
          </div>
        </div>

        <div className="p-4 space-y-2">
          {filtered.map((lead) => (
            <TemplateCard key={lead.id} lead={lead} mode={mode} tone={tone} />
          ))}
          {filtered.length === 0 && (
            <div className="py-12 text-center text-luxe-300 text-sm">No leads match the current filters.</div>
          )}
        </div>
      </div>
    </div>
  )
}
