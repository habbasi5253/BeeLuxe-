'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { MapPin, Phone, Calendar, DollarSign, HardHat, Home, Building2, ChevronRight } from 'lucide-react'
import { LeadDetailModal } from './LeadDetailModal'

export type Lead = {
  id: string
  company_name: string | null
  contact_name: string
  phone: string | null
  lead_type: 'construction_trailer' | 'residential' | 'commercial' | 'industrial'
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  site_address: string | null
  city: string | null
  state: string | null
  project_value: number | null
  next_follow_up: string | null
  trailer_count: number | null
  aec_project_id: string | null
  project_duration_months: number | null
  cleaning_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom' | null
  notes: string | null
  created_at: string
  // AEC site access fields — critical for construction sites (50-acre lots with multiple trailers)
  site_entry_notes: string | null  // "Enter Gate B, blue trailer near water tower, ask for site super"
  gate_code: string | null         // access code or badge instructions
  trailer_photo_url: string | null // direct link to photo so cleaner can identify the right trailer
}

const mockLeads: Lead[] = [
  {
    id: '1', company_name: 'Apex Construction LLC', contact_name: 'Mike Torres',
    phone: '555-0101', lead_type: 'construction_trailer', status: 'new',
    site_address: '1200 Industrial Blvd', city: 'Dallas', state: 'TX',
    project_value: 12000, next_follow_up: '2024-01-22', trailer_count: 4,
    aec_project_id: 'AEC-2024-0441', project_duration_months: 8, cleaning_frequency: 'weekly',
    notes: 'Large multi-phase project. 4 trailers on site.',
    created_at: '2024-01-16T10:00:00Z',
    site_entry_notes: 'Enter via Gate 3 (north side off Industrial Blvd). Check in with site security. Trailers are labeled A–D near the equipment yard — look for the orange BeeLuxe sticker on the door frame.',
    gate_code: '4419#',
    trailer_photo_url: null,
  },
  {
    id: '2', company_name: null, contact_name: 'Sarah Chen',
    phone: '555-0201', lead_type: 'residential', status: 'new',
    site_address: '8802 Oak Lane', city: 'Plano', state: 'TX',
    project_value: 280, next_follow_up: '2024-01-20', trailer_count: null,
    aec_project_id: null, project_duration_months: null, cleaning_frequency: 'biweekly',
    notes: '3BR home, bi-weekly. Referred by Maria G.',
    created_at: '2024-01-17T14:00:00Z',
    site_entry_notes: null, gate_code: null, trailer_photo_url: null,
  },
  {
    id: '3', company_name: 'BuildRight Corp', contact_name: 'Tom Hughes',
    phone: '555-0301', lead_type: 'construction_trailer', status: 'contacted',
    site_address: '550 Commerce Park Dr', city: 'Irving', state: 'TX',
    project_value: 8400, next_follow_up: '2024-01-23', trailer_count: 3,
    aec_project_id: 'AEC-2024-0389', project_duration_months: 6, cleaning_frequency: 'biweekly',
    notes: 'Need to schedule site visit.',
    created_at: '2024-01-14T09:00:00Z',
    site_entry_notes: 'Main entrance on Commerce Park Dr — parking lot near trailer row. Trailers #1–3 are white with red stripe, parked adjacent to the concrete batch plant.',
    gate_code: null,
    trailer_photo_url: null,
  },
  {
    id: '4', company_name: 'Skyline Properties', contact_name: 'Angela Reed',
    phone: '555-0401', lead_type: 'commercial', status: 'contacted',
    site_address: '100 Main St Suite 200', city: 'Dallas', state: 'TX',
    project_value: 5200, next_follow_up: '2024-01-21', trailer_count: null,
    aec_project_id: null, project_duration_months: null, cleaning_frequency: 'monthly',
    notes: 'Office complex, 3 floors. Monthly contract possible.',
    created_at: '2024-01-13T11:00:00Z',
    site_entry_notes: null, gate_code: null, trailer_photo_url: null,
  },
  {
    id: '5', company_name: 'Ridgeline Homes Dev', contact_name: 'Carlos Vega',
    phone: '555-0501', lead_type: 'construction_trailer', status: 'qualified',
    site_address: '3300 Ridgeline Pkwy', city: 'Frisco', state: 'TX',
    project_value: 19200, next_follow_up: '2024-01-25', trailer_count: 8,
    aec_project_id: 'AEC-2024-0512', project_duration_months: 18, cleaning_frequency: 'weekly',
    notes: 'Largest pipeline deal. 8-trailer subdivision.',
    created_at: '2024-01-10T08:00:00Z',
    site_entry_notes: 'LARGE SITE (~50 acres). Enter via Ridgeline Pkwy main gate — badge required (Carlos provides day passes). Trailers 1–8 are arranged in two rows behind the sales center. Row A (1–4) is closest to gate; Row B (5–8) is at the far end near the model homes. Use the site map photo link.',
    gate_code: 'Badge — call Carlos at 555-0501 for day pass',
    trailer_photo_url: 'https://example.com/ridgeline-site-layout.jpg',
  },
  {
    id: '6', company_name: null, contact_name: 'James Park',
    phone: '555-0601', lead_type: 'residential', status: 'qualified',
    site_address: '404 Elm Court', city: 'Richardson', state: 'TX',
    project_value: 180, next_follow_up: '2024-01-22', trailer_count: null,
    aec_project_id: null, project_duration_months: null, cleaning_frequency: 'weekly',
    notes: 'Weekly cleaning, flexible schedule.',
    created_at: '2024-01-12T15:00:00Z',
    site_entry_notes: null, gate_code: null, trailer_photo_url: null,
  },
  {
    id: '7', company_name: 'Metro Office Mgmt', contact_name: 'Linda Shaw',
    phone: '555-0701', lead_type: 'commercial', status: 'proposal',
    site_address: '700 Akard St', city: 'Dallas', state: 'TX',
    project_value: 7800, next_follow_up: null, trailer_count: null,
    aec_project_id: null, project_duration_months: null, cleaning_frequency: 'weekly',
    notes: 'Proposal sent Jan 15. Follow up if no response.',
    created_at: '2024-01-08T10:00:00Z',
    site_entry_notes: null, gate_code: null, trailer_photo_url: null,
  },
  {
    id: '8', company_name: 'Apex Construction LLC', contact_name: 'Mike Torres',
    phone: '555-0101', lead_type: 'construction_trailer', status: 'won',
    site_address: '900 Industrial Blvd', city: 'Dallas', state: 'TX',
    project_value: 4800, next_follow_up: null, trailer_count: 2,
    aec_project_id: 'AEC-2023-0388', project_duration_months: 4, cleaning_frequency: 'weekly',
    notes: 'Converted! Monthly recurring.',
    created_at: '2024-01-05T10:00:00Z',
    site_entry_notes: 'Side entrance off 900 Industrial Blvd service road. Two white Apex-branded trailers near the crane yard.',
    gate_code: '7731',
    trailer_photo_url: null,
  },
]

