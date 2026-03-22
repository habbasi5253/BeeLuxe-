'use client'

import { DollarSign, TrendingUp, TrendingDown, Wallet, AlertTriangle, BarChart2 } from 'lucide-react'
import { clsx } from 'clsx'

const kpis = [
  {
    label: 'Monthly Revenue', value: '$28,450', change: '+12.5%', positive: true,
    icon: DollarSign, color: 'bg-bee-100 text-bee-700', detail: 'from 34 completed jobs',
  },
  {
    label: 'Contractor Payouts', value: '$11,082', change: '+9.1%', positive: false,
    icon: Wallet, color: 'bg-orange-100 text-orange-700', detail: '39% of revenue',
  },
  {
    label: 'Gross Margin', value: '$17,368', change: '+3.2%', positive: true,
    icon: TrendingUp, color: 'bg-emerald-100 text-emerald-700', detail: '61% margin rate',
  },
  {
    label: 'Expenses', value: '$2,140', change: '-4.3%', positive: true,
    icon: TrendingDown, color: 'bg-blue-100 text-blue-700', detail: 'supplies, fuel, marketing',
  },
  {
    label: 'Outstanding', value: '$3,820', change: '+2', positive: false,
    icon: AlertTriangle, color: 'bg-red-100 text-red-600', detail: '3 overdue invoices',
  },
  {
    label: 'Net Profit', value: '$15,228', change: '+14.1%', positive: true,
    icon: BarChart2, color: 'bg-violet-100 text-violet-700', detail: '53.5% net margin',
  },
]

export function FinanceKPIs() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((k) => (
        <div key={k.label} className="card !p-4 flex flex-col gap-3">
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', k.color)}>
            <k.icon size={18} />
          </div>
          <div>
            <p className="text-xl font-bold text-luxe-900">{k.value}</p>
            <p className="text-xs text-luxe-500 mt-0.5">{k.label}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className={clsx('text-xs font-semibold', k.positive ? 'text-emerald-600' : 'text-red-500')}>
              {k.change}
            </span>
            <span className="text-[10px] text-luxe-400">{k.detail}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
