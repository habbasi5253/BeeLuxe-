'use client'

import { useState } from 'react'
import {
  CheckCircle2, Loader2, ChevronRight, HardHat, Home, Building2,
  AlertCircle, Star, Clock, Truck, ShieldCheck, XCircle
} from 'lucide-react'
import { clsx } from 'clsx'
import type { ApplicationPayload, ApplicationResult } from '@/app/api/apply/route'

// ── Step types ─────────────────────────────────────────────────────────────
type Step = 'form' | 'submitting' | 'result'

const EXPERIENCE_TYPES = [
  { value: 'construction_trailer', label: 'Construction Trailer', icon: HardHat, note: 'Most in demand' },
  { value: 'commercial',           label: 'Commercial / Office',  icon: Building2, note: '' },
  { value: 'residential',          label: 'Residential Homes',    icon: Home,     note: '' },
  { value: 'deep_clean',           label: 'Deep / Move-Out Clean', icon: Star,     note: '' },
  { value: 'industrial',           label: 'Industrial',            icon: Building2,note: '' },
]

const AVAILABILITY = [
  { value: 'early_morning', label: 'Early Morning (6–7 AM)',  note: 'Preferred' },
  { value: 'weekdays',      label: 'Monday–Friday',           note: '' },
  { value: 'weekends',      label: 'Weekends',                note: '' },
  { value: 'evening',       label: 'Evenings',                note: '' },
  { value: 'flexible',      label: 'Fully Flexible',          note: '' },
]

function Checkbox({ checked, onChange, label, note }: {
  checked: boolean; onChange: () => void; label: string; note?: string
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={clsx(
        'flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 text-left transition-all',
        checked
          ? 'border-bee-400 bg-bee-50'
          : 'border-luxe-200 bg-white hover:border-luxe-300'
      )}
    >
      <div className={clsx(
        'w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors',
        checked ? 'bg-bee-500 border-bee-500' : 'border-luxe-300'
      )}>
        {checked && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
      </div>
      <span className={clsx('text-sm font-medium', checked ? 'text-bee-800' : 'text-luxe-700')}>{label}</span>
      {note && <span className="ml-auto text-[10px] font-bold text-bee-600 bg-bee-100 px-1.5 py-0.5 rounded">{note}</span>}
    </button>
  )
}

function YesNo({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-3">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={clsx(
            'flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all',
            value === v
              ? 'border-bee-400 bg-bee-50 text-bee-800'
              : 'border-luxe-200 bg-white text-luxe-500 hover:border-luxe-300'
          )}
        >
          {v ? 'Yes' : 'No'}
        </button>
      ))}
    </div>
  )
}