const columns: { key: Lead['status']; label: string; color: string }[] = [
  { key: 'new',       label: 'New',      color: 'border-t-luxe-300' },
  { key: 'contacted', label: 'Contacted',color: 'border-t-blue-400' },
  { key: 'qualified', label: 'Qualified', color: 'border-t-bee-400' },
  { key: 'proposal',  label: 'Proposal', color: 'border-t-violet-400' },
  { key: 'won',       label: 'Won',      color: 'border-t-emerald-400' },
  { key: 'lost',      label: 'Lost',     color: 'border-t-red-400' },
]

const typeIcon = {
  construction_trailer: HardHat,
  residential: Home,
  commercial: Building2,
  industrial: Building2,
}
const typeColor = {
  construction_trailer: 'text-orange-600 bg-orange-100',
  residential: 'text-blue-600 bg-blue-100',
  commercial: 'text-violet-600 bg-violet-100',
  industrial: 'text-gray-600 bg-gray-100',
}

function LeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const Icon = typeIcon[lead.lead_type]
  const now = new Date()
  const followUp = lead.next_follow_up ? new Date(lead.next_follow_up) : null
  const overdue = followUp && followUp < now

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-luxe-100 rounded-xl p-3.5 hover:shadow-md hover:border-bee-200 transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={clsx('w-6 h-6 rounded-lg flex items-center justify-center shrink-0', typeColor[lead.lead_type])}>
          <Icon size={12} />
        </div>
        {lead.project_value && (
          <span className="text-xs font-bold text-luxe-700 flex items-center gap-0.5">
            <DollarSign size={10} />{lead.project_value.toLocaleString()}
          </span>
        )}
      </div>

      <p className="text-xs font-semibold text-luxe-900 leading-snug">
        {lead.company_name || lead.contact_name}
      </p>
      {lead.company_name && (
        <p className="text-[11px] text-luxe-500 mt-0.5">{lead.contact_name}</p>
      )}

      {(lead.city || lead.trailer_count) && (
        <div className="flex items-center gap-2 mt-2">
          {lead.city && (
            <span className="flex items-center gap-1 text-[11px] text-luxe-400">
              <MapPin size={10} />{lead.city}, {lead.state}
            </span>
          )}
          {lead.trailer_count && (
            <span className="text-[11px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-medium">
              {lead.trailer_count} trailers
            </span>
          )}
        </div>
      )}

      {followUp && (
        <div className={clsx(
          'flex items-center gap-1 mt-2 text-[11px] font-medium',
          overdue ? 'text-red-500' : 'text-luxe-400'
        )}>
          <Calendar size={10} />
          {overdue ? 'OVERDUE: ' : 'Follow-up: '}
          {followUp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )}

      {lead.aec_project_id && (
        <div className="mt-2 text-[10px] bg-luxe-50 text-luxe-500 px-2 py-0.5 rounded-lg inline-block font-mono">
          {lead.aec_project_id}
        </div>
      )}
    </button>
  )
}

export function LeadKanban() {
  const [selected, setSelected] = useState<Lead | null>(null)

  return (
    <>
      <div className="flex gap-3 p-4 h-full min-w-max">
        {columns.map((col) => {
          const leads = mockLeads.filter((l) => l.status === col.key)
          const total = leads.reduce((sum, l) => sum + (l.project_value ?? 0), 0)

          return (
            <div
              key={col.key}
              className={clsx(
                'flex flex-col w-64 shrink-0 bg-luxe-50 rounded-2xl border-t-4 overflow-hidden',
                col.color
              )}
            >
              <div className="px-3 py-3 flex items-center justify-between border-b border-luxe-100 bg-white">
                <span className="text-xs font-bold text-luxe-700 uppercase tracking-wide">{col.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-luxe-100 flex items-center justify-center text-[10px] font-bold text-luxe-600">
                    {leads.length}
                  </span>
                  {total > 0 && (
                    <span className="text-[10px] text-luxe-400 font-medium">${(total/1000).toFixed(0)}k</span>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {leads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onClick={() => setSelected(lead)} />
                ))}
                {leads.length === 0 && (
                  <div className="text-center py-8 text-xs text-luxe-300">No leads here</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <LeadDetailModal lead={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}
