'use client'

import { useState } from 'react'
import { FinanceKPIs } from './FinanceKPIs'
import { RevenueChart } from './RevenueChart'
import { MarginChart } from './MarginChart'
import { ClientLedger } from './ClientLedger'
import { PayoutLedger } from './PayoutLedger'
import { InvoiceTable } from './InvoiceTable'
import { GrowthAnalytics } from './GrowthAnalytics'
import { clsx } from 'clsx'

type Tab = 'overview' | 'invoices' | 'payouts' | 'growth'

export function FinanceDashboard() {
  const [tab, setTab] = useState<Tab>('overview')

  const tabs: { key: Tab; label: string; badge?: string }[] = [
    { key: 'overview', label: 'Overview & Margins' },
    { key: 'invoices', label: 'Invoices & Revenue' },
    { key: 'payouts',  label: 'Contractor Payouts' },
    { key: 'growth',   label: 'Growth Analytics',  badge: 'NEW' },
  ]

  return (
    <div className="space-y-6">
      <FinanceKPIs />

      <div className="flex gap-1 bg-white border border-luxe-100 rounded-xl p-1 w-fit flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'relative px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
              tab === t.key ? 'bg-bee-500 text-white' : 'text-luxe-600 hover:bg-luxe-50'
            )}
          >
            {t.label}
            {t.badge && (
              <span className={clsx(
                'px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wide',
                tab === t.key ? 'bg-white/30 text-white' : 'bg-bee-100 text-bee-700'
              )}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <RevenueChart />
            <MarginChart />
          </div>
          <ClientLedger />
        </>
      )}

      {tab === 'invoices' && <InvoiceTable />}
      {tab === 'payouts'  && <PayoutLedger />}
      {tab === 'growth'   && <GrowthAnalytics />}
    </div>
  )
}