function ScoreMeter({ score }: { score: number }) {
  const pct = score
  const color = score >= 78 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f1f5f9" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15.5" fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-luxe-900">{score}</span>
        <span className="text-xs text-luxe-400 font-medium">/ 100</span>
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────
export default function ApplyPage() {
  const [step, setStep] = useState<Step>('form')
  const [result, setResult] = useState<ApplicationResult | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    experience_years: '',
    experience_types: [] as string[],
    availability: [] as string[],
    has_transport: null as boolean | null,
    has_osha: null as boolean | null,
    motivation: '',
    notes: '',
  })

  const toggle = (field: 'experience_types' | 'availability', value: string) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.has_transport === null || form.has_osha === null) {
      setError('Please answer all Yes/No questions.')
      return
    }
    if (form.experience_types.length === 0) {
      setError('Please select at least one type of experience.')
      return
    }
    if (form.availability.length === 0) {
      setError('Please select at least one availability option.')
      return
    }
    setError('')
    setStep('submitting')

    const payload: ApplicationPayload = {
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || undefined,
      experience_years: parseInt(form.experience_years) || 0,
      experience_types: form.experience_types,
      availability: form.availability,
      has_transport: form.has_transport!,
      has_osha: form.has_osha!,
      motivation: form.motivation,
      notes: form.notes || undefined,
    }

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')
      setResult(data)
      setStep('result')
    } catch (err) {
      console.error(err)
      setStep('form')
      setError('Something went wrong. Please try again.')
    }
  }

  // ── Result screen ─────────────────────────────────────────────────────────
  if (step === 'result' && result) {
    const vetted = result.auto_vetted
    const hire   = result.recommendation === 'hire'
    const maybe  = result.recommendation === 'maybe'

    return (
      <div className="min-h-screen bg-gradient-to-br from-bee-50 to-luxe-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mx-auto mb-3 text-3xl">🐝</div>
            <p className="text-xl font-bold text-luxe-900">Application Received!</p>
            <p className="text-sm text-luxe-500 mt-1">{form.full_name} · BeeLuxe Cleaners</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            {/* Score */}
            <ScoreMeter score={result.score} />

            {/* Verdict */}
            <div className={clsx(
              'flex items-center gap-3 p-4 rounded-xl border',
              vetted ? 'bg-emerald-50 border-emerald-200' :
              hire   ? 'bg-emerald-50 border-emerald-200' :
              maybe  ? 'bg-amber-50 border-amber-200' :
              'bg-red-50 border-red-200'
            )}>
              {vetted || hire
                ? <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                : maybe
                ? <AlertCircle size={22} className="text-amber-500 shrink-0" />
                : <XCircle size={22} className="text-red-500 shrink-0" />
              }
              <div>
                <p className={clsx(
                  'font-bold text-sm',
                  vetted || hire ? 'text-emerald-800' : maybe ? 'text-amber-800' : 'text-red-700'
                )}>
                  {vetted ? '⭐ Auto-Vetted — You\'re in the fast lane!' :
                   hire   ? 'Strong Applicant — Team will follow up soon.' :
                   maybe  ? 'Under Review — We\'ll be in touch.' :
                   'Not a fit right now — Thank you for applying.'}
                </p>
                <p className="text-xs text-luxe-500 mt-0.5">{result.summary}</p>
              </div>
            </div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest mb-2">Strengths</p>
                <ul className="space-y-1">
                  {result.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-luxe-700">
                      <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Concerns */}
            {result.concerns.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest mb-2">Areas to Note</p>
                <ul className="space-y-1">
                  {result.concerns.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-luxe-700">
                      <AlertCircle size={13} className="text-amber-400 mt-0.5 shrink-0" />{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(hire || vetted) && (
              <p className="text-xs text-center text-luxe-400 bg-luxe-50 p-3 rounded-xl">
                Expect a call or text from our team at {form.phone} within 1–2 business days.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Submitting screen ─────────────────────────────────────────────────────
  if (step === 'submitting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bee-50 to-luxe-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-5 text-4xl">🐝</div>
          <Loader2 size={28} className="text-bee-500 animate-spin mx-auto mb-4" />
          <p className="font-bold text-luxe-800 text-lg">BeeBot is reviewing your application…</p>
          <p className="text-sm text-luxe-500 mt-1">Analyzing experience, availability, and fit</p>
        </div>
      </div>
    )
  }

  // ── Application Form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-bee-50 to-luxe-50 pb-12">
      {/* Hero */}
      <div className="bg-white border-b border-luxe-100 px-4 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl">🐝</span>
          <h1 className="text-2xl font-black text-luxe-900">BeeLuxe Cleaners</h1>
        </div>
        <p className="text-luxe-500 text-sm">Houston Area · Hiring Now</p>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {['$20–$28/hr', 'Flexible Schedule', 'Weekly Pay', 'Growth Opportunities'].map((tag) => (
            <span key={tag} className="text-[11px] bg-bee-100 text-bee-700 px-2.5 py-1 rounded-full font-semibold">{tag}</span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 mt-6 space-y-5">
        {/* Section: Contact */}
        <div className="bg-white rounded-2xl shadow-sm border border-luxe-100 p-5 space-y-4">
          <h2 className="font-bold text-luxe-800 text-sm uppercase tracking-wider">Contact Info</h2>
          <div>
            <label className="label">Full Name *</label>
            <input
              required className="input"
              placeholder="Maria Gonzalez"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Phone Number *</label>
            <input
              required className="input" type="tel"
              placeholder="(713) 555-0100"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email <span className="text-luxe-400 font-normal">(optional)</span></label>
            <input
              className="input" type="email"
              placeholder="maria@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        {/* Section: Experience */}
        <div className="bg-white rounded-2xl shadow-sm border border-luxe-100 p-5 space-y-4">
          <h2 className="font-bold text-luxe-800 text-sm uppercase tracking-wider">Experience</h2>
          <div>
            <label className="label">Years of Cleaning Experience *</label>
            <select
              required className="select"
              value={form.experience_years}
              onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
            >
              <option value="">Select…</option>
              <option value="0">Less than 1 year</option>
              <option value="1">1 year</option>
              <option value="2">2 years</option>
              <option value="3">3 years</option>
              <option value="5">4–5 years</option>
              <option value="7">6–10 years</option>
              <option value="10">10+ years</option>
            </select>
          </div>
          <div>
            <label className="label mb-2">Types of Experience <span className="text-luxe-400 font-normal">(select all that apply)</span></label>
            <div className="space-y-2">
              {EXPERIENCE_TYPES.map((t) => (
                <Checkbox
                  key={t.value}
                  checked={form.experience_types.includes(t.value)}
                  onChange={() => toggle('experience_types', t.value)}
                  label={t.label}
                  note={t.note}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Section: Availability */}
        <div className="bg-white rounded-2xl shadow-sm border border-luxe-100 p-5 space-y-4">
          <h2 className="font-bold text-luxe-800 text-sm uppercase tracking-wider">Availability</h2>
          <div>
            <label className="label mb-2">When are you available? <span className="text-luxe-400 font-normal">(select all that apply)</span></label>
            <div className="space-y-2">
              {AVAILABILITY.map((a) => (
                <Checkbox
                  key={a.value}
                  checked={form.availability.includes(a.value)}
                  onChange={() => toggle('availability', a.value)}
                  label={a.label}
                  note={a.note}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Section: Logistics */}
        <div className="bg-white rounded-2xl shadow-sm border border-luxe-100 p-5 space-y-4">
          <h2 className="font-bold text-luxe-800 text-sm uppercase tracking-wider">Logistics</h2>
          <div>
            <label className="label mb-2">
              <span className="flex items-center gap-1.5"><Truck size={14} className="text-luxe-400" />Do you have reliable transportation? *</span>
            </label>
            <YesNo value={form.has_transport} onChange={(v) => setForm({ ...form, has_transport: v })} />
          </div>
          <div>
            <label className="label mb-2">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-luxe-400" />Are you OSHA certified or safety trained?</span>
            </label>
            <YesNo value={form.has_osha} onChange={(v) => setForm({ ...form, has_osha: v })} />
          </div>
        </div>

        {/* Section: About You */}
        <div className="bg-white rounded-2xl shadow-sm border border-luxe-100 p-5 space-y-4">
          <h2 className="font-bold text-luxe-800 text-sm uppercase tracking-wider">About You</h2>
          <div>
            <label className="label">Why do you want to work with BeeLuxe? *</label>
            <textarea
              required
              className="input resize-none"
              rows={4}
              placeholder="Tell us about yourself, your work ethic, and why you'd be a great fit for our team…"
              value={form.motivation}
              onChange={(e) => setForm({ ...form, motivation: e.target.value })}
              minLength={30}
            />
          </div>
          <div>
            <label className="label">Anything else we should know? <span className="text-luxe-400 font-normal">(optional)</span></label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Special skills, certifications, references, etc."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0" />{error}
          </div>
        )}

        <button type="submit" className="w-full btn-primary !py-4 !text-base !rounded-2xl justify-center">
          Submit Application
          <ChevronRight size={18} />
        </button>

        <p className="text-center text-xs text-luxe-400 pb-4">
          BeeBot AI reviews applications instantly · We respect your privacy
        </p>
      </form>
    </div>
  )
}
