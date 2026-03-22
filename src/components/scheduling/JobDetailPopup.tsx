'use client'

import { useState } from 'react'
import {
  X, MapPin, Clock, DollarSign, Bell, Loader2, CheckCircle2,
  Circle, AlertCircle, ExternalLink, User
} from 'lucide-react'
import { clsx } from 'clsx'
import type { Job, Cleaner, ChecklistItem } from '@/lib/scheduling'

interface Props {
  job: Job
  cleaners: Cleaner[]
  onClose: () => void
  onSave: (updates: Partial<Job>) => void
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
function mapsLink(address: string, city: string) {
  return `https://maps.google.com/?q=${encodeURIComponent(`${address}, ${city}, TX`)}`
}

const STATUS_COLORS: Record<string, string> = {
  scheduled:   'bg-luxe-100 text-luxe-600',
  in_progress: 'bg-emerald-100 text-emerald-700',
  completed:   'bg-gray-100 text-gray-500',
  cancelled:   'bg-red-100 text-red-500',
}

export function JobDetailPopup({ job, cleaners, onClose, onSave }: Props) {
  const [assignedId, setAssignedId]     = useState(job.cleaner_id ?? '')
  const [checklist, setChecklist]       = useState<ChecklistItem[]>(job.checklist)
  const [notifying, setNotifying]       = useState(false)
  const [notified, setNotified]         = useState(false)
  const [notifyError, setNotifyError]   = useState<string | null>(null)
  const [saving, setSaving]             = useState(false)

  const assignedCleaner = cleaners.find((c) => c.id === assignedId) ?? null
  const done = checklist.filter((i) => i.completed).length
  const pct  = checklist.length > 0 ? Math.round((done / checklist.length) * 100) : 0

  const toggleItem = (id: string) =>
    setChecklist((prev) => prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)))

  // ── Send assignment SMS ───────────────────────────────────────────────────
  const handleNotify = async (type: 'assignment' | 'reminder_1h') => {
    if (!assignedCleaner) return
    setNotifying(true)
    setNotifyError(null)
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          phone: assignedCleaner.phone,
          cleaner_name: assignedCleaner.name,
          job_title: job.title,
          address: job.address,
          city: job.city,
          start_time: job.scheduled_start,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setNotified(true)
    } catch (err) {
      setNotifyError(err instanceof Error ? err.message : 'SMS error')
    } finally {
      setNotifying(false)
    }
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    const cleaner = cleaners.find((c) => c.id === assignedId)
    const updates: Partial<Job> = {
      cleaner_id:    assignedId || null,
      cleaner_name:  cleaner?.name ?? null,
      cleaner_phone: cleaner?.phone ?? null,
      checklist,
    }
    onSave(updates)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxe-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-luxe-100 shrink-0">
          <p className="font-bold text-luxe-900 text-base leading-tight">{job.title}</p>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-luxe-100 text-luxe-500">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Status + type badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={clsx('badge', STATUS_COLORS[job.status])}>
              {job.status.replace('_', ' ')}
            </span>
            <span className="badge bg-luxe-100 text-luxe-600 capitalize">
              {job.job_type.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Info row */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-luxe-700">
              <Clock size={13} className="text-luxe-400 shrink-0" />
              {fmtDate(job.scheduled_start)} · {fmtTime(job.scheduled_start)} – {fmtTime(job.scheduled_end)}
            </div>
            <div className="flex items-center gap-2 text-sm text-luxe-700">
              <MapPin size={13} className="text-luxe-400 shrink-0" />
              {job.address}, {job.city}
              <a
                href={mapsLink(job.address, job.city)}
                target="_blank" rel="noopener noreferrer"
                className="ml-auto text-blue-500 hover:text-blue-700 shrink-0"
              >
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-luxe-700">
              <DollarSign size={13} className="text-luxe-400 shrink-0" />
              ${job.price.toLocaleString()} job value
            </div>
          </div>

          {/* Notes */}
          {job.notes && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">{job.notes}</p>
            </div>
          )}

          {/* Cleaner assignment */}
          <div>
            <label className="label flex items-center gap-1.5">
              <User size={12} />Assign Vetted Cleaner
            </label>
            <select
              value={assignedId}
              onChange={(e) => { setAssignedId(e.target.value); setNotified(false) }}
              className="select"
            >
              <option value="">— Unassigned —</option>
              {cleaners.filter((c) => c.status === 'active').map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · ★{c.rating} · {c.skills.join(', ')}
                </option>
              ))}
            </select>
          </div>

          {/* Notify buttons */}
          {assignedCleaner && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 space-y-2">
              <p className="text-xs font-semibold text-blue-800">Notify {assignedCleaner.name}</p>
              {notifyError && (
                <p className="text-xs text-red-600">{notifyError}</p>
              )}
              {notified ? (
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                  <CheckCircle2 size={13} />SMS sent to {assignedCleaner.name}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleNotify('assignment')}
                    disabled={notifying}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {notifying ? <Loader2 size={11} className="animate-spin" /> : <Bell size={11} />}
                    Send Assignment SMS
                  </button>
                  <button
                    onClick={() => handleNotify('reminder_1h')}
                    disabled={notifying}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-100 text-blue-700 text-xs font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
                  >
                    {notifying ? <Loader2 size={11} className="animate-spin" /> : <Bell size={11} />}
                    1hr Reminder
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Checklist */}
          {checklist.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest">Job Checklist</p>
                <span className="text-xs font-bold text-luxe-500">{done}/{checklist.length}</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-luxe-100 overflow-hidden mb-3">
                <div
                  className={clsx('h-full rounded-full transition-all duration-500',
                    pct === 100 ? 'bg-emerald-500' : 'bg-bee-400'
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <ul className="space-y-1">
                {checklist.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => toggleItem(item.id)}
                      className={clsx(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-all',
                        item.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-luxe-50 text-luxe-700 hover:bg-luxe-100'
                      )}
                    >
                      {item.completed
                        ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                        : <Circle size={13} className="text-luxe-300 shrink-0" />
                      }
                      <span className={clsx(item.completed && 'line-through opacity-60')}>{item.text}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {pct === 100 && (
                <div className="mt-2 flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700">All done! Great work 🐝</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-luxe-100 shrink-0">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <><Loader2 size={13} className="animate-spin" />Saving…</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
