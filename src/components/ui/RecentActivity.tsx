'use client'

import { MessageSquare, UserCheck, DollarSign, CalendarCheck, HardHat } from 'lucide-react'

const activities = [
  {
    icon: UserCheck,
    color: 'text-emerald-600 bg-emerald-100',
    text: 'Maria Gonzalez approved after AI vetting',
    time: '10m ago',
  },
  {
    icon: HardHat,
    color: 'text-orange-600 bg-orange-100',
    text: 'New construction trailer lead — Apex Site #4',
    time: '34m ago',
  },
  {
    icon: DollarSign,
    color: 'text-bee-600 bg-bee-100',
    text: 'Invoice #BL-0042 paid · $1,850',
    time: '1h ago',
  },
  {
    icon: CalendarCheck,
    color: 'text-violet-600 bg-violet-100',
    text: 'Job #38 assigned to James Wright',
    time: '2h ago',
  },
  {
    icon: MessageSquare,
    color: 'text-blue-600 bg-blue-100',
    text: 'SMS interview sent to candidate Darius Lee',
    time: '3h ago',
  },
]

export function RecentActivity() {
  return (
    <div className="card">
      <p className="text-sm font-semibold text-luxe-700 mb-3">Recent Activity</p>
      <div className="space-y-2">
        {activities.map((a, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${a.color}`}>
              <a.icon size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-luxe-700 leading-snug">{a.text}</p>
              <p className="text-[10px] text-luxe-400 mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
