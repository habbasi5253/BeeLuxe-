'use client'

import { clsx } from 'clsx'
import { Phone, Mail, Star, CheckCircle2, Clock, XCircle } from 'lucide-react'

const cleaners = [
  {
    id: '1', name: 'Maria Gonzalez', phone: '555-1001', email: 'maria@example.com',
    status: 'active', rate: 22, skills: ['Deep Clean','Construction','Industrial'],
    todayJobs: 2, weekEarnings: 396, rating: 4.9,
  },
  {
    id: '2', name: 'James Wright', phone: '555-1002', email: 'james@example.com',
    status: 'active', rate: 20, skills: ['Residential','Commercial'],
    todayJobs: 1, weekEarnings: 280, rating: 4.7,
  },
  {
    id: '3', name: 'Aisha Patel', phone: '555-1003', email: 'aisha@example.com',
    status: 'active', rate: 22, skills: ['Construction','Industrial','Deep Clean'],
    todayJobs: 1, weekEarnings: 330, rating: 4.8,
  },
  {
    id: '4', name: 'Kevin Okafor', phone: '555-1004', email: 'kevin@example.com',
    status: 'active', rate: 20, skills: ['Residential','Commercial'],
    todayJobs: 0, weekEarnings: 180, rating: 4.6,
  },
  {
    id: '5', name: 'Rosa Medina', phone: '555-1005', email: 'rosa@example.com',
    status: 'on_leave', rate: 21, skills: ['Deep Clean','Residential'],
    todayJobs: 0, weekEarnings: 0, rating: 4.9,
  },
]

const statusConfig = {
  active:    { icon: CheckCircle2, label: 'Active',   color: 'text-emerald-600', bg: 'bg-emerald-100' },
  inactive:  { icon: XCircle,      label: 'Inactive', color: 'text-luxe-400',    bg: 'bg-luxe-100' },
  on_leave:  { icon: Clock,        label: 'On Leave', color: 'text-bee-600',     bg: 'bg-bee-100' },
}

export function CleanerRoster() {
  return (
    <div className="card !p-0 overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-luxe-100">
        <p className="font-semibold text-luxe-800">Active Cleaner Roster</p>
        <p className="text-xs text-luxe-400 mt-0.5">{cleaners.filter(c=>c.status==='active').length} available today</p>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-5 py-3">Cleaner</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Skills</th>
              <th className="text-center px-4 py-3">Today's Jobs</th>
              <th className="text-right px-4 py-3">Week Earnings</th>
              <th className="text-center px-4 py-3">Rating</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {cleaners.map((c) => {
              const s = statusConfig[c.status as keyof typeof statusConfig]
              return (
                <tr key={c.id} className="table-row">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-bee flex items-center justify-center text-white font-bold text-sm">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-luxe-900">{c.name}</p>
                        <div className="flex items-center gap-2 text-xs text-luxe-400 mt-0.5">
                          <span className="flex items-center gap-0.5"><Phone size={10}/>{c.phone}</span>
                          <span className="flex items-center gap-0.5"><Mail size={10}/>{c.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={clsx('flex items-center gap-1.5 text-xs font-semibold w-fit px-2.5 py-1 rounded-lg', s.bg, s.color)}>
                      <s.icon size={12} />{s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {c.skills.map((sk) => (
                        <span key={sk} className="text-[10px] bg-luxe-100 text-luxe-600 px-1.5 py-0.5 rounded-md">{sk}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={clsx(
                      'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold',
                      c.todayJobs > 0 ? 'bg-bee-100 text-bee-700' : 'bg-luxe-100 text-luxe-400'
                    )}>
                      {c.todayJobs}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-luxe-800">
                    ${c.weekEarnings}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="flex items-center justify-center gap-0.5 text-xs font-bold text-bee-600">
                      <Star size={11} className="fill-bee-400 text-bee-400" />
                      {c.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button className="btn-ghost text-xs py-1.5 px-3">View</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
