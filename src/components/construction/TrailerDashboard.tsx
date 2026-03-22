'use client'

import { useState } from 'react'
import {
  HardHat, MapPin, Phone, Mail, Clock, RefreshCw,
  DollarSign, Plus, X, Loader2, ChevronDown, CheckCircle2,
  AlertCircle, Circle, FileText, Zap
} from 'lucide-react'
import { clsx } from 'clsx'

export type TrailerLead = {
  id: string
  company_name: string | null
  contact_name: string
  phone: string | null
  email: string | null
  site_address: string | null
  city: string | null
  state: string | null
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  trailer_count: number | null
  project_duration_months: number | null
  cleaning_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom' | null
  project_value: number | null
  aec_project_id: string | null
  next_follow_up: string | null
  notes: string | null
  created_at: string
}

const mockTrailerLeads: TrailerLead[] = [
  {
    id: '1', company_name: 'Apex Construction LLC', contact_name: 'Mike Torres',
    phone: '(713) 555-0101', email: 'mike@apexconstruction.com',
    site_address: '1200 Industrial Blvd', city: 'Houston', state: 'TX',
    status: 'new', trailer_count: 4, project_duration_months: 8,
    cleaning_frequency: 'weekly', project_value: 12800,
    aec_project_id: 'AEC-2024-0441', next_follow_up: '2024-01-22',
    notes: 'Large multi-phase project. 4 trailers on site. PM is Mike.',
    created_at: '2024-01-16T10:00:00Z',
  },
  {
    id: '2', company_name: 'BuildRight Corp', contact_name: 'Tom Hughes',
    phone: '(713) 555-0301', email: 'tom@buildright.com',
    site_address: '550 Commerce Park Dr', city: 'Houston', state: 'TX',
    status: 'contacted', trailer_count: 3, project_duration_months: 6,
    cleaning_frequency: 'biweekly', project_value: 7200,
    aec_project_id: 'AEC-2024-0389', next_follow_up: '2024-01-23',
    notes: 'Need to schedule site visit. Office trailer + 2 equipment trailers.',
    created_at: '2024-01-14T09:00:00Z',
  },
  {
    id: '3', company_name: 'Ridgeline Homes Dev', contact_name: 'Carlos Vega',
    phone: '(281) 555-0501', email: 'cvega@ridgelinehomes.com',
    site_address: '3300 Ridgeline Pkwy', city: 'Katy', state: 'TX',
    status: 'qualified', trailer_count: 8, project_duration_months: 18,
    cleaning_frequency: 'weekly', project_value: 43200,
    aec_project_id: 'AEC-2024-0512', next_follow_up: '2024-01-25',
    notes: 'Largest pipeline deal. 8-trailer subdivision. Multi-year potential.',
    created_at: '2024-01-10T08:00:00Z',
  },
  {
    id: '4', company_name: 'Gulf Coast Contractors', contact_name: 'Rosa Martinez',
    phone: '(713) 555-0788', email: 'rmartinez@gulfcoastco.com',
    site_address: '7800 Port Blvd', city: 'Pasadena', state: 'TX',
    status: 'proposal', trailer_count: 5, project_duration_months: 12,
    cleaning_frequency: 'weekly', project_value: 24000,
    aec_project_id: 'AEC-2024-0601', next_follow_up: null,
    notes: 'Proposal sent Jan 15. Industrial site near port. Good margin.',
    created_at: '2024-01-08T10:00:00Z',
  },
  {
    id: '5', company_name: 'Apex Construction LLC', contact_name: 'Mike Torres',
    phone: '(713) 555-0101', email: 'mike@apexconstruction.com',
    site_address: '900 Industrial Blvd', city: 'Houston', state: 'TX',
    status: 'won', trailer_count: 2, project_duration_months: 4,
    cleaning_frequency: 'weekly', project_value: 6400,
    aec_project_id: 'AEC-2023-0388', next_follow_up: null,
    notes: 'Active client. Monthly recurring. Started Feb.',
    created_at: '2024-01-05T10:00:00Z',
  },
  {
    id: '6', company_name: 'Lone Star Dev Group', contact_name: 'Derek Owens',
    phone: '(832) 555-0220', email: 'dowens@lonestardg.com',
    site_address: '4100 Westheimer Rd', city: 'Houston', state: 'TX',
    status: 'new', trailer_count: 2, project_duration_months: 5,
    cleaning_frequency: 'monthly', project_value: 3000,
    aec_project_id: null, next_follow_up: '2024-01-28',
    notes: 'Small retail buildout. Referred by Carlos Vega.',
    created_at: '2024-01-18T14:00:00Z',
  },
]

const STATUS_CONFIG = {
  new:       { label: 'New',       color: 'bg-slate-100 text-slate-600',    icon: Circle },
  contacted: { label: 'Contacted', color: 'bg-blue-100 text-blue-700',      icon: Phone },
  qualified: { label: 'Qualified', color: 'bg-amber-100 text-amber-700',    icon: CheckCircle2 },
  proposal:  { label: 'Proposal',  color: 'bg-violet-100 text-violet-700',  icon: FileText },
  won:       { label: 'Won',       color: 'bg-emerald-100 text-emerald-700',icon: CheckCircle2 },
  lost:      { label: 'Lost',      color: 'bg-red-100 text-red-600',        icon: AlertCircle },
}

