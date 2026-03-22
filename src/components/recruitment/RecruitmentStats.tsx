'use client'

import { Users, Bot, UserCheck, Clock } from 'lucide-react'

const stats = [
  { label: 'Total Applicants', value: '47', icon: Users, color: 'bg-blue-100 text-blue-700' },
  { label: 'AI Interviews Active', value: '12', icon: Bot, color: 'bg-bee-100 text-bee-700' },
  { label: 'Ready to Hire', value: '8', icon: UserCheck, color: 'bg-emerald-100 text-emerald-700' },
  { label: 'Avg Interview Time', value: '9 min', icon: Clock, color: 'bg-violet-100 text-violet-700' },
]

export function RecruitmentStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card !p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
            <s.icon size={20} />
          </div>
          <div>
            <p className="text-xl font-bold text-luxe-900">{s.value}</p>
            <p className="text-xs text-luxe-500">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
