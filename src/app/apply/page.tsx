'use client'

import { useState } from 'react'
import {
  CheckCircle2, Loader2, ChevronRight, AlertCircle, Star,
  Truck, XCircle, MapPin, DollarSign, User
} from 'lucide-react'
import { clsx } from 'clsx'
import type { ApplicationPayload, ApplicationResult } from '@/app/api/apply/route'

type Step = 'form' | 'submitting' | 'result'

// ── Reusable field components ───────────────────────────────────────────────
function CheckItem({ checked, onChange, label, note }: {
  checked: boolean; onChange: () => void; label: string; note?: string
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{ touchAction: 'manipulation' }}
      className={clsx(
        'flex items-center gap-3 w-full px-4 py-3.5 min-h-[52px] rounded-xl border-2 text-left transition-all active:scale-[0.98]',
        checked ? 'border-bee-400 bg-bee-50' : 'border-luxe-200 bg-white active:border-luxe-300'
      )}>
      <div className={clsx(
        'w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-colors',
        checked ? 'bg-bee-500 border-bee-500' : 'border-luxe-300'
      )}>
        {checked && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
      </div>
      <span className={clsx('text-sm font-medium flex-1', checked ? 'text-bee-800' : 'text-luxe-700')}>{label}</span>
      {note && <span className="text-[10px] font-bold text-bee-600 bg-bee-100 px-1.5 py-0.5 rounded shrink-0">{note}</span>}
    </button>
  )
}

function YesNo({ value, onChange, yesLabel = 'Yes', noLabel = 'No' }: {
  value: boolean | null; onChange: (v: boolean) => void; yesLabel?: string; noLabel?: string
}) {
  return (
    <div className="flex gap-3">
      {([true, false] as const).map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          style={{ touchAction: 'manipulation' }}
          className={clsx(
            /* min-h-[52px] — glove-safe tap target */
            'flex-1 py-3.5 min-h-[52px] rounded-xl border-2 text-base font-semibold transition-all active:scale-[0.98]',
            value === v
              ? 'border-bee-400 bg-bee-50 text-bee-800'
              : 'border-luxe-200 bg-white text-luxe-500 active:border-luxe-300'
          )}
        >
          {v ? yesLabel : noLabel}
        </button>
      ))}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-luxe-100 p-5 space-y-4">
      <h2 className="font-bold text-luxe-800 text-sm uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  )
}

function Label({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <label className="label mb-2 flex items-center gap-1">
      {children}
      {optional && <span className="text-luxe-400 font-normal text-xs">(optional)</span>}
    </label>
  )
}

