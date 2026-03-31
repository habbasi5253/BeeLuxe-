'use client'

import React, { useState } from 'react'
import { clsx } from 'clsx'
import { MapPin, Calendar, DollarSign, Home, Building2, ChevronRight, Sparkles, Wind, ArrowRightLeft, Star } from 'lucide-react'
import { LeadDetailModal } from './LeadDetailModal'

export type LeadType = 'residential' | 'commercial' | 'airbnb' | 'deep_clean' | 'move_in_out' | 'industrial'

export type Lead = {
  id: string
  company_name: string | null
  contact_name: string
  phone: string | null
  lead_type: LeadType
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  site_address: string | null
  city: string | null
  state: string | null
  project_value: number | null
  next_follow_up: string | null
  cleaning_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'one_time' | null
  notes: string | null
  created_at: string
}

const mockLeads: Lead[] = [
  {
    id: '1', company_name: null, contact_name: 'Sarah Chen',
    phone: '555-0201', lead_type: 'residential', status: 'new',
    site_address: '8802 Oak Lane', city: 'Plano', state: 'TX',
    project_value: 280, next_follow_up: '2024-01-20',
    cleaning_frequency: 'biweekly', notes: '3BR home, bi-weekly. Referred by Maria G.',
    created_at: '2024-01-17T14:00:00Z',
  },
  {
    id: '2', company_name: 'Skyline Properties', contact_name: 'Angela Reed',
    phone: '555-0401', lead_type: 'commercial', status: 'new',
    site_address: '100 Main St Suite 200', city: 'Dallas', state: 'TX',
    project_value: 5200, next_follow_up: '2024-01-21',
    cleaning_frequency: 'monthly', notes: 'Office complex, 3 floors. Monthly contract.',
    created_at: '2024-01-13T11:00:00Z',
  },
  {
    id: '3', company_name: 'Sunset Stays', contact_name: 'Maria Lopez',
    phone: '555-0301', lead_type: 'airbnb', status: 'contacted',
    site_address: '22 Lakeside Dr', city: 'Austin', state: 'TX',
    project_value: 1800, next_follow_up: '2024-01-23',
    cleaning_frequency: 'weekly', notes: '3-unit Airbnb portfolio, turnover cleans.',
    created_at: '2024-01-14T09:00:00Z',
  },
  {
    id: '4', company_name: null, contact_name: 'James Park',
    phone: '555-0601', lead_type: 'deep_clean', status: 'contacted',
    site_address: '404 Elm Court', city: 'Richardson', state: 'TX',
    project_value: 420, next_follow_up: '2024-01-22',
    cleaning_frequency: 'one_time', notes: 'One-time deep clean before move-in.',
    created_at: '2024-01-12T15:00:00Z',
  },
  {
    id: '5', company_name: 'Metro Office Mgmt', contact_name: 'Linda Shaw',
    phone: '555-0701', lead_type: 'commercial', status: 'qualified',
    site_address: '700 Akard St', city: 'Dallas', state: 'TX',
    project_value: 7800, next_follow_up: null,
    cleaning_frequency: 'weekly', notes: 'Proposal sent Jan 15.',
    created_at: '2024-01-08T10:00:00Z',
  },
  {
    id: '6', company_name: null, contact_name: 'Tom Hughes',
    phone: '555-0302', lead_type: 'move_in_out', status: 'qualified',
    site_address: '550 Commerce Park Dr', city: 'Irving', state: 'TX',
    project_value: 350, next_follow_up: '2024-01-24',
    cleaning_frequency: 'one_time', notes: 'Move-out clean, 4BR house.',
    created_at: '2024-01-14T09:00:00Z',
  },
  {
    id: '7', company_name: 'Gulf Coast Logistics', contact_name: 'Rosa Martinez',
    phone: '555-0788', lead_type: 'industrial', status: 'proposal',
    site_address: '900 Port Blvd', city: 'Houston', state: 'TX',
    project_value: 12000, next_follow_up: null,
    cleaning_frequency: 'weekly', notes: 'Warehouse + break rooms. Weekly service.',
    created_at: '2024-01-05T10:00:00Z',
  },
  {
    id: '8', company_name: null, contact_name: 'Kevin Wright',
    phone: '555-0102', lead_type: 'residential', status: 'won',
    site_address: '212 Maple Ave', city: 'Frisco', state: 'TX',
    project_value: 240, next_follow_up: null,
    cleaning_frequency: 'biweekly', notes: 'Recurring client. Converted!',
    created_at: '2024-01-05T10:00:00Z',
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

const typeIcon: Record<LeadType, React.ElementType> = {
  residential:  Home,
  commercial:   Building2,
  airbnb:       Star,
  deep_clean:   Sparkles,
  move_in_out:  ArrowRightLeft,
  industrial:   Wind,
}
const typeColor: Record<LeadType, string> = {
  residential:  'text-blue-600 bg-blue-100',
  commercial:   'text-violet-600 bg-violet-100',
  airbnb:       'text-amber-600 bg-amber-100',
  deep_clean:   'text-emerald-600 bg-emerald-100',
  move_in_out:  'text-rose-600 bg-rose-100',
  industrial:   'text-gray-600 bg-gray-100',
}
export const typeLabel: Record<LeadType, string> = {
  residential:  'Residential',
  commercial:   'Commercial',
  airbnb:       'Airbnb / STR',
  deep_clean:   'Deep Clean',
  move_in_out:  'Move-In/Out',
  industrial:   'Industrial',
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

      {lead.city && (
        <span className="flex items-center gap-1 text-[11px] text-luxe-400 mt-2">
          <MapPin size={10} />{lead.city}, {lead.state}
        </span>
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
    </button>
  )
}

export function LeadKanban() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = leads.find((l) => l.id === selectedId) ?? null

  const deleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== leadId))
    setSelectedId(null)
  }

  return (
    <>
      <div className="flex gap-3 p-4 h-full min-w-max">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.key)
          const total = colLeads.reduce((sum, l) => sum + (l.project_value ?? 0), 0)

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
                    {colLeads.length}
                  </span>
                  {total > 0 && (
                    <span className="text-[10px] text-luxe-400 font-medium">${(total/1000).toFixed(0)}k</span>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
                {colLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onClick={() => setSelectedId(lead.id)} />
                ))}
                {colLeads.length === 0 && (
                  <div className="text-center py-8 text-xs text-luxe-300">No leads here</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <LeadDetailModal lead={selected} onClose={() => setSelectedId(null)} onDelete={deleteLead} />
      )}
    </>
  )
}
