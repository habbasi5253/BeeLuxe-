'use client'

import { useState } from 'react'
import { clsx } from 'clsx'
import {
  FileText, Plus, CheckCircle2, AlertCircle, Clock,
  X, Printer, ChevronDown, ChevronUp, Loader2,
} from 'lucide-react'
import {
  INVOICE_RECORDS, COMPLETED_JOBS, nextInvoiceNumber,
  fmtCurrency, fmtDate,
  type InvoiceRecord, type CompletedJob,
} from '@/lib/finance'

// ── Status config ─────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { icon: typeof CheckCircle2; label: string; classes: string }> = {
  paid:    { icon: CheckCircle2, label: 'Paid',    classes: 'bg-emerald-100 text-emerald-700' },
  sent:    { icon: Clock,        label: 'Sent',    classes: 'bg-blue-100 text-blue-700' },
  draft:   { icon: FileText,     label: 'Draft',   classes: 'bg-luxe-100 text-luxe-600' },
  overdue: { icon: AlertCircle,  label: 'Overdue', classes: 'bg-red-100 text-red-500' },
}

// ── PDF print via new window ──────────────────────────────────────────────
function printInvoice(invoice: InvoiceRecord, jobs: CompletedJob[]) {
  const lines = jobs.map((j) => `
    <tr>
      <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; font-size:13px; color:#1e293b;">
        ${j.description}
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; font-size:13px; color:#64748b; text-align:center;">
        ${new Date(j.completed_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; font-size:13px; color:#64748b; text-align:center;">
        ${j.hours}h
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; font-size:13px; color:#1e293b; text-align:right; font-weight:600;">
        ${fmtCurrency(j.gross_revenue)}
      </td>
    </tr>
  `).join('')

  const html = `<!DOCTYPE html>
<html><head><title>${invoice.invoice_number} — BeeLuxe Cleaners</title>
<meta charset="utf-8">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#1e293b; background:#fff; padding:48px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:40px; }
  .logo { font-size:22px; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:10px; }
  .logo span { font-size:28px; }
  .company-sub { font-size:13px; color:#64748b; margin-top:2px; }
  .invoice-meta { text-align:right; }
  .invoice-number { font-size:24px; font-weight:800; color:#1e293b; }
  .invoice-badge { display:inline-block; background:#fef3c7; color:#92400e; font-size:11px; font-weight:700; padding:3px 10px; border-radius:6px; margin-top:6px; text-transform:uppercase; letter-spacing:.05em; }
  .bill-section { display:flex; justify-content:space-between; margin-bottom:36px; }
  .bill-block h4 { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:#94a3b8; margin-bottom:6px; }
  .bill-block p { font-size:14px; color:#1e293b; line-height:1.6; }
  table { width:100%; border-collapse:collapse; margin-bottom:24px; }
  thead tr { background:#f8fafc; }
  thead th { padding:10px 12px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:#64748b; text-align:left; border-bottom:2px solid #e2e8f0; }
  thead th:last-child { text-align:right; }
  .totals { display:flex; justify-content:flex-end; margin-bottom:40px; }
  .totals table { width:260px; }
  .totals td { padding:6px 12px; font-size:14px; }
  .totals .total-row td { border-top:2px solid #1e293b; padding-top:10px; font-weight:800; font-size:16px; }
  .notes { font-size:12px; color:#64748b; border-top:1px solid #f1f5f9; padding-top:20px; }
  .footer { margin-top:48px; text-align:center; font-size:11px; color:#94a3b8; }
  @media print { body { padding:32px; } }
</style></head><body>
<div class="header">
  <div>
    <div class="logo"><span>🐝</span> BeeLuxe Cleaners</div>
    <div class="company-sub">Professional Cleaning Services · Houston, TX<br>beeluxecleaners.com · (713) 555-0198</div>
  </div>
  <div class="invoice-meta">
    <div class="invoice-number">${invoice.invoice_number}</div>
    <div class="invoice-badge">Invoice</div>
    <div style="margin-top:12px; font-size:12px; color:#64748b;">
      Issued: ${fmtDate(invoice.issued_date)}<br>
      Due: ${fmtDate(invoice.due_date)}
    </div>
  </div>
</div>

<div class="bill-section">
  <div class="bill-block">
    <h4>Bill To</h4>
    <p><strong>${invoice.client_company}</strong><br>
    Attn: ${invoice.client_contact}<br>
    ${invoice.client_address}<br>
    ${invoice.client_city}</p>
  </div>
  <div class="bill-block" style="text-align:right;">
    <h4>Payment Terms</h4>
    <p>Net 14 days<br>Bank transfer or check<br>Ref: ${invoice.invoice_number}</p>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Description</th>
      <th style="text-align:center;">Date Completed</th>
      <th style="text-align:center;">Hours</th>
      <th style="text-align:right;">Amount</th>
    </tr>
  </thead>
  <tbody>${lines}</tbody>
</table>

<div class="totals">
  <table>
    <tr><td style="color:#64748b;">Subtotal</td><td style="text-align:right;">${fmtCurrency(invoice.subtotal)}</td></tr>
    <tr><td style="color:#64748b;">Tax (0%)</td><td style="text-align:right;">$0.00</td></tr>
    <tr class="total-row"><td>Total Due</td><td style="text-align:right;">${fmtCurrency(invoice.total)}</td></tr>
  </table>
</div>

${invoice.notes ? `<div class="notes"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}

