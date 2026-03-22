'use client'

import { useState } from 'react'
import { CalendarView } from './CalendarView'
import { CleanerRoster } from './CleanerRoster'
import { JobFormModal } from './JobFormModal'
import { JobDetailPopup } from './JobDetailPopup'
import { NotificationPanel } from './NotificationPanel'
import { INITIAL_JOBS, MOCK_CLEANERS } from '@/lib/scheduling'
import type { Job } from '@/lib/scheduling'
import { clsx } from 'clsx'
import { AlertCircle, Bell, Loader2, CheckCircle2 } from 'lucide-react'

type ViewTab = 'calendar' | 'roster' | 'notifications'

interface NewJobSlot { start: string; end: string }

export function SchedulingHub() {
  const [tab, setTab]           = useState<ViewTab>('calendar')
  const [jobs, setJobs]         = useState<Job[]>(INITIAL_JOBS)
  const [newJobOpen, setNewJobOpen]   = useState(false)
  const [newJobSlot, setNewJobSlot]   = useState<NewJobSlot | null>(null)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [blasting, setBlasting] = useState(false)
  const [blastDone, setBlastDone] = useState(false)

  // ── Shared job CRUD ───────────────────────────────────────────────────────
  const updateJob = (jobId: string, updates: Partial<Job>) =>
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, ...updates } : j)))

  const addJob = (job: Job) => setJobs((prev) => [...prev, job])

  const moveJob = (jobId: string, start: string, end: string) =>
    updateJob(jobId, { scheduled_start: start, scheduled_end: end })

  // ── Derived data ──────────────────────────────────────────────────────────
  const unassigned = jobs.filter((j) => !j.cleaner_id && j.status === 'scheduled')
  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null

  // ── 24hr reminder blast ───────────────────────────────────────────────────
  const blast24h = async () => {
    setBlasting(true)
    setBlastDone(false)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toDateString()

    const targets = jobs.filter((j) => {
      const d = new Date(j.scheduled_start)
      return d.toDateString() === tomorrowStr && j.cleaner_id && j.cleaner_phone
    })

    await Promise.all(
      targets.map((j) =>
        fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'reminder_24h',
            phone: j.cleaner_phone!,
            cleaner_name: j.cleaner_name!,
            job_title: j.title,
            address: j.address,
            city: j.city,
            start_time: j.scheduled_start,
          }),
        })
      )
    )
    setBlasting(false)
    setBlastDone(true)
    setTimeout(() => setBlastDone(false), 4000)
  }

  const tabs: { key: ViewTab; label: string }[] = [
    { key: 'calendar', label: 'Calendar' },
    { key: 'roster', label: 'Cleaner Roster' },
    { key: 'notifications', label: 'Notifications' },
  ]

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Unassigned jobs banner */}
      {unassigned.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle size={16} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800 font-medium flex-1">
            <span className="font-bold">{unassigned.length} job{unassigned.length > 1 ? 's' : ''} unassigned</span>
            {' '}— {unassigned.map((j) => j.title).join(', ')}
          </p>
        </div>
      )}

      {/* Tab bar + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 bg-white border border-luxe-100 rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === t.key
                  ? 'bg-bee-500 text-white shadow-sm'
                  : 'text-luxe-600 hover:bg-luxe-50'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {/* 24hr blast */}
          <button
            onClick={blast24h}
            disabled={blasting || blastDone}
            className={clsx(
              'btn-secondary text-xs gap-1.5',
              blastDone && '!bg-emerald-50 !border-emerald-200 !text-emerald-700'
            )}
          >
            {blasting ? (
              <><Loader2 size={13} className="animate-spin" />Sending…</>
            ) : blastDone ? (
              <><CheckCircle2 size={13} />Reminders Sent!</>
            ) : (
              <><Bell size={13} />Blast 24h Reminders</>
            )}
          </button>

          <button
            onClick={() => { setNewJobSlot(null); setNewJobOpen(true) }}
            className="btn-primary"
          >
            + Schedule Job
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'calendar' && (
          <CalendarView
            jobs={jobs}
            onJobClick={(id) => setSelectedJobId(id)}
            onJobDrop={moveJob}
            onNewJobSlot={(slot) => { setNewJobSlot(slot); setNewJobOpen(true) }}
          />
        )}
        {tab === 'roster' && <CleanerRoster />}
        {tab === 'notifications' && <NotificationPanel jobs={jobs} cleaners={MOCK_CLEANERS} />}
      </div>

      {/* Job detail popup */}
      {selectedJob && (
        <JobDetailPopup
          job={selectedJob}
          cleaners={MOCK_CLEANERS}
          onClose={() => setSelectedJobId(null)}
          onSave={(updates) => { updateJob(selectedJob.id, updates); setSelectedJobId(null) }}
        />
      )}

      {/* New job modal */}
      {newJobOpen && (
        <JobFormModal
          initialSlot={newJobSlot ?? undefined}
          cleaners={MOCK_CLEANERS}
          onClose={() => { setNewJobOpen(false); setNewJobSlot(null) }}
          onSave={(job) => { addJob(job); setNewJobOpen(false); setNewJobSlot(null) }}
        />
      )}
    </div>
  )
}
