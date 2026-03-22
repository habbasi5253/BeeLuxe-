'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'

export function NewLeadButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    company_name: '', contact_name: '', phone: '', email: '',
    lead_type: 'construction_trailer', city: '', state: 'TX',
    project_value: '', trailer_count: '', aec_project_id: '', notes: '',
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        <Plus size={14} />Add Lead
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxe-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-luxe-100">
              <p className="font-bold text-luxe-900">New Lead</p>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-luxe-100 text-luxe-500">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="label">Lead Type *</label>
                <select required className="select" value={form.lead_type} onChange={(e) => set('lead_type', e.target.value)}>
                  <option value="construction_trailer">Construction Trailer</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Company Name</label>
                  <input className="input" placeholder="Apex Construction" value={form.company_name} onChange={(e) => set('company_name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Contact Name *</label>
                  <input required className="input" placeholder="Mike Torres" value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Phone</label>
                  <input className="input" placeholder="555-0100" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" placeholder="contact@co.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="label">Site Address / City</label>
                  <input className="input" placeholder="1200 Industrial Blvd, Dallas" value={form.city} onChange={(e) => set('city', e.target.value)} />
                </div>
                <div>
                  <label className="label">State</label>
                  <input className="input" placeholder="TX" value={form.state} onChange={(e) => set('state', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Project Value ($)</label>
                  <input className="input" type="number" placeholder="8000" value={form.project_value} onChange={(e) => set('project_value', e.target.value)} />
                </div>
                {form.lead_type === 'construction_trailer' && (
                  <div>
                    <label className="label">Trailer Count</label>
                    <input className="input" type="number" placeholder="4" value={form.trailer_count} onChange={(e) => set('trailer_count', e.target.value)} />
                  </div>
                )}
              </div>
              {form.lead_type === 'construction_trailer' && (
                <div>
                  <label className="label">AEC Project ID</label>
                  <input className="input font-mono" placeholder="AEC-2024-0001" value={form.aec_project_id} onChange={(e) => set('aec_project_id', e.target.value)} />
                </div>
              )}
              <div>
                <label className="label">Notes</label>
                <textarea className="input resize-none" rows={3} placeholder="Site details, key contacts…" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <><Loader2 size={14} className="animate-spin" />Saving…</> : <><Plus size={14} />Add Lead</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
