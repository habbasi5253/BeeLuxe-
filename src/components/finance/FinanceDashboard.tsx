'use client'

import { useState } from 'react'
import { FinanceKPIs } from './FinanceKPIs'
import { RevenueChart } from './RevenueChart'
import { MarginChart } from './MarginChart'
import { ClientLedger } from './ClientLedger'
import { PayoutLedger } from './PayoutLedger'
import { InvoiceTable } from './InvoiceTable'
import { clsx } from 'clsx'

type Tab = 'overview' | 'invoices' | 'payouts'

export function FinanceDashboard() {
  const [tab, setTab] = useState<Tab>('overview')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview & Margins' },
    { key: 'invoices', label: 'Invoices & Revenue' },
    { key: 'payouts', label: 'Contractor Payouts' },
  ]

  return (
    <div className="space-y-6">
      <FinanceKPIs />

      <div className="flex gap-1 bg-white border border-luxe-100 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === t.key ? 'bg-bee-500 text-white' : 'text-luxe-600 hover:bg-luxe-50'
            )}
          >
            {t.label}
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
      {tab === 'payouts' && <PayoutLedger />}
    </div>
  )
}
