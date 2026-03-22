'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import { FileText, Plus, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

const invoices = [
  { id: 'BL-0048', client: 'Apex Construction LLC', issued: '2024-01-15', due: '2024-01-30', amount: 4200, status: 'paid', paid: '2024-01-22' },
  { id: 'BL-0047', client: 'Metro Commercial Props', issued: '2024-01-10', due: '2024-01-25', amount: 1960, status: 'overdue', paid: null },
  { id: 'BL-0046', client: 'Greenfield Homes', issued: '2024-01-08', due: '2024-01-23', amount: 840, status: 'overdue', paid: null },
  { id: 'BL-0045', client: 'Ridgeline Homes Dev', issued: '2024-01-05', due: '2024-01-20', amount: 2400, status: 'paid', paid: '2024-01-18' },
  { id: 'BL-0044', client: 'Skyline Properties', issued: '2024-01-03', due: '2024-01-18', amount: 1900, status: 'overdue', paid: null },
  { id: 'BL-0043', client: 'Various Residential', issued: '2024-01-01', due: '2024-01-16', amount: 520, status: 'paid', paid: '2024-01-14' },
  { id: 'BL-0042', client: 'Apex Construction LLC', issued: '2023-12-28', due: '2024-01-12', amount: 3600, status: 'paid', paid: '2024-01-10' },
  { id: 'BL-0041', client: 'Metro Commercial Props', issued: '2023-12-20', due: '2024-01-04', amount: 980, status: 'paid', paid: '2024-01-03' },
]

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; classes: string }> = {
  paid:    { icon: CheckCircle2, label: 'Paid',    classes: 'bg-emerald-100 text-emerald-700' },
  sent:    { icon: Clock,        label: 'Sent',    classes: 'bg-blue-100 text-blue-700' },
  draft:   { icon: FileText,     label: 'Draft',   classes: 'bg-luxe-100 text-luxe-600' },
  overdue: { icon: AlertCircle,  label: 'Overdue', classes: 'bg-red-100 text-red-500' },
}

export function InvoiceTable() {
  const [creating, setCreating] = useState(false)

  return (
    <div className="card !p-0 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-luxe-100">
        <div>
          <p className="font-semibold text-luxe-800">Invoice Ledger</p>
          <p className="text-xs text-luxe-400 mt-0.5">Track all client invoices and payment status</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          disabled={creating}
          className="btn-primary"
        >
          {creating ? <><Loader2 size={14} className="animate-spin" />Creating…</> : <><Plus size={14} />New Invoice</>}
        </button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="table-header">
            <th className="text-left px-5 py-3">Invoice #</th>
            <th className="text-left px-4 py-3">Client</th>
            <th className="text-left px-4 py-3">Issued</th>
            <th className="text-left px-4 py-3">Due</th>
            <th className="text-right px-4 py-3">Amount</th>
            <th className="text-center px-4 py-3">Status</th>
            <th className="text-left px-4 py-3">Paid</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const s = statusConfig[inv.status]
            return (
              <tr key={inv.id} className="table-row">
                <td className="px-5 py-3.5 font-mono text-xs font-bold text-luxe-700">{inv.id}</td>
                <td className="px-4 py-3.5 font-medium text-luxe-900">{inv.client}</td>
                <td className="px-4 py-3.5 text-xs text-luxe-500">{new Date(inv.issued).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                <td className="px-4 py-3.5 text-xs text-luxe-500">{new Date(inv.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                <td className="px-4 py-3.5 text-right font-semibold text-luxe-900">${inv.amount.toLocaleString()}</td>
                <td className="px-4 py-3.5 text-center">
                  <span className={clsx('badge', s.classes)}>
                    <s.icon size={11} />{s.label}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-luxe-400">
                  {inv.paid ? new Date(inv.paid).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