function ScoreMeter({ score }: { score: number }) {
  const color = score >= 78 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative w-32 h-32 mx-auto">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#f1f5f9" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={`${(score / 100) * 97.4} 97.4`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-luxe-900">{score}</span>
        <span className="text-xs text-luxe-400 font-medium">/ 100</span>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function ApplyPage() {
  const [step, setStep] = useState<Step>('form')
  const [result, setResult] = useState<ApplicationResult | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    currently_employed: '',
    experience_years: '',
    experience_types:        [] as string[],
    has_own_supplies:        null as boolean | null,
    willing_to_get_supplies: null as boolean | null,
    willing_to_get_insurance: null as boolean | null,
    solo_or_helper:          '' as '' | 'solo' | 'helper_sometimes' | 'always_helper',
    pet_allergies:           null as boolean | null,
    covers_service_area:     null as boolean | null,
    unsatisfied_customer_response: '',
    availability:            [] as string[],
    income_goal_weekly:      '',
    knows_booking_koala:     null as boolean | null,
    can_pass_background:     null as boolean | null,
    work_authorized:         null as boolean | null,
    has_transport:           null as boolean | null,
    motivation:              '',
    notes:                   '',
  })

  const set = (k: keyof typeof form, v: unknown) =>
    setForm((f) => ({ ...f, [k]: v }))

  const toggleList = (field: 'experience_types' | 'availability', value: string) =>
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!form.motivation.trim() || form.motivation.length < 20) {
      setError('Please tell us what draws you to BeeLuxe (at least a sentence or two).')
      return
    }
    if (form.experience_types.length === 0) {
      setError('Please select at least one type of cleaning experience.')
      return
    }
    if (form.availability.length === 0) {
      setError('Please select at least one availability option.')
      return
    }
    if (!form.unsatisfied_customer_response.trim() || form.unsatisfied_customer_response.length < 20) {
      setError('Please answer the customer satisfaction scenario (a few sentences is fine).')
      return
    }
    const required: Array<[boolean | null, string]> = [
      [form.has_transport,          'Please answer the transportation question.'],
      [form.work_authorized,        'Please confirm your work authorization.'],
      [form.can_pass_background,    'Please answer the background check question.'],
      [form.covers_service_area,    'Please confirm whether you can cover the Houston service area.'],
      [form.willing_to_get_insurance, 'Please answer the business insurance question.'],
      [form.pet_allergies,          'Please indicate whether you have pet allergies.'],
    ]
    for (const [val, msg] of required) {
      if (val === null) { setError(msg); return }
    }
    if (!form.solo_or_helper) { setError('Please tell us whether you work solo or with a helper.'); return }

    setError('')
    setStep('submitting')

    const payload: ApplicationPayload = {
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || undefined,
      currently_employed: form.currently_employed || undefined,
      experience_years: parseInt(form.experience_years) || 0,
      experience_types: form.experience_types,
      has_own_supplies: form.has_own_supplies,
      willing_to_get_supplies: form.willing_to_get_supplies,
      willing_to_get_insurance: form.willing_to_get_insurance,
      solo_or_helper: form.solo_or_helper as ApplicationPayload['solo_or_helper'],
      pet_allergies: form.pet_allergies!,
      covers_service_area: form.covers_service_area!,
      unsatisfied_customer_response: form.unsatisfied_customer_response,
      availability: form.availability,
      income_goal_weekly: form.income_goal_weekly || undefined,
      knows_booking_koala: form.knows_booking_koala,
      can_pass_background: form.can_pass_background!,
      work_authorized: form.work_authorized!,
      has_transport: form.has_transport!,
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

  // ── Result ──────────────────────────────────────────────────────────────
  if (step === 'result' && result) {
    const vetted = result.auto_vetted
    const hire   = result.recommendation === 'hire'
    const maybe  = result.recommendation === 'maybe'
    return (
      <div className="min-h-screen bg-gradient-to-br from-bee-50 to-luxe-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mx-auto mb-3 text-3xl">🐝</div>
            <p className="text-xl font-bold text-luxe-900">Application Received!</p>
            <p className="text-sm text-luxe-500">{form.full_name} · BeeLuxe Cleaners Houston</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <ScoreMeter score={result.score} />

            <div className={clsx('flex items-start gap-3 p-4 rounded-xl border',
              vetted || hire ? 'bg-emerald-50 border-emerald-200' :
              maybe          ? 'bg-amber-50 border-amber-200' :
              'bg-red-50 border-red-200')}>
              {vetted || hire ? <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                : maybe       ? <AlertCircle  size={20} className="text-amber-500 shrink-0 mt-0.5" />
                :               <XCircle      size={20} className="text-red-500 shrink-0 mt-0.5" />}
              <div>
                <p className={clsx('font-bold text-sm',
                  vetted || hire ? 'text-emerald-800' : maybe ? 'text-amber-800' : 'text-red-700')}>
                  {vetted ? '⭐ Great fit — you\'re in the fast lane!'
                    : hire   ? 'Strong applicant — our team will reach out soon.'
                    : maybe  ? 'Under review — we\'ll be in touch.'
                    : 'Not a match right now — thank you for your time.'}
                </p>
                <p className="text-xs text-luxe-500 mt-1 leading-relaxed">{result.summary}</p>
              </div>
            </div>

            {result.strengths.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-luxe-400 uppercase tracking-widest mb-2">What stood out</p>
                <ul className="space-y-1.5">
                  {result.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-luxe-700">
                      <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(hire || vetted) && (
              <p className="text-xs text-center text-luxe-400 bg-luxe-50 p-3 rounded-xl">
                Expect a call or text to {form.phone} within 1–2 business days.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Submitting ──────────────────────────────────────────────────────────
  if (step === 'submitting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bee-50 to-luxe-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center mx-auto mb-5 text-4xl">🐝</div>
          <Loader2 size={28} className="text-bee-500 animate-spin mx-auto mb-4" />
          <p className="font-bold text-luxe-800 text-lg">BeeBot is reviewing your application…</p>
          <p className="text-sm text-luxe-500 mt-1">Scoring experience, availability, and fit</p>
        </div>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-bee-50 to-luxe-50 pb-12">
      {/* Hero */}
      <div className="bg-white border-b border-luxe-100 px-4 py-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-3xl">🐝</span>
          <h1 className="text-2xl font-black text-luxe-900">BeeLuxe Cleaners</h1>
        </div>
        <p className="text-luxe-500 text-sm">Houston Area · Now Hiring Independent Cleaners</p>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {['$20–$28/hr', 'Flexible Schedule', 'Weekly Pay', 'Be Your Own Boss'].map((tag) => (
            <span key={tag} className="text-[11px] bg-bee-100 text-bee-700 px-2.5 py-1 rounded-full font-semibold">{tag}</span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 mt-6 space-y-5">

        {/* ── Contact ─────────────────────────────────────────────────── */}
        <Section title="Contact Info">
          <div>
            <Label>Full Name *</Label>
            <input required className="input" placeholder="Maria Gonzalez"
              value={form.full_name} onChange={(e) => set('full_name', e.target.value)} />
          </div>
          <div>
            <Label>Phone Number *</Label>
            <input required className="input" type="tel" placeholder="(713) 555-0100"
              value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div>
            <Label optional>Email</Label>
            <input className="input" type="email" placeholder="maria@example.com"
              value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div>
            <Label optional>Where are you currently working?</Label>
            <input className="input" placeholder="e.g. Self-employed, ABC Cleaning Co., Between jobs…"
              value={form.currently_employed} onChange={(e) => set('currently_employed', e.target.value)} />
          </div>
        </Section>

        {/* ── What draws you ──────────────────────────────────────────── */}
        <Section title="Why BeeLuxe?">
          <div>
            <Label>What draws you to work with BeeLuxe Cleaners? *</Label>
            <textarea required className="input resize-none" rows={4} minLength={20}
              placeholder="Tell us what excites you about joining BeeLuxe and what kind of cleaner you are…"
              value={form.motivation} onChange={(e) => set('motivation', e.target.value)} />
          </div>
        </Section>

        {/* ── Experience ──────────────────────────────────────────────── */}
        <Section title="Cleaning Experience">
          <div>
            <Label>Years of Cleaning Experience *</Label>
            <select required className="select" value={form.experience_years}
              onChange={(e) => set('experience_years', e.target.value)}>
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
            <Label>Types of Cleans You're Comfortable With * <span className="text-luxe-400 font-normal">(all that apply)</span></Label>
            <div className="space-y-2">
              {[
                { value: 'basic',               label: 'Basic / Routine Cleans', note: '' },
                { value: 'deep',                label: 'Deep Cleans',            note: '' },
                { value: 'airbnb',              label: 'Airbnb / Short-Term Rental Turnovers', note: 'In demand' },
                { value: 'construction_trailer',label: 'Construction Site Trailers',           note: 'Top priority' },
                { value: 'move_in_out',         label: 'Move-In / Move-Out Cleans',            note: '' },
                { value: 'commercial',          label: 'Commercial / Office Cleaning',         note: '' },
              ].map((t) => (
                <CheckItem key={t.value}
                  checked={form.experience_types.includes(t.value)}
                  onChange={() => toggleList('experience_types', t.value)}
                  label={t.label} note={t.note} />
              ))}
            </div>
          </div>
        </Section>

        {/* ── Supplies & Insurance ────────────────────────────────────── */}
        <Section title="Supplies & Insurance">
          <div>
            <Label>Do you have your own cleaning supplies and equipment? *</Label>
            <YesNo value={form.has_own_supplies} onChange={(v) => set('has_own_supplies', v)} />
          </div>

          {form.has_own_supplies === false && (
            <div>
              <Label>Are you able to get your own supplies?</Label>
              <YesNo value={form.willing_to_get_supplies} onChange={(v) => set('willing_to_get_supplies', v)} />
            </div>
          )}

          <div>
            <Label>We require cleaners to carry their own business insurance (typically ~$20/mo in Texas). Are you willing to get this? *</Label>
            <YesNo value={form.willing_to_get_insurance} onChange={(v) => set('willing_to_get_insurance', v)}
              yesLabel="Yes, I'm willing" noLabel="No" />
          </div>
        </Section>

        {/* ── Work Style ──────────────────────────────────────────────── */}
        <Section title="Work Style">
          <div>
            <Label>Would it just be you on jobs, or might you bring a helper? *</Label>
            <div className="space-y-2">
              {[
                { value: 'solo',             label: 'Just me — always solo' },
                { value: 'helper_sometimes', label: 'Mainly solo, but I might bring a helper sometimes' },
                { value: 'always_helper',    label: 'I always work with a helper' },
              ].map((o) => (
                <CheckItem key={o.value}
                  checked={form.solo_or_helper === o.value}
                  onChange={() => set('solo_or_helper', o.value)}
                  label={o.label} />
              ))}
            </div>
          </div>
          <div>
            <Label>Do you have any pet allergies? *</Label>
            <YesNo value={form.pet_allergies} onChange={(v) => set('pet_allergies', v)} yesLabel="Yes, I do" noLabel="No allergies" />
          </div>
        </Section>

        {/* ── Scenario Question ───────────────────────────────────────── */}
        <Section title="One Scenario for You">
          <div>
            <Label>
              A customer is unhappy with a spot you cleaned. You've already gone over it twice and know you can't do it any better — how do you handle it? *
            </Label>
            <p className="text-xs text-luxe-400 mb-2">Take your time — there's no trick. We just want to understand your communication style.</p>
            <textarea required className="input resize-none" rows={4} minLength={20}
              placeholder="Walk us through what you'd say or do…"
              value={form.unsatisfied_customer_response}
              onChange={(e) => set('unsatisfied_customer_response', e.target.value)} />
          </div>
        </Section>

        {/* ── Availability & Goals ────────────────────────────────────── */}
        <Section title="Availability & Goals">
          <div>
            <Label>When are you available? * <span className="text-luxe-400 font-normal">(all that apply)</span></Label>
            <div className="space-y-2">
              {[
                { value: 'early_morning', label: 'Early Morning (6–7 AM starts)', note: 'Preferred' },
                { value: 'weekdays',      label: 'Monday – Friday',               note: '' },
                { value: 'weekends',      label: 'Weekends',                      note: '' },
                { value: 'evenings',      label: 'Evenings',                      note: '' },
                { value: 'flexible',      label: 'Fully Flexible',                note: '' },
              ].map((a) => (
                <CheckItem key={a.value}
                  checked={form.availability.includes(a.value)}
                  onChange={() => toggleList('availability', a.value)}
                  label={a.label} note={a.note} />
              ))}
            </div>
          </div>
          <div>
            <Label optional>
              <DollarSign size={13} className="text-luxe-400" />
              Weekly income goal
            </Label>
            <input className="input" placeholder="e.g. $600 / week"
              value={form.income_goal_weekly} onChange={(e) => set('income_goal_weekly', e.target.value)} />
          </div>
        </Section>

        {/* ── Service Area & Logistics ────────────────────────────────── */}
        <Section title="Service Area & Logistics">
          <div>
            <Label>
              <MapPin size={13} className="text-luxe-400 shrink-0" />
              We serve the greater Houston area — Katy, Sugar Land, The Woodlands, Pasadena, and surrounding areas. Can you commute throughout this area? *
            </Label>
            <YesNo value={form.covers_service_area} onChange={(v) => set('covers_service_area', v)} yesLabel="Yes, I can" noLabel="No" />
          </div>
          <div>
            <Label>
              <Truck size={13} className="text-luxe-400 shrink-0" />
              Do you have reliable transportation? *
            </Label>
            <YesNo value={form.has_transport} onChange={(v) => set('has_transport', v)} />
          </div>
        </Section>

        {/* ── Final Checks ────────────────────────────────────────────── */}
        <Section title="A Few Quick Questions">
          <div>
            <Label>Have you heard of Booking Koala, or are you comfortable learning scheduling software?</Label>
            <YesNo value={form.knows_booking_koala} onChange={(v) => set('knows_booking_koala', v)}
              yesLabel="Yes / No problem" noLabel="Not familiar" />
          </div>
          <div>
            <Label>Can you pass a background check? *</Label>
            <YesNo value={form.can_pass_background} onChange={(v) => set('can_pass_background', v)} />
          </div>
          <div>
            <Label>
              <User size={13} className="text-luxe-400 shrink-0" />
              Are you authorized to work in the United States? *
            </Label>
            <YesNo value={form.work_authorized} onChange={(v) => set('work_authorized', v)} />
          </div>
          <div>
            <Label optional>Anything else you'd like us to know?</Label>
            <textarea className="input resize-none" rows={2}
              placeholder="Certifications, references, special skills…"
              value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
        </Section>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0" />{error}
          </div>
        )}

        <button type="submit" className="w-full btn-primary !py-4 !text-base !rounded-2xl justify-center">
          Submit Application <ChevronRight size={18} />
        </button>

        <p className="text-center text-xs text-luxe-400 pb-4">
          BeeBot AI reviews applications instantly · We respect your privacy
        </p>
      </form>
    </div>
  )
}
