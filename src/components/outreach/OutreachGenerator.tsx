'use client'

import { useState } from 'react'
import {
  Mail, MessageSquare, Copy, Check, ChevronDown, ChevronUp,
  HardHat, Home, Building2, Zap, RefreshCw, Users
} from 'lucide-react'
import { clsx } from 'clsx'

type Lead = {
  id: string
  company_name: string | null
  contact_name: string
  phone: string | null
  email: string | null
  lead_type: 'construction_trailer' | 'residential' | 'commercial' | 'industrial'
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
  city: string | null
  trailer_count: number | null
  project_duration_months: number | null
  cleaning_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom' | null
  project_value: number | null
  notes: string | null
}

const LEADS: Lead[] = [
  {
    id: '1', company_name: 'Apex Construction LLC', contact_name: 'Mike Torres',
    phone: '(713) 555-0101', email: 'mike@apexconstruction.com',
    lead_type: 'construction_trailer', status: 'new', city: 'Houston',
    trailer_count: 4, project_duration_months: 8, cleaning_frequency: 'weekly',
    project_value: 12800, notes: 'Large multi-phase project.',
  },
  {
    id: '2', company_name: 'BuildRight Corp', contact_name: 'Tom Hughes',
    phone: '(713) 555-0301', email: 'tom@buildright.com',
    lead_type: 'construction_trailer', status: 'contacted', city: 'Houston',
    trailer_count: 3, project_duration_months: 6, cleaning_frequency: 'biweekly',
    project_value: 7200, notes: 'Need to schedule site visit.',
  },
  {
    id: '3', company_name: 'Ridgeline Homes Dev', contact_name: 'Carlos Vega',
    phone: '(281) 555-0501', email: 'cvega@ridgelinehomes.com',
    lead_type: 'construction_trailer', status: 'qualified', city: 'Katy',
    trailer_count: 8, project_duration_months: 18, cleaning_frequency: 'weekly',
    project_value: 43200, notes: 'Largest pipeline deal.',
  },
  {
    id: '4', company_name: 'Gulf Coast Contractors', contact_name: 'Rosa Martinez',
    phone: '(713) 555-0788', email: 'rmartinez@gulfcoastco.com',
    lead_type: 'construction_trailer', status: 'new', city: 'Pasadena',
    trailer_count: 5, project_duration_months: 12, cleaning_frequency: 'weekly',
    project_value: 24000, notes: 'Industrial site near port.',
  },
  {
    id: '5', company_name: 'Skyline Properties', contact_name: 'Angela Reed',
    phone: '(713) 555-0401', email: 'areed@skylineprops.com',
    lead_type: 'commercial', status: 'new', city: 'Houston',
    trailer_count: null, project_duration_months: null, cleaning_frequency: 'monthly',
    project_value: 5200, notes: 'Office complex, 3 floors.',
  },
  {
    id: '6', company_name: null, contact_name: 'Sarah Chen',
    phone: '(832) 555-0201', email: 'schen@gmail.com',
    lead_type: 'residential', status: 'new', city: 'The Woodlands',
    trailer_count: null, project_duration_months: null, cleaning_frequency: 'biweekly',
    project_value: 280, notes: '3BR home, bi-weekly.',
  },
  {
    id: '7', company_name: 'Metro Office Mgmt', contact_name: 'Linda Shaw',
    phone: '(713) 555-0701', email: 'lshaw@metroofficemgmt.com',
    lead_type: 'commercial', status: 'contacted', city: 'Houston',
    trailer_count: null, project_duration_months: null, cleaning_frequency: 'weekly',
    project_value: 7800, notes: 'Proposal sent Jan 15.',
  },
  {
    id: '8', company_name: 'Lone Star Dev Group', contact_name: 'Derek Owens',
    phone: '(832) 555-0220', email: 'dowens@lonestardg.com',
    lead_type: 'construction_trailer', status: 'new', city: 'Houston',
    trailer_count: 2, project_duration_months: 5, cleaning_frequency: 'monthly',
    project_value: 3000, notes: 'Small retail buildout.',
  },
]

const TYPE_ICON = {
  construction_trailer: HardHat,
  residential: Home,
  commercial: Building2,
  industrial: Building2,
}
const TYPE_COLOR = {
  construction_trailer: 'text-orange-600 bg-orange-100',
  residential: 'text-blue-600 bg-blue-100',
  commercial: 'text-violet-600 bg-violet-100',
  industrial: 'text-gray-600 bg-gray-100',
}
const TYPE_LABEL = {
  construction_trailer: 'Construction Trailer',
  residential: 'Residential',
  commercial: 'Commercial',
  industrial: 'Industrial',
}
const FREQ_LABEL: Record<string, string> = {
  daily: 'daily', weekly: 'weekly', biweekly: 'bi-weekly', monthly: 'monthly', custom: 'custom',
}

