'use client'

import { useState } from 'react'
import { UserPlus, X, Loader2 } from 'lucide-react'

export function NewCandidateButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', source: '', experience_years: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setOpen(false)
    setForm({ full_name: '', phone: '', email: '', source: '', experience_years: '' })
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <UserPlus size={14} />
        Add Candidate
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxe-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-luxe-100">
              <p className="font-bold text-luxe-900">Add New Candidate</p>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-luxe-100 text-luxe-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input required className="input" placeholder="Jane Smith"
                  value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input required className="input" placeholder="555-0000"
                  value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="jane@email.com"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Years Experience</label>
                  <input className="input" type="number" min="0" placeholder="2"
                    value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
                </div>
                <div>
                  <label className="label">Source</label>
                  <select className="select"
                    value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
                    <option value="">Select…</option>
                    <option>Indeed</option>
                    <option>ZipRecruiter</option>
                    <option>Referral</option>
                    <option>Craigslist</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><UserPlus size={14} />Add & Queue Interview</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
