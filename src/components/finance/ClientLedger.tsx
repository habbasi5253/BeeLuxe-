'use client'

import { clsx } from 'clsx'
import { TrendingUp, HardHat, Home, Building2 } from 'lucide-react'

const clients = [
  {
    id: '1', name: 'Apex Construction LLC', type: 'construction',
    jobs: 14, revenue: 18500, payouts: 6475, margin: 65, outstanding: 0,
  },
  {
    id: '2', name: 'Metro Commercial Props', type: 'commercial',
    jobs: 9, revenue: 9800, payouts: 3920, margin: 60, outstanding: 980,
  },
  {
    id: '3', name: 'Ridgeline Homes Dev', type: 'construction',
    jobs: 6, revenue: 7200, payouts: 2520, margin: 65, outstanding: 0,
  },
  {
    id: '4', name: 'Greenfield Homes', type: 'residential',
    jobs: 22, revenue: 4200, payouts: 1764, margin: 58, outstanding: 420,
  },
  {
    id: '5', name: 'Skyline Properties', type: 'commercial',
    jobs: 5, revenue: 3800, payouts: 1520, margin: 60, outstanding: 1900,
  },
  {
    id: '6', name: 'Various Residential', type: 'residential',
    jobs: 38, revenue: 6840, payouts: 2872, margin: 58, outstanding: 520,
  },
]

const typeIcon = { construction: HardHat, residential: Home, commercial: Building2 }
const typeColor = {
  construction: 'text-orange-600 bg-orange-100',
  residential: 'text-blue-600 bg-blue-100',
  commercial: 'text-violet-600 bg-violet-100',
}

export function ClientLedger() {
  const totals = clients.reduce((acc, c) => ({
    jobs: acc.jobs + c.jobs,
    revenue: acc.revenue + c.revenue,
    payouts: acc.payouts + c.payouts,
    outstanding: acc.outstanding + c.outstanding,
  }), { jobs: 0, revenue: 0, payouts: 0, outstanding: 0 })

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-luxe-100">
        <p className="font-semibold text-luxe-800">Revenue per Client — Ledger</p>
        <p className="text-xs text-luxe-400 mt-0.5">Real-time revenue vs contractor payout breakdown by client</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="text-left px-5 py-3">Client</th>
              <th className="text-center px-4 py-3">Jobs</th>
              <th className="text-right px-4 py-3">Revenue</th>
              <th className="text-right px-4 py-3">Payouts</th>
              <th className="text-right px-4 py-3">Gross $</th>
              <th className="text-center px-4 py-3">Margin</th>
              <th className="text-right px-4 py-3">Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const gross = c.revenue - c.payouts
              const Icon = typeIcon[c.type as keyof typeof typeIcon]
              return (
                <tr key={c.id} className="table-row">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={clsx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', typeColor[c.type as keyof typeof typeColor])}>
                        <Icon size={13} />
                      </div>
                      <span className="font-semibold text-luxe-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-center text-luxe-600">{c.jobs}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-luxe-900">
                    ${c.revenue.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right text-orange-600 font-medium">
                    ${c.payouts.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-emerald-700">
                    ${gross.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-luxe-100 overflow-hidden">
                        <div
                          className={clsx('h-full rounded-full', c.margin >= 60 ? 'bg-emerald-400' : 'bg-bee-400')}
                          style={{ width: `${c.margin}%` }}
                        />
                      </div>
                      <span className={clsx('text-xs font-bold', c.margin >= 60 ? 'text-emerald-600' : 'text-bee-600')}>
                        {c.margin}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {c.outstanding > 0
                      ? <span className="text-red-500 font-semibold">${c.outstanding.toLocaleString()}</span>
                      : <span className="text-emerald-500 text-xs">Paid</span>
                    }
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-luxe-50 border-t-2 border-luxe-200">
              <td className="px-5 py-3 font-bold text-luxe-800">TOTAL</td>
              <td className="px-4 py-3 text-center font-bold text-luxe-700">{totals.jobs}</td>
              <td className="px-4 py-3 text-right font-bold text-luxe-900">${totals.revenue.toLocaleString()}</td>
              <td className="px-4 py-3 text-right font-bold text-orange-600">${totals.payouts.toLocaleString()}</td>
              <td className="px-4 py-3 text-right font-bold text-emerald-700">${(totals.revenue - totals.payouts).toLocaleString()}</td>
              <td className="px-4 py-3 text-center">
                <span className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-600">
                  <TrendingUp size={12} />61%
                </span>
              </td>
              <td className="px-4 py-3 text-right font-bold text-red-500">${totals.outstanding.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
