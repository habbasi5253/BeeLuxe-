'use client'

import Link from 'next/link'
import { Plus, UserPlus, CalendarPlus, FileText, HardHat } from 'lucide-react'

const actions = [
  { label: 'New Lead', href: '/crm?new=1', icon: Plus, color: 'bee' },
  { label: 'Add Candidate', href: '/recruitment?new=1', icon: UserPlus, color: 'blue' },
  { label: 'Schedule Job', href: '/scheduling?new=1', icon: CalendarPlus, color: 'violet' },
  { label: 'Create Invoice', href: '/finance?new=invoice', icon: FileText, color: 'emerald' },
  { label: 'Trailer Lead', href: '/crm?type=construction_trailer&new=1', icon: HardHat, color: 'orange' },
]

const colorMap: Record<string, string> = {
  bee:     'bg-bee-100 text-bee-700 hover:bg-bee-200',
  blue:    'bg-blue-100 text-blue-700 hover:bg-blue-200',
  violet:  'bg-violet-100 text-violet-700 hover:bg-violet-200',
  emerald: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  orange:  'bg-orange-100 text-orange-700 hover:bg-orange-200',
}

export function QuickActions() {
  return (
    <div className="card">
      <p className="text-sm font-semibold text-luxe-700 mb-3">Quick Actions</p>
      <div className="grid grid-cols-1 gap-1.5">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${colorMap[a.color]}`}
          >
            <a.icon size={15} />
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
