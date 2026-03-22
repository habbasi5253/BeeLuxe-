'use client'

import { useState } from 'react'
import { X, Loader2, Bell } from 'lucide-react'
import { buildChecklist } from '@/lib/scheduling'
import type { Job, Cleaner, JobType } from '@/lib/scheduling'

interface Props {
  initialSlot?: { start: string; end: string }
  cleaners: Cleaner[]
  onClose: () => void
  onSave: (job: Job) => void
}

const JOB_TYPES: Array<{ value: JobType; label: string }> = [
  { value: 'construction_trailer', label: 'Construction Trailer' },
  { value: 'residential',          label: 'Residential' },
  { value: 'commercial',           label: 'Commercial' },
  { value: 'deep_clean',           label: 'Deep Clean' },
  { value: 'airbnb',               label: 'Airbnb Turnover' },
  { value: 'move_in_out',          label: 'Move-In/Move-Out' },
  { value: 'recurring',            label: 'Recurring Clean' },
]

function toLocalInput(isoOrEmpty: string) {
  if (!isoOrEmpty) return ''
  const d = new Date(isoOrEmpty)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function JobFormModal({ initialSlot, cleaners, onClose, onSave }: Props) {
  const [loading,   setLoading]   = useState(false)
  const [notifyOnSave, setNotifyOnSave] = useState(true)
  const [form, setForm] = useState({
    title:           '',
    job_type:        'residential' as JobType,
    address:         '',
    city:            'Houston',
    state:           'TX',
    scheduled_start: toLocalInput(initialSlot?.start ?? ''),
    scheduled_end:   toLocalInput(initialSlot?.end ?? ''),
    cleaner_id:      '',
    price:           '',
    notes:           '',
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const cleaner = cleaners.find((c) => c.id === form.cleaner_id) ?? null
    const newJob: Job = {
      id:              String(Date.now()),
      title:           form.title,
      job_type:        form.job_type,
      address:         form.address,
      city:            form.city,
      state:           form.state,
      scheduled_start: new Date(form.scheduled_start).toISOString(),
      scheduled_end:   new Date(form.scheduled_end).toISOString(),
      status:          'scheduled',
      cleaner_id:      cleaner?.id ?? null,
      cleaner_name:    cleaner?.name ?? null,
      cleaner_phone:   cleaner?.phone ?? null,
      price:           parseFloat(form.price) || 0,
      notes:           form.notes || null,
      checklist:       buildChecklist(form.job_type),
    }

    // Optionally notify cleaner on save
    if (notifyOnSave && cleaner) {
      await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'assignment',
          phone: cleaner.phone,
          cleaner_name: cleaner.name,
          job_title: newJob.title,
          address: newJob.address,
          city: newJob.city,
          start_time: newJob.scheduled_start,
        }),
      }).catch(() => {/* non-blocking */})
    }

    setLoading(false)
    onSave(newJob)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxe-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-luxe-100 shrink-0">
          <p className="font-bold text-luxe-900">Schedule New Job</p>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-luxe-100 text-luxe-500">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="label">Job Title *</label>
            <input
              required className="input"
              placeholder="Apex Trailer Clean #5"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Job Type *</label>
              <select
                required className="select"
                value={form.job_type}
                onChange={(e) => set('job_type', e.target.value)}
              >
                {JOB_TYPES.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Assign Vetted Cleaner</label>
              <select
                className="select"
                value={form.cleaner_id}
                onChange={(e) => set('cleaner_id', e.target.value)}
              >
                <option value="">— Unassigned —</option>
                {cleaners.filter((c) => c.status === 'active').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ★{c.rating}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Street Address *</label>
            <input
              required className="input"
              placeholder="1200 Industrial Blvd"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label">City</label>
              <input
                className="input"
                placeholder="Houston"
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
              />
            </div>
            <div>
              <label className="label">State</label>
              <input
                className="input"
                placeholder="TX"
                value={form.state}
                onChange={(e) => set('state', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start *</label>
              <input
                required className="input" type="datetime-local"
                value={form.scheduled_start}
                onChange={(e) => set('scheduled_start', e.target.value)}
              />
            </div>
            <div>
              <label className="label">End *</label>
              <input
                required className="input" type="datetime-local"
                value={form.scheduled_end}
                onChange={(e) => set('scheduled_end', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">Job Price ($) *</label>
            <input
              required className="input" type="number" placeholder="380"
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input resize-none" rows={2}
              placeholder="Access codes, special instructions…"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          {/* Notify toggle */}
          {form.cleaner_id && (
            <label className="flex items-center gap-3 p-3 bg-bee-50 border border-bee-200 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={notifyOnSave}
                onChange={(e) => setNotifyOnSave(e.target.checked)}
                className="w-4 h-4 accent-bee-500"
              />
              <div className="flex items-center gap-2">
                <Bell size={13} className="text-bee-500" />
                <span className="text-sm text-luxe-700 font-medium">
                  Send assignment SMS to {cleaners.find((c) => c.id === form.cleaner_id)?.name}
                </span>
              </div>
            </label>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? <><Loader2 size={14} className="animate-spin" />Saving…</> : 'Schedule Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