function generateEmailTemplate(lead: Lead, tone: 'professional' | 'friendly'): string {
  const firstName = lead.contact_name.split(' ')[0]
  const company = lead.company_name ? ` at ${lead.company_name}` : ''
  const freq = lead.cleaning_frequency ? FREQ_LABEL[lead.cleaning_frequency] : 'regular'
  const duration = lead.project_duration_months ? ` for your ${lead.project_duration_months}-month project` : ''
  const trailerLine = lead.trailer_count
    ? `With ${lead.trailer_count} trailer${lead.trailer_count > 1 ? 's' : ''} on site, we can keep your crew's workspace clean, professional, and OSHA-compliant.`
    : `We can keep your space clean and professional on a ${freq} schedule.`

  if (lead.lead_type === 'construction_trailer') {
    if (tone === 'professional') {
      return `Subject: Professional Construction Trailer Cleaning – BeeLuxe Cleaners

Hi ${firstName},

I'm reaching out because BeeLuxe Cleaners specializes in construction trailer cleaning services in the ${lead.city ?? 'Houston'} area, and I believe we'd be a great fit for ${lead.company_name ?? 'your project'}.

${trailerLine} Our ${freq} cleaning program${duration} ensures your site trailers meet professional standards while your team stays focused on the build.

What we offer:
• ${freq.charAt(0).toUpperCase() + freq.slice(1)} deep cleans of all trailer interiors
• Flexible scheduling around your crew's hours
• Bonded & insured team with construction site experience
• Transparent pricing — no surprise fees

I'd love to schedule a quick 10-minute call or site walkthrough at your convenience. When works best for you this week?

Best regards,
BeeLuxe Cleaners
(713) 555-LUXE | hello@beeluxe.com`
    } else {
      return `Subject: Quick Question About Your Trailer Cleaning, ${firstName} 👋

Hey ${firstName}!

Hope the project${duration ? ` (${lead.project_duration_months} months — that's a solid run!)` : ''} is going well over in ${lead.city ?? 'Houston'}.

I run BeeLuxe Cleaners and we take care of construction trailer cleaning for crews all around the area. ${trailerLine}

We're pretty flexible — ${freq} visits, we work around your schedule, and we're in-and-out so your team barely notices us.

Want to chat for 5 minutes this week? Happy to swing by the site if that's easier.

Talk soon,
BeeLuxe Cleaners
(713) 555-LUXE`
    }
  }

  if (lead.lead_type === 'residential') {
    return `Subject: ${tone === 'professional' ? 'Professional Home Cleaning Services – BeeLuxe Cleaners' : `Keeping Your Home Spotless, ${firstName} ✨`}

${tone === 'professional' ? `Dear ${firstName},` : `Hey ${firstName}!`}

${tone === 'professional'
  ? `BeeLuxe Cleaners provides premium residential cleaning services in the ${lead.city ?? 'Houston'} area. We specialize in ${freq} home cleaning that gives you back your weekends.`
  : `Life gets busy — BeeLuxe Cleaners makes sure your home doesn't suffer for it! We offer ${freq} cleaning so you can come home to a spotless space every time.`}

Our residential services include:
• Full home deep cleans & recurring maintenance
• ${freq.charAt(0).toUpperCase() + freq.slice(1)} scheduling, customized to your home
• Eco-friendly products, bonded & insured team
• Easy online scheduling & flat-rate pricing

${tone === 'professional' ? `I'd be happy to provide a free quote. Please don't hesitate to reach out at your convenience.` : `Sound good? I'd love to give you a free quote — takes about 2 minutes!`}

${tone === 'professional' ? 'Sincerely,' : 'Talk soon,'}
BeeLuxe Cleaners
(713) 555-LUXE | hello@beeluxe.com`
  }

  // Commercial default
  return `Subject: ${tone === 'professional' ? 'Commercial Cleaning Solutions – BeeLuxe Cleaners' : `Let's Keep Your Space Spotless, ${firstName}`}

${tone === 'professional' ? `Dear ${firstName},` : `Hi ${firstName}!`}

BeeLuxe Cleaners provides professional commercial cleaning for offices and businesses across ${lead.city ?? 'Houston'}. We'd love to support ${lead.company_name ?? 'your business'} with ${freq} cleaning services that keep your team productive in a clean, welcoming environment.

Our commercial program includes:
• ${freq.charAt(0).toUpperCase() + freq.slice(1)} office & common area cleaning
• After-hours scheduling so we never disrupt your team
• Bonded, insured, and background-checked staff
• Customized checklist for your space

Let's set up a walkthrough — I can have a quote to you within 24 hours.

${tone === 'professional' ? 'Best regards,' : 'Looking forward to connecting,'}
BeeLuxe Cleaners
(713) 555-LUXE | hello@beeluxe.com`
}

function generateSMSTemplate(lead: Lead): string {
  const firstName = lead.contact_name.split(' ')[0]
  const freq = lead.cleaning_frequency ? FREQ_LABEL[lead.cleaning_frequency] : 'regular'

  if (lead.lead_type === 'construction_trailer') {
    const trailers = lead.trailer_count ? `${lead.trailer_count} trailers` : 'your trailers'
    return `Hi ${firstName}! This is BeeLuxe Cleaners — we specialize in construction trailer cleaning in ${lead.city ?? 'Houston'}. We'd love to help keep ${trailers} clean on a ${freq} schedule. Quick 5-min call this week? Reply YES or call (713) 555-LUXE. -BeeLuxe`
  }

  if (lead.lead_type === 'residential') {
    return `Hi ${firstName}! BeeLuxe Cleaners here — we do ${freq} home cleaning in ${lead.city ?? 'Houston'}. Want a free quote? Takes 2 min. Call/text (713) 555-LUXE or reply YES to learn more. -BeeLuxe`
  }

  return `Hi ${firstName}! BeeLuxe Cleaners here — we provide ${freq} commercial cleaning for businesses in ${lead.city ?? 'Houston'}. Would love to chat about ${lead.company_name ?? 'your space'}. Reply YES or call (713) 555-LUXE. -BeeLuxe`
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
  const text = mode === 'email' ? generateEmailTemplate(lead, tone) : generateSMSTemplate(lead)
  const preview = text.split('\n').find(l => l.trim() && !l.startsWith('Subject:')) ?? text.slice(0, 80)
  const Icon = TYPE_ICON[lead.lead_type]

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
            <span className="text-[11px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {lead.email ?? 'No email'}
            </span>
          ) : (
            <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
              {lead.phone ?? 'No phone'}
            </span>
          )}
          {expanded ? <ChevronUp size={14} className="text-luxe-400" /> : <ChevronDown size={14} className="text-luxe-400" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-luxe-100">
          <div className="flex items-center justify-between px-4 py-2 bg-luxe-50 border-b border-luxe-100">
            <p className="text-[11px] font-bold text-luxe-400 uppercase tracking-wider">
              {mode === 'email' ? 'Email Template' : 'SMS Template'} · {tone.charAt(0).toUpperCase() + tone.slice(1)} tone
            </p>
            <CopyButton text={text} />
          </div>
          <pre className="px-4 py-3 text-xs text-luxe-700 whitespace-pre-wrap font-mono leading-relaxed bg-white max-h-80 overflow-y-auto">
            {text}
          </pre>
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
  const [expandAll, setExpandAll] = useState(false)

  const filtered = LEADS.filter((l) => {
    if (typeFilter !== 'all' && l.lead_type !== typeFilter) return false
    if (statusFilter !== 'all' && l.status !== statusFilter) return false
    return true
  })

  const stats = {
    total: filtered.length,
    withEmail: filtered.filter((l) => l.email).length,
    withPhone: filtered.filter((l) => l.phone).length,
    construction: filtered.filter((l) => l.lead_type === 'construction_trailer').length,
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
            <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest mb-1.5">Lead Type</p>
            <select className="select !py-2 !text-xs" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="construction_trailer">Construction Trailer</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
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

          <div className="ml-auto">
            <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest mb-1.5">&nbsp;</p>
            <button
              onClick={() => setExpandAll(!expandAll)}
              className="btn-secondary !py-2 !text-xs"
            >
              <Zap size={13} />{expandAll ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex gap-4 mt-4 pt-4 border-t border-luxe-100">
          {[
            { label: 'Leads targeted', value: stats.total, icon: Users },
            { label: mode === 'email' ? 'Have email' : 'Have phone', value: mode === 'email' ? stats.withEmail : stats.withPhone, icon: mode === 'email' ? Mail : MessageSquare },
            { label: 'Construction sites', value: stats.construction, icon: HardHat },
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
              {mode === 'email' ? 'Email' : 'SMS'} Templates — {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-luxe-400 mt-0.5">Click any row to preview and copy the template</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-luxe-400">
            <RefreshCw size={12} />
            Auto-generated from lead data
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
