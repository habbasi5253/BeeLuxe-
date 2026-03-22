'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface Props {
  onClose: () => void
}

export function JobFormModal({ onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', job_type: 'residential', address: '', city: '', state: 'TX',
    scheduled_start: '', scheduled_end: '', cleaner: '', price: '', notes: '',
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxe-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-luxe-100">
          <p className="font-bold text-luxe-900">Schedule New Job</p>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-luxe-100 text-luxe-500">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="label">Job Title *</label>
            <input required className="input" placeholder="Apex Trailer Clean #5" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Job Type *</label>
              <select required className="select" value={form.job_type} onChange={(e) => set('job_type', e.target.value)}>
                <option value="construction_trailer">Construction Trailer</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="deep_clean">Deep Clean</option>
                <option value="recurring">Recurring</option>
              </select>
            </div>
            <div>
              <label className="label">Assign Cleaner</label>
              <select className="select" value={form.cleaner} onChange={(e) => set('cleaner', e.target.value)}>
                <option value="">— Unassigned —</option>
                <option>Maria Gonzalez</option>
                <option>James Wright</option>
                <option>Aisha Patel</option>
                <option>Kevin Okafor</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Address *</label>
            <input required className="input" placeholder="1200 Industrial Blvd" value={form.address} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="label">City</label>
              <input className="input" placeholder="Dallas" value={form.city} onChange={(e) => set('city', e.target.value)} />
            </div>
            <div>
              <label className="label">State</label>
              <input className="input" placeholder="TX" value={form.state} onChange={(e) => set('state', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start *</label>
              <input required className="input" type="datetime-local" value={form.scheduled_start} onChange={(e) => set('scheduled_start', e.target.value)} />
            </div>
            <div>
              <label className="label">End *</label>
              <input required className="input" type="datetime-local" value={form.scheduled_end} onChange={(e) => set('scheduled_end', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Job Price ($) *</label>
            <input required className="input" type="number" placeholder="380" value={form.price} onChange={(e) => set('price', e.target.value)} />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="Access codes, special instructions…" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
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
