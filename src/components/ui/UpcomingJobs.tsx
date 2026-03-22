'use client'

import { clsx } from 'clsx'
import { MapPin, Clock, User } from 'lucide-react'

const jobs = [
  {
    id: 'BL-038',
    title: 'Apex Construction Trailer #4',
    type: 'construction_trailer',
    address: '1200 Industrial Blvd, Dallas TX',
    scheduled: 'Today 7:00 AM',
    cleaner: 'Maria Gonzalez',
    price: 380,
    status: 'in_progress',
  },
  {
    id: 'BL-039',
    title: 'Greenfield Home — Deep Clean',
    type: 'residential',
    address: '405 Oak Lane, Plano TX',
    scheduled: 'Today 10:30 AM',
    cleaner: 'James Wright',
    price: 220,
    status: 'scheduled',
  },
  {
    id: 'BL-040',
    title: 'Metro Commercial — Office Suite',
    type: 'commercial',
    address: '800 Commerce St, Dallas TX',
    scheduled: 'Today 2:00 PM',
    cleaner: 'Aisha Patel',
    price: 540,
    status: 'scheduled',
  },
  {
    id: 'BL-041',
    title: 'Sunrise Apartments — Move-Out',
    type: 'residential',
    address: '222 Riverside Dr, Garland TX',
    scheduled: 'Tomorrow 8:00 AM',
    cleaner: 'Unassigned',
    price: 310,
    status: 'scheduled',
  },
  {
    id: 'BL-042',
    title: 'Apex Construction Trailer #7',
    type: 'construction_trailer',
    address: '1500 Industrial Blvd, Dallas TX',
    scheduled: 'Tomorrow 7:00 AM',
    cleaner: 'Aisha Patel',
    price: 380,
    status: 'scheduled',
  },
]

const typeLabels: Record<string, string> = {
  construction_trailer: 'Trailer',
  residential: 'Residential',
  commercial: 'Commercial',
}

const typeColors: Record<string, string> = {
  construction_trailer: 'bg-orange-100 text-orange-700',
  residential: 'bg-blue-100 text-blue-700',
  commercial: 'bg-violet-100 text-violet-700',
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-luxe-100 text-luxe-600',
  in_progress: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-500',
}

export function UpcomingJobs() {
  return (
    <div className="card !p-0 overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-luxe-100">
        <p className="font-semibold text-luxe-800">Upcoming Jobs</p>
        <a href="/scheduling" className="text-xs text-bee-600 hover:text-bee-700 font-medium">
          View calendar →
        </a>
      </div>
      <div className="divide-y divide-luxe-50">
        {jobs.map((job) => (
          <div key={job.id} className="flex items-start gap-4 px-5 py-3.5 hover:bg-luxe-50/60 transition-colors">
            <div className="shrink-0 mt-0.5">
              <span className={clsx('badge', typeColors[job.type])}>
                {typeLabels[job.type]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-luxe-900 truncate">{job.title}</p>
                <span className="text-sm font-bold text-luxe-700 shrink-0">${job.price}</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-luxe-500">
                  <MapPin size={11} /> {job.address}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-luxe-400">
                  <Clock size={11} /> {job.scheduled}
                </span>
                <span className="flex items-center gap-1 text-xs text-luxe-400">
                  <User size={11} /> {job.cleaner}
                </span>
              </div>
            </div>
            <div className="shrink-0 mt-0.5">
              <span className={clsx('badge text-[10px]', statusColors[job.status])}>
                {job.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
