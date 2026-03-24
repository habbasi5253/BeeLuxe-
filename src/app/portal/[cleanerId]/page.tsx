'use client'

import { use, useState } from 'react'
import { MOCK_CLEANERS, INITIAL_JOBS, JOB_COLORS } from '@/lib/scheduling'
import type { Job, ChecklistItem, JobType } from '@/lib/scheduling'
import {
  MapPin, Clock, CheckCircle2, Circle, ChevronDown, ChevronUp,
  AlertCircle, CalendarDays, Star, Phone
} from 'lucide-react'
import { clsx } from 'clsx'

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function fmtDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString())    return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString()
}
function isTomorrow(iso: string) {
  const t = new Date(); t.setDate(t.getDate() + 1)
  return new Date(iso).toDateString() === t.toDateString()
}
function mapsLink(address: string, city: string) {
  return `https://maps.google.com/?q=${encodeURIComponent(`${address}, ${city}, TX`)}`
}

const TYPE_LABEL: Record<JobType, string> = {
  construction_trailer: 'Construction Trailer',
  residential:          'Residential',
  commercial:           'Commercial',
  deep_clean:           'Deep Clean',
  airbnb:               'Airbnb Turnover',
  move_in_out:          'Move-In/Move-Out',
  recurring:            'Recurring Clean',
}

// ── Checklist component ──────────────────────────────────────────────────────
function Checklist({ items, onToggle }: { items: ChecklistItem[]; onToggle: (id: string) => void }) {
  const done = items.filter((i) => i.completed).length
  const pct  = Math.round((done / items.length) * 100)

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-luxe-100 overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-500',
              pct === 100 ? 'bg-emerald-500' : 'bg-bee-400')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={clsx('text-xs font-bold tabular-nums',
          pct === 100 ? 'text-emerald-600' : 'text-luxe-500')}>
          {done}/{items.length}
        </span>
      </div>

      {/* Items — min-h-[48px] for glove-friendly tap targets */}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              onClick={() => onToggle(item.id)}
              style={{ touchAction: 'manipulation' }}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl text-left transition-all active:scale-[0.98]',
                item.completed
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-luxe-50 text-luxe-700 active:bg-luxe-100'
              )}
            >
              {item.completed
                ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                : <Circle size={18} className="text-luxe-300 shrink-0" />
              }
              <span className={clsx('text-sm leading-snug', item.completed && 'line-through opacity-60')}>
                {item.text}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {pct === 100 && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <Star size={14} className="text-emerald-500" />
          <span className="text-sm font-semibold text-emerald-700">All done! Great work 🐝</span>
        </div>
      )}
    </div>
  )
}

