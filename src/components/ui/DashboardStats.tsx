'use client'

import { DollarSign, Users, Briefcase, TrendingUp, HardHat, Star } from 'lucide-react'
import { clsx } from 'clsx'

const stats = [
  {
    label: 'Monthly Revenue',
    value: '$28,450',
    change: '+12.5%',
    positive: true,
    icon: DollarSign,
    color: 'bee',
    sub: 'vs last month',
  },
  {
    label: 'Active Cleaners',
    value: '14',
    change: '+2',
    positive: true,
    icon: Users,
    color: 'blue',
    sub: 'hired this week',
  },
  {
    label: 'Open Jobs',
    value: '38',
    change: '+5',
    positive: true,
    icon: Briefcase,
    color: 'violet',
    sub: 'scheduled this week',
  },
  {
    label: 'Gross Margin',
    value: '61%',
    change: '+3.2%',
    positive: true,
    icon: TrendingUp,
    color: 'emerald',
    sub: 'revenue vs payouts',
  },
  {
    label: 'Construction Leads',
    value: '23',
    change: '+8',
    positive: true,
    icon: HardHat,
    color: 'orange',
    sub: 'active pipeline',
  },
  {
    label: 'Candidate Score',
    value: '87/100',
    change: '+4',
    positive: true,
    icon: Star,
    color: 'rose',
    sub: 'avg AI vetting score',
  },
]

const colorMap: Record<string, string> = {
  bee:     'bg-bee-100 text-bee-700',
  blue:    'bg-blue-100 text-blue-700',
  violet:  'bg-violet-100 text-violet-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  orange:  'bg-orange-100 text-orange-700',
  rose:    'bg-rose-100 text-rose-700',
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card !p-4 flex flex-col gap-3">
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', colorMap[s.color])}>
            <s.icon size={18} />
          </div>
          <div>
            <p className="text-2xl font-bold text-luxe-900">{s.value}</p>
            <p className="text-xs text-luxe-500 mt-0.5">{s.label}</p>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className={clsx('font-semibold', s.positive ? 'text-emerald-600' : 'text-red-500')}>
              {s.change}
            </span>
            <span className="text-luxe-400">{s.sub}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
