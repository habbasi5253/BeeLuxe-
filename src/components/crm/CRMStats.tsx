'use client'

import { HardHat, Home, Building2, TrendingUp } from 'lucide-react'

const stats = [
  {
    label: 'Construction Trailer',
    value: '23',
    sub: '$128,400 pipeline',
    icon: HardHat,
    color: 'bg-orange-100 text-orange-700',
    bar: 68,
    barColor: 'bg-orange-400',
  },
  {
    label: 'Residential',
    value: '41',
    sub: '$52,200 pipeline',
    icon: Home,
    color: 'bg-blue-100 text-blue-700',
    bar: 45,
    barColor: 'bg-blue-400',
  },
  {
    label: 'Commercial B2B',
    value: '18',
    sub: '$97,600 pipeline',
    icon: Building2,
    color: 'bg-violet-100 text-violet-700',
    bar: 55,
    barColor: 'bg-violet-400',
  },
  {
    label: 'Conversion Rate',
    value: '34%',
    sub: '+8% this quarter',
    icon: TrendingUp,
    color: 'bg-emerald-100 text-emerald-700',
    bar: 34,
    barColor: 'bg-emerald-400',
  },
]

export function CRMStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card !p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xl font-bold text-luxe-900">{s.value}</p>
              <p className="text-xs text-luxe-500">{s.label}</p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-luxe-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${s.barColor}`} style={{ width: `${s.bar}%` }} />
          </div>
          <p className="text-xs text-luxe-400 mt-1.5">{s.sub}</p>
        </div>
      ))}
    </div>
  )
}
