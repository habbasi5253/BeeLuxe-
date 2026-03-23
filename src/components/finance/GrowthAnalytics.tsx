'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts'
import { TrendingUp, Award, Target, Zap } from 'lucide-react'
import { clsx } from 'clsx'
import { LEAD_SOURCE_METRICS, MONTHLY_BY_SOURCE, fmtCurrency } from '@/lib/finance'

const SOURCE_COLORS: Record<string, string> = {
  site_visit:  '#f97316',
  linkedin:    '#0077b5',
  cold_email:  '#8b5cf6',
  google:      '#4285f4',
  referral:    '#10b981',
  direct:      '#94a3b8',
}

// Custom tooltip for lead source chart
function RevenueTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-luxe-100 rounded-xl shadow-lg p-3 min-w-[180px]">
      <p className="text-xs font-bold text-luxe-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-xs text-luxe-600 capitalize">{p.name.replace('_', ' ')}</span>
          </div>
          <span className="text-xs font-bold text-luxe-900">${p.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

type SortKey = 'total_revenue' | 'avg_contract_value' | 'avg_margin_pct' | 'total_jobs'

export function GrowthAnalytics() {
  const [sortBy, setSortBy] = useState<SortKey>('total_revenue')

  const sorted = [...LEAD_SOURCE_METRICS].sort((a, b) => b[sortBy] - a[sortBy])
  const maxRevenue = Math.max(...LEAD_SOURCE_METRICS.map((m) => m.total_revenue))

  const conversionData = LEAD_SOURCE_METRICS.map((m) => ({
    label: m.label,
    source: m.source,
    rate: Math.round((m.converted / m.total_leads) * 100),
  })).sort((a, b) => b.rate - a.rate)

  // Top performer by revenue
  const topByRevenue = sorted[0]
  // Top by margin
  const topByMargin  = [...LEAD_SOURCE_METRICS].sort((a, b) => b.avg_margin_pct - a.avg_margin_pct)[0]
  // Best conversion
  const topByConv    = [...LEAD_SOURCE_METRICS].sort((a, b) => (b.converted / b.total_leads) - (a.converted / a.total_leads))[0]
  // Best avg deal size
  const topByDeal    = [...LEAD_SOURCE_METRICS].sort((a, b) => b.avg_contract_value - a.avg_contract_value)[0]

  const SORT_OPTS: Array<{ key: SortKey; label: string }> = [
    { key: 'total_revenue',      label: 'Revenue' },
    { key: 'avg_contract_value', label: 'Avg Deal' },
    { key: 'avg_margin_pct',     label: 'Margin %' },
    { key: 'total_jobs',         label: 'Jobs' },
  ]

  return (
    <div className="space-y-6">

      {/* Top performers callout strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Top Revenue Source',   icon: TrendingUp, value: topByRevenue.label,  sub: fmtCurrency(topByRevenue.total_revenue),              color: 'bg-orange-50 border-orange-200 text-orange-700' },
          { label: 'Highest Margin',        icon: Target,     value: topByMargin.label,   sub: `${topByMargin.avg_margin_pct}% gross margin`,         color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { label: 'Best Conversion Rate',  icon: Zap,        value: topByConv.label,     sub: `${Math.round((topByConv.converted / topByConv.total_leads) * 100)}% close rate`, color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Largest Avg Deal',      icon: Award,      value: topByDeal.label,     sub: `${fmtCurrency(topByDeal.avg_contract_value)} avg`,    color: 'bg-violet-50 border-violet-200 text-violet-700' },
        ].map((card) => (
          <div key={card.label} className={clsx('rounded-xl border p-4 flex flex-col gap-2', card.color)}>
            <div className="flex items-center gap-2">
              <card.icon size={14} />
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{card.label}</p>
            </div>
            <p className="text-base font-bold">{card.value}</p>
            <p className="text-xs opacity-70">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue trend by source */}
      <div className="card">
        <p className="font-semibold text-luxe-800 mb-1">Revenue by Lead Source — Monthly</p>
        <p className="text-xs text-luxe-400 mb-4">6-month trailing revenue attribution per acquisition channel</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={MONTHLY_BY_SOURCE} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip content={<RevenueTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value) => value.replace('_', ' ')}
            />
            <Bar dataKey="site_visit"  name="Site Visit"  fill={SOURCE_COLORS.site_visit}  radius={[3, 3, 0, 0]} stackId="a" />
            <Bar dataKey="linkedin"    name="LinkedIn"    fill={SOURCE_COLORS.linkedin}    radius={[3, 3, 0, 0]} stackId="a" />
            <Bar dataKey="cold_email"  name="Cold Email"  fill={SOURCE_COLORS.cold_email}  radius={[3, 3, 0, 0]} stackId="a" />
            <Bar dataKey="google"      name="Google"      fill={SOURCE_COLORS.google}      radius={[3, 3, 0, 0]} stackId="a" />
            <Bar dataKey="referral"    name="Referral"    fill={SOURCE_COLORS.referral}    radius={[3, 3, 0, 0]} stackId="a" />
            <Bar dataKey="direct"      name="Direct"      fill={SOURCE_COLORS.direct}      radius={[3, 3, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Source breakdown table */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Ranked table */}
        <div className="xl:col-span-3 card !p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-luxe-100">
            <div>
              <p className="font-semibold text-luxe-800">Lead Source ROI Breakdown</p>
              <p className="text-xs text-luxe-400 mt-0.5">Construction trailer contracts — all time</p>
            </div>
            <div className="flex gap-1 bg-luxe-50 border border-luxe-100 rounded-lg p-0.5">
              {SORT_OPTS.map((o) => (
                <button
                  key={o.key}
                  onClick={() => setSortBy(o.key)}
                  className={clsx(
                    'px-2 py-1 rounded text-[11px] font-medium transition-colors',
                    sortBy === o.key ? 'bg-white text-luxe-800 shadow-sm' : 'text-luxe-400 hover:text-luxe-600'
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-luxe-50">
            {sorted.map((m, i) => {
              const convPct = Math.round((m.converted / m.total_leads) * 100)
              const revPct  = Math.round((m.total_revenue / maxRevenue) * 100)
              return (
                <div key={m.source} className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-luxe-300 w-5">#{i + 1}</span>
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: SOURCE_COLORS[m.source] }}
                    />
                    <p className="font-semibold text-luxe-900 flex-1">{m.label}</p>
                    <span className="text-xs text-luxe-400">{m.total_leads} leads → {m.converted} clients</span>
                  </div>

                  {/* Revenue bar */}
                  <div className="flex items-center gap-3 ml-8">
                    <div className="flex-1 h-1.5 rounded-full bg-luxe-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${revPct}%`, background: SOURCE_COLORS[m.source] }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-xs text-right shrink-0">
                      <div>
                        <p className="font-bold text-luxe-900">{fmtCurrency(m.total_revenue)}</p>
                        <p className="text-luxe-400">revenue</p>
                      </div>
                      <div>
                        <p className="font-bold text-luxe-900">{fmtCurrency(m.avg_contract_value)}</p>
                        <p className="text-luxe-400">avg deal</p>
                      </div>
                      <div>
                        <p className={clsx('font-bold', m.avg_margin_pct >= 63 ? 'text-emerald-600' : 'text-bee-600')}>
                          {m.avg_margin_pct}%
                        </p>
                        <p className="text-luxe-400">margin</p>
                      </div>
                      <div>
                        <p className={clsx('font-bold', convPct >= 60 ? 'text-emerald-600' : convPct >= 40 ? 'text-bee-600' : 'text-red-500')}>
                          {convPct}%
                        </p>
                        <p className="text-luxe-400">close</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Conversion rate chart */}
        <div className="xl:col-span-2 card flex flex-col">
          <p className="font-semibold text-luxe-800 mb-1">Conversion Rate by Source</p>
          <p className="text-xs text-luxe-400 mb-4">Leads → Paying clients %</p>
          <div className="flex-1 space-y-3">
            {conversionData.map((d) => (
              <div key={d.source}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: SOURCE_COLORS[d.source] }} />
                    <span className="text-xs font-medium text-luxe-700">{d.label}</span>
                  </div>
                  <span className={clsx(
                    'text-xs font-bold',
                    d.rate >= 70 ? 'text-emerald-600' :
                    d.rate >= 40 ? 'text-bee-600' : 'text-red-500'
                  )}>
                    {d.rate}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-luxe-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${d.rate}%`, background: SOURCE_COLORS[d.source] }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Insight callout */}
          <div className="mt-5 p-3 rounded-xl bg-orange-50 border border-orange-200">
            <p className="text-xs font-bold text-orange-800 mb-1">🔥 Highest ROI Channel</p>
            <p className="text-xs text-orange-700 leading-relaxed">
              <strong>Site Visits</strong> generate the most construction trailer revenue with the highest margin (65%) —
              prioritize in-person prospecting at active job sites in the Houston metro.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