// ── Job card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onChecklistToggle }: {
  job: Job & { checklist: ChecklistItem[] }
  onChecklistToggle: (itemId: string) => void
}) {
  const [expanded, setExpanded] = useState(isToday(job.scheduled_start))
  const color = JOB_COLORS[job.job_type]
  const today    = isToday(job.scheduled_start)
  const tomorrow = isTomorrow(job.scheduled_start)
  const done     = job.checklist.filter((i) => i.completed).length
  const isPast   = new Date(job.scheduled_end) < new Date()

  return (
    <div className={clsx(
      'rounded-2xl border-2 overflow-hidden transition-all',
      today    ? 'border-bee-300 shadow-md' :
      tomorrow ? 'border-luxe-200' :
      'border-luxe-100'
    )}>
      {/* Card header — full-width tap target, min 56px tall */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ touchAction: 'manipulation' }}
        className="w-full text-left min-h-[56px]"
      >
        <div className="flex items-stretch">
          {/* Color bar */}
          <div className="w-1.5 shrink-0" style={{ backgroundColor: color }} />

          <div className="flex-1 px-4 py-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {today && (
                    <span className="text-[10px] font-black text-white bg-bee-500 px-2 py-0.5 rounded-full uppercase tracking-wide">Today</span>
                  )}
                  {tomorrow && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Tomorrow</span>
                  )}
                  {isPast && !today && (
                    <span className="text-[10px] font-bold text-luxe-400 bg-luxe-100 px-2 py-0.5 rounded-full">Past</span>
                  )}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
                    {TYPE_LABEL[job.job_type]}
                  </span>
                </div>
                <p className="font-bold text-luxe-900 text-sm leading-tight">{job.title}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-luxe-400">{done}/{job.checklist.length}</span>
                {expanded ? <ChevronUp size={16} className="text-luxe-400" /> : <ChevronDown size={16} className="text-luxe-400" />}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <span className="flex items-center gap-1.5 text-xs text-luxe-500">
                <Clock size={12} className="text-luxe-300" />
                {fmtTime(job.scheduled_start)} – {fmtTime(job.scheduled_end)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-luxe-500">
                <MapPin size={12} className="text-luxe-300" />
                {job.address}, {job.city}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-luxe-100 space-y-4">
          {/* Quick info */}
          {/* min-h-[52px] — large enough even with work gloves */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={mapsLink(job.address, job.city)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ touchAction: 'manipulation' }}
              className="flex items-center justify-center gap-2 px-3 py-3.5 min-h-[52px] rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold active:bg-blue-100 transition-colors"
            >
              <MapPin size={15} />Get Directions
            </a>
            <div className="flex items-center justify-center gap-2 px-3 py-3.5 min-h-[52px] rounded-xl bg-luxe-50 border border-luxe-200 text-luxe-600 text-sm font-semibold">
              <CalendarDays size={15} />
              {fmtDate(job.scheduled_start)}
            </div>
          </div>

          {job.notes && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">{job.notes}</p>
            </div>
          )}

          {/* Checklist */}
          <div>
            <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest mb-2">Job Checklist</p>
            <Checklist items={job.checklist} onToggle={onChecklistToggle} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function PortalPage({ params }: { params: Promise<{ cleanerId: string }> }) {
  const { cleanerId } = use(params)

  const cleaner = MOCK_CLEANERS.find((c) => c.id === cleanerId)

  // Local state for checklist toggles (keyed by jobId → itemId)
  const [checklists, setChecklists] = useState<Record<string, ChecklistItem[]>>(
    Object.fromEntries(INITIAL_JOBS.map((j) => [j.id, j.checklist]))
  )

  if (!cleaner) {
    return (
      <div className="min-h-screen bg-luxe-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-3">🐝</div>
          <p className="font-bold text-luxe-800">Portal not found</p>
          <p className="text-sm text-luxe-500 mt-1">Check your link or contact BeeLuxe.</p>
        </div>
      </div>
    )
  }

  // Jobs assigned to this cleaner, sorted by start time
  const myJobs = INITIAL_JOBS
    .filter((j) => j.cleaner_id === cleanerId && j.status !== 'completed' && j.status !== 'cancelled')
    .sort((a, b) => new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime())

  const todayJobs    = myJobs.filter((j) => isToday(j.scheduled_start))
  const upcomingJobs = myJobs.filter((j) => !isToday(j.scheduled_start))

  const toggleItem = (jobId: string, itemId: string) => {
    setChecklists((prev) => ({
      ...prev,
      [jobId]: prev[jobId].map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    }))
  }

  const jobsWithChecklists = (jobs: Job[]) =>
    jobs.map((j) => ({ ...j, checklist: checklists[j.id] ?? j.checklist }))

  return (
    <div className="min-h-screen bg-gradient-to-b from-bee-50 to-luxe-50 pb-10">
      {/* Header */}
      <div className="bg-white border-b border-luxe-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-bee flex items-center justify-center text-white font-black text-lg shrink-0">
            {cleaner.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-luxe-900 leading-tight">Hey, {cleaner.name.split(' ')[0]}! 🐝</p>
            <p className="text-xs text-luxe-400">BeeLuxe Cleaners · Your Schedule</p>
          </div>
          {/* min 44×44 touch target for gloves */}
          <a
            href={`tel:${cleaner.phone}`}
            style={{ touchAction: 'manipulation' }}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-luxe-100 text-luxe-500 active:bg-luxe-200 transition-colors"
          >
            <Phone size={18} />
          </a>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-6">

        {/* Today's jobs */}
        {todayJobs.length > 0 ? (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-bee-500 animate-pulse" />
              <h2 className="font-bold text-luxe-800 text-sm uppercase tracking-wider">Today's Jobs</h2>
              <span className="text-xs font-bold text-bee-600 bg-bee-100 px-2 py-0.5 rounded-full">{todayJobs.length}</span>
            </div>
            <div className="space-y-3">
              {jobsWithChecklists(todayJobs).map((job) => (
                <JobCard key={job.id} job={job} onChecklistToggle={(id) => toggleItem(job.id, id)} />
              ))}
            </div>
          </section>
        ) : (
          <div className="bg-white rounded-2xl border border-luxe-100 p-6 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <p className="font-semibold text-luxe-700">No jobs today — enjoy your day!</p>
          </div>
        )}

        {/* Upcoming jobs */}
        {upcomingJobs.length > 0 && (
          <section>
            <h2 className="font-bold text-luxe-800 text-sm uppercase tracking-wider mb-3">Upcoming</h2>
            <div className="space-y-3">
              {jobsWithChecklists(upcomingJobs).map((job) => (
                <JobCard key={job.id} job={job} onChecklistToggle={(id) => toggleItem(job.id, id)} />
              ))}
            </div>
          </section>
        )}

        {myJobs.length === 0 && (
          <div className="bg-white rounded-2xl border border-luxe-100 p-8 text-center">
            <CalendarDays size={28} className="text-luxe-300 mx-auto mb-3" />
            <p className="font-semibold text-luxe-600">No upcoming jobs scheduled</p>
            <p className="text-sm text-luxe-400 mt-1">Check back soon or contact your coordinator.</p>
          </div>
        )}

        <p className="text-center text-xs text-luxe-300 pt-2">
          BeeLuxe Cleaners · Questions? Call (713) 555-LUXE
        </p>
      </div>
    </div>
  )
}
