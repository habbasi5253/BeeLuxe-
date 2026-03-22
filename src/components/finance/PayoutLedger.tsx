'use client'

import { clsx } from 'clsx'
import { CheckCircle2, Clock, DollarSign } from 'lucide-react'

const payouts = [
  { id: '1', cleaner: 'Maria Gonzalez', job: 'Apex Trailer #4', hours: 3.5, rate: 22, bonus: 20, amount: 97, status: 'paid', date: '2024-01-22' },
  { id: '2', cleaner: 'James Wright', job: 'Greenfield Home Deep Clean', hours: 4.0, rate: 20, bonus: 0, amount: 80, status: 'approved', date: null },
  { id: '3', cleaner: 'Aisha Patel', job: 'Metro Office Suite', hours: 5.5, rate: 22, bonus: 30, amount: 151, status: 'pending', date: null },
  { id: '4', cleaner: 'Maria Gonzalez', job: 'BuildRight Trailer #3', hours: 3.0, rate: 22, bonus: 0, amount: 66, status: 'paid', date: '2024-01-21' },
  { id: '5', cleaner: 'Kevin Okafor', job: 'Ridgeline Site Trailer', hours: 3.5, rate: 20, bonus: 10, amount: 80, status: 'paid', date: '2024-01-20' },
  { id: '6', cleaner: 'Rosa Medina', job: 'Greenfield Home (Weekly)', hours: 2.0, rate: 21, bonus: 0, amount: 42, status: 'pending', date: null },
]

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; classes: string }> = {
  paid:     { icon: CheckCircle2, label: 'Paid',     classes: 'bg-emerald-100 text-emerald-700' },
  approved: { icon: DollarSign,   label: 'Approved', classes: 'bg-blue-100 text-blue-700' },
  pending:  { icon: Clock,        label: 'Pending',  classes: 'bg-bee-100 text-bee-700' },
}

export function PayoutLedger() {
  const total = payouts.reduce((s, p) => s + p.amount, 0)
  const pending = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="card !p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
            <DollarSign size={18} className="text-orange-700" />
          </div>
          <div>
            <p className="text-xl font-bold text-luxe-900">${total.toLocaleString()}</p>
            <p className="text-xs text-luxe-500">Total Payouts (Jan)</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-bee-100 flex items-center justify-center">
            <Clock size={18} className="text-bee-700" />
          </div>
          <div>
            <p className="text-xl font-bold text-luxe-900">${pending}</p>
            <p className="text-xs text-luxe-500">Pending Approval</p>
          </div>
        </div>
        <div className="card !p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-emerald-700" />
          </div>
          <div>
            <p className="text-xl font-bold text-luxe-900">${total - pending}</p>
            <p className="text-xs text-luxe-500">Paid Out</p>
          </div>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="px-5 py-4 border-b border-luxe-100">
          <p className="font-semibold text-luxe-800">Contractor Payout Ledger</p>
          <p className="text-xs text-luxe-400 mt-0.5">Itemized payouts per cleaner per job</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-5 py-3">Cleaner</th>
              <th className="text-left px-4 py-3">Job</th>
              <th className="text-center px-4 py-3">Hours</th>
              <th className="text-center px-4 py-3">Rate</th>
              <th className="text-right px-4 py-3">Bonus</th>
              <th className="text-right px-4 py-3">Total</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => {
              const s = statusConfig[p.status]
              return (
                <tr key={p.id} className="table-row">
                  <td className="px-5 py-3.5 font-semibold text-luxe-900">{p.cleaner}</td>
                  <td className="px-4 py-3.5 text-xs text-luxe-500">{p.job}</td>
                  <td className="px-4 py-3.5 text-center text-luxe-700">{p.hours}h</td>
                  <td className="px-4 py-3.5 text-center text-luxe-700">${p.rate}/h</td>
                  <td className="px-4 py-3.5 text-right text-emerald-600 font-medium">
                    {p.bonus > 0 ? `+$${p.bonus}` : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-luxe-900">${p.amount}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={clsx('badge', s.classes)}>
                      <s.icon size={11} />{s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {p.status === 'pending' && (
                      <button className="text-xs text-bee-600 hover:text-bee-700 font-medium">Approve</button>
                    )}
                    {p.status === 'approved' && (
                      <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Mark Paid</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