<div class="footer">BeeLuxe Cleaners LLC · EIN: 84-XXXXXXX · Licensed &amp; Insured in Texas</div>
</body></html>`

  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 400)
}

// ── Invoice builder modal ─────────────────────────────────────────────────
interface BuilderProps {
  existingInvoices: InvoiceRecord[]
  onSave: (inv: InvoiceRecord) => void
  onClose: () => void
}

// Group uninvoiced jobs by company
const UNINVOICED = COMPLETED_JOBS.filter((j) => j.invoice_id === null)
const COMPANIES = [...new Set(UNINVOICED.map((j) => j.client_company))]

function InvoiceBuilderModal({ existingInvoices, onSave, onClose }: BuilderProps) {
  const [company, setCompany]     = useState(COMPANIES[0] ?? '')
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [notes, setNotes]         = useState('Net 14 days. Thank you for your business.')
  const [saving, setSaving]       = useState(false)

  const companyJobs = UNINVOICED.filter((j) => j.client_company === company)
  const selectedJobs = companyJobs.filter((j) => selected.has(j.id))
  const subtotal = selectedJobs.reduce((s, j) => s + j.gross_revenue, 0)

  const toggle = (id: string) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const selectAll = () => setSelected(new Set(companyJobs.map((j) => j.id)))
  const clearAll  = () => setSelected(new Set())

  const handleSave = async () => {
    if (selected.size === 0) return
    setSaving(true)
    const today = new Date()
    const due   = new Date(today); due.setDate(today.getDate() + 14)
    const sampleJob = companyJobs[0]
    const inv: InvoiceRecord = {
      id: `inv${Date.now()}`,
      invoice_number: nextInvoiceNumber(existingInvoices),
      client_company: company,
      client_contact: sampleJob?.client_name ?? '',
      client_address: `${sampleJob?.address ?? ''}`,
      client_city: `${sampleJob?.city ?? ''}, TX`,
      issued_date: today.toISOString().slice(0, 10),
      due_date: due.toISOString().slice(0, 10),
      job_ids: [...selected],
      subtotal, tax_rate: 0, tax_amount: 0, total: subtotal,
      status: 'sent', paid_date: null, notes,
    }
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    onSave(inv)
    // Auto-print the new invoice
    printInvoice(inv, selectedJobs)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxe-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-luxe-100 shrink-0">
          <div>
            <p className="font-bold text-luxe-900">Generate Invoice</p>
            <p className="text-xs text-luxe-400 mt-0.5">Select completed jobs to include</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-luxe-100 text-luxe-500">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Client selector */}
          <div>
            <label className="label">Bill To (Client / Firm)</label>
            <select
              className="select"
              value={company}
              onChange={(e) => { setCompany(e.target.value); clearAll() }}
            >
              {COMPANIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Job selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="label !mb-0">Uninvoiced Completed Jobs</label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-bee-600 hover:text-bee-700 font-medium">All</button>
                <span className="text-luxe-200">·</span>
                <button onClick={clearAll} className="text-xs text-luxe-400 hover:text-luxe-600 font-medium">None</button>
              </div>
            </div>

            {companyJobs.length === 0 ? (
              <div className="p-4 text-sm text-luxe-400 bg-luxe-50 rounded-xl text-center">
                No uninvoiced jobs for this client
              </div>
            ) : (
              <div className="space-y-1.5">
                {companyJobs.map((j) => (
                  <label
                    key={j.id}
                    className={clsx(
                      'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors',
                      selected.has(j.id)
                        ? 'bg-bee-50 border-bee-300'
                        : 'bg-luxe-50 border-luxe-100 hover:bg-luxe-100'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(j.id)}
                      onChange={() => toggle(j.id)}
                      className="w-4 h-4 accent-bee-500 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-luxe-900 truncate">{j.description}</p>
                      <p className="text-xs text-luxe-400">
                        {new Date(j.completed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' · '}{j.hours}h · {j.cleaner_name}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-luxe-900 shrink-0">{fmtCurrency(j.gross_revenue)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Invoice Notes</label>
            <textarea
              className="input resize-none" rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Subtotal preview */}
          {selected.size > 0 && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Invoice Total</p>
                <p className="text-xs text-emerald-600">{selected.size} job{selected.size > 1 ? 's' : ''} selected</p>
              </div>
              <p className="text-2xl font-black text-emerald-800">{fmtCurrency(subtotal)}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-luxe-100 shrink-0">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button
            onClick={handleSave}
            disabled={selected.size === 0 || saving}
            className="btn-primary"
          >
            {saving
              ? <><Loader2 size={14} className="animate-spin" />Generating…</>
              : <><Printer size={14} />Generate &amp; Print PDF</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main InvoiceTable ─────────────────────────────────────────────────────
export function InvoiceTable() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INVOICE_RECORDS)
  const [building, setBuilding] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const addInvoice = (inv: InvoiceRecord) => {
    setInvoices((prev) => [inv, ...prev])
    setBuilding(false)
  }

  const handlePrint = (inv: InvoiceRecord) => {
    const jobs = COMPLETED_JOBS.filter((j) => inv.job_ids.includes(j.id))
    printInvoice(inv, jobs)
  }

  const totalPaid     = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const totalOverdue  = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.total, 0)
  const totalPending  = invoices.filter((i) => i.status === 'sent').reduce((s, i) => s + i.total, 0)

  return (
    <div className="space-y-4">
      {/* KPI mini strip */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Collected', value: totalPaid,    color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Pending',   value: totalPending, color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Overdue',   value: totalOverdue, color: 'text-red-700 bg-red-50 border-red-200' },
        ].map((k) => (
          <div key={k.label} className={clsx('rounded-xl border p-4', k.color)}>
            <p className="text-xl font-bold">{fmtCurrency(k.value)}</p>
            <p className="text-xs font-semibold mt-0.5 opacity-70">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Invoice table */}
      <div className="card !p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-luxe-100">
          <div>
            <p className="font-semibold text-luxe-800">Invoice Ledger</p>
            <p className="text-xs text-luxe-400 mt-0.5">{invoices.length} invoices · Click row to expand</p>
          </div>
          <button onClick={() => setBuilding(true)} className="btn-primary">
            <Plus size={14} />Generate Invoice
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
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const s   = STATUS_CFG[inv.status]
              const exp = expanded === inv.id
              const invJobs = COMPLETED_JOBS.filter((j) => inv.job_ids.includes(j.id))
              return [
                <tr
                  key={inv.id}
                  className={clsx('table-row cursor-pointer', exp && 'bg-luxe-50')}
                  onClick={() => setExpanded(exp ? null : inv.id)}
                >
                  <td className="px-5 py-3.5 font-mono text-xs font-bold text-luxe-700">{inv.invoice_number}</td>
                  <td className="px-4 py-3.5 font-medium text-luxe-900">{inv.client_company}</td>
                  <td className="px-4 py-3.5 text-xs text-luxe-500">
                    {new Date(inv.issued_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-luxe-500">
                    {new Date(inv.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-luxe-900">{fmtCurrency(inv.total)}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={clsx('badge', s.classes)}>
                      <s.icon size={11} />{s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-luxe-400">
                    {exp ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </td>
                </tr>,
                exp && (
                  <tr key={`${inv.id}-exp`} className="bg-luxe-50 border-b border-luxe-100">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-luxe-400 uppercase tracking-widest mb-3">Line Items</p>
                        {invJobs.length === 0 ? (
                          <p className="text-xs text-luxe-400 italic">No job details on file</p>
                        ) : invJobs.map((j) => (
                          <div key={j.id} className="flex items-center justify-between text-sm py-1.5 border-b border-luxe-100 last:border-0">
                            <div>
                              <p className="font-medium text-luxe-800">{j.description}</p>
                              <p className="text-xs text-luxe-400">
                                {new Date(j.completed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                {' · '}{j.hours}h · {j.cleaner_name}
                              </p>
                            </div>
                            <p className="font-bold text-luxe-900">{fmtCurrency(j.gross_revenue)}</p>
                          </div>
                        ))}
                        <div className="flex justify-end gap-3 mt-3 pt-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePrint(inv) }}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            <Printer size={12} />Print / Download PDF
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ),
              ]
            })}
          </tbody>
        </table>
      </div>

      {building && (
        <InvoiceBuilderModal
          existingInvoices={invoices}
          onSave={addInvoice}
          onClose={() => setBuilding(false)}
        />
      )}
    </div>
  )
}