const FREQ_LABEL: Record<string, string> = {
  daily: 'Daily', weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly', custom: 'Custom',
}

function StatusBadge({ status }: { status: TrailerLead['status'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold', cfg.color)}>
      <cfg.icon size={10} />
      {cfg.label}
    </span>
  )
}

function DetailDrawer({ lead, onClose }: { lead: TrailerLead; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-luxe-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-luxe-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
              <HardHat size={18} className="text-orange-600" />
            </div>
            <div>
              <p className="font-bold text-luxe-900 text-sm">{lead.company_name || lead.contact_name}</p>
              {lead.aec_project_id && (
                <p className="text-[11px] font-mono text-luxe-400">{lead.aec_project_id}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-luxe-100 text-luxe-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <StatusBadge status={lead.status} />

          {/* Contact */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest">Contact</p>
            <p className="text-sm font-semibold text-luxe-900">{lead.contact_name}</p>
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm text-bee-600 hover:underline">
                <Phone size={13} />{lead.phone}
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-sm text-bee-600 hover:underline">
                <Mail size={13} />{lead.email}
              </a>
            )}
          </div>

          {/* Site */}
          {lead.site_address && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest">Site Location</p>
              <p className="flex items-start gap-2 text-sm text-luxe-700">
                <MapPin size={13} className="mt-0.5 shrink-0 text-luxe-400" />
                {lead.site_address}, {lead.city}, {lead.state}
              </p>
            </div>
          )}

          {/* Project Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-luxe-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-luxe-400 uppercase tracking-wide font-bold mb-1">Trailers</p>
              <p className="text-2xl font-black text-orange-600">{lead.trailer_count ?? '—'}</p>
            </div>
            <div className="bg-luxe-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-luxe-400 uppercase tracking-wide font-bold mb-1">Duration</p>
              <p className="text-2xl font-black text-luxe-800">{lead.project_duration_months ?? '—'}</p>
              {lead.project_duration_months && <p className="text-[10px] text-luxe-400">months</p>}
            </div>
            <div className="bg-luxe-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-luxe-400 uppercase tracking-wide font-bold mb-1">Frequency</p>
              <p className="text-sm font-bold text-luxe-800">{lead.cleaning_frequency ? FREQ_LABEL[lead.cleaning_frequency] : '—'}</p>
            </div>
            <div className="bg-luxe-50 rounded-xl p-3 text-center">
              <p className="text-[10px] text-luxe-400 uppercase tracking-wide font-bold mb-1">Value</p>
              <p className="text-sm font-bold text-emerald-700">
                {lead.project_value ? `$${lead.project_value.toLocaleString()}` : '—'}
              </p>
            </div>
          </div>

          {lead.notes && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest">Notes</p>
              <p className="text-sm text-luxe-600 leading-relaxed">{lead.notes}</p>
            </div>
          )}

          {lead.next_follow_up && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <Clock size={14} className="text-amber-500" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Follow-up</p>
                <p className="text-xs text-amber-600">
                  {new Date(lead.next_follow_up).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AddTrailerLeadModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    company_name: '', contact_name: '', phone: '', email: '',
    site_address: '', city: 'Houston', state: 'TX', zip: '',
    trailer_count: '', project_duration_months: '', cleaning_frequency: 'weekly',
    project_value: '', aec_project_id: '', notes: '',
  })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxe-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-luxe-100">
          <div className="flex items-center gap-2">
            <HardHat size={18} className="text-orange-500" />
            <p className="font-bold text-luxe-900">New Construction Trailer Lead</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-luxe-100 text-luxe-500"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Company Name</label>
              <input className="input" placeholder="Apex Construction LLC" value={form.company_name} onChange={(e) => set('company_name', e.target.value)} />
            </div>
            <div>
              <label className="label">Contact Name *</label>
              <input required className="input" placeholder="Mike Torres" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="(713) 555-0100" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="contact@co.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Site Address *</label>
            <input required className="input" placeholder="1200 Industrial Blvd" value={form.site_address} onChange={(e) => set('site_address', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label">City</label>
              <input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} />
            </div>
            <div>
              <label className="label">ZIP</label>
              <input className="input" placeholder="77001" value={form.zip} onChange={(e) => set('zip', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Trailers</label>
              <input required className="input" type="number" min="1" placeholder="4" value={form.trailer_count} onChange={(e) => set('trailer_count', e.target.value)} />
            </div>
            <div>
              <label className="label">Duration (months)</label>
              <input required className="input" type="number" min="1" placeholder="8" value={form.project_duration_months} onChange={(e) => set('project_duration_months', e.target.value)} />
            </div>
            <div>
              <label className="label">Frequency</label>
              <select className="select" value={form.cleaning_frequency} onChange={(e) => set('cleaning_frequency', e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">AEC Project ID</label>
              <input className="input font-mono" placeholder="AEC-2024-0001" value={form.aec_project_id} onChange={(e) => set('aec_project_id', e.target.value)} />
            </div>
            <div>
              <label className="label">Est. Project Value ($)</label>
              <input className="input" type="number" placeholder="12000" value={form.project_value} onChange={(e) => set('project_value', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={3} placeholder="Site details, access instructions, key contacts…" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Plus size={14} />Add Site</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function TrailerDashboard() {
  const [selected, setSelected] = useState<TrailerLead | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = statusFilter === 'all'
    ? mockTrailerLeads
    : mockTrailerLeads.filter((l) => l.status === statusFilter)

  const active = mockTrailerLeads.filter((l) => l.status === 'won')
  const pipeline = mockTrailerLeads.filter((l) => !['won', 'lost'].includes(l.status))
  const totalTrailers = mockTrailerLeads.reduce((s, l) => s + (l.trailer_count ?? 0), 0)
  const pipelineValue = pipeline.reduce((s, l) => s + (l.project_value ?? 0), 0)
  const avgDuration = Math.round(
    mockTrailerLeads.filter((l) => l.project_duration_months).reduce((s, l) => s + (l.project_duration_months ?? 0), 0) /
    mockTrailerLeads.filter((l) => l.project_duration_months).length
  )

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Sites', value: active.length, sub: `${active.reduce((s,l) => s+(l.trailer_count??0),0)} trailers running`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pipeline Sites', value: pipeline.length, sub: `${pipeline.reduce((s,l) => s+(l.trailer_count??0),0)} trailers potential`, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Pipeline Value', value: `$${(pipelineValue/1000).toFixed(0)}k`, sub: `${totalTrailers} total trailers tracked`, color: 'text-bee-600', bg: 'bg-bee-50' },
          { label: 'Avg Project', value: `${avgDuration}mo`, sub: 'Average duration', color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.bg)}>
              <HardHat size={20} className={s.color} />
            </div>
            <div>
              <p className={clsx('text-xl font-black', s.color)}>{s.value}</p>
              <p className="text-xs font-semibold text-luxe-700 leading-tight">{s.label}</p>
              <p className="text-[11px] text-luxe-400">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-luxe-100">
          <div>
            <p className="font-semibold text-luxe-800">Houston Area — Construction Trailer Leads</p>
            <p className="text-xs text-luxe-400 mt-0.5">{filtered.length} site{filtered.length !== 1 ? 's' : ''} · Click any row to view details</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="select !py-1.5 !text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <button onClick={() => setAddOpen(true)} className="btn-primary !py-1.5 !text-xs">
              <Plus size={13} />Add Site
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-luxe-100 bg-luxe-50">
                {['Company / Contact', 'Site Address', 'Trailers', 'Duration', 'Frequency', 'Value', 'Status', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-luxe-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-luxe-50">
              {filtered.map((lead) => {
                const overdue = lead.next_follow_up && new Date(lead.next_follow_up) < new Date()
                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelected(lead)}
                    className="hover:bg-luxe-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-luxe-900 text-xs">{lead.company_name || lead.contact_name}</p>
                      <p className="text-[11px] text-luxe-400">{lead.contact_name} · {lead.phone}</p>
                      {lead.aec_project_id && (
                        <p className="text-[10px] font-mono text-luxe-300 mt-0.5">{lead.aec_project_id}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-luxe-700">{lead.site_address}</p>
                      <p className="text-[11px] text-luxe-400">{lead.city}, {lead.state}</p>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-block w-8 h-8 rounded-lg bg-orange-50 text-orange-700 font-bold text-sm flex items-center justify-center">
                        {lead.trailer_count ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {lead.project_duration_months
                        ? <span className="flex items-center gap-1 text-xs text-luxe-700"><Clock size={11} className="text-luxe-300" />{lead.project_duration_months} mo</span>
                        : <span className="text-luxe-300 text-xs">—</span>
                      }
                    </td>
                    <td className="px-4 py-3.5">
                      {lead.cleaning_frequency
                        ? <span className="flex items-center gap-1 text-xs text-luxe-700"><RefreshCw size={11} className="text-luxe-300" />{FREQ_LABEL[lead.cleaning_frequency]}</span>
                        : <span className="text-luxe-300 text-xs">—</span>
                      }
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {lead.project_value
                        ? <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-700"><DollarSign size={11} />{lead.project_value.toLocaleString()}</span>
                        : <span className="text-luxe-300 text-xs">—</span>
                      }
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={lead.status} />
                        {overdue && (
                          <span className="text-[10px] text-red-500 font-medium flex items-center gap-0.5">
                            <AlertCircle size={9} />Follow-up overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <ChevronDown size={14} className="text-luxe-300 group-hover:text-bee-400 -rotate-90 transition-colors" />
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-luxe-300 text-sm">
                    No construction trailer leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <DetailDrawer lead={selected} onClose={() => setSelected(null)} />}
      {addOpen && <AddTrailerLeadModal onClose={() => setAddOpen(false)} />}
    </>
  )
}
